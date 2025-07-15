const express = require('express');
const { body, param } = require('express-validator');

const gradeController = require('../controllers/gradeController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateObjectId, 
  validatePagination,
  validateGrade,
  handleValidationErrors 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/grades
 * @desc    Get all grades with filtering and pagination
 * @access  Private
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  gradeController.getAllGrades
);

/**
 * @route   GET /api/grades/:id
 * @desc    Get grade by ID
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  gradeController.getGradeById
);

/**
 * @route   POST /api/grades
 * @desc    Create or update grade
 * @access  Private (Academic Staff/Admin)
 */
router.post('/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  [
    body('studentId')
      .isMongoId()
      .withMessage('Valid student ID is required'),
    body('courseId')
      .isMongoId()
      .withMessage('Valid course ID is required'),
    body('semester')
      .isIn(['fall', 'spring', 'summer'])
      .withMessage('Valid semester is required'),
    body('academicYear')
      .matches(/^\d{4}$/)
      .withMessage('Valid academic year is required'),
    body('gradeInfo')
      .isObject()
      .withMessage('Grade information is required'),
    body('gradeInfo.assessments')
      .optional()
      .isArray()
      .withMessage('Assessments must be an array'),
    body('gradeInfo.assessments.*.type')
      .optional()
      .isIn(['assignment', 'quiz', 'midterm', 'final', 'project', 'participation'])
      .withMessage('Valid assessment type is required'),
    body('gradeInfo.assessments.*.earnedPoints')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Earned points must be a positive number'),
    body('gradeInfo.assessments.*.maxPoints')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max points must be a positive number'),
    body('gradeInfo.finalGrade.letterGrade')
      .optional()
      .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP'])
      .withMessage('Valid letter grade is required')
  ],
  handleValidationErrors,
  gradeController.createOrUpdateGrade
);

/**
 * @route   POST /api/grades/:id/appeal
 * @desc    Submit grade appeal
 * @access  Private (Student - own grades only)
 */
router.post('/:id/appeal',
  validateObjectId('id'),
  [
    body('reason')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters')
  ],
  handleValidationErrors,
  gradeController.submitGradeAppeal
);

/**
 * @route   PUT /api/grades/:id/appeal/:appealId
 * @desc    Process grade appeal
 * @access  Private (Academic Staff/Admin)
 */
router.put('/:id/appeal/:appealId',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  validateObjectId('appealId'),
  [
    body('decision')
      .isIn(['approved', 'denied'])
      .withMessage('Decision must be approved or denied'),
    body('comments')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comments must be between 10 and 1000 characters'),
    body('finalGrade')
      .optional()
      .isObject()
      .withMessage('Final grade must be an object'),
    body('finalGrade.numeric')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Numeric grade must be between 0 and 100')
  ],
  handleValidationErrors,
  gradeController.processGradeAppeal
);

/**
 * @route   GET /api/grades/student/:studentId/summary
 * @desc    Get student grades summary
 * @access  Private (Student - own summary, Staff/Admin - any student)
 */
router.get('/student/:studentId/summary',
  validateObjectId('studentId'),
  handleValidationErrors,
  gradeController.getStudentGradesSummary
);

module.exports = router;
