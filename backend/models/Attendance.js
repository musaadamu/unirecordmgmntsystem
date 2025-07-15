const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  section: {
    type: String,
    required: true
  },

  // Class Session Information
  sessionInfo: {
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    sessionType: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'seminar', 'exam', 'other'],
      default: 'lecture'
    },
    topic: String,
    location: {
      room: String,
      building: String
    }
  },

  // Attendance Status
  attendanceStatus: {
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused', 'partial'],
      required: true
    },
    arrivalTime: Date,
    departureTime: Date,
    minutesLate: {
      type: Number,
      default: 0
    },
    minutesPresent: Number,
    excuseReason: String,
    excuseDocumentation: String
  },

  // Recording Information
  recordingInfo: {
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recordingMethod: {
      type: String,
      enum: ['manual', 'biometric', 'rfid', 'qr_code', 'mobile_app', 'other'],
      default: 'manual'
    },
    recordingTime: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      deviceId: String,
      ipAddress: String,
      location: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Modifications and Appeals
  modifications: [{
    originalStatus: String,
    newStatus: String,
    reason: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modificationDate: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date
  }],

  appeals: [{
    reason: String,
    description: String,
    submittedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    decision: String
  }],

  // Additional Information
  notes: String,
  flags: {
    isExcused: {
      type: Boolean,
      default: false
    },
    requiresFollowUp: {
      type: Boolean,
      default: false
    },
    isDisputed: {
      type: Boolean,
      default: false
    }
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

// Compound index to ensure unique attendance record per student per session
attendanceSchema.index({
  student: 1,
  course: 1,
  'sessionInfo.date': 1,
  'sessionInfo.startTime': 1
}, { unique: true });

// Other indexes for performance
attendanceSchema.index({ student: 1 });
attendanceSchema.index({ course: 1 });
attendanceSchema.index({ instructor: 1 });
attendanceSchema.index({ semester: 1, academicYear: 1 });
attendanceSchema.index({ 'sessionInfo.date': 1 });
attendanceSchema.index({ 'attendanceStatus.status': 1 });

// Virtual for attendance percentage calculation
attendanceSchema.virtual('isPresent').get(function() {
  return ['present', 'late', 'partial'].includes(this.attendanceStatus.status);
});

// Method to calculate attendance duration
attendanceSchema.methods.calculateDuration = function() {
  if (this.attendanceStatus.arrivalTime && this.attendanceStatus.departureTime) {
    return Math.round((this.attendanceStatus.departureTime - this.attendanceStatus.arrivalTime) / (1000 * 60)); // minutes
  }
  return null;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
