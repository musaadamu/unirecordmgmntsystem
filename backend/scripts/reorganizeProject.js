const fs = require('fs');
const path = require('path');

/**
 * Script to reorganize the project structure
 * Moves all backend code into a backend folder
 */

const projectRoot = path.resolve(__dirname, '..');
const backendDir = path.join(projectRoot, 'backend');

// Files and folders to move to backend
const filesToMove = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'controllers',
  'middleware', 
  'models',
  'routes',
  'services',
  'utils',
  'scripts',
  'config',
  'tests',
  'logs',
  'uploads'
];

// Files to keep in root
const filesToKeep = [
  'README.md',
  'PROJECT_PROGRESS.md',
  '.gitignore',
  'admin-portal',
  'student-portal',
  'docs',
  'node_modules'
];

async function reorganizeProject() {
  try {
    console.log('🚀 Starting project reorganization...');
    
    // Create backend directory if it doesn't exist
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
      console.log('✅ Created backend directory');
    }
    
    // Move files to backend
    for (const item of filesToMove) {
      const sourcePath = path.join(projectRoot, item);
      const targetPath = path.join(backendDir, item);
      
      if (fs.existsSync(sourcePath)) {
        try {
          // Check if target already exists
          if (fs.existsSync(targetPath)) {
            console.log(`⚠️  Target already exists: ${item} - merging...`);
            
            // If it's a directory, we need to merge
            if (fs.statSync(sourcePath).isDirectory()) {
              await mergeDirectories(sourcePath, targetPath);
              // Remove source after merging
              fs.rmSync(sourcePath, { recursive: true, force: true });
            } else {
              // For files, backup existing and move new
              const backupPath = targetPath + '.backup';
              if (fs.existsSync(targetPath)) {
                fs.renameSync(targetPath, backupPath);
                console.log(`📦 Backed up existing ${item} to ${item}.backup`);
              }
              fs.renameSync(sourcePath, targetPath);
            }
          } else {
            // Simple move
            fs.renameSync(sourcePath, targetPath);
          }
          
          console.log(`✅ Moved ${item} to backend/`);
        } catch (error) {
          console.error(`❌ Error moving ${item}:`, error.message);
        }
      } else {
        console.log(`⚠️  File not found: ${item}`);
      }
    }
    
    // Update package.json scripts to reference backend
    await updateRootPackageJson();
    
    // Update README.md with new structure
    await updateReadme();
    
    // Create backend-specific README
    await createBackendReadme();
    
    console.log('\n🎉 Project reorganization completed!');
    console.log('\n📁 New project structure:');
    console.log('├── backend/              # Backend API server');
    console.log('│   ├── controllers/      # Route controllers');
    console.log('│   ├── middleware/       # Custom middleware');
    console.log('│   ├── models/          # Database models');
    console.log('│   ├── routes/          # API routes');
    console.log('│   ├── services/        # Business logic services');
    console.log('│   ├── utils/           # Utility functions');
    console.log('│   ├── scripts/         # Database and setup scripts');
    console.log('│   ├── config/          # Configuration files');
    console.log('│   ├── tests/           # Backend tests');
    console.log('│   ├── server.js        # Main server file');
    console.log('│   └── package.json     # Backend dependencies');
    console.log('├── admin-portal/        # Admin frontend (React)');
    console.log('├── student-portal/      # Student frontend (React)');
    console.log('├── docs/               # Documentation');
    console.log('└── README.md           # Project overview');
    
    console.log('\n📋 Next steps:');
    console.log('1. cd backend && npm install');
    console.log('2. cd backend && npm run init-all');
    console.log('3. cd backend && npm run dev');
    
  } catch (error) {
    console.error('❌ Reorganization failed:', error);
  }
}

async function mergeDirectories(sourceDir, targetDir) {
  const items = fs.readdirSync(sourceDir);
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      await mergeDirectories(sourcePath, targetPath);
    } else {
      // For files, check if target exists
      if (fs.existsSync(targetPath)) {
        // Compare files and keep the newer/larger one
        const sourceStats = fs.statSync(sourcePath);
        const targetStats = fs.statSync(targetPath);
        
        if (sourceStats.mtime > targetStats.mtime || sourceStats.size > targetStats.size) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`🔄 Updated ${item} in target directory`);
        }
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
}

async function updateRootPackageJson() {
  const rootPackageJsonPath = path.join(projectRoot, 'package.json');
  
  // Create a simple root package.json for workspace management
  const rootPackageJson = {
    "name": "university-record-management-system",
    "version": "1.0.0",
    "description": "A comprehensive university record management system with MERN stack",
    "private": true,
    "workspaces": [
      "backend",
      "admin-portal", 
      "student-portal"
    ],
    "scripts": {
      "install:all": "npm install && npm run install:backend && npm run install:admin && npm run install:student",
      "install:backend": "cd backend && npm install",
      "install:admin": "cd admin-portal && npm install", 
      "install:student": "cd student-portal && npm install",
      "dev:backend": "cd backend && npm run dev",
      "dev:admin": "cd admin-portal && npm run dev",
      "dev:student": "cd student-portal && npm run dev",
      "start:backend": "cd backend && npm start",
      "start:admin": "cd admin-portal && npm run build && npm run preview",
      "start:student": "cd student-portal && npm run build && npm run preview",
      "init:backend": "cd backend && npm run init-all",
      "test:backend": "cd backend && npm test",
      "build:admin": "cd admin-portal && npm run build",
      "build:student": "cd student-portal && npm run build",
      "build:all": "npm run build:admin && npm run build:student"
    },
    "keywords": [
      "university",
      "record-management", 
      "student-portal",
      "admin-portal",
      "education",
      "mern-stack"
    ],
    "author": "University Development Team",
    "license": "MIT"
  };
  
  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
  console.log('✅ Created root package.json for workspace management');
}

async function updateReadme() {
  const readmePath = path.join(projectRoot, 'README.md');
  
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Update installation instructions
    const newInstallationSection = `## 🛠️ Installation

### Quick Start (Recommended)

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd university-record-management-system
\`\`\`

2. Install all dependencies
\`\`\`bash
npm run install:all
\`\`\`

3. Set up backend environment
\`\`\`bash
cd backend
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Initialize the backend system
\`\`\`bash
npm run init:backend
\`\`\`

5. Start development servers
\`\`\`bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Admin Portal  
npm run dev:admin

# Terminal 3 - Student Portal
npm run dev:student
\`\`\`

### Manual Installation

If you prefer to install each component separately:

\`\`\`bash
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
\`\`\``;

    // Replace the installation section
    readmeContent = readmeContent.replace(
      /## 🛠️ Installation[\s\S]*?(?=## |$)/,
      newInstallationSection + '\n\n'
    );
    
    // Update project structure
    const newProjectStructure = `## 📁 Project Structure

\`\`\`
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
\`\`\``;

    readmeContent = readmeContent.replace(
      /## 📁 Project Structure[\s\S]*?(?=## |$)/,
      newProjectStructure + '\n\n'
    );
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ Updated README.md with new project structure');
  }
}

async function createBackendReadme() {
  const backendReadmePath = path.join(backendDir, 'README.md');
  
  const backendReadmeContent = `# University Record Management System - Backend

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
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Initialize the system
\`\`\`bash
# Initialize RBAC system and email notifications
npm run init-all

# Or initialize separately:
npm run init-rbac
npm run init-notifications
\`\`\`

4. Start the development server
\`\`\`bash
npm run dev
\`\`\`

The API will be available at \`http://localhost:5000\`

## 🔧 Available Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with nodemon
- \`npm test\` - Run tests
- \`npm run lint\` - Run ESLint
- \`npm run format\` - Format code with Prettier
- \`npm run init-rbac\` - Initialize RBAC system
- \`npm run init-notifications\` - Initialize email notification system
- \`npm run init-all\` - Initialize both systems

## 📡 API Endpoints

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/refresh\` - Refresh JWT token
- \`POST /api/auth/logout\` - User logout

### RBAC Management
- \`GET /api/admin/permissions\` - Get all permissions
- \`GET /api/admin/roles\` - Get all roles
- \`POST /api/admin/user-roles/assign\` - Assign role to user
- \`GET /api/admin/user-permissions/:userId\` - Get user permissions

### Notifications
- \`GET /api/notifications/settings/:userId\` - Get notification settings
- \`PUT /api/notifications/settings/:userId\` - Update notification settings
- \`GET /api/notifications/templates\` - Get email templates

### Students & Courses
- \`GET /api/students\` - Get all students
- \`POST /api/students\` - Create new student
- \`GET /api/courses\` - Get all courses
- \`POST /api/enrollments\` - Enroll student in course

## 🔐 Environment Variables

See \`.env.example\` for all required environment variables including:

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

\`\`\`bash
npm test
\`\`\`

## 📝 API Documentation

API documentation is available at \`/api/docs\` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
`;

  fs.writeFileSync(backendReadmePath, backendReadmeContent);
  console.log('✅ Created backend/README.md');
}

// Run the reorganization
if (require.main === module) {
  reorganizeProject();
}

module.exports = { reorganizeProject };
