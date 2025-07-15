const mongoose = require('mongoose');

const libraryRecordSchema = new mongoose.Schema({
  // User Information
  userInfo: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['student', 'faculty', 'staff', 'guest'],
      required: true
    },
    libraryCardNumber: {
      type: String,
      required: true,
      unique: true
    },
    membershipStatus: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'revoked'],
      default: 'active'
    },
    membershipExpiry: Date,
    borrowingPrivileges: {
      maxBooks: {
        type: Number,
        default: 5
      },
      maxRenewal: {
        type: Number,
        default: 2
      },
      loanPeriod: {
        type: Number,
        default: 14 // days
      },
      canReserve: {
        type: Boolean,
        default: true
      },
      canAccessDigital: {
        type: Boolean,
        default: true
      }
    }
  },

  // Current Loans
  currentLoans: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryItem'
    },
    checkoutDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    renewalCount: {
      type: Number,
      default: 0
    },
    isOverdue: {
      type: Boolean,
      default: false
    },
    overdueNotificationsSent: {
      type: Number,
      default: 0
    },
    lastNotificationDate: Date,
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],

  // Loan History
  loanHistory: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryItem'
    },
    checkoutDate: Date,
    dueDate: Date,
    returnDate: Date,
    renewalCount: Number,
    wasOverdue: Boolean,
    overdueDays: Number,
    fineAmount: Number,
    finePaid: Boolean,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged', 'lost']
    },
    notes: String
  }],

  // Reservations
  reservations: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryItem'
    },
    reservationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'ready', 'expired', 'cancelled', 'fulfilled'],
      default: 'active'
    },
    expiryDate: Date,
    notificationSent: Boolean,
    priority: {
      type: Number,
      default: 1
    },
    notes: String
  }],

  // Fines and Fees
  fines: [{
    type: {
      type: String,
      enum: ['overdue', 'lost_item', 'damage', 'processing', 'replacement', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    dateAssessed: {
      type: Date,
      default: Date.now
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'disputed'],
      default: 'pending'
    },
    paymentDate: Date,
    paymentMethod: String,
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waiverReason: String,
    relatedLoan: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],

  // Digital Access
  digitalAccess: {
    databases: [{
      name: String,
      accessLevel: {
        type: String,
        enum: ['basic', 'premium', 'full']
      },
      lastAccessed: Date,
      accessCount: {
        type: Number,
        default: 0
      }
    }],
    eBooks: [{
      title: String,
      isbn: String,
      checkoutDate: Date,
      expiryDate: Date,
      downloadCount: Number,
      platform: String
    }],
    onlineResources: [{
      resource: String,
      accessDate: Date,
      duration: Number, // in minutes
      ipAddress: String
    }]
  },

  // Research and Study
  researchActivities: [{
    type: {
      type: String,
      enum: ['research_consultation', 'instruction_session', 'workshop', 'tutorial']
    },
    date: Date,
    duration: Number,
    librarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    topic: String,
    resources: [String],
    outcome: String,
    followUpRequired: Boolean,
    notes: String
  }],

  studyRoomBookings: [{
    room: String,
    date: Date,
    startTime: String,
    endTime: String,
    purpose: String,
    attendees: Number,
    equipment: [String],
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'no_show', 'completed'],
      default: 'confirmed'
    },
    checkedIn: Boolean,
    checkedOut: Boolean,
    notes: String
  }],

  // Interlibrary Loans
  interlibrary: [{
    requestType: {
      type: String,
      enum: ['borrow', 'lend']
    },
    itemType: {
      type: String,
      enum: ['book', 'article', 'thesis', 'media', 'other']
    },
    title: String,
    author: String,
    isbn: String,
    requestDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['requested', 'processing', 'shipped', 'received', 'returned', 'cancelled'],
      default: 'requested'
    },
    lendingLibrary: String,
    cost: Number,
    dueDate: Date,
    notes: String
  }],

  // Preferences and Settings
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      dueDateReminders: {
        type: Boolean,
        default: true
      },
      overdueNotices: {
        type: Boolean,
        default: true
      },
      reservationAlerts: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareHistory: {
        type: Boolean,
        default: false
      },
      allowRecommendations: {
        type: Boolean,
        default: true
      }
    },
    interests: [String],
    favoriteSubjects: [String]
  },

  // Statistics and Analytics
  statistics: {
    totalItemsBorrowed: {
      type: Number,
      default: 0
    },
    totalFinesPaid: {
      type: Number,
      default: 0
    },
    averageLoanDuration: Number,
    mostBorrowedCategory: String,
    digitalResourcesAccessed: {
      type: Number,
      default: 0
    },
    researchConsultations: {
      type: Number,
      default: 0
    },
    studyRoomHours: {
      type: Number,
      default: 0
    }
  },

  // Account Status
  accountStatus: {
    status: {
      type: String,
      enum: ['active', 'suspended', 'blocked', 'expired'],
      default: 'active'
    },
    suspensionReason: String,
    suspensionDate: Date,
    suspensionEndDate: Date,
    blockedReason: String,
    lastActivity: Date,
    totalOutstandingFines: {
      type: Number,
      default: 0
    },
    maxFineThreshold: {
      type: Number,
      default: 50
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

// Indexes for performance
libraryRecordSchema.index({ 'userInfo.user': 1 });
libraryRecordSchema.index({ 'userInfo.libraryCardNumber': 1 });
libraryRecordSchema.index({ 'userInfo.membershipStatus': 1 });
libraryRecordSchema.index({ 'currentLoans.dueDate': 1 });
libraryRecordSchema.index({ 'currentLoans.isOverdue': 1 });
libraryRecordSchema.index({ 'accountStatus.status': 1 });
libraryRecordSchema.index({ 'fines.status': 1 });

// Virtual for total current loans
libraryRecordSchema.virtual('totalCurrentLoans').get(function() {
  return this.currentLoans.length;
});

// Virtual for total outstanding fines
libraryRecordSchema.virtual('totalOutstandingFines').get(function() {
  return this.fines
    .filter(fine => fine.status === 'pending')
    .reduce((total, fine) => total + fine.amount, 0);
});

// Virtual for overdue items count
libraryRecordSchema.virtual('overdueItemsCount').get(function() {
  return this.currentLoans.filter(loan => loan.isOverdue).length;
});

// Method to generate library card number
libraryRecordSchema.statics.generateLibraryCardNumber = function(userType) {
  const prefix = {
    'student': 'STU',
    'faculty': 'FAC',
    'staff': 'STA',
    'guest': 'GST'
  };
  
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix[userType]}${year}${random}`;
};

// Method to check if user can borrow more items
libraryRecordSchema.methods.canBorrowMore = function() {
  return this.currentLoans.length < this.userInfo.borrowingPrivileges.maxBooks &&
         this.accountStatus.status === 'active' &&
         this.totalOutstandingFines < this.accountStatus.maxFineThreshold;
};

// Method to calculate fine for overdue item
libraryRecordSchema.methods.calculateOverdueFine = function(loan) {
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  
  if (today <= dueDate) return 0;
  
  const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  const finePerDay = 0.50; // $0.50 per day
  const maxFine = 25.00; // Maximum fine of $25
  
  return Math.min(overdueDays * finePerDay, maxFine);
};

// Method to update overdue status
libraryRecordSchema.methods.updateOverdueStatus = function() {
  const today = new Date();
  let hasChanges = false;
  
  this.currentLoans.forEach(loan => {
    const wasOverdue = loan.isOverdue;
    loan.isOverdue = new Date(loan.dueDate) < today;
    
    if (loan.isOverdue && !wasOverdue) {
      hasChanges = true;
    }
  });
  
  return hasChanges;
};

// Pre-save middleware to update statistics
libraryRecordSchema.pre('save', function(next) {
  // Update total outstanding fines
  this.accountStatus.totalOutstandingFines = this.totalOutstandingFines;
  
  // Update last activity
  this.accountStatus.lastActivity = new Date();
  
  next();
});

module.exports = mongoose.model('LibraryRecord', libraryRecordSchema);
