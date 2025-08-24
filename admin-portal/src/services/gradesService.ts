import { apiClient, buildQueryString } from './api';

export interface Grade {
  _id: string;
  student: string;
  course: string;
  assignment: string;
  grade: string;
  points: number;
  maxPoints: number;
}

export interface GradeStats {
  totalGrades: number;
  averageGPA: number;
  pendingGrades: number;
  honorStudents: number;
}

export interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CoursePerformance {
  course: string;
  averageGrade: number;
  students: number;
  passRate: number;
}

export const gradesService = {
  getGrades: async (): Promise<Grade[]> => {
    const response = await apiClient.get<{ grades: Grade[] }>('/grades');
    return response.data.grades;
  },
  getStats: async (): Promise<GradeStats> => {
    const response = await apiClient.get<{ stats: GradeStats }>('/grades/stats');
    return response.data.stats;
  },
  getDistribution: async (): Promise<GradeDistribution[]> => {
    const response = await apiClient.get<{ distribution: GradeDistribution[] }>('/grades/distribution');
    return response.data.distribution;
  },
  getCoursePerformance: async (): Promise<CoursePerformance[]> => {
    const response = await apiClient.get<{ performance: CoursePerformance[] }>('/grades/course-performance');
    return response.data.performance;
  },
};
