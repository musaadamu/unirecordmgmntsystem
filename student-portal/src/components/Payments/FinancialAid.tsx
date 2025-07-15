import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import {
  School,
  AttachMoney,
  Description,
  CheckCircle,
  Schedule,
  Warning,
  Add,
  Upload,
  ExpandMore,
  Download,
  Visibility,
} from '@mui/icons-material';

import { FinancialAid as FinancialAidType } from '@/services/paymentsService';

const FinancialAid: React.FC = () => {
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedAid, setSelectedAid] = useState<FinancialAidType | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    additionalInfo: '',
    documents: [] as File[],
  });

  // Mock financial aid data
  const mockFinancialAid: FinancialAidType[] = [
    {
      _id: '1',
      student: 'student1',
      type: 'scholarship',
      name: 'Academic Excellence Scholarship',
      description: 'Merit-based scholarship for students with outstanding academic performance',
      amount: 100000,
      currency: 'NGN',
      semester: 'Fall',
      academicYear: '2024',
      status: 'disbursed',
      provider: {
        name: 'University Foundation',
        type: 'university',
        contact: 'foundation@university.edu',
      },
      requirements: [
        'Minimum GPA of 3.5',
        'Full-time enrollment',
        'Community service participation',
      ],
      disbursementDate: '2024-01-15T00:00:00Z',
      renewalRequired: true,
      documents: [
        {
          name: 'Academic Transcript',
          type: 'pdf',
          status: 'approved',
          uploadedAt: '2024-01-01T00:00:00Z',
          url: '/documents/transcript.pdf',
        },
        {
          name: 'Community Service Certificate',
          type: 'pdf',
          status: 'approved',
          uploadedAt: '2024-01-01T00:00:00Z',
          url: '/documents/service.pdf',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      _id: '2',
      student: 'student1',
      type: 'grant',
      name: 'Need-Based Grant',
      description: 'Financial assistance for students demonstrating financial need',
      amount: 75000,
      currency: 'NGN',
      semester: 'Spring',
      academicYear: '2024',
      status: 'approved',
      provider: {
        name: 'Federal Government',
        type: 'government',
        contact: 'grants@education.gov',
      },
      requirements: [
        'Family income below threshold',
        'Nigerian citizenship',
        'Satisfactory academic progress',
      ],
      applicationDeadline: '2024-03-01T00:00:00Z',
      renewalRequired: false,
      documents: [
        {
          name: 'Income Statement',
          type: 'pdf',
          status: 'approved',
          uploadedAt: '2024-02-01T00:00:00Z',
          url: '/documents/income.pdf',
        },
        {
          name: 'Birth Certificate',
          type: 'pdf',
          status: 'approved',
          uploadedAt: '2024-02-01T00:00:00Z',
          url: '/documents/birth.pdf',
        },
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      _id: '3',
      student: 'student1',
      type: 'work_study',
      name: 'Campus Work-Study Program',
      description: 'Part-time employment opportunity on campus to help with educational expenses',
      amount: 50000,
      currency: 'NGN',
      semester: 'Fall',
      academicYear: '2024',
      status: 'pending_documents',
      provider: {
        name: 'Student Affairs Office',
        type: 'university',
        contact: 'workstudy@university.edu',
      },
      requirements: [
        'Demonstrated financial need',
        'Minimum 2.5 GPA',
        'Available for 10-15 hours per week',
      ],
      applicationDeadline: '2024-02-28T00:00:00Z',
      renewalRequired: true,
      documents: [
        {
          name: 'Work Authorization Form',
          type: 'pdf',
          status: 'required',
        },
        {
          name: 'Schedule Availability',
          type: 'pdf',
          status: 'submitted',
          uploadedAt: '2024-02-10T00:00:00Z',
          url: '/documents/schedule.pdf',
        },
      ],
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
  ];

  // Mock available aid opportunities
  const availableAid = [
    {
      _id: 'aid1',
      name: 'STEM Excellence Scholarship',
      type: 'scholarship',
      amount: 150000,
      deadline: '2024-03-15T00:00:00Z',
      description: 'Scholarship for outstanding students in Science, Technology, Engineering, and Mathematics',
      provider: 'Tech Industry Foundation',
    },
    {
      _id: 'aid2',
      name: 'Sports Achievement Grant',
      type: 'grant',
      amount: 80000,
      deadline: '2024-04-01T00:00:00Z',
      description: 'Grant for student athletes with exceptional performance',
      provider: 'Sports Development Fund',
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
      case 'disbursed':
        return 'success';
      case 'approved':
        return 'info';
      case 'applied':
      case 'pending_documents':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disbursed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'approved':
        return <CheckCircle sx={{ color: 'info.main' }} />;
      case 'applied':
      case 'pending_documents':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'rejected':
        return <Warning sx={{ color: 'error.main' }} />;
      default:
        return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'info';
      case 'required':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTotalAidAmount = () => {
    return mockFinancialAid
      .filter(aid => aid.status === 'disbursed' || aid.status === 'approved')
      .reduce((sum, aid) => sum + aid.amount, 0);
  };

  const handleApplyForAid = (aid: any) => {
    setSelectedAid(aid);
    setApplicationDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    console.log('Submitting application...', {
      aidId: selectedAid?._id,
      additionalInfo: applicationForm.additionalInfo,
      documents: applicationForm.documents,
    });
    setApplicationDialogOpen(false);
    setApplicationForm({ additionalInfo: '', documents: [] });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setApplicationForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Financial Aid & Scholarships
      </Typography>

      <Grid container spacing={3}>
        {/* Financial Aid Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Aid Summary
              </Typography>
              
              <Box mb={2}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {formatCurrency(getTotalAidAmount())}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Financial Aid
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Active Aid Programs: {mockFinancialAid.filter(aid => 
                    aid.status === 'disbursed' || aid.status === 'approved'
                  ).length}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Pending Applications: {mockFinancialAid.filter(aid => 
                    aid.status === 'applied' || aid.status === 'pending_documents'
                  ).length}
                </Typography>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => setApplicationDialogOpen(true)}
              >
                Apply for Aid
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Financial Aid */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                My Financial Aid
              </Typography>
              
              {mockFinancialAid.map((aid) => (
                <Accordion key={aid._id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {aid.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {aid.provider.name} • {aid.type}
                        </Typography>
                      </Box>
                      
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatCurrency(aid.amount)}
                        </Typography>
                        <Chip
                          label={aid.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(aid.status) as any}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {aid.description}
                        </Typography>
                        
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Requirements
                        </Typography>
                        <List dense>
                          {aid.requirements.map((req, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={<Typography variant="body2">{req}</Typography>}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Documents
                        </Typography>
                        <List dense>
                          {aid.documents.map((doc, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon>
                                <Description />
                              </ListItemIcon>
                              <ListItemText
                                primary={doc.name}
                                secondary={
                                  <Chip
                                    label={doc.status.replace('_', ' ')}
                                    size="small"
                                    color={getDocumentStatusColor(doc.status) as any}
                                    variant="outlined"
                                  />
                                }
                              />
                              {doc.url && (
                                <IconButton size="small">
                                  <Download />
                                </IconButton>
                              )}
                            </ListItem>
                          ))}
                        </List>
                        
                        {aid.disbursementDate && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Disbursement Date
                            </Typography>
                            <Typography variant="body2">
                              {new Date(aid.disbursementDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        
                        {aid.applicationDeadline && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Application Deadline
                            </Typography>
                            <Typography variant="body2">
                              {new Date(aid.applicationDeadline).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Opportunities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Available Opportunities
              </Typography>
              
              <Grid container spacing={2}>
                {availableAid.map((aid) => (
                  <Grid item xs={12} md={6} key={aid._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {aid.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {aid.provider}
                            </Typography>
                          </Box>
                          <Chip
                            label={aid.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {aid.description}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {formatCurrency(aid.amount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Deadline: {new Date(aid.deadline).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApplyForAid(aid)}
                          >
                            Apply
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onClose={() => setApplicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for Financial Aid
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Please provide all required information and documents for your application.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Information"
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({
                  ...prev,
                  additionalInfo: e.target.value
                }))}
                placeholder="Provide any additional information that supports your application..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Upload Documents
              </Typography>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileUpload}
                style={{ marginBottom: 16 }}
              />
              
              {applicationForm.documents.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Selected files:
                  </Typography>
                  {applicationForm.documents.map((file, index) => (
                    <Typography key={index} variant="body2">
                      • {file.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={!applicationForm.additionalInfo}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialAid;
