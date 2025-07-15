import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Schedule,
  VideoCall,
  Event,
  Add,
  Edit,
  Cancel,
  CheckCircle,
  AccessTime,
  Message,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format, parseISO } from 'date-fns';

import { AdvisorMeeting } from '@/services/supportService';

const AdvisorCommunication: React.FC = () => {
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [meetingDetailsOpen, setMeetingDetailsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<AdvisorMeeting | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledAt: new Date(),
    duration: 30,
    meetingType: 'virtual' as 'in_person' | 'virtual' | 'phone',
    agenda: [] as string[],
  });
  const [newAgendaItem, setNewAgendaItem] = useState('');

  // Mock advisor data
  const mockAdvisor = {
    _id: 'advisor1',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@university.edu',
    department: 'Computer Science',
    title: 'Associate Professor & Academic Advisor',
    avatar: '/avatars/michael.jpg',
    officeLocation: 'Engineering Building, Room 301',
    officeHours: 'Monday-Friday: 2:00 PM - 4:00 PM',
    bio: 'Dr. Brown has been with the university for over 10 years, specializing in computer science education and student mentorship. He has guided hundreds of students through their academic journey.',
  };

  // Mock meetings data
  const mockMeetings: AdvisorMeeting[] = [
    {
      _id: '1',
      student: 'student1',
      advisor: mockAdvisor,
      title: 'Course Selection for Spring 2024',
      description: 'Discuss course options for the upcoming semester and plan academic path.',
      scheduledAt: '2024-01-20T14:00:00Z',
      duration: 30,
      meetingType: 'virtual',
      meetingLink: 'https://zoom.us/j/123456789',
      status: 'scheduled',
      agenda: [
        'Review current academic progress',
        'Discuss spring semester course options',
        'Plan graduation timeline',
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: '2',
      student: 'student1',
      advisor: mockAdvisor,
      title: 'Mid-Semester Check-in',
      description: 'Review academic progress and address any concerns.',
      scheduledAt: '2024-01-10T15:30:00Z',
      duration: 45,
      meetingType: 'in_person',
      location: 'Engineering Building, Room 301',
      status: 'completed',
      agenda: [
        'Review current grades',
        'Discuss study strategies',
        'Address academic challenges',
      ],
      notes: 'Student is performing well overall. Recommended additional study groups for calculus. Discussed internship opportunities for summer.',
      followUpActions: [
        {
          action: 'Join calculus study group',
          dueDate: '2024-01-15T00:00:00Z',
          completed: true,
        },
        {
          action: 'Research summer internship opportunities',
          dueDate: '2024-01-25T00:00:00Z',
          completed: false,
        },
      ],
      createdAt: '2024-01-08T10:00:00Z',
      updatedAt: '2024-01-10T16:15:00Z',
    },
    {
      _id: '3',
      student: 'student1',
      advisor: mockAdvisor,
      title: 'Academic Planning Session',
      description: 'Long-term academic planning and career guidance.',
      scheduledAt: '2024-01-25T13:00:00Z',
      duration: 60,
      meetingType: 'virtual',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
      status: 'confirmed',
      agenda: [
        'Review degree requirements',
        'Discuss career goals',
        'Plan elective courses',
        'Graduate school preparation',
      ],
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Schedule sx={{ color: 'info.main' }} />;
      case 'confirmed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'completed':
        return <CheckCircle sx={{ color: 'text.secondary' }} />;
      case 'cancelled':
        return <Cancel sx={{ color: 'error.main' }} />;
      case 'rescheduled':
        return <AccessTime sx={{ color: 'warning.main' }} />;
      default:
        return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <VideoCall />;
      case 'phone':
        return <Phone />;
      case 'in_person':
        return <LocationOn />;
      default:
        return <Event />;
    }
  };

  const handleScheduleMeeting = () => {
    console.log('Scheduling meeting...', newMeeting);
    setScheduleMeetingOpen(false);
    setNewMeeting({
      title: '',
      description: '',
      scheduledAt: new Date(),
      duration: 30,
      meetingType: 'virtual',
      agenda: [],
    });
  };

  const handleViewMeeting = (meeting: AdvisorMeeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailsOpen(true);
  };

  const handleCancelMeeting = (meetingId: string) => {
    console.log('Cancelling meeting...', meetingId);
  };

  const handleAddAgendaItem = () => {
    if (newAgendaItem.trim()) {
      setNewMeeting(prev => ({
        ...prev,
        agenda: [...prev.agenda, newAgendaItem.trim()],
      }));
      setNewAgendaItem('');
    }
  };

  const handleRemoveAgendaItem = (index: number) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
    }));
  };

  const upcomingMeetings = mockMeetings.filter(m => 
    m.status === 'scheduled' || m.status === 'confirmed'
  );
  const pastMeetings = mockMeetings.filter(m => 
    m.status === 'completed' || m.status === 'cancelled'
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Academic Advisor Communication
      </Typography>

      <Grid container spacing={3}>
        {/* Advisor Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  src={mockAdvisor.avatar}
                  sx={{ width: 80, height: 80, mb: 2 }}
                >
                  <Person />
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {mockAdvisor.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {mockAdvisor.title}
                </Typography>
                
                <Chip
                  label={mockAdvisor.department}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <Divider sx={{ width: '100%', my: 2 }} />
                
                <Box width="100%" textAlign="left">
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{mockAdvisor.email}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{mockAdvisor.officeLocation}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{mockAdvisor.officeHours}</Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={1} width="100%">
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Event />}
                    onClick={() => setScheduleMeetingOpen(true)}
                  >
                    Schedule Meeting
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Message />}
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Meetings */}
        <Grid item xs={12} md={8}>
          {/* Upcoming Meetings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Meetings
                </Typography>
                <Badge badgeContent={upcomingMeetings.length} color="primary">
                  <Event />
                </Badge>
              </Box>
              
              {upcomingMeetings.length === 0 ? (
                <Alert severity="info">
                  No upcoming meetings scheduled. Click "Schedule Meeting" to book an appointment.
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {upcomingMeetings.map((meeting, index) => (
                    <React.Fragment key={meeting._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getStatusIcon(meeting.status)}
                            {getMeetingTypeIcon(meeting.meetingType)}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {meeting.title}
                              </Typography>
                              <Chip
                                label={meeting.status}
                                size="small"
                                color={getStatusColor(meeting.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {format(parseISO(meeting.scheduledAt), 'MMMM dd, yyyy h:mm a')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Duration: {meeting.duration} minutes • {meeting.meetingType}
                              </Typography>
                              {meeting.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {meeting.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            onClick={() => handleViewMeeting(meeting)}
                          >
                            View Details
                          </Button>
                          {meeting.status === 'scheduled' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelMeeting(meeting._id)}
                            >
                              <Cancel />
                            </IconButton>
                          )}
                        </Box>
                      </ListItem>
                      {index < upcomingMeetings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Past Meetings */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Meeting History
              </Typography>
              
              <List sx={{ p: 0 }}>
                {pastMeetings.map((meeting, index) => (
                  <React.Fragment key={meeting._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {getStatusIcon(meeting.status)}
                          {getMeetingTypeIcon(meeting.meetingType)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {meeting.title}
                            </Typography>
                            <Chip
                              label={meeting.status}
                              size="small"
                              color={getStatusColor(meeting.status) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {format(parseISO(meeting.scheduledAt), 'MMMM dd, yyyy h:mm a')}
                            </Typography>
                            {meeting.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Notes: {meeting.notes.substring(0, 100)}...
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Button
                        size="small"
                        onClick={() => handleViewMeeting(meeting)}
                      >
                        View Details
                      </Button>
                    </ListItem>
                    {index < pastMeetings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedule Meeting Dialog */}
      <Dialog
        open={scheduleMeetingOpen}
        onClose={() => setScheduleMeetingOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule Meeting with {mockAdvisor.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Course Selection Discussion"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what you'd like to discuss..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Meeting Date & Time"
                value={newMeeting.scheduledAt}
                onChange={(date) => setNewMeeting(prev => ({ ...prev, scheduledAt: date || new Date() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={newMeeting.duration}
                  label="Duration"
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: Number(e.target.value) }))}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Meeting Type</InputLabel>
                <Select
                  value={newMeeting.meetingType}
                  label="Meeting Type"
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingType: e.target.value as any }))}
                >
                  <MenuItem value="virtual">Virtual Meeting</MenuItem>
                  <MenuItem value="in_person">In-Person</MenuItem>
                  <MenuItem value="phone">Phone Call</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Agenda Items (Optional)
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add agenda item..."
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAgendaItem()}
                />
                <Button onClick={handleAddAgendaItem} disabled={!newAgendaItem.trim()}>
                  Add
                </Button>
              </Box>
              {newMeeting.agenda.length > 0 && (
                <List dense>
                  {newMeeting.agenda.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText primary={`${index + 1}. ${item}`} />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAgendaItem(index)}
                      >
                        <Cancel />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleMeetingOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleScheduleMeeting}
            variant="contained"
            disabled={!newMeeting.title}
          >
            Schedule Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog
        open={meetingDetailsOpen}
        onClose={() => setMeetingDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Meeting Details
        </DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedMeeting.title}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedMeeting.scheduledAt), 'MMMM dd, yyyy h:mm a')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{selectedMeeting.duration} minutes</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Meeting Type</Typography>
                  <Typography variant="body1">{selectedMeeting.meetingType}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedMeeting.status}
                    color={getStatusColor(selectedMeeting.status) as any}
                    size="small"
                  />
                </Grid>
                
                {selectedMeeting.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{selectedMeeting.description}</Typography>
                  </Grid>
                )}
                
                {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Agenda
                    </Typography>
                    <List dense>
                      {selectedMeeting.agenda.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText primary={`${index + 1}. ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {selectedMeeting.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Meeting Notes</Typography>
                    <Typography variant="body1">{selectedMeeting.notes}</Typography>
                  </Grid>
                )}
                
                {selectedMeeting.followUpActions && selectedMeeting.followUpActions.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Follow-up Actions
                    </Typography>
                    <List dense>
                      {selectedMeeting.followUpActions.map((action, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircle color={action.completed ? 'success' : 'disabled'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={action.action}
                            secondary={action.dueDate ? `Due: ${format(parseISO(action.dueDate), 'MMM dd, yyyy')}` : undefined}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetingDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvisorCommunication;
