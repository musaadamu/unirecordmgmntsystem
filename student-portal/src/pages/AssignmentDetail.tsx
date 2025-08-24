import React from 'react';
import AssignmentSubmissionForm from '../components/AssignmentSubmissionForm';
import AssignmentSubmissionHistory from '../components/AssignmentSubmissionHistory';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import api from '../../services/api.ts';

const fetchAssignment = async (id: string) => {
  const { data } = await api.get(`/assignments/${id}`);
  return data.data;
};

const AssignmentDetail: React.FC = () => {
  const { id } = useParams();
  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => fetchAssignment(id!),
    enabled: !!id,
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading assignment</Alert>;
  if (!assignment) return <Alert severity="info">Assignment not found</Alert>;

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>{assignment.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{assignment.course?.courseName || '-'}</Typography>
          <Typography variant="body2" color="text.secondary">Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '-'}</Typography>
          <Box mt={2}>
            <Chip label={assignment.status} color={assignment.status === 'overdue' ? 'error' : 'primary'} />
          </Box>
          <Box mt={2}>
            <Typography variant="h6">Instructions</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{assignment.instructions || 'No instructions provided.'}</Typography>
          </Box>
          <Box mt={2}>
            {assignment.file_attachments && assignment.file_attachments.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2">Materials:</Typography>
                {assignment.file_attachments.map((file: string, idx: number) => (
                  <Button key={idx} variant="text" href={file} target="_blank" sx={{ mr: 1 }}>
                    Download File {idx + 1}
                  </Button>
                ))}
              </Box>
            )}
            <Button variant="outlined" sx={{ mr: 2 }}>Download All Materials</Button>
          </Box>
          {assignment.rubric && (
            <Box mt={2}>
              <Typography variant="h6">Rubric</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{assignment.rubric}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <AssignmentSubmissionForm assignmentId={id!} />
      {/* Submission history and feedback section */}
  <AssignmentSubmissionHistory assignmentId={id!} />
    </Box>
  );
};

export default AssignmentDetail;
