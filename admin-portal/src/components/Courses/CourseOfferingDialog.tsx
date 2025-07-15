import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { Schedule, Person, LocationOn } from '@mui/icons-material';

import { Course } from '@/types';

interface CourseOfferingDialogProps {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
}

const CourseOfferingDialog: React.FC<CourseOfferingDialogProps> = ({
  open,
  onClose,
  course,
}) => {
  const [formData, setFormData] = React.useState({
    semester: 'fall',
    academicYear: '2024',
    section: 'A',
    instructor: '',
    capacity: 30,
    schedule: [
      {
        day: 'monday',
        startTime: '09:00',
        endTime: '10:30',
        building: '',
        room: '',
      },
    ],
  });

  const handleSubmit = () => {
    // TODO: Implement course offering creation
    console.log('Creating course offering:', formData);
    onClose();
  };

  const semesterOptions = [
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create Course Offering
        {course && (
          <Box mt={1}>
            <Chip label={course.courseCode} size="small" />
            <Typography variant="body2" color="text.secondary">
              {course.courseName}
            </Typography>
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Course offering management will be fully implemented in the next update.
          This is a preview of the interface.
        </Alert>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={formData.semester}
                label="Semester"
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {semesterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
          </Grid>

          {/* Instructor and Capacity */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Instructor"
              placeholder="Select or enter instructor name"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 200 }}
            />
          </Grid>

          {/* Schedule */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
              Schedule
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Day</InputLabel>
              <Select
                value={formData.schedule[0].day}
                label="Day"
                onChange={(e) => {
                  const newSchedule = [...formData.schedule];
                  newSchedule[0].day = e.target.value;
                  setFormData({ ...formData, schedule: newSchedule });
                }}
              >
                {dayOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={formData.schedule[0].startTime}
              onChange={(e) => {
                const newSchedule = [...formData.schedule];
                newSchedule[0].startTime = e.target.value;
                setFormData({ ...formData, schedule: newSchedule });
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={formData.schedule[0].endTime}
              onChange={(e) => {
                const newSchedule = [...formData.schedule];
                newSchedule[0].endTime = e.target.value;
                setFormData({ ...formData, schedule: newSchedule });
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Location"
              placeholder="Building - Room"
              value={`${formData.schedule[0].building} - ${formData.schedule[0].room}`}
              onChange={(e) => {
                const [building, room] = e.target.value.split(' - ');
                const newSchedule = [...formData.schedule];
                newSchedule[0].building = building || '';
                newSchedule[0].room = room || '';
                setFormData({ ...formData, schedule: newSchedule });
              }}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Offering
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseOfferingDialog;
