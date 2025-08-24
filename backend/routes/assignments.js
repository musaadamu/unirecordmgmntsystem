const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { requireRole } = require('../middleware/rbac');

// Draft auto-save
router.post('/:id/draft', requireRole(['student']), assignmentController.saveDraftSubmission);

// Bulk actions
router.post('/bulk-action', requireRole(['admin', 'instructor']), assignmentController.bulkAction);

// Notifications
router.get('/notifications', requireRole(['admin', 'instructor', 'student']), assignmentController.getNotifications);

// Analytics
router.get('/analytics', requireRole(['admin', 'instructor']), assignmentController.getAnalytics);

// Group submissions
router.post('/:id/group-submit', requireRole(['student']), assignmentController.groupSubmitAssignment);



// CRUD
router.get('/', requireRole(['admin', 'instructor', 'student']), assignmentController.listAssignments);
router.get('/:id', requireRole(['admin', 'instructor', 'student']), assignmentController.getAssignment);
router.post('/', requireRole(['admin', 'instructor']), assignmentController.createAssignment);
router.put('/:id', requireRole(['admin', 'instructor']), assignmentController.updateAssignment);
router.delete('/:id', requireRole(['admin', 'instructor']), assignmentController.deleteAssignment);

// Submissions
router.get('/:id/submissions', requireRole(['admin', 'instructor']), assignmentController.getAssignmentSubmissions);
router.post('/:id/submit', requireRole(['student']), assignmentController.submitAssignment);
router.put('/:id/grade', requireRole(['admin', 'instructor']), assignmentController.gradeSubmission);

// Specialized
router.get('/my-assignments', requireRole(['student']), assignmentController.getMyAssignments);
router.get('/my-created', requireRole(['instructor']), assignmentController.getMyCreatedAssignments);
router.post('/:id/extend-deadline', requireRole(['admin', 'instructor']), assignmentController.extendDeadline);

module.exports = router;
