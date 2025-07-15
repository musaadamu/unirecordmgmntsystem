import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Avatar,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  GetApp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import rbacService from '@/services/rbacService';
import LoadingSpinner from '@/components/LoadingSpinner';

const PermissionMatrix: React.FC = () => {
  const [filters, setFilters] = useState({
    department: 'all',
    role: 'all',
    permission: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const mockMatrix = {
    users: [
      {
        userId: '1',
        userName: 'John Doe',
        email: 'john.doe@university.edu',
        roles: ['admin', 'instructor'],
        permissions: ['students:read', 'courses:manage', 'grades:update'],
        department: 'Computer Science',
      },
      {
        userId: '2',
        userName: 'Jane Smith',
        email: 'jane.smith@university.edu',
        roles: ['finance_officer'],
        permissions: ['payments:read', 'payments:create', 'reports:read'],
        department: 'Finance',
      },
      {
        userId: '3',
        userName: 'Bob Johnson',
        email: 'bob.johnson@university.edu',
        roles: ['registrar'],
        permissions: ['students:manage', 'courses:read', 'grades:read'],
        department: 'Academic Affairs',
      },
    ],
    roles: [
      { _id: 'admin', name: 'Administrator' },
      { _id: 'instructor', name: 'Instructor' },
      { _id: 'finance_officer', name: 'Finance Officer' },
      { _id: 'registrar', name: 'Registrar' },
    ],
    permissions: [
      { _id: 'students:read', name: 'View Students', resource: 'students', action: 'read', category: 'academic', description: 'View student information' },
      { _id: 'students:manage', name: 'Manage Students', resource: 'students', action: 'manage', category: 'academic', description: 'Full student management' },
      { _id: 'courses:read', name: 'View Courses', resource: 'courses', action: 'read', category: 'academic', description: 'View course information' },
      { _id: 'courses:manage', name: 'Manage Courses', resource: 'courses', action: 'manage', category: 'academic', description: 'Full course management' },
      { _id: 'grades:read', name: 'View Grades', resource: 'grades', action: 'read', category: 'academic', description: 'View grade information' },
      { _id: 'grades:update', name: 'Update Grades', resource: 'grades', action: 'update', category: 'academic', description: 'Update student grades' },
      { _id: 'payments:read', name: 'View Payments', resource: 'payments', action: 'read', category: 'financial', description: 'View payment information' },
      { _id: 'payments:create', name: 'Process Payments', resource: 'payments', action: 'create', category: 'financial', description: 'Process student payments' },
      { _id: 'reports:read', name: 'View Reports', resource: 'reports', action: 'read', category: 'reporting', description: 'View system reports' },
    ],
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = () => {
    // Export matrix to CSV
    console.log('Exporting permission matrix...');
  };

  const getFilteredUsers = () => {
    return mockMatrix.users.filter(user => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!user.userName.toLowerCase().includes(query) &&
            !user.email.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Department filter
      if (filters.department !== 'all' && user.department !== filters.department) {
        return false;
      }
      
      // Role filter
      if (filters.role !== 'all' && !user.roles.includes(filters.role)) {
        return false;
      }
      
      return true;
    });
  };

  const getFilteredPermissions = () => {
    return mockMatrix.permissions.filter(permission => {
      if (filters.permission !== 'all' && permission.category !== filters.permission) {
        return false;
      }
      return true;
    });
  };

  const hasPermission = (userId: string, permissionId: string) => {
    const user = mockMatrix.users.find(u => u.userId === userId);
    return user?.permissions.includes(permissionId) || false;
  };

  const getRoleName = (roleId: string) => {
    const role = mockMatrix.roles.find(r => r._id === roleId);
    return role?.name || roleId;
  };

  const filteredUsers = getFilteredUsers();
  const filteredPermissions = getFilteredPermissions();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Permission Matrix
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GetApp />}
          onClick={handleExport}
        >
          Export Matrix
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department}
              label="Department"
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Academic Affairs">Academic Affairs</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {mockMatrix.roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Permission Category</InputLabel>
            <Select
              value={filters.permission}
              label="Permission Category"
              onChange={(e) => handleFilterChange('permission', e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="reporting">Reporting</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Matrix Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                User
              </TableCell>
              <TableCell sx={{ minWidth: 150, position: 'sticky', left: 200, bgcolor: 'background.paper', zIndex: 1 }}>
                Roles
              </TableCell>
              {filteredPermissions.map((permission) => (
                <TableCell
                  key={permission._id}
                  align="center"
                  sx={{ minWidth: 120 }}
                >
                  <Tooltip title={permission.description}>
                    <Box>
                      <Typography variant="caption" fontWeight="bold">
                        {permission.name}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {permission.resource}:{permission.action}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.userId}>
                <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                      {user.department && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {user.department}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ position: 'sticky', left: 200, bgcolor: 'background.paper', zIndex: 1 }}>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {user.roles.map((roleId) => (
                      <Chip
                        key={roleId}
                        label={getRoleName(roleId)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </TableCell>
                {filteredPermissions.map((permission) => (
                  <TableCell key={permission._id} align="center">
                    {hasPermission(user.userId, permission._id) ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="disabled" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary */}
      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredUsers.length} users and {filteredPermissions.length} permissions
        </Typography>
      </Box>
    </Box>
  );
};

export default PermissionMatrix;
