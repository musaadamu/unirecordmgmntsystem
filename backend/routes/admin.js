const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const adminController = require('../controllers/adminController');
const passwordResetController = require('../controllers/passwordResetController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateObjectId, 
  handleValidationErrors,
  commonValidations 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');


const router = express.Router();

// --- TEMPORARY: Bootstrap first admin account if none exists ---
const User = require('../models/User');
const { USER_STATUS } = require('../config/constants');
router.post('/bootstrap',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
    body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('nationality').notEmpty().withMessage('Nationality is required'),
    body('phone').notEmpty().withMessage('Phone is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
      if (adminCount > 0) {
        return res.status(403).json({ success: false, message: 'Admin already exists. Bootstrap disabled.' });
      }
      const { email, password, firstName, lastName, dateOfBirth, gender, nationality, phone } = req.body;
      const userId = `ADMIN${Date.now().toString().slice(-6)}`;
      const admin = new User({
        userId,
        email: email.toLowerCase(),
        password,
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        personalInfo: {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          nationality
        },
        contactInfo: {
          phone
        },
        emailVerified: true
      });
      await admin.save();
      return res.status(201).json({ success: true, message: 'Admin account created', data: { email: admin.email } });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create admin', error: err.message });
    }
  }
);


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'users-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

/**
 * @route   POST /api/admin/users/bulk-register
 * @desc    Bulk register users
 * @access  Private (Admin only)
 */
router.post('/users/bulk-register',
  [
    body('users')
      .isArray({ min: 1, max: 100 })
      .withMessage('Users must be an array with 1-100 items'),
    body('users.*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required for each user'),
    body('users.*.role')
      .isIn(Object.values(USER_ROLES))
      .withMessage('Valid role is required for each user'),
    body('users.*.personalInfo.firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name is required for each user'),
    body('users.*.personalInfo.lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name is required for each user')
  ],
  handleValidationErrors,
  adminController.bulkRegisterUsers
);

/**
 * @route   POST /api/admin/users/import-csv
 * @desc    Import users from CSV file
 * @access  Private (Admin only)
 */
router.post('/users/import-csv',
  upload.single('csvFile'),
  adminController.importUsersFromCSV
);

/**
 * @route   GET /api/admin/users/export
 * @desc    Export users to CSV or JSON
 * @access  Private (Admin only)
 */
router.get('/users/export',
  adminController.exportUsersToCSV
);

/**
 * @route   PUT /api/admin/users/bulk-status
 * @desc    Update status of multiple users
 * @access  Private (Admin only)
 */
router.put('/users/bulk-status',
  [
    body('userIds')
      .isArray({ min: 1 })
      .withMessage('User IDs array is required'),
    body('userIds.*')
      .isMongoId()
      .withMessage('Valid user ID is required'),
    body('status')
      .isIn(['active', 'inactive', 'suspended', 'pending'])
      .withMessage('Valid status is required'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters')
  ],
  handleValidationErrors,
  adminController.bulkUpdateUserStatus
);

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Admin reset user password
 * @access  Private (Admin only)
 */
router.post('/users/:userId/reset-password',
  validateObjectId('userId'),
  [
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('sendEmail')
      .optional()
      .isBoolean()
      .withMessage('Send email must be a boolean')
  ],
  handleValidationErrors,
  passwordResetController.adminResetUserPassword
);

/**
 * @route   POST /api/admin/users/:userId/send-verification
 * @desc    Send email verification to user
 * @access  Private (Admin only)
 */
router.post('/users/:userId/send-verification',
  validateObjectId('userId'),
  handleValidationErrors,
  passwordResetController.sendEmailVerification
);

module.exports = router;
