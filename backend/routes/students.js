const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateObjectId, 
  validatePagination, 
  validateSearch,
  handleValidationErrors 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/students
 * @desc    Get all students with pagination and filtering
 * @access  Private (Admin/Staff)
 */
router.get('/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  validatePagination,
  handleValidationErrors,
  studentController.getAllStudents
);

/**
 * @route   GET /api/students/stats
 * @desc    Get student statistics
 * @access  Private (Admin/Staff)
 */
router.get('/stats',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  studentController.getStudentStats
);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private (Admin/Staff or own record)
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  studentController.getStudentById
);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student information
 * @access  Private (Admin/Staff or own record)
 */
router.put('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  studentController.updateStudent
);

/**
 * @route   GET /api/students/:id/academic-summary
 * @desc    Get student academic summary
 * @access  Private (Admin/Staff or own record)
 */
router.get('/:id/academic-summary',
  validateObjectId('id'),
  handleValidationErrors,
  studentController.getStudentAcademicSummary
);

module.exports = router;
