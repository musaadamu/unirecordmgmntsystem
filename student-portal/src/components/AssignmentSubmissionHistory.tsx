import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../services/api';

interface AssignmentSubmissionHistoryProps {
  assignmentId: string;
}

const fetchSubmissions = async (assignmentId: string) => {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
  return data.data;
};

const AssignmentSubmissionHistory: React.FC<AssignmentSubmissionHistoryProps> = ({ assignmentId }) => {
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: () => fetchSubmissions(assignmentId),
    select: (data) => Array.isArray(data) ? data : [],
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading submissions</Alert>;

  return (
    <Box mt={2}>
      <Typography variant="subtitle1">Your Submissions</Typography>
      <List>
        {submissions.length === 0 ? (
          <ListItemText primary="No submissions yet." />
        ) : (
          submissions.map((sub: any) => (
            <ListItem key={sub._id}>
              <ListItemText
                primary={`Attempt ${sub.attempt_number}: ${sub.status}`}
                secondary={`Submitted: ${sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'} | Grade: ${sub.grade ?? '-'} | Feedback: ${sub.feedback ?? '-'}`}
              />
              <Chip label={sub.status} color={sub.status === 'late' ? 'error' : 'primary'} sx={{ ml: 2 }} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default AssignmentSubmissionHistory;
