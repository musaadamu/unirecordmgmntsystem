import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  ContentCopy,
  Schedule,
  People,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { Course, PaginationInfo } from '@/types';

interface CourseTableProps {
  courses: Course[];
  selectedCourses: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onClone: (course: Course) => void;
  onCreateOffering: (course: Course) => void;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  selectedCourses,
  onSelectionChange,
  onEdit,
  onDelete,
  onClone,
  onCreateOffering,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(courses.map(course => course._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const selectedIndex = selectedCourses.indexOf(courseId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedCourses, courseId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedCourses.slice(1));
    } else if (selectedIndex === selectedCourses.length - 1) {
      newSelected = newSelected.concat(selectedCourses.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedCourses.slice(0, selectedIndex),
        selectedCourses.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'undergraduate':
        return 'primary';
      case 'graduate':
        return 'secondary';
      case 'postgraduate':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDifficultyIcon = (credits: number) => {
    if (credits >= 4) return <Star color="warning" />;
    if (credits >= 3) return <Star color="action" />;
    return <StarBorder color="action" />;
  };

  const isSelected = (courseId: string) => selectedCourses.indexOf(courseId) !== -1;

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedCourses.length > 0 && selectedCourses.length < courses.length}
                  checked={courses.length > 0 && selectedCourses.length === courses.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Enrollment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => {
              const isItemSelected = isSelected(course._id);
              const enrollmentPercentage = course.maxEnrollment > 0 
                ? Math.min((course.offerings?.reduce((sum, offering) => sum + offering.enrolledStudents, 0) || 0) / course.maxEnrollment * 100, 100)
                : 0;

              return (
                <TableRow
                  key={course._id}
                  hover
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelectCourse(course._id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getLevelColor(course.academicInfo.level) + '.main',
                          fontSize: '0.875rem',
                        }}
                      >
                        {course.courseCode.substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {course.courseCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.courseName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {course.academicInfo.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.academicInfo.faculty}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={course.academicInfo.level}
                      color={getLevelColor(course.academicInfo.level) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {course.academicInfo.credits}
                      </Typography>
                      {getDifficultyIcon(course.academicInfo.credits)}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">
                          {course.offerings?.reduce((sum, offering) => sum + offering.enrolledStudents, 0) || 0}
                        </Typography>
                        <Typography variant="caption">
                          {course.maxEnrollment}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={enrollmentPercentage}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: enrollmentPercentage > 80 ? '#d32f2f' : 
                                           enrollmentPercentage > 60 ? '#ed6c02' : '#2e7d32',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {enrollmentPercentage.toFixed(0)}% capacity
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={course.status}
                      color={getStatusColor(course.status) as any}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit Course">
                        <IconButton size="small" onClick={() => onEdit(course)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Create Offering">
                        <IconButton size="small" onClick={() => onCreateOffering(course)}>
                          <Schedule fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, course)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.totalItems}
          page={pagination.currentPage - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={25}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedCourse) onEdit(selectedCourse);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Course
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedCourse) onCreateOffering(selectedCourse);
          handleMenuClose();
        }}>
          <Schedule sx={{ mr: 1 }} />
          Create Offering
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedCourse) onClone(selectedCourse);
          handleMenuClose();
        }}>
          <ContentCopy sx={{ mr: 1 }} />
          Clone Course
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Handle view enrollments
          handleMenuClose();
        }}>
          <People sx={{ mr: 1 }} />
          View Enrollments
        </MenuItem>
        
        <MenuItem
          onClick={() => {
            if (selectedCourse) onDelete(selectedCourse._id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Course
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CourseTable;
