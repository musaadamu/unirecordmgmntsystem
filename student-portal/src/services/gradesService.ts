import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';

export interface Grade {
  _id: string;
  student: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
    credits: number;
    department: string;
    instructor: {
      name: string;
      email: string;
    };
  };
  semester: string;
  academicYear: string;
  assessments: Array<{
    _id: string;
    name: string;
    type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
    earnedPoints: number;
    maxPoints: number;
    percentage: number;
    weight: number;
    submittedAt?: string;
    gradedAt: string;
    feedback?: string;
    rubric?: Array<{
      criteria: string;
      points: number;
      maxPoints: number;
      feedback?: string;
    }>;
  }>;
  finalGrade: {
    letterGrade: string;
    gradePoints: number;
    percentage: number;
    status: 'in_progress' | 'completed' | 'incomplete' | 'withdrawn';
  };
  attendance: {
    present: number;
    absent: number;
    excused: number;
    total: number;
    percentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptRecord {
  _id: string;
  course: {
    courseCode: string;
    courseName: string;
    credits: number;
    department: string;
  };
  semester: string;
  academicYear: string;
  letterGrade: string;
  gradePoints: number;
  qualityPoints: number;
  status: 'completed' | 'in_progress' | 'withdrawn' | 'incomplete';
}

export interface GPACalculation {
  current: {
    semester: string;
    academicYear: string;
    gpa: number;
    credits: number;
    qualityPoints: number;
  };
  cumulative: {
    gpa: number;
    totalCredits: number;
    totalQualityPoints: number;
    completedCredits: number;
  };
  byLevel: Array<{
    level: string;
    gpa: number;
    credits: number;
    qualityPoints: number;
  }>;
  trend: Array<{
    semester: string;
    academicYear: string;
    gpa: number;
    credits: number;
  }>;
}

export interface AcademicStanding {
  current: 'excellent' | 'good' | 'satisfactory' | 'probation' | 'suspension';
  requirements: {
    minimumGPA: number;
    minimumCredits: number;
    maxConsecutiveProbation: number;
  };
  warnings: Array<{
    type: 'gpa_warning' | 'credit_warning' | 'probation_warning';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: Array<{
    type: 'academic_support' | 'course_selection' | 'study_skills';
    title: string;
    description: string;
    actionUrl?: string;
  }>;
}

export interface PerformanceAnalytics {
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    averageGPA: number;
    coursesCompleted: number;
    credits: number;
  }>;
  semesterComparison: Array<{
    semester: string;
    academicYear: string;
    gpa: number;
    credits: number;
    coursesCompleted: number;
  }>;
  improvementAreas: Array<{
    area: string;
    currentPerformance: number;
    targetPerformance: number;
    suggestions: string[];
  }>;
  strengths: Array<{
    area: string;
    performance: number;
    description: string;
  }>;
}

export interface GradeFilters {
  semester?: string;
  academicYear?: string;
  department?: string;
  courseCode?: string;
  status?: string;
  minGPA?: number;
  maxGPA?: number;
  sortBy?: 'courseCode' | 'courseName' | 'grade' | 'credits' | 'semester';
  sortOrder?: 'asc' | 'desc';
}

export interface TranscriptRequest {
  type: 'official' | 'unofficial';
  format: 'pdf' | 'digital';
  purpose: string;
  recipientEmail?: string;
  deliveryMethod: 'email' | 'pickup' | 'mail';
  mailingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export const gradesService = {
  // Get student grades
  getGrades: async (filters: GradeFilters = {}): Promise<Grade[]> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ grades: Grade[] }>>(
      `/student/grades${queryString}`
    );
    return response.data.data.grades;
  },

  // Get specific course grade
  getCourseGrade: async (courseId: string): Promise<Grade> => {
    const response = await apiClient.get<ApiResponse<{ grade: Grade }>>(
      `/student/grades/course/${courseId}`
    );
    return response.data.data.grade;
  },

  // Get transcript records
  getTranscript: async (filters: Partial<GradeFilters> = {}): Promise<TranscriptRecord[]> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ transcript: TranscriptRecord[] }>>(
      `/student/transcript${queryString}`
    );
    return response.data.data.transcript;
  },

  // Calculate GPA
  calculateGPA: async (semester?: string, academicYear?: string): Promise<GPACalculation> => {
    const queryString = buildQueryString({ semester, academicYear });
    const response = await apiClient.get<ApiResponse<GPACalculation>>(
      `/student/gpa${queryString}`
    );
    return response.data.data;
  },

  // Get academic standing
  getAcademicStanding: async (): Promise<AcademicStanding> => {
    const response = await apiClient.get<ApiResponse<AcademicStanding>>(
      '/student/academic-standing'
    );
    return response.data.data;
  },

  // Get performance analytics
  getPerformanceAnalytics: async (period: 'semester' | 'year' | 'all' = 'all'): Promise<PerformanceAnalytics> => {
    const queryString = buildQueryString({ period });
    const response = await apiClient.get<ApiResponse<PerformanceAnalytics>>(
      `/student/performance-analytics${queryString}`
    );
    return response.data.data;
  },

  // Request official transcript
  requestTranscript: async (request: TranscriptRequest): Promise<{ requestId: string; estimatedDelivery: string }> => {
    const response = await apiClient.post<ApiResponse<{ requestId: string; estimatedDelivery: string }>>(
      '/student/transcript/request',
      request
    );
    return response.data.data;
  },

  // Download unofficial transcript
  downloadUnofficialTranscript: async (format: 'pdf' | 'json' = 'pdf'): Promise<void> => {
    const response = await apiClient.get(`/student/transcript/download`, {
      params: { format },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get grade history for a specific course
  getCourseGradeHistory: async (courseCode: string): Promise<Array<{
    semester: string;
    academicYear: string;
    grade: string;
    gpa: number;
    credits: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{ history: any[] }>>(
      `/student/grades/course-history/${courseCode}`
    );
    return response.data.data.history;
  },

  // Get semester summary
  getSemesterSummary: async (semester: string, academicYear: string): Promise<{
    courses: number;
    credits: number;
    gpa: number;
    grades: Array<{ grade: string; count: number }>;
    attendance: number;
  }> => {
    const queryString = buildQueryString({ semester, academicYear });
    const response = await apiClient.get<ApiResponse<any>>(
      `/student/grades/semester-summary${queryString}`
    );
    return response.data.data;
  },

  // Get grade appeal information
  getGradeAppeals: async (): Promise<Array<{
    _id: string;
    course: string;
    originalGrade: string;
    requestedGrade: string;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    submittedAt: string;
    reviewedAt?: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{ appeals: any[] }>>(
      '/student/grade-appeals'
    );
    return response.data.data.appeals;
  },

  // Submit grade appeal
  submitGradeAppeal: async (appeal: {
    courseId: string;
    assessmentId?: string;
    reason: string;
    evidence?: string;
  }): Promise<{ appealId: string }> => {
    const response = await apiClient.post<ApiResponse<{ appealId: string }>>(
      '/student/grade-appeals',
      appeal
    );
    return response.data.data;
  },

  // Get degree audit
  getDegreeAudit: async (): Promise<{
    program: string;
    requirements: Array<{
      category: string;
      required: number;
      completed: number;
      remaining: number;
      courses: Array<{
        courseCode: string;
        courseName: string;
        credits: number;
        grade?: string;
        status: 'completed' | 'in_progress' | 'planned' | 'required';
      }>;
    }>;
    overallProgress: number;
    estimatedGraduation: string;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/student/degree-audit');
    return response.data.data;
  },
};

export default gradesService;
