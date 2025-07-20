const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
const EmailQueue = require('../models/EmailQueue');
const EmailLog = require('../models/EmailLog');
const EmailTemplate = require('../models/EmailTemplate');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp';
    this.initializeProvider();
  }

  /**
   * Initialize email provider based on configuration
   */
  initializeProvider() {
    switch (this.provider) {
      case 'sendgrid':
        this.initializeSendGrid();
        break;
      case 'ses':
        this.initializeAWSSES();
        break;
      case 'mailgun':
        this.initializeMailgun();
        break;
      default:
        this.initializeSMTP();
    }
  }

  /**
   * Initialize SendGrid
   */
  initializeSendGrid() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid email service initialized');
  }

  /**
   * Initialize AWS SES
   */
  initializeAWSSES() {
    this.ses = new AWS.SES({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    console.log('✅ AWS SES email service initialized');
  }

  /**
   * Initialize Mailgun
   */
  initializeMailgun() {
    const mailgun = require('mailgun-js');
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
    console.log('✅ Mailgun email service initialized');
  }

  /**
   * Initialize SMTP
   */
  initializeSMTP() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
    console.log('✅ SMTP email service initialized');
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(emailData) {
    try {
      let result;
      
      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendWithSendGrid(emailData);
          break;
        case 'ses':
          result = await this.sendWithSES(emailData);
          break;
        case 'mailgun':
          result = await this.sendWithMailgun(emailData);
          break;
        default:
          result = await this.sendWithSMTP(emailData);
      }

      // Log successful send
      await this.logEmailSent(emailData, result);
      
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      
      // Log failed send
      await this.logEmailFailed(emailData, error);
      
      throw error;
    }
  }

  /**
   * Send email with SendGrid
   */
  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to.map(recipient => ({
        email: recipient.email,
        name: recipient.name
      })),
      from: {
        email: emailData.from.email,
        name: emailData.from.name
      },
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
      customArgs: {
        category: emailData.category,
        emailQueueId: emailData._id.toString()
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    };

    const response = await sgMail.send(msg);
    
    return {
      messageId: response[0].headers['x-message-id'],
      provider: 'sendgrid',
      response: response[0]
    };
  }

  /**
   * Send email with AWS SES
   */
  async sendWithSES(emailData) {
    const params = {
      Source: `${emailData.from.name} <${emailData.from.email}>`,
      Destination: {
        ToAddresses: emailData.to.map(recipient => 
          recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
        )
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: emailData.htmlContent,
            Charset: 'UTF-8'
          },
          Text: {
            Data: emailData.textContent,
            Charset: 'UTF-8'
          }
        }
      },
      Tags: [
        {
          Name: 'category',
          Value: emailData.category
        },
        {
          Name: 'emailQueueId',
          Value: emailData._id.toString()
        }
      ]
    };

    const response = await this.ses.sendEmail(params).promise();
    
    return {
      messageId: response.MessageId,
      provider: 'ses',
      response: response
    };
  }

  /**
   * Send email with Mailgun
   */
  async sendWithMailgun(emailData) {
    const data = {
      from: `${emailData.from.name} <${emailData.from.email}>`,
      to: emailData.to.map(recipient => 
        recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
      ),
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
      'o:tag': [emailData.category, emailData._id.toString()],
      'o:tracking': 'yes',
      'o:tracking-clicks': 'yes',
      'o:tracking-opens': 'yes'
    };

    const response = await this.mg.messages().send(data);
    
    return {
      messageId: response.id,
      provider: 'mailgun',
      response: response
    };
  }

  /**
   * Send email with SMTP
   */
  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: `${emailData.from.name} <${emailData.from.email}>`,
      to: emailData.to.map(recipient => 
        recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
      ).join(', '),
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
      headers: {
        'X-Category': emailData.category,
        'X-Email-Queue-Id': emailData._id.toString()
      }
    };

    const response = await this.transporter.sendMail(mailOptions);
    
    return {
      messageId: response.messageId,
      provider: 'smtp',
      response: response
    };
  }

  /**
   * Process email queue
   */
  async processEmailQueue(limit = 100) {
    try {
      const pendingEmails = await EmailQueue.getPendingEmails(limit);
      const results = {
        processed: 0,
        sent: 0,
        failed: 0,
        errors: []
      };

      for (const email of pendingEmails) {
        try {
          await email.markProcessing();
          
          // Render email content if using template
          if (email.templateId) {
            await this.renderEmailFromTemplate(email);
          }
          
          // Send email
          const sendResult = await this.sendEmail(email);
          await email.markSent(sendResult.messageId);
          
          results.sent++;
        } catch (error) {
          await email.markFailed(error);
          results.failed++;
          results.errors.push({
            emailId: email._id,
            error: error.message
          });
        }
        
        results.processed++;
      }

      return results;
    } catch (error) {
      console.error('Email queue processing error:', error);
      throw error;
    }
  }

  /**
   * Render email content from template
   */
  async renderEmailFromTemplate(email) {
    const template = await EmailTemplate.findById(email.templateId);
    
    if (!template) {
      throw new Error('Email template not found');
    }

    // Validate template data
    const validationErrors = template.validateData(email.templateData);
    if (validationErrors.length > 0) {
      throw new Error(`Template validation failed: ${validationErrors.join(', ')}`);
    }

    // Render content
    email.htmlContent = template.renderHtml(email.templateData);
    email.textContent = template.renderText(email.templateData);
    
    // Increment template usage
    await template.incrementUsage();
  }

  /**
   * Log successful email send
   */
  async logEmailSent(emailData, sendResult) {
    try {
      const emailLog = new EmailLog({
        emailQueueId: emailData._id,
        messageId: sendResult.messageId,
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        category: emailData.category,
        status: 'sent',
        sentAt: new Date(),
        provider: {
          name: sendResult.provider,
          messageId: sendResult.messageId,
          response: JSON.stringify(sendResult.response)
        },
        metadata: {
          templateId: emailData.templateId,
          batchId: emailData.metadata?.batchId,
          eventId: emailData.metadata?.eventId,
          tags: emailData.metadata?.tags || [],
          department: emailData.metadata?.department,
          priority: emailData.priority
        }
      });

      await emailLog.save();
    } catch (error) {
      console.error('Email logging error:', error);
    }
  }

  /**
   * Log failed email send
   */
  async logEmailFailed(emailData, error) {
    try {
      const emailLog = new EmailLog({
        emailQueueId: emailData._id,
        messageId: `failed-${emailData._id}-${Date.now()}`,
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        category: emailData.category,
        status: 'failed',
        sentAt: new Date(),
        provider: {
          name: this.provider,
          response: error.message
        },
        metadata: {
          templateId: emailData.templateId,
          batchId: emailData.metadata?.batchId,
          eventId: emailData.metadata?.eventId,
          tags: emailData.metadata?.tags || [],
          department: emailData.metadata?.department,
          priority: emailData.priority
        }
      });

      await emailLog.save();
    } catch (logError) {
      console.error('Email failure logging error:', logError);
    }
  }

  /**
   * Handle webhook events from email providers
   */
  async handleWebhook(provider, eventData) {
    try {
      switch (provider) {
        case 'sendgrid':
          await this.handleSendGridWebhook(eventData);
          break;
        case 'ses':
          await this.handleSESWebhook(eventData);
          break;
        case 'mailgun':
          await this.handleMailgunWebhook(eventData);
          break;
        default:
          console.warn('Unknown webhook provider:', provider);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
    }
  }

  /**
   * Handle SendGrid webhook events
   */
  async handleSendGridWebhook(events) {
    for (const event of events) {
      const emailLog = await EmailLog.findOne({ messageId: event.sg_message_id });
      
      if (!emailLog) continue;

      switch (event.event) {
        case 'delivered':
          await emailLog.updateDeliveryStatus('delivered');
          break;
        case 'bounce':
          await emailLog.updateDeliveryStatus('bounced', event.reason);
          break;
        case 'dropped':
          await emailLog.updateDeliveryStatus('rejected', event.reason);
          break;
        case 'open':
          await emailLog.trackOpen(event.useragent, event.ip);
          break;
        case 'click':
          await emailLog.trackClick(event.url, event.useragent, event.ip);
          break;
        case 'unsubscribe':
          await emailLog.trackUnsubscribe('user_request', event.ip);
          break;
      }
    }
  }

  /**
   * Get email delivery statistics
   */
  async getDeliveryStats(startDate, endDate, filters = {}) {
    return await EmailLog.getDeliveryStats(startDate, endDate, filters);
  }

  /**
   * Get category performance statistics
   */
  async getCategoryStats(startDate, endDate) {
    return await EmailLog.getCategoryStats(startDate, endDate);
  }

  /**
   * Test email configuration
   */
  async testConfiguration() {
    try {
      const testEmail = {
        to: [{ email: process.env.TEST_EMAIL || 'test@example.com', name: 'Test User' }],
        from: { email: process.env.FROM_EMAIL, name: 'Test System' },
        subject: 'Email Configuration Test',
        htmlContent: '<h1>Test Email</h1><p>If you receive this, email configuration is working!</p>',
        textContent: 'Test Email\n\nIf you receive this, email configuration is working!',
        category: 'notification',
        _id: 'test-' + Date.now()
      };

      const result = await this.sendEmail(testEmail);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
