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
  Checkbox,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Alert,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  Security,
  CheckCircle,
} from '@mui/icons-material';

import { PaymentItem } from '@/services/paymentsService';

interface PaymentItemsProps {
  semester: string;
}

const PaymentItems: React.FC<PaymentItemsProps> = ({ semester }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('remita');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock payment items
  const mockPaymentItems: PaymentItem[] = [
    {
      _id: '1',
      type: 'tuition',
      description: 'Second Semester Tuition Fee',
      amount: 150000,
      currency: 'NGN',
      dueDate: '2024-02-15T00:00:00Z',
      semester: 'Fall',
      academicYear: '2024',
      status: 'pending',
      paidAmount: 0,
      remainingAmount: 150000,
      category: 'mandatory',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '2',
      type: 'laboratory',
      description: 'Computer Science Lab Fee',
      amount: 25000,
      currency: 'NGN',
      dueDate: '2024-03-01T00:00:00Z',
      semester: 'Fall',
      academicYear: '2024',
      status: 'pending',
      paidAmount: 0,
      remainingAmount: 25000,
      category: 'mandatory',
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '3',
      type: 'examination',
      description: 'Final Examination Fee',
      amount: 20000,
      currency: 'NGN',
      dueDate: '2024-04-01T00:00:00Z',
      semester: 'Fall',
      academicYear: '2024',
      status: 'pending',
      paidAmount: 0,
      remainingAmount: 20000,
      category: 'mandatory',
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '4',
      type: 'tuition',
      description: 'First Semester Tuition Fee',
      amount: 225000,
      currency: 'NGN',
      dueDate: '2024-01-15T00:00:00Z',
      semester: 'Fall',
      academicYear: '2024',
      status: 'paid',
      paidAmount: 225000,
      remainingAmount: 0,
      category: 'mandatory',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    },
    {
      _id: '5',
      type: 'accommodation',
      description: 'Hostel Accommodation Fee',
      amount: 80000,
      currency: 'NGN',
      dueDate: '2024-01-20T00:00:00Z',
      semester: 'Fall',
      academicYear: '2024',
      status: 'paid',
      paidAmount: 80000,
      remainingAmount: 0,
      category: 'optional',
      priority: 'low',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
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
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'partial':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tuition':
        return '🎓';
      case 'accommodation':
        return '🏠';
      case 'library':
        return '📚';
      case 'laboratory':
        return '🔬';
      case 'examination':
        return '📝';
      case 'registration':
        return '📋';
      default:
        return '💰';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  const getFilteredItems = () => {
    return mockPaymentItems.filter(item => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    });
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const pendingItems = getFilteredItems().filter(item => item.status === 'pending');
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pendingItems.map(item => item._id)));
    }
  };

  const getSelectedTotal = () => {
    return getFilteredItems()
      .filter(item => selectedItems.has(item._id))
      .reduce((sum, item) => sum + item.remainingAmount, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedItems.size === 0) return;
    setPaymentDialogOpen(true);
  };

  const handlePayment = () => {
    console.log('Processing payment...', {
      items: Array.from(selectedItems),
      method: paymentMethod,
      amount: getSelectedTotal(),
    });
    setPaymentDialogOpen(false);
    setSelectedItems(new Set());
  };

  const filteredItems = getFilteredItems();
  const pendingItems = filteredItems.filter(item => item.status === 'pending');

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Payment Items - {semester}
        </Typography>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          
          {selectedItems.size > 0 && (
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={handleProceedToPayment}
            >
              Pay Selected ({formatCurrency(getSelectedTotal())})
            </Button>
          )}
        </Box>
      </Box>

      {/* Payment Items Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedItems.size > 0 && selectedItems.size < pendingItems.length}
                      checked={pendingItems.length > 0 && selectedItems.size === pendingItems.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Due Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item._id}
                    sx={{
                      bgcolor: isOverdue(item.dueDate) && item.status === 'pending' 
                        ? 'rgba(211, 47, 47, 0.04)' 
                        : 'transparent',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.has(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        disabled={item.status !== 'pending'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {getTypeIcon(item.type)}
                        </span>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.category} • {item.semester} {item.academicYear}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.amount)}
                      </Typography>
                      {item.paidAmount > 0 && (
                        <Typography variant="caption" color="success.main" display="block">
                          Paid: {formatCurrency(item.paidAmount)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        color={isOverdue(item.dueDate) && item.status === 'pending' ? 'error' : 'text.primary'}
                      >
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Typography>
                      {isOverdue(item.dueDate) && item.status === 'pending' && (
                        <Typography variant="caption" color="error" display="block">
                          Overdue
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.priority}
                        size="small"
                        color={getPriorityColor(item.priority) as any}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Complete Payment
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Payment Summary */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  You are about to pay for {selectedItems.size} item(s) totaling {formatCurrency(getSelectedTotal())}
                </Typography>
              </Alert>
            </Grid>

            {/* Payment Method Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Select Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="remita"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Remita</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay with bank transfer or card via Remita
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="paystack"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CreditCard />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Paystack</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay with debit/credit card via Paystack
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="bank_transfer"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Direct Bank Transfer</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Transfer directly to university account
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>

            {/* Security Notice */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={1}>
                <Security color="primary" />
                <Typography variant="body2">
                  Your payment information is secured with 256-bit SSL encryption
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            startIcon={<Payment />}
          >
            Proceed to Pay {formatCurrency(getSelectedTotal())}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentItems;
