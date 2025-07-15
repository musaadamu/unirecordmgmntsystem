import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Schedule,
  Assignment,
  Grade,
  MoreVert,
  Visibility,
  GetApp,
  ExitToApp,
} from '@mui/icons-material';

import { EnrolledCourse } from '@/services/courseService';

interface CourseCardProps {
  course: EnrolledCourse;
  onViewDetails?: (courseId: string) => void;
  onDropCourse?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onDropCourse,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course._id);
    } else {
      navigate(`/courses/${course._id}`);
    }
    handleMenuClose();
  };

  const handleDropCourse = () => {
    if (onDropCourse) {
      onDropCourse(course._id);
    }
    handleMenuClose();
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text.secondary';
    const letter = grade.charAt(0);
    switch (letter) {
      case 'A':
        return 'success.main';
      case 'B':
        return 'info.main';
      case 'C':
        return 'warning.main';
      case 'D':
        return 'error.main';
      case 'F':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'success';
      case 'dropped':
        return 'error';
      case 'completed':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNextClass = () => {
    const today = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const checkDay = (today + i) % 7;
      const dayName = dayNames[checkDay];
      const classToday = course.schedule.find(s => s.day === dayName);
      
      if (classToday) {
        const prefix = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName;
        return `${prefix} ${classToday.startTime} - ${classToday.endTime}`;
      }
    }
    
    return 'No upcoming classes';
  };

  const getDepartmentColor = (department: string) => {
    const colors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
      '#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#c62828'
    ];
    const index = department.length % colors.length;
    return colors[index];
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={handleViewDetails}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar
                sx={{
                  bgcolor: getDepartmentColor(course.department),
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                }}
              >
                {course.courseCode.substring(0, 2)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {course.courseCode}
              </Typography>
              <Chip
                label={course.enrollment.status}
                size="small"
                color={getStatusColor(course.enrollment.status) as any}
                variant="outlined"
              />
            </Box>
            
            <Typography
              variant="body1"
              fontWeight="500"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
              }}
            >
              {course.courseName}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Course Info */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <Person fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {course.instructor.name}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {getNextClass()}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={`${course.credits} Credits`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={course.department}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Progress Section */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="500">
              Course Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.enrollment.progress?.percentage || 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={course.enrollment.progress?.percentage || 0}
            sx={{
              height: 6,
              borderRadius: 3,
              mb: 1,
            }}
          />
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="500">
              Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.enrollment.attendance.percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={course.enrollment.attendance.percentage}
            color={course.enrollment.attendance.percentage >= 75 ? 'success' : 'warning'}
            sx={{
              height: 6,
              borderRadius: 3,
            }}
          />
        </Box>

        {/* Grade Section */}
        {course.enrollment.grade && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight="500">
                Current Grade
              </Typography>
              <Box textAlign="right">
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: getGradeColor(course.enrollment.grade.letterGrade) }}
                >
                  {course.enrollment.grade.letterGrade}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {course.enrollment.grade.percentage}% ({course.enrollment.grade.gradePoints} GP)
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          View Details
        </Button>
        
        <Button
          size="small"
          startIcon={<Assignment />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course._id}/assignments`);
          }}
        >
          Assignments
        </Button>
      </CardActions>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1 }} />
          View Course Details
        </MenuItem>
        <MenuItem onClick={() => navigate(`/courses/${course._id}/materials`)}>
          <GetApp sx={{ mr: 1 }} />
          Course Materials
        </MenuItem>
        <MenuItem onClick={() => navigate(`/courses/${course._id}/grades`)}>
          <Grade sx={{ mr: 1 }} />
          View Grades
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDropCourse} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 1 }} />
          Drop Course
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CourseCard;
