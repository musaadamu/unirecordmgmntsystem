import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Button,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf,
  VideoLibrary,
  Link as LinkIcon,
  Description,
  Slideshow,
  AudioFile,
  Download,
  OpenInNew,
  Folder,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { CourseMaterial } from '@/services/courseService';

interface CourseMaterialsProps {
  courseId: string;
  materials?: CourseMaterial[];
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`materials-tabpanel-${index}`}
      aria-labelledby={`materials-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CourseMaterials: React.FC<CourseMaterialsProps> = ({
  courseId,
  materials = [],
  loading = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Mock materials data
  const mockMaterials: CourseMaterial[] = [
    {
      _id: '1',
      course: {
        _id: courseId,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      title: 'Course Syllabus',
      description: 'Complete course syllabus including objectives, schedule, and grading criteria',
      type: 'pdf',
      url: '/materials/cs101-syllabus.pdf',
      size: 245760,
      category: 'syllabus',
      week: 1,
      isRequired: true,
      downloadCount: 156,
      uploadedBy: {
        name: 'Dr. Sarah Smith',
        role: 'Instructor',
      },
      uploadedAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '2',
      course: {
        _id: courseId,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      title: 'Introduction to Programming - Lecture 1',
      description: 'Basic programming concepts and syntax introduction',
      type: 'pdf',
      url: '/materials/cs101-lecture1.pdf',
      size: 1024000,
      category: 'lecture_notes',
      week: 1,
      isRequired: true,
      downloadCount: 142,
      uploadedBy: {
        name: 'Dr. Sarah Smith',
        role: 'Instructor',
      },
      uploadedAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-08T00:00:00Z',
    },
    {
      _id: '3',
      course: {
        _id: courseId,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      title: 'Programming Fundamentals Video Tutorial',
      description: 'Video explanation of basic programming concepts',
      type: 'video',
      url: '/materials/cs101-video1.mp4',
      size: 52428800,
      category: 'videos',
      week: 1,
      isRequired: false,
      downloadCount: 89,
      uploadedBy: {
        name: 'Dr. Sarah Smith',
        role: 'Instructor',
      },
      uploadedAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    },
    {
      _id: '4',
      course: {
        _id: courseId,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
      },
      title: 'Assignment 1: Hello World Program',
      description: 'First programming assignment - create a simple Hello World program',
      type: 'pdf',
      url: '/materials/cs101-assignment1.pdf',
      size: 102400,
      category: 'assignments',
      week: 2,
      isRequired: true,
      downloadCount: 134,
      uploadedBy: {
        name: 'Dr. Sarah Smith',
        role: 'Instructor',
      },
      uploadedAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  const allMaterials = materials.length > 0 ? materials : mockMaterials;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleFavorite = (materialId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(materialId)) {
      newFavorites.delete(materialId);
    } else {
      newFavorites.add(materialId);
    }
    setFavorites(newFavorites);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
      case 'video':
        return <VideoLibrary sx={{ color: '#1976d2' }} />;
      case 'link':
        return <LinkIcon sx={{ color: '#2e7d32' }} />;
      case 'document':
        return <Description sx={{ color: '#ed6c02' }} />;
      case 'presentation':
        return <Slideshow sx={{ color: '#9c27b0' }} />;
      case 'audio':
        return <AudioFile sx={{ color: '#0288d1' }} />;
      default:
        return <Description sx={{ color: '#757575' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryMaterials = (category: string) => {
    return allMaterials.filter(material => material.category === category);
  };

  const categories = [
    { key: 'all', label: 'All Materials', count: allMaterials.length },
    { key: 'lecture_notes', label: 'Lecture Notes', count: getCategoryMaterials('lecture_notes').length },
    { key: 'assignments', label: 'Assignments', count: getCategoryMaterials('assignments').length },
    { key: 'videos', label: 'Videos', count: getCategoryMaterials('videos').length },
    { key: 'readings', label: 'Readings', count: getCategoryMaterials('readings').length },
    { key: 'syllabus', label: 'Syllabus', count: getCategoryMaterials('syllabus').length },
  ];

  const getDisplayMaterials = () => {
    if (tabValue === 0) return allMaterials;
    const category = categories[tabValue].key;
    return getCategoryMaterials(category);
  };

  const displayMaterials = getDisplayMaterials();

  const handleDownload = (material: CourseMaterial) => {
    // In a real app, this would call the download service
    console.log('Downloading:', material.title);
  };

  const handleOpenLink = (material: CourseMaterial) => {
    window.open(material.url, '_blank');
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Course Materials
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Access lecture notes, assignments, videos, and other course resources
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {categories.map((category, index) => (
              <Tab
                key={category.key}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{category.label}</span>
                    <Chip label={category.count} size="small" />
                  </Box>
                }
                id={`materials-tab-${index}`}
                aria-controls={`materials-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {displayMaterials.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                No materials available in this category.
              </Typography>
            </Alert>
          ) : (
            <List sx={{ p: 0 }}>
              {displayMaterials.map((material, index) => (
                <React.Fragment key={material._id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getFileIcon(material.type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {material.title}
                          </Typography>
                          {material.isRequired && (
                            <Chip label="Required" size="small" color="error" variant="outlined" />
                          )}
                          {material.week && (
                            <Chip label={`Week ${material.week}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {material.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {material.description}
                            </Typography>
                          )}
                          
                          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Typography variant="caption" color="text.secondary">
                              Uploaded by {material.uploadedBy.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(material.uploadedAt), 'MMM dd, yyyy')}
                            </Typography>
                            {material.size && (
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(material.size)}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {material.downloadCount} downloads
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(material._id)}
                          color={favorites.has(material._id) ? 'primary' : 'default'}
                        >
                          {favorites.has(material._id) ? <Star /> : <StarBorder />}
                        </IconButton>
                        
                        {material.type === 'link' ? (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenLink(material)}
                            color="primary"
                          >
                            <OpenInNew />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(material)}
                            color="primary"
                          >
                            <Download />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < displayMaterials.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseMaterials;
