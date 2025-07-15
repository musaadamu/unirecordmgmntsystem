import React, { useState, useCallback } from 'react';
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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error,
  Info,
  Group,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import userService from '@/services/userService';

interface BulkUserDialogProps {
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
      id={`bulk-tabpanel-${index}`}
      aria-labelledby={`bulk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const BulkUserDialog: React.FC<BulkUserDialogProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [csvData, setCsvData] = useState('');

  const queryClient = useQueryClient();

  // CSV Import mutation
  const csvImportMutation = useMutation({
    mutationFn: (file: File) => userService.importUsersFromCSV(file, setUploadProgress),
    onSuccess: (result) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success(`Successfully imported ${result.successful.length} users`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import users');
    },
  });

  // Manual bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (users: any[]) => userService.bulkRegisterUsers(users),
    onSuccess: (result) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success(`Successfully created ${result.successful.length} users`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create users');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      csvImportMutation.mutate(file);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  }, [csvImportMutation]);

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

  const handleManualSubmit = () => {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {};
        headers.forEach((header, index) => {
          if (header === 'email') user.email = values[index];
          if (header === 'firstName') user.personalInfo = { ...user.personalInfo, firstName: values[index] };
          if (header === 'lastName') user.personalInfo = { ...user.personalInfo, lastName: values[index] };
          if (header === 'role') user.role = values[index];
          if (header === 'phone') user.contactInfo = { ...user.contactInfo, phone: values[index] };
        });
        return user;
      });

      bulkCreateMutation.mutate(users);
    } catch (error) {
      toast.error('Invalid CSV format');
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'email,firstName,lastName,role,phone\n' +
      'john.doe@example.com,John,Doe,student,+1234567890\n' +
      'jane.smith@example.com,Jane,Smith,academic_staff,+1234567891';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setUploadResult(null);
    setUploadProgress(0);
    setCsvData('');
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Group />
          Bulk User Management
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="CSV Upload" />
            <Tab label="Manual Entry" />
            <Tab label="Results" disabled={!uploadResult} />
          </Tabs>
        </Box>

        {/* CSV Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV file with user information. Make sure to include required fields: email, firstName, lastName, role.
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

            {csvImportMutation.isPending && (
              <Box mt={3}>
                <Typography variant="body2" gutterBottom>
                  Uploading and processing users...
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary">
                  {uploadProgress}% complete
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Manual Entry Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter user data in CSV format. Each line should contain: email, firstName, lastName, role, phone
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="CSV Data"
              placeholder="email,firstName,lastName,role,phone&#10;john.doe@example.com,John,Doe,student,+1234567890&#10;jane.smith@example.com,Jane,Smith,academic_staff,+1234567891"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              onClick={handleManualSubmit}
              disabled={!csvData.trim() || bulkCreateMutation.isPending}
              fullWidth
            >
              {bulkCreateMutation.isPending ? 'Processing...' : 'Create Users'}
            </Button>
          </Box>
        </TabPanel>

        {/* Results Tab */}
        <TabPanel value={tabValue} index={2}>
          {uploadResult && (
            <Box>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Import Results
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <Alert severity="success" sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      <strong>{uploadResult.successful.length}</strong> users created successfully
                    </Typography>
                  </Alert>
                  {uploadResult.failed.length > 0 && (
                    <Alert severity="error" sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        <strong>{uploadResult.failed.length}</strong> users failed to create
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Box>

              {uploadResult.successful.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Successfully Created Users
                  </Typography>
                  <List dense>
                    {uploadResult.successful.slice(0, 5).map((user: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={user.email}
                          secondary={`Role: ${user.role} | ID: ${user.userId}`}
                        />
                      </ListItem>
                    ))}
                    {uploadResult.successful.length > 5 && (
                      <ListItem>
                        <ListItemText
                          primary={`... and ${uploadResult.successful.length - 5} more users`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {uploadResult.failed.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Failed to Create Users
                  </Typography>
                  <List dense>
                    {uploadResult.failed.map((failure: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Error color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={failure.email}
                          secondary={failure.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {uploadResult ? 'Close' : 'Cancel'}
        </Button>
        {uploadResult && (
          <Button
            variant="contained"
            onClick={() => setTabValue(0)}
          >
            Import More Users
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkUserDialog;
