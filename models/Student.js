const mongoose = require('mongoose');
const { ACADEMIC_STATUS } = require('../config/constants');

const studentSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Student Specific Information
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Academic Information
  academicInfo: {
    program: {
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
    level: {
      type: String,
      enum: ['undergraduate', 'graduate', 'postgraduate', 'phd'],
      required: true
    },
    yearOfStudy: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    semester: {
      type: String,
      enum: ['fall', 'spring', 'summer'],
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    expectedGraduation: {
      type: Date,
      required: true
    },
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },

  // Academic Status
  academicStatus: {
    status: {
      type: String,
      enum: Object.values(ACADEMIC_STATUS),
      default: ACADEMIC_STATUS.ENROLLED
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    completedCredits: {
      type: Number,
      default: 0
    },
    probationStatus: {
      type: Boolean,
      default: false
    },
    probationReason: String,
    honorsStatus: {
      type: String,
      enum: ['none', 'deans_list', 'honors', 'high_honors', 'highest_honors'],
      default: 'none'
    }
  },

  // Enrollment Information
  enrollmentInfo: {
    admissionDate: {
      type: Date,
      required: true
    },
    admissionType: {
      type: String,
      enum: ['regular', 'transfer', 'international', 'exchange'],
      required: true
    },
    previousEducation: [{
      institution: String,
      degree: String,
      graduationYear: Number,
      gpa: Number
    }],
    transferCredits: {
      type: Number,
      default: 0
    }
  },

  // Financial Information
  financialInfo: {
    tuitionStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'scholarship', 'financial_aid'],
      default: 'unpaid'
    },
    scholarships: [{
      name: String,
      amount: Number,
      academicYear: String,
      renewable: Boolean
    }],
    financialAid: [{
      type: String,
      amount: Number,
      academicYear: String
    }],
    outstandingBalance: {
      type: Number,
      default: 0
    }
  },

  // Parent/Guardian Information
  parentInfo: {
    father: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    mother: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    guardian: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },

  // Medical Information
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    medications: [String],
    emergencyMedicalContact: {
      name: String,
      phone: String,
      relationship: String
    },
    healthInsurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date
    }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['transcript', 'certificate', 'id_copy', 'medical_record', 'other'],
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
studentSchema.index({ studentId: 1 });
studentSchema.index({ user: 1 });
studentSchema.index({ 'academicInfo.department': 1 });
studentSchema.index({ 'academicInfo.program': 1 });
studentSchema.index({ 'academicInfo.academicYear': 1 });
studentSchema.index({ 'academicStatus.status': 1 });
studentSchema.index({ 'academicStatus.gpa': 1 });

// Virtual for academic standing
studentSchema.virtual('academicStanding').get(function() {
  const gpa = this.academicStatus.gpa;
  if (gpa >= 3.5) return 'Excellent';
  if (gpa >= 3.0) return 'Good';
  if (gpa >= 2.5) return 'Satisfactory';
  if (gpa >= 2.0) return 'Probation';
  return 'Academic Warning';
});

module.exports = mongoose.model('Student', studentSchema);
