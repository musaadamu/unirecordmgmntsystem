const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
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
    ref: 'Permission'
  }],
  isSystemRole: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['administrative', 'academic', 'financial', 'support', 'system'],
    required: true
  },
  level: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
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
    department: {
      type: String
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
roleSchema.index({ name: 1 });
roleSchema.index({ category: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystemRole: 1 });
roleSchema.index({ level: 1 });
roleSchema.index({ createdBy: 1 });
roleSchema.index({ 'metadata.usageCount': -1 });

// Compound indexes
roleSchema.index({ category: 1, isActive: 1 });
roleSchema.index({ isSystemRole: 1, isActive: 1 });

// Virtual for assigned users count
roleSchema.virtual('assignedUsersCount', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'roleId',
  count: true,
  match: { isActive: true }
});

// Virtual for permission count
roleSchema.virtual('permissionCount').get(function() {
  return this.permissions ? this.permissions.length : 0;
});

// Static method to find system roles
roleSchema.statics.findSystemRoles = function() {
  return this.find({ isSystemRole: true, isActive: true }).sort({ level: -1 });
};

// Static method to find roles by category
roleSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to find roles by level
roleSchema.statics.findByLevel = function(minLevel, maxLevel = 10) {
  return this.find({ 
    level: { $gte: minLevel, $lte: maxLevel }, 
    isActive: true 
  }).sort({ level: -1 });
};

// Static method to get role analytics
roleSchema.statics.getAnalytics = async function() {
  const [
    totalRoles,
    activeRoles,
    systemRoles,
    customRoles,
    rolesByCategory,
    mostUsedRoles
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isActive: true }),
    this.countDocuments({ isSystemRole: true }),
    this.countDocuments({ isSystemRole: false }),
    this.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { isActive: true } },
      { $sort: { 'metadata.usageCount': -1 } },
      { $limit: 10 },
      { $project: { name: 1, 'metadata.usageCount': 1 } }
    ])
  ]);

  const UserRole = mongoose.model('UserRole');
  const [recentAssignments, expiringAssignments] = await Promise.all([
    UserRole.countDocuments({
      assignedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    UserRole.countDocuments({
      expiresAt: { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      },
      isActive: true
    })
  ]);

  return {
    totalRoles,
    activeRoles,
    systemRoles,
    customRoles,
    rolesByCategory: rolesByCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    mostUsedRoles: mostUsedRoles.map(role => ({
      roleId: role._id,
      roleName: role.name,
      userCount: role.metadata.usageCount
    })),
    recentAssignments,
    expiringAssignments
  };
};

// Instance method to check if role has permission
roleSchema.methods.hasPermission = function(permissionId) {
  return this.permissions.some(p => p.toString() === permissionId.toString());
};

// Instance method to add permission
roleSchema.methods.addPermission = function(permissionId) {
  if (!this.hasPermission(permissionId)) {
    this.permissions.push(permissionId);
  }
  return this;
};

// Instance method to remove permission
roleSchema.methods.removePermission = function(permissionId) {
  this.permissions = this.permissions.filter(p => p.toString() !== permissionId.toString());
  return this;
};

// Instance method to clone role
roleSchema.methods.cloneRole = async function(newName, createdBy) {
  const Role = this.constructor;
  const clonedRole = new Role({
    name: newName,
    description: `${this.description} (Copy)`,
    permissions: [...this.permissions],
    category: this.category,
    level: this.level,
    createdBy: createdBy,
    isSystemRole: false, // Cloned roles are never system roles
    metadata: {
      tags: [...(this.metadata.tags || []), 'cloned']
    }
  });
  
  return await clonedRole.save();
};

// Pre-save middleware to validate system role modifications
roleSchema.pre('save', function(next) {
  if (this.isSystemRole && this.isModified() && !this.isNew) {
    // Allow only specific fields to be modified for system roles
    const allowedModifications = ['isActive', 'metadata'];
    const modifiedPaths = this.modifiedPaths();
    const unauthorizedModifications = modifiedPaths.filter(path => 
      !allowedModifications.some(allowed => path.startsWith(allowed))
    );
    
    if (unauthorizedModifications.length > 0) {
      const error = new Error('System roles cannot be modified');
      error.statusCode = 403;
      error.details = { unauthorizedModifications };
      return next(error);
    }
  }
  next();
});

// Pre-remove middleware to check if role is assigned to users
roleSchema.pre('remove', async function(next) {
  if (this.isSystemRole) {
    const error = new Error('System roles cannot be deleted');
    error.statusCode = 403;
    return next(error);
  }

  const UserRole = mongoose.model('UserRole');
  const assignedUsers = await UserRole.countDocuments({ roleId: this._id, isActive: true });
  
  if (assignedUsers > 0) {
    const error = new Error('Cannot delete role that is assigned to users');
    error.statusCode = 400;
    error.details = { assignedUsers };
    return next(error);
  }
  next();
});

// Post-save middleware for audit logging
roleSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: doc.isNew ? 'role_created' : 'role_updated',
      userId: doc.createdBy,
      roleId: doc._id,
      details: {
        roleName: doc.name,
        category: doc.category,
        level: doc.level,
        permissionCount: doc.permissions.length,
        isSystemRole: doc.isSystemRole
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
roleSchema.post('remove', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: 'role_deleted',
      userId: doc.createdBy,
      roleId: doc._id,
      details: {
        roleName: doc.name,
        category: doc.category,
        level: doc.level
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

// Middleware to update usage count when role is assigned
roleSchema.statics.incrementUsage = async function(roleId) {
  await this.findByIdAndUpdate(roleId, {
    $inc: { 'metadata.usageCount': 1 },
    $set: { 'metadata.lastUsed': new Date() }
  });
};

module.exports = mongoose.model('Role', roleSchema);
