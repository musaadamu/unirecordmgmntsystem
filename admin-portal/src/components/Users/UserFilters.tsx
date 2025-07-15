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

import { UserFilters as UserFilterType, UserRole, UserStatus } from '@/types';

interface UserFiltersProps {
  filters: UserFilterType;
  onFiltersChange: (filters: UserFilterType) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof UserFilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'student', label: 'Students' },
    { value: 'academic_staff', label: 'Academic Staff' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'admin', label: 'Administrators' },
    { value: 'super_admin', label: 'Super Administrators' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending', label: 'Pending' },
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'arts', label: 'Arts & Humanities' },
    { value: 'sciences', label: 'Natural Sciences' },
    { value: 'social_sciences', label: 'Social Sciences' },
    { value: 'education', label: 'Education' },
  ];

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role || ''}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
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

        <Grid item xs={12} sm={4}>
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
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box mt={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <FilterList fontSize="small" color="action" />
          
          {filters.role && (
            <Chip
              label={`Role: ${roleOptions.find(r => r.value === filters.role)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('role', '')}
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
          
          {filters.department && (
            <Chip
              label={`Department: ${departmentOptions.find(d => d.value === filters.department)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('department', '')}
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

export default UserFilters;
