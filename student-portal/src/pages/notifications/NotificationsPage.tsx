import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsService, Notification } from '@/services/notificationsService';
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
  MarkEmailRead,
  Delete,
} from '@mui/icons-material';

const NotificationsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<Notification[]>(['notifications'], notificationsService.getNotifications);
  const notifications = data ?? [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format date as relative time
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    if (isLoading) {
      return (
        <Box textAlign="center" py={8}>
          <Typography variant="h6">Loading notifications...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="error">Failed to load notifications.</Typography>
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <Box>
          <Box mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with important announcements and updates
            </Typography>
          </Box>
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
        </Box>
      );
    }

    return (
      <Box>
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with important announcements and updates
          </Typography>
        </Box>
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
                      <Avatar sx={{ bgcolor: getPriorityColor(notification.priority), width: 40, height: 40 }}>
                        <Notifications />
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
      </Box>
    );
};

}
export default NotificationsPage;
