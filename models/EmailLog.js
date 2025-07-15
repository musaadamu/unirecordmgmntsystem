const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  emailQueueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailQueue',
    required: true
  },
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  to: [{
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  from: {
    email: {
      type: String,
      required: true
    },
    name: String
  },
  subject: {
    type: String,
    required: true
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
    enum: ['sent', 'delivered', 'bounced', 'rejected', 'deferred', 'failed'],
    required: true
  },
  sentAt: {
    type: Date,
    required: true
  },
  deliveredAt: {
    type: Date
  },
  openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  bounceReason: {
    type: String
  },
  rejectReason: {
    type: String
  },
  provider: {
    name: {
      type: String,
      enum: ['sendgrid', 'ses', 'mailgun', 'smtp'],
      required: true
    },
    messageId: String,
    response: String
  },
  tracking: {
    opens: [{
      timestamp: Date,
      userAgent: String,
      ipAddress: String,
      location: {
        country: String,
        region: String,
        city: String
      }
    }],
    clicks: [{
      url: String,
      timestamp: Date,
      userAgent: String,
      ipAddress: String,
      location: {
        country: String,
        region: String,
        city: String
      }
    }],
    unsubscribes: [{
      timestamp: Date,
      reason: String,
      ipAddress: String
    }]
  },
  metadata: {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate'
    },
    batchId: String,
    eventId: String,
    tags: [String],
    department: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  analytics: {
    deliveryTime: Number, // milliseconds from sent to delivered
    firstOpenTime: Number, // milliseconds from sent to first open
    firstClickTime: Number, // milliseconds from sent to first click
    totalOpens: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    uniqueOpens: {
      type: Number,
      default: 0
    },
    uniqueClicks: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and analytics
emailLogSchema.index({ messageId: 1 });
emailLogSchema.index({ emailQueueId: 1 });
emailLogSchema.index({ 'to.email': 1 });
emailLogSchema.index({ 'to.userId': 1 });
emailLogSchema.index({ category: 1, sentAt: -1 });
emailLogSchema.index({ status: 1, sentAt: -1 });
emailLogSchema.index({ 'metadata.batchId': 1 });
emailLogSchema.index({ 'metadata.department': 1 });
emailLogSchema.index({ sentAt: -1 });

// TTL index to automatically delete old logs (90 days)
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Virtual for engagement rate
emailLogSchema.virtual('engagementRate').get(function() {
  if (this.analytics.totalOpens === 0) return 0;
  return (this.analytics.totalClicks / this.analytics.totalOpens) * 100;
});

// Virtual for delivery success
emailLogSchema.virtual('isDelivered').get(function() {
  return ['delivered', 'sent'].includes(this.status);
});

// Virtual for engagement status
emailLogSchema.virtual('isEngaged').get(function() {
  return this.analytics.totalOpens > 0 || this.analytics.totalClicks > 0;
});

// Static method to get delivery statistics
emailLogSchema.statics.getDeliveryStats = async function(startDate, endDate, filters = {}) {
  const matchStage = {
    sentAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    },
    ...filters
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        delivered: {
          $sum: {
            $cond: [{ $in: ['$status', ['delivered', 'sent']] }, 1, 0]
          }
        },
        bounced: {
          $sum: {
            $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
          }
        },
        opened: {
          $sum: {
            $cond: [{ $gt: ['$analytics.totalOpens', 0] }, 1, 0]
          }
        },
        clicked: {
          $sum: {
            $cond: [{ $gt: ['$analytics.totalClicks', 0] }, 1, 0]
          }
        },
        avgDeliveryTime: { $avg: '$analytics.deliveryTime' },
        avgFirstOpenTime: { $avg: '$analytics.firstOpenTime' }
      }
    }
  ]);

  const result = stats[0] || {
    totalSent: 0,
    delivered: 0,
    bounced: 0,
    rejected: 0,
    opened: 0,
    clicked: 0,
    avgDeliveryTime: 0,
    avgFirstOpenTime: 0
  };

  // Calculate rates
  result.deliveryRate = result.totalSent > 0 ? (result.delivered / result.totalSent) * 100 : 0;
  result.bounceRate = result.totalSent > 0 ? (result.bounced / result.totalSent) * 100 : 0;
  result.openRate = result.delivered > 0 ? (result.opened / result.delivered) * 100 : 0;
  result.clickRate = result.delivered > 0 ? (result.clicked / result.delivered) * 100 : 0;
  result.clickToOpenRate = result.opened > 0 ? (result.clicked / result.opened) * 100 : 0;

  return result;
};

// Static method to get category performance
emailLogSchema.statics.getCategoryStats = async function(startDate, endDate) {
  const matchStage = {
    sentAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalSent: { $sum: 1 },
        delivered: {
          $sum: {
            $cond: [{ $in: ['$status', ['delivered', 'sent']] }, 1, 0]
          }
        },
        opened: {
          $sum: {
            $cond: [{ $gt: ['$analytics.totalOpens', 0] }, 1, 0]
          }
        },
        clicked: {
          $sum: {
            $cond: [{ $gt: ['$analytics.totalClicks', 0] }, 1, 0]
          }
        },
        avgOpenTime: { $avg: '$analytics.firstOpenTime' }
      }
    },
    {
      $addFields: {
        deliveryRate: {
          $cond: [
            { $gt: ['$totalSent', 0] },
            { $multiply: [{ $divide: ['$delivered', '$totalSent'] }, 100] },
            0
          ]
        },
        openRate: {
          $cond: [
            { $gt: ['$delivered', 0] },
            { $multiply: [{ $divide: ['$opened', '$delivered'] }, 100] },
            0
          ]
        },
        clickRate: {
          $cond: [
            { $gt: ['$delivered', 0] },
            { $multiply: [{ $divide: ['$clicked', '$delivered'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { totalSent: -1 } }
  ]);
};

// Instance method to track email open
emailLogSchema.methods.trackOpen = function(userAgent, ipAddress, location = {}) {
  const now = new Date();
  
  this.tracking.opens.push({
    timestamp: now,
    userAgent,
    ipAddress,
    location
  });
  
  this.analytics.totalOpens += 1;
  
  // Update unique opens (simplified - could be more sophisticated)
  const uniqueOpens = new Set(this.tracking.opens.map(o => o.ipAddress)).size;
  this.analytics.uniqueOpens = uniqueOpens;
  
  // Set first open time if not set
  if (!this.openedAt) {
    this.openedAt = now;
    this.analytics.firstOpenTime = now.getTime() - this.sentAt.getTime();
  }
  
  return this.save();
};

// Instance method to track link click
emailLogSchema.methods.trackClick = function(url, userAgent, ipAddress, location = {}) {
  const now = new Date();
  
  this.tracking.clicks.push({
    url,
    timestamp: now,
    userAgent,
    ipAddress,
    location
  });
  
  this.analytics.totalClicks += 1;
  
  // Update unique clicks
  const uniqueClicks = new Set(this.tracking.clicks.map(c => c.ipAddress)).size;
  this.analytics.uniqueClicks = uniqueClicks;
  
  // Set first click time if not set
  if (!this.clickedAt) {
    this.clickedAt = now;
    this.analytics.firstClickTime = now.getTime() - this.sentAt.getTime();
  }
  
  return this.save();
};

// Instance method to track unsubscribe
emailLogSchema.methods.trackUnsubscribe = function(reason, ipAddress) {
  const now = new Date();
  
  this.tracking.unsubscribes.push({
    timestamp: now,
    reason,
    ipAddress
  });
  
  this.unsubscribedAt = now;
  
  return this.save();
};

// Instance method to update delivery status
emailLogSchema.methods.updateDeliveryStatus = function(status, reason = null) {
  this.status = status;
  
  if (status === 'delivered') {
    this.deliveredAt = new Date();
    this.analytics.deliveryTime = this.deliveredAt.getTime() - this.sentAt.getTime();
  } else if (status === 'bounced') {
    this.bounceReason = reason;
  } else if (status === 'rejected') {
    this.rejectReason = reason;
  }
  
  return this.save();
};

module.exports = mongoose.model('EmailLog', emailLogSchema);
