const express = require('express');
const { body } = require('express-validator');

const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateObjectId, 
  validatePagination,
  validateEnrollment,
  handleValidationErrors 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments with filtering and pagination
 * @access  Private
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  enrollmentController.getAllEnrollments
);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  enrollmentController.getEnrollmentById
);

/**
 * @route   POST /api/enrollments
 * @desc    Create new enrollment (course registration)
 * @access  Private
 */
router.post('/',
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
    body('section')
      .trim()
      .isLength({ min: 1, max: 10 })
      .withMessage('Valid section is required'),
    body('enrollmentType')
      .optional()
      .isIn(['regular', 'late', 'add_drop', 'waitlist', 'audit'])
      .withMessage('Valid enrollment type is required')
  ],
  handleValidationErrors,
  enrollmentController.createEnrollment
);

/**
 * @route   PUT /api/enrollments/:id/status
 * @desc    Update enrollment status
 * @access  Private
 */
router.put('/:id/status',
  validateObjectId('id'),
  [
    body('status')
      .isIn(['enrolled', 'dropped', 'withdrawn', 'completed', 'failed', 'audit'])
      .withMessage('Valid status is required'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters')
  ],
  handleValidationErrors,
  enrollmentController.updateEnrollmentStatus
);

/**
 * @route   GET /api/enrollments/student/:studentId/current
 * @desc    Get student's current enrollments
 * @access  Private (Student - own enrollments, Staff/Admin - any student)
 */
router.get('/student/:studentId/current',
  validateObjectId('studentId'),
  handleValidationErrors,
  enrollmentController.getStudentCurrentEnrollments
);

/**
 * @route   GET /api/enrollments/stats
 * @desc    Get enrollment statistics
 * @access  Private (Staff/Admin)
 */
router.get('/stats',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  enrollmentController.getEnrollmentStats
);

module.exports = router;
