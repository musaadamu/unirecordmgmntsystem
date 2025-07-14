import { apiClient, buildQueryString } from './api';
import { ApiResponse, User, LoginForm } from '@/types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
  };
  contactInfo: {
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', userData);
    return response.data.data.user;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', profileData);
    return response.data.data.user;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.put('/auth/change-password', passwordData);
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/password-reset/request', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/password-reset/reset', { token, newPassword });
  },

  // Verify reset token
  verifyResetToken: async (token: string): Promise<{ email: string; firstName: string }> => {
    const response = await apiClient.get<ApiResponse<{ email: string; firstName: string }>>(
      `/password-reset/verify/${token}`
    );
    return response.data.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/password-reset/verify-email', { token });
  },
};

export default authService;
