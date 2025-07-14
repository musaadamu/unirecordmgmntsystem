const express = require('express');
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateObjectId, 
  validatePagination, 
  validateSearch,
  validateCourse,
  handleValidationErrors 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/courses
 * @desc    Get all courses with pagination and filtering
 * @access  Private
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  courseController.getAllCourses
);

/**
 * @route   GET /api/courses/stats
 * @desc    Get course statistics
 * @access  Private (Admin/Staff)
 */
router.get('/stats',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  courseController.getCourseStats
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  courseController.getCourseById
);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Admin/Academic Staff)
 */
router.post('/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateCourse,
  handleValidationErrors,
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Admin/Academic Staff)
 */
router.put('/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  handleValidationErrors,
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  courseController.deleteCourse
);

/**
 * @route   GET /api/courses/:id/enrollments
 * @desc    Get course enrollments
 * @access  Private (Admin/Staff/Instructor)
 */
router.get('/:id/enrollments',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  validateObjectId('id'),
  handleValidationErrors,
  courseController.getCourseEnrollments
);

module.exports = router;
