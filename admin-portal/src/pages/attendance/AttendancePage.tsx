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
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Analytics,
  Add,
  Edit,
  Download,
  Upload,
  TrendingUp,
  People,
  EventAvailable,
  EventBusy,
  AccessTime,
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
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AttendancePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for attendance
  const attendanceStats = [
    {
      title: 'Total Classes',
      value: '1,247',
      change: '+8%',
      trend: 'up' as const,
      icon: <Schedule />,
      color: '#1976d2',
      subtitle: 'This semester',
    },
    {
      title: 'Average Attendance',
      value: '87%',
      change: '+3%',
      trend: 'up' as const,
      icon: <People />,
      color: '#2e7d32',
      subtitle: 'Overall rate',
    },
    {
      title: 'Present Today',
      value: '2,156',
      change: '+12%',
      trend: 'up' as const,
      icon: <EventAvailable />,
      color: '#ed6c02',
      subtitle: 'Students present',
    },
    {
      title: 'Absent Today',
      value: '341',
      change: '-5%',
      trend: 'down' as const,
      icon: <EventBusy />,
      color: '#9c27b0',
      subtitle: 'Students absent',
    },
  ];

  // Mock attendance records
  const attendanceRecords = [
    {
      id: '1',
      studentId: 'S001',
      studentName: 'John Doe',
      course: 'CS101',
      courseName: 'Introduction to Computer Science',
      date: '2024-01-15',
      status: 'present',
      timeIn: '09:00',
      timeOut: '10:30',
    },
    {
      id: '2',
      studentId: 'S002',
      studentName: 'Jane Smith',
      course: 'CS101',
      courseName: 'Introduction to Computer Science',
      date: '2024-01-15',
      status: 'absent',
      timeIn: null,
      timeOut: null,
    },
    {
      id: '3',
      studentId: 'S003',
      studentName: 'Mike Johnson',
      course: 'MATH201',
      courseName: 'Calculus II',
      date: '2024-01-15',
      status: 'late',
      timeIn: '09:15',
      timeOut: '10:30',
    },
    {
      id: '4',
      studentId: 'S004',
      studentName: 'Sarah Wilson',
      course: 'ENG102',
      courseName: 'English Composition',
      date: '2024-01-15',
      status: 'present',
      timeIn: '08:55',
      timeOut: '10:25',
    },
    {
      id: '5',
      studentId: 'S005',
      studentName: 'David Brown',
      course: 'PHYS101',
      courseName: 'Physics I',
      date: '2024-01-15',
      status: 'excused',
      timeIn: null,
      timeOut: null,
    },
  ];

  // Mock course attendance data
  const courseAttendance = [
    { course: 'CS101', present: 42, absent: 8, late: 3, total: 53, rate: 85 },
    { course: 'MATH201', present: 35, absent: 5, late: 2, total: 42, rate: 88 },
    { course: 'ENG102', present: 48, absent: 4, late: 1, total: 53, rate: 92 },
    { course: 'PHYS101', present: 38, absent: 7, late: 2, total: 47, rate: 85 },
    { course: 'CHEM101', present: 36, absent: 6, late: 3, total: 45, rate: 84 },
  ];

  // Mock attendance trends
  const attendanceTrends = [
    { date: '2024-01-08', present: 2100, absent: 400, rate: 84 },
    { date: '2024-01-09', present: 2150, absent: 350, rate: 86 },
    { date: '2024-01-10', present: 2200, absent: 300, rate: 88 },
    { date: '2024-01-11', present: 2180, absent: 320, rate: 87 },
    { date: '2024-01-12', present: 2250, absent: 250, rate: 90 },
    { date: '2024-01-15', present: 2156, absent: 341, rate: 86 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle fontSize="small" />;
      case 'absent':
        return <Cancel fontSize="small" />;
      case 'late':
        return <AccessTime fontSize="small" />;
      case 'excused':
        return <Schedule fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Attendance Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage student attendance across all courses and sessions
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
            <Button variant="outlined" startIcon={<Upload />}>
              Import Attendance
            </Button>
            <Button variant="contained" startIcon={<Add />}>
              Mark Attendance
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Attendance Statistics */}
      <Grid container spacing={3} mb={4}>
        {attendanceStats.map((stat, index) => (
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="attendance management tabs">
          <Tab label="Daily Attendance" icon={<Schedule />} />
          <Tab label="Course Overview" icon={<People />} />
          <Tab label="Analytics" icon={<Analytics />} />
        </Tabs>
      </Box>

      {/* Daily Attendance Tab */}
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
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
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

          {/* Attendance Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6">Attendance Records</Typography>
                  <Button variant="contained" startIcon={<Add />}>
                    Mark Attendance
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time In</TableCell>
                        <TableCell>Time Out</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {record.studentName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {record.studentName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {record.studentId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {record.course}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {record.courseName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={getStatusColor(record.status) as any}
                              size="small"
                              icon={getStatusIcon(record.status)}
                            />
                          </TableCell>
                          <TableCell>{record.timeIn || '-'}</TableCell>
                          <TableCell>{record.timeOut || '-'}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit Attendance">
                              <IconButton size="small">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
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

      {/* Course Overview Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <BarChart
                  title="Course Attendance Overview"
                  data={courseAttendance}
                  height={400}
                  xAxisKey="course"
                  bars={[
                    { dataKey: 'present', fill: '#2e7d32', name: 'Present' },
                    { dataKey: 'absent', fill: '#d32f2f', name: 'Absent' },
                    { dataKey: 'late', fill: '#ed6c02', name: 'Late' },
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
                  Course Attendance Rates
                </Typography>
                {courseAttendance.map((course, index) => (
                  <Box key={course.course} mb={2} p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {course.course}
                    </Typography>
                    <Typography variant="body2">
                      Present: {course.present}/{course.total}
                    </Typography>
                    <Typography variant="body2">
                      Rate: {course.rate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.rate}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: course.rate >= 90 ? '#2e7d32' :
                                         course.rate >= 80 ? '#ed6c02' : '#d32f2f',
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <LineChart
                  title="Daily Attendance Trends"
                  data={attendanceTrends}
                  height={400}
                  xAxisKey="date"
                  lines={[
                    { dataKey: 'present', stroke: '#2e7d32', name: 'Present' },
                    { dataKey: 'absent', stroke: '#d32f2f', name: 'Absent' },
                    { dataKey: 'rate', stroke: '#1976d2', name: 'Attendance Rate (%)' },
                  ]}
                  formatTooltip={(value, name) => [
                    name.includes('Rate') ? `${value}%` : value.toString(),
                    name
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Analytics
                </Typography>
                <Alert severity="info">
                  Advanced attendance analytics and reporting features will be available in the next update.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AttendancePage;
