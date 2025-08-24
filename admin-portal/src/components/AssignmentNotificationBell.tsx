import React, { useEffect, useState } from 'react';
import { IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import api from '../services/api';

const AssignmentNotificationBell: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await api.get('/assignments/notifications');
      setCount(data.data.length);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <IconButton color="inherit">
      <Badge badgeContent={count} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default AssignmentNotificationBell;
