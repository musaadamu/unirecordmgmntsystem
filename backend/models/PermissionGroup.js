const mongoose = require('mongoose');

const permissionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  }],
  category: {
    type: String,
    enum: ['academic', 'administrative', 'system', 'reporting', 'financial', 'communication'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    usageCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
permissionGroupSchema.index({ name: 1 });
permissionGroupSchema.index({ category: 1 });
permissionGroupSchema.index({ isActive: 1 });
permissionGroupSchema.index({ createdBy: 1 });

// Compound indexes
permissionGroupSchema.index({ category: 1, isActive: 1 });

// Virtual for permission count
permissionGroupSchema.virtual('permissionCount').get(function() {
  return this.permissions ? this.permissions.length : 0;
});

// Static method to find groups by category
permissionGroupSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get all categories
permissionGroupSchema.statics.getCategories = function() {
  return this.distinct('category');
};

// Instance method to add permission
permissionGroupSchema.methods.addPermission = function(permissionId) {
  if (!this.permissions.includes(permissionId)) {
    this.permissions.push(permissionId);
  }
  return this;
};

// Instance method to remove permission
permissionGroupSchema.methods.removePermission = function(permissionId) {
  this.permissions = this.permissions.filter(p => p.toString() !== permissionId.toString());
  return this;
};

// Instance method to check if group has permission
permissionGroupSchema.methods.hasPermission = function(permissionId) {
  return this.permissions.some(p => p.toString() === permissionId.toString());
};

// Pre-save middleware to validate permissions exist
permissionGroupSchema.pre('save', async function(next) {
  if (this.isModified('permissions')) {
    const Permission = mongoose.model('Permission');
    const validPermissions = await Permission.find({
      _id: { $in: this.permissions },
      isActive: true
    });
    
    if (validPermissions.length !== this.permissions.length) {
      const error = new Error('One or more permissions are invalid or inactive');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Post-save middleware for audit logging
permissionGroupSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: doc.isNew ? 'permission_group_created' : 'permission_group_updated',
      userId: doc.createdBy,
      details: {
        groupId: doc._id,
        groupName: doc.name,
        category: doc.category,
        permissionCount: doc.permissions.length
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

module.exports = mongoose.model('PermissionGroup', permissionGroupSchema);
