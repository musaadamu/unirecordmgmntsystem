import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Profile management interface will be implemented in Step 3.6
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
