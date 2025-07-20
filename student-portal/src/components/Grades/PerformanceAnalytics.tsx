import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  School,
  EmojiEvents,
  Warning,
  CheckCircle,
  Lightbulb,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

import { PerformanceAnalytics as PerformanceAnalyticsType } from '@/services/gradesService';

const PerformanceAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Mock analytics data
  const mockAnalytics: PerformanceAnalyticsType = {
    gradeDistribution: [
      { grade: 'A', count: 8, percentage: 32 },
      { grade: 'B', count: 12, percentage: 48 },
      { grade: 'C', count: 4, percentage: 16 },
      { grade: 'D', count: 1, percentage: 4 },
      { grade: 'F', count: 0, percentage: 0 },
    ],
    departmentPerformance: [
      { department: 'Computer Science', averageGPA: 3.8, coursesCompleted: 8, credits: 24 },
      { department: 'Mathematics', averageGPA: 3.6, coursesCompleted: 6, credits: 22 },
      { department: 'Physics', averageGPA: 3.2, coursesCompleted: 4, credits: 16 },
      { department: 'English', averageGPA: 3.9, coursesCompleted: 3, credits: 9 },
      { department: 'History', averageGPA: 3.7, coursesCompleted: 2, credits: 6 },
    ],
    semesterComparison: [
      { semester: 'Fall 2022', academicYear: '2022', gpa: 3.2, credits: 15, coursesCompleted: 5 },
      { semester: 'Spring 2023', academicYear: '2023', gpa: 3.4, credits: 15, coursesCompleted: 5 },
      { semester: 'Fall 2023', academicYear: '2023', gpa: 3.6, credits: 18, coursesCompleted: 6 },
      { semester: 'Spring 2024', academicYear: '2024', gpa: 3.8, credits: 12, coursesCompleted: 4 },
      { semester: 'Fall 2024', academicYear: '2024', gpa: 3.75, credits: 18, coursesCompleted: 6 },
    ],
    improvementAreas: [
      {
        area: 'Physics Courses',
        currentPerformance: 3.2,
        targetPerformance: 3.5,
        suggestions: [
          'Attend physics tutoring sessions',
          'Form study groups with classmates',
          'Practice more problem-solving exercises',
        ],
      },
      {
        area: 'Time Management',
        currentPerformance: 75,
        targetPerformance: 85,
        suggestions: [
          'Use a digital calendar for assignment tracking',
          'Break large projects into smaller tasks',
          'Set specific study hours each day',
        ],
      },
    ],
    strengths: [
      {
        area: 'Computer Science',
        performance: 3.8,
        description: 'Consistently strong performance in programming and technical courses',
      },
      {
        area: 'English & Communication',
        performance: 3.9,
        description: 'Excellent writing and communication skills demonstrated across courses',
      },
      {
        area: 'Consistency',
        performance: 88,
        description: 'Steady improvement in GPA over time shows good learning habits',
      },
    ],
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
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

  const getDepartmentColor = (department: string) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];
    const index = department.length % colors.length;
    return colors[index];
  };

  const getPerformanceLevel = (gpa: number) => {
    if (gpa >= 3.7) return { level: 'Excellent', color: 'success' };
    if (gpa >= 3.3) return { level: 'Good', color: 'info' };
    if (gpa >= 3.0) return { level: 'Satisfactory', color: 'warning' };
    return { level: 'Needs Improvement', color: 'error' };
  };

  // Prepare radar chart data
  const radarData = mockAnalytics.departmentPerformance.map(dept => ({
    department: dept.department.split(' ')[0], // Shorten names
    gpa: dept.averageGPA,
    fullMark: 4.0,
  }));

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Performance Analytics
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Time Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="current">Current Semester</MenuItem>
            <MenuItem value="year">Current Year</MenuItem>
            <MenuItem value="last_year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Grade Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Grade Distribution
              </Typography>
              
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAnalytics.gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#1976d2"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Box display="flex" justifyContent="center" gap={1} mt={2}>
                {mockAnalytics.gradeDistribution.map((grade) => (
                  <Chip
                    key={grade.grade}
                    label={`${grade.grade}: ${grade.percentage}%`}
                    size="small"
                    sx={{
                      bgcolor: `${getGradeColor(grade.grade)}15`,
                      color: getGradeColor(grade.grade),
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* GPA Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                GPA Trend Over Time
              </Typography>
              
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockAnalytics.semesterComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} mt={2}>
                <TrendingUp sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="success.main">
                  Upward trend: +0.55 GPA improvement over 2 years
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Performance by Department
              </Typography>
              
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAnalytics.departmentPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 4]} />
                    <YAxis dataKey="department" type="category" width={100} />
                    <Tooltip />
                    <Bar
                      dataKey="averageGPA"
                      fill="#2e7d32"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Radar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Academic Performance Radar
              </Typography>
              
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis domain={[0, 4]} />
                    <Radar
                      name="GPA"
                      dataKey="gpa"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Strengths */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Academic Strengths
              </Typography>
              
              <List sx={{ p: 0 }}>
                {mockAnalytics.strengths.map((strength, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EmojiEvents sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {strength.area}
                          </Typography>
                          <Chip
                            label={typeof strength.performance === 'number' && strength.performance <= 4 
                              ? `${strength.performance.toFixed(1)} GPA` 
                              : `${strength.performance}%`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={strength.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Improvement Areas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Areas for Improvement
              </Typography>
              
              {mockAnalytics.improvementAreas.map((area, index) => (
                <Box key={index} mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Target sx={{ color: 'warning.main' }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {area.area}
                    </Typography>
                  </Box>
                  
                  <Box mb={1}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">
                        Current: {area.currentPerformance}
                      </Typography>
                      <Typography variant="caption">
                        Target: {area.targetPerformance}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(area.currentPerformance / area.targetPerformance) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" fontWeight="500" gutterBottom>
                    Suggestions:
                  </Typography>
                  <List dense sx={{ pl: 2 }}>
                    {area.suggestions.map((suggestion, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Lightbulb sx={{ fontSize: 16, color: 'info.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {suggestion}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Performance Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                    <Typography variant="h4" fontWeight="bold" color="success.contrastText">
                      3.68
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Cumulative GPA
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={2}>
                    <Typography variant="h4" fontWeight="bold" color="info.contrastText">
                      75
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Credits Completed
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
                    <Typography variant="h4" fontWeight="bold" color="warning.contrastText">
                      25
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Courses Completed
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary.contrastText">
                      88%
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Improvement Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Great Progress!</strong> Your GPA has improved consistently over the past 4 semesters. 
                  Keep up the excellent work in Computer Science and English courses.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceAnalytics;
