import React, { useEffect, useState } from 'react';
import { TextField, Button, Alert, Box } from '@mui/material';

interface AssignmentDraftAutoSaveProps {
  assignmentId: string;
  onSave: (content: string) => void;
}

const LOCAL_KEY = (id: string) => `assignment-draft-${id}`;

const AssignmentDraftAutoSave: React.FC<AssignmentDraftAutoSaveProps> = ({ assignmentId, onSave }) => {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_KEY(assignmentId));
    if (draft) setContent(draft);
  }, [assignmentId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY(assignmentId), content);
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [content, assignmentId]);

  const handleSave = () => {
    onSave(content);
    localStorage.removeItem(LOCAL_KEY(assignmentId));
  };

  return (
    <Box>
      <TextField
        label="Draft Submission"
        multiline
        minRows={4}
        value={content}
        onChange={e => setContent(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Submit Final
      </Button>
      {saved && <Alert severity="info" sx={{ mt: 2 }}>Draft auto-saved!</Alert>}
    </Box>
  );
};

export default AssignmentDraftAutoSave;
