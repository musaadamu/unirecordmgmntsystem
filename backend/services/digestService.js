const NotificationSettings = require('../models/NotificationSettings');
const EmailQueue = require('../models/EmailQueue');
const EmailTemplate = require('../models/EmailTemplate');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');

class DigestService {
  /**
   * Generate and send digest emails
   */
  async generateAndSendDigest(digestType, userId = null, startDate = null, endDate = null) {
    try {
      const results = {
        emailsSent: 0,
        errors: []
      };

      // Set date range based on digest type
      const { start, end } = this.getDateRange(digestType, startDate, endDate);

      // Get users who want digest notifications
      const users = await this.getUsersForDigest(digestType, userId);

      for (const user of users) {
        try {
          const digestData = await this.generateDigestData(user._id, start, end, digestType);
          
          // Skip if no significant activity
          if (!this.hasSignificantActivity(digestData)) {
            continue;
          }

          await this.sendDigestEmail(user, digestData, digestType);
          results.emailsSent++;
        } catch (error) {
          console.error(`Digest error for user ${user._id}:`, error);
          results.errors.push({
            userId: user._id,
            error: error.message
          });
        }
      }

      console.log(`✅ ${digestType} digest completed: ${results.emailsSent} emails sent`);
      return results;
    } catch (error) {
      console.error('Digest generation error:', error);
      throw error;
    }
  }

  /**
   * Get date range for digest type
   */
  getDateRange(digestType, startDate = null, endDate = null) {
    const end = endDate ? new Date(endDate) : new Date();
    let start;

    if (startDate) {
      start = new Date(startDate);
    } else {
      switch (digestType) {
        case 'daily':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    return { start, end };
  }

  /**
   * Get users who should receive digest notifications
   */
  async getUsersForDigest(digestType, userId = null) {
    const filter = { status: 'active' };
    
    if (userId) {
      filter._id = userId;
    }

    const users = await User.find(filter);
    const eligibleUsers = [];

    for (const user of users) {
      const settings = await NotificationSettings.findOne({ userId: user._id });
      
      if (!settings || !settings.globalSettings.emailEnabled) {
        continue;
      }

      const digestPreference = settings.getPreference('digest_notifications');
      
      if (!digestPreference || !digestPreference.enabled) {
        continue;
      }

      // Check frequency preference
      const frequencyMatch = 
        (digestType === 'daily' && digestPreference.frequency === 'daily_digest') ||
        (digestType === 'weekly' && digestPreference.frequency === 'weekly_digest');

      if (frequencyMatch) {
        eligibleUsers.push(user);
      }
    }

    return eligibleUsers;
  }

  /**
   * Generate digest data for a user
   */
  async generateDigestData(userId, startDate, endDate, digestType) {
    const [
      roleChanges,
      securityEvents,
      systemUpdates,
      pendingApprovals,
      userStats
    ] = await Promise.all([
      this.getRoleChanges(userId, startDate, endDate),
      this.getSecurityEvents(userId, startDate, endDate),
      this.getSystemUpdates(startDate, endDate),
      this.getPendingApprovals(userId),
      this.getUserStats(userId, startDate, endDate)
    ]);

    return {
      user: await User.findById(userId).select('personalInfo email'),
      period: {
        start: startDate,
        end: endDate,
        type: digestType
      },
      summary: {
        roleChanges: roleChanges.length,
        securityEvents: securityEvents.length,
        systemUpdates: systemUpdates.length,
        pendingApprovals: pendingApprovals.length
      },
      sections: {
        roleChanges,
        securityEvents,
        systemUpdates,
        pendingApprovals,
        userStats
      }
    };
  }

  /**
   * Get role changes for user
   */
  async getRoleChanges(userId, startDate, endDate) {
    const roleChanges = await AuditLog.find({
      $or: [
        { userId: userId },
        { targetUserId: userId }
      ],
      action: { $in: ['role_assigned', 'role_removed', 'role_assignment_updated'] },
      timestamp: { $gte: startDate, $lte: endDate }
    })
    .populate('roleId', 'name description')
    .populate('userId', 'personalInfo.firstName personalInfo.lastName')
    .sort({ timestamp: -1 })
    .limit(10);

    return roleChanges.map(log => ({
      action: log.action,
      roleName: log.roleId?.name || 'Unknown Role',
      timestamp: log.timestamp,
      performedBy: log.userId ? 
        `${log.userId.personalInfo.firstName} ${log.userId.personalInfo.lastName}` : 
        'System',
      details: log.details
    }));
  }

  /**
   * Get security events for user
   */
  async getSecurityEvents(userId, startDate, endDate) {
    const securityEvents = await AuditLog.find({
      $or: [
        { userId: userId },
        { targetUserId: userId }
      ],
      category: 'security',
      timestamp: { $gte: startDate, $lte: endDate }
    })
    .sort({ timestamp: -1 })
    .limit(5);

    return securityEvents.map(log => ({
      action: log.action,
      severity: log.severity,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      details: log.details
    }));
  }

  /**
   * Get system updates
   */
  async getSystemUpdates(startDate, endDate) {
    const systemUpdates = await AuditLog.find({
      category: 'system',
      action: { $in: ['system_backup', 'system_restore', 'system_maintenance'] },
      timestamp: { $gte: startDate, $lte: endDate }
    })
    .sort({ timestamp: -1 })
    .limit(5);

    return systemUpdates.map(log => ({
      action: log.action,
      timestamp: log.timestamp,
      details: log.details
    }));
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(userId) {
    // This would integrate with an approval system
    // For now, return empty array
    return [];
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId, startDate, endDate) {
    const [
      loginCount,
      activityCount,
      currentRoles
    ] = await Promise.all([
      AuditLog.countDocuments({
        userId: userId,
        action: 'user_login',
        timestamp: { $gte: startDate, $lte: endDate },
        'metadata.success': true
      }),
      AuditLog.countDocuments({
        userId: userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }),
      UserRole.findUserRoles(userId, false)
    ]);

    return {
      loginCount,
      activityCount,
      currentRoleCount: currentRoles.length,
      currentRoles: currentRoles.map(ur => ur.roleId.name)
    };
  }

  /**
   * Check if digest has significant activity
   */
  hasSignificantActivity(digestData) {
    const { summary } = digestData;
    
    return (
      summary.roleChanges > 0 ||
      summary.securityEvents > 0 ||
      summary.systemUpdates > 0 ||
      summary.pendingApprovals > 0
    );
  }

  /**
   * Send digest email to user
   */
  async sendDigestEmail(user, digestData, digestType) {
    const template = await EmailTemplate.findOne({
      category: 'digest',
      name: `${digestType}_digest`,
      isActive: true,
      language: user.preferredLanguage || 'en'
    });

    if (!template) {
      // Use generic digest template
      const genericTemplate = await EmailTemplate.findOne({
        category: 'digest',
        isActive: true,
        language: user.preferredLanguage || 'en'
      });
      
      if (!genericTemplate) {
        throw new Error('No digest template found');
      }
    }

    const templateData = {
      ...digestData,
      system: {
        name: 'University Record Management System',
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@university.edu'
      },
      unsubscribeUrl: this.generateUnsubscribeUrl(user._id, 'digest_notifications')
    };

    await EmailQueue.createFromTemplate(
      template._id,
      [{
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        userId: user._id
      }],
      templateData,
      {
        priority: 'low',
        source: 'digest',
        tags: [digestType, 'digest']
      }
    );
  }

  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl(userId, category) {
    // This would use the user's unsubscribe token
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/unsubscribe?category=${category}&userId=${userId}`;
  }

  /**
   * Schedule digest emails
   */
  async scheduleDigests() {
    const emailQueueProcessor = require('./emailQueueProcessor');
    await emailQueueProcessor.scheduleDigests();
  }
}

module.exports = new DigestService();
