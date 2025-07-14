import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EnrollmentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Enrollment Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Enrollment management interface will be implemented in Step 3.5
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnrollmentsPage;
