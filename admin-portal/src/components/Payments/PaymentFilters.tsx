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

import { PaymentFilters as PaymentFilterType } from '@/types';

interface PaymentFiltersProps {
  filters: PaymentFilterType;
  onFiltersChange: (filters: PaymentFilterType) => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof PaymentFilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  const paymentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'tuition', label: 'Tuition Fees' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'library', label: 'Library Fees' },
    { value: 'laboratory', label: 'Laboratory Fees' },
    { value: 'examination', label: 'Examination Fees' },
    { value: 'registration', label: 'Registration Fees' },
    { value: 'other', label: 'Other Fees' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const paymentMethodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'remita', label: 'Remita' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'other', label: 'Other' },
  ];

  const academicYearOptions = [
    { value: '', label: 'All Years' },
    { value: '2023', label: '2023/2024' },
    { value: '2024', label: '2024/2025' },
    { value: '2025', label: '2025/2026' },
  ];

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Payment Type</InputLabel>
            <Select
              value={filters.paymentType || ''}
              label="Payment Type"
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
            >
              {paymentTypeOptions.map((option) => (
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
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={filters.paymentMethod || ''}
              label="Payment Method"
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            >
              {paymentMethodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={filters.academicYear || ''}
              label="Academic Year"
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
            >
              {academicYearOptions.map((option) => (
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
          
          {filters.paymentType && (
            <Chip
              label={`Type: ${paymentTypeOptions.find(t => t.value === filters.paymentType)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('paymentType', '')}
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
          
          {filters.paymentMethod && (
            <Chip
              label={`Method: ${paymentMethodOptions.find(m => m.value === filters.paymentMethod)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('paymentMethod', '')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.academicYear && (
            <Chip
              label={`Year: ${academicYearOptions.find(y => y.value === filters.academicYear)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('academicYear', '')}
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

export default PaymentFilters;
