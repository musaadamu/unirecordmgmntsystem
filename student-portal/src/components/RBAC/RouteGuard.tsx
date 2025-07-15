import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Alert, Typography, Button } from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';

import { useAuthStore } from '@/stores/authStore';
import { useRBACStore } from '@/stores/rbacStore';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  resource?: string;
  action?: string;
  requireAll?: boolean;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * RouteGuard Component
 * 
 * Protects routes based on user permissions and roles
 * 
 * @param children - Content to render if user has access
 * @param permission - Single permission required
 * @param permissions - Array of permissions (user needs ANY by default)
 * @param role - Single role required
 * @param roles - Array of roles (user needs ANY by default)
 * @param resource - Resource name for resource:action permission check
 * @param action - Action name for resource:action permission check
 * @param requireAll - If true, user must have ALL permissions/roles
 * @param redirectTo - Custom redirect path (defaults to /unauthorized)
 * @param showAccessDenied - Show access denied page instead of redirecting
 */
const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  resource,
  action,
  requireAll = false,
  redirectTo = '/unauthorized',
  showAccessDenied = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
    userPermissions,
  } = useRBACStore();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Checking access..." />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Wait for user permissions to load
  if (!userPermissions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading permissions..." />
      </Box>
    );
  }

  // Build permissions array
  const permissionsToCheck = [
    ...(permission ? [permission] : []),
    ...permissions,
    ...(resource && action ? [`${resource}:${action}`] : []),
  ];

  // Build roles array
  const rolesToCheck = [
    ...(role ? [role] : []),
    ...roles,
  ];

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissionsToCheck.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = hasAllPermissions(permissionsToCheck);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissionsToCheck);
    }
  }

  // Check roles
  let hasRequiredRoles = true;
  if (rolesToCheck.length > 0) {
    if (requireAll) {
      hasRequiredRoles = rolesToCheck.every(r => hasRole(r));
    } else {
      hasRequiredRoles = hasAnyRole(rolesToCheck);
    }
  }

  // Check resource access if specified
  let hasResourceAccess = true;
  if (resource && action) {
    hasResourceAccess = canAccessResource(resource, action);
  }

  // Final access check
  const hasAccess = hasRequiredPermissions && hasRequiredRoles && hasResourceAccess;

  if (!hasAccess) {
    if (showAccessDenied) {
      return <AccessDeniedPage />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Access Denied Page Component
const AccessDeniedPage: React.FC = () => {
  const location = useLocation();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
      p={4}
    >
      <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Access Denied
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        You don't have permission to access this page
      </Typography>
      
      <Alert severity="warning" sx={{ mt: 2, mb: 3, maxWidth: 500 }}>
        <Typography variant="body2">
          You need additional permissions to view this content. Please contact your administrator 
          if you believe you should have access to this page.
        </Typography>
      </Alert>
      
      <Box display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          Go Back
        </Button>
        
        <Button
          variant="contained"
          onClick={() => window.location.href = '/dashboard'}
        >
          Go to Dashboard
        </Button>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        Attempted to access: {location.pathname}
      </Typography>
    </Box>
  );
};

export default RouteGuard;

// Higher-order component version
export const withRouteGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) => {
  return (props: P) => (
    <RouteGuard {...guardProps}>
      <Component {...props} />
    </RouteGuard>
  );
};

// Utility components for common route protections
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard roles={['super_admin', 'admin']} showAccessDenied>
    {children}
  </RouteGuard>
);

export const SystemAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard roles={['super_admin']} showAccessDenied>
    {children}
  </RouteGuard>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard roles={['super_admin', 'admin', 'staff']} showAccessDenied>
    {children}
  </RouteGuard>
);

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard roles={['student']} showAccessDenied>
    {children}
  </RouteGuard>
);

export { AccessDeniedPage };
