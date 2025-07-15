import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button,
  Skeleton,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  School,
  AdminPanelSettings,
  Warning,
  Info,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  AttachFile,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { Announcement } from '@/services/dashboardService';

interface AnnouncementsProps {
  announcements: Announcement[];
  loading?: boolean;
  onViewAll?: () => void;
  onMarkAsRead?: (announcementId: string) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({
  announcements,
  loading = false,
  onViewAll,
  onMarkAsRead,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return '#1976d2';
      case 'academic':
        return '#2e7d32';
      case 'administrative':
        return '#ed6c02';
      case 'emergency':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getAnnouncementTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <Info />;
      case 'academic':
        return <School />;
      case 'administrative':
        return <AdminPanelSettings />;
      case 'emergency':
        return <Warning />;
      default:
        return <AnnouncementIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatAnnouncementType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > parseISO(expiresAt);
  };

  const toggleExpanded = (announcementId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedItems(newExpanded);
  };

  const handleMarkAsRead = (announcementId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(announcementId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Announcements"
          action={
            <Skeleton variant="rectangular" width={80} height={32} />
          }
        />
        <CardContent>
          <List>
            {[1, 2, 3].map((item) => (
              <ListItem key={item} sx={{ px: 0 }}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  const activeAnnouncements = announcements.filter(announcement => !isExpired(announcement.expiresAt));

  return (
    <Card>
      <CardHeader
        title="Announcements"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          onViewAll && (
            <Button
              size="small"
              endIcon={<ChevronRight />}
              onClick={onViewAll}
            >
              View All
            </Button>
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        {activeAnnouncements.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No new announcements at this time.
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {activeAnnouncements.map((announcement, index) => {
              const isExpanded = expandedItems.has(announcement._id);
              const typeColor = getAnnouncementTypeColor(announcement.type);
              
              return (
                <React.Fragment key={announcement._id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      borderBottom: index < activeAnnouncements.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      bgcolor: announcement.priority === 'urgent' ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: `${typeColor}15`,
                          color: typeColor,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getAnnouncementTypeIcon(announcement.type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {announcement.title}
                          </Typography>
                          <Chip
                            label={formatAnnouncementType(announcement.type)}
                            size="small"
                            sx={{
                              bgcolor: `${typeColor}15`,
                              color: typeColor,
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={announcement.priority}
                            size="small"
                            color={getPriorityColor(announcement.priority) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: isExpanded ? 'none' : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1,
                            }}
                          >
                            {announcement.content}
                          </Typography>
                          
                          <Collapse in={isExpanded}>
                            <Box mt={1}>
                              {announcement.attachments && announcement.attachments.length > 0 && (
                                <Box mb={1}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                    Attachments:
                                  </Typography>
                                  {announcement.attachments.map((attachment, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                      <AttachFile fontSize="small" color="action" />
                                      <Typography variant="caption" color="primary">
                                        {attachment.name}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                              
                              <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="caption" color="text.secondary">
                                  By: {announcement.author.name} ({announcement.author.role})
                                </Typography>
                                {announcement.expiresAt && (
                                  <Typography variant="caption" color="text.secondary">
                                    Expires: {format(parseISO(announcement.expiresAt), 'MMM dd, yyyy')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                          
                          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(announcement.createdAt), 'MMM dd, h:mm a')}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleMarkAsRead(announcement._id)}
                                sx={{ fontSize: '0.75rem' }}
                              >
                                Mark as Read
                              </Button>
                              
                              <IconButton
                                size="small"
                                onClick={() => toggleExpanded(announcement._id)}
                              >
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default Announcements;
