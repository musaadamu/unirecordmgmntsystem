const express = require('express');
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { catchAsync } = require('../middleware/errorHandler');
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

// Debug: Check if controller methods exist
console.log('=== COURSE CONTROLLER DEBUG ===');
const requiredMethods = [
  'getAllCourses',
  'searchCourses', 
  'getCourseStats',
  'getCoursesByDepartment',
  'getActiveCourses',
  'getCourseById',
  'createCourse',
  'addCourseOffering',
  'updateCourse',
  'updateCourseStatus',
  'deleteCourse',
  'removeCourseOffering',
  'getCourseEnrollments',
  'getCoursePrerequisites',
  'getCourseSchedule',
  'createBulkCourses'
];

let missingMethods = [];
requiredMethods.forEach(method => {
  if (!courseController[method]) {
    console.error(`❌ Missing method: ${method}`);
    missingMethods.push(method);
  } else if (typeof courseController[method] !== 'function') {
    console.error(`❌ ${method} is not a function, it's a ${typeof courseController[method]}`);
    missingMethods.push(method);
  } else {
    console.log(`✅ ${method} is available`);
  }
});

// Helper function to safely handle missing controller methods
const safeController = (controllerMethod, methodName) => {
  if (!controllerMethod) {
    return (req, res) => {
      res.status(501).json({
        success: false,
        message: `Controller method '${methodName}' is not implemented`
      });
    };
  }
  return controllerMethod;
};

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/courses
 * @desc    Get all courses with pagination and filtering
 * @access  Private
 * @query   page, limit, department, faculty, level, status, semester, academicYear, search, sort, order
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  catchAsync(safeController(courseController.getAllCourses, 'getAllCourses'))
);

/**
 * @route   GET /api/courses/search
 * @desc    Search courses by various criteria
 * @access  Private
 * @query   q (search query), department, faculty, level
 */
router.get('/search',
  validateSearch,
  handleValidationErrors,
  catchAsync(safeController(courseController.searchCourses, 'searchCourses'))
);

/**
 * @route   GET /api/courses/stats
 * @desc    Get course statistics and analytics
 * @access  Private (Admin/Staff)
 */
router.get('/stats',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  catchAsync(safeController(courseController.getCourseStats, 'getCourseStats'))
);

/**
 * @route   GET /api/courses/departments
 * @desc    Get courses grouped by departments
 * @access  Private
 */
router.get('/departments',
  catchAsync(safeController(courseController.getCoursesByDepartment, 'getCoursesByDepartment'))
);

/**
 * @route   GET /api/courses/active
 * @desc    Get all active courses
 * @access  Private
 */
router.get('/active',
  validatePagination,
  handleValidationErrors,
  catchAsync(safeController(courseController.getActiveCourses, 'getActiveCourses'))
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID with full details
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  catchAsync(safeController(courseController.getCourseById, 'getCourseById'))
);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Admin/Academic Staff)
 * @body    courseCode, courseName, description, academicInfo, offerings
 */
router.post('/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  // Temporarily replace validateCourse with basic validation to avoid Promise issue
  [
    body('courseCode').notEmpty().withMessage('Course code is required'),
    body('courseName').notEmpty().withMessage('Course name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('academicInfo.credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('academicInfo.level').isIn(['100', '200', '300', '400', '500', '600']).withMessage('Invalid level'),
    body('academicInfo.department').notEmpty().withMessage('Department is required'),
    body('academicInfo.faculty').notEmpty().withMessage('Faculty is required')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.createCourse, 'createCourse'))
);

/**
 * @route   POST /api/courses/:id/offerings
 * @desc    Add new offering to existing course
 * @access  Private (Admin/Academic Staff)
 */
router.post('/:id/offerings',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  [
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('instructor').optional().isMongoId().withMessage('Invalid instructor ID'),
    body('schedule').optional().isArray().withMessage('Schedule must be an array'),
    body('maxStudents').optional().isInt({ min: 1 }).withMessage('Max students must be a positive integer'),
    body('venue').optional().notEmpty().withMessage('Venue cannot be empty if provided')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.addCourseOffering, 'addCourseOffering'))
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course information
 * @access  Private (Admin/Academic Staff)
 */
router.put('/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  [
    body('courseCode').optional().notEmpty().withMessage('Course code cannot be empty'),
    body('courseName').optional().notEmpty().withMessage('Course name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('academicInfo.credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('academicInfo.level').optional().isIn(['100', '200', '300', '400', '500', '600']).withMessage('Invalid level'),
    body('academicInfo.department').optional().notEmpty().withMessage('Department cannot be empty'),
    body('academicInfo.faculty').optional().notEmpty().withMessage('Faculty cannot be empty')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.updateCourse, 'updateCourse'))
);

/**
 * @route   PUT /api/courses/:id/status
 * @desc    Update course status (activate/deactivate/archive)
 * @access  Private (Admin/Academic Staff)
 */
router.put('/:id/status',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  [
    body('status').isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.updateCourseStatus, 'updateCourseStatus'))
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course (soft delete - archive)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  catchAsync(safeController(courseController.deleteCourse, 'deleteCourse'))
);

/**
 * @route   DELETE /api/courses/:id/offerings/:offeringId
 * @desc    Remove specific offering from course
 * @access  Private (Admin/Academic Staff)
 */
router.delete('/:id/offerings/:offeringId',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF),
  validateObjectId('id'),
  validateObjectId('offeringId'),
  handleValidationErrors,
  catchAsync(safeController(courseController.removeCourseOffering, 'removeCourseOffering'))
);

/**
 * @route   GET /api/courses/:id/enrollments
 * @desc    Get course enrollments with filtering options
 * @access  Private (Admin/Staff/Instructor)
 * @query   semester, academicYear, status
 */
router.get('/:id/enrollments',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF),
  validateObjectId('id'),
  handleValidationErrors,
  catchAsync(safeController(courseController.getCourseEnrollments, 'getCourseEnrollments'))
);

/**
 * @route   GET /api/courses/:id/prerequisites
 * @desc    Get course prerequisites and dependency tree
 * @access  Private
 */
router.get('/:id/prerequisites',
  validateObjectId('id'),
  handleValidationErrors,
  catchAsync(safeController(courseController.getCoursePrerequisites, 'getCoursePrerequisites'))
);

/**
 * @route   GET /api/courses/:id/schedule
 * @desc    Get course schedule for specific semester
 * @access  Private
 * @query   semester, academicYear
 */
router.get('/:id/schedule',
  validateObjectId('id'),
  [
    body('semester').optional().notEmpty().withMessage('Semester cannot be empty'),
    body('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.getCourseSchedule, 'getCourseSchedule'))
);

/**
 * @route   POST /api/courses/bulk
 * @desc    Create multiple courses at once
 * @access  Private (Admin only)
 */
router.post('/bulk',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  [
    body('courses').isArray({ min: 1 }).withMessage('Courses array is required and must not be empty'),
    body('courses.*.courseCode').notEmpty().withMessage('Course code is required for all courses'),
    body('courses.*.courseName').notEmpty().withMessage('Course name is required for all courses')
  ],
  handleValidationErrors,
  catchAsync(safeController(courseController.createBulkCourses, 'createBulkCourses'))
);

/**
 * Error handling middleware for this router
 */
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  next(err);
});

if (missingMethods.length > 0) {
  console.warn(`⚠️  Warning: ${missingMethods.length} controller methods are missing or invalid`);
  console.warn('Missing methods:', missingMethods);
  console.warn('These routes will return 501 status until implemented');
}

console.log('=== END COURSE CONTROLLER DEBUG ===');

module.exports = router;