import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Grade,
  Assignment,
  Analytics,
  Add,
  Edit,
  Download,
  Upload,
  TrendingUp,
  School,
  Star,
} from '@mui/icons-material';

// Components
import StatCard from '@/components/Dashboard/StatCard';
import BarChart from '@/components/Charts/BarChart';
import PieChart from '@/components/Charts/PieChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grades-tabpanel-${index}`}
      aria-labelledby={`grades-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const GradesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('fall_2024');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for grades
  const gradeStats = [
    {
      title: 'Total Grades',
      value: '12,847',
      change: '+8%',
      trend: 'up' as const,
      icon: <Grade />,
      color: '#1976d2',
      subtitle: 'All recorded grades',
    },
    {
      title: 'Average GPA',
      value: '3.42',
      change: '+0.12',
      trend: 'up' as const,
      icon: <Star />,
      color: '#2e7d32',
      subtitle: 'University average',
    },
    {
      title: 'Pending Grades',
      value: '156',
      change: '-23%',
      trend: 'down' as const,
      icon: <Assignment />,
      color: '#ed6c02',
      subtitle: 'Awaiting submission',
    },
    {
      title: 'Honor Students',
      value: '284',
      change: '+15%',
      trend: 'up' as const,
      icon: <School />,
      color: '#9c27b0',
      subtitle: 'GPA ≥ 3.5',
    },
  ];

  // Mock grade distribution data
  const gradeDistribution = [
    { name: 'A', value: 25, color: '#2e7d32' },
    { name: 'B', value: 35, color: '#1976d2' },
    { name: 'C', value: 25, color: '#ed6c02' },
    { name: 'D', value: 10, color: '#f57c00' },
    { name: 'F', value: 5, color: '#d32f2f' },
  ];

  // Mock course performance data
  const coursePerformance = [
    { course: 'CS101', averageGrade: 3.4, students: 45, passRate: 92 },
    { course: 'MATH201', averageGrade: 3.1, students: 38, passRate: 87 },
    { course: 'ENG102', averageGrade: 3.6, students: 52, passRate: 95 },
    { course: 'PHYS101', averageGrade: 2.9, students: 41, passRate: 83 },
    { course: 'CHEM101', averageGrade: 3.2, students: 39, passRate: 89 },
  ];

  // Mock student grades
  const studentGrades = [
    { id: '1', studentId: 'S001', name: 'John Doe', course: 'CS101', assignment: 'Midterm Exam', grade: 'A', points: 95, maxPoints: 100 },
    { id: '2', studentId: 'S002', name: 'Jane Smith', course: 'CS101', assignment: 'Final Project', grade: 'B+', points: 87, maxPoints: 100 },
    { id: '3', studentId: 'S003', name: 'Mike Johnson', course: 'MATH201', assignment: 'Quiz 1', grade: 'A-', points: 92, maxPoints: 100 },
    { id: '4', studentId: 'S004', name: 'Sarah Wilson', course: 'ENG102', assignment: 'Essay 1', grade: 'B', points: 83, maxPoints: 100 },
    { id: '5', studentId: 'S005', name: 'David Brown', course: 'PHYS101', assignment: 'Lab Report', grade: 'C+', points: 78, maxPoints: 100 },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    if (grade.startsWith('D')) return 'error';
    if (grade.startsWith('F')) return 'error';
    return 'default';
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Grade Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record, manage, and analyze student grades and academic performance
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Export Grades
            </Button>
            <Button variant="outlined" startIcon={<Upload />}>
              Import Grades
            </Button>
            <Button variant="contained" startIcon={<Add />}>
              Record Grade
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Grade Statistics */}
      <Grid container spacing={3} mb={4}>
        {gradeStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="grade management tabs">
          <Tab label="Grade Entry" icon={<Grade />} />
          <Tab label="Course Performance" icon={<Analytics />} />
          <Tab label="Grade Analytics" icon={<TrendingUp />} />
        </Tabs>
      </Box>

      {/* Grade Entry Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={selectedCourse}
                        label="Course"
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        <MenuItem value="">All Courses</MenuItem>
                        <MenuItem value="CS101">CS101 - Intro to Computer Science</MenuItem>
                        <MenuItem value="MATH201">MATH201 - Calculus II</MenuItem>
                        <MenuItem value="ENG102">ENG102 - English Composition</MenuItem>
                        <MenuItem value="PHYS101">PHYS101 - Physics I</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Semester</InputLabel>
                      <Select
                        value={selectedSemester}
                        label="Semester"
                        onChange={(e) => setSelectedSemester(e.target.value)}
                      >
                        <MenuItem value="fall_2024">Fall 2024</MenuItem>
                        <MenuItem value="spring_2024">Spring 2024</MenuItem>
                        <MenuItem value="summer_2024">Summer 2024</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Search Students"
                      placeholder="Search by name or ID..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Grades Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6">Student Grades</Typography>
                  <Button variant="contained" startIcon={<Add />}>
                    Add Grade
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Assignment</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentGrades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {grade.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {grade.studentId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{grade.course}</TableCell>
                          <TableCell>{grade.assignment}</TableCell>
                          <TableCell>
                            <Chip
                              label={grade.grade}
                              color={getGradeColor(grade.grade) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {grade.points}/{grade.maxPoints}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(grade.points / grade.maxPoints) * 100}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Course Performance Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <BarChart
                  title="Course Performance Overview"
                  data={coursePerformance}
                  height={400}
                  xAxisKey="course"
                  bars={[
                    { dataKey: 'averageGrade', fill: '#1976d2', name: 'Average Grade (GPA)' },
                    { dataKey: 'passRate', fill: '#2e7d32', name: 'Pass Rate (%)' },
                  ]}
                  formatTooltip={(value, name) => [
                    name.includes('GPA') ? value.toFixed(2) : `${value}%`,
                    name
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Details
                </Typography>
                {coursePerformance.map((course, index) => (
                  <Box key={course.course} mb={2} p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {course.course}
                    </Typography>
                    <Typography variant="body2">
                      Students: {course.students}
                    </Typography>
                    <Typography variant="body2">
                      Avg Grade: {course.averageGrade.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Pass Rate: {course.passRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.passRate}
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Grade Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <PieChart
                  title="Grade Distribution"
                  data={gradeDistribution}
                  height={400}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Grade Analysis
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Advanced grade analytics and reporting features will be available in the next update.
                </Alert>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    • Grade distribution analysis
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Student performance trends
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Course difficulty assessment
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Instructor performance metrics
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Predictive analytics for student success
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default GradesPage;
