import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';

export interface DashboardStats {
  academic: {
    currentGPA: number;
    totalCredits: number;
    completedCredits: number;
    remainingCredits: number;
    currentCourses: number;
    completedCourses: number;
    semesterGPA: number;
    academicStanding: 'excellent' | 'good' | 'satisfactory' | 'probation';
  };
  financial: {
    totalFees: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    nextPaymentDue: string;
    paymentStatus: 'current' | 'overdue' | 'partial';
  };
  attendance: {
    overallRate: number;
    presentDays: number;
    absentDays: number;
    totalDays: number;
    thisWeekRate: number;
    thisMonthRate: number;
  };
  courses: {
    enrolled: number;
    inProgress: number;
    completed: number;
    dropped: number;
  };
}

export interface UpcomingClass {
  _id: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
    instructor: {
      name: string;
      email: string;
    };
  };
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'exam';
  startTime: string;
  endTime: string;
  location: {
    building: string;
    room: string;
    campus: string;
  };
  date: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface RecentGrade {
  _id: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
  };
  assessment: {
    name: string;
    type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project';
    earnedPoints: number;
    maxPoints: number;
    percentage: number;
  };
  letterGrade: string;
  gradePoints: number;
  submittedAt: string;
  gradedAt: string;
}

export interface Assignment {
  _id: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
  };
  title: string;
  description: string;
  type: 'assignment' | 'quiz' | 'project' | 'essay' | 'presentation';
  dueDate: string;
  maxPoints: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submissionStatus: 'not_submitted' | 'submitted' | 'late_submitted';
  priority: 'low' | 'medium' | 'high';
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'administrative' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  author: {
    name: string;
    role: string;
  };
  targetAudience: string[];
  expiresAt?: string;
  createdAt: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  enabled: boolean;
  category: 'academic' | 'financial' | 'administrative';
}

export interface AcademicProgress {
  currentSemester: {
    semester: string;
    academicYear: string;
    courses: Array<{
      course: {
        courseCode: string;
        courseName: string;
        credits: number;
      };
      currentGrade: string;
      attendance: number;
      progress: number;
    }>;
    gpa: number;
    totalCredits: number;
  };
  overallProgress: {
    completionPercentage: number;
    expectedGraduation: string;
    academicStanding: string;
    cumulativeGPA: number;
    totalCreditsEarned: number;
    totalCreditsRequired: number;
  };
  trends: Array<{
    semester: string;
    gpa: number;
    credits: number;
  }>;
}

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/student/dashboard/stats');
    return response.data.data;
  },

  // Get upcoming classes
  getUpcomingClasses: async (limit: number = 5): Promise<UpcomingClass[]> => {
    const queryString = buildQueryString({ limit });
    const response = await apiClient.get<ApiResponse<{ classes: UpcomingClass[] }>>(
      `/student/dashboard/upcoming-classes${queryString}`
    );
    return response.data.data.classes;
  },

  // Get recent grades
  getRecentGrades: async (limit: number = 5): Promise<RecentGrade[]> => {
    const queryString = buildQueryString({ limit });
    const response = await apiClient.get<ApiResponse<{ grades: RecentGrade[] }>>(
      `/student/dashboard/recent-grades${queryString}`
    );
    return response.data.data.grades;
  },

  // Get pending assignments
  getPendingAssignments: async (limit: number = 5): Promise<Assignment[]> => {
    const queryString = buildQueryString({ limit, status: 'pending' });
    const response = await apiClient.get<ApiResponse<{ assignments: Assignment[] }>>(
      `/student/dashboard/assignments${queryString}`
    );
    return response.data.data.assignments;
  },

  // Get announcements
  getAnnouncements: async (limit: number = 5): Promise<Announcement[]> => {
    const queryString = buildQueryString({ limit });
    const response = await apiClient.get<ApiResponse<{ announcements: Announcement[] }>>(
      `/student/dashboard/announcements${queryString}`
    );
    return response.data.data.announcements;
  },

  // Get quick actions
  getQuickActions: async (): Promise<QuickAction[]> => {
    const response = await apiClient.get<ApiResponse<{ actions: QuickAction[] }>>(
      '/student/dashboard/quick-actions'
    );
    return response.data.data.actions;
  },

  // Get academic progress
  getAcademicProgress: async (): Promise<AcademicProgress> => {
    const response = await apiClient.get<ApiResponse<AcademicProgress>>('/student/dashboard/academic-progress');
    return response.data.data;
  },

  // Mark announcement as read
  markAnnouncementAsRead: async (announcementId: string): Promise<void> => {
    await apiClient.post(`/student/dashboard/announcements/${announcementId}/read`);
  },

  // Get calendar events
  getCalendarEvents: async (startDate?: string, endDate?: string) => {
    const queryString = buildQueryString({ startDate, endDate });
    const response = await apiClient.get<ApiResponse<any>>(`/student/dashboard/calendar${queryString}`);
    return response.data.data;
  },

  // Get performance analytics
  getPerformanceAnalytics: async (period: 'semester' | 'year' = 'semester') => {
    const queryString = buildQueryString({ period });
    const response = await apiClient.get<ApiResponse<any>>(`/student/dashboard/analytics${queryString}`);
    return response.data.data;
  },
};

export default dashboardService;
