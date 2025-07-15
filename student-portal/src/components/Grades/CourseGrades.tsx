import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  Grade,
  Assignment,
  Quiz,
  School,
  Visibility,
  Feedback,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { Grade as GradeType } from '@/services/gradesService';

interface CourseGradesProps {
  semester: string;
}

const CourseGrades: React.FC<CourseGradesProps> = ({ semester }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  // Mock course grades data
  const mockCourseGrades: GradeType[] = [
    {
      _id: '1',
      student: 'student1',
      course: {
        _id: 'cs101',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        credits: 3,
        department: 'Computer Science',
        instructor: {
          name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      semester: 'Fall',
      academicYear: '2024',
      assessments: [
        {
          _id: 'assess1',
          name: 'Assignment 1: Hello World',
          type: 'assignment',
          earnedPoints: 85,
          maxPoints: 100,
          percentage: 85,
          weight: 10,
          submittedAt: '2024-01-15T23:59:00Z',
          gradedAt: '2024-01-18T10:30:00Z',
          feedback: 'Good work! Your code is clean and well-commented. Consider adding more error handling.',
          rubric: [
            { criteria: 'Code Quality', points: 20, maxPoints: 25, feedback: 'Clean and readable code' },
            { criteria: 'Functionality', points: 25, maxPoints: 25, feedback: 'Program works correctly' },
            { criteria: 'Documentation', points: 20, maxPoints: 25, feedback: 'Good comments, could be more detailed' },
            { criteria: 'Style', points: 20, maxPoints: 25, feedback: 'Follows coding standards well' },
          ],
        },
        {
          _id: 'assess2',
          name: 'Quiz 1: Basic Concepts',
          type: 'quiz',
          earnedPoints: 18,
          maxPoints: 20,
          percentage: 90,
          weight: 5,
          gradedAt: '2024-01-22T14:00:00Z',
          feedback: 'Excellent understanding of basic programming concepts.',
        },
        {
          _id: 'assess3',
          name: 'Midterm Exam',
          type: 'midterm',
          earnedPoints: 82,
          maxPoints: 100,
          percentage: 82,
          weight: 25,
          gradedAt: '2024-02-15T16:00:00Z',
          feedback: 'Good performance overall. Review loops and conditionals for improvement.',
        },
        {
          _id: 'assess4',
          name: 'Project: Simple Calculator',
          type: 'project',
          earnedPoints: 92,
          maxPoints: 100,
          percentage: 92,
          weight: 20,
          submittedAt: '2024-03-01T23:59:00Z',
          gradedAt: '2024-03-05T11:00:00Z',
          feedback: 'Excellent project! Creative implementation and thorough testing.',
        },
      ],
      finalGrade: {
        letterGrade: 'B+',
        gradePoints: 3.3,
        percentage: 87,
        status: 'completed',
      },
      attendance: {
        present: 22,
        absent: 3,
        excused: 1,
        total: 26,
        percentage: 88,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-05T11:00:00Z',
    },
    {
      _id: '2',
      student: 'student1',
      course: {
        _id: 'math201',
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        credits: 4,
        department: 'Mathematics',
        instructor: {
          name: 'Prof. Michael Johnson',
          email: 'michael.johnson@university.edu',
        },
      },
      semester: 'Fall',
      academicYear: '2024',
      assessments: [
        {
          _id: 'assess5',
          name: 'Homework Set 1',
          type: 'assignment',
          earnedPoints: 95,
          maxPoints: 100,
          percentage: 95,
          weight: 15,
          submittedAt: '2024-01-20T23:59:00Z',
          gradedAt: '2024-01-23T09:00:00Z',
          feedback: 'Excellent work on integration techniques.',
        },
        {
          _id: 'assess6',
          name: 'Quiz 1: Limits and Derivatives',
          type: 'quiz',
          earnedPoints: 17,
          maxPoints: 20,
          percentage: 85,
          weight: 10,
          gradedAt: '2024-01-25T11:00:00Z',
        },
        {
          _id: 'assess7',
          name: 'Midterm Exam',
          type: 'midterm',
          earnedPoints: 88,
          maxPoints: 100,
          percentage: 88,
          weight: 30,
          gradedAt: '2024-02-20T14:00:00Z',
          feedback: 'Strong understanding of calculus concepts. Minor calculation errors.',
        },
      ],
      finalGrade: {
        letterGrade: 'A-',
        gradePoints: 3.7,
        percentage: 90,
        status: 'in_progress',
      },
      attendance: {
        present: 24,
        absent: 1,
        excused: 0,
        total: 25,
        percentage: 96,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-20T14:00:00Z',
    },
  ];

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Assignment />;
      case 'quiz':
        return <Quiz />;
      case 'midterm':
      case 'final':
        return <School />;
      case 'project':
        return <Grade />;
      default:
        return <Assignment />;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#2e7d32';
    if (percentage >= 80) return '#1976d2';
    if (percentage >= 70) return '#ed6c02';
    if (percentage >= 60) return '#f57c00';
    return '#d32f2f';
  };

  const calculateWeightedGrade = (assessments: any[]) => {
    const totalWeight = assessments.reduce((sum, assessment) => sum + assessment.weight, 0);
    const weightedSum = assessments.reduce((sum, assessment) => 
      sum + (assessment.percentage * assessment.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const handleViewFeedback = (assessment: any) => {
    setSelectedAssessment(assessment);
    setFeedbackDialogOpen(true);
  };

  const getPerformanceTrend = (assessments: any[]) => {
    if (assessments.length < 2) return null;
    
    const recent = assessments.slice(-2);
    const change = recent[1].percentage - recent[0].percentage;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(1),
      color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary',
    };
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Course Grades - {semester}
      </Typography>
      
      <Grid container spacing={3}>
        {mockCourseGrades.map((courseGrade) => {
          const weightedGrade = calculateWeightedGrade(courseGrade.assessments);
          const trend = getPerformanceTrend(courseGrade.assessments);
          
          return (
            <Grid item xs={12} key={courseGrade._id}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {courseGrade.course.courseCode} - {courseGrade.course.courseName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {courseGrade.course.instructor.name} • {courseGrade.course.credits} credits
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={courseGrade.finalGrade.letterGrade}
                        sx={{
                          bgcolor: `${getGradeColor(courseGrade.finalGrade.percentage)}15`,
                          color: getGradeColor(courseGrade.finalGrade.percentage),
                          fontWeight: 'bold',
                        }}
                      />
                      
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold">
                          {courseGrade.finalGrade.percentage.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {courseGrade.finalGrade.gradePoints.toFixed(1)} GP
                        </Typography>
                      </Box>
                      
                      {trend && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {trend.direction === 'up' ? (
                            <TrendingUp sx={{ color: trend.color, fontSize: 20 }} />
                          ) : trend.direction === 'down' ? (
                            <TrendingDown sx={{ color: trend.color, fontSize: 20 }} />
                          ) : null}
                          <Typography variant="caption" sx={{ color: trend.color }}>
                            {trend.direction !== 'neutral' ? `±${trend.value}%` : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Course Summary */}
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Course Summary
                          </Typography>
                          
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">Current Grade</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {weightedGrade.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={weightedGrade}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getGradeColor(weightedGrade),
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">Attendance</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {courseGrade.attendance.percentage}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={courseGrade.attendance.percentage}
                              color={courseGrade.attendance.percentage >= 75 ? 'success' : 'warning'}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            {courseGrade.attendance.present} present, {courseGrade.attendance.absent} absent
                            {courseGrade.attendance.excused > 0 && `, ${courseGrade.attendance.excused} excused`}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Assessments Table */}
                    <Grid item xs={12} md={8}>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Assessment</TableCell>
                              <TableCell align="center">Type</TableCell>
                              <TableCell align="center">Score</TableCell>
                              <TableCell align="center">Weight</TableCell>
                              <TableCell align="center">Date</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {courseGrade.assessments.map((assessment) => (
                              <TableRow key={assessment._id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="500">
                                    {assessment.name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    icon={getAssessmentIcon(assessment.type)}
                                    label={assessment.type}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {assessment.earnedPoints}/{assessment.maxPoints}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: getGradeColor(assessment.percentage) }}
                                    >
                                      {assessment.percentage}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {assessment.weight}%
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="caption">
                                    {format(parseISO(assessment.gradedAt), 'MMM dd')}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  {assessment.feedback && (
                                    <Tooltip title="View Feedback">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewFeedback(assessment)}
                                      >
                                        <Feedback />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assessment Feedback: {selectedAssessment?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAssessment && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Overall Feedback:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedAssessment.feedback}
              </Typography>
              
              {selectedAssessment.rubric && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Detailed Rubric:</strong>
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Criteria</TableCell>
                          <TableCell align="center">Points</TableCell>
                          <TableCell>Feedback</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedAssessment.rubric.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.criteria}</TableCell>
                            <TableCell align="center">
                              {item.points}/{item.maxPoints}
                            </TableCell>
                            <TableCell>{item.feedback}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseGrades;
