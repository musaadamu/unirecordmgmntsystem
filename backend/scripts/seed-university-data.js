#!/usr/bin/env node
/**
 * University Data Seeding Script
 * 
 * This script seeds the database with sample university data
 * including faculties, departments, and initial users
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university-db';

// Sample university structure
const UNIVERSITY_STRUCTURE = {
  faculties: [
    {
      name: 'Faculty of Engineering',
      code: 'FOE',
      description: 'Engineering and technology programs',
      dean: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 's.johnson@university.edu',
        username: 'dean_engineering'
      }
    },
    {
      name: 'Faculty of Science',
      code: 'FOS',
      description: 'Natural and applied sciences',
      dean: {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'm.chen@university.edu',
        username: 'dean_science'
      }
    },
    {
      name: 'Faculty of Business',
      code: 'FOB',
      description: 'Business and management programs',
      dean: {
        firstName: 'Emily',
        lastName: 'Williams',
        email: 'e.williams@university.edu',
        username: 'dean_business'
      }
    }
  ],
  
  departments: [
    {
      name: 'Department of Computer Science',
      code: 'CS',
      faculty: 'Faculty of Engineering',
      hod: {
        firstName: 'David',
        lastName: 'Martinez',
        email: 'd.martinez@university.edu',
        username: 'hod_cs'
      }
    },
    {
      name: 'Department of Electrical Engineering',
      code: 'EE',
      faculty: 'Faculty of Engineering',
      hod: {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'l.anderson@university.edu',
        username: 'hod_ee'
      }
    },
    {
      name: 'Department of Mathematics',
      code: 'MATH',
      faculty: 'Faculty of Science',
      hod: {
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'r.taylor@university.edu',
        username: 'hod_math'
      }
    },
    {
      name: 'Department of Business Administration',
      code: 'BA',
      faculty: 'Faculty of Business',
      hod: {
        firstName: 'Jennifer',
        lastName: 'Brown',
        email: 'j.brown@university.edu',
        username: 'hod_business'
      }
    }
  ],
  
  staff: [
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'j.wilson@university.edu',
      username: 'vc_president',
      role: 'VC_PRESIDENT',
      position: 'Vice Chancellor'
    },
    {
      firstName: 'Amanda',
      lastName: 'Davis',
      email: 'a.davis@university.edu',
      username: 'dvc_academic',
      role: 'DVC_ACADEMIC',
      position: 'Deputy VC (Academic)'
    },
    {
      firstName: 'Christopher',
      lastName: 'Miller',
      email: 'c.miller@university.edu',
      username: 'registrar',
      role: 'REGISTRAR',
      position: 'Registrar'
    },
    {
      firstName: 'Jessica',
      lastName: 'Garcia',
      email: 'j.garcia@university.edu',
      username: 'student_affairs',
      role: 'STUDENT_AFFAIRS_OFFICER',
      position: 'Student Affairs Officer'
    },
    {
      firstName: 'Daniel',
      lastName: 'Rodriguez',
      email: 'd.rodriguez@university.edu',
      username: 'it_support',
      role: 'IT_SUPPORT',
      position: 'IT Support Officer'
    }
  ],
  
  faculty: [
    {
      firstName: 'Prof.',
      lastName: 'Thompson',
      email: 'prof.thompson@university.edu',
      username: 'prof_thompson',
      role: 'PROFESSOR',
      department: 'Department of Computer Science'
    },
    {
      firstName: 'Dr.',
      lastName: 'Lee',
      email: 'dr.lee@university.edu',
      username: 'dr_lee',
      role: 'ASSOC_PROFESSOR',
      department: 'Department of Electrical Engineering'
    },
    {
      firstName: 'Dr.',
      lastName: 'White',
      email: 'dr.white@university.edu',
      username: 'dr_white',
      role: 'ASST_PROFESSOR',
      department: 'Department of Mathematics'
    }
  ],
  
  students: [
    {
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@student.university.edu',
      username: 'alex_johnson',
      role: 'UNDERGRAD_STUDENT',
      studentId: 'UG2024001'
    },
    {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@student.university.edu',
      username: 'maria_garcia',
      role: 'GRADUATE_STUDENT',
      studentId: 'GR2024001'
    },
    {
      firstName: 'Kevin',
      lastName: 'Brown',
      email: 'kevin.brown@student.university.edu',
      username: 'kevin_brown',
      role: 'UNDERGRAD_STUDENT',
      studentId: 'UG2024002'
    }
  ]
};

async function seedUniversityData() {
  try {
    console.log('🌱 Seeding university data...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing university data...');
    await Faculty.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({ email: { $in: UNIVERSITY_STRUCTURE.staff.map(s => s.email) } });
    await User.deleteMany({ email: { $in: UNIVERSITY_STRUCTURE.students.map(s => s.email) } });
    console.log('✅ Cleared existing data');

    // Create faculties
    console.log('🏛️ Creating faculties...');
    const facultyMap = {};
    for (const facultyData of UNIVERSITY_STRUCTURE.faculties) {
      const faculty = await Faculty.create({
        name: facultyData.name,
        code: facultyData.code,
        description: facultyData.description,
        isActive: true
      });
      facultyMap[facultyData.name] = faculty;
      console.log(`✅ Created faculty: ${faculty.name}`);
    }

    // Create departments
    console.log('📚 Creating departments...');
    const departmentMap = {};
    for (const deptData of UNIVERSITY_STRUCTURE.departments) {
      const department = await Department.create({
        name: deptData.name,
        code: deptData.code,
        faculty: facultyMap[deptData.faculty]._id,
        isActive: true
      });
      departmentMap[deptData.name] = department;
      console.log(`✅ Created department: ${department.name}`);
    }

    // Create system admin
    const systemAdmin = await User.create({
      email: 'admin@university.edu',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: await bcrypt.hash('admin123', 10),
      role: 'super_admin',
      isActive: true
    });
    console.log('✅ Created system admin');

    // Create staff users
    console.log('👥 Creating staff users...');
    const roleMap = {};
    const roles = await Role.find({ isSystemRole: true });
    roles.forEach(role => {
      roleMap[role.metadata.roleCode] = role;
    });
    roles.forEach(role => {
      roleMap[role.metadata.roleCode] = role;
    });
