import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AssignmentBulkActions from '../components/AssignmentBulkActions';

const fetchAssignments = async (filters: any) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/assignments/my-created?${params}`);
  return data.data;
};

const InstructorAssignmentsGrid: React.FC = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filters = { status, search };
  const handleBulkPublish = async () => {
    await api.post('/assignments/bulk-action', { action: 'publish', assignmentIds: selectedIds });
  };
  const handleBulkUnpublish = async () => {
    await api.post('/assignments/bulk-action', { action: 'unpublish', assignmentIds: selectedIds });
  };
  const handleBulkExtend = async () => {
    const extendDate = prompt('Enter new due date (YYYY-MM-DD):');
    if (extendDate) {
      await api.post('/assignments/bulk-action', { action: 'extend-deadline', assignmentIds: selectedIds, extendDate });
    }
  };

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['instructor-assignments', filters],
    queryFn: () => fetchAssignments(filters),
    select: (data) => Array.isArray(data) ? data : [],
  });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>My Created Assignments</Typography>
      <Box display="flex" gap={2} mb={2}>
        <AssignmentBulkActions
          selectedIds={selectedIds}
          onPublish={handleBulkPublish}
          onUnpublish={handleBulkUnpublish}
          onExtendDeadline={handleBulkExtend}
        />
        {/* Analytics summary */}
        <Box>
          <Typography variant="subtitle1">Analytics</Typography>
          <Typography variant="body2">Submission Rate: {assignments && assignments.length > 0 ? `${Math.round((assignments.filter((a: any) => a.submissions_count > 0).length / assignments.length) * 100)}%` : '-'}</Typography>
          <Typography variant="body2">Average Grade: {assignments && assignments.length > 0 ? `${(assignments.reduce((sum: number, a: any) => sum + (a.average_grade || 0), 0) / assignments.length).toFixed(2)}` : '-'}</Typography>
        </Box>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Error loading assignments</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(assignments) && assignments.map((a: any) => (
                <TableRow key={a._id} selected={selectedIds.includes(a._id)} onClick={() => {
                  setSelectedIds(selectedIds.includes(a._id)
                    ? selectedIds.filter(id => id !== a._id)
                    : [...selectedIds, a._id]);
                }}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.course?.courseName || '-'}</TableCell>
                  <TableCell>{a.due_date ? new Date(a.due_date).toLocaleString() : '-'}</TableCell>
                  <TableCell><Chip label={a.status} color={a.status === 'closed' ? 'default' : 'primary'} /></TableCell>
                  <TableCell>{a.submissions_count ?? '-'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" component={Link} to={`/assignments/${a._id}`}>View</Button>
                    <Button variant="contained" size="small" component={Link} to={`/assignments/${a._id}/grading`} sx={{ ml: 1 }}>Grade</Button>
                    <Button variant="text" size="small">Edit</Button>
                    <Button variant="text" size="small">Clone</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InstructorAssignmentsGrid;
