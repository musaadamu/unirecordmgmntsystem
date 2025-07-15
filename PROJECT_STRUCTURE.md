# 📁 University Record Management System - Project Structure

## 🎯 Overview

The University Record Management System has been reorganized into a clean, modular structure with separate folders for backend and frontend components. This structure follows modern full-stack development best practices and makes the project more maintainable and scalable.

## 📂 Project Structure

```
university-record-management-system/
├── 📁 backend/                    # Backend API Server (Node.js/Express)
│   ├── 📁 config/                 # Configuration files
│   │   ├── constants.js           # Application constants
│   │   └── database.js            # Database configuration
│   ├── 📁 controllers/            # Route controllers
│   │   ├── adminController.js     # Admin management
│   │   ├── authController.js      # Authentication
│   │   ├── courseController.js    # Course management
│   │   ├── enrollmentController.js # Student enrollments
│   │   ├── gradeController.js     # Grade management
│   │   ├── notificationController.js # Email notifications
│   │   ├── rbacController.js      # Role-based access control
│   │   ├── studentController.js   # Student management
│   │   └── userController.js      # User management
│   ├── 📁 middleware/             # Custom middleware
│   │   ├── auth.js               # Authentication middleware
│   │   ├── errorHandler.js       # Error handling
│   │   ├── rbac.js               # RBAC middleware
│   │   └── validation.js         # Input validation
│   ├── 📁 models/                # Database models (Mongoose)
│   │   ├── User.js               # User model
│   │   ├── Student.js            # Student model
│   │   ├── Course.js             # Course model
│   │   ├── Enrollment.js         # Enrollment model
│   │   ├── Grade.js              # Grade model
│   │   ├── Permission.js         # RBAC Permission model
│   │   ├── Role.js               # RBAC Role model
│   │   ├── UserRole.js           # User-Role assignment
│   │   ├── EmailQueue.js         # Email notification queue
│   │   ├── EmailTemplate.js      # Email templates
│   │   ├── NotificationSettings.js # User notification preferences
│   │   ├── AuditLog.js           # System audit logs
│   │   └── index.js              # Model exports
│   ├── 📁 routes/                # API routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── students.js           # Student routes
│   │   ├── courses.js            # Course routes
│   │   ├── enrollments.js        # Enrollment routes
│   │   ├── grades.js             # Grade routes
│   │   ├── rbac.js               # RBAC management routes
│   │   ├── notifications.js      # Notification routes
│   │   └── users.js              # User management routes
│   ├── 📁 services/              # Business logic services
│   │   ├── emailService.js       # Email delivery service
│   │   ├── notificationService.js # Notification management
│   │   ├── emailQueueProcessor.js # Email queue processing
│   │   └── digestService.js      # Email digest generation
│   ├── 📁 utils/                 # Utility functions
│   │   ├── helpers.js            # General helpers
│   │   ├── logger.js             # Logging utility
│   │   ├── seedData.js           # RBAC seed data
│   │   ├── seedDatabase.js       # Database seeding
│   │   └── emailTemplates.js     # Email template definitions
│   ├── 📁 scripts/               # Setup and maintenance scripts
│   │   ├── initializeRBAC.js     # RBAC system initialization
│   │   ├── initializeNotifications.js # Email system initialization
│   │   └── reorganizeProject.js  # Project structure reorganization
│   ├── 📁 tests/                 # Backend tests
│   │   └── api.test.js           # API endpoint tests
│   ├── 📁 logs/                  # Application logs
│   │   └── error.log             # Error logs
│   ├── 📁 uploads/               # File uploads directory
│   │   └── .gitkeep              # Keep directory in git
│   ├── 📄 server.js              # Main server entry point
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 package-lock.json      # Dependency lock file
│   ├── 📄 .env.example           # Environment variables template
│   └── 📄 README.md              # Backend documentation
├── 📁 admin-portal/              # Admin Frontend (React/TypeScript)
│   ├── 📁 src/                   # Source code
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 pages/             # Page components
│   │   ├── 📁 services/          # API services
│   │   ├── 📁 stores/            # State management
│   │   ├── 📁 types/             # TypeScript types
│   │   ├── 📁 utils/             # Utility functions
│   │   └── main.tsx              # App entry point
│   ├── 📁 public/                # Static assets
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   └── 📄 vite.config.ts         # Vite configuration
├── 📁 student-portal/            # Student Frontend (React/TypeScript)
│   ├── 📁 src/                   # Source code
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 pages/             # Page components
│   │   ├── 📁 services/          # API services
│   │   ├── 📁 stores/            # State management
│   │   ├── 📁 types/             # TypeScript types
│   │   ├── 📁 utils/             # Utility functions
│   │   └── main.tsx              # App entry point
│   ├── 📁 public/                # Static assets
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   └── 📄 vite.config.ts         # Vite configuration
├── 📁 docs/                      # Documentation
│   ├── 📄 API_DOCUMENTATION.md   # API documentation
│   └── 📄 RBAC_SYSTEM.md         # RBAC system documentation
├── 📄 README.md                  # Project overview and setup
├── 📄 PROJECT_PROGRESS.md        # Development progress tracking
├── 📄 PROJECT_STRUCTURE.md       # This file
├── 📄 package.json               # Workspace configuration
└── 📄 .gitignore                 # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for email queue caching)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd university-record-management-system
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up backend environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize the backend system**
```bash
npm run init:backend
```

5. **Start development servers**
```bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Admin Portal
npm run dev:admin

# Terminal 3 - Student Portal
npm run dev:student
```

## 📋 Available Scripts

### Root Level Scripts (Workspace Management)
- `npm run install:all` - Install dependencies for all projects
- `npm run dev:backend` - Start backend development server
- `npm run dev:admin` - Start admin portal development server
- `npm run dev:student` - Start student portal development server
- `npm run init:backend` - Initialize backend systems (RBAC + Notifications)
- `npm run build:all` - Build all frontend applications
- `npm run test:backend` - Run backend tests

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run init-rbac` - Initialize RBAC system
- `npm run init-notifications` - Initialize email notification system
- `npm run init-all` - Initialize both systems

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SendGrid/AWS SES/Mailgun/SMTP
- **Queue**: Redis + Bull for email processing
- **Validation**: Joi + Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router
- **Forms**: React Hook Form

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Rate limiting
- Input validation and sanitization
- Secure file upload handling
- Audit logging for all operations
- Email notification security

## 📧 Email Notification System

- Automated role assignment notifications
- Security alerts and monitoring
- Welcome emails for new users
- Approval request notifications
- Daily and weekly digest emails
- User preference management
- Multi-provider email support

## 🗄️ Database Models

### Core Models
- **User** - System users (students, staff, admins)
- **Student** - Student-specific information
- **Course** - Course definitions and management
- **Enrollment** - Student course enrollments
- **Grade** - Student grades and assessments

### RBAC Models
- **Permission** - System permissions
- **Role** - User roles with permissions
- **UserRole** - User-role assignments
- **AuditLog** - System audit trail

### Notification Models
- **EmailQueue** - Email notification queue
- **EmailTemplate** - Email templates
- **EmailLog** - Email delivery tracking
- **NotificationSettings** - User preferences

## 🔄 Development Workflow

1. **Backend Development**
   - Make changes in `backend/` directory
   - Test with `npm run dev:backend`
   - Run tests with `npm test`

2. **Frontend Development**
   - Admin Portal: Work in `admin-portal/` directory
   - Student Portal: Work in `student-portal/` directory
   - Test with respective dev servers

3. **Database Changes**
   - Update models in `backend/models/`
   - Create migration scripts in `backend/scripts/`
   - Update seed data in `backend/utils/`

## 📊 Monitoring and Logging

- Application logs in `backend/logs/`
- Email delivery tracking
- User activity monitoring
- Performance metrics
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate directory
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This structure provides clear separation of concerns, making the project more maintainable and allowing teams to work independently on different components while maintaining a cohesive system.
