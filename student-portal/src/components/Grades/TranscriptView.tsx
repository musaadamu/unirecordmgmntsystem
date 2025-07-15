import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Download,
  Print,
  Email,
  School,
  Verified,
} from '@mui/icons-material';

import { TranscriptRecord } from '@/services/gradesService';
import { useAuthStore } from '@/stores/authStore';

const TranscriptView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'official' | 'unofficial'>('unofficial');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const { user } = useAuthStore();

  // Mock transcript data
  const mockTranscript: TranscriptRecord[] = [
    // Fall 2022
    {
      _id: '1',
      course: {
        courseCode: 'ENG101',
        courseName: 'English Composition',
        credits: 3,
        department: 'English',
      },
      semester: 'Fall',
      academicYear: '2022',
      letterGrade: 'B+',
      gradePoints: 3.3,
      qualityPoints: 9.9,
      status: 'completed',
    },
    {
      _id: '2',
      course: {
        courseCode: 'MATH101',
        courseName: 'Calculus I',
        credits: 4,
        department: 'Mathematics',
      },
      semester: 'Fall',
      academicYear: '2022',
      letterGrade: 'A-',
      gradePoints: 3.7,
      qualityPoints: 14.8,
      status: 'completed',
    },
    {
      _id: '3',
      course: {
        courseCode: 'CS100',
        courseName: 'Introduction to Computing',
        credits: 3,
        department: 'Computer Science',
      },
      semester: 'Fall',
      academicYear: '2022',
      letterGrade: 'A',
      gradePoints: 4.0,
      qualityPoints: 12.0,
      status: 'completed',
    },
    {
      _id: '4',
      course: {
        courseCode: 'PHYS101',
        courseName: 'General Physics I',
        credits: 4,
        department: 'Physics',
      },
      semester: 'Fall',
      academicYear: '2022',
      letterGrade: 'B',
      gradePoints: 3.0,
      qualityPoints: 12.0,
      status: 'completed',
    },
    {
      _id: '5',
      course: {
        courseCode: 'HIST101',
        courseName: 'World History',
        credits: 3,
        department: 'History',
      },
      semester: 'Fall',
      academicYear: '2022',
      letterGrade: 'A-',
      gradePoints: 3.7,
      qualityPoints: 11.1,
      status: 'completed',
    },
    // Spring 2023
    {
      _id: '6',
      course: {
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        credits: 3,
        department: 'Computer Science',
      },
      semester: 'Spring',
      academicYear: '2023',
      letterGrade: 'B+',
      gradePoints: 3.3,
      qualityPoints: 9.9,
      status: 'completed',
    },
    {
      _id: '7',
      course: {
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        credits: 4,
        department: 'Mathematics',
      },
      semester: 'Spring',
      academicYear: '2023',
      letterGrade: 'A-',
      gradePoints: 3.7,
      qualityPoints: 14.8,
      status: 'completed',
    },
    // Fall 2024 (Current)
    {
      _id: '8',
      course: {
        courseCode: 'CS201',
        courseName: 'Data Structures',
        credits: 3,
        department: 'Computer Science',
      },
      semester: 'Fall',
      academicYear: '2024',
      letterGrade: 'IP',
      gradePoints: 0,
      qualityPoints: 0,
      status: 'in_progress',
    },
  ];

  const getFilteredTranscript = () => {
    if (selectedYear === 'all') return mockTranscript;
    return mockTranscript.filter(record => record.academicYear === selectedYear);
  };

  const groupBySemester = (records: TranscriptRecord[]) => {
    const grouped: { [key: string]: TranscriptRecord[] } = {};
    records.forEach(record => {
      const key = `${record.semester} ${record.academicYear}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(record);
    });
    return grouped;
  };

  const calculateSemesterStats = (records: TranscriptRecord[]) => {
    const completedRecords = records.filter(r => r.status === 'completed');
    const totalCredits = completedRecords.reduce((sum, r) => sum + r.course.credits, 0);
    const totalQualityPoints = completedRecords.reduce((sum, r) => sum + r.qualityPoints, 0);
    const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    
    return { totalCredits, totalQualityPoints, gpa };
  };

  const calculateCumulativeStats = () => {
    const completedRecords = mockTranscript.filter(r => r.status === 'completed');
    const totalCredits = completedRecords.reduce((sum, r) => sum + r.course.credits, 0);
    const totalQualityPoints = completedRecords.reduce((sum, r) => sum + r.qualityPoints, 0);
    const cumulativeGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    
    return { totalCredits, totalQualityPoints, cumulativeGPA };
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'IP') return '#757575';
    const letter = grade.charAt(0);
    switch (letter) {
      case 'A':
        return '#2e7d32';
      case 'B':
        return '#1976d2';
      case 'C':
        return '#ed6c02';
      case 'D':
        return '#f57c00';
      case 'F':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const handleDownloadTranscript = () => {
    console.log('Downloading unofficial transcript...');
  };

  const handleRequestOfficial = () => {
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    console.log('Submitting official transcript request...', {
      type: requestType,
      purpose: requestPurpose,
      recipientEmail,
    });
    setRequestDialogOpen(false);
  };

  const filteredTranscript = getFilteredTranscript();
  const groupedTranscript = groupBySemester(filteredTranscript);
  const cumulativeStats = calculateCumulativeStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Academic Transcript
        </Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={selectedYear}
              label="Academic Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="all">All Years</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadTranscript}
          >
            Download
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Verified />}
            onClick={handleRequestOfficial}
          >
            Request Official
          </Button>
        </Box>
      </Box>

      {/* Student Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Student Information
              </Typography>
              <Box>
                <Typography variant="body2">
                  <strong>Name:</strong> {user?.personalInfo.firstName} {user?.personalInfo.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Student ID:</strong> {user?.academicInfo.studentId}
                </Typography>
                <Typography variant="body2">
                  <strong>Program:</strong> {user?.academicInfo.program}
                </Typography>
                <Typography variant="body2">
                  <strong>Department:</strong> {user?.academicInfo.department}
                </Typography>
                <Typography variant="body2">
                  <strong>Faculty:</strong> {user?.academicInfo.faculty}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Academic Summary
              </Typography>
              <Box>
                <Typography variant="body2">
                  <strong>Cumulative GPA:</strong> {cumulativeStats.cumulativeGPA.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Credits:</strong> {cumulativeStats.totalCredits}
                </Typography>
                <Typography variant="body2">
                  <strong>Quality Points:</strong> {cumulativeStats.totalQualityPoints.toFixed(1)}
                </Typography>
                <Typography variant="body2">
                  <strong>Academic Level:</strong> {user?.academicInfo.level}
                </Typography>
                <Typography variant="body2">
                  <strong>Expected Graduation:</strong> {user?.academicInfo.expectedGraduationDate ? 
                    new Date(user.academicInfo.expectedGraduationDate).toLocaleDateString() : 'TBD'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transcript by Semester */}
      {Object.entries(groupedTranscript)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([semester, records]) => {
          const semesterStats = calculateSemesterStats(records);
          
          return (
            <Card key={semester} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {semester}
                  </Typography>
                  <Box textAlign="right">
                    <Typography variant="body2">
                      <strong>Semester GPA:</strong> {semesterStats.gpa.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Credits:</strong> {semesterStats.totalCredits}
                    </Typography>
                  </Box>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Course Name</TableCell>
                        <TableCell align="center">Credits</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">Grade Points</TableCell>
                        <TableCell align="center">Quality Points</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {record.course.courseCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.course.courseName}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {record.course.credits}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={record.letterGrade}
                              size="small"
                              sx={{
                                bgcolor: `${getGradeColor(record.letterGrade)}15`,
                                color: getGradeColor(record.letterGrade),
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {record.gradePoints.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {record.qualityPoints.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={record.status.replace('_', ' ')}
                              size="small"
                              color={
                                record.status === 'completed' ? 'success' :
                                record.status === 'in_progress' ? 'info' :
                                record.status === 'withdrawn' ? 'warning' : 'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          );
        })}

      {/* Official Transcript Request Dialog */}
      <Dialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Official Transcript</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Official transcripts are sealed documents that can be sent directly to institutions or employers.
            Processing time is typically 3-5 business days.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={requestType}
                  label="Request Type"
                  onChange={(e) => setRequestType(e.target.value as 'official' | 'unofficial')}
                >
                  <MenuItem value="official">Official Transcript ($10)</MenuItem>
                  <MenuItem value="unofficial">Unofficial Transcript (Free)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                value={requestPurpose}
                onChange={(e) => setRequestPurpose(e.target.value)}
                placeholder="e.g., Graduate school application, Employment verification"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipient Email (Optional)"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="institution@university.edu"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={!requestPurpose}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranscriptView;
