import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
  LockReset,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import authService, { ForgotPasswordRequest } from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordRequest>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
    },
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotPasswordMutation.mutate(data);
  };

  const handleResendEmail = () => {
    const email = getValues('email');
    if (email) {
      forgotPasswordMutation.mutate({ email });
    }
  };

  if (emailSent) {
    return (
      <Box>
        {/* Header */}
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
            <Send sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've sent password reset instructions to your email address
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            If an account with email <strong>{getValues('email')}</strong> exists,
            you will receive password reset instructions shortly.
          </Typography>
        </Alert>

        <Box textAlign="center" mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Didn't receive the email? Check your spam folder or
          </Typography>
          <Button
            variant="text"
            onClick={handleResendEmail}
            disabled={forgotPasswordMutation.isPending}
          >
            Resend Email
          </Button>
        </Box>

        <Box textAlign="center">
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
          >
            <ArrowBack fontSize="small" />
            Back to Login
          </Link>
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
            bgcolor: 'warning.main',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LockReset sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Forgot Password?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your email address and we'll send you instructions to reset your password
        </Typography>
      </Box>

      {/* Forgot Password Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box mb={3}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                autoComplete="email"
                autoFocus
              />
            )}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={forgotPasswordMutation.isPending}
          startIcon={forgotPasswordMutation.isPending ? <LoadingSpinner size={20} /> : <Send />}
          sx={{ mb: 3, py: 1.5 }}
        >
          {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Instructions'}
        </Button>

        <Box textAlign="center">
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
          >
            <ArrowBack fontSize="small" />
            Back to Login
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
