import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const StudentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Student Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student management interface will be implemented in Step 3.4
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentsPage;
