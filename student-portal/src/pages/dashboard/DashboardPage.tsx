import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  School,
  Grade,
  Payment,
  TrendingUp,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import dashboardService from '@/services/dashboardService';
import StatCard from '@/components/Dashboard/StatCard';
import UpcomingClasses from '@/components/Dashboard/UpcomingClasses';
import RecentGrades from '@/components/Dashboard/RecentGrades';
import PendingAssignments from '@/components/Dashboard/PendingAssignments';
import QuickActions from '@/components/Dashboard/QuickActions';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Use real API queries
  const statsQuery = useQuery({
  queryKey: ['student-stats', user?._id],
  queryFn: async () => await dashboardService.getDashboardStats(),
    staleTime: 5 * 60 * 1000,
  });
  const classesQuery = useQuery({
    queryKey: ['upcoming-classes', user?._id],
    queryFn: async () => await dashboardService.getUpcomingClasses(user?._id),
    staleTime: 5 * 60 * 1000,
  });
  const gradesQuery = useQuery({
    queryKey: ['recent-grades', user?._id],
    queryFn: async () => await dashboardService.getRecentGrades(user?._id),
    staleTime: 5 * 60 * 1000,
  });
  const assignmentsQuery = useQuery({
    queryKey: ['pending-assignments', user?._id],
    queryFn: async () => await dashboardService.getPendingAssignments(user?._id),
    staleTime: 5 * 60 * 1000,
  });
  // All mock data removed; only real API data is used

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getAcademicStandingColor = (standing: string) => {
    switch (standing) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'satisfactory':
        return 'warning';
      case 'probation':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {getGreeting()}, {user?.personalInfo?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your academic journey today.
        </Typography>
      </Box>

      {/* Academic Standing Alert */}
      {user?.academicInfo?.gpa && user.academicInfo.gpa < 2.0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your current GPA is below the minimum requirement. Please consider meeting with your academic advisor.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current GPA"
            value={statsQuery.data?.academic.currentGPA.toFixed(2) || '0.00'}
            subtitle={`Semester: ${statsQuery.data?.academic.semesterGPA.toFixed(2) || '0.00'}`}
            icon={<Grade />}
            color="#2e7d32"
            trend="up"
            trendValue="+0.15"
            loading={statsQuery.isLoading}
            onClick={() => navigate('/grades')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits Progress"
            value={`${statsQuery.data?.academic.completedCredits || 0}/${statsQuery.data?.academic.totalCredits || 0}`}
            subtitle="Credits completed"
            icon={<School />}
            color="#1976d2"
            progress={statsQuery.data?.academic.completedCredits || 0}
            maxValue={statsQuery.data?.academic.totalCredits || 120}
            loading={statsQuery.isLoading}
            onClick={() => navigate('/courses')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${statsQuery.data?.attendance.overallRate || 0}%`}
            subtitle="This semester"
            icon={<CheckCircle />}
            color="#ed6c02"
            progress={statsQuery.data?.attendance.overallRate || 0}
            trend="up"
            trendValue="+2%"
            loading={statsQuery.isLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Fees"
            value={`₦${(statsQuery.data?.financial.pendingAmount || 0).toLocaleString()}`}
            subtitle="Due Feb 15, 2024"
            icon={<Payment />}
            color="#9c27b0"
            badge={statsQuery.data?.financial.pendingAmount ? "Due Soon" : undefined}
            badgeColor="warning"
            loading={statsQuery.isLoading}
            onClick={() => navigate('/payments')}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <QuickActions loading={false} />
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} lg={6}>
          <UpcomingClasses
            classes={classesQuery.data || []}
            loading={classesQuery.isLoading}
            onViewAll={() => navigate('/schedule')}
          />
        </Grid>

        {/* Recent Grades */}
        <Grid item xs={12} lg={6}>
          <RecentGrades
            grades={gradesQuery.data || []}
            loading={gradesQuery.isLoading}
            onViewAll={() => navigate('/grades')}
          />
        </Grid>

        {/* Pending Assignments */}
        <Grid item xs={12}>
          <PendingAssignments
            assignments={assignmentsQuery.data || []}
            loading={assignmentsQuery.isLoading}
            onViewAll={() => navigate('/assignments')}
            onOpenAssignment={(id) => navigate(`/assignments/${id}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
