import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Grade,
  Payment,
  School,
  Info,
  MarkEmailRead,
  Delete,
} from '@mui/icons-material';

const NotificationsPage: React.FC = () => {
  // Mock notifications data
  const notifications = [
    {
      id: '1',
      title: 'New Grade Posted',
      message: 'Your grade for CS101 - Introduction to Computer Science has been posted.',
      type: 'academic' as const,
      priority: 'medium' as const,
      read: false,
      createdAt: '2024-01-15T10:30:00Z',
      icon: <Grade />,
      color: '#2e7d32',
    },
    {
      id: '2',
      title: 'Payment Reminder',
      message: 'Your tuition fee payment is due in 3 days. Please make payment to avoid late fees.',
      type: 'payment' as const,
      priority: 'high' as const,
      read: false,
      createdAt: '2024-01-15T09:15:00Z',
      icon: <Payment />,
      color: '#d32f2f',
    },
    {
      id: '3',
      title: 'Course Enrollment Open',
      message: 'Registration for next semester courses opens tomorrow at 8:00 AM.',
      type: 'academic' as const,
      priority: 'medium' as const,
      read: true,
      createdAt: '2024-01-14T16:45:00Z',
      icon: <School />,
      color: '#1976d2',
    },
    {
      id: '4',
      title: 'System Maintenance',
      message: 'The student portal will be under maintenance on Saturday from 2:00 AM to 6:00 AM.',
      type: 'system' as const,
      priority: 'low' as const,
      read: true,
      createdAt: '2024-01-13T14:20:00Z',
      icon: <Info />,
      color: '#ed6c02',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with important announcements and updates
        </Typography>
      </Box>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: notification.color,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {notification.icon}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                          variant="outlined"
                        />
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box display="flex" flexDirection="column" gap={1}>
                    <IconButton size="small" color="primary">
                      <MarkEmailRead fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Empty State (when no notifications) */}
      {notifications.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see important updates and announcements here
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NotificationsPage;
