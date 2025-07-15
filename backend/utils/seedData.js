const Permission = require('../models/Permission');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

/**
 * Default permissions for the university system
 */
const defaultPermissions = [
  // Student Management
  { name: 'students:create', resource: 'students', action: 'create', description: 'Create new student records', category: 'academic' },
  { name: 'students:read', resource: 'students', action: 'read', description: 'View student information', category: 'academic' },
  { name: 'students:update', resource: 'students', action: 'update', description: 'Update student information', category: 'academic' },
  { name: 'students:delete', resource: 'students', action: 'delete', description: 'Delete student records', category: 'academic' },
  { name: 'students:manage', resource: 'students', action: 'manage', description: 'Full student management access', category: 'academic' },

  // Course Management
  { name: 'courses:create', resource: 'courses', action: 'create', description: 'Create new courses', category: 'academic' },
  { name: 'courses:read', resource: 'courses', action: 'read', description: 'View course information', category: 'academic' },
  { name: 'courses:update', resource: 'courses', action: 'update', description: 'Update course information', category: 'academic' },
  { name: 'courses:delete', resource: 'courses', action: 'delete', description: 'Delete courses', category: 'academic' },
  { name: 'courses:manage', resource: 'courses', action: 'manage', description: 'Full course management access', category: 'academic' },

  // Grade Management
  { name: 'grades:create', resource: 'grades', action: 'create', description: 'Enter student grades', category: 'academic' },
  { name: 'grades:read', resource: 'grades', action: 'read', description: 'View student grades', category: 'academic' },
  { name: 'grades:update', resource: 'grades', action: 'update', description: 'Update student grades', category: 'academic' },
  { name: 'grades:delete', resource: 'grades', action: 'delete', description: 'Delete grade records', category: 'academic' },
  { name: 'grades:approve', resource: 'grades', action: 'approve', description: 'Approve and finalize grades', category: 'academic' },

  // Payment Management
  { name: 'payments:create', resource: 'payments', action: 'create', description: 'Process student payments', category: 'financial' },
  { name: 'payments:read', resource: 'payments', action: 'read', description: 'View payment information', category: 'financial' },
  { name: 'payments:update', resource: 'payments', action: 'update', description: 'Update payment records', category: 'financial' },
  { name: 'payments:delete', resource: 'payments', action: 'delete', description: 'Delete payment records', category: 'financial' },
  { name: 'payments:approve', resource: 'payments', action: 'approve', description: 'Approve payment transactions', category: 'financial' },

  // User Management
  { name: 'users:create', resource: 'users', action: 'create', description: 'Create new user accounts', category: 'administrative' },
  { name: 'users:read', resource: 'users', action: 'read', description: 'View user information', category: 'administrative' },
  { name: 'users:update', resource: 'users', action: 'update', description: 'Update user information', category: 'administrative' },
  { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete user accounts', category: 'administrative' },
  { name: 'users:manage', resource: 'users', action: 'manage', description: 'Full user management access', category: 'administrative' },

  // Role Management
  { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create new roles', category: 'administrative' },
  { name: 'roles:read', resource: 'roles', action: 'read', description: 'View role information', category: 'administrative' },
  { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update role information', category: 'administrative' },
  { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles', category: 'administrative' },
  { name: 'roles:assign', resource: 'roles', action: 'manage', description: 'Assign roles to users', category: 'administrative' },

  // Permission Management
  { name: 'permissions:create', resource: 'permissions', action: 'create', description: 'Create new permissions', category: 'system' },
  { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permission information', category: 'system' },
  { name: 'permissions:update', resource: 'permissions', action: 'update', description: 'Update permission information', category: 'system' },
  { name: 'permissions:delete', resource: 'permissions', action: 'delete', description: 'Delete permissions', category: 'system' },

  // Reporting
  { name: 'reports:create', resource: 'reports', action: 'create', description: 'Create custom reports', category: 'reporting' },
  { name: 'reports:read', resource: 'reports', action: 'read', description: 'View system reports', category: 'reporting' },
  { name: 'reports:export', resource: 'reports', action: 'export', description: 'Export report data', category: 'reporting' },
  { name: 'reports:manage', resource: 'reports', action: 'manage', description: 'Full report management access', category: 'reporting' },

  // Audit Logs
  { name: 'audit:read', resource: 'audit', action: 'read', description: 'View audit logs', category: 'system' },
  { name: 'audit:export', resource: 'audit', action: 'export', description: 'Export audit logs', category: 'system' },

  // Communication
  { name: 'notifications:create', resource: 'notifications', action: 'create', description: 'Send notifications', category: 'communication' },
  { name: 'notifications:read', resource: 'notifications', action: 'read', description: 'View notifications', category: 'communication' },
  { name: 'announcements:create', resource: 'announcements', action: 'create', description: 'Create announcements', category: 'communication' },
  { name: 'announcements:read', resource: 'announcements', action: 'read', description: 'View announcements', category: 'communication' },

  // System Administration
  { name: 'system:admin', resource: 'system', action: 'manage', description: 'Full system administration access', category: 'system' },
  { name: 'system:config', resource: 'system', action: 'update', description: 'Update system configuration', category: 'system' },
  { name: 'system:backup', resource: 'system', action: 'export', description: 'Create system backups', category: 'system' },
  { name: 'system:restore', resource: 'system', action: 'import', description: 'Restore system from backup', category: 'system' },

  // Wildcard permissions for super admin
  { name: '*', resource: '*', action: 'manage', description: 'All system permissions (Super Admin)', category: 'system' }
];

/**
 * Default roles for the university system
 */
const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    category: 'system',
    level: 10,
    isSystemRole: true,
    permissions: ['*'] // Will be resolved to actual permission IDs
  },
  {
    name: 'Administrator',
    description: 'System administrator with most permissions',
    category: 'administrative',
    level: 9,
    isSystemRole: true,
    permissions: [
      'users:manage', 'roles:create', 'roles:read', 'roles:update', 'roles:assign',
      'students:manage', 'courses:manage', 'grades:read', 'payments:read',
      'reports:read', 'reports:export', 'audit:read', 'notifications:create',
      'announcements:create', 'system:config'
    ]
  },
  {
    name: 'Academic Coordinator',
    description: 'Manages academic affairs and student records',
    category: 'academic',
    level: 7,
    isSystemRole: true,
    permissions: [
      'students:manage', 'courses:manage', 'grades:manage', 'grades:approve',
      'reports:read', 'notifications:create', 'announcements:read'
    ]
  },
  {
    name: 'Finance Officer',
    description: 'Manages financial transactions and payments',
    category: 'financial',
    level: 6,
    isSystemRole: true,
    permissions: [
      'payments:manage', 'students:read', 'reports:read', 'reports:export',
      'notifications:create'
    ]
  },
  {
    name: 'Registrar',
    description: 'Manages student registration and academic records',
    category: 'academic',
    level: 6,
    isSystemRole: true,
    permissions: [
      'students:manage', 'courses:read', 'grades:read', 'grades:approve',
      'reports:read', 'notifications:create'
    ]
  },
  {
    name: 'Instructor',
    description: 'Teaching staff with grade management access',
    category: 'academic',
    level: 4,
    isSystemRole: true,
    permissions: [
      'students:read', 'courses:read', 'grades:create', 'grades:update',
      'announcements:create', 'notifications:read'
    ]
  },
  {
    name: 'Student Affairs Officer',
    description: 'Manages student services and support',
    category: 'support',
    level: 5,
    isSystemRole: true,
    permissions: [
      'students:read', 'students:update', 'notifications:create',
      'announcements:create', 'reports:read'
    ]
  },
  {
    name: 'IT Support',
    description: 'Technical support and system maintenance',
    category: 'support',
    level: 5,
    isSystemRole: true,
    permissions: [
      'users:read', 'system:config', 'audit:read', 'reports:read'
    ]
  },
  {
    name: 'Staff',
    description: 'General staff with basic access',
    category: 'administrative',
    level: 3,
    isSystemRole: true,
    permissions: [
      'students:read', 'courses:read', 'announcements:read', 'notifications:read'
    ]
  },
  {
    name: 'Student',
    description: 'Student portal access',
    category: 'academic',
    level: 1,
    isSystemRole: true,
    permissions: [
      'courses:read', 'grades:read', 'payments:read', 'announcements:read',
      'notifications:read'
    ]
  }
];

/**
 * Seed default permissions
 */
const seedDefaultPermissions = async (createdBy) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const permissionData of defaultPermissions) {
      try {
        const existingPermission = await Permission.findOne({ name: permissionData.name });
        
        if (existingPermission) {
          // Update existing permission
          Object.assign(existingPermission, permissionData);
          existingPermission.createdBy = createdBy;
          await existingPermission.save();
          results.updated++;
        } else {
          // Create new permission
          const permission = new Permission({
            ...permissionData,
            createdBy
          });
          await permission.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          permission: permissionData.name,
          error: error.message
        });
      }
    }

    // Log the seeding action
    await AuditLog.logAction({
      action: 'system_backup',
      userId: createdBy,
      details: {
        action: 'seed_permissions',
        results
      },
      ipAddress: 'system',
      userAgent: 'system',
      severity: 'high',
      category: 'system'
    });

    return results;
  } catch (error) {
    console.error('Seed permissions error:', error);
    throw error;
  }
};

/**
 * Seed default roles
 */
const seedDefaultRoles = async (createdBy) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const roleData of defaultRoles) {
      try {
        // Resolve permission names to IDs
        const permissionIds = [];
        for (const permissionName of roleData.permissions) {
          if (permissionName === '*') {
            // Get all permissions for wildcard
            const allPermissions = await Permission.find({ isActive: true });
            permissionIds.push(...allPermissions.map(p => p._id));
          } else {
            const permission = await Permission.findOne({ name: permissionName, isActive: true });
            if (permission) {
              permissionIds.push(permission._id);
            }
          }
        }

        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          // Update existing role
          existingRole.description = roleData.description;
          existingRole.category = roleData.category;
          existingRole.level = roleData.level;
          existingRole.permissions = [...new Set(permissionIds)]; // Remove duplicates
          existingRole.createdBy = createdBy;
          await existingRole.save();
          results.updated++;
        } else {
          // Create new role
          const role = new Role({
            name: roleData.name,
            description: roleData.description,
            category: roleData.category,
            level: roleData.level,
            isSystemRole: roleData.isSystemRole,
            permissions: [...new Set(permissionIds)], // Remove duplicates
            createdBy
          });
          await role.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          role: roleData.name,
          error: error.message
        });
      }
    }

    // Log the seeding action
    await AuditLog.logAction({
      action: 'system_backup',
      userId: createdBy,
      details: {
        action: 'seed_roles',
        results
      },
      ipAddress: 'system',
      userAgent: 'system',
      severity: 'high',
      category: 'system'
    });

    return results;
  } catch (error) {
    console.error('Seed roles error:', error);
    throw error;
  }
};

/**
 * Initialize RBAC system with default data
 */
const initializeRBAC = async (createdBy) => {
  try {
    console.log('Initializing RBAC system...');
    
    const permissionResults = await seedDefaultPermissions(createdBy);
    console.log('Permissions seeded:', permissionResults);
    
    const roleResults = await seedDefaultRoles(createdBy);
    console.log('Roles seeded:', roleResults);
    
    console.log('RBAC system initialized successfully');
    
    return {
      permissions: permissionResults,
      roles: roleResults
    };
  } catch (error) {
    console.error('RBAC initialization error:', error);
    throw error;
  }
};

module.exports = {
  seedDefaultPermissions,
  seedDefaultRoles,
  initializeRBAC,
  defaultPermissions,
  defaultRoles
};
