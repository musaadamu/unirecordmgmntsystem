import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Button,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  School,
  Grade,
  Payment,
  Schedule,
  Assignment,
  Notifications,
  Person,
  Download,
} from '@mui/icons-material';

import { QuickAction } from '@/services/dashboardService';

interface QuickActionsProps {
  actions?: QuickAction[];
  loading?: boolean;
}

const defaultActions: QuickAction[] = [
  {
    id: 'view-courses',
    title: 'My Courses',
    description: 'View enrolled courses and materials',
    icon: 'school',
    url: '/courses',
    color: '#1976d2',
    enabled: true,
    category: 'academic',
  },
  {
    id: 'view-grades',
    title: 'My Grades',
    description: 'Check grades and transcripts',
    icon: 'grade',
    url: '/grades',
    color: '#2e7d32',
    enabled: true,
    category: 'academic',
  },
  {
    id: 'make-payment',
    title: 'Pay Fees',
    description: 'Pay tuition and other fees',
    icon: 'payment',
    url: '/payments',
    color: '#9c27b0',
    enabled: true,
    category: 'financial',
  },
  {
    id: 'view-schedule',
    title: 'My Schedule',
    description: 'View class timetable',
    icon: 'schedule',
    url: '/schedule',
    color: '#d32f2f',
    enabled: true,
    category: 'academic',
  },
  {
    id: 'assignments',
    title: 'Assignments',
    description: 'View and submit assignments',
    icon: 'assignment',
    url: '/assignments',
    color: '#ed6c02',
    enabled: true,
    category: 'academic',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View announcements and alerts',
    icon: 'notifications',
    url: '/notifications',
    color: '#0288d1',
    enabled: true,
    category: 'administrative',
  },
  {
    id: 'profile',
    title: 'My Profile',
    description: 'Update personal information',
    icon: 'person',
    url: '/profile',
    color: '#757575',
    enabled: true,
    category: 'administrative',
  },
  {
    id: 'transcript',
    title: 'Download Transcript',
    description: 'Get official transcript',
    icon: 'download',
    url: '/transcript',
    color: '#5d4037',
    enabled: true,
    category: 'academic',
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  loading = false,
}) => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'school':
        return <School />;
      case 'grade':
        return <Grade />;
      case 'payment':
        return <Payment />;
      case 'schedule':
        return <Schedule />;
      case 'assignment':
        return <Assignment />;
      case 'notifications':
        return <Notifications />;
      case 'person':
        return <Person />;
      case 'download':
        return <Download />;
      default:
        return <School />;
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.enabled) {
      navigate(action.url);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return '#1976d2';
      case 'financial':
        return '#2e7d32';
      case 'administrative':
        return '#ed6c02';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const enabledActions = actions.filter(action => action.enabled);

  return (
    <Card>
      <CardHeader
        title="Quick Actions"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        subheader="Access frequently used features"
      />
      <CardContent>
        <Grid container spacing={2}>
          {enabledActions.map((action) => (
            <Grid item xs={6} sm={4} md={3} key={action.id}>
              <Button
                fullWidth
                onClick={() => handleActionClick(action)}
                sx={{
                  p: 2,
                  height: 'auto',
                  flexDirection: 'column',
                  gap: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  textTransform: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}08`,
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                }}
                disabled={!action.enabled}
              >
                <Avatar
                  sx={{
                    bgcolor: `${action.color}15`,
                    color: action.color,
                    width: 48,
                    height: 48,
                    mb: 1,
                  }}
                >
                  {getIcon(action.icon)}
                </Avatar>
                
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ lineHeight: 1.2 }}
                >
                  {action.title}
                </Typography>
                
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {action.description}
                </Typography>
                
                {/* Category indicator */}
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: getCategoryColor(action.category),
                    mt: 0.5,
                  }}
                />
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {/* Category Legend */}
        <Box mt={3} pt={2} borderTop="1px solid" borderColor="divider">
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Categories:
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getCategoryColor('academic'),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Academic
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getCategoryColor('financial'),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Financial
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getCategoryColor('administrative'),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Administrative
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
