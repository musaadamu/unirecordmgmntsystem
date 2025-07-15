import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Grade,
  TrendingUp,
  Assessment,
  School,
  Download,
  Analytics,
  Timeline,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import gradesService from '@/services/gradesService';
import { useAuthStore } from '@/stores/authStore';
import GradeOverview from '@/components/Grades/GradeOverview';
import CourseGrades from '@/components/Grades/CourseGrades';
import TranscriptView from '@/components/Grades/TranscriptView';
import PerformanceAnalytics from '@/components/Grades/PerformanceAnalytics';
import GPATracker from '@/components/Grades/GPATracker';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grades-tabpanel-${index}`}
      aria-labelledby={`grades-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const GradesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const { user } = useAuthStore();

  // Mock data for demonstration
  const mockGPAData = {
    current: {
      semester: 'Fall',
      academicYear: '2024',
      gpa: 3.75,
      credits: 18,
      qualityPoints: 67.5,
    },
    cumulative: {
      gpa: 3.68,
      totalCredits: 75,
      totalQualityPoints: 276,
      completedCredits: 75,
    },
    byLevel: [
      { level: '100', gpa: 3.5, credits: 30, qualityPoints: 105 },
      { level: '200', gpa: 3.8, credits: 27, qualityPoints: 102.6 },
      { level: '300', gpa: 3.75, credits: 18, qualityPoints: 67.5 },
    ],
    trend: [
      { semester: 'Fall', academicYear: '2022', gpa: 3.2, credits: 15 },
      { semester: 'Spring', academicYear: '2023', gpa: 3.4, credits: 15 },
      { semester: 'Fall', academicYear: '2023', gpa: 3.6, credits: 15 },
      { semester: 'Spring', academicYear: '2024', gpa: 3.8, credits: 12 },
      { semester: 'Fall', academicYear: '2024', gpa: 3.75, credits: 18 },
    ],
  };

  const mockAcademicStanding = {
    current: 'excellent' as const,
    requirements: {
      minimumGPA: 2.0,
      minimumCredits: 12,
      maxConsecutiveProbation: 2,
    },
    warnings: [],
    recommendations: [
      {
        type: 'course_selection' as const,
        title: 'Consider Advanced Courses',
        description: 'Your strong performance suggests you could handle more challenging coursework.',
      },
    ],
  };

  // Mock queries
  const gpaQuery = { data: mockGPAData, isLoading: false, error: null };
  const standingQuery = { data: mockAcademicStanding, isLoading: false, error: null };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownloadTranscript = () => {
    // In a real app, this would call the download service
    console.log('Downloading unofficial transcript...');
  };

  const getStandingColor = (standing: string) => {
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

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'success.main';
    if (gpa >= 3.0) return 'info.main';
    if (gpa >= 2.5) return 'warning.main';
    return 'error.main';
  };

  if (gpaQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading your grades..." />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              My Grades
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your academic performance and progress
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <MenuItem value="Fall 2024">Fall 2024</MenuItem>
                <MenuItem value="Spring 2024">Spring 2024</MenuItem>
                <MenuItem value="Fall 2023">Fall 2023</MenuItem>
                <MenuItem value="Spring 2023">Spring 2023</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTranscript}
            >
              Download Transcript
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: getGPAColor(gpaQuery.data?.cumulative.gpa || 0) }}
                >
                  {gpaQuery.data?.cumulative.gpa.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cumulative GPA
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: getGPAColor(gpaQuery.data?.current.gpa || 0) }}
                >
                  {gpaQuery.data?.current.gpa.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current Semester
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {gpaQuery.data?.cumulative.completedCredits || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Credits Earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Chip
                  label={standingQuery.data?.current || 'Good'}
                  color={getStandingColor(standingQuery.data?.current || 'good') as any}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Academic Standing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Warnings/Recommendations */}
        {standingQuery.data?.warnings && standingQuery.data.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {standingQuery.data.warnings[0].message}
            </Typography>
          </Alert>
        )}

        {standingQuery.data?.recommendations && standingQuery.data.recommendations.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{standingQuery.data.recommendations[0].title}:</strong>{' '}
              {standingQuery.data.recommendations[0].description}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="grades tabs">
          <Tab
            label="Overview"
            icon={<Grade />}
            iconPosition="start"
            id="grades-tab-0"
            aria-controls="grades-tabpanel-0"
          />
          <Tab
            label="Course Grades"
            icon={<Assessment />}
            iconPosition="start"
            id="grades-tab-1"
            aria-controls="grades-tabpanel-1"
          />
          <Tab
            label="Transcript"
            icon={<School />}
            iconPosition="start"
            id="grades-tab-2"
            aria-controls="grades-tabpanel-2"
          />
          <Tab
            label="Analytics"
            icon={<Analytics />}
            iconPosition="start"
            id="grades-tab-3"
            aria-controls="grades-tabpanel-3"
          />
          <Tab
            label="GPA Tracker"
            icon={<Timeline />}
            iconPosition="start"
            id="grades-tab-4"
            aria-controls="grades-tabpanel-4"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <GradeOverview
          gpaData={gpaQuery.data}
          academicStanding={standingQuery.data}
          semester={selectedSemester}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CourseGrades semester={selectedSemester} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TranscriptView />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <PerformanceAnalytics />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <GPATracker gpaData={gpaQuery.data} />
      </TabPanel>
    </Box>
  );
};

export default GradesPage;
