const { Course, Enrollment, Grade, Staff, Student } = require('../models');
const { USER_ROLES, COURSE_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Get all courses with advanced filtering and pagination
 */
const getAllCourses = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    faculty,
    level,
    status = 'active',
    semester,
    academicYear,
    search,
    sort = 'courseCode',
    order = 'asc',
    instructor
  } = req.query;

  // Build filter object
  const filter = { isDeleted: { $ne: true } };
  
  if (department) filter['academicInfo.department'] = department;
  if (faculty) filter['academicInfo.faculty'] = faculty;
  if (level) filter['academicInfo.level'] = level;
  if (status && status !== 'all') filter.status = status;
  
  // Search functionality
  if (search) {
    filter.$or = [
      { courseCode: { $regex: search, $options: 'i' } },
      { courseName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'academicInfo.department': { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by semester and academic year in offerings
  if (semester || academicYear || instructor) {
    const offeringMatch = {};
    if (semester) offeringMatch['offerings.semester'] = semester;
    if (academicYear) offeringMatch['offerings.academicYear'] = academicYear;
    if (instructor) offeringMatch['offerings.instructor'] = new mongoose.Types.ObjectId(instructor);
    
    Object.assign(filter, offeringMatch);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = {};
  sortObj[sort] = sortOrder;

  try {
    // Execute query with population
    const courses = await Course.find(filter)
      .populate({
        path: 'offerings.instructor',
        select: 'employeeId user personalInfo',
        populate: {
          path: 'user',
          select: 'personalInfo.firstName personalInfo.lastName email'
        }
      })
      .populate({
        path: 'offerings.assistants',
        select: 'employeeId user',
        populate: {
          path: 'user',
          select: 'personalInfo.firstName personalInfo.lastName'
        }
      })
      .populate('academicInfo.prerequisites', 'courseCode courseName')
      .populate('academicInfo.corequisites', 'courseCode courseName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Course.countDocuments(filter);

    // Log the operation
    logger.audit('Courses retrieved', req.user._id, {
      filter: { ...filter, search: !!search },
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCourses: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
          limit: parseInt(limit)
        },
        filters: {
          department,
          faculty,
          level,
          status,
          semester,
          academicYear,
          search
        }
      },
      message: `Retrieved ${courses.length} courses successfully`
    });
  } catch (error) {
    logger.error('Error retrieving courses', error, req.user._id);
    throw new AppError('Failed to retrieve courses', 500);
  }
});

/**
 * Search courses with advanced text search
 */
const searchCourses = catchAsync(async (req, res) => {
  const { q, department, faculty, level, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters long', 400);
  }

  const filter = {
    isDeleted: { $ne: true },
    status: 'active',
    $or: [
      { courseCode: { $regex: q, $options: 'i' } },
      { courseName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { 'academicInfo.department': { $regex: q, $options: 'i' } }
    ]
  };

  if (department) filter['academicInfo.department'] = department;
  if (faculty) filter['academicInfo.faculty'] = faculty;
  if (level) filter['academicInfo.level'] = level;

  const courses = await Course.find(filter)
    .select('courseCode courseName description academicInfo.department academicInfo.faculty academicInfo.level academicInfo.credits')
    .limit(parseInt(limit))
    .sort({ courseCode: 1 })
    .lean();

  res.json({
    success: true,
    data: {
      courses,
      count: courses.length,
      query: q
    }
  });
});

/**
 * Get courses grouped by departments
 */
const getCoursesByDepartment = catchAsync(async (req, res) => {
  const { status = 'active' } = req.query;

  const filter = { isDeleted: { $ne: true } };
  if (status && status !== 'all') filter.status = status;

  const coursesByDepartment = await Course.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$academicInfo.department',
        courses: {
          $push: {
            _id: '$_id',
            courseCode: '$courseCode',
            courseName: '$courseName',
            credits: '$academicInfo.credits',
            level: '$academicInfo.level',
            status: '$status'
          }
        },
        totalCourses: { $sum: 1 },
        totalCredits: { $sum: '$academicInfo.credits' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  logger.audit('Courses by department retrieved', req.user._id, {
    departmentCount: coursesByDepartment.length
  });

  res.json({
    success: true,
    data: {
      departments: coursesByDepartment,
      totalDepartments: coursesByDepartment.length
    }
  });
});

/**
 * Get active courses
 */
const getActiveCourses = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    faculty,
    level,
    search,
    sort = 'courseCode',
    order = 'asc'
  } = req.query;

  const filter = {
    isDeleted: { $ne: true },
    status: COURSE_STATUS.ACTIVE,
    isActive: true
  };

  if (department) filter['academicInfo.department'] = department;
  if (faculty) filter['academicInfo.faculty'] = faculty;
  if (level) filter['academicInfo.level'] = level;

  if (search) {
    filter.$or = [
      { courseCode: { $regex: search, $options: 'i' } },
      { courseName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = {};
  sortObj[sort] = sortOrder;

  const courses = await Course.find(filter)
    .select('courseCode courseName description academicInfo status offerings')
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Course.countDocuments(filter);

  res.json({
    success: true,
    data: {
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCourses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get course by ID with comprehensive details
 */
const getCourseById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate('academicInfo.prerequisites', 'courseCode courseName academicInfo.credits')
    .populate('academicInfo.corequisites', 'courseCode courseName academicInfo.credits')
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user personalInfo',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email personalInfo.phone'
      }
    })
    .populate({
      path: 'offerings.assistants',
      select: 'employeeId user personalInfo',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('createdBy updatedBy', 'personalInfo.firstName personalInfo.lastName')
    .lean();

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Get enrollment statistics for this course
  const enrollmentStats = await Enrollment.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: '$enrollmentInfo.status',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = enrollmentStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  logger.audit('Course retrieved', req.user._id, { courseId: id });

  res.json({
    success: true,
    data: {
      course: {
        ...course,
        enrollmentStats: {
          total: Object.values(stats).reduce((sum, count) => sum + count, 0),
          enrolled: stats.enrolled || 0,
          completed: stats.completed || 0,
          dropped: stats.dropped || 0,
          withdrawn: stats.withdrawn || 0
        }
      }
    }
  });
});

/**
 * Create new course with validation
 */
const createCourse = catchAsync(async (req, res) => {
  const courseData = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ 
    courseCode: courseData.courseCode,
    isDeleted: { $ne: true }
  });
  
  if (existingCourse) {
    throw new AppError(`Course with code '${courseData.courseCode}' already exists`, 409);
  }

  // Validate instructors exist if provided
  if (courseData.offerings && courseData.offerings.length > 0) {
    for (const offering of courseData.offerings) {
      if (offering.instructor) {
        const instructor = await Staff.findById(offering.instructor)
          .populate('user', 'roles');
        
        if (!instructor) {
          throw new AppError(`Instructor with ID ${offering.instructor} not found`, 400);
        }
        
        // Verify instructor has academic role
        const hasAcademicRole = instructor.user.roles.some(role => 
          [USER_ROLES.ACADEMIC_STAFF, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(role)
        );
        
        if (!hasAcademicRole) {
          throw new AppError(`Staff member ${instructor.employeeId} is not authorized to be an instructor`, 403);
        }
      }
    }
  }

  // Create the course
  const course = new Course({
    ...courseData,
    createdBy: req.user._id,
    status: courseData.status || COURSE_STATUS.ACTIVE
  });

  await course.save();

  // Fetch the created course with populated fields
  const newCourse = await Course.findById(course._id)
    .populate('academicInfo.prerequisites', 'courseCode courseName')
    .populate('academicInfo.corequisites', 'courseCode courseName')
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .lean();

  logger.audit('Course created', req.user._id, {
    courseId: course._id,
    courseCode: course.courseCode,
    courseName: course.courseName
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: {
      course: newCourse
    }
  });
});

/**
 * Add new offering to existing course
 */
const addCourseOffering = catchAsync(async (req, res) => {
  const { id } = req.params;
  const offeringData = req.body;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Validate instructor if provided
  if (offeringData.instructor) {
    const instructor = await Staff.findById(offeringData.instructor)
      .populate('user', 'roles');
    
    if (!instructor) {
      throw new AppError(`Instructor with ID ${offeringData.instructor} not found`, 400);
    }
    
    const hasAcademicRole = instructor.user.roles.some(role => 
      [USER_ROLES.ACADEMIC_STAFF, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(role)
    );
    
    if (!hasAcademicRole) {
      throw new AppError(`Staff member is not authorized to be an instructor`, 403);
    }
  }

  // Check if offering already exists for the same semester/year
  const existingOffering = course.offerings.find(offering => 
    offering.semester === offeringData.semester && 
    offering.academicYear === offeringData.academicYear
  );

  if (existingOffering) {
    throw new AppError(`Offering already exists for ${offeringData.semester} ${offeringData.academicYear}`, 409);
  }

  // Add the new offering
  course.offerings.push({
    ...offeringData,
    createdAt: new Date()
  });

  course.updatedBy = req.user._id;
  course.updatedAt = new Date();
  await course.save();

  const updatedCourse = await Course.findById(id)
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    });

  logger.audit('Course offering added', req.user._id, {
    courseId: id,
    semester: offeringData.semester,
    academicYear: offeringData.academicYear
  });

  res.status(201).json({
    success: true,
    message: 'Course offering added successfully',
    data: {
      course: updatedCourse
    }
  });
});

/**
 * Update course information
 */
const updateCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if updating course code and it already exists
  if (updates.courseCode && updates.courseCode !== course.courseCode) {
    const existingCourse = await Course.findOne({ 
      courseCode: updates.courseCode,
      _id: { $ne: id },
      isDeleted: { $ne: true }
    });
    
    if (existingCourse) {
      throw new AppError(`Course with code '${updates.courseCode}' already exists`, 409);
    }
  }

  // Store original values for audit log
  const originalValues = {};
  Object.keys(updates).forEach(key => {
    originalValues[key] = course[key];
  });

  // Update fields
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
      course[key] = updates[key];
    }
  });

  course.updatedBy = req.user._id;
  course.updatedAt = new Date();
  
  await course.save();

  // Fetch updated course with populated fields
  const updatedCourse = await Course.findById(id)
    .populate('academicInfo.prerequisites', 'courseCode courseName')
    .populate('academicInfo.corequisites', 'courseCode courseName')
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .lean();

  logger.audit('Course updated', req.user._id, {
    courseId: id,
    updatedFields: Object.keys(updates),
    originalValues,
    newValues: updates
  });

  res.json({
    success: true,
    message: 'Course updated successfully',
    data: {
      course: updatedCourse
    }
  });
});

/**
 * Update course status
 */
const updateCourseStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const oldStatus = course.status;
  course.status = status;
  course.updatedBy = req.user._id;
  course.updatedAt = new Date();

  // If archiving, also set isActive to false
  if (status === COURSE_STATUS.ARCHIVED) {
    course.isActive = false;
  } else if (status === COURSE_STATUS.ACTIVE) {
    course.isActive = true;
  }

  await course.save();

  logger.audit('Course status updated', req.user._id, {
    courseId: id,
    oldStatus,
    newStatus: status
  });

  res.json({
    success: true,
    message: `Course status updated to ${status}`,
    data: {
      course: {
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        status: course.status,
        isActive: course.isActive
      }
    }
  });
});

/**
 * Delete course (soft delete)
 */
const deleteCourse = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if course has active enrollments
  const activeEnrollments = await Enrollment.countDocuments({
    course: id,
    'enrollmentInfo.status': { $in: ['enrolled', 'active'] }
  });

  if (activeEnrollments > 0) {
    throw new AppError(`Cannot delete course with ${activeEnrollments} active enrollments. Please handle enrollments first.`, 400);
  }

  // Soft delete
  course.isDeleted = true;
  course.deletedAt = new Date();
  course.deletedBy = req.user._id;
  course.status = COURSE_STATUS.ARCHIVED;
  course.isActive = false;

  await course.save();

  logger.audit('Course deleted', req.user._id, {
    courseId: id,
    courseCode: course.courseCode,
    courseName: course.courseName
  });

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

/**
 * Remove specific offering from course
 */
const removeCourseOffering = catchAsync(async (req, res) => {
  const { id, offeringId } = req.params;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const offeringIndex = course.offerings.findIndex(
    offering => offering._id.toString() === offeringId
  );

  if (offeringIndex === -1) {
    throw new AppError('Course offering not found', 404);
  }

  const offering = course.offerings[offeringIndex];

  // Check if offering has active enrollments
  const activeEnrollments = await Enrollment.countDocuments({
    course: id,
    semester: offering.semester,
    academicYear: offering.academicYear,
    'enrollmentInfo.status': { $in: ['enrolled', 'active'] }
  });

  if (activeEnrollments > 0) {
    throw new AppError(`Cannot remove offering with ${activeEnrollments} active enrollments`, 400);
  }

  // Remove the offering
  course.offerings.splice(offeringIndex, 1);
  course.updatedBy = req.user._id;
  course.updatedAt = new Date();
  
  await course.save();

  logger.audit('Course offering removed', req.user._id, {
    courseId: id,
    offeringId,
    semester: offering.semester,
    academicYear: offering.academicYear
  });

  res.json({
    success: true,
    message: 'Course offering removed successfully'
  });
});

/**
 * Get course enrollments with detailed information
 */
const getCourseEnrollments = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { 
    semester, 
    academicYear, 
    status, 
    page = 1, 
    limit = 50,
    sort = 'enrollmentInfo.enrollmentDate',
    order = 'desc'
  } = req.query;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } })
    .select('courseCode courseName academicInfo.department')
    .lean();

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Build enrollment filter
  const filter = { course: id };
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter['enrollmentInfo.status'] = status;

  // Pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = {};
  sortObj[sort] = sortOrder;

  const enrollments = await Enrollment.find(filter)
    .populate({
      path: 'student',
      select: 'studentId user academicInfo',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email personalInfo.phone'
      }
    })
    .populate('grades.gradedBy', 'personalInfo.firstName personalInfo.lastName')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalEnrollments = await Enrollment.countDocuments(filter);

  // Calculate statistics
  const enrollmentStats = await Enrollment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$enrollmentInfo.status',
        count: { $sum: 1 },
        avgGrade: { $avg: '$academicInfo.finalGrade' }
      }
    }
  ]);

  const stats = {
    total: totalEnrollments,
    byStatus: enrollmentStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avgGrade: stat.avgGrade ? Math.round(stat.avgGrade * 100) / 100 : null
      };
      return acc;
    }, {})
  };

  logger.audit('Course enrollments retrieved', req.user._id, {
    courseId: id,
    filters: { semester, academicYear, status },
    count: enrollments.length
  });

  res.json({
    success: true,
    data: {
      course,
      enrollments,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEnrollments / parseInt(limit)),
        totalEnrollments,
        hasNext: page * limit < totalEnrollments,
        hasPrev: page > 1,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Get course prerequisites and dependency tree
 */
const getCoursePrerequisites = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate({
      path: 'academicInfo.prerequisites',
      select: 'courseCode courseName academicInfo.credits academicInfo.prerequisites',
      populate: {
        path: 'academicInfo.prerequisites',
        select: 'courseCode courseName academicInfo.credits'
      }
    })
    .populate('academicInfo.corequisites', 'courseCode courseName academicInfo.credits')
    .lean();

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Find courses that have this course as a prerequisite
  const dependentCourses = await Course.find({
    'academicInfo.prerequisites': id,
    isDeleted: { $ne: true }
  })
  .select('courseCode courseName academicInfo.credits')
  .lean();

  res.json({
    success: true,
    data: {
      course: {
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.academicInfo.credits
      },
      prerequisites: course.academicInfo.prerequisites || [],
      corequisites: course.academicInfo.corequisites || [],
      dependentCourses
    }
  });
});

/**
 * Get course schedule for specific semester
 */
const getCourseSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { semester, academicYear } = req.query;

  const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user personalInfo',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email personalInfo.phone'
      }
    })
    .lean();

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Filter offerings by semester and academic year if provided
  let offerings = course.offerings || [];
  
  if (semester) {
    offerings = offerings.filter(offering => offering.semester === semester);
  }
  
  if (academicYear) {
    offerings = offerings.filter(offering => offering.academicYear === academicYear);
  }

  res.json({
    success: true,
    data: {
      course: {
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.academicInfo.credits
      },
      offerings: offerings.map(offering => ({
        id: offering._id,
        semester: offering.semester,
        academicYear: offering.academicYear,
        instructor: offering.instructor,
        schedule: offering.schedule || [],
        venue: offering.venue,
        maxStudents: offering.maxStudents,
        currentEnrollment: offering.currentEnrollment || 0
      })),
      filters: { semester, academicYear }
    }
  });
});

/**
 * Create multiple courses at once
 */
const createBulkCourses = catchAsync(async (req, res) => {
  const { courses } = req.body;

  if (!Array.isArray(courses) || courses.length === 0) {
    throw new AppError('Courses array is required and must not be empty', 400);
  }

  // Check for duplicate course codes in the request
  const courseCodes = courses.map(course => course.courseCode);
  const duplicates = courseCodes.filter((code, index) => courseCodes.indexOf(code) !== index);
  
  if (duplicates.length > 0) {
    throw new AppError(`Duplicate course codes in request: ${duplicates.join(', ')}`, 400);
  }

  // Check if any course codes already exist in database
  const existingCourses = await Course.find({
    courseCode: { $in: courseCodes },
    isDeleted: { $ne: true }
  }).select('courseCode');

  if (existingCourses.length > 0) {
    const existingCodes = existingCourses.map(course => course.courseCode);
    throw new AppError(`The following course codes already exist: ${existingCodes.join(', ')}`, 409);
  }

  // Prepare courses for insertion
  const coursesToInsert = courses.map(courseData => ({
    ...courseData,
    createdBy: req.user._id,
    status: courseData.status || COURSE_STATUS.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  try {
    // Insert all courses
    const insertedCourses = await Course.insertMany(coursesToInsert);

    logger.audit('Bulk courses created', req.user._id, {
      count: insertedCourses.length,
      courseCodes: insertedCourses.map(course => course.courseCode)
    });

    res.status(201).json({
      success: true,
      message: `${insertedCourses.length} courses created successfully`,
      data: {
        courses: insertedCourses,
        count: insertedCourses.length
      }
    });

  } catch (error) {
    logger.error('Error creating bulk courses', error, req.user._id);
    throw new AppError('Failed to create courses in bulk', 500);
  }
});

/**
 * Get course analytics and statistics
 */
const getCourseAnalytics = catchAsync(async (req, res) => {
  const { department, faculty, semester, academicYear } = req.query;

  const matchStage = { isDeleted: { $ne: true } };
  if (department) matchStage['academicInfo.department'] = department;
  if (faculty) matchStage['academicInfo.faculty'] = faculty;

  const analytics = await Course.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'course',
        as: 'enrollments'
      }
    },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        activeCourses: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        archivedCourses: {
          $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
        },
        totalCredits: { $sum: '$academicInfo.credits' },
        totalEnrollments: { $sum: { $size: '$enrollments' } },
        avgCreditsPerCourse: { $avg: '$academicInfo.credits' },
        coursesByDepartment: {
          $push: {
            department: '$academicInfo.department',
            credits: '$academicInfo.credits',
            enrollmentCount: { $size: '$enrollments' }
          }
        }
      }
    }
  ]);

  const departmentStats = await Course.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$academicInfo.department',
        courseCount: { $sum: 1 },
        totalCredits: { $sum: '$academicInfo.credits' },
        avgCredits: { $avg: '$academicInfo.credits' }
      }
    },
    { $sort: { courseCount: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: analytics[0] || {
        totalCourses: 0,
        activeCourses: 0,
        archivedCourses: 0,
        totalCredits: 0,
        totalEnrollments: 0,
        avgCreditsPerCourse: 0
      },
      departmentStats,
      filters: { department, faculty, semester, academicYear }
    }
  });
});

// Add this method to your controllers/courseController.js file

const getCourseStats = async (req, res) => {
  try {
    // Implement your course statistics logic here
    // This is a placeholder implementation
    const stats = {
      totalCourses: 0,
      activeCourses: 0,
      coursesByDepartment: {},
      coursesByLevel: {},
      enrollmentStats: {
        totalEnrollments: 0,
        averageEnrollmentPerCourse: 0
      },
      message: "Course statistics endpoint - implement your logic here"
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
};

/**
 * Export course data
 */
const exportCourses = catchAsync(async (req, res) => {
  const { format = 'json', department, faculty, status } = req.query;

  const filter = { isDeleted: { $ne: true } };
  if (department) filter['academicInfo.department'] = department;
  if (faculty) filter['academicInfo.faculty'] = faculty;
  if (status && status !== 'all') filter.status = status;

  const courses = await Course.find(filter)
    .populate('academicInfo.prerequisites', 'courseCode courseName')
    .populate('academicInfo.corequisites', 'courseCode courseName')
    .populate({
      path: 'offerings.instructor',
      select: 'employeeId user',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .select('-__v -isDeleted -deletedAt -deletedBy')
    .lean();

  logger.audit('Courses exported', req.user._id, {
    format,
    count: courses.length,
    filters: { department, faculty, status }
  });

  if (format === 'csv') {
    // For CSV export, flatten the data structure
    const csvData = courses.map(course => ({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      department: course.academicInfo?.department || '',
      faculty: course.academicInfo?.faculty || '',
      level: course.academicInfo?.level || '',
      credits: course.academicInfo?.credits || 0,
      status: course.status,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=courses-export.csv');
    
    // Simple CSV conversion (in production, you might want to use a proper CSV library)
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    res.send(csvContent);
  } else {
    res.json({
      success: true,
      data: {
        courses,
        exportInfo: {
          format,
          exportedAt: new Date(),
          count: courses.length,
          filters: { department, faculty, status }
        }
      }
    });
  }
});

/**
 * Get all course offerings (flattened view)
 */
const getAllCourseOfferings = catchAsync(async (req, res) => {
  // Flatten all offerings from all courses
  const courses = await Course.find({ isDeleted: { $ne: true } }).lean();
  const offerings = [];
  courses.forEach(course => {
    if (Array.isArray(course.offerings)) {
      course.offerings.forEach(offering => {
        offerings.push({
          ...offering,
          courseId: course._id,
          courseCode: course.courseCode,
          courseName: course.courseName
        });
      });
    }
  });
  res.json({ success: true, data: offerings });
});

/**
 * Add a new course offering (global)
 */
const addCourseOfferingGlobal = catchAsync(async (req, res) => {
  const { courseId, offering } = req.body;
  if (!courseId || !offering) {
    return res.status(400).json({ success: false, message: 'courseId and offering required' });
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  course.offerings.push(offering);
  await course.save();
  res.json({ success: true, data: offering });
});

/**
 * Get a single course offering by ID
 */
const getCourseOfferingById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const courses = await Course.find({ 'offerings._id': id }).lean();
  let found = null;
  courses.forEach(course => {
    const offering = course.offerings.find(o => o._id.toString() === id);
    if (offering) {
      found = { ...offering, courseId: course._id, courseCode: course.courseCode, courseName: course.courseName };
    }
  });
  if (!found) {
    return res.status(404).json({ success: false, message: 'Offering not found' });
  }
  res.json({ success: true, data: found });
});

/**
 * Update a course offering (global)
 */
const updateCourseOfferingGlobal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { offering } = req.body;
  const course = await Course.findOne({ 'offerings._id': id });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  const idx = course.offerings.findIndex(o => o._id.toString() === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Offering not found' });
  }
  course.offerings[idx] = { ...course.offerings[idx], ...offering };
  await course.save();
  res.json({ success: true, data: course.offerings[idx] });
});

/**
 * Delete a course offering (global)
 */
const deleteCourseOfferingGlobal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findOne({ 'offerings._id': id });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  const idx = course.offerings.findIndex(o => o._id.toString() === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Offering not found' });
  }
  course.offerings.splice(idx, 1);
  await course.save();
  res.json({ success: true, message: 'Offering deleted' });
});

module.exports = {
  getAllCourses,
  searchCourses,
  getCoursesByDepartment,
  getActiveCourses,
  getCourseById,
  createCourse,
  addCourseOffering,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  removeCourseOffering,
  getCourseEnrollments,
  getCoursePrerequisites,
  getCourseSchedule,
  createBulkCourses,
  getCourseAnalytics,
  exportCourses,
  getCourseStats,
  getAllCourseOfferings,
  addCourseOfferingGlobal,
  getCourseOfferingById,
  updateCourseOfferingGlobal,
  deleteCourseOfferingGlobal,
};