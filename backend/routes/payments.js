const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public routes (with authentication)
router.get('/stats', authenticate, paymentController.getPaymentStats);
router.get('/', authenticate, paymentController.getAllPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);

// Admin/Finance routes
router.post('/', authenticate, requireRole('admin', 'finance'), paymentController.createPayment);
router.put('/:id/process', authenticate, requireRole('admin', 'finance'), paymentController.processPayment);
router.put('/:id/payment-plan', authenticate, requireRole('admin', 'finance'), paymentController.setupPaymentPlan);
router.post('/:id/refund', authenticate, requireRole('admin', 'finance'), paymentController.processRefund);

module.exports = router;
