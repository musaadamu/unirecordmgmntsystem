import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  School,
  EmojiEvents,
  Warning,
  CheckCircle,
  Timeline,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { GPACalculation, AcademicStanding } from '@/services/gradesService';

interface GradeOverviewProps {
  gpaData?: GPACalculation;
  academicStanding?: AcademicStanding;
  semester: string;
}

const GradeOverview: React.FC<GradeOverviewProps> = ({
  gpaData,
  academicStanding,
  semester,
}) => {
  // Mock current semester grades for pie chart
  const gradeDistribution = [
    { name: 'A', value: 3, color: '#2e7d32' },
    { name: 'B', value: 2, color: '#1976d2' },
    { name: 'C', value: 1, color: '#ed6c02' },
    { name: 'D', value: 0, color: '#f57c00' },
    { name: 'F', value: 0, color: '#d32f2f' },
  ];

  // Mock recent grades
  const recentGrades = [
    {
      course: 'CS101',
      courseName: 'Introduction to Computer Science',
      grade: 'B+',
      percentage: 87,
      credits: 3,
      date: '2024-01-15',
    },
    {
      course: 'MATH201',
      courseName: 'Calculus II',
      grade: 'A-',
      percentage: 92,
      credits: 4,
      date: '2024-01-12',
    },
    {
      course: 'ENG101',
      courseName: 'English Composition',
      grade: 'A',
      percentage: 95,
      credits: 3,
      date: '2024-01-10',
    },
  ];

  const getGradeColor = (grade: string) => {
    const letter = grade.charAt(0);
    switch (letter) {
      case 'A':
        return '#2e7d32';
      case 'B':
        return '#1976d2';
      case 'C':
        return '#ed6c02';
      case 'D':
        return '#f57c00';
      case 'F':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getGPATrend = () => {
    if (!gpaData?.trend || gpaData.trend.length < 2) return null;
    
    const current = gpaData.trend[gpaData.trend.length - 1].gpa;
    const previous = gpaData.trend[gpaData.trend.length - 2].gpa;
    const change = current - previous;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(2),
      color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary',
    };
  };

  const trend = getGPATrend();

  const getProgressToGraduation = () => {
    if (!gpaData) return 0;
    const totalRequired = 120; // Typical bachelor's degree requirement
    return Math.min((gpaData.cumulative.completedCredits / totalRequired) * 100, 100);
  };

  return (
    <Grid container spacing={3}>
      {/* GPA Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              GPA Summary
            </Typography>
            
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {gpaData?.cumulative.gpa.toFixed(2) || '0.00'}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cumulative GPA
                  </Typography>
                  {trend && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {trend.direction === 'up' ? (
                        <TrendingUp sx={{ color: trend.color, fontSize: 16 }} />
                      ) : trend.direction === 'down' ? (
                        <TrendingDown sx={{ color: trend.color, fontSize: 16 }} />
                      ) : null}
                      <Typography variant="caption" sx={{ color: trend.color, fontWeight: 500 }}>
                        {trend.direction !== 'neutral' ? `±${trend.value}` : 'No change'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Current Semester</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {gpaData?.current.gpa.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Credits</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {gpaData?.cumulative.completedCredits || 0}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Quality Points</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {gpaData?.cumulative.totalQualityPoints.toFixed(1) || '0.0'}
                </Typography>
              </Box>
            </Box>

            {/* Progress to Graduation */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="500">
                  Progress to Graduation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getProgressToGraduation().toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressToGraduation()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Grade Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Current Semester Grade Distribution
            </Typography>
            
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              {gradeDistribution.map((grade) => (
                <Box key={grade.name} display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: grade.color,
                    }}
                  />
                  <Typography variant="caption">
                    {grade.name}: {grade.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Academic Standing */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Academic Standing
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <EmojiEvents sx={{ color: 'warning.main', fontSize: 32 }} />
              <Box>
                <Chip
                  label={academicStanding?.current || 'Good'}
                  color={
                    academicStanding?.current === 'excellent' ? 'success' :
                    academicStanding?.current === 'good' ? 'info' :
                    academicStanding?.current === 'satisfactory' ? 'warning' : 'error'
                  }
                  sx={{ fontWeight: 'bold', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Current academic standing
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Requirements
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={`Minimum GPA: ${academicStanding?.requirements.minimumGPA || 2.0}`}
                  secondary={`Current: ${gpaData?.cumulative.gpa.toFixed(2) || '0.00'}`}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={`Minimum Credits: ${academicStanding?.requirements.minimumCredits || 12}`}
                  secondary={`Current Semester: ${gpaData?.current.credits || 0}`}
                />
              </ListItem>
            </List>

            {academicStanding?.warnings && academicStanding.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {academicStanding.warnings[0].message}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Grades */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Grades
            </Typography>
            
            <List sx={{ p: 0 }}>
              {recentGrades.map((grade, index) => (
                <React.Fragment key={grade.course}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {grade.course}
                          </Typography>
                          <Chip
                            label={grade.grade}
                            size="small"
                            sx={{
                              bgcolor: `${getGradeColor(grade.grade)}15`,
                              color: getGradeColor(grade.grade),
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            {grade.courseName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {grade.percentage}% • {grade.credits} credits • {grade.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentGrades.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* GPA by Level */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              GPA by Academic Level
            </Typography>
            
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gpaData?.byLevel || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis domain={[0, 4]} />
                  <Tooltip />
                  <Bar dataKey="gpa" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default GradeOverview;
