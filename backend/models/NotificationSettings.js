const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'role_changes',
      'permission_updates', 
      'security_alerts',
      'system_maintenance',
      'account_updates',
      'approval_requests',
      'digest_notifications',
      'welcome_messages'
    ],
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: String,
    enum: ['immediate', 'daily_digest', 'weekly_digest', 'disabled'],
    default: 'immediate'
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    default: 'email'
  }]
}, { _id: false });

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: [notificationPreferenceSchema],
  globalSettings: {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    digestDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: 'monday'
    },
    digestTime: {
      type: String,
      default: '09:00'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  departmentOverrides: [{
    department: String,
    preferences: [notificationPreferenceSchema]
  }],
  roleOverrides: [{
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    preferences: [notificationPreferenceSchema]
  }],
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSettingsSchema.index({ userId: 1 });
notificationSettingsSchema.index({ 'globalSettings.unsubscribeToken': 1 });
notificationSettingsSchema.index({ 'preferences.category': 1 });

// Virtual for effective preferences (considering overrides)
notificationSettingsSchema.virtual('effectivePreferences').get(function() {
  // This would calculate final preferences considering department and role overrides
  return this.preferences;
});

// Static method to get default preferences
notificationSettingsSchema.statics.getDefaultPreferences = function() {
  return [
    { category: 'role_changes', enabled: true, frequency: 'immediate', channels: ['email'] },
    { category: 'permission_updates', enabled: true, frequency: 'immediate', channels: ['email'] },
    { category: 'security_alerts', enabled: true, frequency: 'immediate', channels: ['email'] },
    { category: 'system_maintenance', enabled: true, frequency: 'daily_digest', channels: ['email'] },
    { category: 'account_updates', enabled: true, frequency: 'immediate', channels: ['email'] },
    { category: 'approval_requests', enabled: true, frequency: 'immediate', channels: ['email'] },
    { category: 'digest_notifications', enabled: true, frequency: 'weekly_digest', channels: ['email'] },
    { category: 'welcome_messages', enabled: true, frequency: 'immediate', channels: ['email'] }
  ];
};

// Static method to create default settings for user
notificationSettingsSchema.statics.createDefaultSettings = async function(userId) {
  const crypto = require('crypto');
  
  const settings = new this({
    userId,
    preferences: this.getDefaultPreferences(),
    globalSettings: {
      unsubscribeToken: crypto.randomBytes(32).toString('hex')
    }
  });
  
  return await settings.save();
};

// Instance method to get preference for category
notificationSettingsSchema.methods.getPreference = function(category, department = null, roleId = null) {
  // Check role overrides first
  if (roleId) {
    const roleOverride = this.roleOverrides.find(override => 
      override.roleId.toString() === roleId.toString()
    );
    if (roleOverride) {
      const rolePref = roleOverride.preferences.find(pref => pref.category === category);
      if (rolePref) return rolePref;
    }
  }
  
  // Check department overrides
  if (department) {
    const deptOverride = this.departmentOverrides.find(override => 
      override.department === department
    );
    if (deptOverride) {
      const deptPref = deptOverride.preferences.find(pref => pref.category === category);
      if (deptPref) return deptPref;
    }
  }
  
  // Return default preference
  return this.preferences.find(pref => pref.category === category);
};

// Instance method to update preference
notificationSettingsSchema.methods.updatePreference = function(category, updates, updatedBy) {
  const preference = this.preferences.find(pref => pref.category === category);
  if (preference) {
    Object.assign(preference, updates);
  } else {
    this.preferences.push({ category, ...updates });
  }
  
  this.metadata.lastUpdated = new Date();
  this.metadata.updatedBy = updatedBy;
  this.metadata.version += 1;
  
  return this;
};

// Pre-save middleware to generate unsubscribe token if not exists
notificationSettingsSchema.pre('save', function(next) {
  if (!this.globalSettings.unsubscribeToken) {
    const crypto = require('crypto');
    this.globalSettings.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Post-save middleware for audit logging
notificationSettingsSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: doc.isNew ? 'notification_settings_created' : 'notification_settings_updated',
      userId: doc.metadata.updatedBy || doc.userId,
      targetUserId: doc.userId,
      details: {
        settingsId: doc._id,
        preferences: doc.preferences.map(p => ({ category: p.category, enabled: p.enabled, frequency: p.frequency })),
        globalSettings: {
          emailEnabled: doc.globalSettings.emailEnabled,
          language: doc.globalSettings.language
        }
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system',
      category: 'administration'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
