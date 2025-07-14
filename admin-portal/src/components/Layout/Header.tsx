import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Person,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed,
  isMobile,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
    handleProfileMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleProfileMenuClose();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.personalInfo) {
      return `${user.personalInfo.firstName} ${user.personalInfo.lastName}`;
    }
    return user?.email || 'User';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      academic_staff: 'Academic Staff',
      support_staff: 'Support Staff',
      student: 'Student',
    };
    return roleMap[role] || role;
  };

  return (
    <Toolbar>
      {/* Mobile menu button */}
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

      {/* Desktop sidebar toggle */}
      {!isMobile && (
        <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton
            color="inherit"
            onClick={onSidebarToggle}
            sx={{ mr: 2 }}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      )}

      {/* Page title */}
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        University Admin Portal
      </Typography>

      {/* Right side actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getRoleDisplayName(user?.role || '')}
            </Typography>
          </Box>
          
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(user?.personalInfo?.firstName, user?.personalInfo?.lastName)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
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
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 300,
            maxWidth: 400,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider />
        
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              New student registration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              John Doe has registered for Computer Science program
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Payment received
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tuition payment of $2,500 received from Jane Smith
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Grade appeal submitted
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Grade appeal for MATH101 requires review
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;
