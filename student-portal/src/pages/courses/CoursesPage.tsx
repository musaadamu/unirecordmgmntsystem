import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  School,
  Schedule,
  Assignment,
  Grade,
  MoreVert,
  Add,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import courseService, { EnrolledCourse } from '@/services/courseService';
import { useAuthStore } from '@/stores/authStore';
import CourseCard from '@/components/Courses/CourseCard';
import CourseCatalog from '@/components/Courses/CourseCatalog';
import CourseSchedule from '@/components/Courses/CourseSchedule';
import LoadingSpinner from '@/components/LoadingSpinner';

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
      id={`courses-tabpanel-${index}`}
      aria-labelledby={`courses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CoursesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  // Mock enrolled courses data
  const mockEnrolledCourses: EnrolledCourse[] = [
    {
      _id: '1',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
      credits: 3,
      department: 'Computer Science',
      faculty: 'Faculty of Science',
      level: '100',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [],
      instructor: {
        _id: 'inst1',
        name: 'Dr. Sarah Smith',
        email: 'sarah.smith@university.edu',
        title: 'Professor',
        department: 'Computer Science',
      },
      schedule: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          type: 'lecture',
          location: {
            building: 'Science Building',
            room: 'Room 201',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Wednesday',
          startTime: '14:00',
          endTime: '16:00',
          type: 'lab',
          location: {
            building: 'Computer Lab',
            room: 'Lab 1',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 50,
      enrolled: 45,
      waitlist: 3,
      status: 'active',
      enrollmentStatus: 'open',
      materials: [
        {
          _id: 'mat1',
          title: 'Course Syllabus',
          type: 'pdf',
          url: '/materials/cs101-syllabus.pdf',
          uploadedAt: '2024-01-01T00:00:00Z',
        },
      ],
      assessments: [
        {
          _id: 'assess1',
          name: 'Midterm Exam',
          type: 'midterm',
          weight: 30,
          maxPoints: 100,
          dueDate: '2024-03-15T00:00:00Z',
        },
      ],
      enrollment: {
        _id: 'enroll1',
        enrolledAt: '2024-01-15T00:00:00Z',
        status: 'enrolled',
        grade: {
          letterGrade: 'B+',
          gradePoints: 3.3,
          percentage: 85,
        },
        attendance: {
          present: 22,
          absent: 3,
          total: 25,
          percentage: 88,
        },
        progress: {
          completedAssignments: 8,
          totalAssignments: 10,
          percentage: 80,
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      _id: '2',
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      description: 'Advanced calculus including integration techniques, series, and differential equations.',
      credits: 4,
      department: 'Mathematics',
      faculty: 'Faculty of Science',
      level: '200',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [
        {
          courseCode: 'MATH101',
          courseName: 'Calculus I',
        },
      ],
      instructor: {
        _id: 'inst2',
        name: 'Prof. Michael Johnson',
        email: 'michael.johnson@university.edu',
        title: 'Associate Professor',
        department: 'Mathematics',
      },
      schedule: [
        {
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '11:30',
          type: 'lecture',
          location: {
            building: 'Mathematics Building',
            room: 'Room 105',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Thursday',
          startTime: '10:00',
          endTime: '11:30',
          type: 'lecture',
          location: {
            building: 'Mathematics Building',
            room: 'Room 105',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 40,
      enrolled: 38,
      waitlist: 0,
      status: 'active',
      enrollmentStatus: 'open',
      materials: [],
      assessments: [],
      enrollment: {
        _id: 'enroll2',
        enrolledAt: '2024-01-15T00:00:00Z',
        status: 'enrolled',
        attendance: {
          present: 20,
          absent: 2,
          total: 22,
          percentage: 91,
        },
        progress: {
          completedAssignments: 6,
          totalAssignments: 8,
          percentage: 75,
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  // Mock query for enrolled courses
  const enrolledCoursesQuery = {
    data: mockEnrolledCourses,
    isLoading: false,
    error: null,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getOverallProgress = () => {
    if (!enrolledCoursesQuery.data) return 0;
    const totalProgress = enrolledCoursesQuery.data.reduce(
      (sum, course) => sum + (course.enrollment.progress?.percentage || 0),
      0
    );
    return Math.round(totalProgress / enrolledCoursesQuery.data.length);
  };

  const getOverallAttendance = () => {
    if (!enrolledCoursesQuery.data) return 0;
    const totalAttendance = enrolledCoursesQuery.data.reduce(
      (sum, course) => sum + course.enrollment.attendance.percentage,
      0
    );
    return Math.round(totalAttendance / enrolledCoursesQuery.data.length);
  };

  if (enrolledCoursesQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading your courses..." />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              My Courses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your enrolled courses, view schedules, and access materials
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={() => setTabValue(1)}
            >
              Browse Catalog
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {enrolledCoursesQuery.data?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enrolled Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {getOverallProgress()}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {getOverallAttendance()}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Attendance Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {enrolledCoursesQuery.data?.reduce((sum, course) => sum + course.credits, 0) || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Credits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="courses tabs">
          <Tab
            label="My Courses"
            icon={<School />}
            iconPosition="start"
            id="courses-tab-0"
            aria-controls="courses-tabpanel-0"
          />
          <Tab
            label="Course Catalog"
            icon={<Search />}
            iconPosition="start"
            id="courses-tab-1"
            aria-controls="courses-tabpanel-1"
          />
          <Tab
            label="Schedule"
            icon={<Schedule />}
            iconPosition="start"
            id="courses-tab-2"
            aria-controls="courses-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* My Courses */}
        {enrolledCoursesQuery.data && enrolledCoursesQuery.data.length > 0 ? (
          <Grid container spacing={3}>
            {enrolledCoursesQuery.data.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              You are not currently enrolled in any courses. Browse the course catalog to find courses to enroll in.
            </Typography>
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Course Catalog */}
        <CourseCatalog />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Schedule */}
        <CourseSchedule courses={enrolledCoursesQuery.data || []} />
      </TabPanel>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Assignment sx={{ mr: 1 }} />
          View All Assignments
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Grade sx={{ mr: 1 }} />
          View All Grades
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FilterList sx={{ mr: 1 }} />
          Filter Courses
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CoursesPage;
