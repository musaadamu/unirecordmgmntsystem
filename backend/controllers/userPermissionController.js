const Permission = require('../models/Permission');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { getUserPermissions } = require('../middleware/rbac');

/**
 * Get user's effective permissions
 */
const getUserPermissionsController = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userPermissions = await getUserPermissions(userId);

    res.json({
      success: true,
      data: { userPermissions }
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user permissions',
      error: error.message
    });
  }
};

/**
 * Check if user has specific permission
 */
const checkUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permission, conditions } = req.body;
    
    if (!permission) {
      return res.status(400).json({
        success: false,
        message: 'Permission is required'
      });
    }

    // Get user permissions
    const userPermissions = await getUserPermissions(userId);
    
    // Check permission
    let hasPermission = false;
    let reason = 'Permission not found';
    
    // Check for wildcard permission
    if (userPermissions.effectivePermissions.includes('*') || 
        userPermissions.effectivePermissions.includes('*:*')) {
      hasPermission = true;
      reason = 'Wildcard permission granted';
    }
    // Check exact permission
    else if (userPermissions.effectivePermissions.includes(permission)) {
      hasPermission = true;
      reason = 'Direct permission granted';
    }
    // Check resource-level wildcard
    else {
      const [resource] = permission.split(':');
      if (userPermissions.effectivePermissions.includes(`${resource}:*`)) {
        hasPermission = true;
        reason = 'Resource-level wildcard permission granted';
      }
    }

    // Log permission check
    await AuditLog.logAction({
      action: 'permission_check',
      userId: req.user._id,
      targetUserId: userId,
      details: {
        checkedPermission: permission,
        hasPermission,
        reason,
        conditions
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'low',
      category: 'authorization'
    });

    res.json({
      success: true,
      data: {
        hasPermission,
        reason,
        conditions: conditions || null
      }
    });
  } catch (error) {
    console.error('Check user permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user permission',
      error: error.message
    });
  }
};

/**
 * Get permission matrix for multiple users
 */
const getPermissionMatrix = async (req, res) => {
  try {
    const {
      userIds,
      roleIds,
      department,
      limit = 50
    } = req.query;

    // Build user filter
    const userFilter = {};
    if (userIds) {
      userFilter._id = { $in: userIds.split(',') };
    }
    if (department) {
      userFilter['academicInfo.department'] = department;
    }

    // Get users
    const users = await User.find(userFilter)
      .limit(parseInt(limit))
      .select('personalInfo email academicInfo.department')
      .lean();

    // Get user roles and permissions for each user
    const matrixData = await Promise.all(
      users.map(async (user) => {
        const userPermissions = await getUserPermissions(user._id.toString());
        return {
          userId: user._id,
          userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
          email: user.email,
          department: user.academicInfo?.department,
          roles: userPermissions.roles.map(role => role._id),
          permissions: userPermissions.effectivePermissions
        };
      })
    );

    // Get all roles
    const roleFilter = {};
    if (roleIds) {
      roleFilter._id = { $in: roleIds.split(',') };
    }
    const roles = await Role.find(roleFilter).select('name description category level').lean();

    // Get all permissions
    const permissions = await Permission.find({ isActive: true })
      .select('name resource action description category')
      .lean();

    res.json({
      success: true,
      data: {
        matrix: {
          users: matrixData,
          roles,
          permissions
        }
      }
    });
  } catch (error) {
    console.error('Get permission matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permission matrix',
      error: error.message
    });
  }
};

/**
 * Get user's role history
 */
const getUserRoleHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get audit logs for role assignments
    const filter = {
      $or: [
        { userId: userId },
        { targetUserId: userId }
      ],
      action: { $in: ['role_assigned', 'role_removed', 'role_assignment_updated'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      filter.timestamp = dateFilter;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'personalInfo.firstName personalInfo.lastName')
        .populate('targetUserId', 'personalInfo.firstName personalInfo.lastName')
        .populate('roleId', 'name description'),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        history: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user role history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user role history',
      error: error.message
    });
  }
};

/**
 * Get expiring role assignments
 */
const getExpiringAssignments = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const expiringAssignments = await UserRole.findExpiringAssignments(parseInt(days));

    res.json({
      success: true,
      data: {
        expiringAssignments,
        count: expiringAssignments.length
      }
    });
  } catch (error) {
    console.error('Get expiring assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring assignments',
      error: error.message
    });
  }
};

/**
 * Extend role assignment expiry
 */
const extendRoleAssignment = async (req, res) => {
  try {
    const { userRoleId } = req.params;
    const { days } = req.body;
    
    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of days is required'
      });
    }

    const userRole = await UserRole.findById(userRoleId);
    
    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'User role assignment not found'
      });
    }

    const oldExpiry = userRole.expiresAt;
    userRole.extend(days);
    await userRole.save();

    // Log the extension
    await AuditLog.logAction({
      action: 'role_assignment_updated',
      userId: req.user._id,
      targetUserId: userRole.userId,
      roleId: userRole.roleId,
      details: {
        action: 'extended',
        oldExpiry,
        newExpiry: userRole.expiresAt,
        daysExtended: days
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium',
      category: 'administration'
    });

    res.json({
      success: true,
      data: { userRole },
      message: `Role assignment extended by ${days} days`
    });
  } catch (error) {
    console.error('Extend role assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error extending role assignment',
      error: error.message
    });
  }
};

/**
 * Get user permission summary
 */
const getUserPermissionSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userPermissions = await getUserPermissions(userId);
    
    // Group permissions by category
    const permissionsByCategory = userPermissions.permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});

    // Get role levels
    const roleLevels = userPermissions.roles.map(role => role.level);
    const highestLevel = Math.max(...roleLevels, 0);

    // Check for admin permissions
    const isAdmin = userPermissions.effectivePermissions.includes('*') ||
                   userPermissions.effectivePermissions.includes('system:admin');

    const summary = {
      userId,
      totalRoles: userPermissions.roles.length,
      totalPermissions: userPermissions.permissions.length,
      highestRoleLevel: highestLevel,
      isAdmin,
      permissionsByCategory,
      roleNames: userPermissions.roles.map(role => role.name),
      lastUpdated: userPermissions.lastUpdated
    };

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get user permission summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user permission summary',
      error: error.message
    });
  }
};

module.exports = {
  getUserPermissionsController,
  checkUserPermission,
  getPermissionMatrix,
  getUserRoleHistory,
  getExpiringAssignments,
  extendRoleAssignment,
  getUserPermissionSummary
};
