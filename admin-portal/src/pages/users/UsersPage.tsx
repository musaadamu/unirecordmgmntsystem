import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Email,
  Refresh,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import UserTable from '@/components/Users/UserTable';
import UserForm from '@/components/Users/UserForm';
import BulkUserDialog from '@/components/Users/BulkUserDialog';
import UserFilters from '@/components/Users/UserFilters';
import UserStats from '@/components/Users/UserStats';
import LoadingSpinner from '@/components/LoadingSpinner';

// Services
import userService from '@/services/userService';

// Types
import { User, UserFilters as UserFilterType, UserRole, UserStatus } from '@/types';

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
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UsersPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilterType>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Dialog states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const queryClient = useQueryClient();

  // Fetch users with filters
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['users', { ...filters, search: searchTerm, page, limit: pageSize }],
    queryFn: () => userService.getUsers({ ...filters, search: searchTerm, page, limit: pageSize }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getUserStats(),
    staleTime: 10 * 60 * 1000,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User created successfully');
      setUserFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setUserFormOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // Bulk status update mutation
  const bulkStatusMutation = useMutation({
    mutationFn: ({ userIds, status, reason }: { userIds: string[]; status: string; reason?: string }) =>
      userService.bulkUpdateUserStatus(userIds, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Users updated successfully');
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update users');
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: UserFilterType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleUserSubmit = (userData: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, data: userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    switch (action) {
      case 'activate':
        bulkStatusMutation.mutate({ userIds: selectedUsers, status: 'active' });
        break;
      case 'deactivate':
        bulkStatusMutation.mutate({ userIds: selectedUsers, status: 'inactive' });
        break;
      case 'suspend':
        bulkStatusMutation.mutate({ userIds: selectedUsers, status: 'suspended' });
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          // Handle bulk delete
          toast.info('Bulk delete functionality will be implemented');
        }
        break;
    }
    setBulkMenuAnchor(null);
  };

  const handleExport = async () => {
    try {
      await userService.exportUsersToCSV(filters);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
    setAnchorEl(null);
  };

  const users = usersData?.data?.items || [];
  const pagination = usersData?.data?.pagination;

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, roles, and permissions across the university system
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setBulkDialogOpen(true)}
            >
              Bulk Import
            </Button>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
          </Box>
        </Box>
      </Box>

      {/* User Statistics */}
      {userStats && (
        <Box mb={4}>
          <UserStats stats={userStats} />
        </Box>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <UserFilters filters={filters} onFiltersChange={handleFilterChange} />
            </Grid>

            <Grid item xs={12} md={2}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                {selectedUsers.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                  >
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <LoadingSpinner message="Loading users..." />
            </Box>
          ) : error ? (
            <Box p={4} textAlign="center">
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load users. Please try again.
              </Alert>
              <Button variant="outlined" onClick={() => refetch()}>
                Retry
              </Button>
            </Box>
          ) : (
            <UserTable
              users={users}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              pagination={pagination}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} />
          Export Users
        </MenuItem>
        <MenuItem onClick={() => setBulkDialogOpen(true)}>
          <Upload sx={{ mr: 1 }} />
          Import Users
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction('activate')}>
          <CheckCircle sx={{ mr: 1 }} />
          Activate Users
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('deactivate')}>
          <Block sx={{ mr: 1 }} />
          Deactivate Users
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('suspend')}>
          <Block sx={{ mr: 1 }} />
          Suspend Users
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('delete')} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Users
        </MenuItem>
      </Menu>

      {/* User Form Dialog */}
      <UserForm
        open={userFormOpen}
        onClose={() => {
          setUserFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUserSubmit}
        user={editingUser}
        loading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Bulk Import Dialog */}
      <BulkUserDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />
    </Box>
  );
};

export default UsersPage;
