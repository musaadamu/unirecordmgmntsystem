const mongoose = require('mongoose');

const permissionConditionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['department', 'time', 'ip', 'location', 'semester'],
    required: true
  },
  operator: {
    type: String,
    enum: ['equals', 'in', 'not_in', 'between', 'greater_than', 'less_than'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  }
}, { _id: false });

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  resource: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'export', 'import'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'system', 'reporting', 'financial', 'communication'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: [permissionConditionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ createdBy: 1 });

// Compound index for efficient queries
permissionSchema.index({ resource: 1, action: 1, category: 1 });

// Virtual for permission identifier
permissionSchema.virtual('identifier').get(function() {
  return `${this.resource}:${this.action}`;
});

// Static method to find permissions by resource and action
permissionSchema.statics.findByResourceAction = function(resource, action) {
  return this.findOne({ resource, action, isActive: true });
};

// Static method to find permissions by category
permissionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get all permission categories
permissionSchema.statics.getCategories = function() {
  return this.distinct('category');
};

// Instance method to check if permission matches criteria
permissionSchema.methods.matches = function(resource, action) {
  return this.resource === resource && this.action === action && this.isActive;
};

// Pre-save middleware to validate permission name format
permissionSchema.pre('save', function(next) {
  // Ensure permission name follows resource:action format if not custom
  if (!this.name.includes(':') && this.resource && this.action) {
    this.name = `${this.resource}:${this.action}`;
  }
  next();
});

// Pre-remove middleware to check if permission is used in roles
permissionSchema.pre('remove', async function(next) {
  const Role = mongoose.model('Role');
  const rolesUsingPermission = await Role.find({ permissions: this._id });
  
  if (rolesUsingPermission.length > 0) {
    const error = new Error('Cannot delete permission that is assigned to roles');
    error.statusCode = 400;
    error.details = {
      rolesCount: rolesUsingPermission.length,
      roles: rolesUsingPermission.map(role => role.name)
    };
    return next(error);
  }
  next();
});

// Post-save middleware for audit logging
permissionSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: doc.isNew ? 'permission_created' : 'permission_updated',
      userId: doc.createdBy,
      permissionId: doc._id,
      details: {
        permissionName: doc.name,
        resource: doc.resource,
        action: doc.action,
        category: doc.category
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

// Post-remove middleware for audit logging
permissionSchema.post('remove', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: 'permission_deleted',
      userId: doc.createdBy,
      permissionId: doc._id,
      details: {
        permissionName: doc.name,
        resource: doc.resource,
        action: doc.action,
        category: doc.category
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
