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
  Avatar,
} from '@mui/material';
import {
  PersonAdd,
  Assignment,
  Analytics,
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  TrendingUp,
  School,
  People,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';

// Components
import StatCard from '@/components/Dashboard/StatCard';
import BarChart from '@/components/Charts/BarChart';
import LineChart from '@/components/Charts/LineChart';

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
      id={`enrollments-tabpanel-${index}`}
      aria-labelledby={`enrollments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EnrollmentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('fall_2024');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for enrollments
  const enrollmentStats = [
    {
      title: 'Total Enrollments',
      value: '8,456',
      change: '+12%',
      trend: 'up' as const,
      icon: <PersonAdd />,
      color: '#1976d2',
      subtitle: 'This semester',
    },
    {
      title: 'Active Students',
      value: '2,847',
      change: '+8%',
      trend: 'up' as const,
      icon: <School />,
      color: '#2e7d32',
      subtitle: 'Currently enrolled',
    },
    {
      title: 'Pending Enrollments',
      value: '156',
      change: '-23%',
      trend: 'down' as const,
      icon: <Schedule />,
      color: '#ed6c02',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2%',
      trend: 'up' as const,
      icon: <CheckCircle />,
      color: '#9c27b0',
      subtitle: 'Course completion',
    },
  ];

  // Mock enrollment data
  const enrollments = [
    {
      id: '1',
      studentId: 'S001',
      studentName: 'John Doe',
      course: 'CS101',
      courseName: 'Introduction to Computer Science',
      semester: 'Fall 2024',
      status: 'enrolled',
      enrollmentDate: '2024-08-15',
      credits: 3,
    },
    {
      id: '2',
      studentId: 'S002',
      studentName: 'Jane Smith',
      course: 'MATH201',
      courseName: 'Calculus II',
      semester: 'Fall 2024',
      status: 'waitlisted',
      enrollmentDate: '2024-08-20',
      credits: 4,
    },
    {
      id: '3',
      studentId: 'S003',
      studentName: 'Mike Johnson',
      course: 'ENG102',
      courseName: 'English Composition',
      semester: 'Fall 2024',
      status: 'enrolled',
      enrollmentDate: '2024-08-12',
      credits: 3,
    },
    {
      id: '4',
      studentId: 'S004',
      studentName: 'Sarah Wilson',
      course: 'PHYS101',
      courseName: 'Physics I',
      semester: 'Fall 2024',
      status: 'dropped',
      enrollmentDate: '2024-08-18',
      credits: 4,
    },
    {
      id: '5',
      studentId: 'S005',
      studentName: 'David Brown',
      course: 'CHEM101',
      courseName: 'Chemistry I',
      semester: 'Fall 2024',
      status: 'enrolled',
      enrollmentDate: '2024-08-14',
      credits: 4,
    },
  ];

  // Mock enrollment trends data
  const enrollmentTrends = [
    { period: 'Fall 2023', enrollments: 7800, completions: 7200, dropouts: 600 },
    { period: 'Spring 2024', enrollments: 8100, completions: 7500, dropouts: 600 },
    { period: 'Summer 2024', enrollments: 3200, completions: 2900, dropouts: 300 },
    { period: 'Fall 2024', enrollments: 8456, completions: 0, dropouts: 156 },
  ];

  // Mock course capacity data
  const courseCapacity = [
    { course: 'CS101', enrolled: 45, capacity: 50, waitlist: 8 },
    { course: 'MATH201', enrolled: 38, capacity: 40, waitlist: 12 },
    { course: 'ENG102', enrolled: 52, capacity: 55, waitlist: 3 },
    { course: 'PHYS101', enrolled: 41, capacity: 45, waitlist: 6 },
    { course: 'CHEM101', enrolled: 39, capacity: 40, waitlist: 9 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'success';
      case 'waitlisted':
        return 'warning';
      case 'dropped':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <CheckCircle fontSize="small" />;
      case 'waitlisted':
        return <Schedule fontSize="small" />;
      case 'dropped':
        return <Cancel fontSize="small" />;
      default:
        return <Assignment fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Enrollment Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage student enrollments, course capacity, and academic progress tracking
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
            <Button variant="outlined" startIcon={<Upload />}>
              Bulk Enroll
            </Button>
            <Button variant="contained" startIcon={<Add />}>
              New Enrollment
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Enrollment Statistics */}
      <Grid container spacing={3} mb={4}>
        {enrollmentStats.map((stat, index) => (
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="enrollment management tabs">
          <Tab label="All Enrollments" icon={<PersonAdd />} />
          <Tab label="Course Capacity" icon={<People />} />
          <Tab label="Enrollment Analytics" icon={<Analytics />} />
        </Tabs>
      </Box>

      {/* All Enrollments Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select defaultValue="">
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="enrolled">Enrolled</MenuItem>
                        <MenuItem value="waitlisted">Waitlisted</MenuItem>
                        <MenuItem value="dropped">Dropped</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
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

          {/* Enrollments Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6">Student Enrollments</Typography>
                  <Button variant="contained" startIcon={<Add />}>
                    Add Enrollment
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Semester</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Credits</TableCell>
                        <TableCell>Enrollment Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {enrollment.studentName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {enrollment.studentName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {enrollment.studentId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {enrollment.course}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {enrollment.courseName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{enrollment.semester}</TableCell>
                          <TableCell>
                            <Chip
                              label={enrollment.status}
                              color={getStatusColor(enrollment.status) as any}
                              size="small"
                              icon={getStatusIcon(enrollment.status)}
                            />
                          </TableCell>
                          <TableCell>{enrollment.credits}</TableCell>
                          <TableCell>{enrollment.enrollmentDate}</TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
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

      {/* Course Capacity Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <BarChart
                  title="Course Enrollment vs Capacity"
                  data={courseCapacity}
                  height={400}
                  xAxisKey="course"
                  bars={[
                    { dataKey: 'enrolled', fill: '#1976d2', name: 'Enrolled' },
                    { dataKey: 'capacity', fill: '#2e7d32', name: 'Capacity' },
                    { dataKey: 'waitlist', fill: '#ed6c02', name: 'Waitlist' },
                  ]}
                  formatTooltip={(value, name) => [value.toString(), name]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Capacity Overview
                </Typography>
                {courseCapacity.map((course, index) => (
                  <Box key={course.course} mb={2} p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {course.course}
                    </Typography>
                    <Typography variant="body2">
                      Enrolled: {course.enrolled}/{course.capacity}
                    </Typography>
                    <Typography variant="body2">
                      Waitlist: {course.waitlist}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(course.enrolled / course.capacity) * 100}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: (course.enrolled / course.capacity) > 0.9 ? '#d32f2f' :
                                         (course.enrolled / course.capacity) > 0.7 ? '#ed6c02' : '#2e7d32',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((course.enrolled / course.capacity) * 100)}% capacity
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Enrollment Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <LineChart
                  title="Enrollment Trends Over Time"
                  data={enrollmentTrends}
                  height={400}
                  xAxisKey="period"
                  lines={[
                    { dataKey: 'enrollments', stroke: '#1976d2', name: 'Total Enrollments' },
                    { dataKey: 'completions', stroke: '#2e7d32', name: 'Completions' },
                    { dataKey: 'dropouts', stroke: '#d32f2f', name: 'Dropouts' },
                  ]}
                  formatTooltip={(value, name) => [value.toString(), name]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Enrollment Analytics
                </Typography>
                <Alert severity="info">
                  Advanced enrollment analytics and predictive modeling features will be available in the next update.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default EnrollmentsPage;
