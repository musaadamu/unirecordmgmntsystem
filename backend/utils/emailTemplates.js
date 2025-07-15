const EmailTemplate = require('../models/EmailTemplate');

/**
 * Default email templates for the RBAC notification system
 */
const defaultTemplates = [
  {
    name: 'role_assigned',
    description: 'Notification when a role is assigned to a user',
    category: 'role_assignment',
    subject: '🔐 New Role Assigned: {{role.name}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Assignment Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .role-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .highlight { color: #2563eb; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Role Assignment Notification</h1>
        </div>
        <div class="content">
            <h2>Hello {{user.firstName}},</h2>
            
            <p>You have been assigned a new role in the <strong>{{system.name}}</strong>.</p>
            
            <div class="role-info">
                <h3>Role Details</h3>
                <p><strong>Role Name:</strong> <span class="highlight">{{role.name}}</span></p>
                <p><strong>Description:</strong> {{role.description}}</p>
                <p><strong>Category:</strong> {{capitalize role.category}}</p>
                <p><strong>Level:</strong> {{role.level}}</p>
                {{#if assignment.department}}
                <p><strong>Department:</strong> {{assignment.department}}</p>
                {{/if}}
            </div>
            
            <div class="role-info">
                <h3>Assignment Information</h3>
                <p><strong>Assigned By:</strong> {{assignment.assignedBy}}</p>
                <p><strong>Assigned On:</strong> {{formatDate assignment.assignedAt 'long'}}</p>
                {{#if assignment.expiresAt}}
                <p><strong>Expires On:</strong> {{formatDate assignment.expiresAt 'long'}}</p>
                {{/if}}
            </div>
            
            <p>This role grants you specific permissions within the system. You can view your complete permissions and role details by logging into your account.</p>
            
            <a href="{{system.url}}/dashboard" class="button">View Dashboard</a>
            
            <p>If you have any questions about your new role or need assistance, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from {{system.name}}</p>
            <p>If you need help, contact us at <a href="mailto:{{system.supportEmail}}">{{system.supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Role Assignment Notification

Hello {{user.firstName}},

You have been assigned a new role in the {{system.name}}.

Role Details:
- Role Name: {{role.name}}
- Description: {{role.description}}
- Category: {{capitalize role.category}}
- Level: {{role.level}}
{{#if assignment.department}}
- Department: {{assignment.department}}
{{/if}}

Assignment Information:
- Assigned By: {{assignment.assignedBy}}
- Assigned On: {{formatDate assignment.assignedAt 'long'}}
{{#if assignment.expiresAt}}
- Expires On: {{formatDate assignment.expiresAt 'long'}}
{{/if}}

This role grants you specific permissions within the system. You can view your complete permissions and role details by logging into your account at: {{system.url}}/dashboard

If you have any questions about your new role or need assistance, please contact our support team at {{system.supportEmail}}.

This is an automated notification from {{system.name}}.`,
    variables: [
      { name: 'user', type: 'object', required: true, description: 'User information' },
      { name: 'role', type: 'object', required: true, description: 'Role information' },
      { name: 'assignment', type: 'object', required: true, description: 'Assignment details' },
      { name: 'system', type: 'object', required: true, description: 'System information' }
    ],
    isSystemTemplate: true
  },
  
  {
    name: 'role_removed',
    description: 'Notification when a role is removed from a user',
    category: 'role_assignment',
    subject: '🔓 Role Removed: {{role.name}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Removal Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .role-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .highlight { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔓 Role Removal Notification</h1>
        </div>
        <div class="content">
            <h2>Hello {{user.firstName}},</h2>
            
            <p>A role has been removed from your account in the <strong>{{system.name}}</strong>.</p>
            
            <div class="role-info">
                <h3>Removed Role</h3>
                <p><strong>Role Name:</strong> <span class="highlight">{{role.name}}</span></p>
                <p><strong>Description:</strong> {{role.description}}</p>
            </div>
            
            <div class="role-info">
                <h3>Removal Information</h3>
                <p><strong>Removed By:</strong> {{removal.removedBy}}</p>
                <p><strong>Removed On:</strong> {{formatDate removal.removedAt 'long'}}</p>
                <p><strong>Reason:</strong> {{removal.reason}}</p>
            </div>
            
            <p>This change affects your permissions within the system. You can view your current roles and permissions by logging into your account.</p>
            
            <a href="{{system.url}}/dashboard" class="button">View Dashboard</a>
            
            <p>If you believe this change was made in error or have questions, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from {{system.name}}</p>
            <p>If you need help, contact us at <a href="mailto:{{system.supportEmail}}">{{system.supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Role Removal Notification

Hello {{user.firstName}},

A role has been removed from your account in the {{system.name}}.

Removed Role:
- Role Name: {{role.name}}
- Description: {{role.description}}

Removal Information:
- Removed By: {{removal.removedBy}}
- Removed On: {{formatDate removal.removedAt 'long'}}
- Reason: {{removal.reason}}

This change affects your permissions within the system. You can view your current roles and permissions by logging into your account at: {{system.url}}/dashboard

If you believe this change was made in error or have questions, please contact our support team immediately at {{system.supportEmail}}.

This is an automated notification from {{system.name}}.`,
    variables: [
      { name: 'user', type: 'object', required: true, description: 'User information' },
      { name: 'role', type: 'object', required: true, description: 'Role information' },
      { name: 'removal', type: 'object', required: true, description: 'Removal details' },
      { name: 'system', type: 'object', required: true, description: 'System information' }
    ],
    isSystemTemplate: true
  },

  {
    name: 'security_alert',
    description: 'Security alert notification for suspicious activities',
    category: 'security_alert',
    subject: '🚨 Security Alert: {{alert.type}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-info { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .actions { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; }
        .button.secondary { background: #6b7280; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .severity-critical { color: #dc2626; font-weight: bold; text-transform: uppercase; }
        .severity-high { color: #ea580c; font-weight: bold; }
        .severity-medium { color: #d97706; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Security Alert</h1>
        </div>
        <div class="content">
            <h2>Hello {{user.firstName}},</h2>
            
            <p><strong>We detected suspicious activity on your account.</strong></p>
            
            <div class="alert-info">
                <h3>Alert Details</h3>
                <p><strong>Alert Type:</strong> {{alert.type}}</p>
                <p><strong>Severity:</strong> <span class="severity-{{alert.severity}}">{{capitalize alert.severity}}</span></p>
                <p><strong>Time:</strong> {{formatDate alert.timestamp 'long'}}</p>
                <p><strong>IP Address:</strong> {{alert.ipAddress}}</p>
                {{#if alert.location.country}}
                <p><strong>Location:</strong> {{alert.location.city}}, {{alert.location.region}}, {{alert.location.country}}</p>
                {{/if}}
                {{#if alert.details}}
                <p><strong>Details:</strong> {{alert.details}}</p>
                {{/if}}
            </div>
            
            <div class="actions">
                <h3>Recommended Actions</h3>
                <p>If this was you, no action is needed. If you don't recognize this activity, please take immediate action:</p>
                
                <a href="{{actions.changePassword}}" class="button">Change Password</a>
                <a href="{{actions.reviewSecurity}}" class="button secondary">Review Security Settings</a>
                
                <p>You can also contact our support team immediately if you need assistance.</p>
                <a href="mailto:{{actions.contactSupport}}" class="button secondary">Contact Support</a>
            </div>
            
            <p><strong>Important:</strong> If you did not perform this action, your account may be compromised. Please secure your account immediately.</p>
        </div>
        <div class="footer">
            <p>This is an automated security notification from {{system.name}}</p>
            <p>For immediate assistance, contact us at <a href="mailto:{{actions.contactSupport}}">{{actions.contactSupport}}</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Security Alert

Hello {{user.firstName}},

We detected suspicious activity on your account.

Alert Details:
- Alert Type: {{alert.type}}
- Severity: {{capitalize alert.severity}}
- Time: {{formatDate alert.timestamp 'long'}}
- IP Address: {{alert.ipAddress}}
{{#if alert.location.country}}
- Location: {{alert.location.city}}, {{alert.location.region}}, {{alert.location.country}}
{{/if}}
{{#if alert.details}}
- Details: {{alert.details}}
{{/if}}

Recommended Actions:
If this was you, no action is needed. If you don't recognize this activity, please take immediate action:

1. Change your password: {{actions.changePassword}}
2. Review security settings: {{actions.reviewSecurity}}
3. Contact support: {{actions.contactSupport}}

Important: If you did not perform this action, your account may be compromised. Please secure your account immediately.

This is an automated security notification from {{system.name}}.`,
    variables: [
      { name: 'user', type: 'object', required: true, description: 'User information' },
      { name: 'alert', type: 'object', required: true, description: 'Alert details' },
      { name: 'actions', type: 'object', required: true, description: 'Recommended actions' },
      { name: 'system', type: 'object', required: true, description: 'System information' }
    ],
    isSystemTemplate: true
  },

  {
    name: 'welcome_email',
    description: 'Welcome email for new user accounts',
    category: 'welcome',
    subject: '👋 Welcome to {{system.name}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to University Record Management System</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 15px 0; padding: 10px; background: #f0fdf4; border-radius: 6px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .credentials { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👋 Welcome to {{system.name}}</h1>
        </div>
        <div class="content">
            <h2>Hello {{user.firstName}},</h2>
            
            <p>Welcome to the <strong>{{system.name}}</strong>! Your account has been successfully created.</p>
            
            <div class="welcome-info">
                <h3>Account Information</h3>
                <p><strong>Name:</strong> {{user.firstName}} {{user.lastName}}</p>
                <p><strong>Email:</strong> {{user.email}}</p>
                <p><strong>Role:</strong> {{capitalize user.role}}</p>
                <p><strong>Created By:</strong> {{account.createdBy}}</p>
                <p><strong>Created On:</strong> {{formatDate account.createdAt 'long'}}</p>
            </div>
            
            {{#if account.temporaryPassword}}
            <div class="credentials">
                <h3>⚠️ Temporary Login Credentials</h3>
                <p><strong>Email:</strong> {{user.email}}</p>
                <p><strong>Temporary Password:</strong> {{account.temporaryPassword}}</p>
                <p><em>You must change this password on your first login.</em></p>
            </div>
            {{/if}}
            
            <div class="steps">
                <h3>Next Steps</h3>
                {{#each nextSteps}}
                <div class="step">
                    <strong>{{@index}}.</strong> {{this}}
                </div>
                {{/each}}
            </div>
            
            <a href="{{account.loginUrl}}" class="button">Login to Your Account</a>
            
            <p>If you have any questions or need assistance getting started, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>Welcome to {{system.name}}!</p>
            <p>If you need help, contact us at <a href="mailto:{{system.supportEmail}}">{{system.supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Welcome to {{system.name}}

Hello {{user.firstName}},

Welcome to the {{system.name}}! Your account has been successfully created.

Account Information:
- Name: {{user.firstName}} {{user.lastName}}
- Email: {{user.email}}
- Role: {{capitalize user.role}}
- Created By: {{account.createdBy}}
- Created On: {{formatDate account.createdAt 'long'}}

{{#if account.temporaryPassword}}
Temporary Login Credentials:
- Email: {{user.email}}
- Temporary Password: {{account.temporaryPassword}}
- You must change this password on your first login.
{{/if}}

Next Steps:
{{#each nextSteps}}
{{@index}}. {{this}}
{{/each}}

Login to your account: {{account.loginUrl}}

If you have any questions or need assistance getting started, please don't hesitate to contact our support team at {{system.supportEmail}}.

Welcome to {{system.name}}!`,
    variables: [
      { name: 'user', type: 'object', required: true, description: 'User information' },
      { name: 'account', type: 'object', required: true, description: 'Account creation details' },
      { name: 'nextSteps', type: 'array', required: true, description: 'List of next steps' },
      { name: 'system', type: 'object', required: true, description: 'System information' }
    ],
    isSystemTemplate: true
  },

  {
    name: 'approval_request',
    description: 'Notification for approval requests',
    category: 'approval_request',
    subject: '📋 Approval Required: {{request.type}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approval Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .request-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .urgent { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Approval Required</h1>
        </div>
        <div class="content">
            <h2>Hello {{approver.firstName}},</h2>
            
            <p>A new request requires your approval in the <strong>{{system.name}}</strong>.</p>
            
            <div class="request-info">
                <h3>Request Details</h3>
                <p><strong>Request ID:</strong> {{request.id}}</p>
                <p><strong>Type:</strong> {{request.type}}</p>
                <p><strong>Requested By:</strong> {{requester.firstName}} {{requester.lastName}} ({{requester.email}})</p>
                <p><strong>Requested On:</strong> {{formatDate request.requestedAt 'long'}}</p>
                {{#if request.details}}
                <p><strong>Details:</strong> {{request.details}}</p>
                {{/if}}
            </div>
            
            <p>Please review this request and provide your approval or rejection with appropriate comments.</p>
            
            <a href="{{request.approvalUrl}}" class="button">Review & Approve</a>
            
            <p><em>This request is waiting for your action. Please review it at your earliest convenience.</em></p>
        </div>
        <div class="footer">
            <p>This is an automated notification from {{system.name}}</p>
            <p>Request ID: {{request.id}}</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Approval Required

Hello {{approver.firstName}},

A new request requires your approval in the {{system.name}}.

Request Details:
- Request ID: {{request.id}}
- Type: {{request.type}}
- Requested By: {{requester.firstName}} {{requester.lastName}} ({{requester.email}})
- Requested On: {{formatDate request.requestedAt 'long'}}
{{#if request.details}}
- Details: {{request.details}}
{{/if}}

Please review this request and provide your approval or rejection with appropriate comments.

Review & Approve: {{request.approvalUrl}}

This request is waiting for your action. Please review it at your earliest convenience.

This is an automated notification from {{system.name}}.
Request ID: {{request.id}}`,
    variables: [
      { name: 'approver', type: 'object', required: true, description: 'Approver information' },
      { name: 'requester', type: 'object', required: true, description: 'Requester information' },
      { name: 'request', type: 'object', required: true, description: 'Request details' },
      { name: 'system', type: 'object', required: true, description: 'System information' }
    ],
    isSystemTemplate: true
  }
];

/**
 * Seed default email templates
 */
const seedEmailTemplates = async (createdBy) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const templateData of defaultTemplates) {
      try {
        const existingTemplate = await EmailTemplate.findOne({ name: templateData.name });
        
        if (existingTemplate) {
          // Update existing template if it's not a system template or if it's being updated by system
          if (!existingTemplate.isSystemTemplate || createdBy.toString() === 'system') {
            Object.assign(existingTemplate, {
              ...templateData,
              createdBy,
              approvedAt: new Date(),
              approvedBy: createdBy
            });
            await existingTemplate.save();
            results.updated++;
          }
        } else {
          // Create new template
          const template = new EmailTemplate({
            ...templateData,
            createdBy,
            approvedAt: new Date(),
            approvedBy: createdBy
          });
          await template.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          template: templateData.name,
          error: error.message
        });
      }
    }

    console.log(`✅ Email templates seeded: ${results.created} created, ${results.updated} updated`);
    return results;
  } catch (error) {
    console.error('Email template seeding error:', error);
    throw error;
  }
};

module.exports = {
  defaultTemplates,
  seedEmailTemplates
};
