import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const statusTabs = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'inprogress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

const fetchAssignments = async (filters: any) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/assignments/my-assignments?${params}`);
  return data.data;
};

const AssignmentsDashboard: React.FC = () => {
  const [status, setStatus] = useState('todo');
  const [course, setCourse] = useState('');
  const [search, setSearch] = useState('');
  const filters = { status, course, search };

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['student-assignments', filters],
    queryFn: () => fetchAssignments(filters),
    select: (data) => Array.isArray(data) ? data : [],
  });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>My Assignments</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Tabs value={status} onChange={(_, v) => setStatus(v)}>
          {statusTabs.map(tab => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Course</InputLabel>
          <Select value={course} label="Course" onChange={e => setCourse(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {/* TODO: Map courses from API */}
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
        <Grid container spacing={2}>
          {Array.isArray(assignments) && assignments.map((a: any) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.course?.courseName || '-'}</Typography>
                  <Typography variant="body2">Due: {a.due_date ? new Date(a.due_date).toLocaleString() : '-'}</Typography>
                  <Box mt={2} display="flex" gap={1}>
                    <Button variant="contained" size="small">Submit</Button>
                    <Button variant="outlined" size="small" component={Link} to={`/assignments/${a._id}`}>View Details</Button>
                    <Button variant="text" size="small">Download</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssignmentsDashboard;
