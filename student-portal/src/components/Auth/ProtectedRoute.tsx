import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Alert, Button, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import authService from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token, updateUser, logout, setLoading } = useAuthStore();
  const location = useLocation();

  // Fetch user profile if we have a token but no user data
  const { data: profileData, error: profileError, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: !!token && !user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
      setLoading(false);
    }
  }, [profileData, updateUser, setLoading]);

  useEffect(() => {
    if (profileError) {
      // If profile fetch fails, logout the user
      logout();
    }
  }, [profileError, logout]);

  // Show loading spinner while checking authentication or fetching profile
  if (isLoading || (token && !user && profileLoading)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <LoadingSpinner message="Loading your profile..." />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (user && user.status !== 'active') {
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'inactive':
          return 'Your account is currently inactive. Please contact the administration to activate your account.';
        case 'suspended':
          return 'Your account has been suspended. Please contact the administration for assistance.';
        case 'graduated':
          return 'Your account shows you have graduated. If this is incorrect, please contact the administration.';
        default:
          return `Your account status is ${status}. Please contact the administration for assistance.`;
      }
    };

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        p={3}
      >
        <Box textAlign="center" maxWidth={500}>
          <Typography variant="h4" gutterBottom color="error">
            Account Access Restricted
          </Typography>

          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            {getStatusMessage(user.status)}
          </Alert>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => logout()}
            >
              Logout
            </Button>
            <Button
              variant="outlined"
              href="mailto:support@university.edu"
            >
              Contact Support
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // If we have a token but still no user data and profile fetch failed
  if (token && !user && profileError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        p={3}
      >
        <Box textAlign="center" maxWidth={500}>
          <Typography variant="h4" gutterBottom color="error">
            Authentication Error
          </Typography>

          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            Unable to load your profile. Your session may have expired.
          </Alert>

          <Button
            variant="contained"
            onClick={() => logout()}
          >
            Login Again
          </Button>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
