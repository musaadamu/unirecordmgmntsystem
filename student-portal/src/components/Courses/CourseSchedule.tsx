import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  ButtonGroup,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Today,
  ViewWeek,
  ViewDay,
  NavigateBefore,
  NavigateNext,
  LocationOn,
  Person,
  Schedule,
} from '@mui/icons-material';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';

import { EnrolledCourse } from '@/services/courseService';

interface CourseScheduleProps {
  courses: EnrolledCourse[];
}

interface ScheduleEvent {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
  color: string;
}

const CourseSchedule: React.FC<CourseScheduleProps> = ({ courses }) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDepartmentColor = (department: string) => {
    const colors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
      '#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#c62828'
    ];
    const index = department.length % colors.length;
    return colors[index];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return '#1976d2';
      case 'lab':
        return '#2e7d32';
      case 'tutorial':
        return '#ed6c02';
      case 'seminar':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const generateScheduleEvents = (): ScheduleEvent[] => {
    const events: ScheduleEvent[] = [];
    
    courses.forEach(course => {
      course.schedule.forEach(scheduleItem => {
        events.push({
          id: `${course._id}-${scheduleItem.day}-${scheduleItem.startTime}`,
          courseCode: course.courseCode,
          courseName: course.courseName,
          instructor: course.instructor.name,
          type: scheduleItem.type,
          startTime: scheduleItem.startTime,
          endTime: scheduleItem.endTime,
          location: `${scheduleItem.location.building} ${scheduleItem.location.room}`,
          day: scheduleItem.day,
          color: getDepartmentColor(course.department),
        });
      });
    });
    
    return events;
  };

  const scheduleEvents = generateScheduleEvents();

  const getEventsForDay = (day: string) => {
    return scheduleEvents.filter(event => event.day === day);
  };

  const getEventPosition = (startTime: string, endTime: string) => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1) {
      return { top: 0, height: 60 };
    }
    
    const slotHeight = 60; // Height of each 30-minute slot
    const top = startIndex * slotHeight;
    const height = (endIndex - startIndex) * slotHeight;
    
    return { top, height };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    return weekDays.map((_, index) => addDays(start, index));
  };

  const weekDates = getWeekDates();

  if (viewMode === 'week') {
    return (
      <Box>
        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" fontWeight="bold">
                  Week of {format(weekDates[0], 'MMM dd, yyyy')}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton onClick={() => navigateWeek('prev')}>
                    <NavigateBefore />
                  </IconButton>
                  <Button variant="outlined" size="small" onClick={goToToday}>
                    Today
                  </Button>
                  <IconButton onClick={() => navigateWeek('next')}>
                    <NavigateNext />
                  </IconButton>
                </Box>
              </Box>
              
              <ButtonGroup variant="outlined" size="small">
                <Button
                  variant={viewMode === 'week' ? 'contained' : 'outlined'}
                  startIcon={<ViewWeek />}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'contained' : 'outlined'}
                  startIcon={<ViewDay />}
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
              </ButtonGroup>
            </Box>
          </CardContent>
        </Card>

        {/* Weekly Schedule Grid */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 800 }}>
                {/* Header */}
                <Box display="flex" borderBottom="1px solid" borderColor="divider">
                  <Box sx={{ width: 80, p: 2, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight="bold">
                      Time
                    </Typography>
                  </Box>
                  {weekDays.map((day, index) => (
                    <Box
                      key={day}
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRight: index < weekDays.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        textAlign: 'center',
                        bgcolor: isSameDay(weekDates[index], new Date()) ? 'primary.light' : 'transparent',
                        color: isSameDay(weekDates[index], new Date()) ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      <Typography variant="caption">
                        {format(weekDates[index], 'MMM dd')}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Time Grid */}
                <Box position="relative">
                  {timeSlots.map((time, index) => (
                    <Box
                      key={time}
                      display="flex"
                      sx={{
                        height: 60,
                        borderBottom: index < timeSlots.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          p: 1,
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(time)}
                        </Typography>
                      </Box>
                      {weekDays.map((day, dayIndex) => (
                        <Box
                          key={`${day}-${time}`}
                          sx={{
                            flex: 1,
                            borderRight: dayIndex < weekDays.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            position: 'relative',
                          }}
                        />
                      ))}
                    </Box>
                  ))}

                  {/* Events */}
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day);
                    return dayEvents.map(event => {
                      const position = getEventPosition(event.startTime, event.endTime);
                      const leftOffset = 80 + (dayIndex * (100 / weekDays.length)) + '%';
                      const width = `calc(${100 / weekDays.length}% - 1px)`;
                      
                      return (
                        <Tooltip
                          key={event.id}
                          title={
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {event.courseCode} - {event.type}
                              </Typography>
                              <Typography variant="body2">
                                {event.courseName}
                              </Typography>
                              <Typography variant="caption">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                {event.location}
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                {event.instructor}
                              </Typography>
                            </Box>
                          }
                        >
                          <Paper
                            sx={{
                              position: 'absolute',
                              top: position.top,
                              left: leftOffset,
                              width: width,
                              height: position.height,
                              bgcolor: event.color,
                              color: 'white',
                              p: 1,
                              cursor: 'pointer',
                              overflow: 'hidden',
                              '&:hover': {
                                opacity: 0.9,
                              },
                            }}
                          >
                            <Typography variant="caption" fontWeight="bold" display="block">
                              {event.courseCode}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                              {event.type}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                              {event.location}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      );
                    });
                  })}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Course Legend */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Enrolled Courses
            </Typography>
            <Grid container spacing={2}>
              {courses.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        bgcolor: getDepartmentColor(course.department),
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    >
                      {course.courseCode.substring(0, 2)}
                    </Avatar>
                    <Typography variant="body2">
                      {course.courseCode} - {course.courseName}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Day view would be implemented here
  return (
    <Box>
      <Typography variant="h6">Day view coming soon...</Typography>
    </Box>
  );
};

export default CourseSchedule;
