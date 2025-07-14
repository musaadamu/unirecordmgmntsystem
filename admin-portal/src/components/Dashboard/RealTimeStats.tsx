import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Wifi,
  WifiOff,
  Circle,
} from '@mui/icons-material';

interface RealTimeData {
  activeUsers: number;
  onlineStudents: number;
  onlineStaff: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: string;
}

interface RealTimeStatsProps {
  refreshInterval?: number;
  showConnectionStatus?: boolean;
}

const RealTimeStats: React.FC<RealTimeStatsProps> = ({
  refreshInterval = 30000, // 30 seconds
  showConnectionStatus = true,
}) => {
  const [data, setData] = useState<RealTimeData>({
    activeUsers: 0,
    onlineStudents: 0,
    onlineStaff: 0,
    systemLoad: 0,
    responseTime: 0,
    errorRate: 0,
    lastUpdated: new Date().toISOString(),
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = (): RealTimeData => ({
      activeUsers: Math.floor(Math.random() * 500) + 200,
      onlineStudents: Math.floor(Math.random() * 400) + 150,
      onlineStaff: Math.floor(Math.random() * 50) + 20,
      systemLoad: Math.random() * 100,
      responseTime: Math.random() * 500 + 100,
      errorRate: Math.random() * 5,
      lastUpdated: new Date().toISOString(),
    });

    // Initial data
    setData(generateMockData());
    setIsConnected(true);

    // Set up interval for updates
    const interval = setInterval(() => {
      setData(generateMockData());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData({
        activeUsers: Math.floor(Math.random() * 500) + 200,
        onlineStudents: Math.floor(Math.random() * 400) + 150,
        onlineStaff: Math.floor(Math.random() * 50) + 20,
        systemLoad: Math.random() * 100,
        responseTime: Math.random() * 500 + 100,
        errorRate: Math.random() * 5,
        lastUpdated: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#2e7d32';
    if (value <= thresholds.warning) return '#ed6c02';
    return '#d32f2f';
  };

  const formatLastUpdated = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Real-Time System Status
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {showConnectionStatus && (
              <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
                <Chip
                  icon={isConnected ? <Wifi /> : <WifiOff />}
                  label={isConnected ? 'Live' : 'Offline'}
                  size="small"
                  color={isConnected ? 'success' : 'error'}
                  variant="outlined"
                />
              </Tooltip>
            )}
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleManualRefresh} disabled={isLoading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Active Users */}
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  backgroundColor: '#1976d2',
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Circle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {data.activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Box>
          </Grid>

          {/* Online Students */}
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  backgroundColor: '#2e7d32',
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Circle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                {data.onlineStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Online Students
              </Typography>
            </Box>
          </Grid>

          {/* Online Staff */}
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  backgroundColor: '#ed6c02',
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Circle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#ed6c02' }}>
                {data.onlineStaff}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Online Staff
              </Typography>
            </Box>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  backgroundColor: getStatusColor(data.systemLoad, { good: 50, warning: 80 }),
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Circle />
              </Avatar>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: getStatusColor(data.systemLoad, { good: 50, warning: 80 }) }}
              >
                {data.systemLoad.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Load
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Metrics */}
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Performance Metrics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data.responseTime.toFixed(0)}ms
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((data.responseTime / 1000) * 100, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(data.responseTime, { good: 200, warning: 500 }),
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Error Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {data.errorRate.toFixed(2)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data.errorRate * 20, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(data.errorRate, { good: 1, warning: 3 }),
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Last Updated */}
        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {formatLastUpdated(data.lastUpdated)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealTimeStats;
