import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  People,
  School,
  Work,
  AdminPanelSettings,
  TrendingUp,
  PersonAdd,
} from '@mui/icons-material';

interface UserStatsData {
  totalUsers: number;
  departmentStats: Array<{
    _id: string;
    count: number;
    active: number;
    averageCredits?: number;
  }>;
  recentUsers: any[];
}

interface UserStatsProps {
  stats: UserStatsData;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  // Calculate role distribution (mock data for now)
  const roleStats = [
    {
      role: 'Students',
      count: Math.floor(stats.totalUsers * 0.85),
      icon: <School />,
      color: '#1976d2',
      percentage: 85,
    },
    {
      role: 'Academic Staff',
      count: Math.floor(stats.totalUsers * 0.10),
      icon: <Work />,
      color: '#2e7d32',
      percentage: 10,
    },
    {
      role: 'Support Staff',
      count: Math.floor(stats.totalUsers * 0.04),
      icon: <People />,
      color: '#ed6c02',
      percentage: 4,
    },
    {
      role: 'Administrators',
      count: Math.floor(stats.totalUsers * 0.01),
      icon: <AdminPanelSettings />,
      color: '#9c27b0',
      percentage: 1,
    },
  ];

  const recentGrowth = 12; // Mock growth percentage
  const activePercentage = 94; // Mock active user percentage

  return (
    <Grid container spacing={3}>
      {/* Total Users */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#1976d2',
                  width: 56,
                  height: 56,
                }}
              >
                <People />
              </Avatar>
            </Box>
            <Box mt={2} display="flex" alignItems="center">
              <TrendingUp fontSize="small" color="success" />
              <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                +{recentGrowth}% this month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Active Users */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {Math.floor(stats.totalUsers * (activePercentage / 100)).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#2e7d32',
                  width: 56,
                  height: 56,
                }}
              >
                <PersonAdd />
              </Avatar>
            </Box>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="caption">Activity Rate</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {activePercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={activePercentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2e7d32',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Role Distribution */}
      {roleStats.slice(0, 2).map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={stat.role}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.count.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.role}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: stat.color,
                    width: 56,
                    height: 56,
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption">Percentage</Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {stat.percentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stat.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stat.color,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Department Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              User Distribution by Department
            </Typography>
            <Grid container spacing={2}>
              {stats.departmentStats.slice(0, 6).map((dept, index) => (
                <Grid item xs={12} sm={6} md={4} key={dept._id}>
                  <Box p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {dept._id || 'Unknown Department'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Users</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dept.count}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Active Users</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dept.active}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(dept.active / dept.count) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index % 2 === 0 ? '#1976d2' : '#2e7d32',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((dept.active / dept.count) * 100)}% active
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserStats;
