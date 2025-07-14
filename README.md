# University Record Management System

A comprehensive university record management system built with the MERN stack, featuring separate portals for administrators/staff and students while maintaining unified backend services.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + MongoDB
- **Admin/Staff Portal**: React.js (Port 3001)
- **Student Portal**: React.js (Port 3000)
- **Database**: MongoDB with Mongoose ODM

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

### Backend Services
- JWT-based authentication
- Role-based access control
- RESTful API design
- File upload handling
- Email notifications
- Audit logging

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local or cloud instance)

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd university-record-management-system
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

## 📁 Project Structure

```
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── uploads/         # File uploads
├── logs/           # Application logs
├── tests/          # Test files
├── server.js       # Main server file
└── package.json    # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

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
