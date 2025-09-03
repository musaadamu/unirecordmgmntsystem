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
} from '@mui/material';
import {
  Schedule,
  LocationOn,
  Person,
  CalendarToday,
  ChevronRight,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

import { UpcomingClass } from '@/services/dashboardService';

interface UpcomingClassesProps {
  classes: UpcomingClass[];
  loading?: boolean;
  onViewAll?: () => void;
}

const UpcomingClasses: React.FC<UpcomingClassesProps> = ({
  classes,
  loading = false,
  onViewAll,
}) => {
  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return '#1976d2';
      case 'lab':
        return '#2e7d32';
      case 'tutorial':
        return '#ed6c02';
      case 'seminar':
        return '#9c27b0';
      case 'exam':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return '📚';
      case 'lab':
        return '🔬';
      case 'tutorial':
        return '👥';
      case 'seminar':
        return '🎯';
      case 'exam':
        return '📝';
      default:
        return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatClassTime = (startTime: string, endTime: string) => {
    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatClassDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getTimeUntilClass = (startTime: string) => {
    const now = new Date();
    const classTime = parseISO(startTime);
    const diffInMinutes = Math.floor((classTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return 'Started';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Upcoming Classes"
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

  return (
    <Card>
      <CardHeader
        title="Upcoming Classes"
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
        {classes.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No upcoming classes scheduled for today.
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {classes.map((classItem, index) => (
              <ListItem
                key={classItem._id}
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: index < classes.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemIcon sx={{ mt: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${getClassTypeColor(classItem.type)}15`,
                      color: getClassTypeColor(classItem.type),
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getClassTypeIcon(classItem.type)}
                  </Avatar>
                </ListItemIcon>
                
                <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                  {/* Primary content */}
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {classItem.course.courseCode}
                    </Typography>
                    <Chip
                      label={classItem.type}
                      size="small"
                      sx={{
                        bgcolor: `${getClassTypeColor(classItem.type)}15`,
                        color: getClassTypeColor(classItem.type),
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      label={classItem.status}
                      size="small"
                      color={getStatusColor(classItem.status) as any}
                      variant="outlined"
                    />
                  </Box>

                  {/* Course name */}
                  <Typography variant="body2" color="text.primary" gutterBottom>
                    {classItem.course.courseName}
                  </Typography>
                  
                  {/* Time and date info */}
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="caption">
                        {formatClassTime(classItem.startTime, classItem.endTime)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="caption">
                        {formatClassDate(classItem.date)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Location and instructor info */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="caption">
                        {classItem.location.building} {classItem.location.room}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption">
                        {classItem.course.instructor.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box textAlign="right">
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'action.hover',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                    }}
                  >
                    {getTimeUntilClass(classItem.startTime)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingClasses;