import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  Container,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError();
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error is handled by the store and displayed via error state
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      // TODO: Implement forgot password functionality
      toast.success('Password reset instructions sent to your email');
      setForgotPasswordMode(false);
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              color: 'white',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <School sx={{ fontSize: 40, mr: 1 }} />
              <AdminPanelSettings sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              University Admin Portal
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Record Management System
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            {!forgotPasswordMode ? (
              <>
                <Typography variant="h5" textAlign="center" mb={3} fontWeight="600">
                  Sign In to Your Account
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

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
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={togglePasswordVisibility}
                                edge="end"
                                aria-label="toggle password visibility"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 3 }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || isSubmitting}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                      },
                    }}
                  >
                    {isLoading || isSubmitting ? (
                      <LoadingSpinner size={24} message="" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box textAlign="center" mt={3}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setForgotPasswordMode(true)}
                      sx={{ textDecoration: 'none' }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Demo Credentials
                  </Typography>
                </Divider>

                <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Admin:</strong> admin@university.edu / admin123456
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Staff:</strong> staff@university.edu / staff123456
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h5" textAlign="center" mb={3} fontWeight="600">
                  Reset Your Password
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Typography>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  Send Reset Instructions
                </Button>

                <Box textAlign="center">
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setForgotPasswordMode(false)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Back to Sign In
                  </Link>
                </Box>
              </>
            )}
          </CardContent>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="white"
          textAlign="center"
          sx={{ mt: 3, opacity: 0.8 }}
        >
          © 2024 University Record Management System. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
