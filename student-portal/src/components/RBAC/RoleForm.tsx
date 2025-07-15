import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Security,
  Group,
  AdminPanelSettings,
  School,
  Payment,
  Support,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import rbacService from '@/services/rbacService';
import { Role, Permission, ROLE_CATEGORIES, PERMISSION_CATEGORIES } from '@/types/rbac';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RoleFormProps {
  role?: Role;
  onSubmit: (roleData: Omit<Role, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  role,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'administrative' as keyof typeof ROLE_CATEGORIES,
    level: 1,
    isActive: true,
    isSystemRole: false,
    permissions: [] as string[],
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch all permissions
  const permissionsQuery = useQuery({
    queryKey: ['permissions', { limit: 1000 }],
    queryFn: () => rbacService.getPermissions({ limit: 1000 }),
  });

  // Initialize form data when role prop changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        category: role.category as keyof typeof ROLE_CATEGORIES,
        level: role.level,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        permissions: role.permissions,
      });
    }
  }, [role]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = permissionsQuery.data?.permissions
      .filter(p => p.category === category)
      .map(p => p._id) || [];
    
    const allSelected = categoryPermissions.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions in this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !categoryPermissions.includes(id)),
      }));
    } else {
      // Select all permissions in this category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])],
      }));
    }
  };

  const handleAccordionToggle = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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

  const getPermissionsByCategory = () => {
    if (!permissionsQuery.data) return {};
    
    return permissionsQuery.data.permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const getCategoryStats = (category: string, permissions: Permission[]) => {
    const selected = permissions.filter(p => formData.permissions.includes(p._id)).length;
    const total = permissions.length;
    return { selected, total };
  };

  if (permissionsQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <LoadingSpinner message="Loading permissions..." />
      </Box>
    );
  }

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Role Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={formData.isSystemRole}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={formData.isSystemRole}
            >
              {Object.values(ROLE_CATEGORIES).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={3}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Role Level (1-10)"
            type="number"
            value={formData.level}
            onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
            helperText="Higher levels have more authority"
            disabled={formData.isSystemRole}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
            
            {role?.isSystemRole && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSystemRole}
                    disabled
                  />
                }
                label="System Role"
              />
            )}
          </Box>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Permissions ({formData.permissions.length} selected)
            </Typography>
            <Chip
              label={`${formData.permissions.length} / ${permissionsQuery.data?.permissions.length || 0}`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {formData.isSystemRole && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              System roles have predefined permissions that cannot be modified.
            </Alert>
          )}
        </Grid>

        {/* Permission Categories */}
        <Grid item xs={12}>
          <Box>
            {Object.entries(permissionsByCategory).map(([category, permissions]) => {
              const stats = getCategoryStats(category, permissions);
              const isExpanded = expandedCategories.has(category);
              
              return (
                <Accordion
                  key={category}
                  expanded={isExpanded}
                  onChange={() => handleAccordionToggle(category)}
                  disabled={formData.isSystemRole}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Box display="flex" alignItems="center" gap={1}>
                        {getCategoryIcon(category)}
                        <Typography variant="subtitle1" fontWeight="bold">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                      </Box>
                      
                      <Box ml="auto" display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${stats.selected}/${stats.total}`}
                          size="small"
                          color={stats.selected === stats.total ? 'success' : stats.selected > 0 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        
                        {!formData.isSystemRole && (
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryToggle(category);
                            }}
                          >
                            {stats.selected === stats.total ? 'Deselect All' : 'Select All'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <FormGroup>
                      <Grid container spacing={1}>
                        {permissions.map((permission) => (
                          <Grid item xs={12} sm={6} md={4} key={permission._id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.permissions.includes(permission._id)}
                                  onChange={() => handlePermissionToggle(permission._id)}
                                  disabled={formData.isSystemRole}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {permission.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !formData.name || !formData.description}
            >
              {isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleForm;
