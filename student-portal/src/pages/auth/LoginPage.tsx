import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import authService, { LoginCredentials } from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().default(false),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.personalInfo.firstName}!`);
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';

      if (error.response?.status === 401) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      } else if (error.response?.status === 403) {
        setError('email', { message: 'Account is inactive. Please contact administration.' });
      } else {
        toast.error(message);
      }
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <School sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Student Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to access your academic dashboard
        </Typography>
      </Box>

      {/* Login Form */}
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

        <Box mb={3}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
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
                autoComplete="current-password"
              />
            )}
          />
        </Box>

        <Box mb={3}>
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Remember me"
              />
            )}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loginMutation.isPending}
          startIcon={loginMutation.isPending ? <LoadingSpinner size={20} /> : <LoginIcon />}
          sx={{ mb: 3, py: 1.5 }}
        >
          {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
        </Button>

        <Box textAlign="center" mb={3}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            underline="hover"
          >
            Forgot your password?
          </Link>
        </Box>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Need help?
          </Typography>
        </Divider>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Demo Credentials:</strong><br />
            Email: student@university.edu<br />
            Password: password123
          </Typography>
        </Alert>

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Having trouble accessing your account?{' '}
            <Link href="mailto:support@university.edu" underline="hover">
              Contact Support
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
