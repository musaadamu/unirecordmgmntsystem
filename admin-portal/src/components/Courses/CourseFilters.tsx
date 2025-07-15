import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';

import { CourseFilters as CourseFilterType } from '@/types';

interface CourseFiltersProps {
  filters: CourseFilterType;
  onFiltersChange: (filters: CourseFilterType) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof CourseFilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business Administration' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'arts', label: 'Arts & Humanities' },
    { value: 'sciences', label: 'Natural Sciences' },
    { value: 'social_sciences', label: 'Social Sciences' },
    { value: 'education', label: 'Education' },
    { value: 'law', label: 'Law' },
    { value: 'mathematics', label: 'Mathematics' },
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ];

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const creditsOptions = [
    { value: '', label: 'All Credits' },
    { value: '1', label: '1 Credit' },
    { value: '2', label: '2 Credits' },
    { value: '3', label: '3 Credits' },
    { value: '4', label: '4 Credits' },
    { value: '5', label: '5 Credits' },
    { value: '6', label: '6 Credits' },
  ];

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department || ''}
              label="Department"
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              {departmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Level</InputLabel>
            <Select
              value={filters.level || ''}
              label="Level"
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              {levelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Semester</InputLabel>
            <Select
              value={filters.semester || ''}
              label="Semester"
              onChange={(e) => handleFilterChange('semester', e.target.value)}
            >
              {semesterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Credits</InputLabel>
            <Select
              value={filters.credits?.toString() || ''}
              label="Credits"
              onChange={(e) => handleFilterChange('credits', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              {creditsOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box mt={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <FilterList fontSize="small" color="action" />
          
          {filters.department && (
            <Chip
              label={`Department: ${departmentOptions.find(d => d.value === filters.department)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('department', '')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.level && (
            <Chip
              label={`Level: ${levelOptions.find(l => l.value === filters.level)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('level', '')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.status && (
            <Chip
              label={`Status: ${statusOptions.find(s => s.value === filters.status)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('status', '')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.semester && (
            <Chip
              label={`Semester: ${semesterOptions.find(s => s.value === filters.semester)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('semester', '')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.credits && (
            <Chip
              label={`Credits: ${filters.credits}`}
              size="small"
              onDelete={() => handleFilterChange('credits', undefined)}
              color="primary"
              variant="outlined"
            />
          )}
          
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={clearFilters}
            sx={{ ml: 1 }}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CourseFilters;
