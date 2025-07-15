import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Student Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student dashboard will be implemented in Step 4.3
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
