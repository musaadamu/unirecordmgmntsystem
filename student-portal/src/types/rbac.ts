// RBAC Type Definitions for University Record Management System

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve' | 'export' | 'import';
  description: string;
  category: 'academic' | 'administrative' | 'system' | 'reporting' | 'financial' | 'communication';
  isActive: boolean;
  conditions?: PermissionCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCondition {
  type: 'department' | 'time' | 'ip' | 'location' | 'semester';
  operator: 'equals' | 'in' | 'not_in' | 'between' | 'greater_than' | 'less_than';
  value: any;
  description?: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean;
  isActive: boolean;
  category: 'administrative' | 'academic' | 'financial' | 'support' | 'system';
  level: number; // Role hierarchy level (1-10, 10 being highest)
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  _id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  conditions?: UserRoleCondition[];
  department?: string;
  notes?: string;
}

export interface UserRoleCondition {
  type: 'department' | 'time_range' | 'ip_restriction' | 'location' | 'temporary';
  value: any;
  description?: string;
}

export interface PermissionGroup {
  _id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  effectivePermissions: string[]; // Computed permission names
  lastUpdated: string;
  cacheExpiry: string;
}

export interface RoleTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCheck {
  permission: string;
  resource?: string;
  conditions?: Record<string, any>;
}

export interface RoleAssignment {
  userId: string;
  roleIds: string[];
  assignedBy: string;
  expiresAt?: string;
  conditions?: UserRoleCondition[];
  department?: string;
  notes?: string;
}

export interface RoleFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  isSystemRole?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'level';
  sortOrder?: 'asc' | 'desc';
}

export interface PermissionFilters {
  search?: string;
  category?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'resource' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserRoleFilters {
  userId?: string;
  roleId?: string;
  assignedBy?: string;
  department?: string;
  isActive?: boolean;
  expiresAfter?: string;
  expiresBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: 'assignedAt' | 'expiresAt' | 'userId';
  sortOrder?: 'asc' | 'desc';
}

export interface RoleAnalytics {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  rolesByCategory: Record<string, number>;
  mostUsedRoles: Array<{
    roleId: string;
    roleName: string;
    userCount: number;
  }>;
  recentAssignments: number;
  expiringAssignments: number;
}

export interface PermissionMatrix {
  users: Array<{
    userId: string;
    userName: string;
    email: string;
    roles: string[];
    permissions: string[];
    department?: string;
  }>;
  roles: Role[];
  permissions: Permission[];
}

export interface RoleApproval {
  _id: string;
  requestType: 'assign' | 'remove' | 'modify';
  userId: string;
  roleId: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestData: any;
  reason?: string;
  approvalReason?: string;
  requestedAt: string;
  approvedAt?: string;
  expiresAt: string;
}

export interface AuditLog {
  _id: string;
  action: 'role_assigned' | 'role_removed' | 'permission_granted' | 'permission_revoked' | 'role_created' | 'role_updated' | 'role_deleted';
  userId: string;
  targetUserId?: string;
  roleId?: string;
  permissionId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// Permission Constants
export const PERMISSIONS = {
  // Student Management
  STUDENTS_CREATE: 'students:create',
  STUDENTS_READ: 'students:read',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_MANAGE: 'students:manage',
  
  // Course Management
  COURSES_CREATE: 'courses:create',
  COURSES_READ: 'courses:read',
  COURSES_UPDATE: 'courses:update',
  COURSES_DELETE: 'courses:delete',
  COURSES_MANAGE: 'courses:manage',
  
  // Grade Management
  GRADES_CREATE: 'grades:create',
  GRADES_READ: 'grades:read',
  GRADES_UPDATE: 'grades:update',
  GRADES_DELETE: 'grades:delete',
  GRADES_APPROVE: 'grades:approve',
  
  // Financial Management
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_UPDATE: 'payments:update',
  PAYMENTS_DELETE: 'payments:delete',
  PAYMENTS_APPROVE: 'payments:approve',
  
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  
  // Role Management
  ROLES_CREATE: 'roles:create',
  ROLES_READ: 'roles:read',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',
  
  // User Management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',
  
  // Reporting
  REPORTS_CREATE: 'reports:create',
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_MANAGE: 'reports:manage',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role Constants
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ACADEMIC_COORDINATOR: 'academic_coordinator',
  FINANCE_OFFICER: 'finance_officer',
  REGISTRAR: 'registrar',
  STUDENT_AFFAIRS: 'student_affairs',
  IT_SUPPORT: 'it_support',
  INSTRUCTOR: 'instructor',
  STAFF: 'staff',
} as const;

export type SystemRoleName = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

// Permission Categories
export const PERMISSION_CATEGORIES = {
  ACADEMIC: 'academic',
  ADMINISTRATIVE: 'administrative',
  SYSTEM: 'system',
  REPORTING: 'reporting',
  FINANCIAL: 'financial',
  COMMUNICATION: 'communication',
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

// Role Categories
export const ROLE_CATEGORIES = {
  ADMINISTRATIVE: 'administrative',
  ACADEMIC: 'academic',
  FINANCIAL: 'financial',
  SUPPORT: 'support',
  SYSTEM: 'system',
} as const;

export type RoleCategory = typeof ROLE_CATEGORIES[keyof typeof ROLE_CATEGORIES];
