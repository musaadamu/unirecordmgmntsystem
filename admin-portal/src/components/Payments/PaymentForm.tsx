import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AttachMoney, Person, CalendarToday } from '@mui/icons-material';

import { Payment } from '@/types';

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  payment?: Payment | null;
  loading?: boolean;
}

const paymentSchema = yup.object({
  studentId: yup.string().required('Student is required'),
  paymentType: yup
    .string()
    .oneOf(['tuition', 'accommodation', 'library', 'laboratory', 'examination', 'registration', 'other'])
    .required('Payment type is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  currency: yup.string().default('NGN'),
  semester: yup
    .string()
    .oneOf(['fall', 'spring', 'summer'])
    .required('Semester is required'),
  academicYear: yup.string().required('Academic year is required'),
  description: yup.string().required('Description is required'),
  dueDate: yup.string().required('Due date is required'),
});

const PaymentForm: React.FC<PaymentFormProps> = ({
  open,
  onClose,
  onSubmit,
  payment,
  loading = false,
}) => {
  const isEdit = !!payment;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      studentId: payment?.studentId || '',
      paymentType: payment?.paymentType || 'tuition',
      amount: payment?.amount || 0,
      currency: payment?.currency || 'NGN',
      semester: payment?.semester || 'fall',
      academicYear: payment?.academicYear || new Date().getFullYear().toString(),
      description: payment?.description || '',
      dueDate: payment?.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
    },
  });

  React.useEffect(() => {
    if (open && payment) {
      reset({
        studentId: payment.studentId,
        paymentType: payment.paymentType,
        amount: payment.amount,
        currency: payment.currency,
        semester: payment.semester,
        academicYear: payment.academicYear,
        description: payment.description,
        dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      });
    } else if (open && !payment) {
      reset({
        studentId: '',
        paymentType: 'tuition',
        amount: 0,
        currency: 'NGN',
        semester: 'fall',
        academicYear: new Date().getFullYear().toString(),
        description: '',
        dueDate: '',
      });
    }
  }, [open, payment, reset]);

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const paymentTypeOptions = [
    { value: 'tuition', label: 'Tuition Fees' },
    { value: 'accommodation', label: 'Accommodation Fees' },
    { value: 'library', label: 'Library Fees' },
    { value: 'laboratory', label: 'Laboratory Fees' },
    { value: 'examination', label: 'Examination Fees' },
    { value: 'registration', label: 'Registration Fees' },
    { value: 'other', label: 'Other Fees' },
  ];

  const semesterOptions = [
    { value: 'fall', label: 'Fall Semester' },
    { value: 'spring', label: 'Spring Semester' },
    { value: 'summer', label: 'Summer Semester' },
  ];

  const currencyOptions = [
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
  ];

  // Mock student options (in real app, this would come from an API)
  const studentOptions = [
    { id: 'S001', name: 'John Doe', email: 'john.doe@university.edu' },
    { id: 'S002', name: 'Jane Smith', email: 'jane.smith@university.edu' },
    { id: 'S003', name: 'Mike Johnson', email: 'mike.johnson@university.edu' },
    { id: 'S004', name: 'Sarah Wilson', email: 'sarah.wilson@university.edu' },
    { id: 'S005', name: 'David Brown', email: 'david.brown@university.edu' },
  ];

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push({ value: i.toString(), label: `${i}/${i + 1}` });
    }
    return years;
  };

  const watchedPaymentType = watch('paymentType');

  const getDefaultAmount = (paymentType: string) => {
    const defaultAmounts: Record<string, number> = {
      tuition: 150000,
      accommodation: 80000,
      library: 5000,
      laboratory: 15000,
      examination: 10000,
      registration: 25000,
      other: 0,
    };
    return defaultAmounts[paymentType] || 0;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Payment' : 'Create New Payment'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Student Selection */}
            <Grid item xs={12}>
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={studentOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.id})`}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    value={studentOptions.find(s => s.id === field.value) || null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Student"
                        error={!!errors.studentId}
                        helperText={errors.studentId?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <Person />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.id} • {option.email}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                )}
              />
            </Grid>

            {/* Payment Type and Amount */}
            <Grid item xs={12} md={6}>
              <Controller
                name="paymentType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.paymentType}>
                    <InputLabel>Payment Type</InputLabel>
                    <Select {...field} label="Payment Type">
                      {paymentTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Amount"
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message || `Suggested: ₦${getDefaultAmount(watchedPaymentType).toLocaleString()}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Currency and Description */}
            <Grid item xs={12} md={4}>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select {...field} label="Currency">
                      {currencyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* Semester and Academic Year */}
            <Grid item xs={12} md={6}>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.semester}>
                    <InputLabel>Semester</InputLabel>
                    <Select {...field} label="Semester">
                      {semesterOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="academicYear"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.academicYear}>
                    <InputLabel>Academic Year</InputLabel>
                    <Select {...field} label="Academic Year">
                      {generateAcademicYears().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Due Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dueDate}
                    helperText={errors.dueDate?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Payment' : 'Create Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;
