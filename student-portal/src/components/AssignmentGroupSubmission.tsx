import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';

interface AssignmentGroupSubmissionProps {
  assignmentId: string;
  groupId: string;
  onSubmit: (content: string) => void;
}

import api from '../services/api';

const AssignmentGroupSubmission: React.FC<AssignmentGroupSubmissionProps> = ({ assignmentId, groupId }) => {
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('/assignments/group-submit', {
        assignmentId,
        groupId,
        content,
      });
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Submission failed.');
      setSuccess(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Group Submission</Typography>
      <TextField
        label="Submission Content"
        multiline
        minRows={4}
        value={content}
        onChange={e => setContent(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit as Group
      </Button>
      {success && <Alert severity="success" sx={{ mt: 2 }}>Group submission successful!</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default AssignmentGroupSubmission;
