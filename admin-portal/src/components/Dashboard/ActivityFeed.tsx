import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  PersonAdd,
  Payment,
  Grade,
  School,
  MenuBook,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'grade' | 'user_created' | 'course_created';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: string;
  metadata?: any;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  onRefresh?: () => void;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  onRefresh,
  maxItems = 10,
}) => {
  const getActivityIcon = (type: string) => {
    const iconProps = { fontSize: 'small' as const };
    switch (type) {
      case 'enrollment':
        return <School {...iconProps} />;
      case 'payment':
        return <Payment {...iconProps} />;
      case 'grade':
        return <Grade {...iconProps} />;
      case 'user_created':
        return <PersonAdd {...iconProps} />;
      case 'course_created':
        return <MenuBook {...iconProps} />;
      default:
        return <PersonAdd {...iconProps} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return '#1976d2';
      case 'payment':
        return '#2e7d32';
      case 'grade':
        return '#ed6c02';
      case 'user_created':
        return '#9c27b0';
      case 'course_created':
        return '#00796b';
      default:
        return '#616161';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'Enrollment';
      case 'payment':
        return 'Payment';
      case 'grade':
        return 'Grade';
      case 'user_created':
        return 'User';
      case 'course_created':
        return 'Course';
      default:
        return 'Activity';
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Recent Activities"
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {onRefresh && (
              <IconButton onClick={onRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            )}
            <IconButton>
              <MoreVert />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ pt: 0, pb: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <Box
              sx={{
                width: 32,
                height: 32,
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
        ) : displayedActivities.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No recent activities
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: getActivityColor(activity.type),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="body1" fontWeight="600">
                          {activity.title}
                        </Typography>
                        <Chip
                          label={getActivityTypeLabel(activity.type)}
                          size="small"
                          sx={{
                            backgroundColor: `${getActivityColor(activity.type)}20`,
                            color: getActivityColor(activity.type),
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {activity.description}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            by {activity.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < displayedActivities.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
        
        {activities.length > maxItems && (
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              View all {activities.length} activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
