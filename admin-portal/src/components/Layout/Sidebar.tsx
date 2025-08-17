import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  MenuBook,
  Grade,
  Assignment,
  Payment,
  EventNote,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  GroupAdd,
  AccountBalance,
  AdminPanelSettings,
} from '@mui/icons-material';

import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavigationItem[];
  roles?: string[];
  badge?: string | number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <People />,
    roles: ['super_admin', 'admin'],
    children: [
      { id: 'all-users', label: 'All Users', icon: <People />, path: '/users' },
      { id: 'students', label: 'Students', icon: <School />, path: '/students' },
      { id: 'add-user', label: 'Add User', icon: <PersonAdd />, path: '/users/add' },
      { id: 'bulk-import', label: 'Bulk Import', icon: <GroupAdd />, path: '/users/import' },
    ],
  },
  {
    id: 'academic',
    label: 'Academic Management',
    icon: <MenuBook />,
    children: [
      { id: 'courses', label: 'Courses', icon: <MenuBook />, path: '/courses' },
      { id: 'grades', label: 'Grades', icon: <Grade />, path: '/grades' },
      { id: 'enrollments', label: 'Enrollments', icon: <Assignment />, path: '/enrollments' },
    ],
  },
  {
    id: 'administrative',
    label: 'Administrative',
    icon: <AdminPanelSettings />,
    children: [
      { id: 'payments', label: 'Payments', icon: <Payment />, path: '/payments', badge: '12' },
      { id: 'attendance', label: 'Attendance', icon: <EventNote />, path: '/attendance' },
      { id: 'financial', label: 'Financial Reports', icon: <AccountBalance />, path: '/reports/financial' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <Assessment />,
    path: '/reports',
    roles: ['super_admin', 'admin', 'academic_staff'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings />,
    path: '/settings',
    roles: ['super_admin', 'admin'],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['users', 'academic', 'administrative']);

  const handleItemClick = (item: NavigationItem) => {
    if (item.path) {
      navigate(item.path);
      onClose?.();
    } else if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const isItemActive = (path?: string) =>
    path && (location.pathname === path || location.pathname.startsWith(path + '/'));

  const hasPermission = (roles?: string[]) =>
    !roles || roles.length === 0 || (user?.role && roles.includes(user.role));

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    if (!hasPermission(item.roles)) return null;

    const isActive = isItemActive(item.path);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children?.length;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              py: 1,
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              pl: level > 0 ? 4 : 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 3,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  <Box>{item.icon}</Box>
                </Tooltip>
              ) : (
                item.icon
              )}
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  sx={{
                    opacity: 1,
                    '& .MuiListItemText-primary': {
                      fontSize: level > 0 ? '0.875rem' : '1rem',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />

                {item.badge && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderRadius: '12px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {item.badge}
                  </Box>
                )}

                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2.5,
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {collapsed ? (
          <Tooltip title="University Admin Portal" placement="right">
            <School sx={{ fontSize: 32, color: 'white' }} />
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School sx={{ fontSize: 32, color: 'white' }} />
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1 }}>
                University
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1 }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Version 1.0.0
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
