import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download,
  Visibility,
  Receipt,
  FilterList,
  Search,
  CheckCircle,
  Error,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

import { Payment } from '@/services/paymentsService';

interface PaymentHistoryProps {
  semester: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ semester }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Mock payment history data
  const mockPayments: Payment[] = [
    {
      _id: '1',
      student: 'student1',
      paymentItems: ['item1', 'item2'],
      totalAmount: 225000,
      paidAmount: 225000,
      currency: 'NGN',
      paymentMethod: 'remita',
      paymentReference: 'RMT001234567',
      transactionId: 'TXN001',
      status: 'completed',
      paymentDate: '2024-01-10T10:30:00Z',
      description: 'First Semester Tuition Payment',
      receipt: {
        receiptNumber: 'RCP001',
        downloadUrl: '/receipts/rcp001.pdf',
        generatedAt: '2024-01-10T10:35:00Z',
      },
      metadata: {
        gateway: 'remita',
        gatewayReference: 'RMT001234567',
      },
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:35:00Z',
    },
    {
      _id: '2',
      student: 'student1',
      paymentItems: ['item3'],
      totalAmount: 80000,
      paidAmount: 80000,
      currency: 'NGN',
      paymentMethod: 'bank_transfer',
      paymentReference: 'BT002345678',
      transactionId: 'TXN002',
      status: 'completed',
      paymentDate: '2024-01-18T14:20:00Z',
      description: 'Accommodation Fee Payment',
      receipt: {
        receiptNumber: 'RCP002',
        downloadUrl: '/receipts/rcp002.pdf',
        generatedAt: '2024-01-18T14:25:00Z',
      },
      metadata: {
        gateway: 'bank_transfer',
        gatewayReference: 'BT002345678',
      },
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-18T14:25:00Z',
    },
    {
      _id: '3',
      student: 'student1',
      paymentItems: ['item4'],
      totalAmount: 15000,
      paidAmount: 15000,
      currency: 'NGN',
      paymentMethod: 'paystack',
      paymentReference: 'PS003456789',
      transactionId: 'TXN003',
      status: 'completed',
      paymentDate: '2024-01-25T09:15:00Z',
      description: 'Library Fee Payment',
      receipt: {
        receiptNumber: 'RCP003',
        downloadUrl: '/receipts/rcp003.pdf',
        generatedAt: '2024-01-25T09:20:00Z',
      },
      metadata: {
        gateway: 'paystack',
        gatewayReference: 'PS003456789',
      },
      createdAt: '2024-01-25T09:00:00Z',
      updatedAt: '2024-01-25T09:20:00Z',
    },
    {
      _id: '4',
      student: 'student1',
      paymentItems: ['item5'],
      totalAmount: 50000,
      paidAmount: 0,
      currency: 'NGN',
      paymentMethod: 'remita',
      paymentReference: 'RMT004567890',
      status: 'failed',
      paymentDate: '2024-02-01T16:45:00Z',
      description: 'Registration Fee Payment',
      createdAt: '2024-02-01T16:30:00Z',
      updatedAt: '2024-02-01T16:50:00Z',
    },
    {
      _id: '5',
      student: 'student1',
      paymentItems: ['item6'],
      totalAmount: 30000,
      paidAmount: 30000,
      currency: 'NGN',
      paymentMethod: 'flutterwave',
      paymentReference: 'FW005678901',
      transactionId: 'TXN005',
      status: 'completed',
      paymentDate: '2024-02-05T11:30:00Z',
      description: 'Sports Fee Payment',
      receipt: {
        receiptNumber: 'RCP005',
        downloadUrl: '/receipts/rcp005.pdf',
        generatedAt: '2024-02-05T11:35:00Z',
      },
      metadata: {
        gateway: 'flutterwave',
        gatewayReference: 'FW005678901',
      },
      createdAt: '2024-02-05T11:15:00Z',
      updatedAt: '2024-02-05T11:35:00Z',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
      case 'processing':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'failed':
      case 'cancelled':
        return <Error sx={{ color: 'error.main' }} />;
      case 'refunded':
        return <Refresh sx={{ color: 'info.main' }} />;
      default:
        return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'remita':
        return 'Remita';
      case 'paystack':
        return 'Paystack';
      case 'flutterwave':
        return 'Flutterwave';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'card':
        return 'Card Payment';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  const getFilteredPayments = () => {
    return mockPayments.filter(payment => {
      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
      
      // Method filter
      if (methodFilter !== 'all' && payment.paymentMethod !== methodFilter) return false;
      
      // Search query
      if (searchQuery && !payment.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !payment.paymentReference.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Date range filter
      const paymentDate = new Date(payment.paymentDate);
      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;
      
      return true;
    });
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    if (payment.receipt) {
      console.log('Downloading receipt:', payment.receipt.receiptNumber);
      // In a real app, this would trigger the download
    }
  };

  const filteredPayments = getFilteredPayments();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box>
      {/* Header and Filters */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment History - {semester}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Method</InputLabel>
              <Select
                value={methodFilter}
                label="Method"
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="remita">Remita</MenuItem>
                <MenuItem value="paystack">Paystack</MenuItem>
                <MenuItem value="flutterwave">Flutterwave</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setStatusFilter('all');
                setMethodFilter('all');
                setSearchQuery('');
                setStartDate(null);
                setEndDate(null);
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Payment History Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Details</TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Method</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {payment.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ref: {payment.paymentReference}
                        </Typography>
                        {payment.transactionId && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            TXN: {payment.transactionId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(payment.totalAmount)}
                      </Typography>
                      {payment.paidAmount !== payment.totalAmount && (
                        <Typography variant="caption" color="success.main" display="block">
                          Paid: {formatCurrency(payment.paidAmount)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getMethodDisplayName(payment.paymentMethod)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {format(parseISO(payment.paymentDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(parseISO(payment.paymentDate), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        {getStatusIcon(payment.status)}
                        <Chip
                          label={payment.status}
                          size="small"
                          color={getStatusColor(payment.status) as any}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {payment.receipt && (
                          <Tooltip title="Download Receipt">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadReceipt(payment)}
                              color="primary"
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payment Details
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  {selectedPayment.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  {formatCurrency(selectedPayment.totalAmount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                <Typography variant="body1" gutterBottom>
                  {getMethodDisplayName(selectedPayment.paymentMethod)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedPayment.status}
                  color={getStatusColor(selectedPayment.status) as any}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Payment Reference</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.paymentReference}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.transactionId || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Payment Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {format(parseISO(selectedPayment.paymentDate), 'MMM dd, yyyy h:mm a')}
                </Typography>
              </Grid>
              
              {selectedPayment.receipt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Receipt</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedPayment.receipt.receiptNumber}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          {selectedPayment?.receipt && (
            <Button
              onClick={() => selectedPayment && handleDownloadReceipt(selectedPayment)}
              variant="contained"
              startIcon={<Receipt />}
            >
              Download Receipt
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;
