#!/usr/bin/env node
/**
 * University User Roles Initialization Script
 * 
 * This script initializes the comprehensive university user roles system
 * based on the UNIVERSITY_USER_ROLES_SPECIFICATION.md
 */

const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university-db';

// University Role Definitions
const UNIVERSITY_ROLES = {
  // Executive Leadership (Level 1)
  VC_PRESIDENT: {
    name: 'Vice Chancellor/President',
    description: 'Full system access and override capabilities. Strategic planning and policy decisions, financial oversight and budget approval, staff appointment and termination authority, academic program approval, institutional reporting access.',
    level: 10,
    category: 'executive',
    permissions: ['*'] // All permissions
  },
  
  DVC_ACADEMIC: {
    name: 'Deputy Vice Chancellor (Academic)',
    description: 'Academic program oversight, faculty coordination, research management, academic policy implementation, quality assurance supervision, academic calendar management.',
    level: 9,
    category: 'executive',
    permissions: [
      'academic:*',
      'courses:*',
      'students:*',
      'faculty:*',
      'research:*',
      'reports:academic',
      'system:academic_config'
    ]
  },
  
  DVC_ADMIN: {
    name: 'Deputy Vice Chancellor (Administration)',
    description: 'Administrative operations oversight, infrastructure management, human resource coordination, security and safety management, non-academic staff supervision.',
    level: 9,
    category: 'executive',
    permissions: [
      'admin:*',
      'hr:*',
      'facilities:*',
      'security:*',
      'infrastructure:*',
      'reports:administrative',
      'system:admin_config'
    ]
  },
  
  PROVOST: {
    name: 'Provost',
    description: 'Campus-wide academic leadership, faculty development programs, academic standards enforcement, inter-departmental coordination, academic calendar management.',
    level: 9,
    category: 'executive',
    permissions: [
      'academic:*',
      'faculty:*',
      'standards:*',
      'calendar:*',
      'reports:academic',
      'system:academic_config'
    ]
  },
  
  REGISTRAR: {
    name: 'Registrar',
    description: 'Official academic record keeping, degree verification and certification, academic transcript management, graduation requirements verification, academic appeals processing.',
    level: 8,
    category: 'executive',
    permissions: [
      'records:*',
      'transcripts:*',
      'graduation:*',
      'certification:*',
      'appeals:*',
      'reports:academic_records',
      'students:read',
      'courses:read'
    ]
  },

  // Faculty Leadership (Level 2)
  DEAN_FACULTY: {
    name: 'Dean of Faculty',
    description: 'Faculty-level academic oversight, department coordination within faculty, faculty budget management, staff recruitment at faculty level, academic program development.',
    level: 7,
    category: 'faculty',
    permissions: [
      'faculty:manage',
      'department:manage',
      'budget:faculty',
      'staff:faculty',
      'programs:faculty',
      'reports:faculty',
      'students:read',
      'courses:read'
    ]
  },
  
  ASSOC_DEAN_ACADEMIC: {
    name: 'Associate Dean (Academic)',
    description: 'Academic affairs oversight within faculty, department support and coordination, faculty committee participation, student progression monitoring.',
    level: 6,
    category: 'faculty',
    permissions: [
      'academic:faculty',
      'department:read',
      'students:read',
      'courses:read',
      'reports:academic',
      'calendar:faculty'
    ]
  },
  
  ASSOC_DEAN_RESEARCH: {
    name: 'Associate Dean (Research)',
    description: 'Research oversight within faculty, research coordination, grant management, research policy implementation.',
    level: 6,
    category: 'faculty',
    permissions: [
      'research:faculty',
      'grants:manage',
      'publications:manage',
      'reports:research',
      'faculty:research'
    ]
  },

  // Department Leadership (Level 3)
  HOD_DEPARTMENT: {
    name: 'Head of Department',
    description: 'Department academic leadership, course assignment and scheduling, departmental staff management, student academic progression, research supervision coordination.',
    level: 5,
    category: 'department',
    permissions: [
      'department:manage',
      'courses:department',
      'staff:department',
      'students:department',
      'research:department',
      'budget:department',
      'reports:department'
    ]
  },
  
  ACAD_SECRETARY: {
    name: 'Academic Secretary',
    description: 'Academic record maintenance, examination coordination, academic calendar management, course registration oversight, grade processing and verification.',
    level: 5,
    category: 'department',
    permissions: [
      'records:academic',
      'exams:coordinate',
      'calendar:academic',
      'registration:oversight',
      'grades:process',
      'transcripts:generate',
      'reports:academic'
    ]
  },
  
  PROGRAM_COORDINATOR: {
    name: 'Program Coordinator',
    description: 'Program curriculum management, course coordination, student advising, program assessment, industry liaison.',
    level: 4,
    category: 'department',
    permissions: [
      'program:manage',
      'courses:program',
      'students:advise',
      'assessment:program',
      'industry:liaison',
      'reports:program'
    ]
  },

  // Academic Staff (Level 4)
  PROFESSOR: {
    name: 'Professor',
    description: 'Advanced teaching responsibilities, research leadership, PhD student supervision, academic committee participation, institutional service.',
    level: 6,
    category: 'academic',
    permissions: [
      'courses:teach',
      'research:lead',
      'students:supervise',
      'committees:participate',
      'grades:manage',
      'reports:academic'
    ]
  },
  
  ASSOC_PROFESSOR: {
    name: 'Associate Professor',
    description: 'Teaching and research balance, graduate student supervision, committee service, publication requirements.',
    level: 5,
    category: 'academic',
    permissions: [
      'courses:teach',
      'research:conduct',
      'students:supervise',
      'grades:manage',
      'reports:academic'
    ]
  },
  
  ASST_PROFESSOR: {
    name: 'Assistant Professor',
    description: 'Teaching load management, research development, course development, student mentoring, professional development.',
    level: 4,
    category: 'academic',
    permissions: [
      'courses:teach',
      'research:participate',
      'students:mentor',
      'grades:manage',
      'reports:teaching'
    ]
  },
  
  LECTURER: {
    name: 'Lecturer',
    description: 'Undergraduate teaching, course material development, student assessment, academic advising.',
    level: 3,
    category: 'academic',
    permissions: [
      'courses:teach',
      'materials:develop',
      'assessment:conduct',
      'students:advise',
      'grades:manage'
    ]
  },
  
  ASST_LECTURER: {
    name: 'Assistant Lecturer',
    description: 'Teaching assistance, course support, student tutoring, research participation, skill development.',
    level: 2,
    category: 'academic',
    permissions: [
      'courses:assist',
      'students:tutor',
      'research:participate',
      'grades:assist'
    ]
  },

  // Administrative Staff (Level 5)
  STUDENT_AFFAIRS_OFFICER: {
    name: 'Student Affairs Officer',
    description: 'Student counseling and support, extracurricular activity coordination, student complaint resolution.',
    level: 4,
    category: 'administrative',
    permissions: [
      'students:support',
      'activities:coordinate',
      'complaints:resolve',
      'counseling:provide',
      'reports:student_affairs'
    ]
  },
  
  REGISTRATION_OFFICER: {
    name: 'Student Registration Officer',
    description: 'New student enrollment processing, course registration assistance, academic advising coordination.',
    level: 4,
    category: 'administrative',
    permissions: [
      'enrollment:process',
      'registration:assist',
      'advising:coordinate',
      'data:verify',
      'reports:registration'
    ]
  },
  
  ADMISSIONS_OFFICER: {
    name: 'Admissions Officer',
    description: 'Application processing and review, applicant interview coordination, admission decision communication.',
    level: 4,
    category: 'administrative',
    permissions: [
      'applications:process',
      'interviews:coordinate',
      'decisions:communicate',
      'documents:verify',
      'reports:admissions'
    ]
  },
  
  FINANCE_OFFICER: {
    name: 'Finance Officer',
    description: 'Fee structure management, payment plan coordination, debt collection, revenue reporting.',
    level: 4,
    category: 'financial',
    permissions: [
      'fees:manage',
      'payments:coordinate',
      'debt:collect',
      'revenue:report',
      'reports:financial'
    ]
  },
  
  IT_SUPPORT: {
    name: 'IT Support Officer',
    description: 'User account management, system maintenance and updates, database administration, security monitoring.',
    level: 3,
    category: 'support',
    permissions: [
      'users:manage',
      'system:maintain',
      'security:monitor',
      'support:provide',
      'reports:technical'
    ]
  },

  // Student Roles (Level 6)
  GRADUATE_STUDENT: {
    name: 'Graduate Student',
    description: 'Advanced course enrollment, research project management, teaching assistance, thesis development.',
    level: 1,
    category: 'student',
    permissions: [
      'courses:enroll',
      'research:participate',
      'grades:view_own',
      'transcripts:request',
      'profile:update_own'
    ]
  },
  
  UNDERGRAD_STUDENT: {
    name: 'Undergraduate Student',
    description: 'Course registration, assignment submission, examination participation, academic progress tracking.',
    level: 1,
    category: 'student',
    permissions: [
      'courses:enroll',
      'assignments:submit',
      'exams:participate',
      'grades:view_own',
      'transcripts:request',
      'profile:update_own'
    ]
  },
  
  AUDIT_STUDENT: {
    name: 'Audit Student',
    description: 'Course viewing, lecture attendance, limited access to course materials.',
    level: 1,
    category: 'student',
    permissions: [
      'courses:view',
      'lectures:attend',
      'materials:view_limited',
      'profile:update_own'
    ]
  }
};

// Permission definitions for university roles
const UNIVERSITY_PERMISSIONS = [
  // Academic permissions
  { name: 'academic:manage', description: 'Manage academic programs and policies' },
  { name: 'courses:create', description: 'Create new courses' },
  { name: 'courses:read', description: 'View course information' },
  { name: 'courses:update', description: 'Update course information' },
  { name: 'courses:delete', description: 'Delete courses' },
  { name: 'courses:teach', description: 'Teach assigned courses' },
  { name: 'courses:assist', description: 'Assist in course delivery' },
  { name: 'courses:enroll', description: 'Enroll in courses' },
  
  // Student permissions
  { name: 'students:create', description: 'Create new student records' },
  { name: 'students:read', description: 'View student information' },
  { name: 'students:update', description: 'Update student information' },
  { name: 'students:delete', description: 'Delete student records' },
  { name: 'students:advise', description: 'Provide academic advising' },
  { name: 'students:support', description: 'Provide student support services' },
  { name: 'students:supervise', description: 'Supervise student research' },
  { name: 'students:mentor', description: 'Mentor students' },
  
  // Grade permissions
  { name: 'grades:create', description: 'Create grade records' },
  { name: 'grades:read', description: 'View grade information' },
  { name: 'grades:update', description: 'Update grade records' },
  { name: 'grades:delete', description: 'Delete grade records' },
  { name: 'grades:approve', description: 'Approve and finalize grades' },
  { name: 'grades:view_own', description: 'View own grades' },
  
  // Financial permissions
  { name: 'payments:create', description: 'Process student payments' },
  { name: 'payments:read', description: 'View payment information' },
  { name: 'payments:update', description: 'Update payment records' },
  { name: 'payments:delete', description: 'Delete payment records' },
  { name: 'payments:approve', description: 'Approve payment transactions' },
  
  // Administrative permissions
  { name: 'users:create', description: 'Create new user accounts' },
  { name: 'users:read', description: 'View user information' },
  { name: 'users:update', description: 'Update user information' },
  { name: 'users:delete', description: 'Delete user accounts' },
  { name: 'users:manage', description: 'Full user management access' },
  
  // System permissions
  { name: 'system:admin', description: 'Full system administration access' },
  { name: 'system:config', description: 'Update system configuration' },
  { name: 'system:backup', description: 'Create system backups' },
  { name: 'system:restore', description: 'Restore system from backup' },
  
  // Reports permissions
  { name: 'reports:academic', description: 'Generate academic reports' },
  { name: 'reports:administrative', description: 'Generate administrative reports' },
  { name: 'reports:financial', description: 'Generate financial reports' },
  { name: 'reports:student_affairs', description: 'Generate student affairs reports' },
  { name: 'reports:technical', description: 'Generate technical reports' },
  
  // Audit permissions
  { name: 'audit:read', description: 'View audit logs' },
  { name: 'audit:export', description: 'Export audit logs' }
];

async function initializeUniversityRoles() {
  try {
    console.log('🎓 Initializing University User Roles System...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get or create system admin user
    let systemAdmin = await User.findOne({ email: 'system@university.edu' });
    if (!systemAdmin) {
      systemAdmin = await User.create({
        email: 'system@university.edu',
        username: 'system_admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        isActive: true
      });
      console.log('✅ Created system admin user');
    }

    // Create university permissions
    console.log('🔐 Creating university permissions...');
    const createdPermissions = {};
    for (const perm of UNIVERSITY_PERMISSIONS) {
      const [permission] = await Permission.findOrCreate({
        name: perm.name,
        defaults: {
          description: perm.description,
          category: 'university',
          isActive: true
        }
      });
      createdPermissions[perm.name] = permission._id;
    }
    console.log(`✅ Created ${Object.keys(createdPermissions).length} university permissions`);

    // Create university roles
    console.log('👥 Creating university roles...');
    const createdRoles = [];
    
    for (const [roleCode, roleData] of Object.entries(UNIVERSITY_ROLES)) {
      const role = await Role.findOneAndUpdate(
        { name: roleData.name },
        {
          ...roleData,
          isSystemRole: true,
          createdBy: systemAdmin._id,
          metadata: {
            ...roleData.metadata,
            roleCode,
            universityRole: true
          }
        },
        { upsert: true, new: true }
      );
      
      // Assign permissions to role
      if (roleData.permissions && roleData.permissions[0] !== '*') {
        role.permissions = roleData.permissions.map(perm => createdPermissions[perm]);
        await role.save();
      } else if (roleData.permissions[0] === '*') {
        // Super admin gets all permissions
        role.permissions = Object.values(createdPermissions);
        await role.save();
      }
      
      createdRoles.push(role);
      console.log(`✅ Created/Updated role: ${role.name}`);
    }

    // Create role hierarchy relationships
    console.log('🔗 Creating role hierarchy...');
    const roleHierarchy = {
      'VC_PRESIDENT': ['DVC_ACADEMIC', 'DVC_ADMIN', 'PROVOST', 'REGISTRAR'],
      'DVC_ACADEMIC': ['DEAN_FACULTY', 'ASSOC_DEAN_ACADEMIC', 'ASSOC_DEAN_RESEARCH'],
      'DEAN_FACULTY': ['HOD_DEPARTMENT', 'ACAD_SECRETARY', 'PROGRAM_COORDINATOR'],
      'HOD_DEPARTMENT': ['PROFESSOR', 'ASSOC_PROFESSOR', 'ASST_PROFESSOR', 'LECTURER', 'ASST_LECTURER'],
      'PROFESSOR': ['STUDENT_AFFAIRS_OFFICER', 'REGISTRATION_OFFICER', 'ADMISSIONS_OFFICER', 'FINANCE_OFFICER', 'IT_SUPPORT'],
      'LECTURER': ['GRADUATE_STUDENT', 'UNDERGRAD_STUDENT', 'AUDIT_STUDENT']
    };

    console.log('📊 University Roles System Summary:');
    console.log(`Total Roles: ${createdRoles.length}`);
    console.log(`Executive Roles: ${createdRoles.filter(r => r.level >= 8).length}`);
    console.log(`Faculty Roles: ${createdRoles.filter(r => r.level >= 5 && r.level < 8).length}`);
    console.log(`Academic Roles: ${createdRoles.filter(r => r.level >= 2 && r.level < 5).length}`);
    console.log(`Student Roles: ${createdRoles.filter(r => r.level === 1).length}`);

    // Display role hierarchy
    console.log('\n🏛️ Role Hierarchy:');
    createdRoles
      .sort((a, b) => b.level - a.level)
      .forEach(role => {
        console.log(`${' '.repeat((10 - role.level) * 2)}${role.level}. ${role.name} (${role.category})`);
      });

    console.log('\n🎉 University User Roles System initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing university roles:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  initializeUniversityRoles();
}

module.exports = {
  initializeUniversityRoles,
  UNIVERSITY_ROLES,
  UNIVERSITY_PERMISSIONS
};
