const mongoose = require('mongoose');

const disciplinaryRecordSchema = new mongoose.Schema({
  // Basic Information
  recordInfo: {
    caseNumber: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'academic_misconduct', 'behavioral_violation', 'attendance_violation',
        'property_damage', 'harassment', 'substance_abuse', 'safety_violation',
        'technology_misuse', 'financial_misconduct', 'other'
      ],
      required: true
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'severe'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },

  // Involved Parties
  involvedParties: {
    primaryStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    additionalStudents: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      role: {
        type: String,
        enum: ['co_offender', 'witness', 'victim', 'reporter']
      },
      involvement: String
    }],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    witnesses: [{
      name: String,
      role: {
        type: String,
        enum: ['student', 'staff', 'faculty', 'visitor', 'other']
      },
      contactInfo: {
        email: String,
        phone: String
      },
      statement: String,
      statementDate: Date
    }]
  },

  // Incident Details
  incidentDetails: {
    dateOfIncident: {
      type: Date,
      required: true
    },
    timeOfIncident: String,
    location: {
      building: String,
      room: String,
      campus: String,
      specificLocation: String
    },
    circumstances: String,
    immediateActions: String,
    evidenceCollected: [{
      type: {
        type: String,
        enum: ['document', 'photo', 'video', 'audio', 'physical_evidence', 'digital_evidence']
      },
      description: String,
      collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      collectionDate: Date,
      storageLocation: String,
      documentReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    }]
  },

  // Investigation Process
  investigation: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'suspended', 'closed'],
      default: 'not_started'
    },
    assignedInvestigator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    startDate: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    investigationNotes: String,
    interviews: [{
      interviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: Date,
      duration: Number, // in minutes
      summary: String,
      recordingAvailable: Boolean,
      documentReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    }],
    findings: String,
    recommendations: String
  },

  // Disciplinary Actions
  disciplinaryActions: [{
    action: {
      type: String,
      enum: [
        'verbal_warning', 'written_warning', 'probation', 'suspension',
        'expulsion', 'community_service', 'counseling', 'restitution',
        'educational_program', 'no_action', 'other'
      ],
      required: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    duration: String,
    conditions: [String],
    monitoringRequired: Boolean,
    monitoringFrequency: String,
    assignedMonitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    completionStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'violated', 'modified'],
      default: 'pending'
    },
    completionDate: Date,
    notes: String
  }],

  // Appeals Process
  appeals: [{
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    grounds: {
      type: String,
      enum: [
        'procedural_error', 'insufficient_evidence', 'excessive_penalty',
        'new_evidence', 'bias_claim', 'other'
      ]
    },
    description: String,
    supportingDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'hearing_scheduled', 'decided', 'closed'],
      default: 'submitted'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hearingDate: Date,
    decision: {
      type: String,
      enum: ['upheld', 'modified', 'overturned', 'remanded']
    },
    decisionDate: Date,
    decisionRationale: String,
    newActions: [String]
  }],

  // Academic Impact
  academicImpact: {
    affectedCourses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      semester: String,
      academicYear: String,
      impact: {
        type: String,
        enum: ['none', 'grade_reduction', 'course_failure', 'withdrawal', 'incomplete']
      },
      details: String
    }],
    transcriptNotation: {
      required: Boolean,
      notation: String,
      startDate: Date,
      endDate: Date,
      removalConditions: String
    },
    academicStanding: {
      type: String,
      enum: ['no_change', 'probation', 'suspension', 'dismissal']
    },
    registrationRestrictions: {
      hasRestrictions: Boolean,
      restrictions: [String],
      duration: String,
      removalConditions: String
    }
  },

  // Follow-up and Monitoring
  followUp: {
    required: Boolean,
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed']
    },
    assignedCounselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    checkIns: [{
      date: Date,
      conductedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      studentResponse: String,
      progressNotes: String,
      complianceStatus: {
        type: String,
        enum: ['compliant', 'partial_compliance', 'non_compliant']
      },
      nextSteps: String
    }],
    completionCriteria: String,
    completionDate: Date
  },

  // Case Status and Resolution
  caseStatus: {
    currentStatus: {
      type: String,
      enum: [
        'reported', 'under_investigation', 'pending_hearing', 'resolved',
        'appealed', 'closed', 'suspended', 'referred_external'
      ],
      default: 'reported'
    },
    resolutionDate: Date,
    resolutionSummary: String,
    lessonsLearned: String,
    preventiveMeasures: String,
    caseClosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closureReason: String
  },

  // Confidentiality and Access
  confidentiality: {
    level: {
      type: String,
      enum: ['public', 'restricted', 'confidential', 'highly_confidential'],
      default: 'confidential'
    },
    accessList: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['read', 'write', 'admin']
      },
      grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      grantedDate: Date,
      expiryDate: Date
    }],
    retentionPeriod: Number, // in years
    destructionDate: Date,
    legalHold: Boolean
  },

  // Metadata
  metadata: {
    tags: [String],
    relatedCases: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisciplinaryRecord'
    }],
    externalReferences: [{
      type: String,
      description: String,
      referenceNumber: String
    }],
    notifications: [{
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['case_opened', 'action_taken', 'hearing_scheduled', 'case_closed']
      },
      sentDate: Date,
      method: {
        type: String,
        enum: ['email', 'mail', 'phone', 'in_person']
      }
    }]
  },

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes for performance
disciplinaryRecordSchema.index({ 'recordInfo.caseNumber': 1 });
disciplinaryRecordSchema.index({ 'involvedParties.primaryStudent': 1 });
disciplinaryRecordSchema.index({ 'recordInfo.category': 1 });
disciplinaryRecordSchema.index({ 'recordInfo.severity': 1 });
disciplinaryRecordSchema.index({ 'incidentDetails.dateOfIncident': 1 });
disciplinaryRecordSchema.index({ 'investigation.status': 1 });
disciplinaryRecordSchema.index({ 'caseStatus.currentStatus': 1 });
disciplinaryRecordSchema.index({ 'confidentiality.level': 1 });

// Virtual for case age
disciplinaryRecordSchema.virtual('caseAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to generate case number
disciplinaryRecordSchema.statics.generateCaseNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `DISC${year}${random}`;
};

// Method to check if case is overdue
disciplinaryRecordSchema.methods.isOverdue = function() {
  if (this.investigation.expectedCompletionDate && !this.investigation.actualCompletionDate) {
    return new Date() > new Date(this.investigation.expectedCompletionDate);
  }
  return false;
};

module.exports = mongoose.model('DisciplinaryRecord', disciplinaryRecordSchema);
