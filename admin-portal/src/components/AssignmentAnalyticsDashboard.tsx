// removed duplicate import
import { Box, Typography } from '@mui/material';
// You can use chart libraries like recharts, chart.js, or nivo for real charts

import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AssignmentAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  useEffect(() => {
    api.get('/assignments/analytics').then(({ data }) => setAnalytics(data.data));
  }, []);
  if (!analytics) return <Box p={3}><Typography>Loading analytics...</Typography></Box>;
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Assignment Analytics</Typography>
      <Typography variant="body1">Submission Rate: {analytics.submissionRate}%</Typography>
      <Typography variant="body1">Average Grade: {analytics.averageGrade}</Typography>
      <Typography variant="body1">Overdue Assignments: {analytics.overdue}</Typography>
      {/* TODO: Add charts for grade distribution, submission trends, engagement, etc. */}
    </Box>
  );
};

export default AssignmentAnalyticsDashboard;
