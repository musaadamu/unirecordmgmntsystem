const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/course-offerings
 * @desc    Get all course offerings (flattened view)
 * @access  Private
 */
router.get('/', courseController.getAllCourseOfferings);

/**
 * @route   POST /api/course-offerings
 * @desc    Add a new course offering
 * @access  Private
 */
router.post('/', courseController.addCourseOfferingGlobal);

/**
 * @route   GET /api/course-offerings/:id
 * @desc    Get a single course offering by ID
 * @access  Private
 */
router.get('/:id', courseController.getCourseOfferingById);

/**
 * @route   PUT /api/course-offerings/:id
 * @desc    Update a course offering
 * @access  Private
 */
router.put('/:id', courseController.updateCourseOfferingGlobal);

/**
 * @route   DELETE /api/course-offerings/:id
 * @desc    Delete a course offering
 * @access  Private
 */
router.delete('/:id', courseController.deleteCourseOfferingGlobal);

module.exports = router;
