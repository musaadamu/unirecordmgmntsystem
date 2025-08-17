import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit,
  Email,
  Phone,
  LocationOn,
  School,
  CalendarToday,
  Person,
  CameraAlt,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import authService, { UpdateProfileRequest } from '@/services/authService';

const profileSchema = yup.object({
  personalInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    middleName: yup.string(),
    phone: yup.string().required('Phone number is required'),
    alternatePhone: yup.string(),
  }),
  contactInfo: yup.object({
    address: yup.object({
      street: yup.string().required('Street address is required'),
      city: yup.string().required('City is required'),
      state: yup.string().required('State is required'),
      country: yup.string().required('Country is required'),
      postalCode: yup.string().required('Postal code is required'),
    }),
    emergencyContact: yup.object({
      name: yup.string().required('Emergency contact name is required'),
      relationship: yup.string().required('Relationship is required'),
      phone: yup.string().required('Emergency contact phone is required'),
    }),
  }),
});

const ProfilePage: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileRequest>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      personalInfo: {
        firstName: user?.personalInfo?.firstName || '',
        lastName: user?.personalInfo?.lastName || '',
        middleName: user?.personalInfo?.middleName || '',
      },
      contactInfo: {
        phone: user?.contactInfo?.phone || '',
        alternatePhone: user?.contactInfo?.alternatePhone || '',
        address: {
          street: user?.contactInfo?.address?.street || '',
          city: user?.contactInfo?.address?.city || '',
          state: user?.contactInfo?.address?.state || '',
          country: user?.contactInfo?.address?.country || '',
          postalCode: user?.contactInfo?.address?.postalCode || '',
        },
        emergencyContact: {
          name: user?.contactInfo?.emergencyContact?.name || '',
          relationship: user?.contactInfo?.emergencyContact?.relationship || '',
          phone: user?.contactInfo?.emergencyContact?.phone || '',
        },
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleEditProfile = () => {
    reset({
      personalInfo: {
        firstName: user?.personalInfo.firstName || '',
        lastName: user?.personalInfo.lastName || '',
        middleName: user?.personalInfo.middleName || '',
      },
      contactInfo: {
        phone: user?.contactInfo.phone || '',
        alternatePhone: user?.contactInfo.alternatePhone || '',
        address: {
          street: user?.contactInfo.address.street || '',
          city: user?.contactInfo.address.city || '',
          state: user?.contactInfo.address.state || '',
          country: user?.contactInfo.address.country || '',
          postalCode: user?.contactInfo.address.postalCode || '',
        },
        emergencyContact: {
          name: user?.contactInfo.emergencyContact.name || '',
          relationship: user?.contactInfo.emergencyContact.relationship || '',
          phone: user?.contactInfo.emergencyContact.phone || '',
        },
      },
    });
    setEditDialogOpen(true);
  };

  const onSubmit = (data: UpdateProfileRequest) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">
              Loading profile...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!user.personalInfo || !user.contactInfo || !user.academicInfo) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">
              Loading profile details...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-block" mb={2}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    fontSize: '2rem',
                  }}
                  src={user.personalInfo?.profilePicture}
                >
                  {user.personalInfo?.firstName?.[0]}{user.personalInfo?.lastName?.[0]}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  size="small"
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.personalInfo?.firstName} {user.personalInfo?.lastName}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.academicInfo?.studentId}
              </Typography>

              <Chip
                label={user.status}
                color={user.status === 'active' ? 'success' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                fullWidth
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Personal Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Personal Information
                  </Typography>
                  <List>
                    <ListItem>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Full Name"
                      secondary={`${user.personalInfo?.firstName || ''} ${user.personalInfo?.middleName || ''} ${user.personalInfo?.lastName || ''}`.trim()}
                    />
                    </ListItem>
                    <ListItem>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Email"
                      secondary={user.email || ''}
                    />
                    </ListItem>
                    <ListItem>
                      <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Phone"
                      secondary={user.contactInfo?.phone || ''}
                    />
                    </ListItem>
                    <ListItem>
                      <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Date of Birth"
                      secondary={user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toLocaleDateString() : ''}
                    />
                    </ListItem>
                    <ListItem>
                      <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Address"
                      secondary={`${user.contactInfo?.address?.street || ''}, ${user.contactInfo?.address?.city || ''}, ${user.contactInfo?.address?.state || ''}, ${user.contactInfo?.address?.country || ''}`}
                    />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Academic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Academic Information
                  </Typography>
                  <List>
                    <ListItem>
                      <School sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Program"
                      secondary={user.academicInfo?.program || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Department"
                      secondary={user.academicInfo?.department || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Faculty"
                      secondary={user.academicInfo?.faculty || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Level"
                      secondary={user.academicInfo?.level || ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="GPA"
                      secondary={user.academicInfo?.gpa ? user.academicInfo.gpa.toFixed(2) : ''}
                    />
                    </ListItem>
                    <ListItem>
                    <ListItemText
                      primary="Credits"
                      secondary={`${user.academicInfo?.completedCredits || 0} / ${user.academicInfo?.totalCredits || 0}`}
                    />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactInfo.alternatePhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Alternate Phone"
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactInfo.address.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      error={!!errors.contactInfo?.address?.state}
                      helperText={errors.contactInfo?.address?.state?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
