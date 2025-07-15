import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const PaymentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Payments & Fees
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student payments interface will be implemented in Step 4.6
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentsPage;
