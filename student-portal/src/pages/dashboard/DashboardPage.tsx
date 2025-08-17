import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  School,
  Grade,
  Payment,
  TrendingUp,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import dashboardService from '@/services/dashboardService';
import StatCard from '@/components/Dashboard/StatCard';
import UpcomingClasses from '@/components/Dashboard/UpcomingClasses';
import RecentGrades from '@/components/Dashboard/RecentGrades';
import PendingAssignments from '@/components/Dashboard/PendingAssignments';
import QuickActions from '@/components/Dashboard/QuickActions';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Mock data for demonstration (in real app, these would come from API)
  const mockStats = {
    academic: {
      currentGPA: 3.75,
      totalCredits: 120,
      completedCredits: 75,
      remainingCredits: 45,
      currentCourses: 6,
      completedCourses: 25,
      semesterGPA: 3.82,
      academicStanding: 'excellent' as const,
    },
    financial: {
      totalFees: 450000,
      paidAmount: 300000,
      pendingAmount: 150000,
      overdueAmount: 0,
      nextPaymentDue: '2024-02-15',
      paymentStatus: 'current' as const,
    },
    attendance: {
      overallRate: 92,
      presentDays: 46,
      absentDays: 4,
      totalDays: 50,
      thisWeekRate: 100,
      thisMonthRate: 95,
    },
    courses: {
      enrolled: 6,
      inProgress: 6,
      completed: 25,
      dropped: 1,
    },
  };

  const mockUpcomingClasses = [
    {
      _id: '1',
      course: {
        _id: 'cs101',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        instructor: {
          name: 'Dr. Smith',
          email: 'smith@university.edu',
        },
      },
      type: 'lecture' as const,
      startTime: '2024-01-16T09:00:00Z',
      endTime: '2024-01-16T10:30:00Z',
      location: {
        building: 'Science Building',
        room: 'Room 201',
        campus: 'Main Campus',
      },
      date: '2024-01-16',
      status: 'scheduled' as const,
    },
    {
      _id: '2',
      course: {
        _id: 'math201',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        instructor: {
          name: 'Prof. Johnson',
          email: 'johnson@university.edu',
        },
      },
      type: 'tutorial' as const,
      startTime: '2024-01-16T14:00:00Z',
      endTime: '2024-01-16T15:30:00Z',
      location: {
        building: 'Mathematics Building',
        room: 'Room 105',
        campus: 'Main Campus',
      },
      date: '2024-01-16',
      status: 'scheduled' as const,
    },
  ];

  const mockRecentGrades = [
    {
      _id: '1',
      course: {
        _id: 'cs101',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      assessment: {
        name: 'Midterm Exam',
        type: 'midterm' as const,
        earnedPoints: 85,
        maxPoints: 100,
        percentage: 85,
      },
      letterGrade: 'B+',
      gradePoints: 3.3,
      submittedAt: '2024-01-10T10:00:00Z',
      gradedAt: '2024-01-12T15:30:00Z',
    },
    {
      _id: '2',
      course: {
        _id: 'math201',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
      },
      assessment: {
        name: 'Assignment 3',
        type: 'assignment' as const,
        earnedPoints: 92,
        maxPoints: 100,
        percentage: 92,
      },
      letterGrade: 'A-',
      gradePoints: 3.7,
      submittedAt: '2024-01-08T23:59:00Z',
      gradedAt: '2024-01-11T09:15:00Z',
    },
  ];

  const mockPendingAssignments = [
    {
      _id: '1',
      course: {
        _id: 'cs101',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      title: 'Programming Project 2',
      description: 'Implement a simple web application using HTML, CSS, and JavaScript',
      type: 'project' as const,
      dueDate: '2024-01-20T23:59:00Z',
      maxPoints: 100,
      status: 'pending' as const,
      submissionStatus: 'not_submitted' as const,
      priority: 'high' as const,
    },
    {
      _id: '2',
      course: {
        _id: 'eng101',
        courseCode: 'ENG101',
        courseName: 'English Composition',
      },
      title: 'Essay on Climate Change',
      description: 'Write a 1500-word essay on the impact of climate change on developing countries',
      type: 'essay' as const,
      dueDate: '2024-01-18T23:59:00Z',
      maxPoints: 50,
      status: 'pending' as const,
      submissionStatus: 'not_submitted' as const,
      priority: 'medium' as const,
    },
  ];

  // In a real app, these would be actual API calls
  const statsQuery = { data: mockStats, isLoading: false, error: null };
  const classesQuery = { data: mockUpcomingClasses, isLoading: false, error: null };
  const gradesQuery = { data: mockRecentGrades, isLoading: false, error: null };
  const assignmentsQuery = { data: mockPendingAssignments, isLoading: false, error: null };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getAcademicStandingColor = (standing: string) => {
    switch (standing) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'satisfactory':
        return 'warning';
      case 'probation':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {getGreeting()}, {user?.personalInfo?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your academic journey today.
        </Typography>
      </Box>

      {/* Academic Standing Alert */}
      {user?.academicInfo?.gpa && user.academicInfo.gpa < 2.0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your current GPA is below the minimum requirement. Please consider meeting with your academic advisor.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current GPA"
            value={statsQuery.data?.academic.currentGPA.toFixed(2) || '0.00'}
            subtitle={`Semester: ${statsQuery.data?.academic.semesterGPA.toFixed(2) || '0.00'}`}
            icon={<Grade />}
            color="#2e7d32"
            trend="up"
            trendValue="+0.15"
            loading={statsQuery.isLoading}
            onClick={() => navigate('/grades')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits Progress"
            value={`${statsQuery.data?.academic.completedCredits || 0}/${statsQuery.data?.academic.totalCredits || 0}`}
            subtitle="Credits completed"
            icon={<School />}
            color="#1976d2"
            progress={statsQuery.data?.academic.completedCredits || 0}
            maxValue={statsQuery.data?.academic.totalCredits || 120}
            loading={statsQuery.isLoading}
            onClick={() => navigate('/courses')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${statsQuery.data?.attendance.overallRate || 0}%`}
            subtitle="This semester"
            icon={<CheckCircle />}
            color="#ed6c02"
            progress={statsQuery.data?.attendance.overallRate || 0}
            trend="up"
            trendValue="+2%"
            loading={statsQuery.isLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Fees"
            value={`₦${(statsQuery.data?.financial.pendingAmount || 0).toLocaleString()}`}
            subtitle="Due Feb 15, 2024"
            icon={<Payment />}
            color="#9c27b0"
            badge={statsQuery.data?.financial.pendingAmount ? "Due Soon" : undefined}
            badgeColor="warning"
            loading={statsQuery.isLoading}
            onClick={() => navigate('/payments')}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <QuickActions loading={false} />
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} lg={6}>
          <UpcomingClasses
            classes={classesQuery.data || []}
            loading={classesQuery.isLoading}
            onViewAll={() => navigate('/schedule')}
          />
        </Grid>

        {/* Recent Grades */}
        <Grid item xs={12} lg={6}>
          <RecentGrades
            grades={gradesQuery.data || []}
            loading={gradesQuery.isLoading}
            onViewAll={() => navigate('/grades')}
          />
        </Grid>

        {/* Pending Assignments */}
        <Grid item xs={12}>
          <PendingAssignments
            assignments={assignmentsQuery.data || []}
            loading={assignmentsQuery.isLoading}
            onViewAll={() => navigate('/assignments')}
            onOpenAssignment={(id) => navigate(`/assignments/${id}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
