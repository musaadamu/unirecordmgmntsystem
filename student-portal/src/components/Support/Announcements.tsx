import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search,
  FilterList,
  Announcement as AnnouncementIcon,
  School,
  Event,
  Warning,
  Info,
  PushPin,
  ExpandMore,
  ExpandLess,
  MarkEmailRead,
  Comment,
  Attachment,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { Announcement } from '@/services/supportService';

const Announcements: React.FC = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Mock announcements data
  const mockAnnouncements: Announcement[] = [
    {
      _id: '1',
      title: 'Final Examination Schedule Released',
      content: 'The final examination schedule for the Fall 2024 semester has been published. Students are advised to check their examination dates and venues on the student portal. Please note that examination halls will be assigned based on student ID numbers. Make sure to bring your student ID card and required stationery to the examination venue.',
      summary: 'Final exam schedule for Fall 2024 is now available on the student portal.',
      category: 'academic',
      priority: 'high',
      targetAudience: ['all_students'],
      author: {
        _id: 'admin1',
        name: 'Academic Office',
        role: 'administrator',
        department: 'Academic Affairs',
      },
      publishedAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-02-15T23:59:59Z',
      isRead: false,
      isPinned: true,
      allowComments: true,
      comments: [
        {
          _id: 'comment1',
          author: {
            name: 'John Doe',
            role: 'student',
          },
          content: 'Thank you for the update. When will the examination venues be announced?',
          timestamp: '2024-01-15T10:30:00Z',
        },
      ],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    },
    {
      _id: '2',
      title: 'Library Extended Hours During Exam Period',
      content: 'The university library will extend its operating hours during the examination period from January 20th to February 10th. The library will be open 24/7 to provide students with adequate study space and resources. Additional security and support staff will be available during night hours.',
      summary: 'Library will operate 24/7 during exam period (Jan 20 - Feb 10).',
      category: 'general',
      priority: 'medium',
      targetAudience: ['all_students'],
      author: {
        _id: 'lib1',
        name: 'Library Services',
        role: 'staff',
        department: 'Library',
      },
      publishedAt: '2024-01-14T14:00:00Z',
      isRead: true,
      readAt: '2024-01-14T15:30:00Z',
      isPinned: false,
      allowComments: true,
      createdAt: '2024-01-14T14:00:00Z',
      updatedAt: '2024-01-14T14:00:00Z',
    },
    {
      _id: '3',
      title: 'Campus Network Maintenance',
      content: 'Scheduled network maintenance will be conducted on Saturday, January 20th from 2:00 AM to 6:00 AM. During this period, internet services across campus may be intermittent or unavailable. We apologize for any inconvenience and recommend planning accordingly.',
      summary: 'Network maintenance on Jan 20, 2:00 AM - 6:00 AM. Internet may be unavailable.',
      category: 'administrative',
      priority: 'medium',
      targetAudience: ['all_students'],
      author: {
        _id: 'it1',
        name: 'IT Services',
        role: 'staff',
        department: 'Information Technology',
      },
      publishedAt: '2024-01-13T16:00:00Z',
      isRead: false,
      isPinned: false,
      allowComments: false,
      createdAt: '2024-01-13T16:00:00Z',
      updatedAt: '2024-01-13T16:00:00Z',
    },
    {
      _id: '4',
      title: 'Student Health Center COVID-19 Guidelines',
      content: 'Updated COVID-19 health and safety guidelines are now in effect. All students are required to follow the new protocols when visiting campus facilities. Face masks are recommended in crowded areas, and hand sanitizing stations are available throughout the campus.',
      summary: 'Updated COVID-19 guidelines now in effect. Masks recommended in crowded areas.',
      category: 'emergency',
      priority: 'high',
      targetAudience: ['all_students'],
      author: {
        _id: 'health1',
        name: 'Student Health Center',
        role: 'staff',
        department: 'Health Services',
      },
      publishedAt: '2024-01-12T11:00:00Z',
      isRead: true,
      readAt: '2024-01-12T12:15:00Z',
      isPinned: true,
      allowComments: true,
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-12T11:00:00Z',
    },
    {
      _id: '5',
      title: 'Career Fair 2024 Registration Open',
      content: 'Registration is now open for the Annual Career Fair 2024, scheduled for February 15-16. Over 50 companies will be participating, offering internship and full-time opportunities. Students are encouraged to register early and prepare their resumes. Career counseling sessions are available to help students prepare.',
      summary: 'Career Fair 2024 registration open. Event on Feb 15-16 with 50+ companies.',
      category: 'event',
      priority: 'medium',
      targetAudience: ['all_students'],
      author: {
        _id: 'career1',
        name: 'Career Services',
        role: 'staff',
        department: 'Student Affairs',
      },
      publishedAt: '2024-01-11T10:00:00Z',
      isRead: false,
      isPinned: false,
      allowComments: true,
      attachments: [
        {
          filename: 'career-fair-2024-brochure.pdf',
          url: '/attachments/career-fair-brochure.pdf',
          type: 'pdf',
        },
      ],
      createdAt: '2024-01-11T10:00:00Z',
      updatedAt: '2024-01-11T10:00:00Z',
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <School />;
      case 'event':
        return <Event />;
      case 'emergency':
        return <Warning />;
      case 'administrative':
      case 'general':
        return <Info />;
      default:
        return <AnnouncementIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'primary';
      case 'event':
        return 'success';
      case 'emergency':
        return 'error';
      case 'administrative':
        return 'info';
      case 'general':
        return 'default';
      default:
        return 'default';
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
        return 'success';
      default:
        return 'default';
    }
  };

  const getFilteredAnnouncements = () => {
    return mockAnnouncements.filter(announcement => {
      // Category filter
      if (filterCategory !== 'all' && announcement.category !== filterCategory) return false;
      
      // Priority filter
      if (filterPriority !== 'all' && announcement.priority !== filterPriority) return false;
      
      // Unread filter
      if (showUnreadOnly && announcement.isRead) return false;
      
      // Search filter
      if (searchQuery && !announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !announcement.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailsDialogOpen(true);
  };

  const handleMarkAsRead = (announcementId: string) => {
    console.log('Marking announcement as read:', announcementId);
  };

  const handleToggleExpand = (announcementId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const unreadCount = mockAnnouncements.filter(a => !a.isRead).length;
  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread announcement{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Button
          variant={showUnreadOnly ? 'contained' : 'outlined'}
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          startIcon={<Badge badgeContent={unreadCount} color="error"><MarkEmailRead /></Badge>}
        >
          {showUnreadOnly ? 'Show All' : 'Unread Only'}
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📌 Pinned Announcements
          </Typography>
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement._id} sx={{ mb: 2, border: '2px solid', borderColor: 'warning.light' }}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="flex-start" gap={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: getCategoryColor(announcement.category) + '.main' }}>
                        {getCategoryIcon(announcement.category)}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {announcement.title}
                      </Typography>
                      {!announcement.isRead && (
                        <Chip label="New" color="error" size="small" />
                      )}
                      <PushPin sx={{ color: 'warning.main', fontSize: 16 }} />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {announcement.summary || announcement.content.substring(0, 150) + '...'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Chip
                        label={announcement.category}
                        size="small"
                        color={getCategoryColor(announcement.category) as any}
                        variant="outlined"
                      />
                      <Chip
                        label={announcement.priority}
                        size="small"
                        color={getPriorityColor(announcement.priority) as any}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {announcement.author.name} • {format(parseISO(announcement.publishedAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(announcement)}
                    >
                      View Details
                    </Button>
                    {!announcement.isRead && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMarkAsRead(announcement._id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Regular Announcements */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        All Announcements
      </Typography>
      
      <List sx={{ p: 0 }}>
        {regularAnnouncements.map((announcement, index) => {
          const isExpanded = expandedItems.has(announcement._id);
          
          return (
            <React.Fragment key={announcement._id}>
              <Card sx={{ mb: 2 }}>
                <ListItem
                  sx={{
                    bgcolor: announcement.isRead ? 'transparent' : 'action.hover',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2} width="100%">
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getCategoryColor(announcement.category) + '.main' }}>
                        {getCategoryIcon(announcement.category)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {announcement.title}
                          </Typography>
                          {!announcement.isRead && (
                            <Chip label="New" color="error" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {announcement.summary || announcement.content.substring(0, 150) + '...'}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Chip
                              label={announcement.category}
                              size="small"
                              color={getCategoryColor(announcement.category) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={announcement.priority}
                              size="small"
                              color={getPriorityColor(announcement.priority) as any}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {announcement.author.name} • {format(parseISO(announcement.publishedAt), 'MMM dd, yyyy')}
                            </Typography>
                            {announcement.attachments && announcement.attachments.length > 0 && (
                              <Chip
                                icon={<Attachment />}
                                label={`${announcement.attachments.length} attachment${announcement.attachments.length > 1 ? 's' : ''}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {announcement.allowComments && announcement.comments && announcement.comments.length > 0 && (
                              <Chip
                                icon={<Comment />}
                                label={`${announcement.comments.length} comment${announcement.comments.length > 1 ? 's' : ''}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(announcement)}
                      >
                        View Details
                      </Button>
                      {!announcement.isRead && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkAsRead(announcement._id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(announcement._id)}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Collapse in={isExpanded}>
                    <Box mt={2} pl={7}>
                      <Typography variant="body2" paragraph>
                        {announcement.content}
                      </Typography>
                      
                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Attachments:
                          </Typography>
                          {announcement.attachments.map((attachment, idx) => (
                            <Button
                              key={idx}
                              size="small"
                              startIcon={<Attachment />}
                              sx={{ mr: 1, mb: 1 }}
                            >
                              {attachment.filename}
                            </Button>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </ListItem>
              </Card>
              {index < regularAnnouncements.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAnnouncement?.title}
        </DialogTitle>
        <DialogContent>
          {selectedAnnouncement && (
            <Box>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={selectedAnnouncement.category}
                  color={getCategoryColor(selectedAnnouncement.category) as any}
                  size="small"
                />
                <Chip
                  label={selectedAnnouncement.priority}
                  color={getPriorityColor(selectedAnnouncement.priority) as any}
                  size="small"
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {selectedAnnouncement.content}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Published by {selectedAnnouncement.author.name} on{' '}
                {format(parseISO(selectedAnnouncement.publishedAt), 'MMMM dd, yyyy h:mm a')}
              </Typography>
              
              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Attachments:
                  </Typography>
                  {selectedAnnouncement.attachments.map((attachment, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      startIcon={<Attachment />}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {attachment.filename}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          {selectedAnnouncement && !selectedAnnouncement.isRead && (
            <Button
              onClick={() => {
                handleMarkAsRead(selectedAnnouncement._id);
                setDetailsDialogOpen(false);
              }}
              variant="contained"
            >
              Mark as Read
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;
