const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  section: {
    type: String,
    required: true
  },

  // Enrollment Information
  enrollmentInfo: {
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    enrollmentType: {
      type: String,
      enum: ['regular', 'late', 'add_drop', 'waitlist', 'audit'],
      default: 'regular'
    },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'withdrawn', 'completed', 'failed', 'audit'],
      default: 'enrolled'
    },
    dropDate: Date,
    withdrawalDate: Date,
    completionDate: Date
  },

  // Registration Details
  registrationInfo: {
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationMethod: {
      type: String,
      enum: ['online', 'in_person', 'advisor', 'admin'],
      default: 'online'
    },
    priority: {
      type: Number,
      default: 0
    },
    waitlistPosition: Number,
    addDropDeadline: Date,
    withdrawalDeadline: Date
  },

  // Prerequisites Check
  prerequisitesInfo: {
    prerequisitesMet: {
      type: Boolean,
      default: true
    },
    missingPrerequisites: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      waived: {
        type: Boolean,
        default: false
      },
      waivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      waiverReason: String
    }],
    overrideApproval: {
      approved: {
        type: Boolean,
        default: false
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      approvalReason: String,
      approvalDate: Date
    }
  },

  // Payment Information
  paymentInfo: {
    tuitionAmount: {
      type: Number,
      required: true,
      min: 0
    },
    feesAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'overdue', 'waived'],
      default: 'pending'
    },
    paymentDate: Date,
    paymentMethod: String,
    transactionId: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundDate: Date
  },

  // Attendance Tracking
  attendanceInfo: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 100
    },
    attendanceRecords: [{
      date: Date,
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused'],
        required: true
      },
      notes: String,
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      }
    }]
  },

  // Special Circumstances
  specialCircumstances: {
    isRepeatCourse: {
      type: Boolean,
      default: false
    },
    previousAttempts: [{
      semester: String,
      academicYear: String,
      grade: String,
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      }
    }],
    accommodations: [{
      type: String,
      description: String,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      approvalDate: Date
    }],
    isIncomplete: {
      type: Boolean,
      default: false
    },
    incompleteReason: String,
    incompleteDeadline: Date
  },

  // Notifications and Communications
  notifications: [{
    type: {
      type: String,
      enum: ['enrollment_confirmation', 'payment_reminder', 'attendance_warning', 'grade_posted', 'course_update'],
      required: true
    },
    message: String,
    sentDate: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    readDate: Date
  }],

  // Metadata
  notes: String,
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

// Compound index to ensure unique enrollment per student per course per semester
enrollmentSchema.index({ 
  student: 1, 
  course: 1, 
  semester: 1, 
  academicYear: 1 
}, { unique: true });

// Other indexes for performance
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ semester: 1, academicYear: 1 });
enrollmentSchema.index({ 'enrollmentInfo.status': 1 });
enrollmentSchema.index({ 'paymentInfo.paymentStatus': 1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  const startDate = this.enrollmentInfo.enrollmentDate;
  const endDate = this.enrollmentInfo.completionDate || 
                  this.enrollmentInfo.dropDate || 
                  this.enrollmentInfo.withdrawalDate || 
                  new Date();
  
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // days
});

// Method to calculate refund amount based on withdrawal date
enrollmentSchema.methods.calculateRefund = function() {
  if (this.enrollmentInfo.status !== 'withdrawn' && this.enrollmentInfo.status !== 'dropped') {
    return 0;
  }
  
  const withdrawalDate = this.enrollmentInfo.withdrawalDate || this.enrollmentInfo.dropDate;
  const enrollmentDate = this.enrollmentInfo.enrollmentDate;
  const daysDifference = Math.ceil((withdrawalDate - enrollmentDate) / (1000 * 60 * 60 * 24));
  
  // Refund policy: 100% if within 7 days, 50% if within 14 days, 0% after
  if (daysDifference <= 7) {
    return this.paymentInfo.totalAmount;
  } else if (daysDifference <= 14) {
    return this.paymentInfo.totalAmount * 0.5;
  }
  return 0;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
