const Permission = require('../models/Permission');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const PermissionGroup = require('../models/PermissionGroup');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { clearUserCache } = require('../middleware/rbac');

/**
 * Permission Management Controllers
 */

// Get all permissions with filtering and pagination
const getPermissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      resource,
      action,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (resource) filter.resource = resource;
    if (action) filter.action = action;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [permissions, total] = await Promise.all([
      Permission.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'personalInfo.firstName personalInfo.lastName email'),
      Permission.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        permissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};

// Get single permission
const getPermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)
      .populate('createdBy', 'personalInfo.firstName personalInfo.lastName email');
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: { permission }
    });
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permission',
      error: error.message
    });
  }
};

// Create new permission
const createPermission = async (req, res) => {
  try {
    const permissionData = {
      ...req.body,
      createdBy: req.user._id,
      _ipAddress: req.ip,
      _userAgent: req.get('User-Agent')
    };

    const permission = new Permission(permissionData);
    await permission.save();

    res.status(201).json({
      success: true,
      data: { permission },
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Create permission error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Update fields
    Object.assign(permission, req.body);
    permission._ipAddress = req.ip;
    permission._userAgent = req.get('User-Agent');
    
    await permission.save();

    res.json({
      success: true,
      data: { permission },
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    permission._ipAddress = req.ip;
    permission._userAgent = req.get('User-Agent');
    
    await permission.remove();

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        details: error.details
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    });
  }
};

// Get permission categories
const getPermissionCategories = async (req, res) => {
  try {
    const categories = await Permission.getCategories();
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * Role Management Controllers
 */

// Get all roles with filtering and pagination
const getRoles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      isSystemRole,
      createdBy,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isSystemRole !== undefined) filter.isSystemRole = isSystemRole === 'true';
    if (createdBy) filter.createdBy = createdBy;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [roles, total] = await Promise.all([
      Role.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'personalInfo.firstName personalInfo.lastName email')
        .populate('assignedUsersCount'),
      Role.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        roles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

// Get single role
const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions')
      .populate('createdBy', 'personalInfo.firstName personalInfo.lastName email')
      .populate('assignedUsersCount');
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: { role }
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

// Create new role
const createRole = async (req, res) => {
  try {
    const roleData = {
      ...req.body,
      createdBy: req.user._id,
      _ipAddress: req.ip,
      _userAgent: req.get('User-Agent')
    };

    const role = new Role(roleData);
    await role.save();

    // Populate the created role
    await role.populate('permissions');

    res.status(201).json({
      success: true,
      data: { role },
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Create role error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Update fields
    Object.assign(role, req.body);
    role._ipAddress = req.ip;
    role._userAgent = req.get('User-Agent');
    
    await role.save();
    await role.populate('permissions');

    // Clear cache for users with this role
    const userRoles = await UserRole.find({ roleId: role._id, isActive: true });
    for (const userRole of userRoles) {
      await clearUserCache(userRole.userId.toString());
    }

    res.json({
      success: true,
      data: { role },
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
        details: error.details
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    role._ipAddress = req.ip;
    role._userAgent = req.get('User-Agent');
    
    await role.remove();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        details: error.details
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

// Clone role
const cloneRole = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'New role name is required'
      });
    }

    const originalRole = await Role.findById(req.params.id);
    
    if (!originalRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const clonedRole = await originalRole.cloneRole(name, req.user._id);
    await clonedRole.populate('permissions');

    res.status(201).json({
      success: true,
      data: { role: clonedRole },
      message: 'Role cloned successfully'
    });
  } catch (error) {
    console.error('Clone role error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error cloning role',
      error: error.message
    });
  }
};

// Get role permissions
const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: { permissions: role.permissions }
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role permissions',
      error: error.message
    });
  }
};

// Get role analytics
const getRoleAnalytics = async (req, res) => {
  try {
    const analytics = await Role.getAnalytics();
    
    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    console.error('Get role analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role analytics',
      error: error.message
    });
  }
};

module.exports = {
  // Permission controllers
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionCategories,
  
  // Role controllers
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  cloneRole,
  getRolePermissions,
  getRoleAnalytics
};
