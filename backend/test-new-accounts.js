const axios = require('axios');

async function testAccounts() {
  try {
    console.log('🧪 Testing new user accounts...\n');
    
    // Test Admin Account
    console.log('👤 Testing Admin Account...');
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'msmajemusa4@gmail.com',
        password: 'uni@2023'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Admin login successful!');
      console.log(`   User ID: ${adminResponse.data.data.user.userId}`);
      console.log(`   Role: ${adminResponse.data.data.user.role}`);
      console.log(`   Name: ${adminResponse.data.data.user.fullName}`);
      console.log(`   Status: ${adminResponse.data.data.user.status}`);
    } catch (error) {
      console.log('❌ Admin login failed!');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
    }

    console.log('\n🎓 Testing Student Account...');
    try {
      const studentResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'msmaje2024@gmail.com',
        password: 'uni@2024'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Student login successful!');
      console.log(`   User ID: ${studentResponse.data.data.user.userId}`);
      console.log(`   Role: ${studentResponse.data.data.user.role}`);
      console.log(`   Name: ${studentResponse.data.data.user.fullName}`);
      console.log(`   Status: ${studentResponse.data.data.user.status}`);
    } catch (error) {
      console.log('❌ Student login failed!');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
    }

    console.log('\n🎉 Account testing completed!');
    console.log('\n📋 Ready to use credentials:');
    console.log('👤 Admin Portal (http://localhost:3001):');
    console.log('   Email: msmajemusa4@gmail.com');
    console.log('   Password: uni@2023');
    console.log('\n🎓 Student Portal (http://localhost:3000):');
    console.log('   Email: msmaje2024@gmail.com');
    console.log('   Password: uni@2024');

  } catch (error) {
    console.error('❌ Error testing accounts:', error.message);
  }
}

testAccounts();
