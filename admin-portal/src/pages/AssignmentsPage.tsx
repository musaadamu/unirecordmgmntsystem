import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import api from '../services/api';

const fetchAssignments = async (filters: any) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/assignments?${params}`);
  return data.data;
};

const fetchStaff = async () => {
  const { data } = await api.get('/staff');
  return data.data;
};

const fetchCourses = async () => {
  const { data } = await api.get('/courses');
  return data.data;
};

const AssignmentsPage: React.FC = () => {
  const [filters, setFilters] = useState({ staffId: '', courseId: '' });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', staff: '', course: '' });
  const queryClient = useQueryClient();

  const { data: assignments, isLoading, error: assignmentsError } = useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => fetchAssignments(filters),
    select: (data) => Array.isArray(data) ? data : [],
  });
  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
    select: (data) => Array.isArray(data) ? data : [],
  });
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const mutation = useMutation({
    mutationFn: async (newAssignment: any) => {
      const { data } = await api.post('/assignments', newAssignment);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      setOpen(false);
      setForm({ title: '', description: '', dueDate: '', staff: '', course: '' });
    }
  });

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilters({ ...filters, [e.target.name as string]: e.target.value });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Assignments</Typography>
      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Staff</InputLabel>
          <Select name="staffId" value={filters.staffId} label="Staff" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {staff?.map((s: any) => (
              <MenuItem key={s._id} value={s._id}>{s.user?.name || s.employeeId}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Course</InputLabel>
          <Select name="courseId" value={filters.courseId} label="Course" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {Array.isArray(courses) && courses.map((c: any) => (
              <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Assignment</Button>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : assignmentsError ? (
        <Alert severity="error">Error loading assignments</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Course</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(assignments) && assignments.map((a: any) => (
                <TableRow key={a._id}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.description}</TableCell>
                  <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{a.staff?.employeeId || '-'}</TableCell>
                  <TableCell>{a.course?.courseName || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {assignmentsError && ((assignmentsError as any)?.response?.status === 401 || (assignmentsError as any)?.response?.status === 403) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          You are not authorized to view assignments. Please log in with the correct account or contact your administrator.
        </Alert>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Assignment</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="title" label="Title" value={form.title} onChange={handleFormChange} required />
            <TextField name="description" label="Description" value={form.description} onChange={handleFormChange} required />
            <TextField name="dueDate" label="Due Date" type="date" value={form.dueDate} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required />
            <FormControl>
              <InputLabel>Staff</InputLabel>
              <Select name="staff" value={form.staff} label="Staff" onChange={handleFormChange} required>
                {staff?.map((s: any) => (
                  <MenuItem key={s._id} value={s._id}>{s.user?.name || s.employeeId}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Course</InputLabel>
              <Select name="course" value={form.course} label="Course" onChange={handleFormChange} required>
                {courses?.map((c: any) => (
                  <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={mutation.status === 'pending'}>Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AssignmentsPage;
