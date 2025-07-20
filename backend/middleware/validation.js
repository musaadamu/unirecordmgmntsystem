const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (fieldName = 'id') => [
  param(fieldName)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    })
];

/**
 * Common validation rules
 */
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  name: (fieldName) => body(fieldName)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${fieldName} must be between 2 and 50 characters long`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${fieldName} must contain only letters and spaces`),
    
  phone: (fieldName = 'phone') => body(fieldName)
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  date: (fieldName) => body(fieldName)
    .isISO8601()
    .withMessage(`Please provide a valid ${fieldName}`),
    
  positiveNumber: (fieldName) => body(fieldName)
    .isFloat({ min: 0 })
    .withMessage(`${fieldName} must be a positive number`),
    
  requiredString: (fieldName) => body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`),
    
  optionalString: (fieldName) => body(fieldName)
    .optional()
    .trim(),
    
  enumValue: (fieldName, allowedValues) => body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`),
    
  gpa: body('gpa')
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0 and 4'),
    
  credits: (fieldName = 'credits') => body(fieldName)
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
    
  grade: body('grade')
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP'])
    .withMessage('Invalid grade value'),
    
  academicYear: body('academicYear')
    .matches(/^\d{4}$/)
    .withMessage('Academic year must be a 4-digit year'),
    
  semester: body('semester')
    .isIn(['fall', 'spring', 'summer'])
    .withMessage('Semester must be fall, spring, or summer')
};

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

/**
 * Search validation
 */
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('fields')
    .optional()
    .isString()
    .withMessage('Fields must be a string')
];

/**
 * Date range validation
 */
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

/**
 * File upload validation
 */
const validateFileUpload = [
  body('fileType')
    .optional()
    .isIn(['image', 'document', 'pdf'])
    .withMessage('Invalid file type'),
  body('maxSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max size must be a positive integer')
];

/**
 * User registration validation
 */
const validateUserRegistration = [
  commonValidations.email,
  commonValidations.password,
  commonValidations.name('personalInfo.firstName'),
  commonValidations.name('personalInfo.lastName'),
  commonValidations.date('personalInfo.dateOfBirth'),
  commonValidations.enumValue('personalInfo.gender', ['male', 'female', 'other']),
  commonValidations.requiredString('personalInfo.nationality'),
  commonValidations.phone('contactInfo.phone'),
  commonValidations.enumValue('role', ['student', 'academic_staff', 'support_staff', 'admin', 'super_admin'])
];

/**
 * Course validation
 */
const validateCourse = [
  commonValidations.requiredString('courseCode'),
  commonValidations.requiredString('courseName'),
  commonValidations.requiredString('description'),
  commonValidations.requiredString('academicInfo.department'),
  commonValidations.requiredString('academicInfo.faculty'),
  commonValidations.enumValue('academicInfo.level', ['undergraduate', 'graduate', 'postgraduate']),
  commonValidations.credits('academicInfo.credits'),
  commonValidations.positiveNumber('maxEnrollment')
];

/**
 * Grade validation
 */
const validateGrade = [
  validateObjectId('studentId'),
  validateObjectId('courseId'),
  commonValidations.semester,
  commonValidations.academicYear,
  commonValidations.grade,
  commonValidations.positiveNumber('numericGrade'),
  commonValidations.credits()
];

/**
 * Enrollment validation
 */
const validateEnrollment = [
  validateObjectId('studentId'),
  validateObjectId('courseId'),
  commonValidations.semester,
  commonValidations.academicYear,
  commonValidations.requiredString('section'),
  commonValidations.enumValue('enrollmentType', ['regular', 'late', 'add_drop', 'waitlist', 'audit'])
];

/**
 * Payment validation
 */
const validatePayment = [
  validateObjectId('studentId'),
  commonValidations.enumValue('type', ['tuition', 'fees', 'housing', 'meal_plan', 'parking', 'library', 'lab', 'graduation', 'transcript', 'other']),
  commonValidations.requiredString('description'),
  commonValidations.academicYear,
  commonValidations.positiveNumber('originalAmount'),
  commonValidations.date('dueDate')
];

/**
 * Custom validation for specific business rules
 */
const customValidations = {
  // Validate that a student can enroll in a course
  validateEnrollmentEligibility: async (req, res, next) => {
    // This would contain business logic to check prerequisites, capacity, etc.
    // Implementation would depend on specific business rules
    next();
  },
  
  // Validate grade submission permissions
  validateGradeSubmission: async (req, res, next) => {
    // Check if the user has permission to submit grades for this course
    next();
  },
  
  // Validate payment processing
  validatePaymentProcessing: async (req, res, next) => {
    // Check payment amount, method, etc.
    next();
  }
};

module.exports = {
  handleValidationErrors,
  validateObjectId,
  commonValidations,
  validatePagination,
  validateSearch,
  validateDateRange,
  validateFileUpload,
  validateUserRegistration,
  validateCourse,
  validateGrade,
  validateEnrollment,
  validatePayment,
  customValidations
};
