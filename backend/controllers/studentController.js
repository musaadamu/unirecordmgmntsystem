const { Student, User, Enrollment, Grade } = require('../models');
const { USER_ROLES, ACADEMIC_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all students with pagination and filtering
 */
const getAllStudents = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    program,
    academicYear,
    status,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (department) filter['academicInfo.department'] = department;
  if (program) filter['academicInfo.program'] = program;
  if (academicYear) filter['academicInfo.academicYear'] = academicYear;
  if (status) filter['academicStatus.status'] = status;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Build aggregation pipeline
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    }
  ];

  // Add search filter if provided
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { studentId: { $regex: search, $options: 'i' } },
          { 'userInfo.email': { $regex: search, $options: 'i' } },
          { 'userInfo.personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'userInfo.personalInfo.lastName': { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  // Add other filters
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Add sorting and pagination
  pipeline.push(
    { $sort: { [sort]: sortOrder } },
    { $skip: skip },
    { $limit: parseInt(limit) },
    {
      $project: {
        studentId: 1,
        academicInfo: 1,
        academicStatus: 1,
        enrollmentInfo: 1,
        financialInfo: 1,
        isActive: 1,
        createdAt: 1,
        'userInfo.email': 1,
        'userInfo.personalInfo': 1,
        'userInfo.status': 1
      }
    }
  );

  const students = await Student.aggregate(pipeline);
  const total = await Student.countDocuments(filter);

  logger.audit('Students retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get student by ID
 */
const getStudentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id)
    .populate('user', '-password -emailVerificationToken -passwordResetToken')
    .populate('academicInfo.advisor', 'employeeId user')
    .populate({
      path: 'academicInfo.advisor',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    if (student.user._id.toString() !== req.user._id.toString()) {
      throw new AppError('You can only access your own student record', 403);
    }
  }

  logger.audit('Student retrieved', req.user._id, {
    studentId: id
  });

  res.json({
    success: true,
    data: {
      student
    }
  });
});

/**
 * Update student information
 */
const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const student = await Student.findById(id);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    if (student.user.toString() !== req.user._id.toString()) {
      throw new AppError('You can only update your own student record', 403);
    }
    // Students can only update limited fields
    const allowedFields = ['parentInfo', 'medicalInfo', 'documents'];
    const updateFields = Object.keys(updates);
    const isValidUpdate = updateFields.every(field => allowedFields.includes(field));
    
    if (!isValidUpdate) {
      throw new AppError('Students can only update parent info, medical info, and documents', 403);
    }
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      student[key] = updates[key];
    }
  });

  student.updatedBy = req.user._id;
  await student.save();

  logger.audit('Student updated', req.user._id, {
    studentId: id,
    updatedFields: Object.keys(updates)
  });

  const updatedStudent = await Student.findById(id)
    .populate('user', '-password -emailVerificationToken -passwordResetToken');

  res.json({
    success: true,
    message: 'Student updated successfully',
    data: {
      student: updatedStudent
    }
  });
});

/**
 * Get student academic summary
 */
const getStudentAcademicSummary = catchAsync(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    if (student.user.toString() !== req.user._id.toString()) {
      throw new AppError('You can only access your own academic summary', 403);
    }
  }

  // Get enrollments
  const enrollments = await Enrollment.find({ student: id })
    .populate('course', 'courseCode courseName academicInfo.credits')
    .sort({ academicYear: -1, semester: -1 });

  // Get grades
  const grades = await Grade.find({ student: id })
    .populate('course', 'courseCode courseName')
    .sort({ academicYear: -1, semester: -1 });

  // Calculate statistics
  const totalCreditsAttempted = enrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.course?.academicInfo?.credits || 0);
  }, 0);

  const completedGrades = grades.filter(grade => 
    grade.gradeInfo.status === 'completed' && 
    grade.gradeInfo.finalGrade.isComplete
  );

  const totalCreditsEarned = completedGrades.reduce((sum, grade) => {
    return sum + (grade.gradeInfo.finalGrade.credits || 0);
  }, 0);

  // Calculate GPA
  let totalQualityPoints = 0;
  let totalGpaCredits = 0;

  completedGrades.forEach(grade => {
    if (grade.gradeInfo.finalGrade.gradePoints > 0) {
      totalQualityPoints += grade.gradeInfo.finalGrade.gradePoints * grade.gradeInfo.finalGrade.credits;
      totalGpaCredits += grade.gradeInfo.finalGrade.credits;
    }
  });

  const currentGPA = totalGpaCredits > 0 ? (totalQualityPoints / totalGpaCredits).toFixed(2) : 0;

  logger.audit('Student academic summary retrieved', req.user._id, {
    studentId: id
  });

  res.json({
    success: true,
    data: {
      student: {
        id: student._id,
        studentId: student.studentId,
        academicInfo: student.academicInfo,
        academicStatus: student.academicStatus
      },
      academicSummary: {
        totalCreditsAttempted,
        totalCreditsEarned,
        currentGPA: parseFloat(currentGPA),
        totalCourses: enrollments.length,
        completedCourses: completedGrades.length
      },
      recentEnrollments: enrollments.slice(0, 5),
      recentGrades: grades.slice(0, 5)
    }
  });
});

/**
 * Get student statistics
 */
const getStudentStats = catchAsync(async (req, res) => {
  const stats = await Student.aggregate([
    {
      $group: {
        _id: '$academicInfo.department',
        count: { $sum: 1 },
        enrolled: {
          $sum: {
            $cond: [{ $eq: ['$academicStatus.status', ACADEMIC_STATUS.ENROLLED] }, 1, 0]
          }
        },
        graduated: {
          $sum: {
            $cond: [{ $eq: ['$academicStatus.status', ACADEMIC_STATUS.GRADUATED] }, 1, 0]
          }
        },
        averageGPA: { $avg: '$academicStatus.gpa' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const totalStudents = await Student.countDocuments();
  const recentStudents = await Student.find()
    .populate('user', 'personalInfo.firstName personalInfo.lastName email')
    .sort({ createdAt: -1 })
    .limit(5);

  logger.audit('Student statistics retrieved', req.user._id);

  res.json({
    success: true,
    data: {
      totalStudents,
      departmentStats: stats,
      recentStudents
    }
  });
});

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudent,
  getStudentAcademicSummary,
  getStudentStats
};
