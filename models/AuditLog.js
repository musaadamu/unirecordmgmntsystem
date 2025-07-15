const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'role_assigned',
      'role_removed',
      'role_created',
      'role_updated',
      'role_deleted',
      'permission_granted',
      'permission_revoked',
      'permission_created',
      'permission_updated',
      'permission_deleted',
      'permission_group_created',
      'permission_group_updated',
      'permission_group_deleted',
      'user_login',
      'user_logout',
      'access_denied',
      'permission_check',
      'bulk_assignment',
      'role_cloned',
      'system_backup',
      'system_restore'
    ],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  permissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  category: {
    type: String,
    enum: ['authentication', 'authorization', 'administration', 'system', 'security'],
    default: 'authorization'
  },
  metadata: {
    sessionId: String,
    requestId: String,
    duration: Number, // in milliseconds
    success: {
      type: Boolean,
      default: true
    },
    errorCode: String,
    errorMessage: String
  }
}, {
  timestamps: false, // We use custom timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ targetUserId: 1, timestamp: -1 });
auditLogSchema.index({ roleId: 1, timestamp: -1 });
auditLogSchema.index({ permissionId: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });

// Compound indexes for complex queries
auditLogSchema.index({ action: 1, userId: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });

// TTL index to automatically delete old logs (optional - keep for 2 years)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for time ago
auditLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Static method to log RBAC action
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const log = new this({
      action: actionData.action,
      userId: actionData.userId,
      targetUserId: actionData.targetUserId,
      roleId: actionData.roleId,
      permissionId: actionData.permissionId,
      details: actionData.details || {},
      ipAddress: actionData.ipAddress || 'unknown',
      userAgent: actionData.userAgent || 'unknown',
      severity: actionData.severity || 'low',
      category: actionData.category || 'authorization',
      metadata: actionData.metadata || {}
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent breaking main functionality
    return null;
  }
};

// Static method to get audit statistics
auditLogSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
      $lte: endDate || new Date()
    }
  };

  const [
    totalLogs,
    actionStats,
    severityStats,
    categoryStats,
    userStats,
    dailyStats
  ] = await Promise.all([
    this.countDocuments(matchStage),
    
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]),
    
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])
  ]);

  return {
    totalLogs,
    actionStats: actionStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    severityStats: severityStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    categoryStats: categoryStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    topUsers: userStats,
    dailyActivity: dailyStats.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }))
  };
};

// Static method to find security incidents
auditLogSchema.statics.findSecurityIncidents = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    timestamp: { $gte: startDate },
    $or: [
      { action: 'access_denied' },
      { severity: { $in: ['high', 'critical'] } },
      { 'metadata.success': false }
    ]
  }).sort({ timestamp: -1 }).populate('userId targetUserId');
};

// Static method to find user activity
auditLogSchema.statics.findUserActivity = function(userId, limit = 50) {
  return this.find({
    $or: [
      { userId: userId },
      { targetUserId: userId }
    ]
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .populate('userId targetUserId roleId permissionId');
};

// Static method to cleanup old logs
auditLogSchema.statics.cleanup = async function(daysToKeep = 730) { // 2 years default
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

// Pre-save middleware to set severity based on action
auditLogSchema.pre('save', function(next) {
  if (!this.severity || this.severity === 'low') {
    const highSeverityActions = [
      'role_deleted',
      'permission_deleted',
      'access_denied',
      'system_backup',
      'system_restore'
    ];
    
    const mediumSeverityActions = [
      'role_created',
      'role_updated',
      'permission_created',
      'permission_updated',
      'bulk_assignment'
    ];
    
    if (highSeverityActions.includes(this.action)) {
      this.severity = 'high';
    } else if (mediumSeverityActions.includes(this.action)) {
      this.severity = 'medium';
    }
  }
  
  // Set category based on action
  if (!this.category || this.category === 'authorization') {
    if (this.action.includes('login') || this.action.includes('logout')) {
      this.category = 'authentication';
    } else if (this.action.includes('system') || this.action.includes('backup')) {
      this.category = 'system';
    } else if (this.action === 'access_denied') {
      this.category = 'security';
    } else if (this.action.includes('role') || this.action.includes('permission')) {
      this.category = 'administration';
    }
  }
  
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
