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
  FileCopy,
  MoreVert,
  Security,
  Group,
  AdminPanelSettings,
  Visibility,
  GetApp,
  Publish,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import rbacService from '@/services/rbacService';
import { Role, RoleFilters, ROLE_CATEGORIES } from '@/types/rbac';
import PermissionGuard from '@/components/RBAC/PermissionGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import RoleForm from '@/components/RBAC/RoleForm';
import RoleDetails from '@/components/RBAC/RoleDetails';
import PermissionMatrix from '@/components/RBAC/PermissionMatrix';

const RoleManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<RoleFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [matrixDialogOpen, setMatrixDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch roles
  const rolesQuery = useQuery({
    queryKey: ['roles', filters],
    queryFn: () => rbacService.getRoles(filters),
  });

  // Fetch role analytics
  const analyticsQuery = useQuery({
    queryKey: ['role-analytics'],
    queryFn: () => rbacService.getRoleAnalytics(),
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: rbacService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-analytics'] });
      setCreateDialogOpen(false);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, updates }: { roleId: string; updates: Partial<Role> }) =>
      rbacService.updateRole(roleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditDialogOpen(false);
      setSelectedRole(null);
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: rbacService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-analytics'] });
    },
  });

  // Clone role mutation
  const cloneRoleMutation = useMutation({
    mutationFn: ({ roleId, newName }: { roleId: string; newName: string }) =>
      rbacService.cloneRole(roleId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleFilterChange = (newFilters: Partial<RoleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setCreateDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId);
    }
    handleMenuClose();
  };

  const handleCloneRole = (role: Role) => {
    const newName = prompt('Enter name for cloned role:', `${role.name} (Copy)`);
    if (newName) {
      cloneRoleMutation.mutate({ roleId: role._id, newName });
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, roleId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuRoleId(roleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRoleId(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'administrative':
        return 'primary';
      case 'academic':
        return 'success';
      case 'financial':
        return 'warning';
      case 'support':
        return 'info';
      case 'system':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'administrative':
        return <AdminPanelSettings />;
      case 'academic':
        return <Group />;
      case 'financial':
        return <Security />;
      case 'support':
        return <Group />;
      case 'system':
        return <Security />;
      default:
        return <Group />;
    }
  };

  if (rolesQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="Loading roles..." />
      </Box>
    );
  }

  return (
    <PermissionGuard permission="roles:read">
      <Box>
        {/* Page Header */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Role Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage user roles and permissions
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <PermissionGuard permission="roles:create">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateRole}
                >
                  Create Role
                </Button>
              </PermissionGuard>
              
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => setMatrixDialogOpen(true)}
              >
                Permission Matrix
              </Button>
            </Box>
          </Box>

          {/* Analytics Cards */}
          {analyticsQuery.data && (
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {analyticsQuery.data.totalRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {analyticsQuery.data.activeRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {analyticsQuery.data.systemRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      System Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {analyticsQuery.data.customRoles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Custom Roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search roles..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category || 'all'}
                    label="Category"
                    onChange={(e) => handleFilterChange({ 
                      category: e.target.value === 'all' ? undefined : e.target.value 
                    })}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {Object.values(ROLE_CATEGORIES).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                    label="Status"
                    onChange={(e) => handleFilterChange({ 
                      isActive: e.target.value === 'all' ? undefined : e.target.value === 'true'
                    })}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.isSystemRole === undefined ? 'all' : filters.isSystemRole.toString()}
                    label="Type"
                    onChange={(e) => handleFilterChange({ 
                      isSystemRole: e.target.value === 'all' ? undefined : e.target.value === 'true'
                    })}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="true">System Roles</MenuItem>
                    <MenuItem value="false">Custom Roles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Details</TableCell>
                    <TableCell align="center">Category</TableCell>
                    <TableCell align="center">Level</TableCell>
                    <TableCell align="center">Permissions</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rolesQuery.data?.roles.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getCategoryIcon(role.category)}
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {role.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {role.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={role.category}
                          size="small"
                          color={getCategoryColor(role.category) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`Level ${role.level}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {role.permissions.length}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={role.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={role.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={role.isSystemRole ? 'System' : 'Custom'}
                          size="small"
                          color={role.isSystemRole ? 'warning' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, role._id)}
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
            const role = rolesQuery.data?.roles.find(r => r._id === menuRoleId);
            if (role) handleViewRole(role);
          }}>
            <ListItemIcon><Visibility /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          
          <PermissionGuard permission="roles:update">
            <MenuItem onClick={() => {
              const role = rolesQuery.data?.roles.find(r => r._id === menuRoleId);
              if (role && !role.isSystemRole) handleEditRole(role);
            }}>
              <ListItemIcon><Edit /></ListItemIcon>
              <ListItemText>Edit Role</ListItemText>
            </MenuItem>
          </PermissionGuard>
          
          <PermissionGuard permission="roles:create">
            <MenuItem onClick={() => {
              const role = rolesQuery.data?.roles.find(r => r._id === menuRoleId);
              if (role) handleCloneRole(role);
            }}>
              <ListItemIcon><FileCopy /></ListItemIcon>
              <ListItemText>Clone Role</ListItemText>
            </MenuItem>
          </PermissionGuard>
          
          <PermissionGuard permission="roles:delete">
            <MenuItem 
              onClick={() => {
                const role = rolesQuery.data?.roles.find(r => r._id === menuRoleId);
                if (role && !role.isSystemRole && menuRoleId) {
                  handleDeleteRole(menuRoleId);
                }
              }}
              disabled={rolesQuery.data?.roles.find(r => r._id === menuRoleId)?.isSystemRole}
            >
              <ListItemIcon><Delete /></ListItemIcon>
              <ListItemText>Delete Role</ListItemText>
            </MenuItem>
          </PermissionGuard>
        </Menu>

        {/* Create Role Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Role</DialogTitle>
          <DialogContent>
            <RoleForm
              onSubmit={(roleData) => createRoleMutation.mutate(roleData)}
              onCancel={() => setCreateDialogOpen(false)}
              isLoading={createRoleMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Role</DialogTitle>
          <DialogContent>
            {selectedRole && (
              <RoleForm
                role={selectedRole}
                onSubmit={(roleData) => updateRoleMutation.mutate({
                  roleId: selectedRole._id,
                  updates: roleData
                })}
                onCancel={() => setEditDialogOpen(false)}
                isLoading={updateRoleMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Role Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Role Details</DialogTitle>
          <DialogContent>
            {selectedRole && <RoleDetails role={selectedRole} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Permission Matrix Dialog */}
        <Dialog
          open={matrixDialogOpen}
          onClose={() => setMatrixDialogOpen(false)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle>Permission Matrix</DialogTitle>
          <DialogContent>
            <PermissionMatrix />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatrixDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
};

export default RoleManagementPage;
