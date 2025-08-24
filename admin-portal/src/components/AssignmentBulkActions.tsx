import React from 'react';
import { Button, Box, Menu, MenuItem } from '@mui/material';

interface AssignmentBulkActionsProps {
  selectedIds: string[];
  onPublish: () => void;
  onUnpublish: () => void;
  onExtendDeadline: () => void;
}

const AssignmentBulkActions: React.FC<AssignmentBulkActionsProps> = ({ selectedIds, onPublish, onUnpublish, onExtendDeadline }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleClick} disabled={selectedIds.length === 0}>
        Bulk Actions
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => { onPublish(); handleClose(); }}>Publish</MenuItem>
        <MenuItem onClick={() => { onUnpublish(); handleClose(); }}>Unpublish</MenuItem>
        <MenuItem onClick={() => { onExtendDeadline(); handleClose(); }}>Extend Deadline</MenuItem>
      </Menu>
    </Box>
  );
};

export default AssignmentBulkActions;
