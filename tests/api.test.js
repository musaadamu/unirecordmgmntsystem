const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { User, Student, Course } = require('../models');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/university_records_test';

describe('University Record Management System API', () => {
  let authToken;
  let adminToken;
  let studentToken;
  let testUser;
  let testStudent;
  let testCourse;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Clear test database
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new student user', async () => {
        const userData = {
          email: 'student@test.com',
          password: 'Test123456',
          role: 'student',
          personalInfo: {
            firstName: 'Test',
            lastName: 'Student',
            dateOfBirth: '2000-01-01',
            gender: 'male',
            nationality: 'US'
          },
          contactInfo: {
            phone: '+1-555-0123'
          }
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.role).toBe(userData.role);
        
        testUser = response.body.data.user;
      });

      it('should not register user with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'Test123456',
          role: 'student'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      it('should not register user with weak password', async () => {
        const userData = {
          email: 'test2@test.com',
          password: '123',
          role: 'student'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'student@test.com',
          password: 'Test123456'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user.email).toBe(loginData.email);
        
        studentToken = response.body.data.accessToken;
      });

      it('should not login with invalid credentials', async () => {
        const loginData = {
          email: 'student@test.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/auth/profile', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.profile).toBeDefined();
      });

      it('should not get profile without token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('User Management', () => {
    beforeAll(async () => {
      // Create admin user for testing
      const adminUser = new User({
        userId: 'ADMIN001',
        email: 'admin@test.com',
        password: 'Admin123456',
        role: 'super_admin',
        status: 'active',
        personalInfo: {
          firstName: 'Admin',
          lastName: 'User',
          dateOfBirth: '1980-01-01',
          gender: 'other',
          nationality: 'US'
        },
        contactInfo: {
          phone: '+1-555-0001'
        },
        emailVerified: true
      });
      await adminUser.save();

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Admin123456'
        });
      
      adminToken = loginResponse.body.data.accessToken;
    });

    describe('GET /api/users', () => {
      it('should get all users for admin', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeDefined();
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should not allow students to get all users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID for admin', async () => {
        const response = await request(app)
          .get(`/api/users/${testUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
      });
    });
  });

  describe('Course Management', () => {
    describe('POST /api/courses', () => {
      it('should create a new course for admin', async () => {
        const courseData = {
          courseCode: 'TEST101',
          courseName: 'Test Course',
          description: 'A test course for API testing',
          academicInfo: {
            department: 'Computer Science',
            faculty: 'Engineering',
            level: 'undergraduate',
            credits: 3
          },
          maxEnrollment: 30
        };

        const response = await request(app)
          .post('/api/courses')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(courseData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.course.courseCode).toBe(courseData.courseCode);
        
        testCourse = response.body.data.course;
      });

      it('should not allow students to create courses', async () => {
        const courseData = {
          courseCode: 'TEST102',
          courseName: 'Another Test Course',
          description: 'Another test course',
          academicInfo: {
            department: 'Computer Science',
            faculty: 'Engineering',
            level: 'undergraduate',
            credits: 3
          },
          maxEnrollment: 30
        };

        const response = await request(app)
          .post('/api/courses')
          .set('Authorization', `Bearer ${studentToken}`)
          .send(courseData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/courses', () => {
      it('should get all courses for any authenticated user', async () => {
        const response = await request(app)
          .get('/api/courses')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.courses).toBeDefined();
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/courses?page=1&limit=5')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.data.pagination.currentPage).toBe(1);
        expect(response.body.data.courses.length).toBeLessThanOrEqual(5);
      });
    });

    describe('GET /api/courses/:id', () => {
      it('should get course by ID', async () => {
        const response = await request(app)
          .get(`/api/courses/${testCourse._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.course.courseCode).toBe(testCourse.courseCode);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for protected routes without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
