import React from 'react';
import { useRBACStore } from '@/stores/rbacStore';
import { Alert, Box, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  resource?: string;
  action?: string;
  requireAll?: boolean; // For multiple permissions/roles
  fallback?: React.ReactNode;
  showFallback?: boolean;
  conditions?: Record<string, any>;
}

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions and roles
 * 
 * @param children - Content to render if user has required permissions
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param role - Single role to check
 * @param roles - Array of roles to check
 * @param resource - Resource name for resource:action permission check
 * @param action - Action name for resource:action permission check
 * @param requireAll - If true, user must have ALL permissions/roles. If false, ANY will suffice
 * @param fallback - Custom fallback content when access is denied
 * @param showFallback - Whether to show fallback content or nothing
 * @param conditions - Additional conditions for permission checking
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  resource,
  action,
  requireAll = false,
  fallback,
  showFallback = false,
  conditions,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
  } = useRBACStore();

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

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert severity="warning" icon={<Lock />}>
        <Typography variant="body2">
          You don't have permission to access this content.
        </Typography>
      </Alert>
    );
  }

  return null;
};

export default PermissionGuard;

// Higher-order component version
export const withPermissionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) => {
  return (props: P) => (
    <PermissionGuard {...guardProps}>
      <Component {...props} />
    </PermissionGuard>
  );
};

// Hook for permission checking in components
export const usePermissionCheck = (
  permission?: string,
  permissions?: string[],
  role?: string,
  roles?: string[],
  resource?: string,
  action?: string,
  requireAll = false
) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
  } = useRBACStore();

  // Build permissions array
  const permissionsToCheck = [
    ...(permission ? [permission] : []),
    ...(permissions || []),
    ...(resource && action ? [`${resource}:${action}`] : []),
  ];

  // Build roles array
  const rolesToCheck = [
    ...(role ? [role] : []),
    ...(roles || []),
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

  return hasRequiredPermissions && hasRequiredRoles && hasResourceAccess;
};

// Utility components for common permission checks
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['super_admin', 'admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const SystemAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['super_admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const StaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['super_admin', 'admin', 'staff']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const AcademicStaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['academic_coordinator', 'registrar', 'instructor']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const FinanceStaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['finance_officer']} fallback={fallback}>
    {children}
  </PermissionGuard>
);
