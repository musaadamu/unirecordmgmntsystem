exports.getUserAnalytics = (req, res) => {
  // Sample user analytics data
  const data = {
    totalUsers: 1200,
    activeUsers: 900,
    newUsers: 50,
    period: req.query.period || 'month',
  };
  res.status(200).json({ success: true, message: 'User analytics data', data });
};

exports.getEnrollmentTrends = (req, res) => {
  // Sample enrollment trends data
  const data = [
    { month: 'January', enrollments: 100 },
    { month: 'February', enrollments: 120 },
    { month: 'March', enrollments: 90 },
  ];
  res.status(200).json({ success: true, message: 'Enrollment trends data', data });
};

exports.getDepartmentStats = (req, res) => {
  // Sample department stats data
  const data = [
    { department: 'Computer Science', students: 300 },
    { department: 'Mathematics', students: 150 },
    { department: 'Physics', students: 100 },
  ];
  res.status(200).json({ success: true, message: 'Department stats data', data });
};

exports.getRecentActivities = (req, res) => {
  // Sample recent activities data
  const data = [
    {
      id: '1',
      type: 'enrollment',
      title: 'New Enrollment',
      description: 'Student John Doe enrolled in CS101',
      user: { name: 'Admin User', role: 'admin' },
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment of $500 received from Jane Smith',
      user: { name: 'Finance Staff', role: 'staff' },
      timestamp: new Date().toISOString(),
    },
  ];
  res.status(200).json({ success: true, message: 'Recent activities data', data });
};

exports.getPaymentAnalytics = (req, res) => {
  // Sample payment analytics data
  const data = {
    totalPayments: 50000,
    pendingPayments: 5000,
    period: req.query.period || 'month',
  };
  res.status(200).json({ success: true, message: 'Payment analytics data', data });
};

exports.getAcademicAnalytics = (req, res) => {
  // Sample academic analytics data
  const data = {
    averageGPA: 3.5,
    passRate: 0.9,
  };
  res.status(200).json({ success: true, message: 'Academic analytics data', data });
};

exports.getOverview = (req, res) => {
  // Sample dashboard overview data
  const data = {
    totalStudents: 1000,
    totalCourses: 50,
    totalPayments: 60000,
  };
  res.status(200).json({ success: true, message: 'Dashboard overview data', data });
};

// Student Dashboard Functions
exports.getStudentDashboardStats = (req, res) => {
  // Mock student dashboard stats
  const data = {
    academic: {
      currentGPA: 3.7,
      totalCredits: 120,
      completedCredits: 90,
      remainingCredits: 30,
      currentCourses: 5,
      completedCourses: 18,
      semesterGPA: 3.8,
      academicStanding: 'excellent'
    },
    financial: {
      totalFees: 50000,
      paidAmount: 45000,
      pendingAmount: 5000,
      overdueAmount: 0,
      nextPaymentDue: '2024-02-15',
      paymentStatus: 'current'
    },
    attendance: {
      overallRate: 95,
      presentDays: 95,
      absentDays: 5,
      totalDays: 100,
      thisWeekRate: 100,
      thisMonthRate: 96
    },
    courses: {
      enrolled: 5,
      inProgress: 5,
      completed: 18,
      dropped: 0
    }
  };
  res.status(200).json({ success: true, message: 'Student dashboard stats', data });
};

exports.getUpcomingClasses = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  // Mock upcoming classes
  const classes = [
    {
      _id: '1',
      course: {
        _id: 'c1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        instructor: {
          name: 'Dr. John Smith',
          email: 'john.smith@university.edu'
        }
      },
      type: 'lecture',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:30:00Z',
      location: {
        building: 'Tech Building',
        room: '101',
        campus: 'Main Campus'
      },
      date: '2024-01-15T00:00:00Z',
      status: 'scheduled'
    },
    {
      _id: '2',
      course: {
        _id: 'c2',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        instructor: {
          name: 'Prof. Jane Doe',
          email: 'jane.doe@university.edu'
        }
      },
      type: 'tutorial',
      startTime: '2024-01-16T14:00:00Z',
      endTime: '2024-01-16T15:30:00Z',
      location: {
        building: 'Math Building',
        room: '205',
        campus: 'Main Campus'
      },
      date: '2024-01-16T00:00:00Z',
      status: 'scheduled'
    }
  ].slice(0, limit);

  res.status(200).json({ success: true, message: 'Upcoming classes', data: { classes } });
};

exports.getRecentGrades = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  // Mock recent grades
  const grades = [
    {
      _id: 'g1',
      course: {
        _id: 'c1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science'
      },
      assessment: {
        name: 'Midterm Exam',
        type: 'midterm',
        earnedPoints: 85,
        maxPoints: 100,
        percentage: 85
      },
      letterGrade: 'A',
      gradePoints: 4.0,
      submittedAt: '2024-01-10T10:00:00Z',
      gradedAt: '2024-01-12T14:00:00Z'
    },
    {
      _id: 'g2',
      course: {
        _id: 'c2',
        courseCode: 'MATH201',
        courseName: 'Calculus II'
      },
      assessment: {
        name: 'Assignment 3',
        type: 'assignment',
        earnedPoints: 92,
        maxPoints: 100,
        percentage: 92
      },
      letterGrade: 'A',
      gradePoints: 4.0,
      submittedAt: '2024-01-08T09:00:00Z',
      gradedAt: '2024-01-11T16:00:00Z'
    }
  ].slice(0, limit);

  res.status(200).json({ success: true, message: 'Recent grades', data: { grades } });
};

exports.getPendingAssignments = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const status = req.query.status || 'pending';
  // Mock pending assignments
  const assignments = [
    {
      _id: 'a1',
      course: {
        _id: 'c1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science'
      },
      title: 'Programming Assignment 4',
      description: 'Implement a sorting algorithm in Python',
      type: 'assignment',
      dueDate: '2024-01-20T23:59:00Z',
      maxPoints: 100,
      status: 'pending',
      submissionStatus: 'not_submitted',
      priority: 'high'
    },
    {
      _id: 'a2',
      course: {
        _id: 'c2',
        courseCode: 'MATH201',
        courseName: 'Calculus II'
      },
      title: 'Integration Problems',
      description: 'Solve integration problems from chapter 5',
      type: 'assignment',
      dueDate: '2024-01-18T23:59:00Z',
      maxPoints: 50,
      status: 'pending',
      submissionStatus: 'not_submitted',
      priority: 'medium'
    }
  ].filter(a => a.status === status).slice(0, limit);

  res.status(200).json({ success: true, message: 'Pending assignments', data: { assignments } });
};
