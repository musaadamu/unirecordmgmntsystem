import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  School,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { AcademicProgress as AcademicProgressType } from '@/services/dashboardService';

interface AcademicProgressProps {
  progress: AcademicProgressType;
  loading?: boolean;
}

const AcademicProgress: React.FC<AcademicProgressProps> = ({
  progress,
  loading = false,
}) => {
  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return '#2e7d32';
    if (gpa >= 3.0) return '#1976d2';
    if (gpa >= 2.5) return '#ed6c02';
    if (gpa >= 2.0) return '#f57c00';
    return '#d32f2f';
  };

  const getStandingColor = (standing: string) => {
    switch (standing.toLowerCase()) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'satisfactory':
        return 'warning';
      case 'probation':
        return 'error';
      default:
        return 'default';
    }
  };

  const getGPATrend = (trends: Array<{ semester: string; gpa: number }>) => {
    if (trends.length < 2) return null;
    
    const current = trends[trends.length - 1].gpa;
    const previous = trends[trends.length - 2].gpa;
    const change = current - previous;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(2),
      color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary',
    };
  };

  const formatSemesterData = (trends: Array<{ semester: string; gpa: number; credits: number }>) => {
    return trends.map(item => ({
      semester: item.semester,
      GPA: item.gpa,
      Credits: item.credits,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Academic Progress" />
        <CardContent>
          <Box>Loading academic progress...</Box>
        </CardContent>
      </Card>
    );
  }

  const trend = getGPATrend(progress.trends);
  const chartData = formatSemesterData(progress.trends);

  return (
    <Card>
      <CardHeader
        title="Academic Progress"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        subheader="Track your academic journey and performance"
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Overall Progress */}
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Degree Progress
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <School sx={{ color: 'primary.main' }} />
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Completion Progress
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {progress.overallProgress.completionPercentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progress.overallProgress.completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="caption" color="text.secondary">
                  {progress.overallProgress.totalCreditsEarned} credits earned
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress.overallProgress.totalCreditsRequired} total required
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <EmojiEvents sx={{ color: 'warning.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Expected graduation: {new Date(progress.overallProgress.expectedGraduation).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Current Semester */}
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Current Semester
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" fontWeight="bold" color={getGPAColor(progress.currentSemester.gpa)}>
                  {progress.currentSemester.gpa.toFixed(2)}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Semester GPA
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progress.currentSemester.semester} {progress.currentSemester.academicYear}
                  </Typography>
                </Box>
                {trend && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {trend.direction === 'up' ? (
                      <TrendingUp sx={{ color: trend.color, fontSize: 20 }} />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown sx={{ color: trend.color, fontSize: 20 }} />
                    ) : null}
                    <Typography variant="caption" sx={{ color: trend.color, fontWeight: 500 }}>
                      {trend.direction !== 'neutral' ? `±${trend.value}` : 'No change'}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={progress.overallProgress.academicStanding}
                  color={getStandingColor(progress.overallProgress.academicStanding) as any}
                  size="small"
                />
                <Chip
                  label={`${progress.currentSemester.totalCredits} credits`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Cumulative GPA: {progress.overallProgress.cumulativeGPA.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          {/* GPA Trend Chart */}
          <Grid item xs={12}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                GPA Trend
              </Typography>
              
              <Box height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="GPA"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Current Courses */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Current Courses
            </Typography>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {progress.currentSemester.courses.map((course, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {course.course.courseCode}
                          </Typography>
                          <Chip
                            label={course.currentGrade || 'In Progress'}
                            size="small"
                            color={course.currentGrade ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            {course.course.courseName}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Typography variant="caption" color="text.secondary">
                              {course.course.credits} credits
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Attendance: {course.attendance}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Progress: {course.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box textAlign="right">
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          width: 60,
                          height: 4,
                          borderRadius: 2,
                          mb: 1,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {course.progress}%
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < progress.currentSemester.courses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AcademicProgress;
