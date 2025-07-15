import { apiClient, buildQueryString, uploadFile } from './api';
import { ApiResponse, PaginatedResponse, Course, CourseFilters } from '@/types';

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageEnrollment: number;
  departmentStats: Array<{
    department: string;
    courseCount: number;
    enrollmentCount: number;
    averageGpa: number;
  }>;
  semesterStats: Array<{
    semester: string;
    academicYear: string;
    courseCount: number;
    enrollmentCount: number;
  }>;
}

export interface CourseOffering {
  _id: string;
  course: Course;
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  section: string;
  instructor: string;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    location: {
      building: string;
      room: string;
      campus: string;
    };
  }>;
  capacity: number;
  enrolledStudents: number;
  waitlistCount: number;
  status: 'active' | 'cancelled' | 'completed';
  isActive: boolean;
}

export interface BulkCourseResult {
  successful: Array<{
    courseCode: string;
    courseName: string;
    _id: string;
  }>;
  failed: Array<{
    courseCode: string;
    error: string;
  }>;
  total: number;
}

export const courseService = {
  // Get all courses with pagination and filtering
  getCourses: async (filters: CourseFilters & { page?: number; limit?: number }) => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<Course>>(`/courses${queryString}`);
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
    return response.data.data.course;
  },

  // Create new course
  createCourse: async (courseData: any): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<{ course: Course }>>('/courses', courseData);
    return response.data.data.course;
  },

  // Update course
  updateCourse: async (id: string, courseData: any): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, courseData);
    return response.data.data.course;
  },

  // Delete course
  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  // Search courses
  searchCourses: async (query: string, filters?: CourseFilters) => {
    const params = { search: query, ...filters };
    const queryString = buildQueryString(params);
    const response = await apiClient.get<PaginatedResponse<Course>>(`/courses/search${queryString}`);
    return response.data;
  },

  // Get course statistics
  getCourseStats: async (): Promise<CourseStats> => {
    const response = await apiClient.get<ApiResponse<CourseStats>>('/courses/stats');
    return response.data.data;
  },

  // Get course offerings
  getCourseOfferings: async (courseId?: string, filters?: any) => {
    const params = courseId ? { courseId, ...filters } : filters;
    const queryString = buildQueryString(params || {});
    const response = await apiClient.get<PaginatedResponse<CourseOffering>>(`/course-offerings${queryString}`);
    return response.data;
  },

  // Create course offering
  createCourseOffering: async (offeringData: any): Promise<CourseOffering> => {
    const response = await apiClient.post<ApiResponse<{ offering: CourseOffering }>>('/course-offerings', offeringData);
    return response.data.data.offering;
  },

  // Update course offering
  updateCourseOffering: async (id: string, offeringData: any): Promise<CourseOffering> => {
    const response = await apiClient.put<ApiResponse<{ offering: CourseOffering }>>(`/course-offerings/${id}`, offeringData);
    return response.data.data.offering;
  },

  // Delete course offering
  deleteCourseOffering: async (id: string): Promise<void> => {
    await apiClient.delete(`/course-offerings/${id}`);
  },

  // Bulk create courses
  bulkCreateCourses: async (courses: any[]): Promise<BulkCourseResult> => {
    const response = await apiClient.post<ApiResponse<BulkCourseResult>>('/admin/courses/bulk-create', {
      courses,
    });
    return response.data.data;
  },

  // Import courses from CSV
  importCoursesFromCSV: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<BulkCourseResult> => {
    const response = await uploadFile('/admin/courses/import-csv', file, onProgress);
    return response.data.data;
  },

  // Export courses to CSV
  exportCoursesToCSV: async (filters?: CourseFilters): Promise<void> => {
    const queryString = buildQueryString({ ...filters, format: 'csv' });
    const response = await apiClient.get(`/admin/courses/export${queryString}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courses_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get course prerequisites
  getCoursePrerequisites: async (courseId: string) => {
    const response = await apiClient.get<ApiResponse<{ prerequisites: Course[] }>>(
      `/courses/${courseId}/prerequisites`
    );
    return response.data.data.prerequisites;
  },

  // Update course prerequisites
  updateCoursePrerequisites: async (courseId: string, prerequisiteIds: string[]) => {
    const response = await apiClient.put<ApiResponse<{ prerequisites: Course[] }>>(
      `/courses/${courseId}/prerequisites`,
      { prerequisiteIds }
    );
    return response.data.data.prerequisites;
  },

  // Get course schedule conflicts
  getScheduleConflicts: async (offeringData: any) => {
    const response = await apiClient.post<ApiResponse<{ conflicts: any[] }>>(
      '/course-offerings/check-conflicts',
      offeringData
    );
    return response.data.data.conflicts;
  },

  // Get available instructors
  getAvailableInstructors: async (schedule: any) => {
    const response = await apiClient.post<ApiResponse<{ instructors: any[] }>>(
      '/course-offerings/available-instructors',
      { schedule }
    );
    return response.data.data.instructors;
  },

  // Get course enrollment history
  getCourseEnrollmentHistory: async (courseId: string, academicYear?: string) => {
    const queryString = buildQueryString({ academicYear });
    const response = await apiClient.get<ApiResponse<{ history: any[] }>>(
      `/courses/${courseId}/enrollment-history${queryString}`
    );
    return response.data.data.history;
  },

  // Clone course
  cloneCourse: async (courseId: string, newCourseData: any): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<{ course: Course }>>(
      `/courses/${courseId}/clone`,
      newCourseData
    );
    return response.data.data.course;
  },

  // Archive course
  archiveCourse: async (courseId: string): Promise<void> => {
    await apiClient.put(`/courses/${courseId}/archive`);
  },

  // Restore archived course
  restoreCourse: async (courseId: string): Promise<void> => {
    await apiClient.put(`/courses/${courseId}/restore`);
  },
};

export default courseService;
