import { apiClient, buildQueryString, uploadFile } from './api';
import { ApiResponse, PaginatedResponse, User, UserFilters, UserForm } from '@/types';

export interface BulkUserResult {
  successful: Array<{
    email: string;
    userId: string;
    role: string;
  }>;
  failed: Array<{
    email: string;
    error: string;
  }>;
  total: number;
}

export interface UserStats {
  totalUsers: number;
  departmentStats: Array<{
    _id: string;
    count: number;
    active: number;
    averageCredits?: number;
  }>;
  recentUsers: User[];
}

export const userService = {
  // Get all users with pagination and filtering
  getUsers: async (filters: UserFilters & { page?: number; limit?: number }) => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<User>>(`/users${queryString}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data.data.user;
  },

  // Create new user
  createUser: async (userData: UserForm): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/users', userData);
    return response.data.data.user;
  },

  // Update user
  updateUser: async (id: string, userData: Partial<UserForm>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(`/users/${id}`, userData);
    return response.data.data.user;
  },

  // Delete user (soft delete)
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Search users
  searchUsers: async (query: string, filters?: UserFilters) => {
    const params = { search: query, ...filters };
    const queryString = buildQueryString(params);
    const response = await apiClient.get<PaginatedResponse<User>>(`/users/search${queryString}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
    return response.data.data;
  },

  // Bulk register users
  bulkRegisterUsers: async (users: UserForm[]): Promise<BulkUserResult> => {
    const response = await apiClient.post<ApiResponse<BulkUserResult>>('/admin/users/bulk-register', {
      users,
    });
    return response.data.data;
  },

  // Import users from CSV
  importUsersFromCSV: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<BulkUserResult> => {
    const response = await uploadFile('/admin/users/import-csv', file, onProgress);
    return response.data.data;
  },

  // Export users to CSV
  exportUsersToCSV: async (filters?: UserFilters): Promise<void> => {
    const queryString = buildQueryString({ ...filters, format: 'csv' });
    const response = await apiClient.get(`/admin/users/export${queryString}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Export users to JSON
  exportUsersToJSON: async (filters?: UserFilters) => {
    const queryString = buildQueryString({ ...filters, format: 'json' });
    const response = await apiClient.get<ApiResponse<{ users: User[]; count: number; exportDate: string }>>(
      `/admin/users/export${queryString}`
    );
    return response.data.data;
  },

  // Bulk update user status
  bulkUpdateUserStatus: async (
    userIds: string[],
    status: string,
    reason?: string
  ): Promise<BulkUserResult> => {
    const response = await apiClient.put<ApiResponse<BulkUserResult>>('/admin/users/bulk-status', {
      userIds,
      status,
      reason,
    });
    return response.data.data;
  },

  // Admin reset user password
  adminResetUserPassword: async (
    userId: string,
    newPassword?: string,
    sendEmail: boolean = true
  ): Promise<{ temporaryPassword?: string; emailSent: boolean }> => {
    const response = await apiClient.post<
      ApiResponse<{ temporaryPassword?: string; emailSent: boolean }>
    >(`/admin/users/${userId}/reset-password`, {
      newPassword,
      sendEmail,
    });
    return response.data.data;
  },

  // Send email verification
  sendEmailVerification: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/send-verification`);
  },

  // Get user activity log
  getUserActivityLog: async (
    userId: string,
    filters?: { startDate?: string; endDate?: string; action?: string }
  ) => {
    const queryString = buildQueryString(filters || {});
    const response = await apiClient.get<
      ApiResponse<{
        activities: Array<{
          action: string;
          timestamp: string;
          details: any;
          ipAddress: string;
        }>;
      }>
    >(`/users/${userId}/activity${queryString}`);
    return response.data.data;
  },

  // Get user permissions
  getUserPermissions: async (userId: string) => {
    const response = await apiClient.get<
      ApiResponse<{
        permissions: string[];
        role: string;
        effectivePermissions: string[];
      }>
    >(`/users/${userId}/permissions`);
    return response.data.data;
  },

  // Update user permissions
  updateUserPermissions: async (userId: string, permissions: string[]) => {
    const response = await apiClient.put<ApiResponse<{ permissions: string[] }>>(
      `/users/${userId}/permissions`,
      { permissions }
    );
    return response.data.data;
  },
};

export default userService;
