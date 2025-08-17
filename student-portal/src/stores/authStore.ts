import { useRBACStore } from '@/stores/rbacStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  loadUserPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user: User, token: string) => {
        console.log('AuthStore login called with token:', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Load user permissions after login
        get().loadUserPermissions();
      },

      loadUserProfile: async () => {
        set({ isLoading: true });
        try {
          const userProfile = await import('@/services/authService').then(mod => mod.default.getProfile());
          set({ user: userProfile, isLoading: false, isAuthenticated: true });
          await get().loadUserPermissions();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear RBAC data
        const rbacStore = useRBACStore.getState();
        rbacStore.clearUserPermissions();
        // Clear any other stored data
        localStorage.removeItem('student-portal-auth');
      },

      loadUserPermissions: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // In a real app, this would make an API call
          // For now, we'll use mock data based on user role
          const rbacStore = useRBACStore.getState();

          // Mock user permissions based on role
          const mockUserPermissions = {
            userId: user._id,
            roles: [
              {
                _id: 'student_role',
                name: 'Student',
                description: 'Standard student role',
                permissions: ['courses:read', 'grades:read', 'payments:read'],
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
              }
            ],
            effectivePermissions: ['courses:read', 'grades:read', 'payments:read'],
            lastUpdated: new Date().toISOString(),
            cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          };

          rbacStore.setUserPermissions(mockUserPermissions);
        } catch (error) {
          console.error('Failed to load user permissions:', error);
          // Optionally, set an error state here if needed
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'student-portal-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('AuthStore rehydrated with token:', state?.token);
        // Set loading to false after rehydration
        if (state) {
          state.isLoading = false;

          // For demo purposes, if we have a token but no user, create a mock user
          if (state.token && !state.user) {
            const mockUser = {
              _id: '1',
              email: 'student@university.edu',
              role: 'student' as const,
              status: 'active' as const,
              personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Michael',
                dateOfBirth: '2000-05-15',
                gender: 'male' as const,
                nationality: 'Nigerian',
                profilePicture: '',
              },
              contactInfo: {
                phone: '+234-801-234-5678',
                alternatePhone: '+234-802-345-6789',
                address: {
                  street: '123 University Road',
                  city: 'Lagos',
                  state: 'Lagos State',
                  country: 'Nigeria',
                  postalCode: '100001',
                },
                emergencyContact: {
                  name: 'Jane Doe',
                  relationship: 'Mother',
                  phone: '+234-803-456-7890',
                },
              },
              academicInfo: {
                studentId: 'STU2024001',
                program: 'Bachelor of Science in Computer Science',
                department: 'Computer Science',
                faculty: 'Faculty of Science',
                level: '300 Level',
                admissionDate: '2022-09-01',
                expectedGraduationDate: '2026-07-31',
                currentSemester: 'Fall',
                academicYear: '2024',
                gpa: 3.75,
                totalCredits: 120,
                completedCredits: 75,
              },
              createdAt: '2022-09-01T00:00:00.000Z',
              updatedAt: new Date().toISOString(),
            };
            state.user = mockUser;
          }
        }
      },
    }
  )
);
