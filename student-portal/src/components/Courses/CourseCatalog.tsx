import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  IconButton,
  Pagination,
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Add,
  Person,
  Schedule,
  Group,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import courseService, { Course, CourseFilters } from '@/services/courseService';
import LoadingSpinner from '@/components/LoadingSpinner';

const CourseCatalog: React.FC = () => {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
    sortBy: 'courseCode',
    sortOrder: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock course catalog data
  const mockCourses: Course[] = [
    {
      _id: '3',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      description: 'Fundamental writing skills including essay composition, grammar, and critical thinking.',
      credits: 3,
      department: 'English',
      faculty: 'Faculty of Arts',
      level: '100',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [],
      instructor: {
        _id: 'inst3',
        name: 'Dr. Emily Brown',
        email: 'emily.brown@university.edu',
        title: 'Associate Professor',
        department: 'English',
      },
      schedule: [
        {
          day: 'Monday',
          startTime: '11:00',
          endTime: '12:30',
          type: 'lecture',
          location: {
            building: 'Arts Building',
            room: 'Room 301',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 30,
      enrolled: 25,
      waitlist: 2,
      status: 'active',
      enrollmentStatus: 'open',
      materials: [],
      assessments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      _id: '4',
      courseCode: 'PHYS101',
      courseName: 'General Physics I',
      description: 'Introduction to mechanics, thermodynamics, and wave motion with laboratory component.',
      credits: 4,
      department: 'Physics',
      faculty: 'Faculty of Science',
      level: '100',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [
        {
          courseCode: 'MATH101',
          courseName: 'Calculus I',
        },
      ],
      instructor: {
        _id: 'inst4',
        name: 'Prof. David Wilson',
        email: 'david.wilson@university.edu',
        title: 'Professor',
        department: 'Physics',
      },
      schedule: [
        {
          day: 'Tuesday',
          startTime: '14:00',
          endTime: '15:30',
          type: 'lecture',
          location: {
            building: 'Physics Building',
            room: 'Lecture Hall 1',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Thursday',
          startTime: '16:00',
          endTime: '18:00',
          type: 'lab',
          location: {
            building: 'Physics Building',
            room: 'Lab 2',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 35,
      enrolled: 35,
      waitlist: 5,
      status: 'active',
      enrollmentStatus: 'waitlist',
      materials: [],
      assessments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  // Mock query
  const coursesQuery = {
    data: {
      courses: mockCourses,
      total: 2,
      page: 1,
      totalPages: 1,
    },
    isLoading: false,
    error: null,
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'courseCode',
      sortOrder: 'asc',
    });
    setSearchQuery('');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'waitlist':
        return 'warning';
      case 'closed':
        return 'error';
      case 'restricted':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEnrollmentStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle />;
      case 'waitlist':
        return <Warning />;
      case 'closed':
        return <Clear />;
      default:
        return <Group />;
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
      '#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#c62828'
    ];
    const index = department.length % colors.length;
    return colors[index];
  };

  if (coursesQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading course catalog..." />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} mb={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search courses by code, name, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<Search />}
                >
                  Search
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Collapse in={showFilters}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department || ''}
                    label="Department"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Physics">Physics</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={filters.level || ''}
                    label="Level"
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="100">100 Level</MenuItem>
                    <MenuItem value="200">200 Level</MenuItem>
                    <MenuItem value="300">300 Level</MenuItem>
                    <MenuItem value="400">400 Level</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Credits</InputLabel>
                  <Select
                    value={filters.credits || ''}
                    label="Credits"
                    onChange={(e) => handleFilterChange('credits', e.target.value)}
                  >
                    <MenuItem value="">All Credits</MenuItem>
                    <MenuItem value={1}>1 Credit</MenuItem>
                    <MenuItem value={2}>2 Credits</MenuItem>
                    <MenuItem value={3}>3 Credits</MenuItem>
                    <MenuItem value={4}>4 Credits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Clear />}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Results */}
      {coursesQuery.data && coursesQuery.data.courses.length > 0 ? (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {coursesQuery.data.courses.length} of {coursesQuery.data.total} courses
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {coursesQuery.data.courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            bgcolor: getDepartmentColor(course.department),
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                          }}
                        >
                          {course.courseCode.substring(0, 2)}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          {course.courseCode}
                        </Typography>
                      </Box>
                      
                      <Chip
                        icon={getEnrollmentStatusIcon(course.enrollmentStatus)}
                        label={course.enrollmentStatus}
                        size="small"
                        color={getEnrollmentStatusColor(course.enrollmentStatus) as any}
                        variant="outlined"
                      />
                    </Box>

                    <Typography
                      variant="body1"
                      fontWeight="500"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {course.courseName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {course.description}
                    </Typography>

                    {/* Course Info */}
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {course.instructor.name}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {course.schedule.length > 0 
                            ? `${course.schedule[0].day} ${course.schedule[0].startTime}`
                            : 'Schedule TBA'
                          }
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                        <Group fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {course.enrolled}/{course.capacity} enrolled
                          {course.waitlist > 0 && ` (${course.waitlist} waitlisted)`}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={`${course.credits} Credits`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={course.department}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Level ${course.level}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {/* Prerequisites */}
                    {course.prerequisites.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Prerequisites:
                        </Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {course.prerequisites.map((prereq, index) => (
                            <Chip
                              key={index}
                              label={prereq.courseCode}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      disabled={course.enrollmentStatus === 'closed'}
                    >
                      {course.enrollmentStatus === 'open' ? 'Enroll' : 
                       course.enrollmentStatus === 'waitlist' ? 'Join Waitlist' : 
                       'Enrollment Closed'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {coursesQuery.data.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={coursesQuery.data.totalPages}
                page={coursesQuery.data.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">
          <Typography variant="body2">
            No courses found matching your criteria. Try adjusting your search or filters.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CourseCatalog;
