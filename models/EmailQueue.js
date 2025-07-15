const mongoose = require('mongoose');

const emailQueueSchema = new mongoose.Schema({
  to: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  from: {
    email: {
      type: String,
      required: true,
      default: process.env.FROM_EMAIL || 'noreply@university.edu'
    },
    name: {
      type: String,
      default: 'University Record Management System'
    }
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  templateData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  htmlContent: {
    type: String
  },
  textContent: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: [
      'role_assignment',
      'permission_change',
      'security_alert',
      'system_maintenance',
      'account_update',
      'approval_request',
      'digest',
      'welcome',
      'reminder',
      'notification'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  lastError: {
    message: String,
    code: String,
    timestamp: Date
  },
  deliveryStatus: [{
    email: String,
    status: {
      type: String,
      enum: ['delivered', 'bounced', 'rejected', 'deferred', 'unknown']
    },
    timestamp: Date,
    reason: String
  }],
  metadata: {
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    eventId: String,
    batchId: String,
    source: {
      type: String,
      enum: ['manual', 'automatic', 'scheduled', 'api'],
      default: 'automatic'
    },
    tags: [String],
    customHeaders: {
      type: Map,
      of: String
    }
  },
  tracking: {
    messageId: String,
    opens: [{
      timestamp: Date,
      userAgent: String,
      ipAddress: String
    }],
    clicks: [{
      url: String,
      timestamp: Date,
      userAgent: String,
      ipAddress: String
    }],
    unsubscribes: [{
      timestamp: Date,
      reason: String,
      ipAddress: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and querying
emailQueueSchema.index({ status: 1, scheduledAt: 1 });
emailQueueSchema.index({ 'to.email': 1 });
emailQueueSchema.index({ 'to.userId': 1 });
emailQueueSchema.index({ category: 1, createdAt: -1 });
emailQueueSchema.index({ priority: 1, scheduledAt: 1 });
emailQueueSchema.index({ 'metadata.batchId': 1 });
emailQueueSchema.index({ 'metadata.eventId': 1 });
emailQueueSchema.index({ 'tracking.messageId': 1 });

// TTL index to automatically delete old processed emails (30 days)
emailQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Virtual for retry eligibility
emailQueueSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.attempts < this.maxAttempts;
});

// Virtual for processing delay (exponential backoff)
emailQueueSchema.virtual('nextRetryAt').get(function() {
  if (!this.canRetry) return null;
  
  const baseDelay = 60000; // 1 minute
  const delay = baseDelay * Math.pow(2, this.attempts);
  return new Date(this.updatedAt.getTime() + delay);
});

// Static method to get pending emails for processing
emailQueueSchema.statics.getPendingEmails = function(limit = 100) {
  return this.find({
    status: 'pending',
    scheduledAt: { $lte: new Date() }
  })
  .sort({ priority: -1, scheduledAt: 1 })
  .limit(limit)
  .populate('templateId');
};

// Static method to get failed emails eligible for retry
emailQueueSchema.statics.getRetryableEmails = function(limit = 50) {
  const now = new Date();
  
  return this.find({
    status: 'failed',
    attempts: { $lt: this.schema.paths.maxAttempts.default },
    updatedAt: { $lte: new Date(now.getTime() - 60000) } // At least 1 minute old
  })
  .sort({ priority: -1, updatedAt: 1 })
  .limit(limit);
};

// Static method to create email from template
emailQueueSchema.statics.createFromTemplate = async function(templateId, recipients, templateData, options = {}) {
  const EmailTemplate = mongoose.model('EmailTemplate');
  const template = await EmailTemplate.findById(templateId);
  
  if (!template) {
    throw new Error('Email template not found');
  }
  
  const email = new this({
    to: Array.isArray(recipients) ? recipients : [recipients],
    subject: template.renderSubject(templateData),
    templateId,
    templateData,
    category: template.category,
    priority: options.priority || 'medium',
    scheduledAt: options.scheduledAt || new Date(),
    metadata: {
      triggeredBy: options.triggeredBy,
      eventId: options.eventId,
      batchId: options.batchId,
      source: options.source || 'automatic',
      tags: options.tags || []
    }
  });
  
  return await email.save();
};

// Static method to create bulk emails
emailQueueSchema.statics.createBulk = async function(emails) {
  return await this.insertMany(emails, { ordered: false });
};

// Instance method to mark as processing
emailQueueSchema.methods.markProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  this.attempts += 1;
  return this.save();
};

// Instance method to mark as sent
emailQueueSchema.methods.markSent = function(messageId) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.tracking.messageId = messageId;
  return this.save();
};

// Instance method to mark as failed
emailQueueSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.lastError = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    timestamp: new Date()
  };
  return this.save();
};

// Instance method to update delivery status
emailQueueSchema.methods.updateDeliveryStatus = function(email, status, reason = null) {
  const existingStatus = this.deliveryStatus.find(ds => ds.email === email);
  
  if (existingStatus) {
    existingStatus.status = status;
    existingStatus.timestamp = new Date();
    existingStatus.reason = reason;
  } else {
    this.deliveryStatus.push({
      email,
      status,
      timestamp: new Date(),
      reason
    });
  }
  
  return this.save();
};

// Instance method to track email open
emailQueueSchema.methods.trackOpen = function(userAgent, ipAddress) {
  this.tracking.opens.push({
    timestamp: new Date(),
    userAgent,
    ipAddress
  });
  return this.save();
};

// Instance method to track link click
emailQueueSchema.methods.trackClick = function(url, userAgent, ipAddress) {
  this.tracking.clicks.push({
    url,
    timestamp: new Date(),
    userAgent,
    ipAddress
  });
  return this.save();
};

// Pre-save middleware to set priority based on category
emailQueueSchema.pre('save', function(next) {
  if (this.isNew && !this.priority) {
    const criticalCategories = ['security_alert', 'approval_request'];
    const highCategories = ['role_assignment', 'permission_change', 'account_update'];
    
    if (criticalCategories.includes(this.category)) {
      this.priority = 'critical';
    } else if (highCategories.includes(this.category)) {
      this.priority = 'high';
    } else {
      this.priority = 'medium';
    }
  }
  next();
});

// Post-save middleware for audit logging
emailQueueSchema.post('save', async function(doc, next) {
  try {
    if (doc.isNew) {
      const AuditLog = mongoose.model('AuditLog');
      await AuditLog.create({
        action: 'email_queued',
        userId: doc.metadata.triggeredBy,
        details: {
          emailId: doc._id,
          category: doc.category,
          priority: doc.priority,
          recipientCount: doc.to.length,
          subject: doc.subject
        },
        ipAddress: 'system',
        userAgent: 'email-queue',
        category: 'communication'
      });
    }
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

module.exports = mongoose.model('EmailQueue', emailQueueSchema);
