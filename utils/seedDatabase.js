const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, Student, Staff, Course } = require('../models');
const { USER_ROLES, USER_STATUS, ACADEMIC_STATUS } = require('../config/constants');
const { generateStudentId, generateEmployeeId } = require('./helpers');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (adminExists) {
      console.log('Admin user already exists');
      return adminExists;
    }

    const adminUser = new User({
      userId: 'ADMIN001',
      email: process.env.ADMIN_EMAIL || 'admin@university.edu',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: USER_ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
      personalInfo: {
        firstName: 'System',
        lastName: 'Administrator',
        dateOfBirth: new Date('1980-01-01'),
        gender: 'other',
        nationality: 'US'
      },
      contactInfo: {
        phone: '+1-555-0001',
        address: {
          street: '123 University Ave',
          city: 'University City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        }
      },
      emailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Create sample academic staff
const createSampleStaff = async (adminUser) => {
  try {
    const staffExists = await Staff.findOne();
    if (staffExists) {
      console.log('Sample staff already exists');
      return;
    }

    // Create academic staff user
    const staffUser = new User({
      userId: 'STAFF001',
      email: 'john.professor@university.edu',
      password: 'staff123456',
      role: USER_ROLES.ACADEMIC_STAFF,
      status: USER_STATUS.ACTIVE,
      personalInfo: {
        firstName: 'John',
        lastName: 'Professor',
        dateOfBirth: new Date('1975-05-15'),
        gender: 'male',
        nationality: 'US'
      },
      contactInfo: {
        phone: '+1-555-0002',
        address: {
          street: '456 Faculty Lane',
          city: 'University City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        }
      },
      emailVerified: true,
      createdBy: adminUser._id
    });

    await staffUser.save();

    // Create staff profile
    const staffProfile = new Staff({
      user: staffUser._id,
      employeeId: generateEmployeeId('CS', 'academic_staff'),
      employmentInfo: {
        position: 'Professor',
        department: 'Computer Science',
        faculty: 'Engineering',
        employmentType: 'full_time',
        employmentStatus: 'active',
        hireDate: new Date('2010-08-15')
      },
      academicInfo: {
        isAcademicStaff: true,
        rank: 'professor',
        tenure: true,
        tenureDate: new Date('2016-08-15'),
        education: [{
          degree: 'PhD',
          field: 'Computer Science',
          institution: 'MIT',
          graduationYear: 2005
        }],
        researchAreas: ['Machine Learning', 'Data Science', 'Artificial Intelligence'],
        officeHours: [
          { day: 'Monday', startTime: '10:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '16:00' }
        ],
        officeLocation: 'CS Building, Room 301'
      },
      createdBy: adminUser._id
    });

    await staffProfile.save();
    console.log('Sample academic staff created successfully');
    return { staffUser, staffProfile };
  } catch (error) {
    console.error('Error creating sample staff:', error);
  }
};

// Create sample courses
const createSampleCourses = async (adminUser, staffProfile) => {
  try {
    const courseExists = await Course.findOne();
    if (courseExists) {
      console.log('Sample courses already exist');
      return;
    }

    const courses = [
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming',
        academicInfo: {
          department: 'Computer Science',
          faculty: 'Engineering',
          level: 'undergraduate',
          credits: 3
        },
        maxEnrollment: 50,
        courseContent: {
          learningOutcomes: [
            'Understand basic programming concepts',
            'Write simple programs in Python',
            'Understand data structures and algorithms'
          ],
          assessmentMethods: [
            { type: 'assignment', weight: 30, description: 'Programming assignments' },
            { type: 'midterm', weight: 30, description: 'Midterm examination' },
            { type: 'final', weight: 40, description: 'Final examination' }
          ]
        },
        offerings: [{
          section: 'A',
          semester: 'fall',
          academicYear: '2024',
          instructor: staffProfile._id,
          schedule: [{
            day: 'monday',
            startTime: '09:00',
            endTime: '10:30',
            room: 'CS-101',
            building: 'Computer Science Building'
          }, {
            day: 'wednesday',
            startTime: '09:00',
            endTime: '10:30',
            room: 'CS-101',
            building: 'Computer Science Building'
          }],
          capacity: 50,
          startDate: new Date('2024-08-26'),
          endDate: new Date('2024-12-15')
        }],
        createdBy: adminUser._id
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design and analysis',
        academicInfo: {
          department: 'Computer Science',
          faculty: 'Engineering',
          level: 'undergraduate',
          credits: 4
        },
        maxEnrollment: 40,
        courseContent: {
          learningOutcomes: [
            'Implement advanced data structures',
            'Analyze algorithm complexity',
            'Design efficient algorithms'
          ],
          assessmentMethods: [
            { type: 'assignment', weight: 25, description: 'Programming assignments' },
            { type: 'project', weight: 25, description: 'Final project' },
            { type: 'midterm', weight: 25, description: 'Midterm examination' },
            { type: 'final', weight: 25, description: 'Final examination' }
          ]
        },
        offerings: [{
          section: 'A',
          semester: 'spring',
          academicYear: '2024',
          instructor: staffProfile._id,
          schedule: [{
            day: 'tuesday',
            startTime: '11:00',
            endTime: '12:30',
            room: 'CS-201',
            building: 'Computer Science Building'
          }, {
            day: 'thursday',
            startTime: '11:00',
            endTime: '12:30',
            room: 'CS-201',
            building: 'Computer Science Building'
          }],
          capacity: 40,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-05-10')
        }],
        createdBy: adminUser._id
      }
    ];

    await Course.insertMany(courses);
    console.log('Sample courses created successfully');
  } catch (error) {
    console.error('Error creating sample courses:', error);
  }
};

// Create sample student
const createSampleStudent = async (adminUser) => {
  try {
    const studentExists = await Student.findOne();
    if (studentExists) {
      console.log('Sample student already exists');
      return;
    }

    // Create student user
    const studentUser = new User({
      userId: 'STU001',
      email: 'jane.student@university.edu',
      password: 'student123456',
      role: USER_ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Student',
        dateOfBirth: new Date('2002-03-20'),
        gender: 'female',
        nationality: 'US'
      },
      contactInfo: {
        phone: '+1-555-0003',
        address: {
          street: '789 Student Drive',
          city: 'University City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        }
      },
      emailVerified: true,
      createdBy: adminUser._id
    });

    await studentUser.save();

    // Create student profile
    const studentProfile = new Student({
      user: studentUser._id,
      studentId: generateStudentId('2024', 'CS'),
      academicInfo: {
        program: 'Bachelor of Science in Computer Science',
        department: 'Computer Science',
        faculty: 'Engineering',
        level: 'undergraduate',
        yearOfStudy: 1,
        semester: 'fall',
        academicYear: '2024',
        expectedGraduation: new Date('2028-05-15')
      },
      academicStatus: {
        status: ACADEMIC_STATUS.ENROLLED,
        gpa: 0.0,
        totalCredits: 0,
        completedCredits: 0
      },
      enrollmentInfo: {
        admissionDate: new Date('2024-08-15'),
        admissionType: 'regular'
      },
      financialInfo: {
        tuitionStatus: 'unpaid',
        outstandingBalance: 15000
      },
      createdBy: adminUser._id
    });

    await studentProfile.save();
    console.log('Sample student created successfully');
  } catch (error) {
    console.error('Error creating sample student:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const adminUser = await createAdminUser();
    const { staffProfile } = await createSampleStaff(adminUser) || {};
    await createSampleCourses(adminUser, staffProfile);
    await createSampleStudent(adminUser);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
