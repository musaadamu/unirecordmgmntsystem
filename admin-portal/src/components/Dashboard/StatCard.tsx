import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  InfoOutlined,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
  info?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  color,
  subtitle,
  loading = false,
  onClick,
  info,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        border: '1px solid #e0e0e0',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        } : {},
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {icon}
          </Avatar>
          
          <Box display="flex" alignItems="center" gap={1}>
            {change && (
              <Chip
                label={change}
                size="small"
                color={getTrendColor() as any}
                icon={getTrendIcon() || undefined}
                sx={{
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    fontSize: '16px',
                  },
                }}
              />
            )}
            
            {info && (
              <Tooltip title={info} arrow>
                <IconButton size="small">
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Value */}
        <Box mb={1}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${color}, ${color}80)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}
          >
            {loading ? '...' : value}
          </Typography>
        </Box>

        {/* Title and Subtitle */}
        <Box>
          <Typography
            variant="h6"
            color="text.primary"
            fontWeight="600"
            sx={{ fontSize: '1rem' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Loading overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                border: '2px solid #f3f3f3',
                borderTop: `2px solid ${color}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
