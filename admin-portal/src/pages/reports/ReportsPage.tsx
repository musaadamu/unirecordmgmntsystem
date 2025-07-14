import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reports & Analytics
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Reports and analytics interface will be implemented in Step 3.6
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;
