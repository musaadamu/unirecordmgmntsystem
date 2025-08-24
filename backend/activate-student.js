const mongoose = require('mongoose');
const User = require('./models/User');
const { USER_STATUS } = require('./config/constants');
require('dotenv').config();

async function activateStudent() {
  try {
    console.log('🔄 Activating student account...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_records');
    console.log('✅ Connected to MongoDB');

    // Find and activate student
    const studentUser = await User.findOne({ email: 'msmaje2024@gmail.com' });
    if (studentUser) {
      console.log(`Current status: ${studentUser.status}`);
      
      studentUser.status = USER_STATUS.ACTIVE;
      await studentUser.save();
      
      console.log('✅ Student account activated successfully!');
      console.log(`New status: ${studentUser.status}`);
    } else {
      console.log('❌ Student user not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error activating student:', error);
    process.exit(1);
  }
}

// Run the script
activateStudent();
