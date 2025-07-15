import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  ThumbUp,
  ThumbDown,
  QuestionAnswer,
  School,
  Payment,
  Computer,
  AdminPanelSettings,
  Help,
} from '@mui/icons-material';

import { FAQ as FAQType } from '@/services/supportService';

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);

  // Mock FAQ data
  const mockFAQs: FAQType[] = [
    {
      _id: '1',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address or student ID, and you will receive a password reset link via email. Follow the instructions in the email to create a new password. If you don\'t receive the email within 10 minutes, check your spam folder or contact IT support.',
      category: 'Technical',
      tags: ['password', 'login', 'account'],
      helpfulCount: 45,
      notHelpfulCount: 3,
      views: 234,
      lastUpdated: '2024-01-10T00:00:00Z',
    },
    {
      _id: '2',
      question: 'How can I view my grades and transcript?',
      answer: 'You can view your grades by logging into the student portal and navigating to the "Grades" section. Here you can see your current semester grades, cumulative GPA, and academic progress. To access your official transcript, go to the "Grades" tab and click on "Transcript View". You can download an unofficial transcript immediately or request an official transcript which will be processed within 3-5 business days.',
      category: 'Academic',
      tags: ['grades', 'transcript', 'gpa'],
      helpfulCount: 67,
      notHelpfulCount: 2,
      views: 456,
      lastUpdated: '2024-01-08T00:00:00Z',
    },
    {
      _id: '3',
      question: 'How do I make fee payments?',
      answer: 'Fee payments can be made through the student portal under the "Payments" section. We accept payments via Remita, Paystack, bank transfer, and debit/credit cards. Select the fees you want to pay, choose your preferred payment method, and follow the instructions. You will receive a payment confirmation email and can download your receipt from the portal. For payment plans or financial assistance, contact the Finance Office.',
      category: 'Financial',
      tags: ['payment', 'fees', 'remita', 'paystack'],
      helpfulCount: 89,
      notHelpfulCount: 5,
      views: 678,
      lastUpdated: '2024-01-12T00:00:00Z',
    },
    {
      _id: '4',
      question: 'How do I register for courses?',
      answer: 'Course registration is done through the student portal during the designated registration period. Go to the "Courses" section and click on "Course Registration". You can search for courses by code, name, or department. Make sure you meet the prerequisites for each course before registering. If you encounter any issues or need to register for a closed course, contact your academic advisor.',
      category: 'Academic',
      tags: ['registration', 'courses', 'enrollment'],
      helpfulCount: 78,
      notHelpfulCount: 4,
      views: 543,
      lastUpdated: '2024-01-05T00:00:00Z',
    },
    {
      _id: '5',
      question: 'What should I do if I can\'t access the student portal?',
      answer: 'If you\'re having trouble accessing the student portal, first check your internet connection and try refreshing the page. Clear your browser cache and cookies, or try using a different browser. Ensure you\'re using the correct login credentials. If the problem persists, it might be due to server maintenance or technical issues. Contact IT support at support@university.edu or call the help desk at +234-800-HELP.',
      category: 'Technical',
      tags: ['portal', 'access', 'login', 'technical'],
      helpfulCount: 56,
      notHelpfulCount: 8,
      views: 432,
      lastUpdated: '2024-01-15T00:00:00Z',
    },
    {
      _id: '6',
      question: 'How do I apply for financial aid or scholarships?',
      answer: 'Financial aid and scholarship applications can be submitted through the "Payments" section under "Financial Aid". Browse available opportunities, check eligibility requirements, and submit your application with required documents. Applications are typically reviewed within 2-4 weeks. You can track your application status in the portal. For additional assistance, contact the Financial Aid Office.',
      category: 'Financial',
      tags: ['financial aid', 'scholarship', 'application'],
      helpfulCount: 92,
      notHelpfulCount: 3,
      views: 765,
      lastUpdated: '2024-01-09T00:00:00Z',
    },
    {
      _id: '7',
      question: 'How do I contact my academic advisor?',
      answer: 'You can contact your academic advisor through the "Support" section under "Academic Advisor". Here you can view your advisor\'s contact information, schedule meetings, and send messages. You can also find their office hours and location. If you need to change your advisor or have urgent academic concerns, contact the Academic Affairs Office.',
      category: 'Academic',
      tags: ['advisor', 'meeting', 'academic'],
      helpfulCount: 73,
      notHelpfulCount: 2,
      views: 398,
      lastUpdated: '2024-01-11T00:00:00Z',
    },
    {
      _id: '8',
      question: 'What are the library hours and services?',
      answer: 'The university library is open Monday-Friday 8:00 AM to 10:00 PM, Saturday 9:00 AM to 6:00 PM, and Sunday 12:00 PM to 8:00 PM. During exam periods, the library extends to 24/7 operations. Services include book borrowing, computer access, study rooms, printing, and research assistance. You can reserve study rooms and check book availability through the library portal.',
      category: 'General',
      tags: ['library', 'hours', 'services', 'books'],
      helpfulCount: 64,
      notHelpfulCount: 1,
      views: 287,
      lastUpdated: '2024-01-07T00:00:00Z',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Help /> },
    { value: 'Academic', label: 'Academic', icon: <School /> },
    { value: 'Technical', label: 'Technical', icon: <Computer /> },
    { value: 'Financial', label: 'Financial', icon: <Payment /> },
    { value: 'Administrative', label: 'Administrative', icon: <AdminPanelSettings /> },
    { value: 'General', label: 'General', icon: <QuestionAnswer /> },
  ];

  const getFilteredFAQs = () => {
    return mockFAQs.filter(faq => {
      // Category filter
      if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return faq.question.toLowerCase().includes(query) ||
               faq.answer.toLowerCase().includes(query) ||
               faq.tags.some(tag => tag.toLowerCase().includes(query));
      }
      
      return true;
    });
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const handleHelpfulVote = (faqId: string, helpful: boolean) => {
    console.log('Voting on FAQ:', faqId, helpful ? 'helpful' : 'not helpful');
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj?.icon || <Help />;
  };

  const filteredFAQs = getFilteredFAQs();

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Find answers to common questions about using the student portal and university services.
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {category.icon}
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Categories */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Browse by Category
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {categories.slice(1).map((category) => (
            <Chip
              key={category.value}
              icon={category.icon}
              label={category.label}
              onClick={() => setSelectedCategory(category.value)}
              color={selectedCategory === category.value ? 'primary' : 'default'}
              variant={selectedCategory === category.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* FAQ Results */}
      {filteredFAQs.length === 0 ? (
        <Alert severity="info">
          No FAQs found matching your search criteria. Try adjusting your search terms or category filter.
        </Alert>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} found
          </Typography>
          
          {filteredFAQs.map((faq) => (
            <Accordion
              key={faq._id}
              expanded={expandedFAQ === faq._id}
              onChange={handleAccordionChange(faq._id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Box display="flex" alignItems="center" gap={1}>
                    {getCategoryIcon(faq.category)}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {faq.question}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} ml="auto">
                    <Chip
                      label={faq.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${faq.views} views`}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box>
                  <Typography variant="body1" paragraph>
                    {faq.answer}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {faq.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="caption" color="text.secondary">
                        Was this helpful?
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleHelpfulVote(faq._id, true)}
                          color="success"
                        >
                          <ThumbUp />
                        </IconButton>
                        <Typography variant="caption">
                          {faq.helpfulCount}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleHelpfulVote(faq._id, false)}
                          color="error"
                        >
                          <ThumbDown />
                        </IconButton>
                        <Typography variant="caption">
                          {faq.notHelpfulCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Help Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Still need help?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            If you couldn't find the answer to your question, don't hesitate to reach out to our support team.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button variant="contained" startIcon={<QuestionAnswer />}>
              Create Support Ticket
            </Button>
            <Button variant="outlined" startIcon={<QuestionAnswer />}>
              Start Live Chat
            </Button>
            <Button variant="outlined">
              Contact Academic Advisor
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FAQ;
