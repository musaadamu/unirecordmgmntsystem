const { Course, Enrollment, Grade, Staff } = require('../models');
const { USER_ROLES, COURSE_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all courses with pagination and filtering
 */
const getAllCourses = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    faculty,
    level,
    status,
    semester,
    academicYear,
    search,
    sort = 'courseCode',
    order = 'asc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (department) filter['academicInfo.department'] = department;
  if (faculty) filter['academicInfo.faculty'] = faculty;
  if (level) filter['academicInfo.level'] = level;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { courseCode: { $regex: search, $options: 'i' } },
      { courseName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Add semester and academic year filter for offerings
  const offeringFilter = {};
  if (semester) offeringFilter['offerings.semester'] = semester;
  if (academicYear) offeringFilter['offerings.academicYear'] = academicYear;

  if (Object.keys(offeringFilter).length > 0) {
    Object.assign(filter, offeringFilter);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query
  const courses = await Course.find(filter)
    .populate('offerings.instructor', 'employeeId user')
    .populate({
      path: 'offerings.instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Course.countDocuments(filter);

  logger.audit('Courses retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCourses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get course by ID
 */
const getCourseById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate('academicInfo.prerequisites', 'courseCode courseName')
    .populate('academicInfo.corequisites', 'courseCode courseName')
    .populate('offerings.instructor', 'employeeId user')
    .populate({
      path: 'offerings.instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .populate('offerings.assistants', 'employeeId user')
    .populate({
      path: 'offerings.assistants',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  logger.audit('Course retrieved', req.user._id, {
    courseId: id
  });

  res.json({
    success: true,
    data: {
      course
    }
  });
});

/**
 * Create new course
 */
const createCourse = catchAsync(async (req, res) => {
  const courseData = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
  if (existingCourse) {
    throw new AppError('Course with this code already exists', 400);
  }

  // Validate instructor exists
  if (courseData.offerings && courseData.offerings.length > 0) {
    for (const offering of courseData.offerings) {
      if (offering.instructor) {
        const instructor = await Staff.findById(offering.instructor);
        if (!instructor) {
          throw new AppError(`Instructor with ID ${offering.instructor} not found`, 400);
        }
      }
    }
  }

  const course = new Course({
    ...courseData,
    createdBy: req.user._id
  });

  await course.save();

  logger.audit('Course created', req.user._id, {
    courseId: course._id,
    courseCode: course.courseCode
  });

  const newCourse = await Course.findById(course._id)
    .populate('offerings.instructor', 'employeeId user')
    .populate({
      path: 'offerings.instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
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
 * Update course
 */
const updateCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if updating course code and it already exists
  if (updates.courseCode && updates.courseCode !== course.courseCode) {
    const existingCourse = await Course.findOne({ courseCode: updates.courseCode });
    if (existingCourse) {
      throw new AppError('Course with this code already exists', 400);
    }
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      course[key] = updates[key];
    }
  });

  course.updatedBy = req.user._id;
  await course.save();

  logger.audit('Course updated', req.user._id, {
    courseId: id,
    updatedFields: Object.keys(updates)
  });

  const updatedCourse = await Course.findById(id)
    .populate('offerings.instructor', 'employeeId user')
    .populate({
      path: 'offerings.instructor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
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
 * Delete course (soft delete)
 */
const deleteCourse = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if course has active enrollments
  const activeEnrollments = await Enrollment.countDocuments({
    course: id,
    'enrollmentInfo.status': 'enrolled'
  });

  if (activeEnrollments > 0) {
    throw new AppError('Cannot delete course with active enrollments', 400);
  }

  // Soft delete by setting status to archived
  course.status = COURSE_STATUS.ARCHIVED;
  course.isActive = false;
  course.updatedBy = req.user._id;
  await course.save();

  logger.audit('Course deleted', req.user._id, {
    courseId: id,
    courseCode: course.courseCode
  });

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

/**
 * Get course enrollments
 */
const getCourseEnrollments = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { semester, academicYear } = req.query;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const filter = { course: id };
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  const enrollments = await Enrollment.find(filter)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .sort({ 'enrollmentInfo.enrollmentDate': -1 });

  const enrollmentStats = {
    total: enrollments.length,
    enrolled: enrollments.filter(e => e.enrollmentInfo.status === 'enrolled').length,
    dropped: enrollments.filter(e => e.enrollmentInfo.status === 'dropped').length,
    completed: enrollments.filter(e => e.enrollmentInfo.status === 'completed').length
  };

  logger.audit('Course enrollments retrieved', req.user._id, {
    courseId: id,
    semester,
    academicYear
  });

  res.json({
    success: true,
    data: {
      course: {
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName
      },
      enrollments,
      stats: enrollmentStats
    }
  });
});

/**
 * Get course statistics
 */
const getCourseStats = catchAsync(async (req, res) => {
  const stats = await Course.aggregate([
    {
      $group: {
        _id: '$academicInfo.department',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', COURSE_STATUS.ACTIVE] }, 1, 0]
          }
        },
        averageCredits: { $avg: '$academicInfo.credits' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const totalCourses = await Course.countDocuments();
  const recentCourses = await Course.find()
    .select('courseCode courseName academicInfo.department status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  logger.audit('Course statistics retrieved', req.user._id);

  res.json({
    success: true,
    data: {
      totalCourses,
      departmentStats: stats,
      recentCourses
    }
  });
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getCourseStats
};
