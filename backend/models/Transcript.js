const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  // Student Reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  // Transcript Information
  transcriptInfo: {
    transcriptType: {
      type: String,
      enum: ['official', 'unofficial', 'partial', 'degree_audit'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'hold', 'completed', 'archived'],
      default: 'active'
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    completionDate: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purpose: {
      type: String,
      enum: ['transfer', 'employment', 'graduate_school', 'personal', 'other']
    }
  },

  // Academic Summary
  academicSummary: {
    totalCreditsAttempted: {
      type: Number,
      default: 0
    },
    totalCreditsEarned: {
      type: Number,
      default: 0
    },
    cumulativeGPA: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    majorGPA: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    classRank: Number,
    classSize: Number,
    academicStanding: {
      type: String,
      enum: ['good_standing', 'probation', 'suspension', 'dismissal', 'honors'],
      default: 'good_standing'
    },
    degreeConferred: {
      degree: String,
      major: String,
      minor: [String],
      concentration: [String],
      conferralDate: Date,
      graduationDate: Date,
      honors: {
        type: String,
        enum: ['none', 'cum_laude', 'magna_cum_laude', 'summa_cum_laude']
      }
    }
  },

  // Academic History by Semester
  semesterRecords: [{
    semester: {
      type: String,
      enum: ['fall', 'spring', 'summer'],
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    enrollmentStatus: {
      type: String,
      enum: ['full_time', 'part_time', 'not_enrolled'],
      required: true
    },
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      courseCode: String,
      courseName: String,
      credits: Number,
      grade: {
        letter: String,
        points: Number,
        numeric: Number
      },
      gradePoints: Number,
      qualityPoints: Number,
      status: {
        type: String,
        enum: ['completed', 'in_progress', 'withdrawn', 'incomplete', 'audit']
      },
      instructor: String,
      transferCredit: {
        type: Boolean,
        default: false
      },
      transferInstitution: String
    }],
    semesterCredits: {
      attempted: Number,
      earned: Number
    },
    semesterGPA: Number,
    cumulativeCredits: {
      attempted: Number,
      earned: Number
    },
    cumulativeGPA: Number,
    deansList: {
      type: Boolean,
      default: false
    },
    probation: {
      type: Boolean,
      default: false
    }
  }],

  // Transfer Credits
  transferCredits: [{
    institution: {
      type: String,
      required: true
    },
    courseEquivalent: String,
    credits: Number,
    grade: String,
    dateTransferred: Date,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }],

  // Test Scores and Standardized Tests
  testScores: [{
    testType: {
      type: String,
      enum: ['SAT', 'ACT', 'GRE', 'GMAT', 'TOEFL', 'IELTS', 'AP', 'IB', 'CLEP', 'other']
    },
    score: String,
    maxScore: String,
    testDate: Date,
    reportDate: Date
  }],

  // Academic Honors and Awards
  honorsAndAwards: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['academic', 'leadership', 'service', 'research', 'athletic', 'other']
    },
    dateReceived: Date,
    description: String,
    grantingOrganization: String
  }],

  // Disciplinary Records (if included)
  disciplinaryRecords: [{
    incident: String,
    date: Date,
    action: String,
    resolved: {
      type: Boolean,
      default: false
    },
    includeInTranscript: {
      type: Boolean,
      default: false
    }
  }],

  // Degree Requirements Progress
  degreeProgress: {
    program: String,
    major: String,
    minor: [String],
    concentration: [String],
    totalRequiredCredits: Number,
    completedCredits: Number,
    remainingCredits: Number,
    expectedGraduation: Date,
    requirements: [{
      category: String,
      description: String,
      requiredCredits: Number,
      completedCredits: Number,
      courses: [{
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        status: {
          type: String,
          enum: ['completed', 'in_progress', 'planned', 'not_taken']
        }
      }]
    }]
  },

  // Document Information
  documentInfo: {
    generatedDate: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    documentUrl: String,
    documentHash: String,
    watermark: String,
    securityCode: String,
    verificationUrl: String,
    expiryDate: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date
  },

  // Delivery Information
  deliveryInfo: {
    deliveryMethod: {
      type: String,
      enum: ['electronic', 'mail', 'pickup', 'third_party']
    },
    recipientInfo: {
      name: String,
      organization: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      email: String,
      phone: String
    },
    deliveryDate: Date,
    trackingNumber: String,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  },

  // Metadata
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
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
transcriptSchema.index({ student: 1 });
transcriptSchema.index({ 'transcriptInfo.transcriptType': 1 });
transcriptSchema.index({ 'transcriptInfo.status': 1 });
transcriptSchema.index({ 'transcriptInfo.requestDate': 1 });
transcriptSchema.index({ 'semesterRecords.semester': 1, 'semesterRecords.academicYear': 1 });

// Virtual for completion percentage
transcriptSchema.virtual('completionPercentage').get(function() {
  if (!this.degreeProgress.totalRequiredCredits) return 0;
  return Math.round((this.degreeProgress.completedCredits / this.degreeProgress.totalRequiredCredits) * 100);
});

// Method to calculate current GPA
transcriptSchema.methods.calculateCurrentGPA = function() {
  let totalQualityPoints = 0;
  let totalCredits = 0;
  
  this.semesterRecords.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.status === 'completed' && course.grade.points > 0) {
        totalQualityPoints += course.qualityPoints || (course.credits * course.grade.points);
        totalCredits += course.credits;
      }
    });
  });
  
  return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;
};

module.exports = mongoose.model('Transcript', transcriptSchema);
