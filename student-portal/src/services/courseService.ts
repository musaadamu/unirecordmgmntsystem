import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';

export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  level: string;
  semester: string;
  academicYear: string;
  prerequisites: Array<{
    courseCode: string;
    courseName: string;
  }>;
  instructor: {
    _id: string;
    name: string;
    email: string;
    title: string;
    department: string;
  };
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    type: 'lecture' | 'lab' | 'tutorial' | 'seminar';
    location: {
      building: string;
      room: string;
      campus: string;
    };
  }>;
  capacity: number;
  enrolled: number;
  waitlist: number;
  status: 'active' | 'inactive' | 'cancelled' | 'completed';
  enrollmentStatus: 'open' | 'closed' | 'waitlist' | 'restricted';
  syllabus?: string;
  materials: Array<{
    _id: string;
    title: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    size?: number;
    uploadedAt: string;
  }>;
  assessments: Array<{
    _id: string;
    name: string;
    type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project';
    weight: number;
    dueDate?: string;
    maxPoints: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EnrolledCourse extends Course {
  enrollment: {
    _id: string;
    enrolledAt: string;
    status: 'enrolled' | 'dropped' | 'completed' | 'failed';
    grade?: {
      letterGrade: string;
      gradePoints: number;
      percentage: number;
    };
    attendance: {
      present: number;
      absent: number;
      total: number;
      percentage: number;
    };
    progress: {
      completedAssignments: number;
      totalAssignments: number;
      percentage: number;
    };
  };
}

export interface CourseFilters {
  search?: string;
  department?: string;
  faculty?: string;
  level?: string;
  semester?: string;
  credits?: number;
  instructor?: string;
  enrollmentStatus?: string;
  hasPrerequisites?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'courseCode' | 'courseName' | 'credits' | 'enrolled' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface EnrollmentRequest {
  courseId: string;
  semester: string;
  academicYear: string;
}

export interface DropRequest {
  courseId: string;
  reason?: string;
}

export interface CourseMaterial {
  _id: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
  };
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'presentation' | 'audio';
  url: string;
  size?: number;
  category: 'lecture_notes' | 'assignments' | 'readings' | 'videos' | 'resources' | 'syllabus';
  week?: number;
  module?: string;
  isRequired: boolean;
  downloadCount: number;
  uploadedBy: {
    name: string;
    role: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

export interface CourseSchedule {
  _id: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
    instructor: string;
  };
  day: string;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'exam';
  location: {
    building: string;
    room: string;
    campus: string;
  };
  recurring: boolean;
  exceptions?: Array<{
    date: string;
    reason: string;
    alternativeLocation?: {
      building: string;
      room: string;
    };
  }>;
  semester: string;
  academicYear: string;
}

export const courseService = {
  // Get course catalog with filters
  getCourses: async (filters: CourseFilters = {}): Promise<{ courses: Course[]; total: number; page: number; totalPages: number }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ courses: Course[]; pagination: any }>>(
      `/student/courses/catalog${queryString}`
    );
    return {
      courses: response.data.data.courses,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  // Get enrolled courses
  getEnrolledCourses: async (semester?: string, academicYear?: string): Promise<EnrolledCourse[]> => {
    const queryString = buildQueryString({ semester, academicYear });
    const response = await apiClient.get<ApiResponse<{ courses: EnrolledCourse[] }>>(
      `/student/courses/enrolled${queryString}`
    );
    return response.data.data.courses;
  },

  // Get course details
  getCourseDetails: async (courseId: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<{ course: Course }>>(
      `/student/courses/${courseId}`
    );
    return response.data.data.course;
  },

  // Enroll in course
  enrollInCourse: async (enrollmentData: EnrollmentRequest): Promise<void> => {
    await apiClient.post('/student/courses/enroll', enrollmentData);
  },

  // Drop course
  dropCourse: async (dropData: DropRequest): Promise<void> => {
    await apiClient.post('/student/courses/drop', dropData);
  },

  // Get course materials
  getCourseMaterials: async (courseId: string, category?: string): Promise<CourseMaterial[]> => {
    const queryString = buildQueryString({ category });
    const response = await apiClient.get<ApiResponse<{ materials: CourseMaterial[] }>>(
      `/student/courses/${courseId}/materials${queryString}`
    );
    return response.data.data.materials;
  },

  // Download course material
  downloadMaterial: async (materialId: string): Promise<void> => {
    const response = await apiClient.get(`/student/courses/materials/${materialId}/download`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get course schedule
  getCourseSchedule: async (semester?: string, academicYear?: string): Promise<CourseSchedule[]> => {
    const queryString = buildQueryString({ semester, academicYear });
    const response = await apiClient.get<ApiResponse<{ schedule: CourseSchedule[] }>>(
      `/student/courses/schedule${queryString}`
    );
    return response.data.data.schedule;
  },

  // Get departments
  getDepartments: async (): Promise<Array<{ _id: string; name: string; faculty: string }>> => {
    const response = await apiClient.get<ApiResponse<{ departments: any[] }>>(
      '/student/courses/departments'
    );
    return response.data.data.departments;
  },

  // Get faculties
  getFaculties: async (): Promise<Array<{ _id: string; name: string }>> => {
    const response = await apiClient.get<ApiResponse<{ faculties: any[] }>>(
      '/student/courses/faculties'
    );
    return response.data.data.faculties;
  },

  // Check prerequisites
  checkPrerequisites: async (courseId: string): Promise<{ eligible: boolean; missingPrerequisites: string[] }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/student/courses/${courseId}/prerequisites`
    );
    return response.data.data;
  },

  // Get enrollment history
  getEnrollmentHistory: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<{ history: any[] }>>(
      '/student/courses/enrollment-history'
    );
    return response.data.data.history;
  },

  // Search courses
  searchCourses: async (query: string, filters: Partial<CourseFilters> = {}): Promise<Course[]> => {
    const searchFilters = { ...filters, search: query, limit: 20 };
    const queryString = buildQueryString(searchFilters);
    const response = await apiClient.get<ApiResponse<{ courses: Course[] }>>(
      `/student/courses/search${queryString}`
    );
    return response.data.data.courses;
  },
};

export default courseService;
