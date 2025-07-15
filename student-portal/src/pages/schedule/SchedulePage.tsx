import React from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import courseService from '@/services/courseService';
import CourseSchedule from '@/components/Courses/CourseSchedule';
import LoadingSpinner from '@/components/LoadingSpinner';

const SchedulePage: React.FC = () => {
  // Mock enrolled courses for schedule
  const mockEnrolledCourses = [
    {
      _id: '1',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
      credits: 3,
      department: 'Computer Science',
      faculty: 'Faculty of Science',
      level: '100',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [],
      instructor: {
        _id: 'inst1',
        name: 'Dr. Sarah Smith',
        email: 'sarah.smith@university.edu',
        title: 'Professor',
        department: 'Computer Science',
      },
      schedule: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          type: 'lecture' as const,
          location: {
            building: 'Science Building',
            room: 'Room 201',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Wednesday',
          startTime: '14:00',
          endTime: '16:00',
          type: 'lab' as const,
          location: {
            building: 'Computer Lab',
            room: 'Lab 1',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 50,
      enrolled: 45,
      waitlist: 3,
      status: 'active' as const,
      enrollmentStatus: 'open' as const,
      materials: [],
      assessments: [],
      enrollment: {
        _id: 'enroll1',
        enrolledAt: '2024-01-15T00:00:00Z',
        status: 'enrolled' as const,
        attendance: {
          present: 22,
          absent: 3,
          total: 25,
          percentage: 88,
        },
        progress: {
          completedAssignments: 8,
          totalAssignments: 10,
          percentage: 80,
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      _id: '2',
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      description: 'Advanced calculus including integration techniques, series, and differential equations.',
      credits: 4,
      department: 'Mathematics',
      faculty: 'Faculty of Science',
      level: '200',
      semester: 'Fall',
      academicYear: '2024',
      prerequisites: [
        {
          courseCode: 'MATH101',
          courseName: 'Calculus I',
        },
      ],
      instructor: {
        _id: 'inst2',
        name: 'Prof. Michael Johnson',
        email: 'michael.johnson@university.edu',
        title: 'Associate Professor',
        department: 'Mathematics',
      },
      schedule: [
        {
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '11:30',
          type: 'lecture' as const,
          location: {
            building: 'Mathematics Building',
            room: 'Room 105',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Thursday',
          startTime: '10:00',
          endTime: '11:30',
          type: 'lecture' as const,
          location: {
            building: 'Mathematics Building',
            room: 'Room 105',
            campus: 'Main Campus',
          },
        },
        {
          day: 'Friday',
          startTime: '13:00',
          endTime: '15:00',
          type: 'tutorial' as const,
          location: {
            building: 'Mathematics Building',
            room: 'Room 203',
            campus: 'Main Campus',
          },
        },
      ],
      capacity: 40,
      enrolled: 38,
      waitlist: 0,
      status: 'active' as const,
      enrollmentStatus: 'open' as const,
      materials: [],
      assessments: [],
      enrollment: {
        _id: 'enroll2',
        enrolledAt: '2024-01-15T00:00:00Z',
        status: 'enrolled' as const,
        attendance: {
          present: 20,
          absent: 2,
          total: 22,
          percentage: 91,
        },
        progress: {
          completedAssignments: 6,
          totalAssignments: 8,
          percentage: 75,
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Schedule
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your weekly class schedule and upcoming sessions
        </Typography>
      </Box>

      {/* Schedule Component */}
      <CourseSchedule courses={mockEnrolledCourses} />
    </Box>
  );
};

export default SchedulePage;
