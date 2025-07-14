const express = require('express');
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');

const passwordResetController = require('../controllers/passwordResetController');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 password reset requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message: 'Too many verification attempts, please try again later.'
  }
});

/**
 * @route   POST /api/password-reset/request
 * @desc    Request password reset
 * @access  Public
 */
router.post('/request',
  passwordResetLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  passwordResetController.requestPasswordReset
);

/**
 * @route   GET /api/password-reset/verify/:token
 * @desc    Verify reset token validity
 * @access  Public
 */
router.get('/verify/:token',
  passwordResetVerifyLimiter,
  [
    param('token')
      .isLength({ min: 32, max: 32 })
      .withMessage('Invalid token format')
  ],
  handleValidationErrors,
  passwordResetController.verifyResetToken
);

/**
 * @route   POST /api/password-reset/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset',
  passwordResetLimiter,
  [
    body('token')
      .isLength({ min: 32, max: 32 })
      .withMessage('Invalid token format'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  passwordResetController.resetPassword
);

/**
 * @route   POST /api/password-reset/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email',
  [
    body('token')
      .isLength({ min: 32, max: 32 })
      .withMessage('Invalid verification token format')
  ],
  handleValidationErrors,
  passwordResetController.verifyEmail
);

module.exports = router;
