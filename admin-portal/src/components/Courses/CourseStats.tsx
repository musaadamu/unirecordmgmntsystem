import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

// Charts
import BarChart from '@/components/Charts/BarChart';
import PieChart from '@/components/Charts/PieChart';
import LineChart from '@/components/Charts/LineChart';

interface CourseStatsData {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageEnrollment: number;
  departmentStats: Array<{
    department: string;
    courseCount: number;
    enrollmentCount: number;
    averageGpa: number;
  }>;
  semesterStats: Array<{
    semester: string;
    academicYear: string;
    courseCount: number;
    enrollmentCount: number;
  }>;
}

interface CourseStatsProps {
  stats: CourseStatsData;
}

const CourseStats: React.FC<CourseStatsProps> = ({ stats }) => {
  // Prepare data for charts
  const departmentChartData = stats.departmentStats.map(dept => ({
    department: dept.department,
    courses: dept.courseCount,
    enrollments: dept.enrollmentCount,
    averageGpa: dept.averageGpa,
  }));

  const semesterTrendsData = stats.semesterStats.map(sem => ({
    period: `${sem.semester} ${sem.academicYear}`,
    courses: sem.courseCount,
    enrollments: sem.enrollmentCount,
  }));

  // Course level distribution (mock data)
  const levelDistribution = [
    { name: 'Undergraduate', value: Math.floor(stats.totalCourses * 0.7), color: '#1976d2' },
    { name: 'Graduate', value: Math.floor(stats.totalCourses * 0.25), color: '#2e7d32' },
    { name: 'Postgraduate', value: Math.floor(stats.totalCourses * 0.05), color: '#ed6c02' },
  ];

  // Enrollment capacity analysis (mock data)
  const capacityAnalysis = [
    { label: 'Under-enrolled (<60%)', value: 25, color: '#d32f2f' },
    { label: 'Well-enrolled (60-85%)', value: 60, color: '#2e7d32' },
    { label: 'Over-enrolled (>85%)', value: 15, color: '#ed6c02' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {stats.totalCourses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Courses
            </Typography>
            <Box mt={1}>
              <Typography variant="caption" color="success.main">
                {stats.activeCourses} active this semester
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.totalEnrollments.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Enrollments
            </Typography>
            <Box mt={1}>
              <Typography variant="caption">
                Avg {Math.round(stats.averageEnrollment)} per course
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.departmentStats.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Departments
            </Typography>
            <Box mt={1}>
              <Typography variant="caption">
                Offering courses
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {Math.round((stats.activeCourses / stats.totalCourses) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Rate
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={(stats.activeCourses / stats.totalCourses) * 100}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Performance */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <BarChart
              title="Courses and Enrollments by Department"
              data={departmentChartData}
              height={400}
              xAxisKey="department"
              bars={[
                { dataKey: 'courses', fill: '#1976d2', name: 'Courses' },
                { dataKey: 'enrollments', fill: '#2e7d32', name: 'Enrollments' },
              ]}
              formatTooltip={(value, name) => [value.toString(), name]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Course Level Distribution */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <PieChart
              title="Course Level Distribution"
              data={levelDistribution}
              height={400}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Semester Trends */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <LineChart
              title="Course and Enrollment Trends"
              data={semesterTrendsData}
              height={350}
              xAxisKey="period"
              lines={[
                { dataKey: 'courses', stroke: '#1976d2', name: 'Courses Offered' },
                { dataKey: 'enrollments', stroke: '#2e7d32', name: 'Total Enrollments' },
              ]}
              formatTooltip={(value, name) => [value.toString(), name]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Enrollment Capacity Analysis */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enrollment Capacity Analysis
            </Typography>
            <Box mt={2}>
              {capacityAnalysis.map((item, index) => (
                <Box key={index} mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Department GPA Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <BarChart
              title="Average GPA by Department"
              data={departmentChartData}
              height={300}
              xAxisKey="department"
              bars={[
                { dataKey: 'averageGpa', fill: '#9c27b0', name: 'Average GPA' },
              ]}
              formatTooltip={(value, name) => [value.toFixed(2), name]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Department Statistics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Performance Details
            </Typography>
            <Grid container spacing={2}>
              {stats.departmentStats.map((dept, index) => (
                <Grid item xs={12} sm={6} md={4} key={dept.department}>
                  <Box p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {dept.department}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Courses</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dept.courseCount}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Enrollments</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dept.enrollmentCount}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Avg GPA</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dept.averageGpa.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((dept.enrollmentCount / 1000) * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index % 2 === 0 ? '#1976d2' : '#2e7d32',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Enrollment performance
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CourseStats;
