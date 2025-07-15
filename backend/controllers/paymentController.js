const { Payment, Student, Enrollment } = require('../models');
const { USER_ROLES, PAYMENT_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Get all payments with filtering and pagination
 */
const getAllPayments = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    studentId,
    type,
    status,
    academicYear,
    semester,
    isOverdue,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (studentId) filter.student = studentId;
  if (type) filter['paymentInfo.type'] = type;
  if (status) filter['statusInfo.status'] = status;
  if (academicYear) filter['paymentInfo.academicYear'] = academicYear;
  if (semester) filter['paymentInfo.semester'] = semester;
  if (isOverdue === 'true') filter['statusInfo.isOverdue'] = true;

  // For students, only show their own payments
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      filter.student = student._id;
    } else {
      return res.json({
        success: true,
        data: { payments: [], pagination: { currentPage: 1, totalPages: 0, totalPayments: 0 } }
      });
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query with population
  const payments = await Payment.find(filter)
    .populate('student', 'studentId user')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo.firstName personalInfo.lastName email'
      }
    })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(filter);

  // Update overdue status for all payments
  await updateOverduePayments();

  logger.audit('Payments retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get payment by ID
 */
const getPaymentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id)
    .populate('student', 'studentId user academicInfo')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'personalInfo contactInfo email'
      }
    });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check permissions
  if (req.user.role === USER_ROLES.STUDENT) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || payment.student._id.toString() !== student._id.toString()) {
      throw new AppError('You can only access your own payment records', 403);
    }
  }

  // Update overdue status
  payment.updateOverdueStatus();
  await payment.save();

  logger.audit('Payment retrieved', req.user._id, {
    paymentId: id,
    studentId: payment.student._id
  });

  res.json({
    success: true,
    data: { payment }
  });
});

/**
 * Create new payment record
 */
const createPayment = catchAsync(async (req, res) => {
  const {
    studentId,
    type,
    description,
    academicYear,
    semester,
    originalAmount,
    dueDate,
    discountAmount = 0,
    scholarshipAmount = 0,
    financialAidAmount = 0
  } = req.body;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Calculate net amount
  const netAmount = originalAmount - discountAmount - scholarshipAmount - financialAidAmount;

  if (netAmount < 0) {
    throw new AppError('Net amount cannot be negative', 400);
  }

  // Generate unique payment ID
  const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  const payment = new Payment({
    student: studentId,
    paymentInfo: {
      paymentId,
      type,
      description,
      academicYear,
      semester
    },
    amountInfo: {
      originalAmount,
      discountAmount,
      scholarshipAmount,
      financialAidAmount,
      netAmount,
      remainingAmount: netAmount
    },
    statusInfo: {
      status: PAYMENT_STATUS.PENDING,
      dueDate: new Date(dueDate)
    },
    createdBy: req.user._id
  });

  await payment.save();

  logger.audit('Payment created', req.user._id, {
    paymentId: payment._id,
    studentId,
    type,
    amount: netAmount
  });

  const populatedPayment = await Payment.findById(payment._id)
    .populate('student', 'studentId user');

  res.status(201).json({
    success: true,
    message: 'Payment record created successfully',
    data: { payment: populatedPayment }
  });
});

/**
 * Process payment transaction
 */
const processPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    paymentMethod,
    transactionId,
    gatewayResponse,
    receiptNumber
  } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Validate payment amount
  if (amount <= 0) {
    throw new AppError('Payment amount must be positive', 400);
  }

  if (amount > payment.amountInfo.remainingAmount) {
    throw new AppError('Payment amount exceeds remaining balance', 400);
  }

  // Generate transaction ID if not provided
  const finalTransactionId = transactionId || 
    `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Create transaction record
  const transaction = {
    transactionId: finalTransactionId,
    amount,
    paymentMethod,
    paymentDate: new Date(),
    transactionStatus: 'completed',
    gatewayResponse: gatewayResponse || {},
    receiptNumber,
    processedBy: req.user._id
  };

  payment.transactions.push(transaction);

  // Update payment amounts
  payment.amountInfo.paidAmount += amount;
  payment.amountInfo.remainingAmount = Math.max(0, 
    payment.amountInfo.netAmount - payment.amountInfo.paidAmount
  );

  // Update payment status
  if (payment.amountInfo.remainingAmount === 0) {
    payment.statusInfo.status = PAYMENT_STATUS.PAID;
    payment.statusInfo.paymentDate = new Date();
    payment.statusInfo.isOverdue = false;
  }

  payment.statusInfo.lastPaymentDate = new Date();
  payment.updatedBy = req.user._id;

  await payment.save();

  // Remove any financial holds if payment is complete
  if (payment.statusInfo.status === PAYMENT_STATUS.PAID) {
    await removeFinancialHolds(payment.student);
  }

  logger.audit('Payment processed', req.user._id, {
    paymentId: id,
    transactionId: finalTransactionId,
    amount,
    paymentMethod,
    remainingBalance: payment.amountInfo.remainingAmount
  });

  const updatedPayment = await Payment.findById(id)
    .populate('student', 'studentId user');

  res.json({
    success: true,
    message: 'Payment processed successfully',
    data: {
      payment: updatedPayment,
      transaction: transaction,
      remainingBalance: payment.amountInfo.remainingAmount
    }
  });
});

/**
 * Set up payment plan
 */
const setupPaymentPlan = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    planType,
    numberOfInstallments,
    setupFee = 0
  } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.statusInfo.status === PAYMENT_STATUS.PAID) {
    throw new AppError('Cannot set up payment plan for completed payment', 400);
  }

  if (payment.paymentPlan.isPaymentPlan) {
    throw new AppError('Payment plan already exists for this payment', 400);
  }

  // Calculate installment amount
  const totalAmount = payment.amountInfo.remainingAmount + setupFee;
  const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);

  // Generate installment schedule
  const installments = [];
  const startDate = new Date();

  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    
    if (planType === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + i + 1);
    } else if (planType === 'quarterly') {
      dueDate.setMonth(dueDate.getMonth() + (i + 1) * 3);
    }

    installments.push({
      installmentNumber: i + 1,
      amount: i === numberOfInstallments - 1 ? 
        totalAmount - (installmentAmount * (numberOfInstallments - 1)) : 
        installmentAmount,
      dueDate,
      status: 'pending'
    });
  }

  // Update payment with plan details
  payment.paymentPlan = {
    isPaymentPlan: true,
    planType,
    numberOfInstallments,
    installmentAmount,
    setupFee,
    installments
  };

  payment.updatedBy = req.user._id;
  await payment.save();

  logger.audit('Payment plan created', req.user._id, {
    paymentId: id,
    planType,
    numberOfInstallments,
    installmentAmount
  });

  res.json({
    success: true,
    message: 'Payment plan set up successfully',
    data: {
      paymentPlan: payment.paymentPlan
    }
  });
});

/**
 * Process refund
 */
const processRefund = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    reason,
    refundMethod = 'original_payment_method'
  } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Validate refund amount
  if (amount <= 0) {
    throw new AppError('Refund amount must be positive', 400);
  }

  if (amount > payment.amountInfo.paidAmount) {
    throw new AppError('Refund amount exceeds paid amount', 400);
  }

  // Generate refund ID
  const refundId = `REF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Create refund record
  const refund = {
    refundId,
    amount,
    reason,
    refundMethod,
    refundStatus: 'completed',
    processedBy: req.user._id,
    approvedBy: req.user._id
  };

  payment.refunds.push(refund);

  // Update payment amounts
  payment.amountInfo.paidAmount -= amount;
  payment.amountInfo.remainingAmount += amount;

  // Update payment status if needed
  if (payment.statusInfo.status === PAYMENT_STATUS.PAID && payment.amountInfo.remainingAmount > 0) {
    payment.statusInfo.status = PAYMENT_STATUS.PARTIAL;
  }

  payment.updatedBy = req.user._id;
  await payment.save();

  logger.audit('Refund processed', req.user._id, {
    paymentId: id,
    refundId,
    amount,
    reason
  });

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      refund,
      updatedBalance: {
        paidAmount: payment.amountInfo.paidAmount,
        remainingAmount: payment.amountInfo.remainingAmount
      }
    }
  });
});

/**
 * Get payment statistics
 */
const getPaymentStats = catchAsync(async (req, res) => {
  const { academicYear, semester } = req.query;

  const matchStage = {};
  if (academicYear) matchStage['paymentInfo.academicYear'] = academicYear;
  if (semester) matchStage['paymentInfo.semester'] = semester;

  const stats = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$statusInfo.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amountInfo.netAmount' },
        paidAmount: { $sum: '$amountInfo.paidAmount' },
        remainingAmount: { $sum: '$amountInfo.remainingAmount' }
      }
    }
  ]);

  const typeStats = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentInfo.type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amountInfo.netAmount' },
        paidAmount: { $sum: '$amountInfo.paidAmount' }
      }
    }
  ]);

  const overduePayments = await Payment.countDocuments({
    ...matchStage,
    'statusInfo.isOverdue': true
  });

  logger.audit('Payment statistics retrieved', req.user._id, {
    academicYear,
    semester
  });

  res.json({
    success: true,
    data: {
      statusStats: stats,
      typeStats,
      overdueCount: overduePayments,
      period: { academicYear, semester }
    }
  });
});

/**
 * Helper function to update overdue payments
 */
const updateOverduePayments = async () => {
  const now = new Date();
  
  await Payment.updateMany(
    {
      'statusInfo.dueDate': { $lt: now },
      'statusInfo.status': { $nin: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CANCELLED] },
      'statusInfo.isOverdue': false
    },
    {
      $set: {
        'statusInfo.isOverdue': true,
        'statusInfo.overdueDate': '$statusInfo.dueDate'
      }
    }
  );
};

/**
 * Helper function to remove financial holds
 */
const removeFinancialHolds = async (studentId) => {
  await Payment.updateMany(
    {
      student: studentId,
      'holds.holdType': 'financial',
      'holds.isActive': true
    },
    {
      $set: {
        'holds.$.isActive': false,
        'holds.$.removedDate': new Date()
      }
    }
  );
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  processPayment,
  setupPaymentPlan,
  processRefund,
  getPaymentStats
};
