import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Calculate,
  TrendingUp,
  School,
  Timeline,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { GPACalculation } from '@/services/gradesService';

interface GPATrackerProps {
  gpaData?: GPACalculation;
}

interface WhatIfCourse {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  expectedGrade: string;
  gradePoints: number;
}

const GPATracker: React.FC<GPATrackerProps> = ({ gpaData }) => {
  const [whatIfCourses, setWhatIfCourses] = useState<WhatIfCourse[]>([]);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    expectedGrade: 'A',
  });

  const gradeToPoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  };

  const grades = Object.keys(gradeToPoints);

  const calculateProjectedGPA = () => {
    if (!gpaData || whatIfCourses.length === 0) return null;

    const currentQualityPoints = gpaData.cumulative.totalQualityPoints;
    const currentCredits = gpaData.cumulative.totalCredits;

    const additionalCredits = whatIfCourses.reduce((sum, course) => sum + course.credits, 0);
    const additionalQualityPoints = whatIfCourses.reduce(
      (sum, course) => sum + (course.credits * course.gradePoints), 0
    );

    const totalCredits = currentCredits + additionalCredits;
    const totalQualityPoints = currentQualityPoints + additionalQualityPoints;

    return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  };

  const calculateGPAForTarget = (targetGPA: number, additionalCredits: number) => {
    if (!gpaData) return null;

    const currentQualityPoints = gpaData.cumulative.totalQualityPoints;
    const currentCredits = gpaData.cumulative.totalCredits;

    const totalCredits = currentCredits + additionalCredits;
    const requiredQualityPoints = targetGPA * totalCredits;
    const neededQualityPoints = requiredQualityPoints - currentQualityPoints;

    return additionalCredits > 0 ? neededQualityPoints / additionalCredits : 0;
  };

  const addWhatIfCourse = () => {
    const course: WhatIfCourse = {
      id: Date.now().toString(),
      courseCode: newCourse.courseCode,
      courseName: newCourse.courseName,
      credits: newCourse.credits,
      expectedGrade: newCourse.expectedGrade,
      gradePoints: gradeToPoints[newCourse.expectedGrade],
    };

    setWhatIfCourses([...whatIfCourses, course]);
    setNewCourse({
      courseCode: '',
      courseName: '',
      credits: 3,
      expectedGrade: 'A',
    });
    setAddCourseDialogOpen(false);
  };

  const removeCourse = (id: string) => {
    setWhatIfCourses(whatIfCourses.filter(course => course.id !== id));
  };

  const projectedGPA = calculateProjectedGPA();

  // GPA goals analysis
  const gpaGoals = [3.0, 3.5, 3.7, 4.0];
  const creditsToGraduate = 120;
  const remainingCredits = gpaData ? creditsToGraduate - gpaData.cumulative.totalCredits : 0;

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        GPA Tracker & Projections
      </Typography>

      <Grid container spacing={3}>
        {/* Current GPA Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Current GPA Status
              </Typography>
              
              {gpaData && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Cumulative GPA</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {gpaData.cumulative.gpa.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Current Semester</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {gpaData.current.gpa.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Total Credits</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {gpaData.cumulative.totalCredits}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Quality Points</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {gpaData.cumulative.totalQualityPoints.toFixed(1)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Credits to Graduate</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {remainingCredits}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* GPA Trend Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                GPA Trend
              </Typography>
              
              {gpaData && (
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gpaData.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="gpa"
                        stroke="#1976d2"
                        strokeWidth={3}
                        dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* What-If Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  What-If GPA Calculator
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddCourseDialogOpen(true)}
                >
                  Add Course
                </Button>
              </Box>

              {whatIfCourses.length > 0 ? (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Course Code</TableCell>
                          <TableCell>Course Name</TableCell>
                          <TableCell align="center">Credits</TableCell>
                          <TableCell align="center">Expected Grade</TableCell>
                          <TableCell align="center">Grade Points</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {whatIfCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.courseCode}</TableCell>
                            <TableCell>{course.courseName}</TableCell>
                            <TableCell align="center">{course.credits}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={course.expectedGrade}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">{course.gradePoints.toFixed(1)}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => removeCourse(course.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {projectedGPA && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Calculate />
                        <Typography variant="body2">
                          <strong>Projected GPA:</strong> {projectedGPA.toFixed(2)}
                          {gpaData && (
                            <span>
                              {' '}({projectedGPA > gpaData.cumulative.gpa ? '+' : ''}
                              {(projectedGPA - gpaData.cumulative.gpa).toFixed(2)} change)
                            </span>
                          )}
                        </Typography>
                      </Box>
                    </Alert>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  Add courses to see how they would affect your GPA.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* GPA Goals */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                GPA Goals Analysis
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                See what GPA you need in remaining courses to reach your target.
              </Typography>

              <Grid container spacing={2} mt={1}>
                {gpaGoals.map((targetGPA) => {
                  const requiredGPA = calculateGPAForTarget(targetGPA, remainingCredits);
                  const isAchievable = requiredGPA !== null && requiredGPA <= 4.0;
                  const currentlyMet = gpaData ? gpaData.cumulative.gpa >= targetGPA : false;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={targetGPA}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {targetGPA.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Target GPA
                          </Typography>
                          
                          {currentlyMet ? (
                            <Chip
                              label="Already Achieved"
                              size="small"
                              color="success"
                            />
                          ) : requiredGPA !== null ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Need: {requiredGPA.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                in remaining courses
                              </Typography>
                              <Chip
                                label={isAchievable ? "Achievable" : "Challenging"}
                                size="small"
                                color={isAchievable ? "success" : "warning"}
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No data available
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Course Dialog */}
      <Dialog
        open={addCourseDialogOpen}
        onClose={() => setAddCourseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add What-If Course</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Code"
                value={newCourse.courseCode}
                onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                placeholder="e.g., CS301"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 3 })}
                inputProps={{ min: 1, max: 6 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Name"
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                placeholder="e.g., Advanced Algorithms"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Expected Grade</InputLabel>
                <Select
                  value={newCourse.expectedGrade}
                  label="Expected Grade"
                  onChange={(e) => setNewCourse({ ...newCourse, expectedGrade: e.target.value })}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade} ({gradeToPoints[grade].toFixed(1)} points)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCourseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={addWhatIfCourse}
            variant="contained"
            disabled={!newCourse.courseCode || !newCourse.courseName}
          >
            Add Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GPATracker;
