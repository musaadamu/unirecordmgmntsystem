const { Grade, Student, Course, Enrollment } = require('../models');
const { USER_ROLES, GRADE_TYPES } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all grades with filtering and pagination
 */
const getAllGrades = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    studentId,
    courseId,
    instructorId,
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
  if (instructorId) filter.instructor = instructorId;
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter['gradeInfo.status'] = status;

  // For students, only show their own grades
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      filter.student = student._id;
    } else {
      return res.json({
        success: true,
        data: { grades: [], pagination: { currentPage: 1, totalPages: 0, totalGrades: 0 } }
      });
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query with population
  const grades = await Grade.find(filter)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('course', 'courseCode courseName academicInfo.credits')
    .populate('instructor', 'employeeId user')
    .populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Grade.countDocuments(filter);

  logger.audit('Grades retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      grades,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGrades: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get grade by ID
 */
const getGradeById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const grade = await Grade.findById(id)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('course', 'courseCode courseName academicInfo.credits')
    .populate('instructor', 'employeeId user')
    .populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    });

  if (!grade) {
    throw new AppError('Grade not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || grade.student._id.toString() !== student._id.toString()) {
      throw new AppError('You can only access your own grades', 403);
    }
  }

  logger.audit('Grade retrieved', req.user._id, {
    gradeId: id,
    studentId: grade.student._id,
    courseId: grade.course._id
  });

  res.json({
    success: true,
    data: { grade }
  });
});

/**
 * Create or update grade
 */
const createOrUpdateGrade = catchAsync(async (req, res) => {
  const {
    studentId,
    courseId,
    semester,
    academicYear,
    gradeInfo
  } = req.body;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if enrollment exists
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear
  });

  if (!enrollment) {
    throw new AppError('Student is not enrolled in this course for the specified semester', 400);
  }

  // Check if grade already exists
  let grade = await Grade.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear
  });

  if (grade) {
    // Update existing grade
    grade.gradeInfo = { ...grade.gradeInfo, ...gradeInfo };
    grade.instructor = req.user.role === USER_ROLES.ACADEMIC_STAFF ? 
      await getStaffByUserId(req.user._id) : grade.instructor;
    grade.updatedBy = req.user._id;
  } else {
    // Create new grade
    const instructor = req.user.role === USER_ROLES.ACADEMIC_STAFF ? 
      await getStaffByUserId(req.user._id) : null;

    grade = new Grade({
      student: studentId,
      course: courseId,
      instructor: instructor?._id,
      semester,
      academicYear,
      gradeInfo,
      createdBy: req.user._id
    });
  }

  // Calculate final grade if assessments are provided
  if (gradeInfo.assessments && gradeInfo.assessments.length > 0) {
    const finalGrade = calculateFinalGrade(gradeInfo.assessments);
    grade.gradeInfo.finalGrade = {
      ...grade.gradeInfo.finalGrade,
      numericGrade: finalGrade.numeric,
      letterGrade: finalGrade.letter,
      gradePoints: finalGrade.points,
      credits: course.academicInfo.credits
    };
  }

  await grade.save();

  // Update student GPA if grade is complete
  if (grade.gradeInfo.finalGrade.isComplete) {
    await updateStudentGPA(studentId);
  }

  logger.audit('Grade created/updated', req.user._id, {
    gradeId: grade._id,
    studentId,
    courseId,
    action: grade.isNew ? 'created' : 'updated'
  });

  const populatedGrade = await Grade.findById(grade._id)
    .populate('student', 'studentId user')
    .populate('course', 'courseCode courseName')
    .populate('instructor', 'employeeId user');

  res.status(grade.isNew ? 201 : 200).json({
    success: true,
    message: `Grade ${grade.isNew ? 'created' : 'updated'} successfully`,
    data: { grade: populatedGrade }
  });
});

/**
 * Submit grade appeal
 */
const submitGradeAppeal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;

  const grade = await Grade.findById(id);
  if (!grade) {
    throw new AppError('Grade not found', 404);
  }

  // Check if student owns this grade
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || grade.student.toString() !== student._id.toString()) {
      throw new AppError('You can only appeal your own grades', 403);
    }
  }

  // Check if grade is finalized
  if (!grade.gradeInfo.finalGrade.isComplete) {
    throw new AppError('Cannot appeal a grade that is not finalized', 400);
  }

  // Check if there's already a pending appeal
  const pendingAppeal = grade.appeals.find(appeal => 
    ['pending', 'under_review'].includes(appeal.status)
  );

  if (pendingAppeal) {
    throw new AppError('There is already a pending appeal for this grade', 400);
  }

  // Add appeal
  grade.appeals.push({
    reason,
    description,
    submittedDate: new Date(),
    status: 'pending'
  });

  await grade.save();

  logger.audit('Grade appeal submitted', req.user._id, {
    gradeId: id,
    reason
  });

  res.status(201).json({
    success: true,
    message: 'Grade appeal submitted successfully',
    data: {
      appealId: grade.appeals[grade.appeals.length - 1]._id,
      status: 'pending'
    }
  });
});

/**
 * Process grade appeal (for instructors/admins)
 */
const processGradeAppeal = catchAsync(async (req, res) => {
  const { id, appealId } = req.params;
  const { decision, finalGrade, comments } = req.body;

  const grade = await Grade.findById(id);
  if (!grade) {
    throw new AppError('Grade not found', 404);
  }

  const appeal = grade.appeals.id(appealId);
  if (!appeal) {
    throw new AppError('Appeal not found', 404);
  }

  if (appeal.status !== 'pending' && appeal.status !== 'under_review') {
    throw new AppError('This appeal has already been processed', 400);
  }

  // Update appeal
  appeal.status = decision;
  appeal.reviewedBy = req.user._id;
  appeal.reviewDate = new Date();
  appeal.decision = comments;

  // If approved, update the grade
  if (decision === 'approved' && finalGrade) {
    const newGrade = calculateGradeFromNumeric(finalGrade.numeric);
    
    // Store original grade in modifications
    grade.modifications.push({
      originalGrade: {
        numeric: grade.gradeInfo.finalGrade.numericGrade,
        letter: grade.gradeInfo.finalGrade.letterGrade,
        points: grade.gradeInfo.finalGrade.gradePoints
      },
      newGrade: {
        numeric: finalGrade.numeric,
        letter: newGrade.letter,
        points: newGrade.points
      },
      reason: 'Grade appeal approved',
      modifiedBy: req.user._id,
      approvedBy: req.user._id,
      approvalDate: new Date()
    });

    // Update final grade
    grade.gradeInfo.finalGrade.numericGrade = finalGrade.numeric;
    grade.gradeInfo.finalGrade.letterGrade = newGrade.letter;
    grade.gradeInfo.finalGrade.gradePoints = newGrade.points;
    
    appeal.finalGrade = finalGrade;
  }

  grade.updatedBy = req.user._id;
  await grade.save();

  // Update student GPA if grade was changed
  if (decision === 'approved' && finalGrade) {
    await updateStudentGPA(grade.student);
  }

  logger.audit('Grade appeal processed', req.user._id, {
    gradeId: id,
    appealId,
    decision,
    gradeChanged: decision === 'approved' && finalGrade
  });

  res.json({
    success: true,
    message: `Grade appeal ${decision} successfully`,
    data: { appeal }
  });
});

/**
 * Get student grades summary
 */
const getStudentGradesSummary = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      throw new AppError('You can only access your own grade summary', 403);
    }
  }

  const filter = { student: studentId };
  if (academicYear) filter.academicYear = academicYear;

  const grades = await Grade.find(filter)
    .populate('course', 'courseCode courseName academicInfo.credits')
    .sort({ academicYear: -1, semester: -1 });

  // Calculate statistics
  const completedGrades = grades.filter(grade => 
    grade.gradeInfo.status === 'completed' && 
    grade.gradeInfo.finalGrade.isComplete
  );

  let totalQualityPoints = 0;
  let totalCredits = 0;
  const semesterGPAs = {};

  completedGrades.forEach(grade => {
    const credits = grade.gradeInfo.finalGrade.credits || 0;
    const points = grade.gradeInfo.finalGrade.gradePoints || 0;
    
    totalQualityPoints += points * credits;
    totalCredits += credits;

    // Calculate semester GPA
    const semesterKey = `${grade.academicYear}-${grade.semester}`;
    if (!semesterGPAs[semesterKey]) {
      semesterGPAs[semesterKey] = { points: 0, credits: 0, courses: 0 };
    }
    semesterGPAs[semesterKey].points += points * credits;
    semesterGPAs[semesterKey].credits += credits;
    semesterGPAs[semesterKey].courses += 1;
  });

  const cumulativeGPA = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;

  // Calculate semester GPAs
  Object.keys(semesterGPAs).forEach(key => {
    const semester = semesterGPAs[key];
    semester.gpa = semester.credits > 0 ? (semester.points / semester.credits).toFixed(2) : 0;
  });

  logger.audit('Student grades summary retrieved', req.user._id, {
    studentId,
    academicYear
  });

  res.json({
    success: true,
    data: {
      summary: {
        totalCourses: grades.length,
        completedCourses: completedGrades.length,
        totalCredits,
        cumulativeGPA: parseFloat(cumulativeGPA),
        semesterGPAs
      },
      grades
    }
  });
});

/**
 * Helper function to get staff by user ID
 */
const getStaffByUserId = async (userId) => {
  const { Staff } = require('../models');
  return await Staff.findOne({ user: userId });
};

/**
 * Helper function to calculate final grade from assessments
 */
const calculateFinalGrade = (assessments) => {
  let totalWeightedPoints = 0;
  let totalWeight = 0;

  assessments.forEach(assessment => {
    const percentage = (assessment.earnedPoints / assessment.maxPoints) * 100;
    totalWeightedPoints += percentage * (assessment.weight / 100);
    totalWeight += assessment.weight;
  });

  const numericGrade = totalWeight > 0 ? totalWeightedPoints : 0;
  const letterGrade = calculateLetterGrade(numericGrade);
  const gradePoints = calculateGradePoints(letterGrade);

  return {
    numeric: numericGrade,
    letter: letterGrade,
    points: gradePoints
  };
};

/**
 * Helper function to calculate letter grade from numeric grade
 */
const calculateLetterGrade = (numericGrade) => {
  if (numericGrade >= 97) return 'A+';
  if (numericGrade >= 93) return 'A';
  if (numericGrade >= 90) return 'A-';
  if (numericGrade >= 87) return 'B+';
  if (numericGrade >= 83) return 'B';
  if (numericGrade >= 80) return 'B-';
  if (numericGrade >= 77) return 'C+';
  if (numericGrade >= 73) return 'C';
  if (numericGrade >= 70) return 'C-';
  if (numericGrade >= 67) return 'D+';
  if (numericGrade >= 60) return 'D';
  return 'F';
};

/**
 * Helper function to calculate grade points from letter grade
 */
const calculateGradePoints = (letterGrade) => {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
};

/**
 * Helper function to calculate grade from numeric value
 */
const calculateGradeFromNumeric = (numericGrade) => {
  const letter = calculateLetterGrade(numericGrade);
  const points = calculateGradePoints(letter);
  return { letter, points };
};

/**
 * Helper function to update student GPA
 */
const updateStudentGPA = async (studentId) => {
  const grades = await Grade.find({
    student: studentId,
    'gradeInfo.status': 'completed',
    'gradeInfo.finalGrade.isComplete': true
  });

  let totalQualityPoints = 0;
  let totalCredits = 0;

  grades.forEach(grade => {
    const credits = grade.gradeInfo.finalGrade.credits || 0;
    const points = grade.gradeInfo.finalGrade.gradePoints || 0;
    totalQualityPoints += points * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;

  await Student.findByIdAndUpdate(studentId, {
    'academicStatus.gpa': parseFloat(gpa.toFixed(2)),
    'academicStatus.completedCredits': totalCredits
  });
};

module.exports = {
  getAllGrades,
  getGradeById,
  createOrUpdateGrade,
  submitGradeAppeal,
  processGradeAppeal,
  getStudentGradesSummary
};
