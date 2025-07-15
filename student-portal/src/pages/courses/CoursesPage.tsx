import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CoursesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Courses
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student courses interface will be implemented in Step 4.4
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CoursesPage;
