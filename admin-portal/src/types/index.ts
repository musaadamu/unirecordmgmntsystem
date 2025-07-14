// User Types
export interface User {
  _id: string;
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'academic_staff' | 'support_staff' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
}

export interface ContactInfo {
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Student Types
export interface Student {
  _id: string;
  user: User;
  studentId: string;
  academicInfo: StudentAcademicInfo;
  academicStatus: AcademicStatus;
  enrollmentInfo: EnrollmentInfo;
  financialInfo: FinancialInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAcademicInfo {
  program: string;
  department: string;
  faculty: string;
  level: 'undergraduate' | 'graduate' | 'postgraduate';
  yearOfStudy: number;
  academicYear: string;
  expectedGraduation: string;
  advisor?: string;
}

export interface AcademicStatus {
  status: 'enrolled' | 'graduated' | 'withdrawn' | 'suspended' | 'on_leave';
  gpa: number;
  completedCredits: number;
  academicStanding: 'good_standing' | 'probation' | 'suspension' | 'honors';
}

export interface EnrollmentInfo {
  enrollmentDate: string;
  enrollmentType: 'full_time' | 'part_time';
  maxCreditsPerSemester: number;
}

export interface FinancialInfo {
  tuitionStatus: 'paid' | 'partial' | 'unpaid';
  outstandingBalance: number;
  scholarships: Scholarship[];
  financialAid: FinancialAid[];
}

export interface Scholarship {
  name: string;
  amount: number;
  academicYear: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface FinancialAid {
  type: string;
  amount: number;
  academicYear: string;
  status: 'approved' | 'pending' | 'denied';
}

// Course Types
export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  description: string;
  academicInfo: CourseAcademicInfo;
  courseContent: CourseContent;
  offerings: CourseOffering[];
  status: 'active' | 'inactive' | 'archived';
  maxEnrollment: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseAcademicInfo {
  department: string;
  faculty: string;
  level: 'undergraduate' | 'graduate' | 'postgraduate';
  credits: number;
  prerequisites: string[];
  corequisites: string[];
}

export interface CourseContent {
  learningOutcomes: string[];
  assessmentMethods: AssessmentMethod[];
  syllabus: string;
  textbooks: Textbook[];
}

export interface AssessmentMethod {
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
  weight: number;
  description: string;
}

export interface Textbook {
  title: string;
  author: string;
  isbn: string;
  edition: string;
  required: boolean;
}

export interface CourseOffering {
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  section: string;
  instructor: string;
  schedule: ClassSchedule[];
  capacity: number;
  enrolledStudents: number;
  isActive: boolean;
}

export interface ClassSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location: Location;
}

export interface Location {
  building: string;
  room: string;
  campus: string;
}

// Grade Types
export interface Grade {
  _id: string;
  student: Student;
  course: Course;
  instructor: string;
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  gradeInfo: GradeInfo;
  appeals: GradeAppeal[];
  modifications: GradeModification[];
  createdAt: string;
  updatedAt: string;
}

export interface GradeInfo {
  status: 'in_progress' | 'completed' | 'incomplete';
  assessments: Assessment[];
  finalGrade: FinalGrade;
  comments: string;
}

export interface Assessment {
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
  name: string;
  earnedPoints: number;
  maxPoints: number;
  weight: number;
  submissionDate: string;
  feedback: string;
}

export interface FinalGrade {
  numericGrade: number;
  letterGrade: string;
  gradePoints: number;
  credits: number;
  isComplete: boolean;
}

export interface GradeAppeal {
  _id: string;
  reason: string;
  description: string;
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  reviewedBy?: string;
  reviewDate?: string;
  decision?: string;
  finalGrade?: FinalGrade;
}

export interface GradeModification {
  originalGrade: FinalGrade;
  newGrade: FinalGrade;
  reason: string;
  modifiedBy: string;
  approvedBy: string;
  approvalDate: string;
}

// Enrollment Types
export interface Enrollment {
  _id: string;
  student: Student;
  course: Course;
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  section: string;
  enrollmentInfo: EnrollmentDetails;
  registrationInfo: RegistrationInfo;
  attendanceInfo: AttendanceInfo;
  paymentInfo: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentDetails {
  enrollmentType: 'regular' | 'late' | 'add_drop' | 'waitlist' | 'audit';
  status: 'enrolled' | 'dropped' | 'withdrawn' | 'completed' | 'failed' | 'audit';
  enrollmentDate: string;
  dropDate?: string;
  withdrawalDate?: string;
  completionDate?: string;
}

export interface RegistrationInfo {
  registeredBy: string;
  registrationMethod: 'online' | 'admin' | 'advisor';
  registrationDate: string;
  waitlistPosition?: number;
}

export interface AttendanceInfo {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export interface PaymentInfo {
  tuitionAmount: number;
  feesAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
}

// Payment Types
export interface Payment {
  _id: string;
  student: Student;
  paymentInfo: PaymentDetails;
  amountInfo: AmountInfo;
  statusInfo: StatusInfo;
  transactions: Transaction[];
  paymentPlan: PaymentPlan;
  refunds: Refund[];
  holds: Hold[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetails {
  paymentId: string;
  type: 'tuition' | 'fees' | 'housing' | 'meal_plan' | 'parking' | 'library' | 'other';
  description: string;
  academicYear: string;
  semester: 'fall' | 'spring' | 'summer';
}

export interface AmountInfo {
  originalAmount: number;
  discountAmount: number;
  scholarshipAmount: number;
  financialAidAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface StatusInfo {
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paymentDate?: string;
  lastPaymentDate?: string;
  isOverdue: boolean;
  overdueDate?: string;
}

export interface Transaction {
  transactionId: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'online';
  paymentDate: string;
  transactionStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  gatewayResponse: any;
  receiptNumber?: string;
  processedBy: string;
}

export interface PaymentPlan {
  isPaymentPlan: boolean;
  planType: 'monthly' | 'quarterly' | 'semester';
  numberOfInstallments: number;
  installmentAmount: number;
  setupFee: number;
  installments: Installment[];
}

export interface Installment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paidAmount?: number;
}

export interface Refund {
  refundId: string;
  amount: number;
  reason: string;
  refundMethod: string;
  refundStatus: 'pending' | 'completed' | 'failed';
  processedBy: string;
  approvedBy: string;
  refundDate: string;
}

export interface Hold {
  holdType: 'financial' | 'academic' | 'disciplinary' | 'administrative';
  reason: string;
  amount?: number;
  placedDate: string;
  placedBy: string;
  isActive: boolean;
  removedDate?: string;
  removedBy?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface UserForm {
  email: string;
  password?: string;
  role: UserRole;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
}

export interface StudentForm extends UserForm {
  academicInfo: StudentAcademicInfo;
  enrollmentInfo: EnrollmentInfo;
}

export interface CourseForm {
  courseCode: string;
  courseName: string;
  description: string;
  academicInfo: CourseAcademicInfo;
  courseContent: CourseContent;
  maxEnrollment: number;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  recentActivities: Activity[];
  userStats: UserStats[];
  enrollmentTrends: EnrollmentTrend[];
  financialSummary: FinancialSummary;
}

export interface Activity {
  id: string;
  type: 'user_created' | 'enrollment' | 'payment' | 'grade_posted' | 'course_created';
  description: string;
  timestamp: string;
  user: string;
}

export interface UserStats {
  role: UserRole;
  count: number;
  active: number;
  inactive: number;
}

export interface EnrollmentTrend {
  period: string;
  enrollments: number;
  completions: number;
  dropouts: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  outstandingPayments: number;
  paidPayments: number;
  overduePayments: number;
}

// Filter and Search Types
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
}

export interface StudentFilters {
  department?: string;
  program?: string;
  academicYear?: string;
  status?: string;
  search?: string;
}

export interface CourseFilters {
  department?: string;
  faculty?: string;
  level?: string;
  status?: string;
  semester?: string;
  academicYear?: string;
  search?: string;
}

export interface PaymentFilters {
  type?: string;
  status?: string;
  academicYear?: string;
  semester?: string;
  isOverdue?: boolean;
  search?: string;
}
