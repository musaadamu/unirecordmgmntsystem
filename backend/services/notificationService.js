const EventEmitter = require('events');
const EmailQueue = require('../models/EmailQueue');
const EmailTemplate = require('../models/EmailTemplate');
const NotificationSettings = require('../models/NotificationSettings');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

class NotificationService extends EventEmitter {
  /**
   * Handle role updated event
   */
  async handleRoleUpdated(eventData, options) {
    // Example: Notify user about role update
    const { userId, roleId, updatedBy, changes } = eventData;
    try {
      const [user, role] = await Promise.all([
        User.findById(userId),
        require('../models/Role').findById(roleId)
      ]);
      if (!user || !role) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'role_changes');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'role_update',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        role: {
          name: role.name,
          description: role.description
        },
        changes: changes || {},
        updatedBy: updatedBy ? await this.getUserName(updatedBy) : 'System',
        updatedAt: new Date().toISOString(),
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: updatedBy,
          eventId: `role_updated_${userId}_${roleId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Role update notification queued for ${user.email}`);
    } catch (error) {
      console.error('Role updated notification error:', error);
    }
  }

  /**
   * Handle permission granted event
   */
  async handlePermissionGranted(eventData, options) {
    // Example: Notify user about permission grant
    const { userId, permission, grantedBy } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'permission_updates');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'permission_granted',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        permission,
        grantedBy: grantedBy ? await this.getUserName(grantedBy) : 'System',
        grantedAt: new Date().toISOString(),
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: grantedBy,
          eventId: `permission_granted_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Permission granted notification queued for ${user.email}`);
    } catch (error) {
      console.error('Permission granted notification error:', error);
    }
  }

  /**
   * Handle permission revoked event
   */
  async handlePermissionRevoked(eventData, options) {
    // Example: Notify user about permission revocation
    const { userId, permission, revokedBy } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'permission_updates');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'permission_revoked',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        permission,
        revokedBy: revokedBy ? await this.getUserName(revokedBy) : 'System',
        revokedAt: new Date().toISOString(),
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: revokedBy,
          eventId: `permission_revoked_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Permission revoked notification queued for ${user.email}`);
    } catch (error) {
      console.error('Permission revoked notification error:', error);
    }
  }

  /**
   * Handle permission updated event
   */
  async handlePermissionUpdated(eventData, options) {
    // Example: Notify user about permission update
    const { userId, permission, updatedBy, changes } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'permission_updates');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'permission_updated',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        permission,
        changes: changes || {},
        updatedBy: updatedBy ? await this.getUserName(updatedBy) : 'System',
        updatedAt: new Date().toISOString(),
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: updatedBy,
          eventId: `permission_updated_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Permission updated notification queued for ${user.email}`);
    } catch (error) {
      console.error('Permission updated notification error:', error);
    }
  }

  /**
   * Handle access denied event
   */
  async handleAccessDenied(eventData, options) {
    // Example: Notify user about access denied
    const { userId, resource, attemptedAction, ipAddress } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'security_alerts');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'access_denied',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        resource,
        attemptedAction,
        timestamp: new Date().toISOString(),
        ipAddress,
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'medium',
          triggeredBy: userId,
          eventId: `access_denied_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`🚫 Access denied notification queued for ${user.email}`);
    } catch (error) {
      console.error('Access denied notification error:', error);
    }
  }

  /**
   * Handle suspicious activity event
   */
  async handleSuspiciousActivity(eventData, options) {
    // Example: Notify user about suspicious activity
    const { userId, activityType, details, ipAddress } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'security_alerts');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'suspicious_activity',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        activityType,
        details,
        timestamp: new Date().toISOString(),
        ipAddress,
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: userId,
          eventId: `suspicious_activity_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`⚠️ Suspicious activity notification queued for ${user.email}`);
    } catch (error) {
      console.error('Suspicious activity notification error:', error);
    }
  }

  /**
   * Handle system maintenance event
   */
  async handleSystemMaintenance(eventData, options) {
    // Example: Notify all users about system maintenance
    const { scheduledAt, duration, message } = eventData;
    try {
      // In a real implementation, you would fetch all users or a subset
      // For demo, just log the event
      console.log(`🔧 System maintenance scheduled at ${scheduledAt} for ${duration} minutes. Message: ${message}`);
      // You could queue emails or notifications here
    } catch (error) {
      console.error('System maintenance notification error:', error);
    }
  }

  /**
   * Handle account updated event
   */
  async handleAccountUpdated(eventData, options) {
    // Example: Notify user about account update
    const { userId, updatedBy, changes } = eventData;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const shouldNotify = await this.shouldSendNotification(userId, 'account_updates');
      if (!shouldNotify) return;
      const template = await EmailTemplate.findOne({
        category: 'account_updated',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      if (!template) return;
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        changes: changes || {},
        updatedBy: updatedBy ? await this.getUserName(updatedBy) : 'System',
        updatedAt: new Date().toISOString(),
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'medium',
          triggeredBy: updatedBy,
          eventId: `account_updated_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Account updated notification queued for ${user.email}`);
    } catch (error) {
      console.error('Account updated notification error:', error);
    }
  }

  /**
   * Handle approval completed event
   */
  async handleApprovalCompleted(eventData, options) {
    // Example: Notify requester and approver about approval completion
    const { requestId, approvedBy, requesterId, status, details } = eventData;
    try {
      const [requester, approver] = await Promise.all([
        User.findById(requesterId),
        User.findById(approvedBy)
      ]);
      if (!requester || !approver) return;
      const template = await EmailTemplate.findOne({
        category: 'approval_completed',
        isActive: true
      });
      if (!template) return;
      const templateData = {
        requester: {
          firstName: requester.personalInfo.firstName,
          lastName: requester.personalInfo.lastName,
          email: requester.email
        },
        approver: {
          firstName: approver.personalInfo.firstName,
          lastName: approver.personalInfo.lastName,
          email: approver.email
        },
        request: {
          id: requestId,
          status,
          details,
          completedAt: new Date().toISOString()
        },
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      // Notify requester
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: requester.email, name: `${requester.personalInfo.firstName} ${requester.personalInfo.lastName}`, userId: requester._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: approvedBy,
          eventId: `approval_completed_${requestId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      // Notify approver
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: approver.email, name: `${approver.personalInfo.firstName} ${approver.personalInfo.lastName}`, userId: approver._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: approvedBy,
          eventId: `approval_completed_${requestId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      console.log(`✅ Approval completed notifications queued for requester and approver`);
    } catch (error) {
      console.error('Approval completed notification error:', error);
    }
  }
  constructor() {
    super();
    this.setupEventListeners();
    console.log('✅ Notification service initialized');
  }

  /**
   * Setup event listeners for RBAC events
   */
  setupEventListeners() {
    // Role assignment events
    this.on('role_assigned', this.handleRoleAssigned.bind(this));
    this.on('role_removed', this.handleRoleRemoved.bind(this));
    this.on('role_updated', this.handleRoleUpdated.bind(this));
    
    // Permission events
    this.on('permission_granted', this.handlePermissionGranted.bind(this));
    this.on('permission_revoked', this.handlePermissionRevoked.bind(this));
    this.on('permission_updated', this.handlePermissionUpdated.bind(this));
    
    // Security events
    this.on('security_alert', this.handleSecurityAlert.bind(this));
    this.on('access_denied', this.handleAccessDenied.bind(this));
    this.on('suspicious_activity', this.handleSuspiciousActivity.bind(this));
    
    // System events
    this.on('system_maintenance', this.handleSystemMaintenance.bind(this));
    this.on('account_created', this.handleAccountCreated.bind(this));
    this.on('account_updated', this.handleAccountUpdated.bind(this));
    
    // Approval events
    this.on('approval_request', this.handleApprovalRequest.bind(this));
    this.on('approval_completed', this.handleApprovalCompleted.bind(this));
  }

  /**
   * Send notification based on event data
   */
  async sendNotification(eventType, eventData, options = {}) {
    try {
      // Emit event for processing
      this.emit(eventType, eventData, options);
      
      // Log notification event
      await AuditLog.logAction({
        action: 'notification_triggered',
        userId: eventData.triggeredBy || eventData.userId,
        targetUserId: eventData.targetUserId,
        details: {
          eventType,
          category: this.getEventCategory(eventType),
          recipientCount: eventData.recipients?.length || 1,
          priority: options.priority || 'medium'
        },
        ipAddress: options.ipAddress || 'system',
        userAgent: options.userAgent || 'notification-service',
        category: 'communication'
      });
      
      return { success: true, eventType };
    } catch (error) {
      console.error('Notification send error:', error);
      throw error;
    }
  }

  /**
   * Handle role assigned event
   */
  async handleRoleAssigned(eventData, options) {
    const { userId, roleId, assignedBy, expiresAt, department } = eventData;
    
    try {
      // Get user and role information
      const [user, role] = await Promise.all([
        User.findById(userId),
        require('../models/Role').findById(roleId)
      ]);
      
      if (!user || !role) return;
      
      // Check user notification preferences
      const shouldNotify = await this.shouldSendNotification(userId, 'role_changes');
      if (!shouldNotify) return;
      
      // Find appropriate template
      const template = await EmailTemplate.findOne({
        category: 'role_assignment',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      
      if (!template) {
        console.warn('No role assignment template found');
        return;
      }
      
      // Prepare template data
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        role: {
          name: role.name,
          description: role.description,
          level: role.level,
          category: role.category
        },
        assignment: {
          assignedBy: assignedBy ? await this.getUserName(assignedBy) : 'System',
          assignedAt: new Date().toISOString(),
          expiresAt: expiresAt,
          department: department
        },
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      
      // Queue email
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: assignedBy,
          eventId: `role_assigned_${userId}_${roleId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      
      console.log(`✅ Role assignment notification queued for ${user.email}`);
    } catch (error) {
      console.error('Role assigned notification error:', error);
    }
  }

  /**
   * Handle role removed event
   */
  async handleRoleRemoved(eventData, options) {
    const { userId, roleId, removedBy, reason } = eventData;
    
    try {
      const [user, role] = await Promise.all([
        User.findById(userId),
        require('../models/Role').findById(roleId)
      ]);
      
      if (!user || !role) return;
      
      const shouldNotify = await this.shouldSendNotification(userId, 'role_changes');
      if (!shouldNotify) return;
      
      const template = await EmailTemplate.findOne({
        name: 'role_removed',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      
      if (!template) return;
      
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        role: {
          name: role.name,
          description: role.description
        },
        removal: {
          removedBy: removedBy ? await this.getUserName(removedBy) : 'System',
          removedAt: new Date().toISOString(),
          reason: reason || 'Administrative action'
        },
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: removedBy,
          eventId: `role_removed_${userId}_${roleId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      
      console.log(`✅ Role removal notification queued for ${user.email}`);
    } catch (error) {
      console.error('Role removed notification error:', error);
    }
  }

  /**
   * Handle security alert event
   */
  async handleSecurityAlert(eventData, options) {
    const { userId, alertType, severity, details, ipAddress } = eventData;
    
    try {
      const user = await User.findById(userId);
      if (!user) return;
      
      const shouldNotify = await this.shouldSendNotification(userId, 'security_alerts');
      if (!shouldNotify) return;
      
      const template = await EmailTemplate.findOne({
        category: 'security_alert',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      
      if (!template) return;
      
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email
        },
        alert: {
          type: alertType,
          severity: severity,
          timestamp: new Date().toISOString(),
          ipAddress: ipAddress,
          details: details,
          location: await this.getLocationFromIP(ipAddress)
        },
        actions: {
          changePassword: `${process.env.FRONTEND_URL}/change-password`,
          reviewSecurity: `${process.env.FRONTEND_URL}/security`,
          contactSupport: process.env.SUPPORT_EMAIL || 'support@university.edu'
        },
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000'
        }
      };
      
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: severity === 'critical' ? 'critical' : 'high',
          triggeredBy: userId,
          eventId: `security_alert_${userId}_${alertType}_${Date.now()}`,
          source: 'automatic'
        }
      );
      
      console.log(`🚨 Security alert notification queued for ${user.email}`);
    } catch (error) {
      console.error('Security alert notification error:', error);
    }
  }

  /**
   * Handle account created event (welcome email)
   */
  async handleAccountCreated(eventData, options) {
    const { userId, createdBy, temporaryPassword } = eventData;
    
    try {
      const user = await User.findById(userId);
      if (!user) return;
      
      const template = await EmailTemplate.findOne({
        category: 'welcome',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      
      if (!template) return;
      
      const templateData = {
        user: {
          firstName: user.personalInfo.firstName,
          lastName: user.personalInfo.lastName,
          email: user.email,
          role: user.role
        },
        account: {
          createdBy: createdBy ? await this.getUserName(createdBy) : 'System',
          createdAt: new Date().toISOString(),
          temporaryPassword: temporaryPassword,
          loginUrl: `${process.env.FRONTEND_URL}/login`
        },
        nextSteps: [
          'Log in using your email and temporary password',
          'Change your password immediately',
          'Complete your profile information',
          'Review your assigned roles and permissions'
        ],
        system: {
          name: 'University Record Management System',
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
        }
      };
      
      await EmailQueue.createFromTemplate(
        template._id,
        [{ email: user.email, name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`, userId: user._id }],
        templateData,
        {
          priority: 'high',
          triggeredBy: createdBy,
          eventId: `account_created_${userId}_${Date.now()}`,
          source: 'automatic'
        }
      );
      
      console.log(`👋 Welcome email queued for ${user.email}`);
    } catch (error) {
      console.error('Account created notification error:', error);
    }
  }

  /**
   * Handle approval request event
   */
  async handleApprovalRequest(eventData, options) {
    const { requestId, requestType, requestedBy, approvers, details } = eventData;
    
    try {
      // Get approver users
      const approverUsers = await User.find({ _id: { $in: approvers } });
      const requester = await User.findById(requestedBy);
      
      if (!requester || approverUsers.length === 0) return;
      
      const template = await EmailTemplate.findOne({
        category: 'approval_request',
        isActive: true
      });
      
      if (!template) return;
      
      // Send to each approver
      for (const approver of approverUsers) {
        const shouldNotify = await this.shouldSendNotification(approver._id, 'approval_requests');
        if (!shouldNotify) continue;
        
        const templateData = {
          approver: {
            firstName: approver.personalInfo.firstName,
            lastName: approver.personalInfo.lastName
          },
          requester: {
            firstName: requester.personalInfo.firstName,
            lastName: requester.personalInfo.lastName,
            email: requester.email
          },
          request: {
            id: requestId,
            type: requestType,
            details: details,
            requestedAt: new Date().toISOString(),
            approvalUrl: `${process.env.FRONTEND_URL}/admin/approvals/${requestId}`
          },
          system: {
            name: 'University Record Management System',
            url: process.env.FRONTEND_URL || 'http://localhost:3000'
          }
        };
        
        await EmailQueue.createFromTemplate(
          template._id,
          [{ email: approver.email, name: `${approver.personalInfo.firstName} ${approver.personalInfo.lastName}`, userId: approver._id }],
          templateData,
          {
            priority: 'high',
            triggeredBy: requestedBy,
            eventId: `approval_request_${requestId}_${approver._id}_${Date.now()}`,
            source: 'automatic'
          }
        );
      }
      
      console.log(`📋 Approval request notifications queued for ${approverUsers.length} approvers`);
    } catch (error) {
      console.error('Approval request notification error:', error);
    }
  }

  /**
   * Check if user should receive notification for category
   */
  async shouldSendNotification(userId, category) {
    try {
      const settings = await NotificationSettings.findOne({ userId });
      
      if (!settings) {
        // Create default settings if not exists
        await NotificationSettings.createDefaultSettings(userId);
        return true; // Default to sending notifications
      }
      
      if (!settings.globalSettings.emailEnabled) {
        return false;
      }
      
      const preference = settings.getPreference(category);
      return preference && preference.enabled && preference.frequency !== 'disabled';
    } catch (error) {
      console.error('Notification preference check error:', error);
      return true; // Default to sending on error
    }
  }

  /**
   * Get user name for display
   */
  async getUserName(userId) {
    try {
      const user = await User.findById(userId).select('personalInfo.firstName personalInfo.lastName');
      if (!user) return 'Unknown User';
      return `${user.personalInfo.firstName} ${user.personalInfo.lastName}`;
    } catch (error) {
      return 'Unknown User';
    }
  }

  /**
   * Get location from IP address (placeholder)
   */
  async getLocationFromIP(ipAddress) {
    // In a real implementation, you would use a service like MaxMind GeoIP
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }

  /**
   * Get event category for audit logging
   */
  getEventCategory(eventType) {
    const categoryMap = {
      'role_assigned': 'role_changes',
      'role_removed': 'role_changes',
      'role_updated': 'role_changes',
      'permission_granted': 'permission_updates',
      'permission_revoked': 'permission_updates',
      'permission_updated': 'permission_updates',
      'security_alert': 'security_alerts',
      'access_denied': 'security_alerts',
      'suspicious_activity': 'security_alerts',
      'system_maintenance': 'system_maintenance',
      'account_created': 'account_updates',
      'account_updated': 'account_updates',
      'approval_request': 'approval_requests',
      'approval_completed': 'approval_requests'
    };
    
    return categoryMap[eventType] || 'notification';
  }

  /**
   * Send bulk notification to multiple users
   */
  async sendBulkNotification(eventType, recipients, templateData, options = {}) {
    try {
      const template = await EmailTemplate.findOne({
        category: this.getEventCategory(eventType),
        isActive: true
      });
      
      if (!template) {
        throw new Error(`No template found for event type: ${eventType}`);
      }
      
      const batchId = `bulk_${eventType}_${Date.now()}`;
      const emails = [];
      
      for (const recipient of recipients) {
        const user = await User.findById(recipient.userId || recipient._id);
        if (!user) continue;
        
        const shouldNotify = await this.shouldSendNotification(user._id, this.getEventCategory(eventType));
        if (!shouldNotify) continue;
        
        emails.push({
          to: [{ 
            email: user.email, 
            name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
            userId: user._id 
          }],
          templateId: template._id,
          templateData: {
            ...templateData,
            user: {
              firstName: user.personalInfo.firstName,
              lastName: user.personalInfo.lastName,
              email: user.email
            }
          },
          category: template.category,
          priority: options.priority || 'medium',
          metadata: {
            triggeredBy: options.triggeredBy,
            batchId: batchId,
            eventId: `${eventType}_bulk_${Date.now()}`,
            source: 'bulk'
          }
        });
      }
      
      if (emails.length > 0) {
        await EmailQueue.createBulk(emails);
        console.log(`📧 Bulk notification queued for ${emails.length} recipients`);
      }
      
      return { success: true, queuedCount: emails.length, batchId };
    } catch (error) {
      console.error('Bulk notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
