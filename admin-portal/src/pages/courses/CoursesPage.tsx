import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  Archive,
  Restore,
  Schedule,
  People,
  Refresh,
  MenuBook,
  School,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import CourseTable from '@/components/Courses/CourseTable';
import CourseForm from '@/components/Courses/CourseForm';
import CourseOfferingDialog from '@/components/Courses/CourseOfferingDialog';
import BulkCourseDialog from '@/components/Courses/BulkCourseDialog';
import CourseFilters from '@/components/Courses/CourseFilters';
import CourseStats from '@/components/Courses/CourseStats';
import StatCard from '@/components/Dashboard/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Services
import courseService from '@/services/courseService';

// Types
import { Course, CourseFilters as CourseFilterType } from '@/types';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CoursesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CourseFilterType>({});
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Dialog states
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourseForOffering, setSelectedCourseForOffering] = useState<Course | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const queryClient = useQueryClient();

  // Fetch courses with filters
  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', { ...filters, search: searchTerm, page, limit: pageSize }],
    queryFn: () => courseService.getCourses({ ...filters, search: searchTerm, page, limit: pageSize }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch course statistics
  const { data: courseStats } = useQuery({
    queryKey: ['course-stats'],
    queryFn: () => courseService.getCourseStats(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch course offerings
  const { data: offeringsData } = useQuery({
    queryKey: ['course-offerings', filters],
    queryFn: () => courseService.getCourseOfferings(undefined, filters),
    staleTime: 5 * 60 * 1000,
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course-stats'] });
      toast.success('Course created successfully');
      setCourseFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => courseService.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
      setCourseFormOpen(false);
      setEditingCourse(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course-stats'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    },
  });

  // Clone course mutation
  const cloneCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => courseService.cloneCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course cloned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clone course');
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: CourseFilterType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const handleCloneCourse = (course: Course) => {
    const cloneData = {
      courseCode: `${course.courseCode}_COPY`,
      courseName: `${course.courseName} (Copy)`,
    };
    cloneCourseMutation.mutate({ id: course._id, data: cloneData });
  };

  const handleCreateOffering = (course: Course) => {
    setSelectedCourseForOffering(course);
    setOfferingDialogOpen(true);
  };

  const handleCourseSubmit = (courseData: any) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse._id, data: courseData });
    } else {
      createCourseMutation.mutate(courseData);
    }
  };

  const handleExport = async () => {
    try {
      await courseService.exportCoursesToCSV(filters);
      toast.success('Courses exported successfully');
    } catch (error) {
      toast.error('Failed to export courses');
    }
    setAnchorEl(null);
  };

  const courses = coursesData?.data?.items || [];
  const pagination = coursesData?.data?.pagination;
  const offerings = offeringsData?.data?.items || [];

  // Mock statistics for display
  const stats = courseStats ? [
    {
      title: 'Total Courses',
      value: courseStats.totalCourses.toString(),
      change: '+8%',
      trend: 'up' as const,
      icon: <MenuBook />,
      color: '#1976d2',
      subtitle: 'All courses',
    },
    {
      title: 'Active Courses',
      value: courseStats.activeCourses.toString(),
      change: '+5%',
      trend: 'up' as const,
      icon: <School />,
      color: '#2e7d32',
      subtitle: 'This semester',
    },
    {
      title: 'Total Enrollments',
      value: courseStats.totalEnrollments.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: <People />,
      color: '#ed6c02',
      subtitle: 'Student enrollments',
    },
    {
      title: 'Avg Enrollment',
      value: Math.round(courseStats.averageEnrollment).toString(),
      change: '+3%',
      trend: 'up' as const,
      icon: <TrendingUp />,
      color: '#9c27b0',
      subtitle: 'Per course',
    },
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Course Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage courses, schedules, and academic offerings across all departments
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setBulkDialogOpen(true)}
            >
              Bulk Import
            </Button>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateCourse}
            >
              Add Course
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Course Statistics */}
      {stats.length > 0 && (
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
                loading={!courseStats}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="course management tabs">
          <Tab label="All Courses" icon={<MenuBook />} />
          <Tab label="Course Offerings" icon={<Schedule />} />
          <Tab label="Analytics" icon={<Assignment />} />
        </Tabs>
      </Box>

      {/* All Courses Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CourseFilters filters={filters} onFiltersChange={handleFilterChange} />
              </Grid>

              <Grid item xs={12} md={2}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {selectedCourses.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    >
                      Actions ({selectedCourses.length})
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <LoadingSpinner message="Loading courses..." />
              </Box>
            ) : error ? (
              <Box p={4} textAlign="center">
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load courses. Please try again.
                </Alert>
                <Button variant="outlined" onClick={() => refetch()}>
                  Retry
                </Button>
              </Box>
            ) : (
              <CourseTable
                courses={courses}
                selectedCourses={selectedCourses}
                onSelectionChange={setSelectedCourses}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onClone={handleCloneCourse}
                onCreateOffering={handleCreateOffering}
                pagination={pagination}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Course Offerings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Course Offerings</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOfferingDialogOpen(true)}
              >
                Create Offering
              </Button>
            </Box>

            {offerings.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Course Offerings
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Create course offerings to schedule classes for students
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOfferingDialogOpen(true)}
                >
                  Create First Offering
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {offerings.slice(0, 6).map((offering) => (
                  <Grid item xs={12} md={6} lg={4} key={offering._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {offering.course.courseCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {offering.course.courseName}
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                          <Chip label={offering.semester} size="small" />
                          <Chip label={offering.academicYear} size="small" />
                          <Chip label={`Section ${offering.section}`} size="small" />
                        </Box>
                        <Typography variant="body2">
                          Instructor: {offering.instructor}
                        </Typography>
                        <Typography variant="body2">
                          Enrolled: {offering.enrolledStudents}/{offering.capacity}
                        </Typography>
                        {offering.waitlistCount > 0 && (
                          <Typography variant="body2" color="warning.main">
                            Waitlist: {offering.waitlistCount}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        {courseStats && <CourseStats stats={courseStats} />}
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} />
          Export Courses
        </MenuItem>
        <MenuItem onClick={() => setBulkDialogOpen(true)}>
          <Upload sx={{ mr: 1 }} />
          Import Courses
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={() => setBulkMenuAnchor(null)}>
          <Archive sx={{ mr: 1 }} />
          Archive Courses
        </MenuItem>
        <MenuItem onClick={() => setBulkMenuAnchor(null)}>
          <ContentCopy sx={{ mr: 1 }} />
          Clone Courses
        </MenuItem>
        <MenuItem onClick={() => setBulkMenuAnchor(null)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Courses
        </MenuItem>
      </Menu>

      {/* Course Form Dialog */}
      <CourseForm
        open={courseFormOpen}
        onClose={() => {
          setCourseFormOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleCourseSubmit}
        course={editingCourse}
        loading={createCourseMutation.isPending || updateCourseMutation.isPending}
      />

      {/* Course Offering Dialog */}
      <CourseOfferingDialog
        open={offeringDialogOpen}
        onClose={() => {
          setOfferingDialogOpen(false);
          setSelectedCourseForOffering(null);
        }}
        course={selectedCourseForOffering}
      />

      {/* Bulk Import Dialog */}
      <BulkCourseDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />

      {/* Floating Action Button for Quick Add */}
      <Fab
        color="primary"
        aria-label="add course"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleCreateCourse}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default CoursesPage;
