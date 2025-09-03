const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Student dashboard API routes
router.get('/stats', dashboardController.getStudentDashboardStats);
router.get('/upcoming-classes', dashboardController.getUpcomingClasses);
router.get('/assignments', dashboardController.getPendingAssignments);
router.get('/recent-grades', dashboardController.getRecentGrades);

module.exports = router;
