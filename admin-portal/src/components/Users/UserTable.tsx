import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Email,
  Phone,
  Block,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { User, PaginationInfo } from '@/types';

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(users.map(user => user._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, userId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'academic_staff':
        return 'info';
      case 'support_staff':
        return 'secondary';
      case 'student':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrator',
      academic_staff: 'Academic Staff',
      support_staff: 'Support Staff',
      student: 'Student',
    };
    return roleMap[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      pending: 'Pending',
    };
    return statusMap[status] || status;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isSelected = (userId: string) => selectedUsers.indexOf(userId) !== -1;

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const isItemSelected = isSelected(user._id);
              return (
                <TableRow
                  key={user._id}
                  hover
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getRoleColor(user.role) + '.main',
                        }}
                      >
                        {getInitials(user.personalInfo?.firstName, user.personalInfo?.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusLabel(user.status)}
                      color={getStatusColor(user.status) as any}
                      size="small"
                      icon={user.status === 'active' ? <CheckCircle /> : <Block />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {user.contactInfo?.phone && (
                        <Typography variant="caption" display="block">
                          <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                          {user.contactInfo.phone}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        <Email sx={{ fontSize: 12, mr: 0.5 }} />
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit User">
                        <IconButton size="small" onClick={() => onEdit(user)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, user)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.totalItems}
          page={pagination.currentPage - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={25}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedUser) onEdit(selectedUser);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Handle view profile
          handleMenuClose();
        }}>
          <Person sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Handle send email
          handleMenuClose();
        }}>
          <Email sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        
        <MenuItem
          onClick={() => {
            if (selectedUser) onDelete(selectedUser._id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserTable;
