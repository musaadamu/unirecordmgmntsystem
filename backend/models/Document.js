const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // Document Basic Information
  documentInfo: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    type: {
      type: String,
      enum: [
        'transcript', 'certificate', 'diploma', 'id_copy', 'passport_copy',
        'medical_record', 'financial_document', 'academic_record', 'legal_document',
        'application_form', 'recommendation_letter', 'research_paper', 'thesis',
        'assignment', 'exam_paper', 'other'
      ],
      required: true
    },
    category: {
      type: String,
      enum: ['academic', 'administrative', 'personal', 'legal', 'medical', 'financial'],
      required: true
    },
    subCategory: String
  },

  // File Information
  fileInfo: {
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileExtension: String,
    checksum: String,
    encoding: String
  },

  // Ownership and Access
  ownership: {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerType: {
      type: String,
      enum: ['student', 'staff', 'admin', 'system'],
      required: true
    },
    relatedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    relatedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  },

  // Access Control
  accessControl: {
    visibility: {
      type: String,
      enum: ['private', 'restricted', 'internal', 'public'],
      default: 'private'
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['read', 'write', 'admin'],
        default: 'read'
      },
      sharedDate: {
        type: Date,
        default: Date.now
      },
      expiryDate: Date,
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    departmentAccess: [String],
    roleAccess: [String]
  },

  // Document Status and Workflow
  status: {
    currentStatus: {
      type: String,
      enum: ['draft', 'pending_review', 'under_review', 'approved', 'rejected', 'archived', 'deleted'],
      default: 'draft'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    isOfficial: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvalWorkflow: [{
      step: Number,
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      comments: String,
      actionDate: Date
    }]
  },

  // Version Control
  versionInfo: {
    version: {
      type: String,
      default: '1.0'
    },
    isLatestVersion: {
      type: Boolean,
      default: true
    },
    parentDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    versionHistory: [{
      version: String,
      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      },
      changes: String,
      createdDate: Date,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },

  // Security and Compliance
  security: {
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionMethod: String,
    accessLog: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      action: {
        type: String,
        enum: ['view', 'download', 'edit', 'share', 'delete']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }],
    retentionPolicy: {
      retentionPeriod: Number, // in days
      destructionDate: Date,
      legalHold: {
        type: Boolean,
        default: false
      }
    }
  },

  // Metadata and Tags
  metadata: {
    tags: [String],
    keywords: [String],
    academicYear: String,
    semester: String,
    department: String,
    course: String,
    customFields: [{
      key: String,
      value: String,
      type: {
        type: String,
        enum: ['text', 'number', 'date', 'boolean'],
        default: 'text'
      }
    }]
  },

  // Document Relationships
  relationships: {
    relatedDocuments: [{
      document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      },
      relationship: {
        type: String,
        enum: ['parent', 'child', 'sibling', 'reference', 'attachment']
      },
      description: String
    }],
    attachments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }]
  },

  // Audit Trail
  auditTrail: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastAccessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastAccessedDate: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },

  // Expiry and Archival
  lifecycle: {
    expiryDate: Date,
    isExpired: {
      type: Boolean,
      default: false
    },
    archivalDate: Date,
    isArchived: {
      type: Boolean,
      default: false
    },
    deletionDate: Date,
    isDeleted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
documentSchema.index({ 'ownership.owner': 1 });
documentSchema.index({ 'ownership.ownerType': 1 });
documentSchema.index({ 'ownership.relatedStudent': 1 });
documentSchema.index({ 'ownership.relatedStaff': 1 });
documentSchema.index({ 'ownership.relatedCourse': 1 });
documentSchema.index({ 'documentInfo.type': 1 });
documentSchema.index({ 'documentInfo.category': 1 });
documentSchema.index({ 'status.currentStatus': 1 });
documentSchema.index({ 'accessControl.visibility': 1 });
documentSchema.index({ 'metadata.tags': 1 });
documentSchema.index({ 'metadata.academicYear': 1 });
documentSchema.index({ 'metadata.semester': 1 });
documentSchema.index({ 'metadata.department': 1 });
documentSchema.index({ 'lifecycle.isDeleted': 1 });
documentSchema.index({ 'lifecycle.isArchived': 1 });

// Virtual for file URL
documentSchema.virtual('fileUrl').get(function() {
  return `${process.env.BASE_URL}/api/documents/${this._id}/download`;
});

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileInfo.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if user has access to document
documentSchema.methods.hasAccess = function(userId, requiredLevel = 'read') {
  // Owner always has access
  if (this.ownership.owner.toString() === userId.toString()) {
    return true;
  }

  // Check shared access
  const sharedAccess = this.accessControl.sharedWith.find(share => 
    share.user.toString() === userId.toString() &&
    (!share.expiryDate || share.expiryDate > new Date())
  );

  if (sharedAccess) {
    const accessLevels = ['read', 'write', 'admin'];
    const userLevel = accessLevels.indexOf(sharedAccess.accessLevel);
    const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
    return userLevel >= requiredLevelIndex;
  }

  return false;
};

// Method to log access
documentSchema.methods.logAccess = function(userId, action, ipAddress, userAgent) {
  this.security.accessLog.push({
    user: userId,
    action,
    ipAddress,
    userAgent
  });

  if (action === 'view') {
    this.auditTrail.viewCount += 1;
  } else if (action === 'download') {
    this.auditTrail.downloadCount += 1;
  }

  this.auditTrail.lastAccessedBy = userId;
  this.auditTrail.lastAccessedDate = new Date();
};

module.exports = mongoose.model('Document', documentSchema);
