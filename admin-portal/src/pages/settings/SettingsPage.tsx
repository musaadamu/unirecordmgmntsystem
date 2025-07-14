import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Settings interface will be implemented in Step 3.6
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
