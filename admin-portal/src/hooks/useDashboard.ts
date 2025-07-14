import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import dashboardService from '@/services/dashboardService';

export interface DashboardFilters {
  timePeriod: 'week' | 'month' | 'quarter' | 'year';
  academicYear?: string;
  department?: string;
}

export const useDashboard = (initialFilters: DashboardFilters = { timePeriod: 'month' }) => {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();

  // Dashboard overview query
  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview', refreshKey],
    queryFn: () => dashboardService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Enrollment trends query
  const enrollmentTrendsQuery = useQuery({
    queryKey: ['enrollment-trends', filters.timePeriod, refreshKey],
    queryFn: () => dashboardService.getEnrollmentTrends(filters.timePeriod),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Department stats query
  const departmentStatsQuery = useQuery({
    queryKey: ['department-stats', refreshKey],
    queryFn: () => dashboardService.getDepartmentStats(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Recent activities query
  const recentActivitiesQuery = useQuery({
    queryKey: ['recent-activities', refreshKey],
    queryFn: () => dashboardService.getRecentActivities(10),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Payment analytics query
  const paymentAnalyticsQuery = useQuery({
    queryKey: ['payment-analytics', filters.timePeriod, refreshKey],
    queryFn: () => dashboardService.getPaymentAnalytics(filters.timePeriod),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Academic analytics query
  const academicAnalyticsQuery = useQuery({
    queryKey: ['academic-analytics', filters.academicYear, refreshKey],
    queryFn: () => dashboardService.getAcademicAnalytics(filters.academicYear),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // User analytics query
  const userAnalyticsQuery = useQuery({
    queryKey: ['user-analytics', filters.timePeriod, refreshKey],
    queryFn: () => dashboardService.getUserAnalytics(filters.timePeriod),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // System health query
  const systemHealthQuery = useQuery({
    queryKey: ['system-health', refreshKey],
    queryFn: () => dashboardService.getSystemHealth(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh all data
  const refreshDashboard = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed');
  }, []);

  // Refresh specific query
  const refreshQuery = useCallback((queryKey: string) => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }, [queryClient]);

  // Export dashboard data
  const exportData = useCallback(async (format: 'pdf' | 'excel') => {
    try {
      await dashboardService.exportDashboardData(format, filters);
      toast.success(`Dashboard report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export dashboard report');
      throw error;
    }
  }, [filters]);

  // Check if any query is loading
  const isLoading = 
    overviewQuery.isLoading ||
    enrollmentTrendsQuery.isLoading ||
    departmentStatsQuery.isLoading ||
    recentActivitiesQuery.isLoading ||
    paymentAnalyticsQuery.isLoading ||
    academicAnalyticsQuery.isLoading ||
    userAnalyticsQuery.isLoading ||
    systemHealthQuery.isLoading;

  // Check if any query has error
  const hasError = 
    overviewQuery.isError ||
    enrollmentTrendsQuery.isError ||
    departmentStatsQuery.isError ||
    recentActivitiesQuery.isError ||
    paymentAnalyticsQuery.isError ||
    academicAnalyticsQuery.isError ||
    userAnalyticsQuery.isError ||
    systemHealthQuery.isError;

  // Get all errors
  const errors = [
    overviewQuery.error,
    enrollmentTrendsQuery.error,
    departmentStatsQuery.error,
    recentActivitiesQuery.error,
    paymentAnalyticsQuery.error,
    academicAnalyticsQuery.error,
    userAnalyticsQuery.error,
    systemHealthQuery.error,
  ].filter(Boolean);

  return {
    // Data
    data: {
      overview: overviewQuery.data,
      enrollmentTrends: enrollmentTrendsQuery.data,
      departmentStats: departmentStatsQuery.data,
      recentActivities: recentActivitiesQuery.data,
      paymentAnalytics: paymentAnalyticsQuery.data,
      academicAnalytics: academicAnalyticsQuery.data,
      userAnalytics: userAnalyticsQuery.data,
      systemHealth: systemHealthQuery.data,
    },

    // Loading states
    loading: {
      overview: overviewQuery.isLoading,
      enrollmentTrends: enrollmentTrendsQuery.isLoading,
      departmentStats: departmentStatsQuery.isLoading,
      recentActivities: recentActivitiesQuery.isLoading,
      paymentAnalytics: paymentAnalyticsQuery.isLoading,
      academicAnalytics: academicAnalyticsQuery.isLoading,
      userAnalytics: userAnalyticsQuery.isLoading,
      systemHealth: systemHealthQuery.isLoading,
      any: isLoading,
    },

    // Error states
    errors: {
      overview: overviewQuery.error,
      enrollmentTrends: enrollmentTrendsQuery.error,
      departmentStats: departmentStatsQuery.error,
      recentActivities: recentActivitiesQuery.error,
      paymentAnalytics: paymentAnalyticsQuery.error,
      academicAnalytics: academicAnalyticsQuery.error,
      userAnalytics: userAnalyticsQuery.error,
      systemHealth: systemHealthQuery.error,
      any: hasError,
      all: errors,
    },

    // Filters and actions
    filters,
    updateFilters,
    refreshDashboard,
    refreshQuery,
    exportData,

    // Query objects for advanced usage
    queries: {
      overview: overviewQuery,
      enrollmentTrends: enrollmentTrendsQuery,
      departmentStats: departmentStatsQuery,
      recentActivities: recentActivitiesQuery,
      paymentAnalytics: paymentAnalyticsQuery,
      academicAnalytics: academicAnalyticsQuery,
      userAnalytics: userAnalyticsQuery,
      systemHealth: systemHealthQuery,
    },
  };
};

export default useDashboard;
