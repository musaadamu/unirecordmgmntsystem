import React, { useState } from 'react';
import AssignmentDraftAutoSave from './AssignmentDraftAutoSave';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Input,
  FormControl,
  FormHelperText
} from '@mui/material';
import api from '../services/api';

interface AssignmentSubmissionFormProps {
  assignmentId: string;
}

const AssignmentSubmissionForm: React.FC<AssignmentSubmissionFormProps> = ({ assignmentId }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      setText('');
      setFile(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('submission_content', text);
    if (file) formData.append('file_attachments', file);
    mutation.mutate(formData);
  };

  const handleDraftSave = async (draftContent: string) => {
    // Save draft to backend
    await api.post(`/assignments/${assignmentId}/draft`, { studentId: 'CURRENT_USER_ID', content: draftContent });
  };

  return (
    <Box mt={3}>
      <Typography variant="h6">Submit Assignment</Typography>
      <AssignmentDraftAutoSave assignmentId={assignmentId} onSave={handleDraftSave} />
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ mb: 2 }}>
          <Input type="file" onChange={handleFileChange} />
          <FormHelperText>Attach file (optional)</FormHelperText>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? <CircularProgress size={20} /> : 'Submit'}
        </Button>
        {mutation.isError && <Alert severity="error" sx={{ mt: 2 }}>{(mutation.error as any)?.message || 'Submission failed.'}</Alert>}
        {mutation.isSuccess && <Alert severity="success" sx={{ mt: 2 }}>Submission successful!</Alert>}
      </form>
    </Box>
  );
};

export default AssignmentSubmissionForm;
