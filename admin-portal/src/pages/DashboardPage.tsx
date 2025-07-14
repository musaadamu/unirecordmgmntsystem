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
import StatCard from '@/components/Dashboard/StatCard';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import LineChart from '@/components/Charts/LineChart';
import BarChart from '@/components/Charts/BarChart';
import PieChart from '@/components/Charts/PieChart';
import LoadingSpinner from '@/components/LoadingSpinner';

// Services
import dashboardService from '@/services/dashboardService';

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
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['dashboard-overview', refreshKey],
    queryFn: () => dashboardService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: enrollmentTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['enrollment-trends', timePeriod, refreshKey],
    queryFn: () => dashboardService.getEnrollmentTrends(timePeriod),
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentStats, isLoading: departmentLoading } = useQuery({
    queryKey: ['department-stats', refreshKey],
    queryFn: () => dashboardService.getDepartmentStats(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentActivities, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['recent-activities', refreshKey],
    queryFn: () => dashboardService.getRecentActivities(10),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: paymentAnalytics, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-analytics', timePeriod, refreshKey],
    queryFn: () => dashboardService.getPaymentAnalytics(timePeriod),
    staleTime: 5 * 60 * 1000,
  });

  const { data: academicAnalytics, isLoading: academicLoading } = useQuery({
    queryKey: ['academic-analytics', refreshKey],
    queryFn: () => dashboardService.getAcademicAnalytics(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['user-analytics', timePeriod, refreshKey],
    queryFn: () => dashboardService.getUserAnalytics(timePeriod),
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

  // Mock data for fallback when API is not available
  const mockStats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12%',
      trend: 'up' as const,
      icon: <School />,
      color: '#1976d2',
      subtitle: 'Active enrollments',
    },
    {
      title: 'Active Courses',
      value: '156',
      change: '+3%',
      trend: 'up' as const,
      icon: <MenuBook />,
      color: '#2e7d32',
      subtitle: 'This semester',
    },
    {
      title: 'Total Revenue',
      value: '$1.2M',
      change: '+8%',
      trend: 'up' as const,
      icon: <AttachMoney />,
      color: '#ed6c02',
      subtitle: 'This academic year',
    },
    {
      title: 'Pending Payments',
      value: '89',
      change: '-5%',
      trend: 'down' as const,
      icon: <Payment />,
      color: '#d32f2f',
      subtitle: 'Requires attention',
    },
  ];

  // Mock data for charts when API is not available
  const mockEnrollmentTrends = [
    { period: 'Jan', enrollments: 120, completions: 95, revenue: 45000 },
    { period: 'Feb', enrollments: 135, completions: 110, revenue: 52000 },
    { period: 'Mar', enrollments: 150, completions: 125, revenue: 58000 },
    { period: 'Apr', enrollments: 145, completions: 130, revenue: 55000 },
    { period: 'May', enrollments: 160, completions: 140, revenue: 62000 },
    { period: 'Jun', enrollments: 175, completions: 155, revenue: 68000 },
  ];

  const mockDepartmentStats = [
    { department: 'Computer Science', students: 450, revenue: 180000, averageGpa: 3.4 },
    { department: 'Engineering', students: 380, revenue: 152000, averageGpa: 3.2 },
    { department: 'Business', students: 320, revenue: 128000, averageGpa: 3.6 },
    { department: 'Medicine', students: 280, revenue: 140000, averageGpa: 3.8 },
    { department: 'Arts', students: 250, revenue: 100000, averageGpa: 3.5 },
  ];

  const mockActivities = [
    {
      id: '1',
      type: 'enrollment' as const,
      title: 'New Student Enrollment',
      description: 'John Doe enrolled in Computer Science program',
      user: { name: 'John Doe', role: 'Student' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'payment' as const,
      title: 'Payment Received',
      description: 'Tuition payment of $2,500 from Jane Smith',
      user: { name: 'Jane Smith', role: 'Student' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'grade' as const,
      title: 'Grades Posted',
      description: 'Final grades posted for MATH101',
      user: { name: 'Dr. Johnson', role: 'Professor' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockGradeDistribution = [
    { name: 'A', value: 25, color: '#2e7d32' },
    { name: 'B', value: 35, color: '#1976d2' },
    { name: 'C', value: 25, color: '#ed6c02' },
    { name: 'D', value: 10, color: '#f57c00' },
    { name: 'F', value: 5, color: '#d32f2f' },
  ];

  const mockUsersByRole = [
    { name: 'Students', value: 2847, color: '#1976d2' },
    { name: 'Academic Staff', value: 156, color: '#2e7d32' },
    { name: 'Support Staff', value: 89, color: '#ed6c02' },
    { name: 'Administrators', value: 12, color: '#9c27b0' },
  ];

  // Use real data if available, otherwise use mock data
  const stats = overview ? [
    {
      title: 'Total Students',
      value: overview.totalStudents.toLocaleString(),
      change: '+12%',
      trend: 'up' as const,
      icon: <School />,
      color: '#1976d2',
      subtitle: 'Active enrollments',
    },
    {
      title: 'Active Courses',
      value: overview.totalCourses.toString(),
      change: '+3%',
      trend: 'up' as const,
      icon: <MenuBook />,
      color: '#2e7d32',
      subtitle: 'This semester',
    },
    {
      title: 'Total Revenue',
      value: `$${(overview.totalRevenue / 1000000).toFixed(1)}M`,
      change: '+8%',
      trend: 'up' as const,
      icon: <AttachMoney />,
      color: '#ed6c02',
      subtitle: 'This academic year',
    },
    {
      title: 'Pending Payments',
      value: overview.pendingPayments.toString(),
      change: '-5%',
      trend: 'down' as const,
      icon: <Payment />,
      color: '#d32f2f',
      subtitle: 'Requires attention',
    },
  ] : mockStats;

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
                onChange={(e) => setTimePeriod(e.target.value as any)}
              >
                <MenuItem value="week">Week</MenuItem>
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

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
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
        ))}
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
                <LineChart
                  title="Enrollment Trends"
                  data={enrollmentTrends || mockEnrollmentTrends}
                  height={350}
                  xAxisKey="period"
                  lines={[
                    { dataKey: 'enrollments', stroke: '#1976d2', name: 'Enrollments' },
                    { dataKey: 'completions', stroke: '#2e7d32', name: 'Completions' },
                  ]}
                  formatTooltip={(value, name) => [value.toString(), name]}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} lg={4}>
            <ActivityFeed
              activities={recentActivities || mockActivities}
              loading={activitiesLoading}
              onRefresh={refetchActivities}
              maxItems={8}
            />
          </Grid>

          {/* Department Performance */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <BarChart
                  title="Department Performance"
                  data={departmentStats || mockDepartmentStats}
                  height={300}
                  xAxisKey="department"
                  bars={[
                    { dataKey: 'students', fill: '#1976d2', name: 'Students' },
                  ]}
                  formatTooltip={(value, name) => [value.toString(), name]}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue by Department */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <BarChart
                  title="Revenue by Department"
                  data={departmentStats || mockDepartmentStats}
                  height={300}
                  xAxisKey="department"
                  bars={[
                    { dataKey: 'revenue', fill: '#2e7d32', name: 'Revenue ($)' },
                  ]}
                  formatTooltip={(value, name) => [`$${value.toLocaleString()}`, name]}
                />
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
                  data={mockGradeDistribution}
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
                <BarChart
                  title="Average GPA by Department"
                  data={departmentStats || mockDepartmentStats}
                  height={350}
                  xAxisKey="department"
                  bars={[
                    { dataKey: 'averageGpa', fill: '#ed6c02', name: 'Average GPA' },
                  ]}
                  formatTooltip={(value, name) => [value.toFixed(2), name]}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Course Enrollment Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <LineChart
                  title="Course Enrollment vs Completion Trends"
                  data={enrollmentTrends || mockEnrollmentTrends}
                  height={300}
                  xAxisKey="period"
                  lines={[
                    { dataKey: 'enrollments', stroke: '#1976d2', name: 'Enrollments' },
                    { dataKey: 'completions', stroke: '#2e7d32', name: 'Completions' },
                  ]}
                />
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
                <LineChart
                  title="Revenue Trends"
                  data={enrollmentTrends || mockEnrollmentTrends}
                  height={350}
                  xAxisKey="period"
                  lines={[
                    { dataKey: 'revenue', stroke: '#2e7d32', name: 'Revenue ($)' },
                  ]}
                  formatTooltip={(value, name) => [`$${value.toLocaleString()}`, name]}
                />
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
                      <Typography variant="body2" fontWeight="bold">85%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={85}
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
                      <Typography variant="body2" fontWeight="bold">12%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={12}
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
                      <Typography variant="body2" fontWeight="bold">3%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={3}
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
                  data={mockUsersByRole}
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
