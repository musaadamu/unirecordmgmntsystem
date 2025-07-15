import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear any other stored data
        localStorage.removeItem('student-portal-auth');
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
