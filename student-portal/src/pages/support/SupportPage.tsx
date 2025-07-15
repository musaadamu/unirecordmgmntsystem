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
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Support,
  Chat,
  Announcement,
  QuestionAnswer,
  Person,
  Add,
  Notifications,
  MoreVert,
  Phone,
  Email,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import supportService from '@/services/supportService';
import { useAuthStore } from '@/stores/authStore';
import SupportTickets from '@/components/Support/SupportTickets';
import LiveChat from '@/components/Support/LiveChat';
import Announcements from '@/components/Support/Announcements';
import FAQ from '@/components/Support/FAQ';
import AdvisorCommunication from '@/components/Support/AdvisorCommunication';
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
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SupportPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  // Mock support statistics
  const mockSupportStats = {
    totalTickets: 12,
    openTickets: 3,
    resolvedTickets: 9,
    averageResponseTime: 4.5,
    satisfactionRating: 4.2,
  };

  // Mock unread counts
  const mockUnreadCounts = {
    announcements: 5,
    messages: 2,
    tickets: 1,
  };

  // Mock query
  const supportStatsQuery = {
    data: mockSupportStats,
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

  const handleEmergencyContact = () => {
    console.log('Emergency contact initiated');
    handleMenuClose();
  };

  if (supportStatsQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading support information..." />
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
              Student Support
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get help, stay informed, and connect with your academic advisor
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTabValue(0)}
            >
              New Ticket
            </Button>
            
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {supportStatsQuery.data?.openTickets || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {supportStatsQuery.data?.resolvedTickets || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {supportStatsQuery.data?.averageResponseTime || 0}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {supportStatsQuery.data?.satisfactionRating || 0}/5
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Satisfaction
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Emergency Contact Alert */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Need immediate help?</strong> For urgent matters, contact our 24/7 support hotline at{' '}
            <strong>+234-800-HELP (4357)</strong> or email <strong>emergency@university.edu</strong>
          </Typography>
        </Alert>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="support tabs">
          <Tab
            label={
              <Badge badgeContent={mockUnreadCounts.tickets} color="error">
                <Box display="flex" alignItems="center" gap={1}>
                  <Support />
                  <span>Help Desk</span>
                </Box>
              </Badge>
            }
            id="support-tab-0"
            aria-controls="support-tabpanel-0"
          />
          <Tab
            label={
              <Badge badgeContent={mockUnreadCounts.messages} color="error">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chat />
                  <span>Live Chat</span>
                </Box>
              </Badge>
            }
            id="support-tab-1"
            aria-controls="support-tabpanel-1"
          />
          <Tab
            label={
              <Badge badgeContent={mockUnreadCounts.announcements} color="error">
                <Box display="flex" alignItems="center" gap={1}>
                  <Announcement />
                  <span>Announcements</span>
                </Box>
              </Badge>
            }
            id="support-tab-2"
            aria-controls="support-tabpanel-2"
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <QuestionAnswer />
                <span>FAQ</span>
              </Box>
            }
            id="support-tab-3"
            aria-controls="support-tabpanel-3"
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Person />
                <span>Academic Advisor</span>
              </Box>
            }
            id="support-tab-4"
            aria-controls="support-tabpanel-4"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <SupportTickets />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <LiveChat />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Announcements />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <FAQ />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <AdvisorCommunication />
      </TabPanel>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEmergencyContact}>
          <Phone sx={{ mr: 1 }} />
          Emergency Contact
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Email sx={{ mr: 1 }} />
          Email Support
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Notifications sx={{ mr: 1 }} />
          Notification Settings
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SupportPage;
