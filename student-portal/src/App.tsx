import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout Components
import Layout from '@/components/Layout/Layout';
import AuthLayout from '@/components/Layout/AuthLayout';

// Auth Components
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Protected Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CoursesPage from '@/pages/courses/CoursesPage';
import GradesPage from '@/pages/grades/GradesPage';
import PaymentsPage from '@/pages/payments/PaymentsPage';
import SchedulePage from '@/pages/schedule/SchedulePage';
import ProfilePage from '@/pages/profile/ProfilePage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';

// Utility Components
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Hooks
import { useAuthStore } from '@/stores/authStore';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <LoadingSpinner message="Loading application..." />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/grades" element={<GradesPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
