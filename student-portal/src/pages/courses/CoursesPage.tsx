interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
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
  Search,
  FilterList,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import courseService from '@/services/courseService';
import { useAuthStore } from '@/stores/authStore';
import CourseCard from '@/components/Courses/CourseCard';
import CourseCatalog from '@/components/Courses/CourseCatalog';
import CourseSchedule from '@/components/Courses/CourseSchedule';



const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
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
};

const CoursesPage: React.FC = () => {
  // Helper: Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helper: Overall progress
  const getOverallProgress = () => {
    if (!enrolledCoursesQuery.data || enrolledCoursesQuery.data.length === 0) return 0;
    const totalProgress = enrolledCoursesQuery.data.reduce(
      (sum, course) => sum + (course.enrollment?.progress?.percentage || 0),
      0
    );
    return Math.round(totalProgress / enrolledCoursesQuery.data.length);
  };

  // Helper: Overall attendance
  const getOverallAttendance = () => {
    if (!enrolledCoursesQuery.data || enrolledCoursesQuery.data.length === 0) return 0;
    const totalAttendance = enrolledCoursesQuery.data.reduce(
      (sum, course) => sum + (course.enrollment?.attendance?.percentage || 0),
      0
    );
    return Math.round(totalAttendance / enrolledCoursesQuery.data.length);
  };
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();


  // Real API query for enrolled courses
  const enrolledCoursesQuery = useQuery(['enrolledCourses', user?._id], () =>
    courseService.getEnrolledCourses(user?._id),
    {
      enabled: !!user?._id,
    }
  );

  // Fix: Define menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
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
