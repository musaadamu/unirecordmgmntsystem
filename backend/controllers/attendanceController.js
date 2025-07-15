const { Attendance, Student, Course, Staff, Enrollment } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Record attendance for a class session
 */
const recordAttendance = catchAsync(async (req, res) => {
  const {
    studentId,
    courseId,
    semester,
    academicYear,
    section,
    sessionInfo,
    attendanceStatus
  } = req.body;

  // Verify enrollment exists
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear,
    section,
    'enrollmentInfo.status': 'enrolled'
  });

  if (!enrollment) {
    throw new AppError('Student is not enrolled in this course', 400);
  }

  // Get instructor information
  const instructor = await Staff.findOne({ user: req.user._id });
  if (!instructor && !['admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Only instructors and administrators can record attendance', 403);
  }

  // Check if attendance already recorded for this session
  const existingAttendance = await Attendance.findOne({
    student: studentId,
    course: courseId,
    'sessionInfo.date': new Date(sessionInfo.date),
    'sessionInfo.startTime': sessionInfo.startTime
  });

  if (existingAttendance) {
    throw new AppError('Attendance already recorded for this session', 400);
  }

  // Calculate minutes late if applicable
  let minutesLate = 0;
  if (attendanceStatus.status === 'late' && attendanceStatus.arrivalTime) {
    const sessionStart = new Date(`${sessionInfo.date}T${sessionInfo.startTime}`);
    const arrivalTime = new Date(attendanceStatus.arrivalTime);
    minutesLate = Math.max(0, Math.round((arrivalTime - sessionStart) / (1000 * 60)));
  }

  // Create attendance record
  const attendance = new Attendance({
    student: studentId,
    course: courseId,
    instructor: instructor?._id,
    semester,
    academicYear,
    section,
    sessionInfo,
    attendanceStatus: {
      ...attendanceStatus,
      minutesLate
    },
    recordingInfo: {
      recordedBy: req.user._id,
      recordingMethod: req.body.recordingMethod || 'manual',
      deviceInfo: {
        ipAddress: req.ip,
        ...req.body.deviceInfo
      }
    },
    createdBy: req.user._id
  });

  await attendance.save();

  // Update enrollment attendance statistics
  await updateEnrollmentAttendance(studentId, courseId, semester, academicYear);

  logger.audit('Attendance recorded', req.user._id, {
    attendanceId: attendance._id,
    studentId,
    courseId,
    status: attendanceStatus.status,
    date: sessionInfo.date
  });

  const populatedAttendance = await Attendance.findById(attendance._id)
    .populate('student', 'studentId user')
    .populate('course', 'courseCode courseName');

  res.status(201).json({
    success: true,
    message: 'Attendance recorded successfully',
    data: { attendance: populatedAttendance }
  });
});

/**
 * Bulk record attendance for multiple students
 */
const bulkRecordAttendance = catchAsync(async (req, res) => {
  const {
    courseId,
    semester,
    academicYear,
    section,
    sessionInfo,
    attendanceRecords
  } = req.body;

  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    throw new AppError('Attendance records array is required', 400);
  }

  // Get instructor information
  const instructor = await Staff.findOne({ user: req.user._id });
  if (!instructor && !['admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Only instructors and administrators can record attendance', 403);
  }

  const results = {
    successful: [],
    failed: [],
    total: attendanceRecords.length
  };

  for (const record of attendanceRecords) {
    try {
      const { studentId, attendanceStatus } = record;

      // Verify enrollment
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId,
        semester,
        academicYear,
        section,
        'enrollmentInfo.status': 'enrolled'
      });

      if (!enrollment) {
        results.failed.push({
          studentId,
          error: 'Student not enrolled in course'
        });
        continue;
      }

      // Check for existing attendance
      const existingAttendance = await Attendance.findOne({
        student: studentId,
        course: courseId,
        'sessionInfo.date': new Date(sessionInfo.date),
        'sessionInfo.startTime': sessionInfo.startTime
      });

      if (existingAttendance) {
        results.failed.push({
          studentId,
          error: 'Attendance already recorded'
        });
        continue;
      }

      // Calculate minutes late
      let minutesLate = 0;
      if (attendanceStatus.status === 'late' && attendanceStatus.arrivalTime) {
        const sessionStart = new Date(`${sessionInfo.date}T${sessionInfo.startTime}`);
        const arrivalTime = new Date(attendanceStatus.arrivalTime);
        minutesLate = Math.max(0, Math.round((arrivalTime - sessionStart) / (1000 * 60)));
      }

      // Create attendance record
      const attendance = new Attendance({
        student: studentId,
        course: courseId,
        instructor: instructor?._id,
        semester,
        academicYear,
        section,
        sessionInfo,
        attendanceStatus: {
          ...attendanceStatus,
          minutesLate
        },
        recordingInfo: {
          recordedBy: req.user._id,
          recordingMethod: 'bulk_manual'
        },
        createdBy: req.user._id
      });

      await attendance.save();

      results.successful.push({
        studentId,
        attendanceId: attendance._id,
        status: attendanceStatus.status
      });

    } catch (error) {
      results.failed.push({
        studentId: record.studentId,
        error: error.message
      });
    }
  }

  // Update enrollment attendance for all successful records
  const uniqueStudents = [...new Set(results.successful.map(r => r.studentId))];
  for (const studentId of uniqueStudents) {
    await updateEnrollmentAttendance(studentId, courseId, semester, academicYear);
  }

  logger.audit('Bulk attendance recorded', req.user._id, {
    courseId,
    sessionDate: sessionInfo.date,
    successful: results.successful.length,
    failed: results.failed.length
  });

  res.status(201).json({
    success: true,
    message: `Bulk attendance completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
    data: results
  });
});

/**
 * Get attendance records with filtering
 */
const getAttendanceRecords = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    studentId,
    courseId,
    instructorId,
    semester,
    academicYear,
    status,
    startDate,
    endDate,
    sort = 'sessionInfo.date',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (studentId) filter.student = studentId;
  if (courseId) filter.course = courseId;
  if (instructorId) filter.instructor = instructorId;
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter['attendanceStatus.status'] = status;

  // Date range filter
  if (startDate || endDate) {
    filter['sessionInfo.date'] = {};
    if (startDate) filter['sessionInfo.date'].$gte = new Date(startDate);
    if (endDate) filter['sessionInfo.date'].$lte = new Date(endDate);
  }

  // For students, only show their own attendance
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      filter.student = student._id;
    } else {
      return res.json({
        success: true,
        data: { attendance: [], pagination: { currentPage: 1, totalPages: 0, totalRecords: 0 } }
      });
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query
  const attendance = await Attendance.find(filter)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName'
      }
    })
    .populate('course', 'courseCode courseName')
    .populate('instructor', 'employeeId user')
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Attendance.countDocuments(filter);

  logger.audit('Attendance records retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      attendance,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get attendance summary for student
 */
const getStudentAttendanceSummary = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { semester, academicYear, courseId } = req.query;

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      throw new AppError('You can only access your own attendance summary', 403);
    }
  }

  const filter = { student: studentId };
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;
  if (courseId) filter.course = courseId;

  // Get attendance records
  const attendanceRecords = await Attendance.find(filter)
    .populate('course', 'courseCode courseName academicInfo.credits')
    .sort({ 'sessionInfo.date': -1 });

  // Calculate statistics by course
  const courseStats = {};
  
  attendanceRecords.forEach(record => {
    const courseId = record.course._id.toString();
    
    if (!courseStats[courseId]) {
      courseStats[courseId] = {
        course: record.course,
        totalSessions: 0,
        presentSessions: 0,
        lateSessions: 0,
        absentSessions: 0,
        excusedSessions: 0,
        attendancePercentage: 0
      };
    }

    const stats = courseStats[courseId];
    stats.totalSessions++;

    switch (record.attendanceStatus.status) {
      case 'present':
        stats.presentSessions++;
        break;
      case 'late':
        stats.lateSessions++;
        stats.presentSessions++; // Late is considered present
        break;
      case 'absent':
        stats.absentSessions++;
        break;
      case 'excused':
        stats.excusedSessions++;
        break;
    }

    stats.attendancePercentage = Math.round((stats.presentSessions / stats.totalSessions) * 100);
  });

  // Calculate overall statistics
  const overallStats = {
    totalSessions: attendanceRecords.length,
    presentSessions: attendanceRecords.filter(r => ['present', 'late', 'partial'].includes(r.attendanceStatus.status)).length,
    absentSessions: attendanceRecords.filter(r => r.attendanceStatus.status === 'absent').length,
    excusedSessions: attendanceRecords.filter(r => r.attendanceStatus.status === 'excused').length,
    overallAttendancePercentage: 0
  };

  if (overallStats.totalSessions > 0) {
    overallStats.overallAttendancePercentage = Math.round(
      (overallStats.presentSessions / overallStats.totalSessions) * 100
    );
  }

  logger.audit('Student attendance summary retrieved', req.user._id, {
    studentId,
    semester,
    academicYear,
    courseId
  });

  res.json({
    success: true,
    data: {
      overallStats,
      courseStats: Object.values(courseStats),
      recentAttendance: attendanceRecords.slice(0, 10)
    }
  });
});

/**
 * Update attendance record
 */
const updateAttendanceRecord = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { attendanceStatus, reason } = req.body;

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new AppError('Attendance record not found', 404);
  }

  // Store original status for modification tracking
  const originalStatus = attendance.attendanceStatus.status;

  // Update attendance status
  attendance.attendanceStatus = { ...attendance.attendanceStatus, ...attendanceStatus };
  
  // Add modification record
  attendance.modifications.push({
    originalStatus,
    newStatus: attendanceStatus.status,
    reason,
    modifiedBy: req.user._id
  });

  attendance.updatedBy = req.user._id;
  await attendance.save();

  // Update enrollment attendance statistics
  await updateEnrollmentAttendance(
    attendance.student,
    attendance.course,
    attendance.semester,
    attendance.academicYear
  );

  logger.audit('Attendance record updated', req.user._id, {
    attendanceId: id,
    originalStatus,
    newStatus: attendanceStatus.status,
    reason
  });

  const updatedAttendance = await Attendance.findById(id)
    .populate('student', 'studentId user')
    .populate('course', 'courseCode courseName');

  res.json({
    success: true,
    message: 'Attendance record updated successfully',
    data: { attendance: updatedAttendance }
  });
});

/**
 * Helper function to update enrollment attendance statistics
 */
const updateEnrollmentAttendance = async (studentId, courseId, semester, academicYear) => {
  const attendanceRecords = await Attendance.find({
    student: studentId,
    course: courseId,
    semester,
    academicYear
  });

  const totalClasses = attendanceRecords.length;
  const attendedClasses = attendanceRecords.filter(record => 
    ['present', 'late', 'partial'].includes(record.attendanceStatus.status)
  ).length;

  const attendancePercentage = totalClasses > 0 ? 
    Math.round((attendedClasses / totalClasses) * 100) : 100;

  await Enrollment.findOneAndUpdate(
    {
      student: studentId,
      course: courseId,
      semester,
      academicYear
    },
    {
      'attendanceInfo.totalClasses': totalClasses,
      'attendanceInfo.attendedClasses': attendedClasses,
      'attendanceInfo.attendancePercentage': attendancePercentage
    }
  );
};

module.exports = {
  recordAttendance,
  bulkRecordAttendance,
  getAttendanceRecords,
  getStudentAttendanceSummary,
  updateAttendanceRecord
};
