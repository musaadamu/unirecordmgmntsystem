import React from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isLoading } = useAuthStore();

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
      {/* Main application content - routing is now handled by RouterProvider in main.tsx */}
      <div />
    </ErrorBoundary>
  );
}

export default App;
