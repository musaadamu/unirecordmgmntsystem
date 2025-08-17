const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard API routes
router.get('/user-analytics', dashboardController.getUserAnalytics);
router.get('/enrollment-trends', dashboardController.getEnrollmentTrends);
router.get('/department-stats', dashboardController.getDepartmentStats);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/payment-analytics', dashboardController.getPaymentAnalytics);
router.get('/academic-analytics', dashboardController.getAcademicAnalytics);
router.get('/overview', dashboardController.getOverview);

module.exports = router;
