import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    if (import.meta.env.PROD) {
      // TODO: Send error to monitoring service
      console.error('Production error:', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Box textAlign="center" mb={3}>
                <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </Typography>
              </Box>

              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  Error: {this.state.error?.message}
                </Typography>
              </Alert>

              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
              </Box>

              {import.meta.env.DEV && this.state.errorInfo && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Error Details (Development)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      maxHeight: 300,
                    }}
                  >
                    {this.state.error?.stack}
                    {this.state.errorInfo.componentStack}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
