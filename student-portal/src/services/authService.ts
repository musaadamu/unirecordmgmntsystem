import { apiClient } from './api';
import { ApiResponse, User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
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
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      console.log('authService.login response.data:', response.data);
      console.log('authService.login response.data.data:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', data);
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (error) {
      console.error('Reset password request failed:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await apiClient.put('/auth/change-password', data);
    } catch (error) {
      console.error('Change password request failed:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    try {
      const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);
      return response.data.data.user;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<User> => {
    try {
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
    } catch (error) {
      console.error('Upload profile picture failed:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      console.error('Verify email failed:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/resend-verification');
    } catch (error) {
      console.error('Resend verification email failed:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh');
      return response.data.data;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  },

  // Check if email exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<{ exists: boolean }>>('/auth/check-email', { email });
      return response.data.data.exists;
    } catch (error) {
      console.error('Check email exists failed:', error);
      throw error;
    }
  },

  // Get security settings
  getSecuritySettings: async () => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/security');
      return response.data.data;
    } catch (error) {
      console.error('Get security settings failed:', error);
      throw error;
    }
  },

  // Update security settings
  updateSecuritySettings: async (settings: any) => {
    try {
      const response = await apiClient.put<ApiResponse<any>>('/auth/security', settings);
      return response.data.data;
    } catch (error) {
      console.error('Update security settings failed:', error);
      throw error;
    }
  },

  // Get login history
  getLoginHistory: async () => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/login-history');
      return response.data.data;
    } catch (error) {
      console.error('Get login history failed:', error);
      throw error;
    }
  },

  // Enable two-factor authentication
  enableTwoFactor: async () => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/2fa/enable');
      return response.data.data;
    } catch (error) {
      console.error('Enable two-factor authentication failed:', error);
      throw error;
    }
  },

  // Disable two-factor authentication
  disableTwoFactor: async (code: string) => {
    try {
      await apiClient.post('/auth/2fa/disable', { code });
    } catch (error) {
      console.error('Disable two-factor authentication failed:', error);
      throw error;
    }
  },

  // Verify two-factor code
  verifyTwoFactor: async (code: string) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/2fa/verify', { code });
      return response.data.data;
    } catch (error) {
      console.error('Verify two-factor code failed:', error);
      throw error;
    }
  },
};

export default authService;
