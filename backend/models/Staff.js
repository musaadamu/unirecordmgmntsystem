const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Staff Specific Information
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Employment Information
  employmentInfo: {
    position: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    faculty: {
      type: String,
      required: true
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'visiting', 'emeritus'],
      required: true
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated', 'retired'],
      default: 'active'
    },
    hireDate: {
      type: Date,
      required: true
    },
    terminationDate: Date,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },

  // Academic Information (for academic staff)
  academicInfo: {
    isAcademicStaff: {
      type: Boolean,
      default: false
    },
    rank: {
      type: String,
      enum: ['instructor', 'assistant_professor', 'associate_professor', 'professor', 'emeritus'],
    },
    tenure: {
      type: Boolean,
      default: false
    },
    tenureDate: Date,
    education: [{
      degree: String,
      field: String,
      institution: String,
      graduationYear: Number
    }],
    researchAreas: [String],
    publications: [{
      title: String,
      journal: String,
      year: Number,
      coAuthors: [String]
    }],
    officeHours: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    officeLocation: String
  },

  // Administrative Information (for support staff)
  administrativeInfo: {
    isAdministrativeStaff: {
      type: Boolean,
      default: false
    },
    accessLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'full'],
      default: 'basic'
    },
    responsibilities: [String],
    systemAccess: [{
      system: String,
      accessLevel: String,
      grantedDate: Date,
      expiryDate: Date
    }]
  },

  // Salary and Benefits
  compensationInfo: {
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      payFrequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'annually'],
        default: 'monthly'
      }
    },
    benefits: [{
      type: String,
      description: String,
      value: Number
    }],
    lastSalaryReview: Date,
    nextSalaryReview: Date
  },

  // Performance and Evaluation
  performanceInfo: {
    evaluations: [{
      evaluationDate: Date,
      evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      goals: [String]
    }],
    awards: [{
      title: String,
      date: Date,
      description: String
    }],
    disciplinaryActions: [{
      date: Date,
      type: String,
      reason: String,
      action: String,
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      }
    }]
  },

  // Teaching Information (for academic staff)
  teachingInfo: {
    coursesTeaching: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    teachingLoad: {
      type: Number,
      default: 0
    },
    studentEvaluations: [{
      semester: String,
      academicYear: String,
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      averageRating: Number,
      totalResponses: Number
    }]
  },

  // Leave and Attendance
  leaveInfo: {
    annualLeaveBalance: {
      type: Number,
      default: 0
    },
    sickLeaveBalance: {
      type: Number,
      default: 0
    },
    leaveHistory: [{
      type: String,
      startDate: Date,
      endDate: Date,
      reason: String,
      approved: Boolean,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      }
    }]
  },

  // Emergency Information
  emergencyInfo: {
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    medicalInfo: {
      bloodType: String,
      allergies: [String],
      medications: [String],
      healthInsurance: {
        provider: String,
        policyNumber: String,
        expiryDate: Date
      }
    }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'cv', 'certificate', 'id_copy', 'other'],
      required: true
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  notes: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
staffSchema.index({ employeeId: 1 });
staffSchema.index({ user: 1 });
staffSchema.index({ 'employmentInfo.department': 1 });
staffSchema.index({ 'employmentInfo.position': 1 });
staffSchema.index({ 'employmentInfo.employmentStatus': 1 });
staffSchema.index({ 'academicInfo.rank': 1 });

module.exports = mongoose.model('Staff', staffSchema);
