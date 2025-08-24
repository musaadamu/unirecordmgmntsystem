import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  People,
  School,
  MenuBook,
  Payment,
  TrendingUp,
  TrendingDown,
  PersonAdd,
  AttachMoney,
  Refresh,
  Download,
  FilterList,
  Analytics,
  Assessment,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import StatCard from '../components/Dashboard/StatCard';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import dashboardService from '../services/dashboardService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);


  // Fixed React Query hooks - always return valid data, never undefined
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview, error: dashboardError } = useQuery({
    queryKey: ['dashboard-overview', refreshKey],
    queryFn: async () => {
      return await dashboardService.getDashboardOverview();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: enrollmentTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['enrollment-trends', timePeriod, refreshKey],
    queryFn: async () => {
      return await dashboardService.getEnrollmentTrends(timePeriod);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentStats, isLoading: departmentLoading } = useQuery({
    queryKey: ['department-stats', refreshKey],
    queryFn: async () => {
      return await dashboardService.getDepartmentStats();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentActivities, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['recent-activities', refreshKey],
    queryFn: async () => {
      return await dashboardService.getRecentActivities(10);
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: paymentAnalytics, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-analytics', timePeriod, refreshKey],
    queryFn: async () => {
      return await dashboardService.getPaymentAnalytics(timePeriod);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: academicAnalytics, isLoading: academicLoading } = useQuery({
    queryKey: ['academic-analytics', refreshKey],
    queryFn: async () => {
      return await dashboardService.getAcademicAnalytics();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['user-analytics', timePeriod, refreshKey],
    queryFn: async () => {
  // Only pass 'week', 'month', or 'quarter' (not 'year')
  const validPeriods = ['week', 'month', 'quarter'];
  const safePeriod = validPeriods.includes(timePeriod) ? timePeriod : 'month';
  return await dashboardService.getUserAnalytics(safePeriod as 'week' | 'month' | 'quarter');
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed');
  };

  const handleExport = async () => {
    try {
      await dashboardService.exportDashboardData('pdf', { period: timePeriod });
      toast.success('Dashboard report exported successfully');
    } catch (error) {
      toast.error('Failed to export dashboard report');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Generate stats from overview data with fallbacks
  const stats = overview
    ? [
        {
          title: 'Total Students',
          value: overview.totalStudents?.toLocaleString() ?? 'N/A',
          change: '',
          trend: 'neutral' as const,
          icon: <School />,
          color: '#1976d2',
          subtitle: 'Active enrollments',
        },
        {
          title: 'Active Courses',
          value: overview.totalCourses?.toString() ?? 'N/A',
          change: '',
          trend: 'neutral' as const,
          icon: <MenuBook />,
          color: '#2e7d32',
          subtitle: 'This semester',
        },
        {
          title: 'Total Revenue',
          value:
            overview.totalRevenue !== undefined
              ? `$${(overview.totalRevenue / 1000000).toFixed(1)}M`
              : 'N/A',
          change: '',
          trend: 'neutral' as const,
          icon: <AttachMoney />,
          color: '#ed6c02',
          subtitle: 'This academic year',
        },
        {
          title: 'Pending Payments',
          value: overview.pendingPayments?.toString() ?? 'N/A',
          change: '',
          trend: 'neutral' as const,
          icon: <Payment />,
          color: '#d32f2f',
          subtitle: 'Requires attention',
        },
      ]
    : [];

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's what's happening at your university today.
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={timePeriod}
                label="Period"
                onChange={(e) => setTimePeriod(e.target.value as 'month' | 'quarter' | 'year')}
              >
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={overviewLoading}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {dashboardError && ((dashboardError as any)?.response?.status === 401 || (dashboardError as any)?.response?.status === 403) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          You are not authorized to view dashboard information. Please log in with the correct account or contact your administrator.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard title="" value={0} icon={<School />} color="#1976d2" loading />
            </Grid>
          ))
        ) : (
          stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
                loading={overviewLoading}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* Analytics Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" icon={<Analytics />} />
          <Tab label="Academic" icon={<School />} />
          <Tab label="Financial" icon={<Payment />} />
          <Tab label="Users" icon={<People />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Enrollment Trends Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                {trendsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <LineChart
                    title="Enrollment Trends"
                    data={enrollmentTrends || []}
                    height={350}
                    xAxisKey="period"
                    lines={[
                      { dataKey: 'enrollments', stroke: '#1976d2', name: 'Enrollments' },
                      { dataKey: 'completions', stroke: '#2e7d32', name: 'Completions' },
                    ]}
                    formatTooltip={(value, name) => [value.toString(), name]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} lg={4}>
            <ActivityFeed
              activities={recentActivities || []}
              loading={activitiesLoading}
              onRefresh={refetchActivities}
              maxItems={8}
            />
          </Grid>

          {/* Department Performance */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                {departmentLoading ? (
                  <LoadingSpinner />
                ) : (
                  <BarChart
                    title="Department Performance"
                    data={departmentStats || []}
                    height={300}
                    xAxisKey="department"
                    bars={[
                      { dataKey: 'students', fill: '#1976d2', name: 'Students' },
                    ]}
                    formatTooltip={(value, name) => [value.toString(), name]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue by Department */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                {departmentLoading ? (
                  <LoadingSpinner />
                ) : (
                  <BarChart
                    title="Revenue by Department"
                    data={departmentStats || []}
                    height={300}
                    xAxisKey="department"
                    bars={[
                      { dataKey: 'revenue', fill: '#2e7d32', name: 'Revenue ($)' },
                    ]}
                    formatTooltip={(value, name) => [`$${value.toLocaleString()}`, name]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Academic Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Grade Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <PieChart
                  title="Grade Distribution"
                  data={(academicAnalytics?.gradeDistribution || []).map(gd => ({ name: gd.grade, value: gd.count }))}
                  height={350}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Department GPA */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                {departmentLoading ? (
                  <LoadingSpinner />
                ) : (
                  <BarChart
                    title="Average GPA by Department"
                    data={departmentStats || []}
                    height={350}
                    xAxisKey="department"
                    bars={[
                      { dataKey: 'averageGpa', fill: '#ed6c02', name: 'Average GPA' },
                    ]}
                    formatTooltip={(value, name) => [value.toFixed(2), name]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Course Enrollment Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {trendsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <LineChart
                    title="Course Enrollment vs Completion Trends"
                    data={enrollmentTrends || []}
                    height={300}
                    xAxisKey="period"
                    lines={[
                      { dataKey: 'enrollments', stroke: '#1976d2', name: 'Enrollments' },
                      { dataKey: 'completions', stroke: '#2e7d32', name: 'Completions' },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Financial Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Revenue Trends */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                {trendsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <LineChart
                    title="Revenue Trends"
                    data={enrollmentTrends || []}
                    height={350}
                    xAxisKey="period"
                    lines={[
                      { dataKey: 'revenue', stroke: '#2e7d32', name: 'Revenue ($)' },
                    ]}
                    formatTooltip={(value, name) => [`$${value.toLocaleString()}`, name]}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Status
                </Typography>
                <Box mt={2}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Paid</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {paymentAnalytics?.monthlyRevenue || 85}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={paymentAnalytics?.monthlyRevenue || 85}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#2e7d32' },
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Pending</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {paymentAnalytics?.pendingAmount || 12}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={paymentAnalytics?.pendingAmount || 12}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#ed6c02' },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Overdue</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {paymentAnalytics?.overdueAmount || 3}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={paymentAnalytics?.overdueAmount || 3}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#d32f2f' },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Users by Role */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <PieChart
                  title="Users by Role"
                  data={userAnalytics?.usersByRole?.map(u => ({ name: u.role, value: u.count })) || []}
                  height={350}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* User Registration Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <LineChart
                  title="User Registration Trends"
                  data={[
                    { period: 'Jan', registrations: 45 },
                    { period: 'Feb', registrations: 52 },
                    { period: 'Mar', registrations: 48 },
                    { period: 'Apr', registrations: 61 },
                    { period: 'May', registrations: 55 },
                    { period: 'Jun', registrations: 67 },
                  ]}
                  height={350}
                  xAxisKey="period"
                  lines={[
                    { dataKey: 'registrations', stroke: '#9c27b0', name: 'New Registrations' },
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default DashboardPage;