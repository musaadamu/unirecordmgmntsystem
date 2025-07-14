# University Record Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user (students can self-register, staff requires admin)

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "SecurePass123",
  "role": "student|academic_staff|support_staff|admin|super_admin",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-01-15",
    "gender": "male|female|other",
    "nationality": "US"
  },
  "contactInfo": {
    "phone": "+1-555-0123",
    "address": {
      "street": "123 Main St",
      "city": "University City",
      "state": "State",
      "zipCode": "12345",
      "country": "USA"
    }
  }
}
```

### POST /auth/login
Login user

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@university.edu",
      "role": "student",
      "fullName": "John Doe"
    }
  }
}
```

### POST /auth/logout
Logout user (requires authentication)

### GET /auth/profile
Get current user profile (requires authentication)

### PUT /auth/profile
Update user profile (requires authentication)

### PUT /auth/change-password
Change user password (requires authentication)

## User Management Endpoints

### GET /users
Get all users with pagination and filtering (Admin/Staff only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `role` (string): Filter by user role
- `status` (string): Filter by user status
- `search` (string): Search in name, email, or user ID
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order - asc|desc (default: desc)

### GET /users/:id
Get user by ID (Admin/Staff or own profile)

### PUT /users/:id
Update user (Admin or own profile)

### DELETE /users/:id
Delete user - soft delete (Super Admin only)

### GET /users/search
Search users (Admin/Staff only)

### GET /users/stats
Get user statistics (Admin only)

## Student Management Endpoints

### GET /students
Get all students with pagination and filtering (Admin/Staff only)

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order` (same as users)
- `department` (string): Filter by department
- `program` (string): Filter by program
- `academicYear` (string): Filter by academic year
- `status` (string): Filter by academic status

### GET /students/:id
Get student by ID (Admin/Staff or own record)

### PUT /students/:id
Update student information (Admin/Staff or own record)

### GET /students/:id/academic-summary
Get student academic summary including GPA, credits, enrollments, and grades

### GET /students/stats
Get student statistics (Admin/Staff only)

## Course Management Endpoints

### GET /courses
Get all courses with pagination and filtering

**Query Parameters:**
- `page`, `limit`, `search`, `sort`, `order` (same as users)
- `department` (string): Filter by department
- `faculty` (string): Filter by faculty
- `level` (string): Filter by level (undergraduate|graduate|postgraduate)
- `status` (string): Filter by course status
- `semester` (string): Filter by semester (fall|spring|summer)
- `academicYear` (string): Filter by academic year

### GET /courses/:id
Get course by ID

### POST /courses
Create new course (Admin/Academic Staff only)

**Request Body:**
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "description": "Course description",
  "academicInfo": {
    "department": "Computer Science",
    "faculty": "Engineering",
    "level": "undergraduate",
    "credits": 3
  },
  "maxEnrollment": 50,
  "courseContent": {
    "learningOutcomes": ["Outcome 1", "Outcome 2"],
    "assessmentMethods": [
      {
        "type": "assignment",
        "weight": 30,
        "description": "Programming assignments"
      }
    ]
  }
}
```

### PUT /courses/:id
Update course (Admin/Academic Staff only)

### DELETE /courses/:id
Delete course - soft delete (Admin only)

### GET /courses/:id/enrollments
Get course enrollments (Admin/Staff/Instructor only)

### GET /courses/stats
Get course statistics (Admin/Staff only)

## Error Codes

- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (authentication required or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes per IP
- Registration endpoint: 3 requests per hour per IP
- General API endpoints: 100 requests per 15 minutes per IP

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Search and Filtering

Most endpoints support search and filtering:
- Use `search` parameter for text search across relevant fields
- Use specific field parameters for exact filtering
- Combine multiple filters for refined results

## Sorting

Use `sort` and `order` parameters:
- `sort`: Field name to sort by
- `order`: `asc` for ascending, `desc` for descending

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting to prevent abuse
- Input validation and sanitization
- Password hashing with bcrypt
- CORS protection
- Security headers with Helmet.js
- Audit logging for sensitive operations

## Development Notes

- All timestamps are in ISO 8601 format
- All monetary amounts are in cents (USD)
- File uploads support common formats (PDF, images, documents)
- Database uses MongoDB with Mongoose ODM
- API follows RESTful conventions
