const express = require('express');
const router = express.Router();

// Import controllers
const notificationController = require('../controllers/notificationController');

// Import middleware
const { 
  authenticate, 
  requirePermission, 
  requireAnyPermission 
} = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticate);

/**
 * Notification Settings Routes
 */

// GET /api/notifications/settings/:userId - Get user notification settings
router.get('/settings/:userId',
  notificationController.getNotificationSettings
);

// PUT /api/notifications/settings/:userId - Update user notification settings
router.put('/settings/:userId',
  notificationController.updateNotificationSettings
);

// GET /api/notifications/unsubscribe/:token - Unsubscribe from notifications
router.get('/unsubscribe/:token',
  notificationController.unsubscribeNotifications
);

/**
 * Email Template Management Routes (Admin only)
 */

// GET /api/notifications/templates - Get email templates
router.get('/templates',
  requirePermission('system:config'),
  notificationController.getEmailTemplates
);

// GET /api/notifications/templates/:id - Get single email template
router.get('/templates/:id',
  requirePermission('system:config'),
  notificationController.getEmailTemplate
);

// POST /api/notifications/templates - Create email template
router.post('/templates',
  requirePermission('system:config'),
  notificationController.createEmailTemplate
);

// PUT /api/notifications/templates/:id - Update email template
router.put('/templates/:id',
  requirePermission('system:config'),
  notificationController.updateEmailTemplate
);

// POST /api/notifications/templates/:id/approve - Approve email template
router.post('/templates/:id/approve',
  requirePermission('system:admin'),
  notificationController.approveEmailTemplate
);

// POST /api/notifications/templates/:templateId/preview - Preview email template
router.post('/templates/:templateId/preview',
  requirePermission('system:config'),
  notificationController.previewEmailTemplate
);

// POST /api/notifications/templates/:templateId/test - Send test email
router.post('/templates/:templateId/test',
  requirePermission('system:config'),
  notificationController.sendTestEmail
);

/**
 * Email Analytics Routes (Admin only)
 */

// GET /api/notifications/analytics/stats - Get email delivery statistics
router.get('/analytics/stats',
  requirePermission('audit:read'),
  notificationController.getEmailStats
);

/**
 * Manual Notification Routes (Admin only)
 */

// POST /api/notifications/send - Send manual notification
router.post('/send',
  requirePermission('notifications:create'),
  notificationController.sendManualNotification
);

/**
 * Email Tracking Routes (Public - no auth required)
 */

// GET /api/notifications/track/open/:messageId - Track email open
router.get('/track/open/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const EmailLog = require('../models/EmailLog');
    
    const emailLog = await EmailLog.findOne({ messageId });
    
    if (emailLog) {
      await emailLog.trackOpen(
        req.get('User-Agent'),
        req.ip,
        { /* location data could be added here */ }
      );
    }
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(pixel);
  } catch (error) {
    console.error('Email tracking error:', error);
    res.status(200).end(); // Always return success for tracking pixels
  }
});

// GET /api/notifications/track/click/:messageId - Track email click
router.get('/track/click/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { url } = req.query;
    const EmailLog = require('../models/EmailLog');
    
    const emailLog = await EmailLog.findOne({ messageId });
    
    if (emailLog && url) {
      await emailLog.trackClick(
        decodeURIComponent(url),
        req.get('User-Agent'),
        req.ip,
        { /* location data could be added here */ }
      );
    }
    
    // Redirect to the actual URL
    if (url) {
      res.redirect(decodeURIComponent(url));
    } else {
      res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click'
    });
  }
});

/**
 * Webhook Routes for Email Providers
 */

// POST /api/notifications/webhooks/sendgrid - SendGrid webhook
router.post('/webhooks/sendgrid', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    await emailService.handleWebhook('sendgrid', req.body);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// POST /api/notifications/webhooks/ses - AWS SES webhook
router.post('/webhooks/ses', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    await emailService.handleWebhook('ses', req.body);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SES webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// POST /api/notifications/webhooks/mailgun - Mailgun webhook
router.post('/webhooks/mailgun', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    await emailService.handleWebhook('mailgun', req.body);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    res.status(500).json({ success: false });
  }
});

/**
 * System Administration Routes
 */

// POST /api/notifications/system/test-config - Test email configuration
router.post('/system/test-config',
  requirePermission('system:admin'),
  async (req, res) => {
    try {
      const emailService = require('../services/emailService');
      const result = await emailService.testConfiguration();
      
      res.json({
        success: true,
        data: result,
        message: result.success ? 'Email configuration is working' : 'Email configuration failed'
      });
    } catch (error) {
      console.error('Test email config error:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing email configuration',
        error: error.message
      });
    }
  }
);

// POST /api/notifications/system/seed-templates - Seed default email templates
router.post('/system/seed-templates',
  requirePermission('system:admin'),
  async (req, res) => {
    try {
      const { seedEmailTemplates } = require('../utils/emailTemplates');
      const result = await seedEmailTemplates(req.user._id);
      
      res.json({
        success: true,
        data: result,
        message: 'Email templates seeded successfully'
      });
    } catch (error) {
      console.error('Seed email templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Error seeding email templates',
        error: error.message
      });
    }
  }
);

// GET /api/notifications/system/queue-stats - Get email queue statistics
router.get('/system/queue-stats',
  requirePermission('system:admin'),
  async (req, res) => {
    try {
      const emailQueueProcessor = require('../services/emailQueueProcessor');
      const stats = await emailQueueProcessor.getQueueStats();
      
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get queue stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching queue statistics',
        error: error.message
      });
    }
  }
);

// POST /api/notifications/system/cleanup-queue - Clean up email queue
router.post('/system/cleanup-queue',
  requirePermission('system:admin'),
  async (req, res) => {
    try {
      const emailQueueProcessor = require('../services/emailQueueProcessor');
      await emailQueueProcessor.cleanupJobs();
      
      res.json({
        success: true,
        message: 'Email queue cleanup completed'
      });
    } catch (error) {
      console.error('Queue cleanup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cleaning up queue',
        error: error.message
      });
    }
  }
);

// POST /api/notifications/system/process-queue - Manually process email queue
router.post('/system/process-queue',
  requirePermission('system:admin'),
  async (req, res) => {
    try {
      const emailService = require('../services/emailService');
      const result = await emailService.processEmailQueue(100);
      
      res.json({
        success: true,
        data: result,
        message: `Processed ${result.processed} emails`
      });
    } catch (error) {
      console.error('Process queue error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing email queue',
        error: error.message
      });
    }
  }
);

module.exports = router;
