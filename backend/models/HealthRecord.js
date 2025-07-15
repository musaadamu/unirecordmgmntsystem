const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  // Patient Information
  patientInfo: {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    medicalRecordNumber: {
      type: String,
      required: true,
      unique: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    }
  },

  // Medical History
  medicalHistory: {
    chronicConditions: [{
      condition: String,
      diagnosisDate: Date,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      status: {
        type: String,
        enum: ['active', 'resolved', 'managed', 'monitoring']
      },
      medications: [String],
      notes: String
    }],
    allergies: [{
      allergen: String,
      type: {
        type: String,
        enum: ['food', 'medication', 'environmental', 'other']
      },
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'life_threatening']
      },
      reaction: String,
      treatment: String,
      dateIdentified: Date
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      surgeon: String,
      complications: String,
      outcome: String
    }],
    familyHistory: [{
      condition: String,
      relationship: String,
      ageOfOnset: Number,
      notes: String
    }],
    socialHistory: {
      smokingStatus: {
        type: String,
        enum: ['never', 'former', 'current', 'unknown']
      },
      alcoholUse: {
        type: String,
        enum: ['never', 'occasional', 'moderate', 'heavy', 'unknown']
      },
      exerciseFrequency: {
        type: String,
        enum: ['none', 'light', 'moderate', 'heavy', 'unknown']
      },
      dietaryRestrictions: [String],
      occupationalHazards: [String]
    }
  },

  // Immunizations
  immunizations: [{
    vaccine: {
      type: String,
      required: true
    },
    dateAdministered: Date,
    doseNumber: Number,
    lotNumber: String,
    manufacturer: String,
    administeredBy: String,
    location: String,
    nextDueDate: Date,
    reactions: String,
    exemptionReason: String,
    exemptionType: {
      type: String,
      enum: ['medical', 'religious', 'philosophical']
    }
  }],

  // Health Visits and Encounters
  healthVisits: [{
    visitDate: {
      type: Date,
      required: true
    },
    visitType: {
      type: String,
      enum: [
        'routine_checkup', 'illness', 'injury', 'follow_up', 'emergency',
        'mental_health', 'preventive_care', 'vaccination', 'screening', 'other'
      ],
      required: true
    },
    provider: {
      name: String,
      title: String,
      department: String,
      license: String
    },
    chiefComplaint: String,
    symptoms: [String],
    vitalSigns: {
      height: Number, // in cm
      weight: Number, // in kg
      bmi: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      temperature: Number, // in Celsius
      respiratoryRate: Number,
      oxygenSaturation: Number
    },
    examination: {
      general: String,
      systems: [{
        system: String,
        findings: String,
        normal: Boolean
      }]
    },
    diagnosis: [{
      primary: Boolean,
      icdCode: String,
      description: String,
      severity: String
    }],
    treatment: {
      medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }],
      procedures: [{
        name: String,
        description: String,
        performedBy: String,
        outcome: String
      }],
      referrals: [{
        specialist: String,
        reason: String,
        urgency: {
          type: String,
          enum: ['routine', 'urgent', 'emergent']
        }
      }]
    },
    followUp: {
      required: Boolean,
      timeframe: String,
      instructions: String,
      scheduledDate: Date
    },
    notes: String,
    visitDuration: Number, // in minutes
    visitOutcome: {
      type: String,
      enum: ['resolved', 'improved', 'stable', 'worsened', 'referred', 'follow_up_needed']
    }
  }],

  // Mental Health Records
  mentalHealth: {
    screenings: [{
      screeningType: String,
      date: Date,
      score: Number,
      interpretation: String,
      recommendedActions: [String],
      conductedBy: String
    }],
    counselingSessions: [{
      date: Date,
      duration: Number,
      type: {
        type: String,
        enum: ['individual', 'group', 'family', 'crisis']
      },
      counselor: String,
      sessionNotes: String,
      goals: [String],
      progress: String,
      nextSession: Date
    }],
    mentalHealthConditions: [{
      condition: String,
      diagnosisDate: Date,
      severity: String,
      treatment: String,
      medications: [String],
      status: String
    }]
  },

  // Health Clearances and Restrictions
  clearances: [{
    type: {
      type: String,
      enum: [
        'sports_participation', 'clinical_rotation', 'laboratory_work',
        'field_trip', 'study_abroad', 'dormitory_residence', 'food_service'
      ]
    },
    status: {
      type: String,
      enum: ['cleared', 'cleared_with_restrictions', 'not_cleared', 'pending']
    },
    restrictions: [String],
    validFrom: Date,
    validUntil: Date,
    issuedBy: String,
    requirements: [String],
    notes: String
  }],

  // Health Insurance Information
  insurance: {
    primary: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      subscriberName: String,
      relationship: String,
      effectiveDate: Date,
      expirationDate: Date
    },
    secondary: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      subscriberName: String,
      relationship: String,
      effectiveDate: Date,
      expirationDate: Date
    }
  },

  // Health Alerts and Flags
  alerts: [{
    type: {
      type: String,
      enum: ['allergy', 'medical_condition', 'medication', 'behavioral', 'infectious_disease']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    active: {
      type: Boolean,
      default: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    createdBy: String
  }],

  // Privacy and Access Control
  privacy: {
    consentForTreatment: {
      given: Boolean,
      date: Date,
      witnessedBy: String
    },
    consentForDisclosure: {
      given: Boolean,
      date: Date,
      limitations: [String]
    },
    accessLog: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessDate: {
        type: Date,
        default: Date.now
      },
      accessType: {
        type: String,
        enum: ['view', 'edit', 'print', 'export']
      },
      ipAddress: String,
      reason: String
    }],
    restrictedAccess: {
      isRestricted: Boolean,
      authorizedPersonnel: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      restrictionReason: String
    }
  },

  // Record Status and Metadata
  recordStatus: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived', 'transferred'],
      default: 'active'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    lastReviewed: Date,
    reviewedBy: String,
    nextReviewDate: Date,
    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
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

// Indexes for performance and security
healthRecordSchema.index({ 'patientInfo.student': 1 });
healthRecordSchema.index({ 'patientInfo.medicalRecordNumber': 1 });
healthRecordSchema.index({ 'healthVisits.visitDate': 1 });
healthRecordSchema.index({ 'recordStatus.status': 1 });
healthRecordSchema.index({ 'privacy.restrictedAccess.isRestricted': 1 });

// Virtual for current age
healthRecordSchema.virtual('currentAge').get(function() {
  if (this.patientInfo.student && this.patientInfo.student.personalInfo && this.patientInfo.student.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.patientInfo.student.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Method to generate medical record number
healthRecordSchema.statics.generateMedicalRecordNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `MRN${year}${random}`;
};

// Method to check if immunizations are up to date
healthRecordSchema.methods.areImmunizationsUpToDate = function() {
  const requiredVaccines = ['MMR', 'Hepatitis B', 'Meningococcal', 'Tdap'];
  const currentVaccines = this.immunizations.map(imm => imm.vaccine);
  return requiredVaccines.every(vaccine => currentVaccines.includes(vaccine));
};

// Method to get active alerts
healthRecordSchema.methods.getActiveAlerts = function() {
  return this.alerts.filter(alert => 
    alert.active && 
    (!alert.expiryDate || new Date(alert.expiryDate) > new Date())
  );
};

// Method to calculate BMI
healthRecordSchema.methods.calculateBMI = function(height, weight) {
  if (height && weight) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
};

// Pre-save middleware to update record completeness
healthRecordSchema.pre('save', function(next) {
  let completeness = 0;
  const fields = [
    'patientInfo.bloodType',
    'patientInfo.emergencyContact.name',
    'medicalHistory.allergies',
    'immunizations',
    'insurance.primary.provider'
  ];
  
  fields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completeness += 20;
    }
  });
  
  this.recordStatus.completeness = completeness;
  next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
