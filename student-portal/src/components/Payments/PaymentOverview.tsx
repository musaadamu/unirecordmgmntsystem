import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  School,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  Payment,
  Receipt,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { FinancialSummary } from '@/services/paymentsService';

interface PaymentOverviewProps {
  financialSummary?: FinancialSummary;
  semester: string;
}

const PaymentOverview: React.FC<PaymentOverviewProps> = ({
  financialSummary,
  semester,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mock payment breakdown data
  const paymentBreakdown = [
    { name: 'Tuition', amount: 300000, color: '#1976d2' },
    { name: 'Accommodation', amount: 80000, color: '#2e7d32' },
    { name: 'Library Fee', amount: 15000, color: '#ed6c02' },
    { name: 'Lab Fee', amount: 25000, color: '#9c27b0' },
    { name: 'Registration', amount: 30000, color: '#d32f2f' },
  ];

  // Mock payment timeline
  const paymentTimeline = [
    {
      description: 'First Semester Tuition',
      amount: 225000,
      dueDate: '2024-01-15',
      status: 'paid',
      paidDate: '2024-01-10',
    },
    {
      description: 'Accommodation Fee',
      amount: 80000,
      dueDate: '2024-01-20',
      status: 'paid',
      paidDate: '2024-01-18',
    },
    {
      description: 'Second Semester Tuition',
      amount: 150000,
      dueDate: '2024-02-15',
      status: 'pending',
    },
    {
      description: 'Laboratory Fee',
      amount: 25000,
      dueDate: '2024-03-01',
      status: 'pending',
    },
  ];

  // Mock recent transactions
  const recentTransactions = [
    {
      id: 'TXN001',
      description: 'First Semester Tuition Payment',
      amount: 225000,
      date: '2024-01-10',
      status: 'completed',
      method: 'Remita',
    },
    {
      id: 'TXN002',
      description: 'Accommodation Fee Payment',
      amount: 80000,
      date: '2024-01-18',
      status: 'completed',
      method: 'Bank Transfer',
    },
    {
      id: 'TXN003',
      description: 'Library Fee Payment',
      amount: 15000,
      date: '2024-01-25',
      status: 'completed',
      method: 'Paystack',
    },
  ];

  const getPaymentProgress = () => {
    if (!financialSummary) return 0;
    return (financialSummary.paidAmount / financialSummary.totalFees) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'overdue':
        return <Warning sx={{ color: 'error.main' }} />;
      default:
        return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Payment Progress */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Progress
            </Typography>
            
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">
                  Total Progress
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {getPaymentProgress().toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getPaymentProgress()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Total Fees</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(financialSummary?.totalFees || 0)}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Amount Paid</Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {formatCurrency(financialSummary?.paidAmount || 0)}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Pending Amount</Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">
                {formatCurrency(financialSummary?.pendingAmount || 0)}
              </Typography>
            </Box>
            
            {financialSummary?.financialAidTotal && financialSummary.financialAidTotal > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Financial Aid</Typography>
                <Typography variant="body2" fontWeight="bold" color="info.main">
                  -{formatCurrency(financialSummary.financialAidTotal)}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" fontWeight="bold">Net Amount</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {formatCurrency(financialSummary?.netAmount || 0)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Fee Breakdown
            </Typography>
            
            <Box height={200} mb={2}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box display="flex" flexDirection="column" gap={1}>
              {paymentBreakdown.map((item) => (
                <Box key={item.name} display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="caption" flex={1}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {formatCurrency(item.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Timeline */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Timeline
            </Typography>
            
            <List sx={{ p: 0 }}>
              {paymentTimeline.map((payment, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getStatusIcon(payment.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {payment.description}
                          </Typography>
                          <Chip
                            label={payment.status}
                            size="small"
                            color={getStatusColor(payment.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {formatCurrency(payment.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                            {payment.paidDate && (
                              <span> • Paid: {new Date(payment.paidDate).toLocaleDateString()}</span>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < paymentTimeline.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Transactions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Transactions
              </Typography>
              <Button size="small" endIcon={<Receipt />}>
                View All
              </Button>
            </Box>
            
            <List sx={{ p: 0 }}>
              {recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Payment sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {transaction.description}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            {formatCurrency(transaction.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.method}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={transaction.status}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </ListItem>
                  {index < recentTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Payment />}
                  sx={{ py: 2 }}
                >
                  Make Payment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  sx={{ py: 2 }}
                >
                  Download Receipt
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalance />}
                  sx={{ py: 2 }}
                >
                  Payment Plan
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<School />}
                  sx={{ py: 2 }}
                >
                  Financial Aid
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentOverview;
