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

  const [data, setData] = useState<RealTimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Import dashboardService dynamically to avoid circular deps
      const dashboardService = await import('../../services/dashboardService');
      const health = await dashboardService.default.getSystemHealth();
      setData({
        activeUsers: health.activeConnections ?? 0,
        onlineStudents: health.activeConnections ?? 0,
        onlineStaff: 0,
        systemLoad: health.cpuUsage ?? 0,
        responseTime: health.responseTime ?? 0,
        errorRate: health.status === 'healthy' ? 0 : health.status === 'warning' ? 2 : 5,
        lastUpdated: new Date().toISOString(),
      });
      setIsConnected(health.databaseStatus === 'connected');
    } catch (err: any) {
      setError('Failed to fetch system health');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleManualRefresh = () => {
    fetchSystemHealth();
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
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Box mb={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {!isLoading && !error && data && (
          <Grid container spacing={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    backgroundColor: '#d32f2f',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                  {data.systemLoad.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Load
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeStats;
