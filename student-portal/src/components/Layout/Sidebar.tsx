import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  School,
  Grade,
  Payment,
  Schedule,
  Person,
  Notifications,
  Settings,
  Help,
} from '@mui/icons-material';

import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    color: '#1976d2',
  },
  {
    text: 'My Courses',
    icon: <School />,
    path: '/courses',
    color: '#2e7d32',
  },
  {
    text: 'My Grades',
    icon: <Grade />,
    path: '/grades',
    color: '#ed6c02',
  },
  {
    text: 'Payments & Fees',
    icon: <Payment />,
    path: '/payments',
    color: '#9c27b0',
  },
  {
    text: 'My Schedule',
    icon: <Schedule />,
    path: '/schedule',
    color: '#d32f2f',
  },
  {
    text: 'Notifications',
    icon: <Notifications />,
    path: '/notifications',
    color: '#0288d1',
    badge: 3,
  },
];

const bottomItems = [
  {
    text: 'My Profile',
    icon: <Person />,
    path: '/profile',
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings',
  },
  {
    text: 'Help & Support',
    icon: <Help />,
    path: '/help',
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  isMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          Student Portal
        </Typography>
        {user && (
          <Box>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
              src={user.personalInfo.profilePicture}
            >
              {user.personalInfo.firstName[0]}{user.personalInfo.lastName[0]}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {user.personalInfo.firstName} {user.personalInfo.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.academicInfo.studentId}
            </Typography>
            <Chip
              label={user.academicInfo.program}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: `${item.color}15`,
                    '&:hover': {
                      bgcolor: `${item.color}25`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '& .MuiListItemText-primary': {
                      color: item.color,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? item.color : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Bottom Navigation */}
      <Box sx={{ py: 2 }}>
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Academic Info */}
      {user && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', m: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Academic Progress
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">GPA</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {user.academicInfo.gpa.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Credits</Typography>
            <Typography variant="body2" fontWeight="bold">
              {user.academicInfo.completedCredits}/{user.academicInfo.totalCredits}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Level</Typography>
            <Typography variant="body2" fontWeight="bold">
              {user.academicInfo.level}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
