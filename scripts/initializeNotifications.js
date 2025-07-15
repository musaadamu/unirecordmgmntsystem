const mongoose = require('mongoose');
const { seedEmailTemplates } = require('../utils/emailTemplates');
const emailService = require('../services/emailService');
const emailQueueProcessor = require('../services/emailQueueProcessor');
const digestService = require('../services/digestService');
const User = require('../models/User');
require('dotenv').config();

/**
 * Initialize Email Notification System
 * This script sets up the email notification system for the RBAC system
 */

async function initializeNotificationSystem() {
  try {
    console.log('🚀 Starting Email Notification System Initialization...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-db');
    console.log('✅ Connected to MongoDB');

    // Find or create a system admin user for seeding
    let systemAdmin = await User.findOne({ email: 'system@university.edu' });
    
    if (!systemAdmin) {
      console.log('👤 Creating system admin user for notifications...');
      systemAdmin = new User({
        email: 'system@university.edu',
        password: 'temp-password',
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

    // Test email configuration
    console.log('📧 Testing email configuration...');
    try {
      const testResult = await emailService.testConfiguration();
      if (testResult.success) {
        console.log('✅ Email configuration is working');
      } else {
        console.warn('⚠️ Email configuration test failed:', testResult.error);
      }
    } catch (error) {
      console.warn('⚠️ Email configuration test failed:', error.message);
    }

    // Seed email templates
    console.log('📝 Seeding email templates...');
    const templateResults = await seedEmailTemplates(systemAdmin._id);
    console.log('✅ Email templates seeded:', templateResults);

    // Initialize email queue processor
    console.log('⚙️ Initializing email queue processor...');
    // The processor is already initialized when required
    console.log('✅ Email queue processor initialized');

    // Schedule digest emails
    console.log('📅 Scheduling digest emails...');
    await digestService.scheduleDigests();
    console.log('✅ Digest emails scheduled');

    // Create default notification settings for existing users
    console.log('👥 Creating default notification settings for existing users...');
    const NotificationSettings = require('../models/NotificationSettings');
    const users = await User.find({ status: 'active' });
    let settingsCreated = 0;

    for (const user of users) {
      const existingSettings = await NotificationSettings.findOne({ userId: user._id });
      if (!existingSettings) {
        await NotificationSettings.createDefaultSettings(user._id);
        settingsCreated++;
      }
    }
    console.log(`✅ Created notification settings for ${settingsCreated} users`);

    console.log('\n📊 Email Notification System Initialization Results:');
    console.log('=====================================');
    
    console.log('\n📝 Email Templates:');
    console.log(`  ✅ Created: ${templateResults.created}`);
    console.log(`  🔄 Updated: ${templateResults.updated}`);
    if (templateResults.errors.length > 0) {
      console.log(`  ❌ Errors: ${templateResults.errors.length}`);
      templateResults.errors.forEach(error => {
        console.log(`     - ${error.template}: ${error.error}`);
      });
    }

    console.log('\n👥 User Settings:');
    console.log(`  ✅ Settings created for: ${settingsCreated} users`);
    console.log(`  📊 Total active users: ${users.length}`);

    console.log('\n🎉 Email Notification System Initialization Complete!');
    console.log('\n📋 System Features Enabled:');
    console.log('✅ Role assignment notifications');
    console.log('✅ Permission change alerts');
    console.log('✅ Security event notifications');
    console.log('✅ Welcome emails for new users');
    console.log('✅ Approval request notifications');
    console.log('✅ Daily and weekly digest emails');
    console.log('✅ Email tracking and analytics');
    console.log('✅ User notification preferences');
    console.log('✅ Unsubscribe management');

    console.log('\n📋 Next Steps:');
    console.log('1. Configure email provider settings in environment variables');
    console.log('2. Test notification sending through the admin interface');
    console.log('3. Customize email templates as needed');
    console.log('4. Set up webhook endpoints for email provider events');
    console.log('5. Monitor email delivery and engagement metrics');

    console.log('\n⚙️ Environment Variables Needed:');
    console.log('EMAIL_PROVIDER=sendgrid|ses|mailgun|smtp');
    console.log('SENDGRID_API_KEY=your_sendgrid_api_key (if using SendGrid)');
    console.log('AWS_ACCESS_KEY_ID=your_aws_key (if using SES)');
    console.log('AWS_SECRET_ACCESS_KEY=your_aws_secret (if using SES)');
    console.log('SMTP_HOST=your_smtp_host (if using SMTP)');
    console.log('SMTP_USER=your_smtp_user (if using SMTP)');
    console.log('SMTP_PASS=your_smtp_password (if using SMTP)');
    console.log('FROM_EMAIL=noreply@yourdomain.com');
    console.log('SUPPORT_EMAIL=support@yourdomain.com');
    console.log('REDIS_URL=redis://localhost:6379 (optional, for caching)');

    // Test notification sending
    console.log('\n🧪 Testing notification system...');
    try {
      const notificationService = require('../services/notificationService');
      
      // Test role assignment notification
      await notificationService.sendNotification('role_assigned', {
        userId: systemAdmin._id,
        roleId: 'test-role-id',
        assignedBy: systemAdmin._id,
        triggeredBy: systemAdmin._id
      }, {
        ipAddress: '127.0.0.1',
        userAgent: 'notification-test',
        priority: 'low'
      });
      
      console.log('✅ Test notification sent successfully');
    } catch (error) {
      console.warn('⚠️ Test notification failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Email Notification System Initialization failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
    // Close email queue processor
    try {
      await emailQueueProcessor.shutdown();
    } catch (error) {
      console.warn('Warning: Email queue processor shutdown error:', error.message);
    }
    
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Cleaning up...');
  await mongoose.connection.close();
  try {
    await emailQueueProcessor.shutdown();
  } catch (error) {
    console.warn('Warning: Email queue processor shutdown error:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated. Cleaning up...');
  await mongoose.connection.close();
  try {
    await emailQueueProcessor.shutdown();
  } catch (error) {
    console.warn('Warning: Email queue processor shutdown error:', error.message);
  }
  process.exit(0);
});

// Run initialization
if (require.main === module) {
  initializeNotificationSystem();
}

module.exports = { initializeNotificationSystem };
