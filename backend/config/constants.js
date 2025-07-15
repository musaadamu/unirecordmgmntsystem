// User Roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ACADEMIC_STAFF: 'academic_staff',
  SUPPORT_STAFF: 'support_staff',
  STUDENT: 'student'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Academic Status
const ACADEMIC_STATUS = {
  ENROLLED: 'enrolled',
  GRADUATED: 'graduated',
  DROPPED: 'dropped',
  SUSPENDED: 'suspended',
  ON_LEAVE: 'on_leave'
};

// Course Status
const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

// Grade Types
const GRADE_TYPES = {
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  MIDTERM: 'midterm',
  FINAL: 'final',
  PROJECT: 'project',
  PARTICIPATION: 'participation'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Document Types
const DOCUMENT_TYPES = {
  TRANSCRIPT: 'transcript',
  CERTIFICATE: 'certificate',
  ID_CARD: 'id_card',
  MEDICAL_RECORD: 'medical_record',
  DISCIPLINARY_RECORD: 'disciplinary_record',
  OTHER: 'other'
};

// Semester Types
const SEMESTER_TYPES = {
  FALL: 'fall',
  SPRING: 'spring',
  SUMMER: 'summer'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  ACADEMIC_STATUS,
  COURSE_STATUS,
  GRADE_TYPES,
  PAYMENT_STATUS,
  DOCUMENT_TYPES,
  SEMESTER_TYPES,
  ATTENDANCE_STATUS
};
