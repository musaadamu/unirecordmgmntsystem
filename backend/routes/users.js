const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
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
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin/Staff)
 */
router.get('/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  validatePagination,
  handleValidationErrors,
  userController.getAllUsers
);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private (Admin/Staff)
 */
router.get('/search',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  validateSearch,
  handleValidationErrors,
  userController.searchUsers
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  userController.getUserStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin/Staff or own profile)
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or own profile)
 */
router.put('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete('/:id',
  authorize(USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  userController.deleteUser
);

module.exports = router;
