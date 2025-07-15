import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Payment,
  AccountBalance,
  Receipt,
  TrendingUp,
  School,
  Download,
  MoreVert,
  Add,
  CreditCard,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import paymentsService from '@/services/paymentsService';
import { useAuthStore } from '@/stores/authStore';
import PaymentOverview from '@/components/Payments/PaymentOverview';
import PaymentItems from '@/components/Payments/PaymentItems';
import PaymentHistory from '@/components/Payments/PaymentHistory';
import FinancialAid from '@/components/Payments/FinancialAid';
import BudgetTracker from '@/components/Payments/BudgetTracker';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payments-tabpanel-${index}`}
      aria-labelledby={`payments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PaymentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  // Mock financial summary data
  const mockFinancialSummary = {
    totalFees: 450000,
    paidAmount: 300000,
    pendingAmount: 150000,
    overdueAmount: 0,
    financialAidTotal: 100000,
    netAmount: 350000,
    paymentStatus: 'partial' as const,
    nextPaymentDue: {
      amount: 150000,
      dueDate: '2024-02-15',
      description: 'Second Semester Tuition',
    },
    semester: 'Fall',
    academicYear: '2024',
  };

  // Mock query
  const financialSummaryQuery = {
    data: mockFinancialSummary,
    isLoading: false,
    error: null,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid_in_full':
        return 'success';
      case 'current':
        return 'info';
      case 'partial':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (financialSummaryQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading your financial information..." />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payments & Finance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your payments, financial aid, and budget
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <MenuItem value="Fall 2024">Fall 2024</MenuItem>
                <MenuItem value="Spring 2024">Spring 2024</MenuItem>
                <MenuItem value="Fall 2023">Fall 2023</MenuItem>
                <MenuItem value="Spring 2023">Spring 2023</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<CreditCard />}
              onClick={() => setTabValue(1)}
            >
              Make Payment
            </Button>

            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Financial Summary */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(financialSummaryQuery.data?.totalFees || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Fees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(financialSummaryQuery.data?.paidAmount || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Amount Paid
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {formatCurrency(financialSummaryQuery.data?.pendingAmount || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Chip
                  label={financialSummaryQuery.data?.paymentStatus.replace('_', ' ') || 'Unknown'}
                  color={getPaymentStatusColor(financialSummaryQuery.data?.paymentStatus || '') as any}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Payment Status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payment Due Alert */}
        {financialSummaryQuery.data?.nextPaymentDue && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Payment Due:</strong> {financialSummaryQuery.data.nextPaymentDue.description} -
              {formatCurrency(financialSummaryQuery.data.nextPaymentDue.amount)} due on{' '}
              {new Date(financialSummaryQuery.data.nextPaymentDue.dueDate).toLocaleDateString()}
            </Typography>
          </Alert>
        )}

        {/* Overdue Alert */}
        {financialSummaryQuery.data?.overdueAmount && financialSummaryQuery.data.overdueAmount > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Overdue Amount:</strong> {formatCurrency(financialSummaryQuery.data.overdueAmount)}
              - Please make payment immediately to avoid late fees.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="payments tabs">
          <Tab
            label="Overview"
            icon={<AccountBalance />}
            iconPosition="start"
            id="payments-tab-0"
            aria-controls="payments-tabpanel-0"
          />
          <Tab
            label="Make Payment"
            icon={<Payment />}
            iconPosition="start"
            id="payments-tab-1"
            aria-controls="payments-tabpanel-1"
          />
          <Tab
            label="Payment History"
            icon={<Receipt />}
            iconPosition="start"
            id="payments-tab-2"
            aria-controls="payments-tabpanel-2"
          />
          <Tab
            label="Financial Aid"
            icon={<School />}
            iconPosition="start"
            id="payments-tab-3"
            aria-controls="payments-tabpanel-3"
          />
          <Tab
            label="Budget Tracker"
            icon={<TrendingUp />}
            iconPosition="start"
            id="payments-tab-4"
            aria-controls="payments-tabpanel-4"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <PaymentOverview
          financialSummary={financialSummaryQuery.data}
          semester={selectedSemester}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PaymentItems semester={selectedSemester} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <PaymentHistory semester={selectedSemester} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <FinancialAid />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <BudgetTracker semester={selectedSemester} />
      </TabPanel>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1 }} />
          Download Statement
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Receipt sx={{ mr: 1 }} />
          View All Receipts
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Add sx={{ mr: 1 }} />
          Set Up Payment Plan
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentsPage;
