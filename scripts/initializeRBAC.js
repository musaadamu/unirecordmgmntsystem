const mongoose = require('mongoose');
const { initializeRBAC } = require('../utils/seedData');
const User = require('../models/User');
require('dotenv').config();

/**
 * Initialize RBAC System
 * This script sets up the default permissions and roles for the university system
 */

async function initialize() {
  try {
    console.log('🚀 Starting RBAC System Initialization...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-db');
    console.log('✅ Connected to MongoDB');

    // Find or create a system admin user for seeding
    let systemAdmin = await User.findOne({ email: 'system@university.edu' });
    
    if (!systemAdmin) {
      console.log('👤 Creating system admin user...');
      systemAdmin = new User({
        email: 'system@university.edu',
        password: 'temp-password', // This should be changed immediately
        personalInfo: {
          firstName: 'System',
          lastName: 'Administrator',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'other',
          phoneNumber: '000-000-0000',
          address: {
            street: 'System',
            city: 'System',
            state: 'System',
            zipCode: '00000',
            country: 'System'
          }
        },
        role: 'admin',
        status: 'active'
      });
      await systemAdmin.save();
      console.log('✅ System admin user created');
    }

    // Initialize RBAC system
    console.log('🔐 Initializing RBAC system...');
    const results = await initializeRBAC(systemAdmin._id);
    
    console.log('\n📊 RBAC Initialization Results:');
    console.log('=====================================');
    
    console.log('\n🔑 Permissions:');
    console.log(`  ✅ Created: ${results.permissions.created}`);
    console.log(`  🔄 Updated: ${results.permissions.updated}`);
    if (results.permissions.errors.length > 0) {
      console.log(`  ❌ Errors: ${results.permissions.errors.length}`);
      results.permissions.errors.forEach(error => {
        console.log(`     - ${error.permission}: ${error.error}`);
      });
    }
    
    console.log('\n👥 Roles:');
    console.log(`  ✅ Created: ${results.roles.created}`);
    console.log(`  🔄 Updated: ${results.roles.updated}`);
    if (results.roles.errors.length > 0) {
      console.log(`  ❌ Errors: ${results.roles.errors.length}`);
      results.roles.errors.forEach(error => {
        console.log(`     - ${error.role}: ${error.error}`);
      });
    }

    console.log('\n🎉 RBAC System Initialization Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Assign roles to users through the admin interface');
    console.log('2. Test permission-based access controls');
    console.log('3. Review and customize roles as needed');
    console.log('4. Set up regular permission audits');
    
    if (systemAdmin.email === 'system@university.edu') {
      console.log('\n⚠️  IMPORTANT SECURITY NOTE:');
      console.log('   The system admin user was created with a temporary password.');
      console.log('   Please change the password immediately and assign proper roles.');
    }

  } catch (error) {
    console.error('❌ RBAC Initialization failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Cleaning up...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated. Cleaning up...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run initialization
if (require.main === module) {
  initialize();
}

module.exports = { initialize };
