const mongoose = require('mongoose');
const { COURSE_STATUS, SEMESTER_TYPES } = require('../config/constants');

const courseSchema = new mongoose.Schema({
  // Course Basic Information
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Academic Information
  academicInfo: {
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
      enum: ['undergraduate', 'graduate', 'postgraduate'],
      required: true
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    corequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }]
  },

  // Course Status and Availability
  status: {
    type: String,
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.ACTIVE
  },
  isElective: {
    type: Boolean,
    default: false
  },
  maxEnrollment: {
    type: Number,
    required: true,
    min: 1
  },

  // Course Content
  courseContent: {
    syllabus: String,
    learningOutcomes: [String],
    assessmentMethods: [{
      type: String,
      weight: Number,
      description: String
    }],
    textbooks: [{
      title: String,
      author: String,
      isbn: String,
      required: Boolean
    }],
    materials: [String]
  },

  // Grading Information
  gradingInfo: {
    gradingScale: {
      type: String,
      enum: ['letter', 'percentage', 'pass_fail'],
      default: 'letter'
    },
    passingGrade: {
      type: String,
      default: 'D'
    },
    gradingCriteria: [{
      component: String,
      weight: Number,
      description: String
    }]
  },

  // Course Offerings (Sections)
  offerings: [{
    section: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      enum: Object.values(SEMESTER_TYPES),
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    assistants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }],
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
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
      room: String,
      building: String
    }],
    enrolledStudents: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      enrollmentDate: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['enrolled', 'dropped', 'completed', 'failed'],
        default: 'enrolled'
      }
    }],
    capacity: {
      type: Number,
      required: true
    },
    waitlist: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      position: Number,
      dateAdded: {
        type: Date,
        default: Date.now
      }
    }],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Course Statistics
  statistics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    averageGrade: Number,
    passRate: Number,
    dropRate: Number,
    lastCalculated: Date
  },

  // Course Reviews and Feedback
  reviews: [{
    semester: String,
    academicYear: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    averageRating: Number,
    totalReviews: Number,
    comments: [String]
  }],

  // Metadata
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
courseSchema.index({ courseCode: 1 });
courseSchema.index({ 'academicInfo.department': 1 });
courseSchema.index({ 'academicInfo.faculty': 1 });
courseSchema.index({ 'academicInfo.level': 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'offerings.semester': 1, 'offerings.academicYear': 1 });
courseSchema.index({ 'offerings.instructor': 1 });

// Virtual for current enrollment count
courseSchema.virtual('currentEnrollment').get(function() {
  return this.offerings.reduce((total, offering) => {
    return total + offering.enrolledStudents.filter(enrollment => 
      enrollment.status === 'enrolled'
    ).length;
  }, 0);
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.maxEnrollment - this.currentEnrollment;
});

// Method to get current offering by semester and year
courseSchema.methods.getCurrentOffering = function(semester, academicYear) {
  return this.offerings.find(offering =>
    offering.semester === semester &&
    offering.academicYear === academicYear &&
    offering.isActive
  );
};

module.exports = mongoose.model('Course', courseSchema);
