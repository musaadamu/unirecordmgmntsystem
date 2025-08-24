const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  deputyHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    office: String,
    building: String
  },
  establishedDate: {
    type: Date,
    required: true
  },
  accreditation: {
    isAccredited: {
      type: Boolean,
      default: false
    },
    accreditationBody: String,
    accreditationDate: Date,
    expiryDate: Date
  },
  degreePrograms: [{
    name: String,
    level: {
      type: String,
      enum: ['undergraduate', 'graduate', 'postgraduate']
    },
    duration: {
      type: Number,
      required: true
    },
    totalCredits: {
      type: Number,
      required: true
    },
    requirements: [{
      type: String,
      description: String
    }]
  }],
  statistics: {
    totalStaff: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    totalGraduates: {
      type: Number,
      default: 0
    }
  },
  resources: {
    laboratories: [{
      name: String,
      capacity: Number,
      equipment: [String]
    }],
    libraries: [{
      name: String,
      capacity: Number,
      resources: [String]
    }],
    facilities: [String]
  },
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
  timestamps: true
});

departmentSchema.index({ code: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ faculty: 1 });
departmentSchema.index({ headOfDepartment: 1 });

module.exports = mongoose.model('Department', departmentSchema);
