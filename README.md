# University Record Management System

A comprehensive university record management system built with the MERN stack, featuring separate portals for administrators/staff and students while maintaining unified backend services.

## 🏗️ Architecture

This project follows a modern full-stack architecture with clear separation of concerns:

- **Backend API** (`backend/`): Node.js + Express.js + MongoDB
- **Admin Portal** (`admin-portal/`): React.js + TypeScript (Port 3001)
- **Student Portal** (`student-portal/`): React.js + TypeScript (Port 3000)
- **Database**: MongoDB with Mongoose ODM
- **Email System**: Multi-provider email notifications
- **Queue System**: Redis + Bull for background processing

## 🚀 Features

### Admin/Staff Portal
- User management (students, faculty, staff)
- Academic records management
- Course and grade management
- Administrative oversight
- Reporting and analytics

### Student Portal
- Personal academic records
- Course registration
- Grade viewing
- Fee management
- Document access

### Backend Services (`backend/`)
- JWT-based authentication and authorization
- Comprehensive Role-Based Access Control (RBAC)
- RESTful API design with Express.js
- Secure file upload handling
- Multi-provider email notification system
- Complete audit logging and monitoring
- Redis-based email queue processing
- Database seeding and initialization scripts

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for email queue caching)

## 🛠️ Installation

### Quick Start (Recommended)

1. Clone the repository
```bash
git clone <repository-url>
cd university-record-management-system
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up backend environment
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the backend system
```bash
npm run init:backend
```

5. Start development servers
```bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Admin Portal  
npm run dev:admin

# Terminal 3 - Student Portal
npm run dev:student
```

### Manual Installation

If you prefer to install each component separately:

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run init-all
npm run dev

# Admin Portal
cd ../admin-portal
npm install
npm run dev

# Student Portal  
cd ../student-portal
npm install
npm run dev
```

## 📁 Project Structure

```
├── backend/              # Backend API server (Node.js/Express)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware  
│   ├── models/          # Database models (MongoDB/Mongoose)
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── scripts/         # Database and setup scripts
│   ├── config/          # Configuration files
│   ├── tests/           # Backend tests
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
├── admin-portal/        # Admin frontend (React/TypeScript)
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
├── student-portal/      # Student frontend (React/TypeScript)  
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
├── docs/               # Documentation
├── README.md           # Project overview
└── package.json        # Workspace configuration
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run init-rbac` - Initialize RBAC system with default roles and permissions
- `npm run init-notifications` - Initialize email notification system
- `npm run init-all` - Initialize both RBAC and notification systems

## 📧 Email Notification System

The system includes a comprehensive email notification system with the following features:

### 🔔 Notification Types
- **Role Assignment Notifications** - When roles are assigned or removed
- **Permission Change Alerts** - When permissions are modified
- **Security Alerts** - For suspicious activities and access attempts
- **Welcome Emails** - For new user accounts
- **Approval Requests** - For pending approvals
- **System Maintenance** - For system updates and maintenance
- **Daily/Weekly Digests** - Summarized activity reports

### 📨 Email Providers Supported
- **SendGrid** - Cloud-based email service
- **AWS SES** - Amazon Simple Email Service
- **Mailgun** - Email automation service
- **SMTP** - Standard SMTP servers

### ⚙️ Email Configuration

Add these environment variables to your `.env` file:

```env
# Email Provider (sendgrid|ses|mailgun|smtp)
EMAIL_PROVIDER=sendgrid

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key

# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# General Email Settings
FROM_EMAIL=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
TEST_EMAIL=test@yourdomain.com

# Redis for Email Queue (optional)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 🎛️ Notification Management

Users can manage their notification preferences through:
- **User Dashboard** - Personal notification settings
- **Admin Panel** - System-wide notification management
- **Email Templates** - Customizable email templates
- **Unsubscribe Links** - One-click unsubscribe functionality

### 📊 Email Analytics

The system provides comprehensive email analytics:
- Delivery rates and bounce tracking
- Open and click-through rates
- User engagement metrics
- Category-wise performance
- Real-time queue monitoring

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📝 API Documentation

API documentation will be available at `/api/docs` when the server is running.

## 🧪 Testing

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License.
