const mongoose = require('mongoose');

const userRoleConditionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['department', 'time_range', 'ip_restriction', 'location', 'temporary'],
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

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.assignedAt;
      },
      message: 'Expiry date must be after assignment date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: [userRoleConditionSchema],
  department: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  metadata: {
    assignmentReason: {
      type: String,
      enum: ['manual', 'automatic', 'bulk', 'migration', 'approval'],
      default: 'manual'
    },
    approvalRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    lastValidated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });
userRoleSchema.index({ assignedBy: 1 });
userRoleSchema.index({ assignedAt: 1 });
userRoleSchema.index({ expiresAt: 1 });
userRoleSchema.index({ isActive: 1 });
userRoleSchema.index({ department: 1 });

// Compound indexes for efficient queries
userRoleSchema.index({ userId: 1, isActive: 1 });
userRoleSchema.index({ roleId: 1, isActive: 1 });
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
userRoleSchema.index({ expiresAt: 1, isActive: 1 });

// Virtual for checking if assignment is expired
userRoleSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for days until expiry
userRoleSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to find user roles
userRoleSchema.statics.findUserRoles = function(userId, includeExpired = false) {
  const query = { userId, isActive: true };
  if (!includeExpired) {
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
  }
  return this.find(query).populate('roleId').sort({ assignedAt: -1 });
};

// Static method to find role users
userRoleSchema.statics.findRoleUsers = function(roleId, includeExpired = false) {
  const query = { roleId, isActive: true };
  if (!includeExpired) {
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
  }
  return this.find(query).populate('userId').sort({ assignedAt: -1 });
};

// Static method to find expiring assignments
userRoleSchema.statics.findExpiringAssignments = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    isActive: true,
    expiresAt: {
      $gte: new Date(),
      $lte: futureDate
    }
  }).populate(['userId', 'roleId']).sort({ expiresAt: 1 });
};

// Static method to bulk assign roles
userRoleSchema.statics.bulkAssign = async function(assignments, assignedBy) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const results = [];
    
    for (const assignment of assignments) {
      // Check if assignment already exists
      const existing = await this.findOne({
        userId: assignment.userId,
        roleId: assignment.roleId
      }).session(session);
      
      if (existing) {
        if (!existing.isActive) {
          // Reactivate existing assignment
          existing.isActive = true;
          existing.assignedBy = assignedBy;
          existing.assignedAt = new Date();
          existing.expiresAt = assignment.expiresAt;
          existing.conditions = assignment.conditions;
          existing.department = assignment.department;
          existing.notes = assignment.notes;
          await existing.save({ session });
          results.push(existing);
        } else {
          // Update existing active assignment
          existing.expiresAt = assignment.expiresAt;
          existing.conditions = assignment.conditions;
          existing.department = assignment.department;
          existing.notes = assignment.notes;
          await existing.save({ session });
          results.push(existing);
        }
      } else {
        // Create new assignment
        const newAssignment = new this({
          ...assignment,
          assignedBy
        });
        await newAssignment.save({ session });
        results.push(newAssignment);
      }
      
      // Update role usage count
      const Role = mongoose.model('Role');
      await Role.incrementUsage(assignment.roleId);
    }
    
    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Instance method to check if assignment is valid
userRoleSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  
  // Check conditions
  if (this.conditions && this.conditions.length > 0) {
    // Implement condition checking logic here
    // For now, assume all conditions are valid
    return true;
  }
  
  return true;
};

// Instance method to extend expiry
userRoleSchema.methods.extend = function(days) {
  if (this.expiresAt) {
    this.expiresAt.setDate(this.expiresAt.getDate() + days);
  } else {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    this.expiresAt = newExpiry;
  }
  return this;
};

// Pre-save middleware to validate role assignment
userRoleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('roleId')) {
    const Role = mongoose.model('Role');
    const role = await Role.findById(this.roleId);
    
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }
    
    if (!role.isActive) {
      const error = new Error('Cannot assign inactive role');
      error.statusCode = 400;
      return next(error);
    }
  }
  
  // Auto-deactivate if expired
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isActive = false;
  }
  
  next();
});

// Pre-save middleware to prevent duplicate active assignments
userRoleSchema.pre('save', async function(next) {
  if (this.isNew && this.isActive) {
    const existing = await this.constructor.findOne({
      userId: this.userId,
      roleId: this.roleId,
      isActive: true
    });
    
    if (existing) {
      const error = new Error('User already has this role assigned');
      error.statusCode = 409;
      return next(error);
    }
  }
  next();
});

// Post-save middleware for audit logging
userRoleSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    const action = doc.isNew ? 'role_assigned' : 'role_assignment_updated';
    
    await AuditLog.create({
      action,
      userId: doc.assignedBy,
      targetUserId: doc.userId,
      roleId: doc.roleId,
      details: {
        assignmentId: doc._id,
        expiresAt: doc.expiresAt,
        department: doc.department,
        conditions: doc.conditions,
        isActive: doc.isActive
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
userRoleSchema.post('remove', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: 'role_removed',
      userId: doc.assignedBy,
      targetUserId: doc.userId,
      roleId: doc.roleId,
      details: {
        assignmentId: doc._id,
        removedAt: new Date()
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

// Middleware to automatically deactivate expired assignments
userRoleSchema.statics.deactivateExpired = async function() {
  const result = await this.updateMany(
    {
      isActive: true,
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { isActive: false }
    }
  );
  
  return result.modifiedCount;
};

module.exports = mongoose.model('UserRole', userRoleSchema);
