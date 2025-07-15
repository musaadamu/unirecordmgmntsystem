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
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  ChevronRight,
  OpenInNew,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';

import { Assignment as AssignmentType } from '@/services/dashboardService';

interface PendingAssignmentsProps {
  assignments: AssignmentType[];
  loading?: boolean;
  onViewAll?: () => void;
  onOpenAssignment?: (assignmentId: string) => void;
}

const PendingAssignments: React.FC<PendingAssignmentsProps> = ({
  assignments,
  loading = false,
  onViewAll,
  onOpenAssignment,
}) => {
  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return '#1976d2';
      case 'quiz':
        return '#2e7d32';
      case 'project':
        return '#9c27b0';
      case 'essay':
        return '#ed6c02';
      case 'presentation':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📝';
      case 'quiz':
        return '❓';
      case 'project':
        return '🚀';
      case 'essay':
        return '📄';
      case 'presentation':
        return '🎯';
      default:
        return '📋';
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'submitted':
        return 'success';
      case 'graded':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = parseISO(dueDate);
    const now = new Date();
    const days = differenceInDays(due, now);
    
    if (isPast(due)) {
      return { text: 'Overdue', color: 'error.main', urgent: true };
    } else if (days === 0) {
      return { text: 'Due Today', color: 'error.main', urgent: true };
    } else if (days === 1) {
      return { text: 'Due Tomorrow', color: 'warning.main', urgent: true };
    } else if (days <= 3) {
      return { text: `${days} days left`, color: 'warning.main', urgent: true };
    } else if (days <= 7) {
      return { text: `${days} days left`, color: 'info.main', urgent: false };
    } else {
      return { text: `${days} days left`, color: 'text.secondary', urgent: false };
    }
  };

  const formatAssignmentType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Pending Assignments"
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
        title="Pending Assignments"
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
        {assignments.length === 0 ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle />
              <Typography>All caught up! No pending assignments.</Typography>
            </Box>
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {assignments.map((assignment, index) => {
              const dueInfo = getDaysUntilDue(assignment.dueDate);
              
              return (
                <ListItem
                  key={assignment._id}
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: index < assignments.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    bgcolor: dueInfo.urgent ? 'rgba(255, 152, 0, 0.04)' : 'transparent',
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: `${getAssignmentTypeColor(assignment.type)}15`,
                        color: getAssignmentTypeColor(assignment.type),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getAssignmentTypeIcon(assignment.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {assignment.course.courseCode}
                        </Typography>
                        <Chip
                          label={formatAssignmentType(assignment.type)}
                          size="small"
                          sx={{
                            bgcolor: `${getAssignmentTypeColor(assignment.type)}15`,
                            color: getAssignmentTypeColor(assignment.type),
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={assignment.priority}
                          size="small"
                          color={getPriorityColor(assignment.priority) as any}
                          variant="outlined"
                        />
                        {dueInfo.urgent && (
                          <Warning sx={{ color: 'warning.main', fontSize: 16 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          {assignment.title}
                        </Typography>
                        
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                          }}
                        >
                          {assignment.description}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="caption">
                              Due {format(parseISO(assignment.dueDate), 'MMM dd, h:mm a')}
                            </Typography>
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            {assignment.maxPoints} points
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={assignment.submissionStatus.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(assignment.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                  
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1} ml={2}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: dueInfo.color,
                        fontWeight: 600,
                        bgcolor: dueInfo.urgent ? 'rgba(255, 152, 0, 0.1)' : 'action.hover',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {dueInfo.text}
                    </Typography>
                    
                    {onOpenAssignment && (
                      <IconButton
                        size="small"
                        onClick={() => onOpenAssignment(assignment._id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingAssignments;
