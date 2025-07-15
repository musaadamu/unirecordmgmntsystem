import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Autocomplete,
  Alert,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Group,
  MoreVert,
  Search,
  Assignment,
  History,
  Schedule,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format, parseISO } from 'date-fns';

import rbacService from '@/services/rbacService';
import { UserRole, Role, RoleAssignment, UserRoleFilters } from '@/types/rbac';
import PermissionGuard from '@/components/RBAC/PermissionGuard';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserRoleAssignmentPage: React.FC = () => {
  const [filters, setFilters] = useState<UserRoleFilters>({
    page: 1,
    limit: 10,
    sortBy: 'assignedAt',
    sortOrder: 'desc',
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserRoleId, setMenuUserRoleId] = useState<string | null>(null);
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<RoleAssignment>({
    userId: '',
    roleIds: [],
    assignedBy: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Fetch user roles
  const userRolesQuery = useQuery({
    queryKey: ['user-roles', filters],
    queryFn: () => rbacService.getUserRoles('all'), // This would need to be modified to support filters
  });

  // Fetch all roles for assignment
  const rolesQuery = useQuery({
    queryKey: ['roles', { isActive: true }],
    queryFn: () => rbacService.getRoles({ isActive: true, limit: 1000 }),
  });

  // Mock users data (in real app, this would come from user service)
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john.doe@university.edu', department: 'Computer Science' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@university.edu', department: 'Mathematics' },
    { id: '3', name: 'Bob Johnson', email: 'bob.johnson@university.edu', department: 'Physics' },
  ];

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: rbacService.assignRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setAssignDialogOpen(false);
      resetAssignmentForm();
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userRoleId, updates }: { userRoleId: string; updates: Partial<UserRole> }) =>
      rbacService.updateUserRole(userRoleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setEditDialogOpen(false);
      setSelectedUserRole(null);
    },
  });

  // Remove user role mutation
  const removeUserRoleMutation = useMutation({
    mutationFn: rbacService.removeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });

  const resetAssignmentForm = () => {
    setAssignmentForm({
      userId: '',
      roleIds: [],
      assignedBy: '',
      notes: '',
    });
  };

  const handleAssignRole = () => {
    setAssignDialogOpen(true);
  };

  const handleEditUserRole = (userRole: UserRole) => {
    setSelectedUserRole(userRole);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleRemoveUserRole = (userRoleId: string) => {
    if (window.confirm('Are you sure you want to remove this role assignment?')) {
      removeUserRoleMutation.mutate(userRoleId);
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userRoleId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserRoleId(userRoleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserRoleId(null);
  };

  const handleSubmitAssignment = () => {
    if (assignmentForm.userId && assignmentForm.roleIds.length > 0) {
      assignRoleMutation.mutate(assignmentForm);
    }
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserEmail = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.email : '';
  };

  const getRoleName = (roleId: string) => {
    const role = rolesQuery.data?.roles.find(r => r._id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  if (userRolesQuery.isLoading || rolesQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading user roles..." />
      </Box>
    );
  }

  return (
    <PermissionGuard permission="roles:assign">
      <Box>
        {/* Page Header */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                User Role Assignments
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage role assignments for users
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAssignRole}
            >
              Assign Role
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search users..."
                  value={filters.userId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                    label="Status"
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      isActive: e.target.value === 'all' ? undefined : e.target.value === 'true'
                    }))}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department || 'all'}
                    label="Department"
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      department: e.target.value === 'all' ? undefined : e.target.value
                    }))}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Physics">Physics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* User Roles Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Department</TableCell>
                    <TableCell align="center">Assigned Date</TableCell>
                    <TableCell align="center">Expires</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Mock data for demonstration */}
                  {[
                    {
                      _id: '1',
                      userId: '1',
                      roleId: 'role1',
                      assignedBy: 'admin',
                      assignedAt: '2024-01-15T10:00:00Z',
                      expiresAt: '2024-12-31T23:59:59Z',
                      isActive: true,
                      department: 'Computer Science',
                    },
                    {
                      _id: '2',
                      userId: '2',
                      roleId: 'role2',
                      assignedBy: 'admin',
                      assignedAt: '2024-01-10T14:30:00Z',
                      isActive: true,
                      department: 'Mathematics',
                    },
                    {
                      _id: '3',
                      userId: '3',
                      roleId: 'role1',
                      assignedBy: 'admin',
                      assignedAt: '2024-01-05T09:15:00Z',
                      expiresAt: '2024-06-30T23:59:59Z',
                      isActive: false,
                      department: 'Physics',
                    },
                  ].map((userRole) => (
                    <TableRow key={userRole._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {getUserName(userRole.userId)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getUserEmail(userRole.userId)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Group />
                          <Typography variant="body2" fontWeight="bold">
                            {getRoleName(userRole.roleId)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={userRole.department}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {format(parseISO(userRole.assignedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {userRole.expiresAt ? (
                          <Box>
                            <Typography variant="body2">
                              {format(parseISO(userRole.expiresAt), 'MMM dd, yyyy')}
                            </Typography>
                            {isExpired(userRole.expiresAt) && (
                              <Chip label="Expired" color="error" size="small" />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No expiry
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={userRole.isActive ? 'Active' : 'Inactive'}
                          color={userRole.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, userRole._id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            // Handle edit
            handleMenuClose();
          }}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText>Edit Assignment</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => {
            // Handle view history
            handleMenuClose();
          }}>
            <ListItemIcon><History /></ListItemIcon>
            <ListItemText>View History</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => {
            if (menuUserRoleId) {
              handleRemoveUserRole(menuUserRoleId);
            }
          }}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Remove Assignment</ListItemText>
          </MenuItem>
        </Menu>

        {/* Assign Role Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Assign Role to User</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={mockUsers}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={mockUsers.find(u => u.id === assignmentForm.userId) || null}
                  onChange={(_, value) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    userId: value?.id || '' 
                  }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={rolesQuery.data?.roles || []}
                  getOptionLabel={(option) => option.name}
                  value={rolesQuery.data?.roles.filter(r => assignmentForm.roleIds.includes(r._id)) || []}
                  onChange={(_, value) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    roleIds: value.map(v => v._id)
                  }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Roles"
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Expiry Date (Optional)"
                  value={assignmentForm.expiresAt ? new Date(assignmentForm.expiresAt) : null}
                  onChange={(date) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    expiresAt: date?.toISOString()
                  }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department (Optional)"
                  value={assignmentForm.department || ''}
                  onChange={(e) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    department: e.target.value
                  }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={assignmentForm.notes || ''}
                  onChange={(e) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value
                  }))}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAssignment}
              variant="contained"
              disabled={!assignmentForm.userId || assignmentForm.roleIds.length === 0 || assignRoleMutation.isPending}
            >
              {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
};

export default UserRoleAssignmentPage;
