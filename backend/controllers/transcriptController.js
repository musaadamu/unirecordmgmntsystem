const { Transcript, Student, Grade, Course } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Generate transcript for student
 */
const generateTranscript = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { transcriptType = 'unofficial', purpose } = req.body;

  // Verify student exists
  const student = await Student.findById(studentId)
    .populate('user', 'personalInfo contactInfo email');
  
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const userStudent = await Student.findOne({ user: req.user._id });
    if (!userStudent || userStudent._id.toString() !== studentId) {
      throw new AppError('You can only generate your own transcript', 403);
    }
  }

  // Get all grades for the student
  const grades = await Grade.find({ 
    student: studentId,
    'gradeInfo.status': { $in: ['completed', 'in_progress'] }
  })
  .populate('course', 'courseCode courseName academicInfo.credits academicInfo.department')
  .sort({ academicYear: 1, semester: 1 });

  // Organize grades by semester
  const semesterRecords = {};
  let totalCreditsAttempted = 0;
  let totalCreditsEarned = 0;
  let totalQualityPoints = 0;

  grades.forEach(grade => {
    const semesterKey = `${grade.academicYear}-${grade.semester}`;
    
    if (!semesterRecords[semesterKey]) {
      semesterRecords[semesterKey] = {
        semester: grade.semester,
        academicYear: grade.academicYear,
        enrollmentStatus: 'full_time', // This would be determined by credit load
        courses: [],
        semesterCredits: { attempted: 0, earned: 0 },
        semesterGPA: 0,
        cumulativeCredits: { attempted: 0, earned: 0 },
        cumulativeGPA: 0
      };
    }

    const credits = grade.gradeInfo.finalGrade.credits || grade.course.academicInfo.credits || 0;
    const letterGrade = grade.gradeInfo.finalGrade.letterGrade || 'I';
    const gradePoints = grade.gradeInfo.finalGrade.gradePoints || 0;
    const qualityPoints = gradePoints * credits;

    semesterRecords[semesterKey].courses.push({
      course: grade.course._id,
      courseCode: grade.course.courseCode,
      courseName: grade.course.courseName,
      credits,
      grade: {
        letter: letterGrade,
        points: gradePoints,
        numeric: grade.gradeInfo.finalGrade.numericGrade
      },
      gradePoints,
      qualityPoints,
      status: grade.gradeInfo.status,
      transferCredit: false
    });

    semesterRecords[semesterKey].semesterCredits.attempted += credits;
    
    if (['completed'].includes(grade.gradeInfo.status) && !['F', 'I', 'W'].includes(letterGrade)) {
      semesterRecords[semesterKey].semesterCredits.earned += credits;
      totalCreditsEarned += credits;
    }
    
    totalCreditsAttempted += credits;
    totalQualityPoints += qualityPoints;
  });

  // Calculate GPAs
  const cumulativeGPA = totalCreditsEarned > 0 ? (totalQualityPoints / totalCreditsEarned) : 0;
  
  // Calculate semester and cumulative stats
  let runningCreditsAttempted = 0;
  let runningCreditsEarned = 0;
  let runningQualityPoints = 0;

  Object.keys(semesterRecords).sort().forEach(semesterKey => {
    const semester = semesterRecords[semesterKey];
    
    // Calculate semester GPA
    const semesterQualityPoints = semester.courses.reduce((sum, course) => 
      sum + (course.qualityPoints || 0), 0
    );
    const semesterCreditsEarned = semester.courses.reduce((sum, course) => 
      sum + (course.status === 'completed' && !['F', 'I', 'W'].includes(course.grade.letter) ? course.credits : 0), 0
    );
    
    semester.semesterGPA = semesterCreditsEarned > 0 ? (semesterQualityPoints / semesterCreditsEarned) : 0;
    
    // Update running totals
    runningCreditsAttempted += semester.semesterCredits.attempted;
    runningCreditsEarned += semester.semesterCredits.earned;
    runningQualityPoints += semesterQualityPoints;
    
    semester.cumulativeCredits.attempted = runningCreditsAttempted;
    semester.cumulativeCredits.earned = runningCreditsEarned;
    semester.cumulativeGPA = runningCreditsEarned > 0 ? (runningQualityPoints / runningCreditsEarned) : 0;
  });

  // Calculate academic standing
  const academicStanding = calculateAcademicStanding(cumulativeGPA);

  // Generate security features for official transcripts
  const securityCode = transcriptType === 'official' ? 
    crypto.randomBytes(8).toString('hex').toUpperCase() : null;
  const documentHash = transcriptType === 'official' ? 
    crypto.createHash('sha256').update(`${studentId}-${Date.now()}`).digest('hex') : null;

  // Create transcript record
  const transcript = new Transcript({
    student: studentId,
    transcriptInfo: {
      transcriptType,
      status: 'active',
      requestedBy: req.user._id,
      purpose
    },
    academicSummary: {
      totalCreditsAttempted,
      totalCreditsEarned,
      cumulativeGPA: parseFloat(cumulativeGPA.toFixed(2)),
      academicStanding,
      degreeConferred: student.academicStatus.status === 'graduated' ? {
        degree: student.academicInfo.program,
        major: student.academicInfo.department,
        conferralDate: student.academicInfo.expectedGraduation
      } : undefined
    },
    semesterRecords: Object.values(semesterRecords),
    degreeProgress: await calculateDegreeProgress(student),
    documentInfo: {
      generatedBy: req.user._id,
      securityCode,
      documentHash,
      verificationUrl: securityCode ? 
        `${process.env.FRONTEND_URL}/verify-transcript?code=${securityCode}` : null
    },
    createdBy: req.user._id
  });

  await transcript.save();

  logger.audit('Transcript generated', req.user._id, {
    transcriptId: transcript._id,
    studentId,
    transcriptType,
    purpose
  });

  res.status(201).json({
    success: true,
    message: 'Transcript generated successfully',
    data: {
      transcript,
      verificationInfo: transcriptType === 'official' ? {
        securityCode,
        verificationUrl: transcript.documentInfo.verificationUrl
      } : null
    }
  });
});

/**
 * Get transcript by ID
 */
const getTranscriptById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const transcript = await Transcript.findById(id)
    .populate('student', 'studentId user academicInfo')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo contactInfo email'
      }
    })
    .populate('transcriptInfo.requestedBy', 'personalInfo.firstName personalInfo.lastName email');

  if (!transcript) {
    throw new AppError('Transcript not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || transcript.student._id.toString() !== student._id.toString()) {
      throw new AppError('You can only access your own transcripts', 403);
    }
  }

  // Update download count
  transcript.documentInfo.downloadCount += 1;
  transcript.documentInfo.lastDownloaded = new Date();
  await transcript.save();

  logger.audit('Transcript accessed', req.user._id, {
    transcriptId: id,
    studentId: transcript.student._id
  });

  res.json({
    success: true,
    data: { transcript }
  });
});

/**
 * Get all transcripts for a student
 */
const getStudentTranscripts = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { transcriptType, status } = req.query;

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      throw new AppError('You can only access your own transcripts', 403);
    }
  }

  const filter = { student: studentId };
  if (transcriptType) filter['transcriptInfo.transcriptType'] = transcriptType;
  if (status) filter['transcriptInfo.status'] = status;

  const transcripts = await Transcript.find(filter)
    .populate('transcriptInfo.requestedBy', 'personalInfo.firstName personalInfo.lastName')
    .sort({ createdAt: -1 });

  logger.audit('Student transcripts retrieved', req.user._id, {
    studentId,
    count: transcripts.length
  });

  res.json({
    success: true,
    data: {
      transcripts,
      count: transcripts.length
    }
  });
});

/**
 * Verify transcript authenticity
 */
const verifyTranscript = catchAsync(async (req, res) => {
  const { securityCode } = req.params;

  if (!securityCode) {
    throw new AppError('Security code is required', 400);
  }

  const transcript = await Transcript.findOne({
    'documentInfo.securityCode': securityCode.toUpperCase(),
    'transcriptInfo.transcriptType': 'official'
  })
  .populate('student', 'studentId user')
  .populate({
    path: 'student',
    populate: {
      path: 'user',
      select: 'personalInfo'
    }
  });

  if (!transcript) {
    throw new AppError('Invalid security code or transcript not found', 404);
  }

  // Check if transcript has expired (if expiry date is set)
  if (transcript.documentInfo.expiryDate && 
      new Date() > transcript.documentInfo.expiryDate) {
    throw new AppError('Transcript verification has expired', 400);
  }

  logger.audit('Transcript verified', null, {
    transcriptId: transcript._id,
    securityCode,
    studentId: transcript.student._id,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Transcript verified successfully',
    data: {
      isValid: true,
      student: {
        name: transcript.student.user.personalInfo.firstName + ' ' + 
              transcript.student.user.personalInfo.lastName,
        studentId: transcript.student.studentId
      },
      transcriptInfo: {
        type: transcript.transcriptInfo.transcriptType,
        generatedDate: transcript.documentInfo.generatedDate,
        gpa: transcript.academicSummary.cumulativeGPA,
        totalCredits: transcript.academicSummary.totalCreditsEarned
      }
    }
  });
});

/**
 * Request official transcript
 */
const requestOfficialTranscript = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { 
    purpose, 
    deliveryMethod = 'electronic',
    recipientInfo 
  } = req.body;

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      throw new AppError('You can only request your own transcripts', 403);
    }
  }

  // Verify student exists and has no holds
  const student = await Student.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check for financial or academic holds (would implement hold checking here)
  
  // Generate official transcript
  const transcriptData = {
    transcriptType: 'official',
    purpose,
    deliveryMethod,
    recipientInfo
  };

  // This would call the generateTranscript function internally
  // For now, we'll create a simplified version
  const transcript = new Transcript({
    student: studentId,
    transcriptInfo: {
      transcriptType: 'official',
      status: 'processing',
      requestedBy: req.user._id,
      purpose
    },
    deliveryInfo: {
      deliveryMethod,
      recipientInfo,
      deliveryStatus: 'pending'
    },
    createdBy: req.user._id
  });

  await transcript.save();

  logger.audit('Official transcript requested', req.user._id, {
    transcriptId: transcript._id,
    studentId,
    deliveryMethod,
    purpose
  });

  res.status(201).json({
    success: true,
    message: 'Official transcript request submitted successfully',
    data: {
      requestId: transcript._id,
      status: 'processing',
      estimatedDelivery: deliveryMethod === 'electronic' ? '1-2 business days' : '5-7 business days'
    }
  });
});

/**
 * Helper function to calculate academic standing
 */
const calculateAcademicStanding = (gpa) => {
  if (gpa >= 3.5) return 'honors';
  if (gpa >= 3.0) return 'good_standing';
  if (gpa >= 2.0) return 'good_standing';
  if (gpa >= 1.5) return 'probation';
  return 'suspension';
};

/**
 * Helper function to calculate degree progress
 */
const calculateDegreeProgress = async (student) => {
  // This would implement complex degree requirement checking
  // For now, return a simplified version
  const totalRequiredCredits = 120; // Typical bachelor's degree
  const completedCredits = student.academicStatus.completedCredits || 0;
  
  return {
    program: student.academicInfo.program,
    major: student.academicInfo.department,
    totalRequiredCredits,
    completedCredits,
    remainingCredits: Math.max(0, totalRequiredCredits - completedCredits),
    expectedGraduation: student.academicInfo.expectedGraduation,
    requirements: [
      {
        category: 'General Education',
        description: 'Core curriculum requirements',
        requiredCredits: 30,
        completedCredits: Math.min(30, completedCredits * 0.25),
        courses: []
      },
      {
        category: 'Major Requirements',
        description: 'Major-specific courses',
        requiredCredits: 60,
        completedCredits: Math.min(60, completedCredits * 0.5),
        courses: []
      },
      {
        category: 'Electives',
        description: 'Free elective courses',
        requiredCredits: 30,
        completedCredits: Math.min(30, completedCredits * 0.25),
        courses: []
      }
    ]
  };
};

module.exports = {
  generateTranscript,
  getTranscriptById,
  getStudentTranscripts,
  verifyTranscript,
  requestOfficialTranscript
};
