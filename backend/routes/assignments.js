const express = require('express');
const router = express.Router();
const assignmentsController = require('../controllers/assignmentsController');

// Assignments API routes
router.get('/pending', assignmentsController.getPendingAssignments);

module.exports = router;
