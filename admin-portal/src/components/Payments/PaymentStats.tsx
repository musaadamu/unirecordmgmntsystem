import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

// Charts
import BarChart from '@/components/Charts/BarChart';
import PieChart from '@/components/Charts/PieChart';
import LineChart from '@/components/Charts/LineChart';

interface PaymentStatsData {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  completedPayments: number;
  completedAmount: number;
  failedPayments: number;
  refundedAmount: number;
  paymentsByType: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
  paymentsByMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    payments: number;
    amount: number;
  }>;
}

interface PaymentStatsProps {
  stats: PaymentStatsData;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats }) => {
  // Prepare data for charts
  const paymentTypeData = stats.paymentsByType.map(type => ({
    type: type.type.replace('_', ' ').toUpperCase(),
    count: type.count,
    amount: type.amount,
  }));

  const paymentMethodData = stats.paymentsByMethod.map(method => ({
    name: method.method.replace('_', ' ').toUpperCase(),
    value: method.count,
    amount: method.amount,
    color: method.method === 'remita' ? '#1976d2' : 
           method.method === 'bank_transfer' ? '#2e7d32' :
           method.method === 'cash' ? '#ed6c02' : '#9c27b0',
  }));

  const monthlyTrendsData = stats.monthlyTrends.map(trend => ({
    month: trend.month,
    payments: trend.payments,
    amount: trend.amount / 1000000, // Convert to millions for better visualization
  }));

  // Payment status distribution
  const statusDistribution = [
    { name: 'Completed', value: stats.completedPayments, color: '#2e7d32' },
    { name: 'Pending', value: stats.pendingPayments, color: '#ed6c02' },
    { name: 'Failed', value: stats.failedPayments, color: '#d32f2f' },
  ];

  const successRate = Math.round((stats.completedPayments / stats.totalPayments) * 100);
  const pendingRate = Math.round((stats.pendingPayments / stats.totalPayments) * 100);

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {stats.totalPayments.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Payments
            </Typography>
            <Box mt={1}>
              <Typography variant="caption" color="success.main">
                ₦{stats.totalAmount.toLocaleString()} collected
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ₦{stats.completedAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revenue Collected
            </Typography>
            <Box mt={1}>
              <Typography variant="caption">
                {stats.completedPayments} completed payments
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              ₦{stats.pendingAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Amount
            </Typography>
            <Box mt={1}>
              <Typography variant="caption">
                {stats.pendingPayments} pending payments
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {successRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={successRate}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Types Analysis */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <BarChart
              title="Payment Revenue by Type"
              data={paymentTypeData}
              height={400}
              xAxisKey="type"
              bars={[
                { dataKey: 'amount', fill: '#1976d2', name: 'Amount (₦)' },
                { dataKey: 'count', fill: '#2e7d32', name: 'Count' },
              ]}
              formatTooltip={(value, name) => [
                name.includes('Amount') ? `₦${value.toLocaleString()}` : value.toString(),
                name
              ]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Status Distribution */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <PieChart
              title="Payment Status Distribution"
              data={statusDistribution}
              height={400}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods */}
      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <PieChart
              title="Payment Methods Usage"
              data={paymentMethodData}
              height={350}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Trends */}
      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <LineChart
              title="Monthly Payment Trends"
              data={monthlyTrendsData}
              height={350}
              xAxisKey="month"
              lines={[
                { dataKey: 'payments', stroke: '#1976d2', name: 'Payment Count' },
                { dataKey: 'amount', stroke: '#2e7d32', name: 'Amount (₦M)' },
              ]}
              formatTooltip={(value, name) => [
                name.includes('Amount') ? `₦${value}M` : value.toString(),
                name
              ]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Payment Method Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Method Performance
            </Typography>
            <Grid container spacing={2}>
              {stats.paymentsByMethod.map((method, index) => (
                <Grid item xs={12} sm={6} md={3} key={method.method}>
                  <Box p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {method.method.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Payments</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {method.count}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Amount</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{method.amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((method.count / stats.totalPayments) * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: method.method === 'remita' ? '#1976d2' : 
                                         method.method === 'bank_transfer' ? '#2e7d32' :
                                         method.method === 'cash' ? '#ed6c02' : '#9c27b0',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((method.count / stats.totalPayments) * 100)}% of total
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Type Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Type Analysis
            </Typography>
            <Grid container spacing={2}>
              {stats.paymentsByType.map((type, index) => (
                <Grid item xs={12} sm={6} md={4} key={type.type}>
                  <Box p={2} border={1} borderColor="divider" borderRadius={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {type.type.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Count</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {type.count}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Revenue</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{type.amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Avg Amount</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{Math.round(type.amount / type.count).toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((type.amount / stats.totalAmount) * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index % 2 === 0 ? '#1976d2' : '#2e7d32',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((type.amount / stats.totalAmount) * 100)}% of revenue
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentStats;
