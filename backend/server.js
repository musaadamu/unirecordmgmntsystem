const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Serve static files from backend/public for sitemap and robots
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', // Student Portal
    'http://localhost:3001', // Admin Portal
    'http://localhost:5173', // Added for frontend dev server
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Exclude /api/auth/login from global rate limiter to prevent login throttling
const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.'
});

app.use('/api/auth/login', authLoginLimiter);
app.use('/api/', limiter);

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_records', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Swagger API docs
require('./swagger')(app);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'University Record Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/transcripts', require('./routes/transcripts'));
const dashboardRoutes = require('./routes/dashboard');
const assignmentsRoutes = require('./routes/assignments');

app.use('/api/payments', require('./routes/payments'));

// RBAC Routes
app.use('/api/admin', require('./routes/rbac'));

// Notification Routes
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/course-offerings', require('./routes/courseOfferings'));

// Import error handling middleware
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');

// 404 handler for undefined routes
app.use(handleNotFound);

// Global error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
