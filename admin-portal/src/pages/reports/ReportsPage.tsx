import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  School,
  Payment,
  People,
  EventAvailable,
  Download,
  Visibility,
  Schedule,
  BarChart as BarChartIcon,
  Analytics,
  CalendarToday,
  AttachMoney,
  Grade,
} from '@mui/icons-material';

// Components
import StatCard from '@/components/Dashboard/StatCard';

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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock report statistics
  const reportStats = [
    {
      title: 'Generated Reports',
      value: '1,247',
      change: '+18%',
      trend: 'up' as const,
      icon: <Assessment />,
      color: '#1976d2',
      subtitle: 'This month',
    },
    {
      title: 'Scheduled Reports',
      value: '23',
      change: '+5%',
      trend: 'up' as const,
      icon: <Schedule />,
      color: '#2e7d32',
      subtitle: 'Active schedules',
    },
    {
      title: 'Data Sources',
      value: '8',
      change: '0%',
      trend: 'neutral' as const,
      icon: <Analytics />,
      color: '#ed6c02',
      subtitle: 'Connected systems',
    },
    {
      title: 'Export Formats',
      value: '4',
      change: '+1',
      trend: 'up' as const,
      icon: <TableChart />,
      color: '#9c27b0',
      subtitle: 'PDF, Excel, CSV, JSON',
    },
  ];

  // Available report categories
  const reportCategories = [
    {
      id: 'academic',
      name: 'Academic Reports',
      icon: <School />,
      color: '#1976d2',
      description: 'Student performance, grades, and academic analytics',
      reports: [
        { name: 'Student Grade Report', description: 'Comprehensive grade analysis by course and semester' },
        { name: 'Course Performance Report', description: 'Course-wise performance metrics and trends' },
        { name: 'Transcript Generation', description: 'Official student transcripts with GPA calculations' },
        { name: 'Academic Progress Report', description: 'Student progress tracking and milestone analysis' },
        { name: 'Faculty Performance Report', description: 'Teaching effectiveness and course delivery metrics' },
      ],
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: <Payment />,
      color: '#2e7d32',
      description: 'Payment tracking, revenue analysis, and financial summaries',
      reports: [
        { name: 'Payment Summary Report', description: 'Comprehensive payment status and revenue analysis' },
        { name: 'Outstanding Fees Report', description: 'Pending payments and overdue fee tracking' },
        { name: 'Revenue Analysis Report', description: 'Monthly and yearly revenue trends and projections' },
        { name: 'Remita Transaction Report', description: 'Detailed Remita payment transaction analysis' },
        { name: 'Financial Audit Report', description: 'Complete financial audit trail and compliance report' },
      ],
    },
    {
      id: 'attendance',
      name: 'Attendance Reports',
      icon: <EventAvailable />,
      color: '#ed6c02',
      description: 'Attendance tracking, patterns, and compliance reports',
      reports: [
        { name: 'Daily Attendance Report', description: 'Daily attendance summary by course and class' },
        { name: 'Student Attendance Report', description: 'Individual student attendance patterns and trends' },
        { name: 'Course Attendance Report', description: 'Course-wise attendance rates and analysis' },
        { name: 'Attendance Compliance Report', description: 'Attendance policy compliance and violations' },
        { name: 'Attendance Trends Report', description: 'Historical attendance patterns and forecasting' },
      ],
    },
    {
      id: 'enrollment',
      name: 'Enrollment Reports',
      icon: <People />,
      color: '#9c27b0',
      description: 'Student enrollment, demographics, and capacity analysis',
      reports: [
        { name: 'Enrollment Summary Report', description: 'Current enrollment statistics and demographics' },
        { name: 'Course Capacity Report', description: 'Course enrollment vs capacity analysis' },
        { name: 'Student Demographics Report', description: 'Student population demographics and trends' },
        { name: 'Enrollment Trends Report', description: 'Historical enrollment patterns and projections' },
        { name: 'Waitlist Analysis Report', description: 'Course waitlist status and management insights' },
      ],
    },
  ];

  // Recent reports
  const recentReports = [
    {
      id: '1',
      name: 'Monthly Payment Summary',
      type: 'Financial',
      generatedBy: 'Admin User',
      generatedAt: '2024-01-15 14:30',
      format: 'PDF',
      size: '2.4 MB',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Student Grade Analysis',
      type: 'Academic',
      generatedBy: 'Academic Officer',
      generatedAt: '2024-01-15 12:15',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed',
    },
    {
      id: '3',
      name: 'Daily Attendance Report',
      type: 'Attendance',
      generatedBy: 'System',
      generatedAt: '2024-01-15 09:00',
      format: 'CSV',
      size: '856 KB',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Enrollment Trends Q4',
      type: 'Enrollment',
      generatedBy: 'Data Analyst',
      generatedAt: '2024-01-14 16:45',
      format: 'PDF',
      size: '3.2 MB',
      status: 'completed',
    },
  ];

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'excel':
      case 'xlsx':
        return <TableChart color="success" />;
      case 'csv':
        return <TableChart color="info" />;
      default:
        return <Assessment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate comprehensive reports and analytics for academic, financial, and administrative data
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" startIcon={<Schedule />}>
              Schedule Report
            </Button>
            <Button variant="contained" startIcon={<Assessment />}>
              Generate Report
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Report Statistics */}
      <Grid container spacing={3} mb={4}>
        {reportStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="reports tabs">
          <Tab label="Report Categories" icon={<Assessment />} />
          <Tab label="Generate Report" icon={<TrendingUp />} />
          <Tab label="Recent Reports" icon={<BarChartIcon />} />
        </Tabs>
      </Box>

      {/* Report Categories Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {reportCategories.map((category) => (
            <Grid item xs={12} md={6} key={category.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: category.color }}>
                      {category.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {category.reports.map((report, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Assessment fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={report.name}
                          secondary={report.description}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small" edge="end">
                            <Download fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Generate Report Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Configuration
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={selectedReportType}
                        label="Report Type"
                        onChange={(e) => setSelectedReportType(e.target.value)}
                      >
                        <MenuItem value="academic">Academic Reports</MenuItem>
                        <MenuItem value="financial">Financial Reports</MenuItem>
                        <MenuItem value="attendance">Attendance Reports</MenuItem>
                        <MenuItem value="enrollment">Enrollment Reports</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Output Format</InputLabel>
                      <Select defaultValue="pdf">
                        <MenuItem value="pdf">PDF Document</MenuItem>
                        <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                        <MenuItem value="csv">CSV File</MenuItem>
                        <MenuItem value="json">JSON Data</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date From"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date To"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Report Title"
                      placeholder="Enter custom report title..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Enter report description..."
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" gap={2}>
                  <Button variant="contained" startIcon={<Assessment />}>
                    Generate Report
                  </Button>
                  <Button variant="outlined" startIcon={<Schedule />}>
                    Schedule Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Preview
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select report type and configure options to see preview
                </Alert>

                <Box textAlign="center" py={4}>
                  <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Report preview will appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Recent Reports Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Recent Reports</Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Export All
              </Button>
            </Box>

            <List>
              {recentReports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getFormatIcon(report.format)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {report.name}
                          </Typography>
                          <Chip
                            label={report.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={report.status}
                            size="small"
                            color={getStatusColor(report.status) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Generated by {report.generatedBy} on {report.generatedAt}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.format} • {report.size}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Download fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentReports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default ReportsPage;
