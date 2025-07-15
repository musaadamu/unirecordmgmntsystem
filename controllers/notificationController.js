const NotificationSettings = require('../models/NotificationSettings');
const EmailQueue = require('../models/EmailQueue');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const AuditLog = require('../models/AuditLog');

/**
 * Notification Settings Controllers
 */

// Get user notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can access these settings
    if (userId !== req.user._id.toString() && !req.effectivePermissions.includes('users:read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view notification settings'
      });
    }

    let settings = await NotificationSettings.findOne({ userId });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await NotificationSettings.createDefaultSettings(userId);
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
      error: error.message
    });
  }
};

// Update user notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Check if user can update these settings
    if (userId !== req.user._id.toString() && !req.effectivePermissions.includes('users:update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update notification settings'
      });
    }

    let settings = await NotificationSettings.findOne({ userId });
    
    if (!settings) {
      settings = await NotificationSettings.createDefaultSettings(userId);
    }

    // Update global settings
    if (updates.globalSettings) {
      Object.assign(settings.globalSettings, updates.globalSettings);
    }

    // Update preferences
    if (updates.preferences) {
      for (const preference of updates.preferences) {
        settings.updatePreference(preference.category, preference, req.user._id);
      }
    }

    // Update department overrides (admin only)
    if (updates.departmentOverrides && req.effectivePermissions.includes('users:manage')) {
      settings.departmentOverrides = updates.departmentOverrides;
    }

    // Update role overrides (admin only)
    if (updates.roleOverrides && req.effectivePermissions.includes('roles:assign')) {
      settings.roleOverrides = updates.roleOverrides;
    }

    settings._ipAddress = req.ip;
    settings._userAgent = req.get('User-Agent');
    
    await settings.save();

    res.json({
      success: true,
      data: { settings },
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
};

// Unsubscribe from notifications
const unsubscribeNotifications = async (req, res) => {
  try {
    const { token } = req.params;
    const { category } = req.query;

    const settings = await NotificationSettings.findOne({ 
      'globalSettings.unsubscribeToken': token 
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Invalid unsubscribe token'
      });
    }

    if (category) {
      // Unsubscribe from specific category
      settings.updatePreference(category, { enabled: false, frequency: 'disabled' }, settings.userId);
    } else {
      // Unsubscribe from all notifications
      settings.globalSettings.emailEnabled = false;
    }

    await settings.save();

    // Log unsubscribe action
    await AuditLog.logAction({
      action: 'notification_unsubscribed',
      userId: settings.userId,
      details: {
        category: category || 'all',
        unsubscribeToken: token
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      category: 'communication'
    });

    res.json({
      success: true,
      message: category ? 
        `Unsubscribed from ${category} notifications` : 
        'Unsubscribed from all notifications'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing unsubscribe request',
      error: error.message
    });
  }
};

/**
 * Email Template Controllers
 */

// Get email templates
const getEmailTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      language = 'en',
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = { language };
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [templates, total] = await Promise.all([
      EmailTemplate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'personalInfo.firstName personalInfo.lastName')
        .populate('approvedBy', 'personalInfo.firstName personalInfo.lastName'),
      EmailTemplate.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email templates',
      error: error.message
    });
  }
};

// Get single email template
const getEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('createdBy', 'personalInfo.firstName personalInfo.lastName')
      .populate('approvedBy', 'personalInfo.firstName personalInfo.lastName');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email template',
      error: error.message
    });
  }
};

// Create email template
const createEmailTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user._id,
      _ipAddress: req.ip,
      _userAgent: req.get('User-Agent')
    };

    const template = new EmailTemplate(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      data: { template },
      message: 'Email template created successfully'
    });
  } catch (error) {
    console.error('Create email template error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating email template',
      error: error.message
    });
  }
};

// Update email template
const updateEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    // Check if user can update this template
    if (template.isSystemTemplate && !req.effectivePermissions.includes('system:admin')) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify system templates'
      });
    }

    Object.assign(template, req.body);
    template._ipAddress = req.ip;
    template._userAgent = req.get('User-Agent');
    
    // Reset approval if content changed
    if (template.isModified(['htmlContent', 'textContent', 'subject'])) {
      template.approvedAt = undefined;
      template.approvedBy = undefined;
    }
    
    await template.save();

    res.json({
      success: true,
      data: { template },
      message: 'Email template updated successfully'
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email template',
      error: error.message
    });
  }
};

// Approve email template
const approveEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    template.approve(req.user._id);
    await template.save();

    res.json({
      success: true,
      data: { template },
      message: 'Email template approved successfully'
    });
  } catch (error) {
    console.error('Approve email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving email template',
      error: error.message
    });
  }
};

// Preview email template
const previewEmailTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { templateData = {} } = req.body;

    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    // Validate template data
    const validationErrors = template.validateData(templateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Template data validation failed',
        errors: validationErrors
      });
    }

    // Render template
    const preview = {
      subject: template.renderSubject(templateData),
      htmlContent: template.renderHtml(templateData),
      textContent: template.renderText(templateData)
    };

    res.json({
      success: true,
      data: { preview }
    });
  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error previewing email template',
      error: error.message
    });
  }
};

// Send test email
const sendTestEmail = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { recipients, templateData = {} } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients are required'
      });
    }

    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    // Create test email
    const email = await EmailQueue.createFromTemplate(
      templateId,
      recipients,
      templateData,
      {
        priority: 'low',
        triggeredBy: req.user._id,
        source: 'manual',
        tags: ['test']
      }
    );

    res.json({
      success: true,
      data: { emailId: email._id },
      message: 'Test email queued successfully'
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
};

/**
 * Email Analytics Controllers
 */

// Get email delivery statistics
const getEmailStats = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      department
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const filters = {};
    if (category) filters.category = category;
    if (department) filters['metadata.department'] = department;

    const [deliveryStats, categoryStats] = await Promise.all([
      emailService.getDeliveryStats(start, end, filters),
      emailService.getCategoryStats(start, end)
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        deliveryStats,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
};

// Send manual notification
const sendManualNotification = async (req, res) => {
  try {
    const { eventType, recipients, templateData, options = {} } = req.body;

    if (!eventType || !recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event type and recipients are required'
      });
    }

    const result = await notificationService.sendBulkNotification(
      eventType,
      recipients,
      templateData,
      {
        ...options,
        triggeredBy: req.user._id,
        source: 'manual'
      }
    );

    res.json({
      success: true,
      data: result,
      message: `Notification sent to ${result.queuedCount} recipients`
    });
  } catch (error) {
    console.error('Send manual notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};

module.exports = {
  // Notification settings
  getNotificationSettings,
  updateNotificationSettings,
  unsubscribeNotifications,
  
  // Email templates
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  approveEmailTemplate,
  previewEmailTemplate,
  sendTestEmail,
  
  // Analytics and manual sending
  getEmailStats,
  sendManualNotification
};
