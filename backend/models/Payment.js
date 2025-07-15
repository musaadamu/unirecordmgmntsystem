const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  // Student Reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  // Payment Basic Information
  paymentInfo: {
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['tuition', 'fees', 'housing', 'meal_plan', 'parking', 'library', 'lab', 'graduation', 'transcript', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      enum: ['fall', 'spring', 'summer', 'annual']
    }
  },

  // Amount Information
  amountInfo: {
    originalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    scholarshipAmount: {
      type: Number,
      default: 0
    },
    financialAidAmount: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Payment Status and Dates
  statusInfo: {
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    dueDate: {
      type: Date,
      required: true
    },
    paymentDate: Date,
    lastPaymentDate: Date,
    overdueDate: Date,
    isOverdue: {
      type: Boolean,
      default: false
    },
    daysPastDue: {
      type: Number,
      default: 0
    }
  },

  // Payment Methods and Transactions
  transactions: [{
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'money_order', 'online', 'financial_aid'],
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    processingFee: {
      type: Number,
      default: 0
    },
    gatewayResponse: {
      gatewayId: String,
      responseCode: String,
      responseMessage: String,
      authorizationCode: String
    },
    receiptNumber: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],

  // Refund Information
  refunds: [{
    refundId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true
    },
    refundDate: {
      type: Date,
      default: Date.now
    },
    refundMethod: {
      type: String,
      enum: ['original_payment_method', 'check', 'bank_transfer', 'credit_to_account'],
      required: true
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],

  // Payment Plan Information
  paymentPlan: {
    isPaymentPlan: {
      type: Boolean,
      default: false
    },
    planType: {
      type: String,
      enum: ['monthly', 'quarterly', 'custom']
    },
    numberOfInstallments: Number,
    installmentAmount: Number,
    setupFee: {
      type: Number,
      default: 0
    },
    installments: [{
      installmentNumber: Number,
      amount: Number,
      dueDate: Date,
      paidDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
      },
      lateFee: {
        type: Number,
        default: 0
      }
    }]
  },

  // Financial Aid and Scholarships
  financialAid: [{
    type: {
      type: String,
      enum: ['federal_grant', 'state_grant', 'institutional_grant', 'scholarship', 'work_study', 'loan'],
      required: true
    },
    name: String,
    amount: Number,
    disbursementDate: Date,
    academicYear: String,
    semester: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'disbursed', 'cancelled'],
      default: 'pending'
    },
    conditions: [String],
    renewable: Boolean
  }],

  // Late Fees and Penalties
  lateFees: [{
    amount: Number,
    assessedDate: Date,
    reason: String,
    waived: {
      type: Boolean,
      default: false
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waiverReason: String,
    waiverDate: Date
  }],

  // Hold Information
  holds: [{
    holdType: {
      type: String,
      enum: ['financial', 'academic', 'administrative', 'disciplinary'],
      required: true
    },
    reason: String,
    placedDate: {
      type: Date,
      default: Date.now
    },
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    removedDate: Date,
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    restrictions: [String]
  }],

  // Communication and Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['payment_due', 'payment_received', 'payment_overdue', 'payment_plan_setup', 'refund_processed'],
      required: true
    },
    message: String,
    sentDate: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'mail', 'portal'],
      required: true
    },
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredDate: Date
  }],

  // Metadata
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
paymentSchema.index({ student: 1 });
paymentSchema.index({ 'paymentInfo.paymentId': 1 });
paymentSchema.index({ 'paymentInfo.type': 1 });
paymentSchema.index({ 'paymentInfo.academicYear': 1 });
paymentSchema.index({ 'statusInfo.status': 1 });
paymentSchema.index({ 'statusInfo.dueDate': 1 });
paymentSchema.index({ 'statusInfo.isOverdue': 1 });
paymentSchema.index({ 'transactions.transactionId': 1 });

// Virtual for payment completion percentage
paymentSchema.virtual('paymentPercentage').get(function() {
  if (this.amountInfo.netAmount === 0) return 100;
  return Math.round((this.amountInfo.paidAmount / this.amountInfo.netAmount) * 100);
});

// Method to calculate overdue status
paymentSchema.methods.updateOverdueStatus = function() {
  const now = new Date();
  const dueDate = this.statusInfo.dueDate;
  
  if (now > dueDate && this.statusInfo.status !== PAYMENT_STATUS.PAID) {
    this.statusInfo.isOverdue = true;
    this.statusInfo.overdueDate = dueDate;
    this.statusInfo.daysPastDue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    
    if (this.statusInfo.status === PAYMENT_STATUS.PENDING) {
      this.statusInfo.status = PAYMENT_STATUS.OVERDUE;
    }
  }
};

// Method to calculate remaining amount
paymentSchema.methods.updateRemainingAmount = function() {
  this.amountInfo.remainingAmount = Math.max(0, this.amountInfo.netAmount - this.amountInfo.paidAmount);
  
  if (this.amountInfo.remainingAmount === 0) {
    this.statusInfo.status = PAYMENT_STATUS.PAID;
    this.statusInfo.paymentDate = new Date();
  }
};

module.exports = mongoose.model('Payment', paymentSchema);
