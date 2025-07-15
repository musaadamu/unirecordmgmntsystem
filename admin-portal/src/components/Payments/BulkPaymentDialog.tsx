import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Payment,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface BulkPaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

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
      id={`bulk-payment-tabpanel-${index}`}
      aria-labelledby={`bulk-payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const BulkPaymentDialog: React.FC<BulkPaymentDialogProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [csvData, setCsvData] = useState('');

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      // TODO: Handle CSV file upload
      console.log('CSV file uploaded:', file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const downloadTemplate = () => {
    const csvContent = 'studentId,paymentType,amount,currency,semester,academicYear,description,dueDate\n' +
      'S001,tuition,150000,NGN,fall,2024,Tuition fees for Fall 2024,2024-12-31\n' +
      'S002,accommodation,80000,NGN,fall,2024,Accommodation fees for Fall 2024,2024-12-31';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payment_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCsvData('');
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Payment />
          Bulk Payment Management
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Bulk payment import functionality will be fully implemented in the next update.
          This is a preview of the interface.
        </Alert>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="CSV Upload" />
            <Tab label="Manual Entry" />
          </Tabs>
        </Box>

        {/* CSV Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV file with payment information. Required fields: studentId, paymentType, amount, semester, academicYear, description, dueDate.
            </Alert>

            <Box mb={3}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
                fullWidth
              >
                Download CSV Template
              </Button>
            </Box>

            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the CSV file here' : 'Drag & drop CSV file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select file
              </Typography>
            </Paper>
          </Box>
        </TabPanel>

        {/* Manual Entry Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter payment data in CSV format. Each line should contain: studentId, paymentType, amount, currency, semester, academicYear, description, dueDate
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="CSV Data"
              placeholder="studentId,paymentType,amount,currency,semester,academicYear,description,dueDate&#10;S001,tuition,150000,NGN,fall,2024,Tuition fees for Fall 2024,2024-12-31&#10;S002,accommodation,80000,NGN,fall,2024,Accommodation fees for Fall 2024,2024-12-31"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              disabled={!csvData.trim()}
              fullWidth
            >
              Create Payments
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkPaymentDialog;
