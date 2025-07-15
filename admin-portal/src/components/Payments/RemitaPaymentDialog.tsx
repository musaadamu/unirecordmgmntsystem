import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Phone,
  CheckCircle,
  Launch,
  Refresh,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import paymentService from '@/services/paymentService';
import { Payment } from '@/types';

interface RemitaPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  payment?: Payment | null;
}

const RemitaPaymentDialog: React.FC<RemitaPaymentDialogProps> = ({
  open,
  onClose,
  payment,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [remitaResponse, setRemitaResponse] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const queryClient = useQueryClient();

  // Initiate Remita payment mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: paymentService.initiateRemitaPayment,
    onSuccess: (response) => {
      setRemitaResponse(response);
      setActiveStep(1);
      toast.success('Remita payment initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to initiate Remita payment');
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: (rrr: string) => paymentService.verifyRemitaPayment(rrr),
    onSuccess: (updatedPayment) => {
      setPaymentStatus(updatedPayment.status);
      if (updatedPayment.status === 'completed') {
        setActiveStep(2);
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
        toast.success('Payment verified successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    },
  });

  const handleInitiatePayment = () => {
    if (!payment) return;

    const paymentRequest = {
      studentId: payment.studentId,
      amount: payment.amount,
      paymentType: payment.paymentType,
      description: payment.description,
      semester: payment.semester,
      academicYear: payment.academicYear,
      dueDate: payment.dueDate,
    };

    initiatePaymentMutation.mutate(paymentRequest);
  };

  const handleVerifyPayment = () => {
    if (remitaResponse?.rrr) {
      verifyPaymentMutation.mutate(remitaResponse.rrr);
    }
  };

  const handleOpenRemitaPortal = () => {
    if (remitaResponse?.paymentUrl) {
      window.open(remitaResponse.paymentUrl, '_blank');
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setRemitaResponse(null);
    setPaymentStatus('');
    onClose();
  };

  const steps = ['Initiate Payment', 'Make Payment', 'Verify Payment'];

  const paymentMethods = [
    {
      name: 'Bank Transfer',
      icon: <AccountBalance />,
      description: 'Transfer from your bank account',
      available: true,
    },
    {
      name: 'Debit/Credit Card',
      icon: <CreditCard />,
      description: 'Pay with Visa, Mastercard, or Verve',
      available: true,
    },
    {
      name: 'USSD',
      icon: <Phone />,
      description: 'Pay using your mobile phone',
      available: true,
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: '#1976d2' }}>
            <CreditCard />
          </Avatar>
          <Box>
            <Typography variant="h6">Remita Payment</Typography>
            <Typography variant="body2" color="text.secondary">
              Secure online payment processing
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {payment && (
          <Box>
            {/* Payment Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Student
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {payment.student.personalInfo.firstName} {payment.student.personalInfo.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Student ID
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {payment.student.studentId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Type
                    </Typography>
                    <Chip
                      label={payment.paymentType.replace('_', ' ').toUpperCase()}
                      size="small"
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₦{payment.amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {payment.description}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Process Stepper */}
            <Box mb={3}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Step Content */}
            {activeStep === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Click "Initiate Payment" to generate a Remita Retrieval Reference (RRR) for this payment.
                </Alert>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Available Payment Methods
                    </Typography>
                    <Grid container spacing={2}>
                      {paymentMethods.map((method, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                            <Box mb={1}>
                              {method.icon}
                            </Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {method.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}

            {activeStep === 1 && remitaResponse && (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Payment initiated successfully! Use the RRR below to complete your payment.
                </Alert>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Remita Retrieval Reference (RRR)
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {remitaResponse.rrr}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Order ID
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {remitaResponse.orderId}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      How to Pay
                    </Typography>
                    <Box component="ol" sx={{ pl: 2 }}>
                      <Typography component="li" variant="body2" gutterBottom>
                        Click "Open Remita Portal" to pay online with your card or bank account
                      </Typography>
                      <Typography component="li" variant="body2" gutterBottom>
                        Or visit any bank and provide the RRR: <strong>{remitaResponse.rrr}</strong>
                      </Typography>
                      <Typography component="li" variant="body2" gutterBottom>
                        Or use USSD: Dial *347*RRR# from your mobile phone
                      </Typography>
                      <Typography component="li" variant="body2" gutterBottom>
                        After payment, click "Verify Payment" to confirm
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {activeStep === 2 && (
              <Box textAlign="center">
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Payment Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Your payment has been verified and processed successfully.
                </Typography>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Receipt will be generated automatically and sent to the student's email.
                </Alert>
              </Box>
            )}

            {/* Loading States */}
            {(initiatePaymentMutation.isPending || verifyPaymentMutation.isPending) && (
              <Box mt={2}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                  {initiatePaymentMutation.isPending ? 'Initiating payment...' : 'Verifying payment...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          {activeStep === 2 ? 'Close' : 'Cancel'}
        </Button>
        
        {activeStep === 0 && (
          <Button
            onClick={handleInitiatePayment}
            variant="contained"
            disabled={initiatePaymentMutation.isPending}
          >
            Initiate Payment
          </Button>
        )}
        
        {activeStep === 1 && (
          <>
            <Button
              onClick={handleOpenRemitaPortal}
              variant="outlined"
              startIcon={<Launch />}
              disabled={!remitaResponse?.paymentUrl}
            >
              Open Remita Portal
            </Button>
            <Button
              onClick={handleVerifyPayment}
              variant="contained"
              startIcon={<Refresh />}
              disabled={verifyPaymentMutation.isPending}
            >
              Verify Payment
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RemitaPaymentDialog;
