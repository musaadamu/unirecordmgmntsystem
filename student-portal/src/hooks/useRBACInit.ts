import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRBACStore } from '@/stores/rbacStore';
import rbacService from '@/services/rbacService';

/**
 * Hook to initialize RBAC system
 * 
 * This hook should be called at the app level to ensure
 * user permissions are loaded when the user is authenticated
 */
export const useRBACInit = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { userPermissions, setUserPermissions, clearPermissionCache } = useRBACStore();

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      // Check if permissions are already loaded and not expired
      if (userPermissions && userPermissions.cacheExpiry) {
        const expiryTime = new Date(userPermissions.cacheExpiry).getTime();
        const now = Date.now();
        
        if (now < expiryTime) {
          // Permissions are still valid
          return;
        }
      }

      try {
        // Clear expired cache
        clearPermissionCache();

        // Load fresh permissions from server
        const permissions = await rbacService.getUserPermissions(user._id);
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Failed to load user permissions:', error);
        
        // Fallback to basic permissions based on user role
        const fallbackPermissions = getFallbackPermissions(user);
        setUserPermissions(fallbackPermissions);
      }
    };

    loadUserPermissions();
  }, [isAuthenticated, user, userPermissions, setUserPermissions, clearPermissionCache]);

  // Set up periodic permission refresh
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Refresh permissions every 5 minutes
    const interval = setInterval(async () => {
      try {
        const permissions = await rbacService.getUserPermissions(user._id);
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Failed to refresh user permissions:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user, setUserPermissions]);
};

/**
 * Get fallback permissions based on user role
 * This is used when the RBAC service is unavailable
 */
const getFallbackPermissions = (user: any) => {
  const basePermissions = {
    userId: user._id,
    roles: [],
    permissions: [],
    effectivePermissions: [],
    lastUpdated: new Date().toISOString(),
    cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
  };

  // Define fallback permissions based on user role
  switch (user.role) {
    case 'student':
      return {
        ...basePermissions,
        roles: [
          {
            _id: 'student_role',
            name: 'Student',
            description: 'Standard student role',
            permissions: ['courses:read', 'grades:read', 'payments:read', 'support:create'],
            isSystemRole: true,
            isActive: true,
            category: 'academic' as const,
            level: 1,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        permissions: [
          {
            _id: 'courses:read',
            name: 'View Courses',
            resource: 'courses',
            action: 'read' as const,
            description: 'View course information',
            category: 'academic' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'grades:read',
            name: 'View Grades',
            resource: 'grades',
            action: 'read' as const,
            description: 'View grade information',
            category: 'academic' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'payments:read',
            name: 'View Payments',
            resource: 'payments',
            action: 'read' as const,
            description: 'View payment information',
            category: 'financial' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'support:create',
            name: 'Create Support Tickets',
            resource: 'support',
            action: 'create' as const,
            description: 'Create support tickets',
            category: 'communication' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        effectivePermissions: ['courses:read', 'grades:read', 'payments:read', 'support:create'],
      };

    case 'admin':
      return {
        ...basePermissions,
        roles: [
          {
            _id: 'admin_role',
            name: 'Administrator',
            description: 'System administrator role',
            permissions: ['*'],
            isSystemRole: true,
            isActive: true,
            category: 'system' as const,
            level: 10,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        permissions: [
          {
            _id: '*',
            name: 'All Permissions',
            resource: '*',
            action: 'manage' as const,
            description: 'Full system access',
            category: 'system' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        effectivePermissions: ['*'],
      };

    case 'staff':
      return {
        ...basePermissions,
        roles: [
          {
            _id: 'staff_role',
            name: 'Staff',
            description: 'General staff role',
            permissions: ['students:read', 'courses:read', 'grades:read', 'reports:read'],
            isSystemRole: true,
            isActive: true,
            category: 'administrative' as const,
            level: 5,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        permissions: [
          {
            _id: 'students:read',
            name: 'View Students',
            resource: 'students',
            action: 'read' as const,
            description: 'View student information',
            category: 'academic' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'courses:read',
            name: 'View Courses',
            resource: 'courses',
            action: 'read' as const,
            description: 'View course information',
            category: 'academic' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'grades:read',
            name: 'View Grades',
            resource: 'grades',
            action: 'read' as const,
            description: 'View grade information',
            category: 'academic' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'reports:read',
            name: 'View Reports',
            resource: 'reports',
            action: 'read' as const,
            description: 'View system reports',
            category: 'reporting' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        effectivePermissions: ['students:read', 'courses:read', 'grades:read', 'reports:read'],
      };

    default:
      // Guest or unknown role - minimal permissions
      return {
        ...basePermissions,
        roles: [],
        permissions: [],
        effectivePermissions: [],
      };
  }
};

export default useRBACInit;
