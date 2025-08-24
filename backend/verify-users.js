const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verifyUsers() {
  try {
    console.log('🔍 Verifying user accounts...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_records');
    console.log('✅ Connected to MongoDB');

    // Check Admin User
    console.log('\n👤 Checking Admin User...');
    const adminUser = await User.findOne({ email: 'msmajemusa4@gmail.com' });
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   User ID: ${adminUser.userId}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log(`   Name: ${adminUser.personalInfo?.firstName} ${adminUser.personalInfo?.lastName}`);
      
      // Test password
      const isPasswordValid = await adminUser.comparePassword('uni@2023');
      console.log(`   Password 'uni@2023' valid: ${isPasswordValid ? '✅' : '❌'}`);
      
      if (!isPasswordValid) {
        console.log('🔄 Updating admin password...');
        adminUser.password = 'uni@2023';
        await adminUser.save();
        console.log('✅ Admin password updated successfully!');
      }
    } else {
      console.log('❌ Admin user not found');
    }

    // Check Student User
    console.log('\n🎓 Checking Student User...');
    const studentUser = await User.findOne({ email: 'msmaje2024@gmail.com' });
    if (studentUser) {
      console.log('✅ Student user found:');
      console.log(`   Email: ${studentUser.email}`);
      console.log(`   User ID: ${studentUser.userId}`);
      console.log(`   Role: ${studentUser.role}`);
      console.log(`   Status: ${studentUser.status}`);
      console.log(`   Name: ${studentUser.personalInfo?.firstName} ${studentUser.personalInfo?.lastName}`);
      
      // Test password
      const isPasswordValid = await studentUser.comparePassword('uni@2024');
      console.log(`   Password 'uni@2024' valid: ${isPasswordValid ? '✅' : '❌'}`);
      
      if (!isPasswordValid) {
        console.log('🔄 Updating student password...');
        studentUser.password = 'uni@2024';
        await studentUser.save();
        console.log('✅ Student password updated successfully!');
      }
    } else {
      console.log('❌ Student user not found');
    }

    console.log('\n🎉 Verification completed!');
    console.log('\n📋 Final Login Credentials:');
    console.log('👤 Admin Account:');
    console.log('   Email: msmajemusa4@gmail.com');
    console.log('   Password: uni@2023');
    console.log('   Portal: Admin Portal (http://localhost:3001)');
    console.log('\n🎓 Student Account:');
    console.log('   Email: msmaje2024@gmail.com');
    console.log('   Password: uni@2024');
    console.log('   Portal: Student Portal (http://localhost:3000)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying users:', error);
    process.exit(1);
  }
}

// Run the script
verifyUsers();
