const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const { USER_ROLES, USER_STATUS } = require('./config/constants');
require('dotenv').config();

async function createUsers() {
  try {
    console.log('🚀 Starting user creation...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_records');
    console.log('✅ Connected to MongoDB');

    // Create Admin User
    console.log('\n👤 Creating Admin User...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'msmajemusa4@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: msmajemusa4@gmail.com');
    } else {
      const adminUser = new User({
        userId: `ADMIN${Date.now().toString().slice(-6)}`,
        email: 'msmajemusa4@gmail.com',
        password: 'uni@2023',
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        personalInfo: {
          firstName: 'Musa',
          lastName: 'Admin',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          nationality: 'NG'
        },
        contactInfo: {
          phone: '+234-800-000-0001',
          address: {
            street: '123 Admin Street',
            city: 'Lagos',
            state: 'Lagos',
            zipCode: '100001',
            country: 'Nigeria'
          }
        },
        emailVerified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   User ID: ${adminUser.userId}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    // Create Student User
    console.log('\n🎓 Creating Student User...');
    
    // Check if student user already exists
    const existingStudent = await User.findOne({ email: 'msmaje2024@gmail.com' });
    if (existingStudent) {
      console.log('⚠️  Student user already exists with email: msmaje2024@gmail.com');
    } else {
      const studentUser = new User({
        userId: `STU${Date.now().toString().slice(-6)}`,
        email: 'msmaje2024@gmail.com',
        password: 'uni@2024',
        role: USER_ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
        personalInfo: {
          firstName: 'Musa',
          lastName: 'Student',
          dateOfBirth: new Date('2000-01-01'),
          gender: 'male',
          nationality: 'NG'
        },
        contactInfo: {
          phone: '+234-800-000-0002',
          address: {
            street: '456 Student Avenue',
            city: 'Lagos',
            state: 'Lagos',
            zipCode: '100002',
            country: 'Nigeria'
          }
        },
        emailVerified: true
      });

      await studentUser.save();
      console.log('✅ Student user created successfully!');
      console.log(`   Email: ${studentUser.email}`);
      console.log(`   User ID: ${studentUser.userId}`);
      console.log(`   Role: ${studentUser.role}`);

      // Create Student Profile
      console.log('\n📚 Creating Student Profile...');
      const studentProfile = new Student({
        user: studentUser._id,
        studentId: studentUser.userId,
        academicInfo: {
          program: 'Computer Science',
          level: 'undergraduate',
          yearOfStudy: 1,
          semester: 'first',
          academicYear: '2024/2025',
          enrollmentDate: new Date(),
          expectedGraduationDate: new Date('2028-06-01'),
          academicStatus: 'active',
          gpa: 0.0,
          totalCredits: 0,
          completedCredits: 0
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '+234-800-000-0003',
          email: 'emergency@example.com'
        }
      });

      await studentProfile.save();
      console.log('✅ Student profile created successfully!');
      console.log(`   Student ID: ${studentProfile.studentId}`);
      console.log(`   Program: ${studentProfile.academicInfo.program}`);
    }

    console.log('\n🎉 User creation completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Admin Account:');
    console.log('   Email: msmajemusa4@gmail.com');
    console.log('   Password: uni@2023');
    console.log('   Role: Admin');
    console.log('\n🎓 Student Account:');
    console.log('   Email: msmaje2024@gmail.com');
    console.log('   Password: uni@2024');
    console.log('   Role: Student');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

// Run the script
createUsers();
