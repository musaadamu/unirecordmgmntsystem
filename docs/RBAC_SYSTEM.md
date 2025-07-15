# 🔐 RBAC System Documentation

## Overview

The University Record Management System includes a comprehensive **Role-Based Access Control (RBAC)** system that provides fine-grained permission management for all system resources. This system ensures secure access control while maintaining flexibility for different organizational structures.

## 🏗️ Architecture

### Core Components

1. **Permissions** - Granular access rights to specific resources and actions
2. **Roles** - Collections of permissions that define user capabilities
3. **User Role Assignments** - Mapping between users and their assigned roles
4. **Audit Logs** - Complete tracking of all RBAC operations
5. **Permission Groups** - Logical grouping of related permissions

### Database Models

- **Permission Model** (`models/Permission.js`)
- **Role Model** (`models/Role.js`)
- **UserRole Model** (`models/UserRole.js`)
- **AuditLog Model** (`models/AuditLog.js`)

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
npm install

# Initialize RBAC system (run once)
npm run init-rbac
```

### 2. Environment Variables

```env
# Optional: Redis for permission caching
REDIS_URL=redis://localhost:6379

# Required: JWT secret for authentication
JWT_SECRET=your-jwt-secret

# Required: MongoDB connection
MONGODB_URI=mongodb://localhost:27017/university-db
```

### 3. System Initialization

The RBAC system comes with predefined permissions and roles:

```bash
# Initialize default permissions and roles
npm run init-rbac
```

## 📋 Default Permissions

### Academic Permissions
- `students:create` - Create new student records
- `students:read` - View student information
- `students:update` - Update student information
- `students:delete` - Delete student records
- `students:manage` - Full student management access
- `courses:create` - Create new courses
- `courses:read` - View course information
- `courses:update` - Update course information
- `courses:delete` - Delete courses
- `courses:manage` - Full course management access
- `grades:create` - Enter student grades
- `grades:read` - View student grades
- `grades:update` - Update student grades
- `grades:delete` - Delete grade records
- `grades:approve` - Approve and finalize grades

### Administrative Permissions
- `users:create` - Create new user accounts
- `users:read` - View user information
- `users:update` - Update user information
- `users:delete` - Delete user accounts
- `users:manage` - Full user management access
- `roles:create` - Create new roles
- `roles:read` - View role information
- `roles:update` - Update role information
- `roles:delete` - Delete roles
- `roles:assign` - Assign roles to users

### Financial Permissions
- `payments:create` - Process student payments
- `payments:read` - View payment information
- `payments:update` - Update payment records
- `payments:delete` - Delete payment records
- `payments:approve` - Approve payment transactions

### System Permissions
- `system:admin` - Full system administration access
- `system:config` - Update system configuration
- `system:backup` - Create system backups
- `system:restore` - Restore system from backup
- `permissions:create` - Create new permissions
- `permissions:read` - View permission information
- `permissions:update` - Update permission information
- `permissions:delete` - Delete permissions
- `audit:read` - View audit logs
- `audit:export` - Export audit logs

## 👥 Default Roles

### System Roles

1. **Super Admin** (Level 10)
   - Full system access with all permissions
   - Cannot be modified or deleted

2. **Administrator** (Level 9)
   - System administrator with most permissions
   - User management, role assignment, system configuration

3. **Academic Coordinator** (Level 7)
   - Manages academic affairs and student records
   - Student management, course management, grade approval

4. **Finance Officer** (Level 6)
   - Manages financial transactions and payments
   - Payment processing, financial reports

5. **Registrar** (Level 6)
   - Manages student registration and academic records
   - Student management, grade viewing, reports

6. **Instructor** (Level 4)
   - Teaching staff with grade management access
   - Grade entry, course viewing, announcements

7. **Student Affairs Officer** (Level 5)
   - Manages student services and support
   - Student information, notifications, reports

8. **IT Support** (Level 5)
   - Technical support and system maintenance
   - User viewing, system configuration, audit logs

9. **Staff** (Level 3)
   - General staff with basic access
   - Read-only access to students and courses

10. **Student** (Level 1)
    - Student portal access
    - View own courses, grades, payments

## 🔧 API Endpoints

### Permission Management
```
GET    /api/admin/permissions              # Get all permissions
POST   /api/admin/permissions              # Create new permission
GET    /api/admin/permissions/:id          # Get single permission
PUT    /api/admin/permissions/:id          # Update permission
DELETE /api/admin/permissions/:id          # Delete permission
GET    /api/admin/permissions/categories   # Get permission categories
```

### Role Management
```
GET    /api/admin/roles                    # Get all roles
POST   /api/admin/roles                    # Create new role
GET    /api/admin/roles/:id                # Get single role
PUT    /api/admin/roles/:id                # Update role
DELETE /api/admin/roles/:id                # Delete role
POST   /api/admin/roles/:id/clone          # Clone role
GET    /api/admin/roles/:id/permissions    # Get role permissions
GET    /api/admin/roles/analytics          # Get role analytics
```

### User Role Assignment
```
GET    /api/admin/user-roles/user/:userId          # Get user's roles
GET    /api/admin/user-roles/role/:roleId/users    # Get users with role
POST   /api/admin/user-roles/assign                # Assign role to user
POST   /api/admin/user-roles/bulk-assign           # Bulk assign roles
PUT    /api/admin/user-roles/:id                   # Update assignment
DELETE /api/admin/user-roles/:id                   # Remove assignment
```

### Permission Queries
```
GET    /api/admin/user-permissions/:userId         # Get user permissions
POST   /api/admin/user-permissions/:userId/check   # Check user permission
GET    /api/admin/user-permissions/matrix          # Get permission matrix
GET    /api/admin/user-permissions/:userId/history # Get role history
```

## 🛡️ Security Features

### Permission Caching
- 5-minute cache for user permissions
- Automatic cache invalidation on role changes
- Redis support for distributed caching
- Memory fallback when Redis unavailable

### Audit Logging
- Complete audit trail of all RBAC operations
- IP address and user agent tracking
- Severity levels and categorization
- Automatic log rotation and cleanup

### Role Hierarchy
- 10-level role hierarchy system
- System role protection
- Permission inheritance
- Role escalation prevention

### Conditional Permissions
- Department-based restrictions
- Time-based access controls
- IP address restrictions
- Location-based permissions

## 💻 Frontend Integration

### Permission Guards

```tsx
// Component-level protection
<PermissionGuard permission="students:read">
  <StudentList />
</PermissionGuard>

// Multiple permissions (ANY)
<PermissionGuard permissions={['students:read', 'courses:read']}>
  <Dashboard />
</PermissionGuard>

// Role-based protection
<PermissionGuard roles={['admin', 'staff']}>
  <AdminPanel />
</PermissionGuard>

// Route protection
<RouteGuard permission="roles:manage">
  <RoleManagementPage />
</RouteGuard>
```

### Permission Hooks

```tsx
// Check permissions in components
const hasPermission = useHasPermission();
const canEdit = hasPermission('students:update');

// Get user roles
const { userRoles, isAdmin } = useRBACStore();

// Check multiple permissions
const canManageStudents = hasAnyPermission(['students:create', 'students:update']);
```

## 🔄 Middleware Usage

### Backend Protection

```javascript
// Single permission
router.get('/students', 
  requirePermission('students:read'),
  getStudents
);

// Multiple permissions (ANY)
router.get('/dashboard',
  requireAnyPermission(['students:read', 'courses:read']),
  getDashboard
);

// Role-based protection
router.get('/admin',
  requireRole(['admin', 'super_admin']),
  getAdminData
);
```

## 📊 Monitoring & Analytics

### Role Analytics
- Role usage statistics
- Permission distribution
- User assignment trends
- System health metrics

### Audit Reports
- Security incident tracking
- User activity monitoring
- Permission change history
- Compliance reporting

## 🚨 Best Practices

### Security
1. **Principle of Least Privilege** - Grant minimum required permissions
2. **Regular Audits** - Review role assignments periodically
3. **Role Expiration** - Set expiry dates for temporary access
4. **Permission Validation** - Always validate permissions server-side

### Performance
1. **Permission Caching** - Use Redis for better performance
2. **Batch Operations** - Use bulk assignment for multiple users
3. **Index Optimization** - Ensure proper database indexing
4. **Query Optimization** - Use efficient permission queries

### Maintenance
1. **Regular Cleanup** - Remove unused roles and permissions
2. **Audit Log Rotation** - Implement log retention policies
3. **Permission Review** - Regularly review and update permissions
4. **Documentation** - Keep role descriptions up to date

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user role assignments
   - Verify permission names match exactly
   - Ensure roles are active and not expired

2. **Cache Issues**
   - Clear user permission cache
   - Restart Redis if using distributed cache
   - Check cache TTL settings

3. **Performance Issues**
   - Enable Redis caching
   - Optimize database queries
   - Review audit log retention

### Debug Commands

```bash
# Check user permissions
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/user-permissions/<userId>

# Clear permission cache
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/system/cache/clear

# Get audit logs
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/audit-logs
```

## 📈 Future Enhancements

- AI-powered role recommendations
- Advanced audit analytics
- Multi-tenant support
- LDAP/Active Directory integration
- Mobile SDK for native apps
- Webhook notifications for role changes

## 🤝 Contributing

When contributing to the RBAC system:

1. Follow the existing permission naming convention (`resource:action`)
2. Add appropriate audit logging for new operations
3. Include permission checks in all protected endpoints
4. Update documentation for new features
5. Add tests for new functionality

## 📞 Support

For RBAC system support:
- Check the audit logs for security incidents
- Review permission assignments in the admin interface
- Contact system administrators for role modifications
- Refer to this documentation for implementation details
