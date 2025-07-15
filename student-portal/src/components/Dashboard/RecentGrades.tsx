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
  LinearProgress,
} from '@mui/material';
import {
  Grade,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { RecentGrade } from '@/services/dashboardService';

interface RecentGradesProps {
  grades: RecentGrade[];
  loading?: boolean;
  onViewAll?: () => void;
}

const RecentGrades: React.FC<RecentGradesProps> = ({
  grades,
  loading = false,
  onViewAll,
}) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#2e7d32'; // A
    if (percentage >= 80) return '#1976d2'; // B
    if (percentage >= 70) return '#ed6c02'; // C
    if (percentage >= 60) return '#f57c00'; // D
    return '#d32f2f'; // F
  };

  const getGradeIcon = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A':
      case 'A+':
        return '🏆';
      case 'A-':
      case 'B+':
        return '🥇';
      case 'B':
      case 'B-':
        return '🥈';
      case 'C+':
      case 'C':
        return '🥉';
      case 'C-':
      case 'D+':
        return '📈';
      case 'D':
      case 'D-':
        return '📊';
      default:
        return '📝';
    }
  };

  const getAssessmentTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return '#1976d2';
      case 'quiz':
        return '#2e7d32';
      case 'midterm':
        return '#ed6c02';
      case 'final':
        return '#d32f2f';
      case 'project':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const formatAssessmentType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getPerformanceTrend = (percentage: number) => {
    // This would typically compare with previous grades
    // For demo purposes, we'll use a simple threshold
    if (percentage >= 85) {
      return { icon: <TrendingUp />, color: 'success.main', text: 'Excellent' };
    } else if (percentage >= 75) {
      return { icon: <TrendingUp />, color: 'info.main', text: 'Good' };
    } else if (percentage >= 65) {
      return { icon: <TrendingDown />, color: 'warning.main', text: 'Average' };
    } else {
      return { icon: <TrendingDown />, color: 'error.main', text: 'Needs Improvement' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Recent Grades"
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
        title="Recent Grades"
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
        {grades.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No recent grades available.
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {grades.map((grade, index) => {
              const trend = getPerformanceTrend(grade.assessment.percentage);
              
              return (
                <ListItem
                  key={grade._id}
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: index < grades.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: `${getGradeColor(grade.assessment.percentage)}15`,
                        color: getGradeColor(grade.assessment.percentage),
                        width: 48,
                        height: 48,
                        fontSize: '1.2rem',
                      }}
                    >
                      {getGradeIcon(grade.letterGrade)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {grade.course.courseCode}
                        </Typography>
                        <Chip
                          label={formatAssessmentType(grade.assessment.type)}
                          size="small"
                          sx={{
                            bgcolor: `${getAssessmentTypeColor(grade.assessment.type)}15`,
                            color: getAssessmentTypeColor(grade.assessment.type),
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          {grade.assessment.name}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {grade.assessment.earnedPoints}/{grade.assessment.maxPoints} points
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Graded {format(parseISO(grade.gradedAt), 'MMM dd')}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <LinearProgress
                            variant="determinate"
                            value={grade.assessment.percentage}
                            sx={{
                              width: 100,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getGradeColor(grade.assessment.percentage),
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" fontWeight="bold">
                            {grade.assessment.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Box
                            sx={{
                              color: trend.color,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {React.cloneElement(trend.icon, { fontSize: 'small' })}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: trend.color, fontWeight: 500 }}
                          >
                            {trend.text}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  
                  <Box textAlign="right" ml={2}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: getGradeColor(grade.assessment.percentage) }}
                    >
                      {grade.letterGrade}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {grade.gradePoints.toFixed(1)} GP
                    </Typography>
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

export default RecentGrades;
