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
