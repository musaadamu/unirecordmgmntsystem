const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const UserRole = require('../models/UserRole');
const AuditLog = require('../models/AuditLog');

// Redis client for caching (optional)
let redisClient = null;
try {
  if (process.env.REDIS_URL) {
    const Redis = require('redis');
    redisClient = Redis.createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
      // Optionally handle reconnection or fallback logic here
    });
    redisClient.connect().catch(err => {
      console.error('Redis connection failed:', err);
    });
  }
} catch (error) {
  console.warn('Redis not available, using memory cache');
}

// In-memory cache as fallback
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Authentication middleware
 * Verifies JWT token and loads user information
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      });
    }

    req.user = user;
    req.token = token;
    
    // Load user permissions into request context
    await loadUserPermissions(req);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Log failed authentication attempt
    await AuditLog.logAction({
      action: 'user_login',
      userId: null,
      details: { error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium',
      category: 'authentication',
      metadata: { success: false, errorCode: 'AUTH_FAILED' }
    });

    // Send security alert for repeated failed attempts
    const notificationService = require('../services/notificationService');
    await notificationService.sendNotification('security_alert', {
      alertType: 'authentication_failure',
      severity: 'medium',
      details: `Authentication failed: ${error.message}`,
      ipAddress: req.ip,
      timestamp: new Date().toISOString()
    }, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(err => console.error('Notification error:', err));
    
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

/**
 * Load user permissions and cache them
 */
const loadUserPermissions = async (req) => {
  const userId = req.user._id.toString();
  const cacheKey = `user_permissions:${userId}`;
  
  try {
    // Try to get from cache first
    let userPermissions = await getFromCache(cacheKey);
    
    if (!userPermissions) {
      // Load from database
      userPermissions = await getUserPermissions(userId);
      
      // Cache the permissions
      await setCache(cacheKey, userPermissions, CACHE_TTL);
    }
    
    req.userPermissions = userPermissions;
    req.userRoles = userPermissions.roles;
    req.effectivePermissions = userPermissions.effectivePermissions;
    
  } catch (error) {
    console.error('Error loading user permissions:', error);
    req.userPermissions = { roles: [], permissions: [], effectivePermissions: [] };
    req.userRoles = [];
    req.effectivePermissions = [];
  }
};

/**
 * Get user permissions from database
 */
const getUserPermissions = async (userId) => {
  // Get active user roles
  const userRoles = await UserRole.findUserRoles(userId, false);
  const roleIds = userRoles.map(ur => ur.roleId._id);
  
  // Get roles with permissions
  const roles = await Role.find({ _id: { $in: roleIds }, isActive: true })
    .populate('permissions')
    .lean();
  
  // Collect all unique permissions
  const permissionIds = new Set();
  roles.forEach(role => {
    role.permissions.forEach(permission => {
      if (permission.isActive) {
        permissionIds.add(permission._id.toString());
      }
    });
  });
  
  // Get permission details
  const permissions = await Permission.find({
    _id: { $in: Array.from(permissionIds) },
    isActive: true
  }).lean();
  
  // Create effective permissions array (permission identifiers)
  const effectivePermissions = permissions.map(p => `${p.resource}:${p.action}`);
  
  return {
    userId,
    roles: roles.map(role => ({
      _id: role._id,
      name: role.name,
      level: role.level,
      category: role.category
    })),
    permissions,
    effectivePermissions,
    lastUpdated: new Date().toISOString(),
    cacheExpiry: new Date(Date.now() + CACHE_TTL).toISOString()
  };
};

/**
 * Permission checking middleware factory
 */
const requirePermission = (permission, options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const hasPermission = await checkUserPermission(req, permission, options);
      
      if (!hasPermission) {
        // Log access denied
        await AuditLog.logAction({
          action: 'access_denied',
          userId: req.user._id,
          details: {
            requiredPermission: permission,
            requestPath: req.path,
            requestMethod: req.method,
            options
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'medium',
          category: 'security',
          metadata: { success: false, errorCode: 'PERMISSION_DENIED' }
        });

        // Send security alert for access denied
        const notificationService = require('../services/notificationService');
        await notificationService.sendNotification('access_denied', {
          userId: req.user._id,
          alertType: 'access_denied',
          severity: 'medium',
          details: `Access denied to ${req.path} (${req.method}) - Required permission: ${permission}`,
          ipAddress: req.ip,
          timestamp: new Date().toISOString(),
          triggeredBy: req.user._id
        }, {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }).catch(err => console.error('Notification error:', err));
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions.',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions.'
      });
    }
  };
};

/**
 * Multiple permissions checking middleware factory
 */
const requireAnyPermission = (permissions, options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const hasAnyPermission = await checkUserAnyPermission(req, permissions, options);
      
      if (!hasAnyPermission) {
        await AuditLog.logAction({
          action: 'access_denied',
          userId: req.user._id,
          details: {
            requiredPermissions: permissions,
            requestPath: req.path,
            requestMethod: req.method,
            options
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'medium',
          category: 'security'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions.',
          required: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions.'
      });
    }
  };
};

/**
 * Role checking middleware factory
 */
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const userRoleNames = req.userRoles.map(role => role.name);
      const hasRole = roleArray.some(role => userRoleNames.includes(role));
      
      if (!hasRole) {
        await AuditLog.logAction({
          action: 'access_denied',
          userId: req.user._id,
          details: {
            requiredRoles: roleArray,
            userRoles: userRoleNames,
            requestPath: req.path,
            requestMethod: req.method
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'medium',
          category: 'security'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient role permissions.',
          required: roleArray
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking roles.'
      });
    }
  };
};

/**
 * Check if user has specific permission
 */
const checkUserPermission = async (req, permission, options = {}) => {
  if (!req.effectivePermissions) {
    return false;
  }

  // Check for wildcard permission (super admin)
  if (req.effectivePermissions.includes('*') || req.effectivePermissions.includes('*:*')) {
    return true;
  }

  // Check exact permission match
  if (req.effectivePermissions.includes(permission)) {
    return true;
  }

  // Check resource-level wildcard (e.g., "users:*")
  const [resource] = permission.split(':');
  if (req.effectivePermissions.includes(`${resource}:*`)) {
    return true;
  }

  // Check conditions if specified
  if (options.conditions) {
    return await checkPermissionConditions(req, permission, options.conditions);
  }

  return false;
};

/**
 * Check if user has any of the specified permissions
 */
const checkUserAnyPermission = async (req, permissions, options = {}) => {
  for (const permission of permissions) {
    if (await checkUserPermission(req, permission, options)) {
      return true;
    }
  }
  return false;
};

/**
 * Check permission conditions (department, time, etc.)
 */
const checkPermissionConditions = async (req, permission, conditions) => {
  // Implementation for conditional permissions
  // This would check things like department, time restrictions, IP ranges, etc.
  
  if (conditions.department && req.user.department !== conditions.department) {
    return false;
  }
  
  if (conditions.timeRange) {
    const now = new Date();
    const { start, end } = conditions.timeRange;
    if (now < new Date(start) || now > new Date(end)) {
      return false;
    }
  }
  
  if (conditions.ipRange) {
    // Check if user's IP is in allowed range
    // Implementation would depend on IP range format
  }
  
  return true;
};

/**
 * Cache helper functions
 */
const getFromCache = async (key) => {
  try {
    if (redisClient) {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } else {
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      memoryCache.delete(key);
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl) => {
  try {
    if (redisClient) {
      await redisClient.setEx(key, Math.floor(ttl / 1000), JSON.stringify(data));
    } else {
      memoryCache.set(key, {
        data,
        expiry: Date.now() + ttl
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const clearUserCache = async (userId) => {
  const cacheKey = `user_permissions:${userId}`;
  try {
    if (redisClient) {
      await redisClient.del(cacheKey);
    } else {
      memoryCache.delete(cacheKey);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Middleware to clear user cache when permissions change
 */
const clearCacheMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Clear cache for affected users when roles/permissions change
    if (req.method !== 'GET' && res.statusCode < 400) {
      if (req.body.userId) {
        clearUserCache(req.body.userId);
      }
      if (req.params.userId) {
        clearUserCache(req.params.userId);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  authenticate,
  requirePermission,
  requireAnyPermission,
  requireRole,
  checkUserPermission,
  checkUserAnyPermission,
  loadUserPermissions,
  getUserPermissions,
  clearUserCache,
  clearCacheMiddleware
};
