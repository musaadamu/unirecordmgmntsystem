import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  VpnKey,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import authService, { ResetPasswordRequest } from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';

const resetPasswordSchema = yup.object({
  token: yup.string().required('Reset token is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordRequest>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setResetSuccess(true);
      toast.success('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';

      if (error.response?.status === 400) {
        setError('token', { message: 'Invalid or expired reset token' });
      } else {
        toast.error(message);
      }
    },
  });

  const onSubmit = (data: ResetPasswordRequest) => {
    resetPasswordMutation.mutate(data);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!token) {
    return (
      <Box>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'error.main',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Lock sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The password reset link is invalid or has expired
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please request a new password reset link from the login page.
          </Typography>
        </Alert>

        <Box textAlign="center">
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            sx={{ mr: 2 }}
          >
            Request New Link
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    );
  }

  if (resetSuccess) {
    return (
      <Box>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'success.main',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircle sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Password Reset Successful
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your password has been successfully reset
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You can now sign in with your new password. You will be redirected to the login page shortly.
          </Typography>
        </Alert>

        <Box textAlign="center">
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            size="large"
          >
            Continue to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2,
          }}
        >
          <VpnKey sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your new password below
        </Typography>
      </Box>

      {/* Reset Password Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="token"
          control={control}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />

        <Box mb={3}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="new-password"
                autoFocus
              />
            )}
          />
        </Box>

        <Box mb={3}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="new-password"
              />
            )}
          />
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Password must be at least 8 characters long and contain at least one uppercase letter,
            one lowercase letter, and one number.
          </Typography>
        </Alert>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={resetPasswordMutation.isPending}
          startIcon={resetPasswordMutation.isPending ? <LoadingSpinner size={20} /> : <VpnKey />}
          sx={{ mb: 3, py: 1.5 }}
        >
          {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
        </Button>

        <Box textAlign="center">
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            underline="hover"
          >
            Back to Login
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
