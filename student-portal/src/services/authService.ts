import { apiClient } from './api';
import { ApiResponse, User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
  };
  contactInfo?: {
    phone?: string;
    alternatePhone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
}

export const authService = {
  // Student login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/student/login', credentials);
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/auth/change-password', data);
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data.data.user;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data.user;
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      '/auth/profile/picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.user;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    await apiClient.post('/auth/resend-verification');
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh');
    return response.data.data;
  },

  // Check if email exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<{ exists: boolean }>>('/auth/check-email', { email });
    return response.data.data.exists;
  },

  // Get security settings
  getSecuritySettings: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/auth/security');
    return response.data.data;
  },

  // Update security settings
  updateSecuritySettings: async (settings: any) => {
    const response = await apiClient.put<ApiResponse<any>>('/auth/security', settings);
    return response.data.data;
  },

  // Get login history
  getLoginHistory: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/auth/login-history');
    return response.data.data;
  },

  // Enable two-factor authentication
  enableTwoFactor: async () => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/2fa/enable');
    return response.data.data;
  },

  // Disable two-factor authentication
  disableTwoFactor: async (code: string) => {
    await apiClient.post('/auth/2fa/disable', { code });
  },

  // Verify two-factor code
  verifyTwoFactor: async (code: string) => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/2fa/verify', { code });
    return response.data.data;
  },
};

export default authService;
