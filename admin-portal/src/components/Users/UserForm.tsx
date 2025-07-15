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
  Divider,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { User, UserRole, UserStatus } from '@/types';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user?: User | null;
  loading?: boolean;
}

const userSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .when('isEdit', {
      is: false,
      then: (schema) => schema.required('Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  role: yup
    .string()
    .oneOf(['super_admin', 'admin', 'academic_staff', 'support_staff', 'student'])
    .required('Role is required'),
  personalInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    middleName: yup.string(),
    dateOfBirth: yup.string().required('Date of birth is required'),
    gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
    nationality: yup.string().required('Nationality is required'),
  }),
  contactInfo: yup.object({
    phone: yup.string().required('Phone number is required'),
    address: yup.object({
      street: yup.string().required('Street address is required'),
      city: yup.string().required('City is required'),
      state: yup.string().required('State is required'),
      zipCode: yup.string().required('ZIP code is required'),
      country: yup.string().required('Country is required'),
    }),
  }),
});

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  loading = false,
}) => {
  const isEdit = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(userSchema.shape({
      isEdit: yup.boolean().default(isEdit),
    })),
    defaultValues: {
      email: user?.email || '',
      password: '',
      role: user?.role || 'student',
      personalInfo: {
        firstName: user?.personalInfo?.firstName || '',
        lastName: user?.personalInfo?.lastName || '',
        middleName: user?.personalInfo?.middleName || '',
        dateOfBirth: user?.personalInfo?.dateOfBirth ? 
          new Date(user.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.personalInfo?.gender || 'male',
        nationality: user?.personalInfo?.nationality || '',
      },
      contactInfo: {
        phone: user?.contactInfo?.phone || '',
        address: {
          street: user?.contactInfo?.address?.street || '',
          city: user?.contactInfo?.address?.city || '',
          state: user?.contactInfo?.address?.state || '',
          zipCode: user?.contactInfo?.address?.zipCode || '',
          country: user?.contactInfo?.address?.country || '',
        },
      },
      isEdit,
    },
  });

  React.useEffect(() => {
    if (open && user) {
      reset({
        email: user.email,
        password: '',
        role: user.role,
        personalInfo: {
          firstName: user.personalInfo?.firstName || '',
          lastName: user.personalInfo?.lastName || '',
          middleName: user.personalInfo?.middleName || '',
          dateOfBirth: user.personalInfo?.dateOfBirth ? 
            new Date(user.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: user.personalInfo?.gender || 'male',
          nationality: user.personalInfo?.nationality || '',
        },
        contactInfo: {
          phone: user.contactInfo?.phone || '',
          address: {
            street: user.contactInfo?.address?.street || '',
            city: user.contactInfo?.address?.city || '',
            state: user.contactInfo?.address?.state || '',
            zipCode: user.contactInfo?.address?.zipCode || '',
            country: user.contactInfo?.address?.country || '',
          },
        },
        isEdit: true,
      });
    } else if (open && !user) {
      reset({
        email: '',
        password: '',
        role: 'student',
        personalInfo: {
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: '',
          gender: 'male',
          nationality: '',
        },
        contactInfo: {
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        },
        isEdit: false,
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = (data: any) => {
    const { isEdit, ...submitData } = data;
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'academic_staff', label: 'Academic Staff' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'admin', label: 'Administrator' },
    { value: 'super_admin', label: 'Super Administrator' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit User' : 'Create New User'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {/* Account Information */}
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Personal Information */}
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Controller
                name="personalInfo.firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    error={!!errors.personalInfo?.firstName}
                    helperText={errors.personalInfo?.firstName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="personalInfo.middleName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Middle Name (Optional)"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="personalInfo.lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={!!errors.personalInfo?.lastName}
                    helperText={errors.personalInfo?.lastName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="personalInfo.dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.personalInfo?.dateOfBirth}
                    helperText={errors.personalInfo?.dateOfBirth?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="personalInfo.gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.personalInfo?.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select {...field} label="Gender">
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="personalInfo.nationality"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nationality"
                    error={!!errors.personalInfo?.nationality}
                    helperText={errors.personalInfo?.nationality?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Contact Information */}
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactInfo.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.contactInfo?.phone}
                    helperText={errors.contactInfo?.phone?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="contactInfo.address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street Address"
                    error={!!errors.contactInfo?.address?.street}
                    helperText={errors.contactInfo?.address?.street?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactInfo.address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="City"
                    error={!!errors.contactInfo?.address?.city}
                    helperText={errors.contactInfo?.address?.city?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactInfo.address.state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="State/Province"
                    error={!!errors.contactInfo?.address?.state}
                    helperText={errors.contactInfo?.address?.state?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactInfo.address.zipCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ZIP/Postal Code"
                    error={!!errors.contactInfo?.address?.zipCode}
                    helperText={errors.contactInfo?.address?.zipCode?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactInfo.address.country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Country"
                    error={!!errors.contactInfo?.address?.country}
                    helperText={errors.contactInfo?.address?.country?.message}
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
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
