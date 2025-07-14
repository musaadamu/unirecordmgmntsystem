const mongoose = require('mongoose');
const { GRADE_TYPES } = require('../config/constants');

const gradeSchema = new mongoose.Schema({
  // References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },

  // Academic Period
  semester: {
    type: String,
    enum: ['fall', 'spring', 'summer'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },

  // Grade Information
  gradeInfo: {
    // Individual Assessment Grades
    assessments: [{
      type: {
        type: String,
        enum: Object.values(GRADE_TYPES),
        required: true
      },
      name: {
        type: String,
        required: true
      },
      maxPoints: {
        type: Number,
        required: true,
        min: 0
      },
      earnedPoints: {
        type: Number,
        required: true,
        min: 0
      },
      weight: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      dateAssigned: Date,
      dateDue: Date,
      dateSubmitted: Date,
      dateGraded: Date,
      feedback: String,
      rubric: [{
        criteria: String,
        points: Number,
        maxPoints: Number,
        feedback: String
      }]
    }],

    // Final Grades
    finalGrade: {
      numericGrade: {
        type: Number,
        min: 0,
        max: 100
      },
      letterGrade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP']
      },
      gradePoints: {
        type: Number,
        min: 0,
        max: 4
      },
      credits: {
        type: Number,
        required: true,
        min: 0
      },
      isComplete: {
        type: Boolean,
        default: false
      },
      dateFinalized: Date
    },

    // Grade Status
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'incomplete', 'withdrawn', 'audit'],
      default: 'in_progress'
    },
    
    // Attendance Impact
    attendanceImpact: {
      totalClasses: Number,
      attendedClasses: Number,
      attendancePercentage: Number,
      attendanceGrade: Number
    }
  },

  // Grade Modifications
  modifications: [{
    originalGrade: {
      numeric: Number,
      letter: String,
      points: Number
    },
    newGrade: {
      numeric: Number,
      letter: String,
      points: Number
    },
    reason: {
      type: String,
      required: true
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    modificationDate: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    approvalDate: Date
  }],

  // Grade Appeals
  appeals: [{
    reason: {
      type: String,
      required: true
    },
    description: String,
    submittedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'denied'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    reviewDate: Date,
    decision: String,
    finalGrade: {
      numeric: Number,
      letter: String,
      points: Number
    }
  }],

  // Comments and Feedback
  instructorComments: String,
  studentNotes: String,
  
  // Flags
  flags: {
    isIncomplete: {
      type: Boolean,
      default: false
    },
    incompleteReason: String,
    incompleteDeadline: Date,
    isRetake: {
      type: Boolean,
      default: false
    },
    originalAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade'
    },
    isChallengeExam: {
      type: Boolean,
      default: false
    },
    isTransferCredit: {
      type: Boolean,
      default: false
    },
    transferInstitution: String
  },

  // Metadata
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
gradeSchema.index({ student: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });
gradeSchema.index({ student: 1 });
gradeSchema.index({ course: 1 });
gradeSchema.index({ instructor: 1 });
gradeSchema.index({ semester: 1, academicYear: 1 });
gradeSchema.index({ 'gradeInfo.status': 1 });
gradeSchema.index({ 'gradeInfo.finalGrade.letterGrade': 1 });

// Virtual for percentage grade
gradeSchema.virtual('percentageGrade').get(function() {
  if (!this.gradeInfo.assessments || this.gradeInfo.assessments.length === 0) {
    return this.gradeInfo.finalGrade.numericGrade || 0;
  }
  
  let totalWeightedPoints = 0;
  let totalWeight = 0;
  
  this.gradeInfo.assessments.forEach(assessment => {
    const percentage = (assessment.earnedPoints / assessment.maxPoints) * 100;
    totalWeightedPoints += percentage * (assessment.weight / 100);
    totalWeight += assessment.weight;
  });
  
  return totalWeight > 0 ? totalWeightedPoints : 0;
});

// Method to calculate letter grade from numeric grade
gradeSchema.methods.calculateLetterGrade = function(numericGrade) {
  if (numericGrade >= 97) return 'A+';
  if (numericGrade >= 93) return 'A';
  if (numericGrade >= 90) return 'A-';
  if (numericGrade >= 87) return 'B+';
  if (numericGrade >= 83) return 'B';
  if (numericGrade >= 80) return 'B-';
  if (numericGrade >= 77) return 'C+';
  if (numericGrade >= 73) return 'C';
  if (numericGrade >= 70) return 'C-';
  if (numericGrade >= 67) return 'D+';
  if (numericGrade >= 60) return 'D';
  return 'F';
};

// Method to calculate grade points from letter grade
gradeSchema.methods.calculateGradePoints = function(letterGrade) {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0,
    'I': 0.0, 'W': 0.0, 'P': 0.0, 'NP': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
};

module.exports = mongoose.model('Grade', gradeSchema);
