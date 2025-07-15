import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const GradesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Grades
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student grades interface will be implemented in Step 4.5
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GradesPage;
