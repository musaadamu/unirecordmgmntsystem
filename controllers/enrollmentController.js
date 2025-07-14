const { Enrollment, Student, Course, Grade } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all enrollments with filtering and pagination
 */
const getAllEnrollments = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    studentId,
    courseId,
    semester,
    academicYear,
    status,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (studentId) filter.student = studentId;
  if (courseId) filter.course = courseId;
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter['enrollmentInfo.status'] = status;

  // For students, only show their own enrollments
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      filter.student = student._id;
    } else {
      return res.json({
        success: true,
        data: { enrollments: [], pagination: { currentPage: 1, totalPages: 0, totalEnrollments: 0 } }
      });
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query with population
  const enrollments = await Enrollment.find(filter)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('course', 'courseCode courseName academicInfo.credits academicInfo.department')
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Enrollment.countDocuments(filter);

  logger.audit('Enrollments retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      enrollments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEnrollments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get enrollment by ID
 */
const getEnrollmentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findById(id)
    .populate('student', 'studentId user academicInfo')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('course', 'courseCode courseName academicInfo')
    .populate('registrationInfo.registeredBy', 'personalInfo.firstName personalInfo.lastName email');

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || enrollment.student._id.toString() !== student._id.toString()) {
      throw new AppError('You can only access your own enrollment records', 403);
    }
  }

  logger.audit('Enrollment retrieved', req.user._id, {
    enrollmentId: id,
    studentId: enrollment.student._id,
    courseId: enrollment.course._id
  });

  res.json({
    success: true,
    data: { enrollment }
  });
});

/**
 * Create new enrollment (course registration)
 */
const createEnrollment = catchAsync(async (req, res) => {
  const {
    studentId,
    courseId,
    semester,
    academicYear,
    section,
    enrollmentType = 'regular'
  } = req.body;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // For student users, ensure they can only enroll themselves
  if (req.user.role === USER_ROLES.STUDENT) {
    const userStudent = await Student.findOne({ user: req.user._id });
    if (!userStudent || userStudent._id.toString() !== studentId) {
      throw new AppError('You can only enroll yourself in courses', 403);
    }
  }

  // Verify course exists and get offering details
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Find the specific course offering
  const offering = course.offerings.find(off => 
    off.semester === semester && 
    off.academicYear === academicYear && 
    off.section === section &&
    off.isActive
  );

  if (!offering) {
    throw new AppError('Course offering not found for the specified semester, year, and section', 404);
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear
  });

  if (existingEnrollment) {
    throw new AppError('Student is already enrolled in this course for the specified semester', 400);
  }

  // Check course capacity
  const currentEnrollments = await Enrollment.countDocuments({
    course: courseId,
    semester,
    academicYear,
    section,
    'enrollmentInfo.status': 'enrolled'
  });

  if (currentEnrollments >= offering.capacity) {
    // Add to waitlist if enrollment type allows
    if (enrollmentType !== 'waitlist') {
      throw new AppError('Course is at full capacity. Consider joining the waitlist.', 400);
    }
  }

  // Check prerequisites
  const prerequisiteCheck = await checkPrerequisites(studentId, course.academicInfo.prerequisites);
  if (!prerequisiteCheck.met && !prerequisiteCheck.waived) {
    throw new AppError(`Prerequisites not met: ${prerequisiteCheck.missing.join(', ')}`, 400);
  }

  // Calculate tuition and fees
  const tuitionAmount = calculateTuition(course, student);
  const feesAmount = calculateFees(course);
  const totalAmount = tuitionAmount + feesAmount;

  // Create enrollment
  const enrollment = new Enrollment({
    student: studentId,
    course: courseId,
    semester,
    academicYear,
    section,
    enrollmentInfo: {
      enrollmentType,
      status: currentEnrollments >= offering.capacity ? 'waitlist' : 'enrolled'
    },
    registrationInfo: {
      registeredBy: req.user._id,
      registrationMethod: req.user.role === USER_ROLES.STUDENT ? 'online' : 'admin'
    },
    prerequisitesInfo: {
      prerequisitesMet: prerequisiteCheck.met,
      missingPrerequisites: prerequisiteCheck.missing.map(courseId => ({ course: courseId }))
    },
    paymentInfo: {
      tuitionAmount,
      feesAmount,
      totalAmount,
      paymentStatus: 'pending'
    },
    createdBy: req.user._id
  });

  // If waitlisted, set position
  if (enrollment.enrollmentInfo.status === 'waitlist') {
    const waitlistCount = await Enrollment.countDocuments({
      course: courseId,
      semester,
      academicYear,
      section,
      'enrollmentInfo.status': 'waitlist'
    });
    enrollment.registrationInfo.waitlistPosition = waitlistCount + 1;
  }

  await enrollment.save();

  // Update course offering enrollment count
  await updateCourseEnrollmentCount(courseId, semester, academicYear, section);

  logger.audit('Enrollment created', req.user._id, {
    enrollmentId: enrollment._id,
    studentId,
    courseId,
    status: enrollment.enrollmentInfo.status
  });

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate('student', 'studentId user')
    .populate('course', 'courseCode courseName academicInfo.credits');

  res.status(201).json({
    success: true,
    message: `Successfully ${enrollment.enrollmentInfo.status === 'waitlist' ? 'added to waitlist' : 'enrolled'} in course`,
    data: { enrollment: populatedEnrollment }
  });
});

/**
 * Update enrollment status
 */
const updateEnrollmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  // Check permissions for status changes
  if (req.user.role === USER_ROLES.STUDENT) {
    // Students can only drop their own courses
    const student = await Student.findOne({ user: req.user._id });
    if (!student || enrollment.student.toString() !== student._id.toString()) {
      throw new AppError('You can only modify your own enrollments', 403);
    }
    
    if (status !== 'dropped') {
      throw new AppError('Students can only drop courses', 403);
    }
  }

  const oldStatus = enrollment.enrollmentInfo.status;
  
  // Update enrollment status
  enrollment.enrollmentInfo.status = status;
  enrollment.updatedBy = req.user._id;

  // Set appropriate dates based on status
  if (status === 'dropped') {
    enrollment.enrollmentInfo.dropDate = new Date();
    // Calculate refund if applicable
    const refundAmount = enrollment.calculateRefund();
    if (refundAmount > 0) {
      enrollment.paymentInfo.refundAmount = refundAmount;
    }
  } else if (status === 'withdrawn') {
    enrollment.enrollmentInfo.withdrawalDate = new Date();
  } else if (status === 'completed') {
    enrollment.enrollmentInfo.completionDate = new Date();
  }

  await enrollment.save();

  // Update course enrollment count
  await updateCourseEnrollmentCount(
    enrollment.course, 
    enrollment.semester, 
    enrollment.academicYear, 
    enrollment.section
  );

  // If student dropped/withdrew, check waitlist
  if (['dropped', 'withdrawn'].includes(status) && oldStatus === 'enrolled') {
    await processWaitlist(enrollment.course, enrollment.semester, enrollment.academicYear, enrollment.section);
  }

  logger.audit('Enrollment status updated', req.user._id, {
    enrollmentId: id,
    oldStatus,
    newStatus: status,
    reason
  });

  const updatedEnrollment = await Enrollment.findById(id)
    .populate('student', 'studentId user')
    .populate('course', 'courseCode courseName');

  res.json({
    success: true,
    message: `Enrollment status updated to ${status}`,
    data: { enrollment: updatedEnrollment }
  });
});

/**
 * Get student's current enrollments
 */
const getStudentCurrentEnrollments = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { semester, academicYear } = req.query;

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      throw new AppError('You can only access your own enrollment records', 403);
    }
  }

  const filter = { 
    student: studentId,
    'enrollmentInfo.status': { $in: ['enrolled', 'waitlist'] }
  };
  
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  const enrollments = await Enrollment.find(filter)
    .populate('course', 'courseCode courseName academicInfo.credits academicInfo.department')
    .sort({ semester: -1, academicYear: -1 });

  // Calculate total credits
  const totalCredits = enrollments
    .filter(e => e.enrollmentInfo.status === 'enrolled')
    .reduce((sum, e) => sum + (e.course.academicInfo.credits || 0), 0);

  logger.audit('Student current enrollments retrieved', req.user._id, {
    studentId,
    semester,
    academicYear
  });

  res.json({
    success: true,
    data: {
      enrollments,
      summary: {
        totalEnrollments: enrollments.length,
        enrolledCourses: enrollments.filter(e => e.enrollmentInfo.status === 'enrolled').length,
        waitlistedCourses: enrollments.filter(e => e.enrollmentInfo.status === 'waitlist').length,
        totalCredits
      }
    }
  });
});

/**
 * Get enrollment statistics
 */
const getEnrollmentStats = catchAsync(async (req, res) => {
  const { semester, academicYear } = req.query;

  const matchStage = {};
  if (semester) matchStage.semester = semester;
  if (academicYear) matchStage.academicYear = academicYear;

  const stats = await Enrollment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$enrollmentInfo.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$paymentInfo.totalAmount' },
        paidAmount: { $sum: '$paymentInfo.paidAmount' }
      }
    }
  ]);

  const courseStats = await Enrollment.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    { $unwind: '$courseInfo' },
    {
      $group: {
        _id: '$courseInfo.academicInfo.department',
        enrollments: { $sum: 1 },
        courses: { $addToSet: '$course' }
      }
    },
    {
      $project: {
        _id: 1,
        enrollments: 1,
        uniqueCourses: { $size: '$courses' }
      }
    }
  ]);

  logger.audit('Enrollment statistics retrieved', req.user._id, {
    semester,
    academicYear
  });

  res.json({
    success: true,
    data: {
      statusStats: stats,
      departmentStats: courseStats,
      period: { semester, academicYear }
    }
  });
});

/**
 * Helper function to check prerequisites
 */
const checkPrerequisites = async (studentId, prerequisites) => {
  if (!prerequisites || prerequisites.length === 0) {
    return { met: true, missing: [], waived: false };
  }

  const completedCourses = await Grade.find({
    student: studentId,
    'gradeInfo.status': 'completed',
    'gradeInfo.finalGrade.letterGrade': { $nin: ['F', 'I', 'W'] }
  }).select('course');

  const completedCourseIds = completedCourses.map(grade => grade.course.toString());
  const missingPrerequisites = prerequisites.filter(prereq => 
    !completedCourseIds.includes(prereq.toString())
  );

  return {
    met: missingPrerequisites.length === 0,
    missing: missingPrerequisites,
    waived: false // This would be checked against waiver records
  };
};

/**
 * Helper function to calculate tuition
 */
const calculateTuition = (course, student) => {
  // Base tuition calculation - this would be more complex in reality
  const baseTuitionPerCredit = 500; // $500 per credit hour
  return course.academicInfo.credits * baseTuitionPerCredit;
};

/**
 * Helper function to calculate fees
 */
const calculateFees = (course) => {
  // Standard fees calculation
  const labFee = course.courseCode.includes('LAB') ? 100 : 0;
  const technologyFee = 50;
  return labFee + technologyFee;
};

/**
 * Helper function to update course enrollment count
 */
const updateCourseEnrollmentCount = async (courseId, semester, academicYear, section) => {
  const enrollmentCount = await Enrollment.countDocuments({
    course: courseId,
    semester,
    academicYear,
    section,
    'enrollmentInfo.status': 'enrolled'
  });

  await Course.updateOne(
    { 
      _id: courseId,
      'offerings.semester': semester,
      'offerings.academicYear': academicYear,
      'offerings.section': section
    },
    {
      $set: {
        'offerings.$.enrolledStudents': enrollmentCount
      }
    }
  );
};

/**
 * Helper function to process waitlist
 */
const processWaitlist = async (courseId, semester, academicYear, section) => {
  // Find next student on waitlist
  const nextWaitlisted = await Enrollment.findOne({
    course: courseId,
    semester,
    academicYear,
    section,
    'enrollmentInfo.status': 'waitlist'
  }).sort({ 'registrationInfo.waitlistPosition': 1 });

  if (nextWaitlisted) {
    // Check if there's now space
    const course = await Course.findById(courseId);
    const offering = course.offerings.find(off => 
      off.semester === semester && 
      off.academicYear === academicYear && 
      off.section === section
    );

    const currentEnrollments = await Enrollment.countDocuments({
      course: courseId,
      semester,
      academicYear,
      section,
      'enrollmentInfo.status': 'enrolled'
    });

    if (currentEnrollments < offering.capacity) {
      nextWaitlisted.enrollmentInfo.status = 'enrolled';
      nextWaitlisted.registrationInfo.waitlistPosition = undefined;
      await nextWaitlisted.save();

      // Send notification to student (would implement email/SMS here)
      logger.audit('Student moved from waitlist to enrolled', null, {
        enrollmentId: nextWaitlisted._id,
        studentId: nextWaitlisted.student,
        courseId
      });
    }
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollmentStatus,
  getStudentCurrentEnrollments,
  getEnrollmentStats
};
