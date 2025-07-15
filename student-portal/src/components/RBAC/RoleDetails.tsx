import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Security,
  Group,
  AdminPanelSettings,
  School,
  Payment,
  Support,
  CheckCircle,
  Info,
  Warning,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';

import rbacService from '@/services/rbacService';
import { Role } from '@/types/rbac';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RoleDetailsProps {
  role: Role;
}

const RoleDetails: React.FC<RoleDetailsProps> = ({ role }) => {
  // Fetch role permissions
  const permissionsQuery = useQuery({
    queryKey: ['role-permissions', role._id],
    queryFn: () => rbacService.getRolePermissions(role._id),
  });

  // Fetch users with this role
  const usersQuery = useQuery({
    queryKey: ['role-users', role._id],
    queryFn: () => rbacService.getRoleUsers(role._id),
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <School />;
      case 'administrative':
        return <AdminPanelSettings />;
      case 'system':
        return <Security />;
      case 'financial':
        return <Payment />;
      case 'communication':
        return <Support />;
      default:
        return <Group />;
    }
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

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <School sx={{ fontSize: 16 }} />;
      case 'administrative':
        return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      case 'system':
        return <Security sx={{ fontSize: 16 }} />;
      case 'financial':
        return <Payment sx={{ fontSize: 16 }} />;
      case 'communication':
        return <Support sx={{ fontSize: 16 }} />;
      default:
        return <CheckCircle sx={{ fontSize: 16 }} />;
    }
  };

  const groupPermissionsByCategory = () => {
    if (!permissionsQuery.data) return {};
    
    return permissionsQuery.data.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissionsQuery.data>);
  };

  if (permissionsQuery.isLoading || usersQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <LoadingSpinner message="Loading role details..." />
      </Box>
    );
  }

  const permissionsByCategory = groupPermissionsByCategory();

  return (
    <Box>
      {/* Role Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: getCategoryColor(role.category) + '.main' }}>
            {getCategoryIcon(role.category)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {role.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {role.description}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label={role.category}
            color={getCategoryColor(role.category) as any}
            variant="outlined"
          />
          <Chip
            label={`Level ${role.level}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={role.isActive ? 'Active' : 'Inactive'}
            color={role.isActive ? 'success' : 'default'}
            variant="outlined"
          />
          {role.isSystemRole && (
            <Chip
              label="System Role"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Role Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Role Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {role.category.charAt(0).toUpperCase() + role.category.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Level
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {role.level}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {role.isSystemRole ? 'System Role' : 'Custom Role'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Permissions
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {role.permissions.length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Users Assigned
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {usersQuery.data?.total || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {format(parseISO(role.createdAt), 'MMMM dd, yyyy h:mm a')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {format(parseISO(role.updatedAt), 'MMMM dd, yyyy h:mm a')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Assigned Users ({usersQuery.data?.total || 0})
              </Typography>
              
              {usersQuery.data?.users && usersQuery.data.users.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {usersQuery.data.users.slice(0, 5).map((user, index) => (
                    <React.Fragment key={user.id || index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.name?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={user.name || 'Unknown User'}
                          secondary={user.email || 'No email'}
                        />
                      </ListItem>
                      {index < Math.min(usersQuery.data.users.length - 1, 4) && <Divider />}
                    </React.Fragment>
                  ))}
                  {usersQuery.data.total > 5 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="primary">
                            +{usersQuery.data.total - 5} more users
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Alert severity="info">
                  No users are currently assigned to this role.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Permissions ({permissionsQuery.data?.length || 0})
              </Typography>
              
              {role.isSystemRole && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    This is a system role with predefined permissions that cannot be modified.
                  </Typography>
                </Alert>
              )}
              
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <Box key={category} mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {getCategoryIcon(category)}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category.charAt(0).toUpperCase() + category.slice(1)} ({permissions.length})
                    </Typography>
                  </Box>
                  
                  <List sx={{ p: 0 }}>
                    {permissions.map((permission, index) => (
                      <React.Fragment key={permission._id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            {getPermissionIcon(permission.category)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="bold">
                                {permission.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.description}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {permission.resource}:{permission.action}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < permissions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
              
              {(!permissionsQuery.data || permissionsQuery.data.length === 0) && (
                <Alert severity="warning">
                  This role has no permissions assigned.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleDetails;
