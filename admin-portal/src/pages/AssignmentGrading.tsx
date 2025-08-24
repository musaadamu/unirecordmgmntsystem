import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Chip
} from '@mui/material';
import api from '../services/api';

const fetchSubmissions = async (assignmentId: string) => {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
  return data.data;
};

const AssignmentGrading: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', id],
    queryFn: () => fetchSubmissions(id!),
    enabled: !!id,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const mutation = useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: any) => {
      const { data } = await api.put(`/assignments/${id}/grade`, { submissionId, grade, feedback });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', id] });
    },
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading submissions</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Grade Submissions</Typography>
      {submissions.length === 0 ? (
        <Alert severity="info">No submissions to grade.</Alert>
      ) : (
        submissions.map((sub: any) => (
          <Card key={sub._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Student: {sub.student_id?.name || sub.student_id?.email || '-'}</Typography>
              <Typography variant="body2">Attempt: {sub.attempt_number}</Typography>
              <Typography variant="body2">Status: <Chip label={sub.status} color={sub.status === 'late' ? 'error' : 'primary'} /></Typography>
              <Typography variant="body2">Submitted: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}</Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>Submission: {sub.submission_content ?? '[No content]'}</Typography>
              {/* TODO: File attachments preview/download */}
              <Box mt={2} display="flex" gap={2}>
                <TextField
                  label="Grade"
                  type="number"
                  defaultValue={sub.grade ?? ''}
                  onBlur={e => mutation.mutate({ submissionId: sub._id, grade: e.target.value, feedback: sub.feedback })}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Feedback"
                  defaultValue={sub.feedback ?? ''}
                  onBlur={e => mutation.mutate({ submissionId: sub._id, grade: sub.grade, feedback: e.target.value })}
                  sx={{ width: 220 }}
                />
                <Button variant="contained" color="primary" onClick={() => mutation.mutate({ submissionId: sub._id, grade: sub.grade, feedback: sub.feedback })}>
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default AssignmentGrading;
