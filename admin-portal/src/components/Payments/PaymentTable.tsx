import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Edit,
  Receipt,
  Send,
  MoreVert,
  CheckCircle,
  CreditCard,
  AccountBalance,
  AttachMoney,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { Payment, PaginationInfo } from '@/types';

interface PaymentTableProps {
  payments: Payment[];
  selectedPayments: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (payment: Payment) => void;
  onMarkAsPaid: (payment: Payment) => void;
  onSendReminder: (paymentId: string) => void;
  onGenerateReceipt: (paymentId: string) => void;
  onInitiateRemita: (payment: Payment) => void;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  selectedPayments,
  onSelectionChange,
  onEdit,
  onMarkAsPaid,
  onSendReminder,
  onGenerateReceipt,
  onInitiateRemita,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(payments.map(payment => payment._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectPayment = (paymentId: string) => {
    const selectedIndex = selectedPayments.indexOf(paymentId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedPayments, paymentId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedPayments.slice(1));
    } else if (selectedIndex === selectedPayments.length - 1) {
      newSelected = newSelected.concat(selectedPayments.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedPayments.slice(0, selectedIndex),
        selectedPayments.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, payment: Payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'tuition':
        return 'primary';
      case 'accommodation':
        return 'secondary';
      case 'library':
        return 'info';
      case 'laboratory':
        return 'warning';
      case 'examination':
        return 'error';
      case 'registration':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'remita':
        return <CreditCard fontSize="small" />;
      case 'bank_transfer':
        return <AccountBalance fontSize="small" />;
      case 'cash':
        return <AttachMoney fontSize="small" />;
      default:
        return <CreditCard fontSize="small" />;
    }
  };

  const formatPaymentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isSelected = (paymentId: string) => selectedPayments.indexOf(paymentId) !== -1;

  const isOverdue = (payment: Payment) => {
    return payment.status === 'pending' && new Date(payment.dueDate) < new Date();
  };

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedPayments.length > 0 && selectedPayments.length < payments.length}
                  checked={payments.length > 0 && selectedPayments.length === payments.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Payment Details</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => {
              const isItemSelected = isSelected(payment._id);
              const overdue = isOverdue(payment);

              return (
                <TableRow
                  key={payment._id}
                  hover
                  selected={isItemSelected}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: overdue ? 'rgba(211, 47, 47, 0.04)' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelectPayment(payment._id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getPaymentTypeColor(payment.paymentType) + '.main',
                        }}
                      >
                        {payment.student.personalInfo.firstName[0]}{payment.student.personalInfo.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {payment.student.personalInfo.firstName} {payment.student.personalInfo.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.student.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPaymentType(payment.paymentType)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.description}
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={`${payment.semester} ${payment.academicYear}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ₦{payment.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.currency}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                      icon={payment.status === 'completed' ? <CheckCircle /> : undefined}
                    />
                    {overdue && (
                      <Typography variant="caption" color="error" display="block">
                        Overdue
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <Typography variant="body2">
                        {formatPaymentMethod(payment.paymentMethod)}
                      </Typography>
                    </Box>
                    {payment.remitaDetails && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        RRR: {payment.remitaDetails.rrr}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                    {payment.paidDate && (
                      <Typography variant="caption" color="success.main" display="block">
                        Paid: {format(new Date(payment.paidDate), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit Payment">
                        <IconButton size="small" onClick={() => onEdit(payment)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {payment.status === 'completed' && (
                        <Tooltip title="Generate Receipt">
                          <IconButton size="small" onClick={() => onGenerateReceipt(payment._id)}>
                            <Receipt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {payment.status === 'pending' && (
                        <Tooltip title="Send Reminder">
                          <IconButton size="small" onClick={() => onSendReminder(payment._id)}>
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, payment)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={typeof pagination.totalItems === 'number' ? pagination.totalItems : 0}
          page={typeof pagination.currentPage === 'number' ? pagination.currentPage - 1 : 0}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={25}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedPayment) onEdit(selectedPayment);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Payment
        </MenuItem>
        
        {selectedPayment?.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedPayment) onMarkAsPaid(selectedPayment);
            handleMenuClose();
          }}>
            <CheckCircle sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}
        
        {selectedPayment?.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedPayment) onInitiateRemita(selectedPayment);
            handleMenuClose();
          }}>
            <CreditCard sx={{ mr: 1 }} />
            Pay with Remita
          </MenuItem>
        )}
        
        {selectedPayment?.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedPayment) onSendReminder(selectedPayment._id);
            handleMenuClose();
          }}>
            <Send sx={{ mr: 1 }} />
            Send Reminder
          </MenuItem>
        )}
        
        {selectedPayment?.status === 'completed' && (
          <MenuItem onClick={() => {
            if (selectedPayment) onGenerateReceipt(selectedPayment._id);
            handleMenuClose();
          }}>
            <Receipt sx={{ mr: 1 }} />
            Generate Receipt
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PaymentTable;
