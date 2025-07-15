const mongoose = require('mongoose');

const extracurricularActivitySchema = new mongoose.Schema({
  // Activity Basic Information
  activityInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    type: {
      type: String,
      enum: [
        'sports', 'academic_club', 'cultural', 'volunteer', 'leadership',
        'research', 'internship', 'competition', 'workshop', 'conference',
        'community_service', 'arts', 'music', 'drama', 'debate', 'other'
      ],
      required: true
    },
    category: {
      type: String,
      enum: ['curricular', 'co_curricular', 'extra_curricular'],
      required: true
    },
    level: {
      type: String,
      enum: ['institutional', 'local', 'regional', 'national', 'international'],
      required: true
    }
  },

  // Participation Information
  participation: {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    role: {
      type: String,
      enum: ['participant', 'leader', 'organizer', 'coordinator', 'captain', 'president', 'secretary', 'treasurer'],
      default: 'participant'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false
    },
    hoursPerWeek: {
      type: Number,
      min: 0,
      max: 168
    },
    totalHours: Number
  },

  // Organization/Institution Details
  organization: {
    name: String,
    type: {
      type: String,
      enum: ['university_club', 'external_organization', 'government', 'ngo', 'private_company', 'other']
    },
    contactPerson: {
      name: String,
      position: String,
      email: String,
      phone: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },

  // Academic Integration
  academicIntegration: {
    isForCredit: {
      type: Boolean,
      default: false
    },
    creditHours: Number,
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    academicYear: String,
    semester: {
      type: String,
      enum: ['fall', 'spring', 'summer']
    },
    grade: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },

  // Achievements and Recognition
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['award', 'certificate', 'recognition', 'medal', 'trophy', 'scholarship', 'publication']
    },
    level: {
      type: String,
      enum: ['institutional', 'local', 'regional', 'national', 'international']
    },
    dateReceived: Date,
    issuingOrganization: String,
    certificateNumber: String,
    verificationUrl: String
  }],

  // Skills and Competencies Developed
  skillsDeveloped: [{
    skill: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft_skills', 'leadership', 'communication', 'teamwork', 'problem_solving', 'other']
    },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    description: String
  }],

  // Verification and Documentation
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'requires_documentation'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    verificationNotes: String,
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    requiresVerification: {
      type: Boolean,
      default: true
    }
  },

  // Impact and Outcomes
  impact: {
    description: String,
    beneficiaries: Number,
    communityImpact: String,
    personalGrowth: String,
    learningOutcomes: [String],
    challenges: String,
    solutions: String
  },

  // Reflection and Assessment
  reflection: {
    studentReflection: String,
    supervisorFeedback: String,
    selfAssessment: {
      overallRating: {
        type: Number,
        min: 1,
        max: 5
      },
      skillsGained: [String],
      areasOfImprovement: [String],
      futureGoals: String
    },
    supervisorAssessment: {
      performanceRating: {
        type: Number,
        min: 1,
        max: 5
      },
      strengths: [String],
      areasForDevelopment: [String],
      recommendation: String,
      assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      assessmentDate: Date
    }
  },

  // Status and Workflow
  status: {
    currentStatus: {
      type: String,
      enum: ['active', 'completed', 'withdrawn', 'suspended', 'cancelled'],
      default: 'active'
    },
    completionStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'incomplete'],
      default: 'not_started'
    },
    approvalRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date
  },

  // Metadata
  metadata: {
    tags: [String],
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
    },
    includeInTranscript: {
      type: Boolean,
      default: false
    },
    includeInResume: {
      type: Boolean,
      default: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },

  // Audit Information
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

// Indexes for better performance
extracurricularActivitySchema.index({ 'participation.student': 1 });
extracurricularActivitySchema.index({ 'activityInfo.type': 1 });
extracurricularActivitySchema.index({ 'activityInfo.category': 1 });
extracurricularActivitySchema.index({ 'activityInfo.level': 1 });
extracurricularActivitySchema.index({ 'participation.startDate': 1 });
extracurricularActivitySchema.index({ 'participation.endDate': 1 });
extracurricularActivitySchema.index({ 'status.currentStatus': 1 });
extracurricularActivitySchema.index({ 'verification.status': 1 });
extracurricularActivitySchema.index({ 'academicIntegration.academicYear': 1 });
extracurricularActivitySchema.index({ 'academicIntegration.semester': 1 });

// Virtual for duration calculation
extracurricularActivitySchema.virtual('duration').get(function() {
  if (this.participation.endDate) {
    const start = new Date(this.participation.startDate);
    const end = new Date(this.participation.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } else if (this.participation.isOngoing) {
    const start = new Date(this.participation.startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for total hours calculation
extracurricularActivitySchema.virtual('calculatedTotalHours').get(function() {
  if (this.participation.totalHours) {
    return this.participation.totalHours;
  } else if (this.participation.hoursPerWeek && this.duration) {
    const weeks = Math.ceil(this.duration / 7);
    return this.participation.hoursPerWeek * weeks;
  }
  return 0;
});

// Method to check if activity is current
extracurricularActivitySchema.methods.isCurrent = function() {
  if (this.participation.isOngoing) return true;
  if (!this.participation.endDate) return false;
  return new Date() <= new Date(this.participation.endDate);
};

// Method to calculate completion percentage
extracurricularActivitySchema.methods.getCompletionPercentage = function() {
  if (this.status.completionStatus === 'completed') return 100;
  if (this.status.completionStatus === 'not_started') return 0;
  
  if (this.participation.endDate) {
    const start = new Date(this.participation.startDate);
    const end = new Date(this.participation.endDate);
    const now = new Date();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  }
  
  return 50; // Default for ongoing activities without end date
};

module.exports = mongoose.model('ExtracurricularActivity', extracurricularActivitySchema);
