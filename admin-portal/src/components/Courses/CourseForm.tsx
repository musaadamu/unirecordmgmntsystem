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
  Divider,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Add, Delete } from '@mui/icons-material';

import { Course } from '@/types';

interface CourseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  course?: Course | null;
  loading?: boolean;
}

const courseSchema = yup.object({
  courseCode: yup
    .string()
    .required('Course code is required')
    .matches(/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001'),
  courseName: yup
    .string()
    .required('Course name is required')
    .min(3, 'Course name must be at least 3 characters'),
  description: yup
    .string()
    .required('Course description is required')
    .min(10, 'Description must be at least 10 characters'),
  academicInfo: yup.object({
    department: yup.string().required('Department is required'),
    faculty: yup.string().required('Faculty is required'),
    level: yup.string().oneOf(['undergraduate', 'graduate', 'postgraduate']).required('Level is required'),
    credits: yup.number().min(1, 'Credits must be at least 1').max(6, 'Credits cannot exceed 6').required('Credits is required'),
    prerequisites: yup.array().of(yup.string()),
    corequisites: yup.array().of(yup.string()),
  }),
  courseContent: yup.object({
    learningOutcomes: yup.array().of(yup.string()).min(1, 'At least one learning outcome is required'),
    syllabus: yup.string().required('Syllabus is required'),
    textbooks: yup.array().of(yup.object({
      title: yup.string().required('Title is required'),
      author: yup.string().required('Author is required'),
      isbn: yup.string(),
      edition: yup.string(),
      required: yup.boolean(),
    })),
  }),
  maxEnrollment: yup.number().min(1, 'Max enrollment must be at least 1').required('Max enrollment is required'),
});

const CourseForm: React.FC<CourseFormProps> = ({
  open,
  onClose,
  onSubmit,
  course,
  loading = false,
}) => {
  const isEdit = !!course;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      courseCode: course?.courseCode || '',
      courseName: course?.courseName || '',
      description: course?.description || '',
      academicInfo: {
        department: course?.academicInfo?.department || '',
        faculty: course?.academicInfo?.faculty || '',
        level: course?.academicInfo?.level || 'undergraduate',
        credits: course?.academicInfo?.credits || 3,
        prerequisites: course?.academicInfo?.prerequisites || [],
        corequisites: course?.academicInfo?.corequisites || [],
      },
      courseContent: {
        learningOutcomes: course?.courseContent?.learningOutcomes || [''],
        syllabus: course?.courseContent?.syllabus || '',
        textbooks: course?.courseContent?.textbooks || [
          { title: '', author: '', isbn: '', edition: '', required: true }
        ],
      },
      maxEnrollment: course?.maxEnrollment || 30,
    },
  });

  const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({
    control,
    name: 'courseContent.learningOutcomes',
  });

  const { fields: textbookFields, append: appendTextbook, remove: removeTextbook } = useFieldArray({
    control,
    name: 'courseContent.textbooks',
  });

  React.useEffect(() => {
    if (open && course) {
      reset({
        courseCode: course.courseCode,
        courseName: course.courseName,
        description: course.description,
        academicInfo: {
          department: course.academicInfo?.department || '',
          faculty: course.academicInfo?.faculty || '',
          level: course.academicInfo?.level || 'undergraduate',
          credits: course.academicInfo?.credits || 3,
          prerequisites: course.academicInfo?.prerequisites || [],
          corequisites: course.academicInfo?.corequisites || [],
        },
        courseContent: {
          learningOutcomes: course.courseContent?.learningOutcomes || [''],
          syllabus: course.courseContent?.syllabus || '',
          textbooks: course.courseContent?.textbooks || [
            { title: '', author: '', isbn: '', edition: '', required: true }
          ],
        },
        maxEnrollment: course.maxEnrollment || 30,
      });
    } else if (open && !course) {
      reset({
        courseCode: '',
        courseName: '',
        description: '',
        academicInfo: {
          department: '',
          faculty: '',
          level: 'undergraduate',
          credits: 3,
          prerequisites: [],
          corequisites: [],
        },
        courseContent: {
          learningOutcomes: [''],
          syllabus: '',
          textbooks: [{ title: '', author: '', isbn: '', edition: '', required: true }],
        },
        maxEnrollment: 30,
      });
    }
  }, [open, course, reset]);

  const handleFormSubmit = (data: any) => {
    // Filter out empty learning outcomes and textbooks
    const cleanedData = {
      ...data,
      courseContent: {
        ...data.courseContent,
        learningOutcomes: data.courseContent.learningOutcomes.filter((outcome: string) => outcome.trim() !== ''),
        textbooks: data.courseContent.textbooks.filter((book: any) => book.title.trim() !== ''),
      },
    };
    onSubmit(cleanedData);
  };

  const departmentOptions = [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Medicine',
    'Arts & Humanities',
    'Natural Sciences',
    'Social Sciences',
    'Education',
    'Law',
    'Mathematics',
  ];

  const facultyOptions = [
    'Faculty of Science',
    'Faculty of Engineering',
    'Faculty of Business',
    'Faculty of Medicine',
    'Faculty of Arts',
    'Faculty of Education',
    'Faculty of Law',
  ];

  const levelOptions = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Course' : 'Create New Course'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Controller
                name="courseCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Course Code"
                    placeholder="e.g., CS101"
                    error={!!errors.courseCode}
                    helperText={errors.courseCode?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Controller
                name="courseName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Course Name"
                    error={!!errors.courseName}
                    helperText={errors.courseName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Course Description"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Academic Information */}
          <Typography variant="h6" gutterBottom>
            Academic Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="academicInfo.department"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={departmentOptions}
                    freeSolo
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        error={!!errors.academicInfo?.department}
                        helperText={errors.academicInfo?.department?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="academicInfo.faculty"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={facultyOptions}
                    freeSolo
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Faculty"
                        error={!!errors.academicInfo?.faculty}
                        helperText={errors.academicInfo?.faculty?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="academicInfo.level"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.academicInfo?.level}>
                    <InputLabel>Level</InputLabel>
                    <Select {...field} label="Level">
                      {levelOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="academicInfo.credits"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Credits"
                    type="number"
                    inputProps={{ min: 1, max: 6 }}
                    error={!!errors.academicInfo?.credits}
                    helperText={errors.academicInfo?.credits?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="maxEnrollment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Max Enrollment"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!errors.maxEnrollment}
                    helperText={errors.maxEnrollment?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Learning Outcomes */}
          <Typography variant="h6" gutterBottom>
            Learning Outcomes
          </Typography>
          
          {outcomeFields.map((field, index) => (
            <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
              <Grid item xs={11}>
                <Controller
                  name={`courseContent.learningOutcomes.${index}`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={`Learning Outcome ${index + 1}`}
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  color="error"
                  onClick={() => removeOutcome(index)}
                  disabled={outcomeFields.length === 1}
                  sx={{ mt: 1 }}
                >
                  <Delete />
                </Button>
              </Grid>
            </Grid>
          ))}
          
          <Button
            startIcon={<Add />}
            onClick={() => appendOutcome('')}
            sx={{ mb: 3 }}
          >
            Add Learning Outcome
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* Syllabus */}
          <Typography variant="h6" gutterBottom>
            Syllabus
          </Typography>
          
          <Controller
            name="courseContent.syllabus"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Course Syllabus"
                multiline
                rows={6}
                error={!!errors.courseContent?.syllabus}
                helperText={errors.courseContent?.syllabus?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Divider sx={{ my: 3 }} />

          {/* Textbooks */}
          <Typography variant="h6" gutterBottom>
            Textbooks
          </Typography>
          
          {textbookFields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`courseContent.textbooks.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Book Title"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`courseContent.textbooks.${index}.author`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Author"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`courseContent.textbooks.${index}.isbn`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ISBN"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`courseContent.textbooks.${index}.edition`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Edition"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`courseContent.textbooks.${index}.required`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Required"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button
                    color="error"
                    onClick={() => removeTextbook(index)}
                    disabled={textbookFields.length === 1}
                  >
                    <Delete />
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<Add />}
            onClick={() => appendTextbook({ title: '', author: '', isbn: '', edition: '', required: true })}
          >
            Add Textbook
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseForm;
