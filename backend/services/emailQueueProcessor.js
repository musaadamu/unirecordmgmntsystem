const Bull = require('bull');
const emailService = require('./emailService');
const EmailQueue = require('../models/EmailQueue');
const NotificationSettings = require('../models/NotificationSettings');

class EmailQueueProcessor {
  constructor() {
    this.redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    };

    this.initializeQueues();
    this.setupProcessors();
    this.setupEventHandlers();
    
    console.log('✅ Email queue processor initialized');
  }

  /**
   * Initialize Bull queues with different priorities
   */
  initializeQueues() {
    // High priority queue for critical emails
    this.criticalQueue = new Bull('critical-emails', {
      redis: this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Medium priority queue for normal emails
    this.normalQueue = new Bull('normal-emails', {
      redis: this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });

    // Low priority queue for digest and bulk emails
    this.bulkQueue = new Bull('bulk-emails', {
      redis: this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 25,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000
        }
      }
    });

    // Digest queue for scheduled digest emails
    this.digestQueue = new Bull('digest-emails', {
      redis: this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2
      }
    });
  }

  /**
   * Setup queue processors
   */
  setupProcessors() {
    // Critical email processor (highest concurrency)
    this.criticalQueue.process('send-email', 10, this.processEmail.bind(this));
    
    // Normal email processor
    this.normalQueue.process('send-email', 5, this.processEmail.bind(this));
    
    // Bulk email processor (lower concurrency to prevent overwhelming)
    this.bulkQueue.process('send-email', 2, this.processEmail.bind(this));
    
    // Digest processor
    this.digestQueue.process('send-digest', 1, this.processDigest.bind(this));
    
    // Retry failed emails processor
    this.normalQueue.process('retry-failed', 3, this.retryFailedEmails.bind(this));
  }

  /**
   * Setup event handlers for monitoring
   */
  setupEventHandlers() {
    const queues = [this.criticalQueue, this.normalQueue, this.bulkQueue, this.digestQueue];
    
    queues.forEach(queue => {
      queue.on('completed', (job, result) => {
        console.log(`✅ Email job completed: ${job.id}`);
      });
      
      queue.on('failed', (job, err) => {
        console.error(`❌ Email job failed: ${job.id}`, err.message);
      });
      
      queue.on('stalled', (job) => {
        console.warn(`⚠️ Email job stalled: ${job.id}`);
      });
    });
  }

  /**
   * Add email to appropriate queue based on priority
   */
  async queueEmail(emailData, options = {}) {
    try {
      const jobData = {
        emailId: emailData._id,
        priority: emailData.priority || 'medium',
        category: emailData.category,
        scheduledAt: emailData.scheduledAt || new Date()
      };

      const jobOptions = {
        delay: this.calculateDelay(emailData.scheduledAt),
        priority: this.getPriorityScore(emailData.priority),
        ...options
      };

      let queue;
      switch (emailData.priority) {
        case 'critical':
          queue = this.criticalQueue;
          break;
        case 'high':
          queue = this.normalQueue;
          jobOptions.priority = 10;
          break;
        case 'low':
          queue = this.bulkQueue;
          break;
        default:
          queue = this.normalQueue;
      }

      const job = await queue.add('send-email', jobData, jobOptions);
      
      console.log(`📧 Email queued: ${emailData._id} (Priority: ${emailData.priority})`);
      return job;
    } catch (error) {
      console.error('Queue email error:', error);
      throw error;
    }
  }

  /**
   * Process individual email
   */
  async processEmail(job) {
    const { emailId } = job.data;
    
    try {
      // Get email from database
      const email = await EmailQueue.findById(emailId).populate('templateId');
      
      if (!email) {
        throw new Error(`Email not found: ${emailId}`);
      }

      if (email.status !== 'pending') {
        console.log(`Email ${emailId} already processed (${email.status})`);
        return { skipped: true, reason: 'already_processed' };
      }

      // Mark as processing
      await email.markProcessing();

      // Check if recipients still want to receive notifications
      const validRecipients = await this.validateRecipients(email);
      
      if (validRecipients.length === 0) {
        await email.markFailed(new Error('No valid recipients'));
        return { skipped: true, reason: 'no_valid_recipients' };
      }

      // Update recipients list if some were filtered out
      if (validRecipients.length !== email.to.length) {
        email.to = validRecipients;
        await email.save();
      }

      // Process email through email service
      const result = await emailService.sendEmail(email);
      
      // Mark as sent
      await email.markSent(result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipientCount: validRecipients.length
      };
    } catch (error) {
      console.error(`Email processing error for ${emailId}:`, error);
      
      // Mark as failed
      const email = await EmailQueue.findById(emailId);
      if (email) {
        await email.markFailed(error);
      }
      
      throw error;
    }
  }

  /**
   * Validate recipients and filter out those who unsubscribed
   */
  async validateRecipients(email) {
    const validRecipients = [];
    
    for (const recipient of email.to) {
      try {
        // Check if user still exists
        if (recipient.userId) {
          const User = require('../models/User');
          const user = await User.findById(recipient.userId);
          if (!user || user.status !== 'active') {
            continue;
          }
        }

        // Check notification preferences
        if (recipient.userId) {
          const settings = await NotificationSettings.findOne({ userId: recipient.userId });
          if (settings && !settings.globalSettings.emailEnabled) {
            continue;
          }

          // Check category-specific preferences
          const categoryMap = {
            'role_assignment': 'role_changes',
            'permission_change': 'permission_updates',
            'security_alert': 'security_alerts',
            'system_maintenance': 'system_maintenance',
            'account_update': 'account_updates',
            'approval_request': 'approval_requests',
            'digest': 'digest_notifications',
            'welcome': 'welcome_messages'
          };

          const category = categoryMap[email.category] || email.category;
          const preference = settings?.getPreference(category);
          
          if (preference && (!preference.enabled || preference.frequency === 'disabled')) {
            continue;
          }
        }

        validRecipients.push(recipient);
      } catch (error) {
        console.error('Recipient validation error:', error);
        // Include recipient on error to avoid losing emails
        validRecipients.push(recipient);
      }
    }
    
    return validRecipients;
  }

  /**
   * Process digest emails
   */
  async processDigest(job) {
    const { digestType, userId, startDate, endDate } = job.data;
    
    try {
      const digestService = require('./digestService');
      const result = await digestService.generateAndSendDigest(digestType, userId, startDate, endDate);
      
      return {
        success: true,
        digestType,
        userId,
        emailsSent: result.emailsSent
      };
    } catch (error) {
      console.error('Digest processing error:', error);
      throw error;
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(job) {
    try {
      const failedEmails = await EmailQueue.getRetryableEmails(50);
      const results = {
        processed: 0,
        requeued: 0,
        abandoned: 0
      };

      for (const email of failedEmails) {
        results.processed++;
        
        if (email.canRetry) {
          // Reset status and requeue
          email.status = 'pending';
          await email.save();
          
          await this.queueEmail(email, {
            delay: email.nextRetryAt ? email.nextRetryAt.getTime() - Date.now() : 0
          });
          
          results.requeued++;
        } else {
          // Mark as permanently failed
          email.status = 'cancelled';
          await email.save();
          
          results.abandoned++;
        }
      }

      return results;
    } catch (error) {
      console.error('Retry failed emails error:', error);
      throw error;
    }
  }

  /**
   * Schedule digest emails
   */
  async scheduleDigests() {
    try {
      // Schedule daily digests (every day at 9 AM)
      await this.digestQueue.add('send-digest', 
        { digestType: 'daily' },
        { 
          repeat: { cron: '0 9 * * *' },
          jobId: 'daily-digest'
        }
      );

      // Schedule weekly digests (every Monday at 9 AM)
      await this.digestQueue.add('send-digest',
        { digestType: 'weekly' },
        {
          repeat: { cron: '0 9 * * 1' },
          jobId: 'weekly-digest'
        }
      );

      console.log('✅ Digest schedules configured');
    } catch (error) {
      console.error('Digest scheduling error:', error);
    }
  }

  /**
   * Calculate delay for scheduled emails
   */
  calculateDelay(scheduledAt) {
    if (!scheduledAt) return 0;
    
    const delay = new Date(scheduledAt).getTime() - Date.now();
    return Math.max(0, delay);
  }

  /**
   * Get priority score for Bull queue
   */
  getPriorityScore(priority) {
    const scores = {
      'critical': 20,
      'high': 10,
      'medium': 5,
      'low': 1
    };
    
    return scores[priority] || 5;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const stats = {};
    const queues = {
      critical: this.criticalQueue,
      normal: this.normalQueue,
      bulk: this.bulkQueue,
      digest: this.digestQueue
    };

    for (const [name, queue] of Object.entries(queues)) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed()
      ]);

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length
      };
    }

    return stats;
  }

  /**
   * Clean up completed jobs
   */
  async cleanupJobs() {
    const queues = [this.criticalQueue, this.normalQueue, this.bulkQueue, this.digestQueue];
    
    for (const queue of queues) {
      await queue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24 hours
      await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 7 days
    }
    
    console.log('✅ Queue cleanup completed');
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down email queue processor...');
    
    const queues = [this.criticalQueue, this.normalQueue, this.bulkQueue, this.digestQueue];
    
    await Promise.all(queues.map(queue => queue.close()));
    
    console.log('✅ Email queue processor shutdown complete');
  }
}

module.exports = new EmailQueueProcessor();
