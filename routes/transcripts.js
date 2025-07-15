const express = require('express');
const { body, param } = require('express-validator');

const transcriptController = require('../controllers/transcriptController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateObjectId, 
  handleValidationErrors 
} = require('../middleware/validation');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

/**
 * @route   POST /api/transcripts/generate/:studentId
 * @desc    Generate transcript for student
 * @access  Private
 */
router.post('/generate/:studentId',
  authenticate,
  validateObjectId('studentId'),
  [
    body('transcriptType')
      .optional()
      .isIn(['official', 'unofficial', 'partial', 'degree_audit'])
      .withMessage('Valid transcript type is required'),
    body('purpose')
      .optional()
      .isIn(['transfer', 'employment', 'graduate_school', 'personal', 'other'])
      .withMessage('Valid purpose is required')
  ],
  handleValidationErrors,
  transcriptController.generateTranscript
);

/**
 * @route   GET /api/transcripts/:id
 * @desc    Get transcript by ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  validateObjectId('id'),
  handleValidationErrors,
  transcriptController.getTranscriptById
);

/**
 * @route   GET /api/transcripts/student/:studentId
 * @desc    Get all transcripts for a student
 * @access  Private (Student - own transcripts, Staff/Admin - any student)
 */
router.get('/student/:studentId',
  authenticate,
  validateObjectId('studentId'),
  handleValidationErrors,
  transcriptController.getStudentTranscripts
);

/**
 * @route   POST /api/transcripts/request-official/:studentId
 * @desc    Request official transcript
 * @access  Private
 */
router.post('/request-official/:studentId',
  authenticate,
  validateObjectId('studentId'),
  [
    body('purpose')
      .isIn(['transfer', 'employment', 'graduate_school', 'personal', 'other'])
      .withMessage('Valid purpose is required'),
    body('deliveryMethod')
      .optional()
      .isIn(['electronic', 'mail', 'pickup', 'third_party'])
      .withMessage('Valid delivery method is required'),
    body('recipientInfo')
      .optional()
      .isObject()
      .withMessage('Recipient info must be an object'),
    body('recipientInfo.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Recipient name must be between 2 and 100 characters'),
    body('recipientInfo.email')
      .optional()
      .isEmail()
      .withMessage('Valid recipient email is required'),
    body('recipientInfo.address')
      .optional()
      .isObject()
      .withMessage('Recipient address must be an object')
  ],
  handleValidationErrors,
  transcriptController.requestOfficialTranscript
);

/**
 * @route   GET /api/transcripts/verify/:securityCode
 * @desc    Verify transcript authenticity
 * @access  Public
 */
router.get('/verify/:securityCode',
  [
    param('securityCode')
      .isLength({ min: 8, max: 32 })
      .withMessage('Invalid security code format')
  ],
  handleValidationErrors,
  transcriptController.verifyTranscript
);

module.exports = router;
