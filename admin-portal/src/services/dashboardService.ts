import { apiClient, buildQueryString } from './api';
import { ApiResponse, DashboardStats } from '@/types';

export interface DashboardOverview {
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  activeUsers: number;
  newRegistrations: number;
}

export interface EnrollmentTrend {
  period: string;
  enrollments: number;
  completions: number;
  dropouts: number;
  revenue: number;
}

export interface DepartmentStats {
  department: string;
  students: number;
  courses: number;
  revenue: number;
  averageGpa: number;
  completionRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'payment' | 'grade' | 'user_created' | 'course_created';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: string;
  metadata?: any;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    payments: number;
  }>;
}

export interface AcademicAnalytics {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageGpa: number;
  completionRate: number;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    averageGpa: number;
    enrollments: number;
    completionRate: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  registrationTrends: Array<{
    period: string;
    registrations: number;
    activations: number;
  }>;
  loginActivity: Array<{
    date: string;
    logins: number;
    uniqueUsers: number;
  }>;
}

export const dashboardService = {
  // Get dashboard overview statistics
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
    return response.data.data;
  },

  // Get enrollment trends
  getEnrollmentTrends: async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<EnrollmentTrend[]> => {
    const response = await apiClient.get<ApiResponse<{ trends: EnrollmentTrend[] }>>(
      `/dashboard/enrollment-trends?period=${period}`
    );
    return response.data.data.trends;
  },

  // Get department statistics
  getDepartmentStats: async (): Promise<DepartmentStats[]> => {
    const response = await apiClient.get<ApiResponse<{ departments: DepartmentStats[] }>>(
      '/dashboard/department-stats'
    );
    return response.data.data.departments;
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get<ApiResponse<{ activities: RecentActivity[] }>>(
      `/dashboard/recent-activities?limit=${limit}`
    );
    return response.data.data.activities;
  },

  // Get payment analytics
  getPaymentAnalytics: async (period: 'month' | 'quarter' | 'year' = 'month'): Promise<PaymentAnalytics> => {
    const response = await apiClient.get<ApiResponse<PaymentAnalytics>>(
      `/dashboard/payment-analytics?period=${period}`
    );
    return response.data.data;
  },

  // Get academic analytics
  getAcademicAnalytics: async (academicYear?: string): Promise<AcademicAnalytics> => {
    const queryString = buildQueryString({ academicYear });
    const response = await apiClient.get<ApiResponse<AcademicAnalytics>>(
      `/dashboard/academic-analytics${queryString}`
    );
    return response.data.data;
  },

  // Get user analytics
  getUserAnalytics: async (period: 'week' | 'month' | 'quarter' = 'month'): Promise<UserAnalytics> => {
    const response = await apiClient.get<ApiResponse<UserAnalytics>>(
      `/dashboard/user-analytics?period=${period}`
    );
    return response.data.data;
  },

  // Get system health metrics
  getSystemHealth: async () => {
    const response = await apiClient.get<ApiResponse<{
      status: 'healthy' | 'warning' | 'critical';
      uptime: number;
      responseTime: number;
      databaseStatus: 'connected' | 'disconnected';
      memoryUsage: number;
      cpuUsage: number;
      activeConnections: number;
    }>>('/dashboard/system-health');
    return response.data.data;
  },

  // Export dashboard data
  exportDashboardData: async (format: 'pdf' | 'excel', filters?: any) => {
    const queryString = buildQueryString({ format, ...filters });
    const response = await apiClient.get(`/dashboard/export${queryString}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default dashboardService;
