import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';
import {
  Permission,
  Role,
  UserRole,
  PermissionGroup,
  UserPermissions,
  RoleTemplate,
  PermissionCheck,
  RoleAssignment,
  RoleFilters,
  PermissionFilters,
  UserRoleFilters,
  RoleAnalytics,
  PermissionMatrix,
  RoleApproval,
  AuditLog,
} from '@/types/rbac';

export const rbacService = {
  // Permission Management
  getPermissions: async (filters: PermissionFilters = {}): Promise<{
    permissions: Permission[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{
      permissions: Permission[];
      pagination: any;
    }>>(`/admin/permissions${queryString}`);
    
    return {
      permissions: response.data.data.permissions,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  getPermission: async (permissionId: string): Promise<Permission> => {
    const response = await apiClient.get<ApiResponse<{ permission: Permission }>>(
      `/admin/permissions/${permissionId}`
    );
    return response.data.data.permission;
  },

  createPermission: async (permission: Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<{ permission: Permission }>>(
      '/admin/permissions',
      permission
    );
    return response.data.data.permission;
  },

  updatePermission: async (permissionId: string, updates: Partial<Permission>): Promise<Permission> => {
    const response = await apiClient.put<ApiResponse<{ permission: Permission }>>(
      `/admin/permissions/${permissionId}`,
      updates
    );
    return response.data.data.permission;
  },

  deletePermission: async (permissionId: string): Promise<void> => {
    await apiClient.delete(`/admin/permissions/${permissionId}`);
  },

  getPermissionCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<{ categories: string[] }>>(
      '/admin/permissions/categories'
    );
    return response.data.data.categories;
  },

  // Role Management
  getRoles: async (filters: RoleFilters = {}): Promise<{
    roles: Role[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{
      roles: Role[];
      pagination: any;
    }>>(`/admin/roles${queryString}`);
    
    return {
      roles: response.data.data.roles,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  getRole: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<{ role: Role }>>(
      `/admin/roles/${roleId}`
    );
    return response.data.data.role;
  },

  createRole: async (role: Omit<Role, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<{ role: Role }>>(
      '/admin/roles',
      role
    );
    return response.data.data.role;
  },

  updateRole: async (roleId: string, updates: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<{ role: Role }>>(
      `/admin/roles/${roleId}`,
      updates
    );
    return response.data.data.role;
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/admin/roles/${roleId}`);
  },

  cloneRole: async (roleId: string, newName: string): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<{ role: Role }>>(
      `/admin/roles/${roleId}/clone`,
      { name: newName }
    );
    return response.data.data.role;
  },

  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<{ permissions: Permission[] }>>(
      `/admin/roles/${roleId}/permissions`
    );
    return response.data.data.permissions;
  },

  // User Role Assignment
  getUserRoles: async (userId: string): Promise<{
    userRoles: UserRole[];
    roles: Role[];
    effectivePermissions: Permission[];
  }> => {
    const response = await apiClient.get<ApiResponse<{
      userRoles: UserRole[];
      roles: Role[];
      effectivePermissions: Permission[];
    }>>(`/admin/user-roles/user/${userId}`);
    return response.data.data;
  },

  assignRole: async (assignment: RoleAssignment): Promise<UserRole> => {
    const response = await apiClient.post<ApiResponse<{ userRole: UserRole }>>(
      '/admin/user-roles/assign',
      assignment
    );
    return response.data.data.userRole;
  },

  updateUserRole: async (userRoleId: string, updates: Partial<UserRole>): Promise<UserRole> => {
    const response = await apiClient.put<ApiResponse<{ userRole: UserRole }>>(
      `/admin/user-roles/${userRoleId}`,
      updates
    );
    return response.data.data.userRole;
  },

  removeUserRole: async (userRoleId: string): Promise<void> => {
    await apiClient.delete(`/admin/user-roles/${userRoleId}`);
  },

  getRoleUsers: async (roleId: string, filters: UserRoleFilters = {}): Promise<{
    userRoles: UserRole[];
    users: any[];
    total: number;
  }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{
      userRoles: UserRole[];
      users: any[];
      pagination: any;
    }>>(`/admin/user-roles/role/${roleId}/users${queryString}`);
    
    return {
      userRoles: response.data.data.userRoles,
      users: response.data.data.users,
      total: response.data.data.pagination.total,
    };
  },

  bulkAssignRoles: async (assignments: RoleAssignment[]): Promise<UserRole[]> => {
    const response = await apiClient.post<ApiResponse<{ userRoles: UserRole[] }>>(
      '/admin/user-roles/bulk-assign',
      { assignments }
    );
    return response.data.data.userRoles;
  },

  // User Permission Queries
  getUserPermissions: async (userId: string): Promise<UserPermissions> => {
    const response = await apiClient.get<ApiResponse<{ userPermissions: UserPermissions }>>(
      `/admin/user-permissions/${userId}`
    );
    return response.data.data.userPermissions;
  },

  checkUserPermission: async (userId: string, permission: PermissionCheck): Promise<{
    hasPermission: boolean;
    reason?: string;
    conditions?: any;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      hasPermission: boolean;
      reason?: string;
      conditions?: any;
    }>>(`/admin/user-permissions/${userId}/check`, permission);
    return response.data.data;
  },

  getPermissionMatrix: async (filters: {
    userIds?: string[];
    roleIds?: string[];
    department?: string;
  } = {}): Promise<PermissionMatrix> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ matrix: PermissionMatrix }>>(
      `/admin/user-permissions/matrix${queryString}`
    );
    return response.data.data.matrix;
  },

  // Permission Groups
  getPermissionGroups: async (): Promise<PermissionGroup[]> => {
    const response = await apiClient.get<ApiResponse<{ groups: PermissionGroup[] }>>(
      '/admin/permission-groups'
    );
    return response.data.data.groups;
  },

  createPermissionGroup: async (group: Omit<PermissionGroup, '_id' | 'createdAt' | 'updatedAt'>): Promise<PermissionGroup> => {
    const response = await apiClient.post<ApiResponse<{ group: PermissionGroup }>>(
      '/admin/permission-groups',
      group
    );
    return response.data.data.group;
  },

  updatePermissionGroup: async (groupId: string, updates: Partial<PermissionGroup>): Promise<PermissionGroup> => {
    const response = await apiClient.put<ApiResponse<{ group: PermissionGroup }>>(
      `/admin/permission-groups/${groupId}`,
      updates
    );
    return response.data.data.group;
  },

  deletePermissionGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/admin/permission-groups/${groupId}`);
  },

  // Role Templates
  getRoleTemplates: async (): Promise<RoleTemplate[]> => {
    const response = await apiClient.get<ApiResponse<{ templates: RoleTemplate[] }>>(
      '/admin/role-templates'
    );
    return response.data.data.templates;
  },

  createRoleFromTemplate: async (templateId: string, roleName: string): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<{ role: Role }>>(
      `/admin/role-templates/${templateId}/create-role`,
      { name: roleName }
    );
    return response.data.data.role;
  },

  // Analytics and Reporting
  getRoleAnalytics: async (): Promise<RoleAnalytics> => {
    const response = await apiClient.get<ApiResponse<{ analytics: RoleAnalytics }>>(
      '/admin/roles/analytics'
    );
    return response.data.data.analytics;
  },

  // Role Approvals
  getRoleApprovals: async (filters: {
    status?: string;
    requestedBy?: string;
    userId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    approvals: RoleApproval[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{
      approvals: RoleApproval[];
      pagination: any;
    }>>(`/admin/role-approvals${queryString}`);
    
    return {
      approvals: response.data.data.approvals,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  approveRoleRequest: async (approvalId: string, reason?: string): Promise<RoleApproval> => {
    const response = await apiClient.post<ApiResponse<{ approval: RoleApproval }>>(
      `/admin/role-approvals/${approvalId}/approve`,
      { reason }
    );
    return response.data.data.approval;
  },

  rejectRoleRequest: async (approvalId: string, reason: string): Promise<RoleApproval> => {
    const response = await apiClient.post<ApiResponse<{ approval: RoleApproval }>>(
      `/admin/role-approvals/${approvalId}/reject`,
      { reason }
    );
    return response.data.data.approval;
  },

  // Audit Logs
  getAuditLogs: async (filters: {
    action?: string;
    userId?: string;
    targetUserId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{
      logs: AuditLog[];
      pagination: any;
    }>>(`/admin/audit-logs${queryString}`);
    
    return {
      logs: response.data.data.logs,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  // Import/Export
  exportRoles: async (format: 'csv' | 'json' = 'json'): Promise<Blob> => {
    const response = await apiClient.get(`/admin/roles/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  importRoles: async (file: File): Promise<{
    imported: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<{
      imported: number;
      errors: string[];
    }>>('/admin/roles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  exportPermissions: async (format: 'csv' | 'json' = 'json'): Promise<Blob> => {
    const response = await apiClient.get(`/admin/permissions/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  importPermissions: async (file: File): Promise<{
    imported: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<{
      imported: number;
      errors: string[];
    }>>('/admin/permissions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

export default rbacService;
