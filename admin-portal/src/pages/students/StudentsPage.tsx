import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  Download,
  Upload,
  MoreVert,
  Refresh,
  School,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Components
import StatCard from '@/components/Dashboard/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Services
import userService from '@/services/userService';

const StudentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch students (users with role 'student')
  const { data: studentsData, isLoading, error: studentsError, refetch } = useQuery({
    queryKey: ['users', { role: 'student', search: searchTerm }],
    queryFn: () => userService.getUsers({ role: 'student', search: searchTerm }),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const students = studentsData?.data?.items || [];
  const pagination = studentsData?.data?.pagination;

  // Mock statistics for students
  const studentStats = [
    {
      title: 'Total Students',
      value: pagination?.totalItems?.toString() || '0',
      change: '+12%',
      trend: 'up' as const,
      icon: <School />,
      color: '#1976d2',
      subtitle: 'Enrolled students',
    },
    {
      title: 'Active Students',
      value: students.filter(s => s.status === 'active').length.toString(),
      change: '+5%',
      trend: 'up' as const,
      icon: <TrendingUp />,
      color: '#2e7d32',
      subtitle: 'Currently active',
    },
    {
      title: 'New This Month',
      value: '45',
      change: '+18%',
      trend: 'up' as const,
      icon: <Add />,
      color: '#ed6c02',
      subtitle: 'Recent enrollments',
    },
    {
      title: 'Graduation Ready',
      value: '128',
      change: '+8%',
      trend: 'up' as const,
      icon: <School />,
      color: '#9c27b0',
      subtitle: 'Final year students',
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Student Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage student records, academic progress, and enrollment status
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* Handle add student */}}
            >
              Add Student
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Student Statistics */}
      <Grid container spacing={3} mb={4}>
        {studentStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
              loading={isLoading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Chip label="All Students" color="primary" />
                <Chip label="Active" variant="outlined" />
                <Chip label="Inactive" variant="outlined" />
                <Chip label="Graduated" variant="outlined" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Content */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <LoadingSpinner message="Loading students..." />
            </Box>
          ) : studentsError ? (
            <Box textAlign="center" py={8}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load students. Please try again.
              </Alert>
              <Button variant="outlined" onClick={() => refetch()}>
                Retry
              </Button>
            </Box>
          ) : (
            <Box>
              {studentsError && (studentsError.response?.status === 401 || studentsError.response?.status === 403) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  You are not authorized to view student information. Please log in with the correct account or contact your administrator.
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                Student List ({pagination?.totalItems || 0} students)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced student management features will be available in the next update.
                Currently showing basic student information from the user management system.
              </Typography>

              {students.length > 0 && (
                <Box mt={3}>
                  <Grid container spacing={2}>
                    {students.slice(0, 6).map((student) => (
                      <Grid item xs={12} sm={6} md={4} key={student._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {student.personalInfo?.firstName} {student.personalInfo?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                            <Chip
                              label={student.status}
                              size="small"
                              color={student.status === 'active' ? 'success' : 'default'}
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Download sx={{ mr: 1 }} />
          Export Students
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Upload sx={{ mr: 1 }} />
          Import Students
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudentsPage;
