import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Person,
  Settings,
  Logout,
  School,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import authService from '@/services/authService';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      // Even if the API call fails, we should still log out locally
      logout();
      navigate('/login');
    },
  });

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    handleProfileMenuClose();
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
    handleNotificationMenuClose();
  };

  // Mock notifications count
  const notificationCount = 3;

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        {/* Menu Button (Mobile) */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            {getPageTitle(window.location.pathname)}
          </Typography>
          {user && (
            <Typography variant="caption" color="text.secondary">
              Welcome back, {user.personalInfo.firstName}!
            </Typography>
          )}
        </Box>

        {/* Academic Info (Desktop) */}
        {!isMobile && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <School sx={{ mr: 1, color: 'primary.main' }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user.academicInfo.currentSemester} {user.academicInfo.academicYear}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                GPA: {user.academicInfo.gpa.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title="Toggle theme">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Tooltip title="Account">
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{ width: 40, height: 40 }}
              src={user?.personalInfo.profilePicture}
            >
              {user?.personalInfo.firstName[0]}{user?.personalInfo.lastName[0]}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user.personalInfo.firstName} {user.personalInfo.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.academicInfo.studentId}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 300,
              maxHeight: 400,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Notifications
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationClick}>
            <ListItemText
              primary="New grade posted"
              secondary="CS101 - Introduction to Computer Science"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationClick}>
            <ListItemText
              primary="Payment reminder"
              secondary="Tuition fee due in 3 days"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationClick}>
            <ListItemText
              primary="Course enrollment"
              secondary="Registration opens tomorrow"
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleNotificationClick}>
            <ListItemText
              primary="View all notifications"
              sx={{ textAlign: 'center', color: 'primary.main' }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

// Helper function to get page title
const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/courses': 'My Courses',
    '/grades': 'My Grades',
    '/payments': 'Payments & Fees',
    '/schedule': 'My Schedule',
    '/profile': 'My Profile',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
  };

  return titles[pathname] || 'Student Portal';
};

export default Header;
