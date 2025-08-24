import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert,
  Button
} from '@mui/material';

interface Assignment {
  id: string | number;
  title: string;
  description: string;
  dueDate: string;
}

interface PendingAssignmentsProps {
  assignments: Assignment[];
  loading: boolean;
  error?: string | null;
}

const PendingAssignments: React.FC<PendingAssignmentsProps> = ({ assignments, loading, error }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Pending Assignments
        </Typography>
        {assignments.length === 0 ? (
          <Typography variant="body1" component="div">
            No pending assignments.
          </Typography>
        ) : (
          <List>
            {assignments.map((assignment) => (
              <ListItem 
                key={assignment.id} 
                alignItems="flex-start" 
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={assignment.title}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {assignment.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span" display="block">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <Box mt={1}>
                  <Button variant="outlined" size="small" color="primary">
                    View
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingAssignments;