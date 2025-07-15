const express = require('express');
const router = express.Router();

// Import controllers
const rbacController = require('../controllers/rbacController');

// Import middleware
const { 
  authenticate, 
  requirePermission, 
  requireAnyPermission, 
  requireRole,
  clearCacheMiddleware 
} = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticate);

// Apply cache clearing middleware to non-GET routes
router.use(clearCacheMiddleware);

/**
 * Permission Management Routes
 */

// GET /api/admin/permissions - Get all permissions
router.get('/permissions', 
  requirePermission('permissions:read'),
  rbacController.getPermissions
);

// GET /api/admin/permissions/categories - Get permission categories
router.get('/permissions/categories',
  requirePermission('permissions:read'),
  rbacController.getPermissionCategories
);

// GET /api/admin/permissions/:id - Get single permission
router.get('/permissions/:id',
  requirePermission('permissions:read'),
  rbacController.getPermission
);

// POST /api/admin/permissions - Create new permission
router.post('/permissions',
  requirePermission('permissions:create'),
  rbacController.createPermission
);

// PUT /api/admin/permissions/:id - Update permission
router.put('/permissions/:id',
  requirePermission('permissions:update'),
  rbacController.updatePermission
);

// DELETE /api/admin/permissions/:id - Delete permission
router.delete('/permissions/:id',
  requirePermission('permissions:delete'),
  rbacController.deletePermission
);

/**
 * Role Management Routes
 */

// GET /api/admin/roles - Get all roles
router.get('/roles',
  requirePermission('roles:read'),
  rbacController.getRoles
);

// GET /api/admin/roles/analytics - Get role analytics
router.get('/roles/analytics',
  requirePermission('roles:read'),
  rbacController.getRoleAnalytics
);

// GET /api/admin/roles/:id - Get single role
router.get('/roles/:id',
  requirePermission('roles:read'),
  rbacController.getRole
);

// GET /api/admin/roles/:id/permissions - Get role permissions
router.get('/roles/:id/permissions',
  requirePermission('roles:read'),
  rbacController.getRolePermissions
);

// POST /api/admin/roles - Create new role
router.post('/roles',
  requirePermission('roles:create'),
  rbacController.createRole
);

// POST /api/admin/roles/:id/clone - Clone role
router.post('/roles/:id/clone',
  requirePermission('roles:create'),
  rbacController.cloneRole
);

// PUT /api/admin/roles/:id - Update role
router.put('/roles/:id',
  requirePermission('roles:update'),
  rbacController.updateRole
);

// DELETE /api/admin/roles/:id - Delete role
router.delete('/roles/:id',
  requirePermission('roles:delete'),
  rbacController.deleteRole
);

/**
 * User Role Assignment Routes
 */

// GET /api/admin/user-roles/user/:userId - Get user's roles
router.get('/user-roles/user/:userId',
  requireAnyPermission(['roles:read', 'users:read']),
  rbacController.getUserRoles
);

// GET /api/admin/user-roles/role/:roleId/users - Get users with specific role
router.get('/user-roles/role/:roleId/users',
  requirePermission('roles:read'),
  rbacController.getRoleUsers
);

// POST /api/admin/user-roles/assign - Assign role to user
router.post('/user-roles/assign',
  requirePermission('roles:assign'),
  rbacController.assignRole
);

// POST /api/admin/user-roles/bulk-assign - Bulk assign roles
router.post('/user-roles/bulk-assign',
  requirePermission('roles:assign'),
  rbacController.bulkAssignRoles
);

// PUT /api/admin/user-roles/:id - Update user role assignment
router.put('/user-roles/:id',
  requirePermission('roles:assign'),
  rbacController.updateUserRole
);

// DELETE /api/admin/user-roles/:id - Remove user role assignment
router.delete('/user-roles/:id',
  requirePermission('roles:assign'),
  rbacController.removeUserRole
);

/**
 * System Administration Routes (Super Admin only)
 */

// POST /api/admin/system/seed-permissions - Seed default permissions
router.post('/system/seed-permissions',
  requireRole('Super Admin'),
  async (req, res) => {
    try {
      const { seedDefaultPermissions } = require('../utils/seedData');
      const result = await seedDefaultPermissions(req.user._id);
      
      res.json({
        success: true,
        data: result,
        message: 'Default permissions seeded successfully'
      });
    } catch (error) {
      console.error('Seed permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error seeding permissions',
        error: error.message
      });
    }
  }
);

// POST /api/admin/system/seed-roles - Seed default roles
router.post('/system/seed-roles',
  requireRole('Super Admin'),
  async (req, res) => {
    try {
      const { seedDefaultRoles } = require('../utils/seedData');
      const result = await seedDefaultRoles(req.user._id);
      
      res.json({
        success: true,
        data: result,
        message: 'Default roles seeded successfully'
      });
    } catch (error) {
      console.error('Seed roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error seeding roles',
        error: error.message
      });
    }
  }
);

// POST /api/admin/system/initialize-rbac - Initialize complete RBAC system
router.post('/system/initialize-rbac',
  requireRole('Super Admin'),
  async (req, res) => {
    try {
      const { initializeRBAC } = require('../utils/seedData');
      const result = await initializeRBAC(req.user._id);
      
      res.json({
        success: true,
        data: result,
        message: 'RBAC system initialized successfully'
      });
    } catch (error) {
      console.error('Initialize RBAC error:', error);
      res.status(500).json({
        success: false,
        message: 'Error initializing RBAC system',
        error: error.message
      });
    }
  }
);

module.exports = router;
