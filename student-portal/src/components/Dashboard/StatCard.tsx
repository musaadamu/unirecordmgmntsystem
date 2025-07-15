import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  maxValue?: number;
  loading?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#1976d2',
  trend,
  trendValue,
  progress,
  maxValue,
  loading = false,
  onClick,
  badge,
  badgeColor = 'primary',
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />;
      case 'neutral':
        return <TrendingFlat fontSize="small" sx={{ color: 'text.secondary' }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      case 'neutral':
        return 'text.secondary';
      default:
        return 'text.secondary';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={onClick}
    >
      {badge && (
        <Chip
          label={badge}
          color={badgeColor}
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            zIndex: 1,
          }}
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            
            {loading ? (
              <Box>
                <Box
                  sx={{
                    height: 32,
                    width: 80,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                {subtitle && (
                  <Box
                    sx={{
                      height: 16,
                      width: 60,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ lineHeight: 1.2, mb: 0.5 }}
                >
                  {formatValue(value)}
                </Typography>
                
                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
        
        {/* Progress Bar */}
        {progress !== undefined && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {maxValue ? `${progress}/${maxValue}` : `${progress}%`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={maxValue ? (progress / maxValue) * 100 : progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
        
        {/* Trend Indicator */}
        {trend && trendValue && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {getTrendIcon()}
            <Typography
              variant="caption"
              sx={{
                color: getTrendColor(),
                fontWeight: 500,
              }}
            >
              {trendValue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
