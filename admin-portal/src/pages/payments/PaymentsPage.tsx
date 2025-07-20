import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Menu,
  Tooltip,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Payment,
  AccountBalance,
  Analytics,
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  MoreVert,
  Refresh,
  Receipt,
  Send,
  TrendingUp,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import PaymentTable from '@/components/Payments/PaymentTable';
import PaymentForm from '@/components/Payments/PaymentForm';
import RemitaPaymentDialog from '@/components/Payments/RemitaPaymentDialog';
import PaymentFilters from '@/components/Payments/PaymentFilters';
import PaymentStats from '@/components/Payments/PaymentStats';
import BulkPaymentDialog from '@/components/Payments/BulkPaymentDialog';
import StatCard from '@/components/Dashboard/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Services
import paymentService from '@/services/paymentService';

// Types
import { Payment as PaymentType, PaymentFilters as PaymentFilterType } from '@/types';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PaymentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PaymentFilterType>({});
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Dialog states
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [remitaDialogOpen, setRemitaDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const queryClient = useQueryClient();

  // Fetch payments with filters
  const { data: paymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', { ...filters, search: searchTerm, page, limit: pageSize }],
    queryFn: () => paymentService.getPayments({ ...filters, search: searchTerm, page, limit: pageSize }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch payment statistics
  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats', filters],
    queryFn: () => paymentService.getPaymentStats(filters),
    staleTime: 10 * 60 * 1000,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Payment created successfully');
      setPaymentFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    },
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => paymentService.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment updated successfully');
      setPaymentFormOpen(false);
      setEditingPayment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => paymentService.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Payment marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark payment as paid');
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: paymentService.sendPaymentReminder,
    onSuccess: () => {
      toast.success('Payment reminder sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: PaymentFilterType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setPaymentFormOpen(true);
  };

  const handleEditPayment = (payment: PaymentType) => {
    setEditingPayment(payment);
    setPaymentFormOpen(true);
  };

  const handleMarkAsPaid = (payment: PaymentType) => {
    const paymentData = {
      paymentMethod: 'manual',
      paidDate: new Date().toISOString(),
      receiptNumber: `RCP-${Date.now()}`,
    };
    markAsPaidMutation.mutate({ id: payment._id, data: paymentData });
  };

  const handleSendReminder = (paymentId: string) => {
    sendReminderMutation.mutate(paymentId);
  };

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      await paymentService.generateReceipt(paymentId);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate receipt');
    }
  };

  const handleInitiateRemitaPayment = (payment: PaymentType) => {
    setEditingPayment(payment);
    setRemitaDialogOpen(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    if (editingPayment) {
      updatePaymentMutation.mutate({ id: editingPayment._id, data: paymentData });
    } else {
      createPaymentMutation.mutate(paymentData);
    }
  };

  const handleExport = async () => {
    try {
      await paymentService.exportPaymentsToCSV(filters);
      toast.success('Payments exported successfully');
    } catch (error) {
      toast.error('Failed to export payments');
    }
    setAnchorEl(null);
  };

  const payments = paymentsData?.data?.items || [];
  const pagination = paymentsData?.data?.pagination;

  // Payment statistics for display
  const stats = paymentStats ? [
    {
      title: 'Total Payments',
      value: paymentStats.totalPayments.toLocaleString(),
      change: '+12%',
      trend: 'up' as const,
      icon: <Payment />,
      color: '#1976d2',
      subtitle: 'All time',
    },
    {
      title: 'Total Amount',
      value: `₦${paymentStats.totalAmount.toLocaleString()}`,
      change: '+8%',
      trend: 'up' as const,
      icon: <AttachMoney />,
      color: '#2e7d32',
      subtitle: 'Revenue collected',
    },
    {
      title: 'Pending Payments',
      value: paymentStats.pendingPayments.toLocaleString(),
      change: '-5%',
      trend: 'down' as const,
      icon: <AccountBalance />,
      color: '#ed6c02',
      subtitle: `₦${paymentStats.pendingAmount.toLocaleString()}`,
    },
    {
      title: 'Success Rate',
      value: `${Math.round((paymentStats.completedPayments / paymentStats.totalPayments) * 100)}%`,
      change: '+3%',
      trend: 'up' as const,
      icon: <TrendingUp />,
      color: '#9c27b0',
      subtitle: 'Payment success',
    },
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payment Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage student payments, fees, and financial transactions with Remita integration
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setBulkDialogOpen(true)}
            >
              Bulk Import
            </Button>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreatePayment}
            >
              Create Payment
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Payment Statistics */}
      {stats.length > 0 && (
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
                loading={!paymentStats}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="payment management tabs">
          <Tab label="All Payments" icon={<Payment />} />
          <Tab label="Remita Payments" icon={<CreditCard />} />
          <Tab label="Analytics" icon={<Analytics />} />
        </Tabs>
      </Box>

      {/* All Payments Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <PaymentFilters filters={filters} onFiltersChange={handleFilterChange} />
              </Grid>

              <Grid item xs={12} md={2}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {selectedPayments.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    >
                      Actions ({selectedPayments.length})
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <LoadingSpinner message="Loading payments..." />
              </Box>
            ) : error ? (
              <Box p={4} textAlign="center">
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load payments. Please try again.
                </Alert>
                <Button variant="outlined" onClick={() => refetch()}>
                  Retry
                </Button>
              </Box>
            ) : (
              <PaymentTable
                payments={payments}
                selectedPayments={selectedPayments}
                onSelectionChange={setSelectedPayments}
                onEdit={handleEditPayment}
                onMarkAsPaid={handleMarkAsPaid}
                onSendReminder={handleSendReminder}
                onGenerateReceipt={handleGenerateReceipt}
                onInitiateRemita={handleInitiateRemitaPayment}
                pagination={pagination}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Remita Payments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <CreditCard />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Remita Payment Integration</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secure online payment processing with Remita
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Remita is Nigeria's leading payment platform providing secure, reliable, and efficient payment solutions.
                  Students can pay fees online using bank transfers, cards, and mobile money.
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Payment Features
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <Typography component="li" variant="body2" gutterBottom>
                            Secure online payment processing
                          </Typography>
                          <Typography component="li" variant="body2" gutterBottom>
                            Multiple payment methods (Bank transfer, Cards, USSD)
                          </Typography>
                          <Typography component="li" variant="body2" gutterBottom>
                            Real-time payment verification
                          </Typography>
                          <Typography component="li" variant="body2" gutterBottom>
                            Automatic receipt generation
                          </Typography>
                          <Typography component="li" variant="body2" gutterBottom>
                            Payment status tracking
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Integration Status
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Chip label="Active" color="success" size="small" />
                          <Typography variant="body2">Remita API Connected</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Chip label="Configured" color="info" size="small" />
                          <Typography variant="body2">Merchant Account Setup</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Chip label="Enabled" color="success" size="small" />
                          <Typography variant="body2">Webhook Notifications</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<CreditCard />}
                          onClick={() => setRemitaDialogOpen(true)}
                          fullWidth
                        >
                          Test Remita Payment
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Remita Payments List */}
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    Recent Remita Payments
                  </Typography>
                  {payments.filter(p => p.paymentMethod === 'remita').length === 0 ? (
                    <Alert severity="info">
                      No Remita payments found. Create a payment and select Remita as the payment method.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {payments
                        .filter(p => p.paymentMethod === 'remita')
                        .slice(0, 6)
                        .map((payment) => (
                          <Grid item xs={12} md={6} key={payment._id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {payment.student.personalInfo.firstName} {payment.student.personalInfo.lastName}
                                  </Typography>
                                  <Chip
                                    label={payment.status}
                                    color={payment.status === 'completed' ? 'success' :
                                           payment.status === 'pending' ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {payment.description}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  ₦{payment.amount.toLocaleString()}
                                </Typography>
                                {payment.remitaDetails && (
                                  <Typography variant="caption" color="text.secondary">
                                    RRR: {payment.remitaDetails.rrr}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        {paymentStats && <PaymentStats stats={paymentStats} />}
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} />
          Export Payments
        </MenuItem>
        <MenuItem onClick={() => setBulkDialogOpen(true)}>
          <Upload sx={{ mr: 1 }} />
          Import Payments
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Receipt sx={{ mr: 1 }} />
          Generate Report
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={() => setBulkMenuAnchor(null)}>
          <Send sx={{ mr: 1 }} />
          Send Reminders
        </MenuItem>
        <MenuItem onClick={() => setBulkMenuAnchor(null)}>
          <Receipt sx={{ mr: 1 }} />
          Generate Receipts
        </MenuItem>
        <MenuItem onClick={() => setBulkMenuAnchor(null)}>
          <Download sx={{ mr: 1 }} />
          Export Selected
        </MenuItem>
      </Menu>

      {/* Payment Form Dialog */}
      <PaymentForm
        open={paymentFormOpen}
        onClose={() => {
          setPaymentFormOpen(false);
          setEditingPayment(null);
        }}
        onSubmit={handlePaymentSubmit}
        payment={editingPayment}
        loading={createPaymentMutation.isPending || updatePaymentMutation.isPending}
      />

      {/* Remita Payment Dialog */}
      <RemitaPaymentDialog
        open={remitaDialogOpen}
        onClose={() => {
          setRemitaDialogOpen(false);
          setEditingPayment(null);
        }}
        payment={editingPayment}
      />

      {/* Bulk Import Dialog */}
      <BulkPaymentDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />
    </Box>
  );
};

export default PaymentsPage;
