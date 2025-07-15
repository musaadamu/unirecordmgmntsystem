const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      targetUserId,
      startDate,
      endDate,
      severity,
      category,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (action) {
      if (Array.isArray(action)) {
        filter.action = { $in: action };
      } else {
        filter.action = action;
      }
    }
    
    if (userId) filter.userId = userId;
    if (targetUserId) filter.targetUserId = targetUserId;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'personalInfo.firstName personalInfo.lastName email')
        .populate('targetUserId', 'personalInfo.firstName personalInfo.lastName email')
        .populate('roleId', 'name description')
        .populate('permissionId', 'name resource action'),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit log statistics
 */
const getAuditStatistics = async (req, res) => {
  try {
    const {
      startDate,
      endDate = new Date().toISOString()
    } = req.query;

    // Default to last 30 days if no start date provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate);

    const statistics = await AuditLog.getStatistics(start, end);

    res.json({
      success: true,
      data: { statistics }
    });
  } catch (error) {
    console.error('Get audit statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics',
      error: error.message
    });
  }
};

/**
 * Get security incidents
 */
const getSecurityIncidents = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const incidents = await AuditLog.findSecurityIncidents(parseInt(days));

    res.json({
      success: true,
      data: {
        incidents,
        count: incidents.length
      }
    });
  } catch (error) {
    console.error('Get security incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching security incidents',
      error: error.message
    });
  }
};

/**
 * Get user activity logs
 */
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const activity = await AuditLog.findUserActivity(userId, parseInt(limit));

    res.json({
      success: true,
      data: {
        activity,
        count: activity.length
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity',
      error: error.message
    });
  }
};

/**
 * Get audit log details
 */
const getAuditLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;
    
    const log = await AuditLog.findById(logId)
      .populate('userId', 'personalInfo.firstName personalInfo.lastName email')
      .populate('targetUserId', 'personalInfo.firstName personalInfo.lastName email')
      .populate('roleId', 'name description category level')
      .populate('permissionId', 'name resource action description category');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: { log }
    });
  } catch (error) {
    console.error('Get audit log details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log details',
      error: error.message
    });
  }
};

/**
 * Export audit logs
 */
const exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'json',
      startDate,
      endDate,
      action,
      userId,
      severity,
      category
    } = req.query;

    // Build filter
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .populate('userId', 'personalInfo.firstName personalInfo.lastName email')
      .populate('targetUserId', 'personalInfo.firstName personalInfo.lastName email')
      .populate('roleId', 'name description')
      .populate('permissionId', 'name resource action')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Timestamp',
        'Action',
        'User',
        'Target User',
        'Role',
        'Permission',
        'IP Address',
        'Severity',
        'Category',
        'Details'
      ];

      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.action,
        log.userId ? `${log.userId.personalInfo?.firstName} ${log.userId.personalInfo?.lastName}` : '',
        log.targetUserId ? `${log.targetUserId.personalInfo?.firstName} ${log.targetUserId.personalInfo?.lastName}` : '',
        log.roleId?.name || '',
        log.permissionId?.name || '',
        log.ipAddress,
        log.severity,
        log.category,
        JSON.stringify(log.details)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: logs.length,
        filters: filter,
        logs
      });
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs',
      error: error.message
    });
  }
};

/**
 * Cleanup old audit logs
 */
const cleanupAuditLogs = async (req, res) => {
  try {
    const { daysToKeep = 730 } = req.body; // Default: 2 years
    
    const deletedCount = await AuditLog.cleanup(parseInt(daysToKeep));

    // Log the cleanup action
    await AuditLog.logAction({
      action: 'system_backup',
      userId: req.user._id,
      details: {
        action: 'audit_log_cleanup',
        daysToKeep: parseInt(daysToKeep),
        deletedCount
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high',
      category: 'system'
    });

    res.json({
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old audit log entries`
    });
  } catch (error) {
    console.error('Cleanup audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit dashboard data
 */
const getAuditDashboard = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const [
      statistics,
      securityIncidents,
      recentActivity,
      topUsers,
      actionBreakdown
    ] = await Promise.all([
      AuditLog.getStatistics(startDate, endDate),
      AuditLog.findSecurityIncidents(parseInt(days)),
      AuditLog.find({ timestamp: { $gte: startDate } })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'personalInfo.firstName personalInfo.lastName')
        .populate('targetUserId', 'personalInfo.firstName personalInfo.lastName'),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const dashboard = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: parseInt(days)
      },
      statistics,
      securityIncidents: {
        count: securityIncidents.length,
        incidents: securityIncidents.slice(0, 5) // Latest 5
      },
      recentActivity,
      topUsers: topUsers.map(item => ({
        userId: item._id,
        userName: item.user[0] ? 
          `${item.user[0].personalInfo?.firstName} ${item.user[0].personalInfo?.lastName}` : 
          'Unknown User',
        activityCount: item.count
      })),
      actionBreakdown: actionBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: { dashboard }
    });
  } catch (error) {
    console.error('Get audit dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditStatistics,
  getSecurityIncidents,
  getUserActivity,
  getAuditLogDetails,
  exportAuditLogs,
  cleanupAuditLogs,
  getAuditDashboard
};
