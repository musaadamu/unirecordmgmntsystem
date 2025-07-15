import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Permission,
  Role,
  UserRole,
  UserPermissions,
  PermissionCheck,
  PERMISSIONS,
} from '@/types/rbac';

interface RBACState {
  // Current user permissions
  userPermissions: UserPermissions | null;
  userRoles: Role[];
  effectivePermissions: string[];
  
  // Cache
  permissionsCache: Map<string, boolean>;
  cacheExpiry: number;
  
  // Loading states
  isLoadingPermissions: boolean;
  isLoadingRoles: boolean;
  
  // Actions
  setUserPermissions: (permissions: UserPermissions) => void;
  setUserRoles: (roles: Role[]) => void;
  clearUserPermissions: () => void;
  
  // Permission checking
  hasPermission: (permission: string, conditions?: Record<string, any>) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  
  // Cache management
  setCachedPermission: (key: string, hasPermission: boolean) => void;
  getCachedPermission: (key: string) => boolean | null;
  clearPermissionCache: () => void;
  
  // Utility functions
  canAccessResource: (resource: string, action: string) => boolean;
  getHighestRoleLevel: () => number;
  isSystemAdmin: () => boolean;
  isAdmin: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRBACStore = create<RBACState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userPermissions: null,
        userRoles: [],
        effectivePermissions: [],
        permissionsCache: new Map(),
        cacheExpiry: 0,
        isLoadingPermissions: false,
        isLoadingRoles: false,

        // Actions
        setUserPermissions: (permissions: UserPermissions) => {
          set({
            userPermissions: permissions,
            userRoles: permissions.roles,
            effectivePermissions: permissions.effectivePermissions,
            cacheExpiry: Date.now() + CACHE_DURATION,
          });
        },

        setUserRoles: (roles: Role[]) => {
          set({ userRoles: roles });
        },

        clearUserPermissions: () => {
          set({
            userPermissions: null,
            userRoles: [],
            effectivePermissions: [],
            permissionsCache: new Map(),
            cacheExpiry: 0,
          });
        },

        // Permission checking functions
        hasPermission: (permission: string, conditions?: Record<string, any>) => {
          const state = get();
          
          // Check cache first
          const cacheKey = `${permission}:${JSON.stringify(conditions || {})}`;
          const cached = state.getCachedPermission(cacheKey);
          if (cached !== null && Date.now() < state.cacheExpiry) {
            return cached;
          }

          // Check if user has the permission
          const hasPermission = state.effectivePermissions.includes(permission);
          
          // Cache the result
          state.setCachedPermission(cacheKey, hasPermission);
          
          return hasPermission;
        },

        hasAnyPermission: (permissions: string[]) => {
          const state = get();
          return permissions.some(permission => state.hasPermission(permission));
        },

        hasAllPermissions: (permissions: string[]) => {
          const state = get();
          return permissions.every(permission => state.hasPermission(permission));
        },

        hasRole: (roleName: string) => {
          const state = get();
          return state.userRoles.some(role => role.name === roleName || role._id === roleName);
        },

        hasAnyRole: (roleNames: string[]) => {
          const state = get();
          return roleNames.some(roleName => state.hasRole(roleName));
        },

        // Cache management
        setCachedPermission: (key: string, hasPermission: boolean) => {
          const state = get();
          const newCache = new Map(state.permissionsCache);
          newCache.set(key, hasPermission);
          set({ permissionsCache: newCache });
        },

        getCachedPermission: (key: string) => {
          const state = get();
          return state.permissionsCache.get(key) ?? null;
        },

        clearPermissionCache: () => {
          set({ permissionsCache: new Map(), cacheExpiry: 0 });
        },

        // Utility functions
        canAccessResource: (resource: string, action: string) => {
          const state = get();
          const permission = `${resource}:${action}`;
          return state.hasPermission(permission);
        },

        getHighestRoleLevel: () => {
          const state = get();
          return Math.max(...state.userRoles.map(role => role.level), 0);
        },

        isSystemAdmin: () => {
          const state = get();
          return state.hasPermission(PERMISSIONS.SYSTEM_ADMIN) || 
                 state.hasRole('super_admin') || 
                 state.hasRole('system_admin');
        },

        isAdmin: () => {
          const state = get();
          return state.hasPermission(PERMISSIONS.SYSTEM_ADMIN) || 
                 state.hasRole('super_admin') || 
                 state.hasRole('admin') ||
                 state.hasRole('system_admin');
        },
      }),
      {
        name: 'rbac-store',
        partialize: (state) => ({
          userPermissions: state.userPermissions,
          userRoles: state.userRoles,
          effectivePermissions: state.effectivePermissions,
          cacheExpiry: state.cacheExpiry,
        }),
      }
    ),
    {
      name: 'rbac-store',
    }
  )
);

// Selector hooks for better performance
export const useUserPermissions = () => useRBACStore(state => state.userPermissions);
export const useUserRoles = () => useRBACStore(state => state.userRoles);
export const useEffectivePermissions = () => useRBACStore(state => state.effectivePermissions);
export const useHasPermission = () => useRBACStore(state => state.hasPermission);
export const useHasAnyPermission = () => useRBACStore(state => state.hasAnyPermission);
export const useHasAllPermissions = () => useRBACStore(state => state.hasAllPermissions);
export const useHasRole = () => useRBACStore(state => state.hasRole);
export const useHasAnyRole = () => useRBACStore(state => state.hasAnyRole);
export const useCanAccessResource = () => useRBACStore(state => state.canAccessResource);
export const useIsSystemAdmin = () => useRBACStore(state => state.isSystemAdmin);
export const useIsAdmin = () => useRBACStore(state => state.isAdmin);

// Permission checking utilities
export const checkPermission = (permission: string, conditions?: Record<string, any>): boolean => {
  return useRBACStore.getState().hasPermission(permission, conditions);
};

export const checkAnyPermission = (permissions: string[]): boolean => {
  return useRBACStore.getState().hasAnyPermission(permissions);
};

export const checkAllPermissions = (permissions: string[]): boolean => {
  return useRBACStore.getState().hasAllPermissions(permissions);
};

export const checkRole = (roleName: string): boolean => {
  return useRBACStore.getState().hasRole(roleName);
};

export const checkAnyRole = (roleNames: string[]): boolean => {
  return useRBACStore.getState().hasAnyRole(roleNames);
};

export const canAccessResource = (resource: string, action: string): boolean => {
  return useRBACStore.getState().canAccessResource(resource, action);
};

export const isSystemAdmin = (): boolean => {
  return useRBACStore.getState().isSystemAdmin();
};

export const isAdmin = (): boolean => {
  return useRBACStore.getState().isAdmin();
};

// Permission constants for easy access
export { PERMISSIONS } from '@/types/rbac';
