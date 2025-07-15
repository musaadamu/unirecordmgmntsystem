# University Record Management System - Backend

This is the backend API server for the University Record Management System, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **RESTful API** - Complete REST API for university operations
- **RBAC System** - Role-based access control with permissions
- **Email Notifications** - Comprehensive notification system
- **Authentication** - JWT-based authentication and authorization
- **File Upload** - Secure file upload handling
- **Audit Logging** - Complete audit trail for all operations
- **Payment Integration** - Remita payment system integration
- **Database Models** - Comprehensive MongoDB models

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SendGrid/AWS SES/Mailgun/SMTP
- **Queue**: Redis + Bull for email processing
- **Validation**: Joi + Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for email queue caching)

## 🚀 Quick Start

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize the system
```bash
# Initialize RBAC system and email notifications
npm run init-all

# Or initialize separately:
npm run init-rbac
npm run init-notifications
```

4. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run init-rbac` - Initialize RBAC system
- `npm run init-notifications` - Initialize email notification system
- `npm run init-all` - Initialize both systems

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### RBAC Management
- `GET /api/admin/permissions` - Get all permissions
- `GET /api/admin/roles` - Get all roles
- `POST /api/admin/user-roles/assign` - Assign role to user
- `GET /api/admin/user-permissions/:userId` - Get user permissions

### Notifications
- `GET /api/notifications/settings/:userId` - Get notification settings
- `PUT /api/notifications/settings/:userId` - Update notification settings
- `GET /api/notifications/templates` - Get email templates

### Students & Courses
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/courses` - Get all courses
- `POST /api/enrollments` - Enroll student in course

## 🔐 Environment Variables

See `.env.example` for all required environment variables including:

- Database configuration
- JWT secrets
- Email provider settings
- Redis configuration
- Security settings

## 📊 Database Models

- **User** - System users (students, staff, admins)
- **Student** - Student-specific information
- **Course** - Course definitions
- **Enrollment** - Student course enrollments
- **Grade** - Student grades and assessments
- **Permission** - System permissions
- **Role** - User roles with permissions
- **AuditLog** - System audit trail
- **EmailQueue** - Email notification queue

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Rate limiting
- Input validation and sanitization
- Secure file upload handling
- Audit logging for all operations

## 📧 Email Notification System

Comprehensive email notification system with:
- Role assignment notifications
- Security alerts
- Welcome emails
- Approval requests
- Daily/weekly digests
- User preference management

## 🧪 Testing

```bash
npm test
```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
