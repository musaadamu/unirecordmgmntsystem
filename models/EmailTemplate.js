const mongoose = require('mongoose');
const Handlebars = require('handlebars');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: [
      'role_assignment',
      'permission_change',
      'security_alert',
      'system_maintenance',
      'account_update',
      'approval_request',
      'digest',
      'welcome',
      'reminder',
      'notification'
    ],
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: true
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'date', 'object', 'array'],
      default: 'string'
    },
    required: {
      type: Boolean,
      default: false
    },
    description: String,
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  language: {
    type: String,
    default: 'en'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  metadata: {
    tags: [String],
    department: String,
    audience: {
      type: String,
      enum: ['students', 'staff', 'admins', 'all'],
      default: 'all'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedReadTime: Number, // in minutes
    lastUsed: Date,
    usageCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ language: 1 });
emailTemplateSchema.index({ isSystemTemplate: 1 });
emailTemplateSchema.index({ 'metadata.department': 1 });

// Virtual for approval status
emailTemplateSchema.virtual('isApproved').get(function() {
  return !!this.approvedAt;
});

// Static method to find templates by category
emailTemplateSchema.statics.findByCategory = function(category, language = 'en') {
  return this.find({ 
    category, 
    isActive: true, 
    language,
    approvedAt: { $exists: true }
  }).sort({ name: 1 });
};

// Static method to get system templates
emailTemplateSchema.statics.getSystemTemplates = function() {
  return this.find({ 
    isSystemTemplate: true, 
    isActive: true 
  }).sort({ category: 1, name: 1 });
};

// Instance method to render subject with data
emailTemplateSchema.methods.renderSubject = function(data = {}) {
  try {
    const template = Handlebars.compile(this.subject);
    return template(data);
  } catch (error) {
    console.error('Subject rendering error:', error);
    return this.subject;
  }
};

// Instance method to render HTML content with data
emailTemplateSchema.methods.renderHtml = function(data = {}) {
  try {
    const template = Handlebars.compile(this.htmlContent);
    return template(data);
  } catch (error) {
    console.error('HTML rendering error:', error);
    return this.htmlContent;
  }
};

// Instance method to render text content with data
emailTemplateSchema.methods.renderText = function(data = {}) {
  try {
    const template = Handlebars.compile(this.textContent);
    return template(data);
  } catch (error) {
    console.error('Text rendering error:', error);
    return this.textContent;
  }
};

// Instance method to validate template data
emailTemplateSchema.methods.validateData = function(data) {
  const errors = [];
  
  for (const variable of this.variables) {
    if (variable.required && (data[variable.name] === undefined || data[variable.name] === null)) {
      errors.push(`Required variable '${variable.name}' is missing`);
      continue;
    }
    
    if (data[variable.name] !== undefined) {
      const value = data[variable.name];
      const expectedType = variable.type;
      
      switch (expectedType) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Variable '${variable.name}' should be a string`);
          }
          break;
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Variable '${variable.name}' should be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Variable '${variable.name}' should be a boolean`);
          }
          break;
        case 'date':
          if (!(value instanceof Date) && !Date.parse(value)) {
            errors.push(`Variable '${variable.name}' should be a valid date`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Variable '${variable.name}' should be an array`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`Variable '${variable.name}' should be an object`);
          }
          break;
      }
    }
  }
  
  return errors;
};

// Instance method to clone template
emailTemplateSchema.methods.clone = async function(newName, createdBy) {
  const clonedTemplate = new this.constructor({
    name: newName,
    description: `${this.description} (Copy)`,
    category: this.category,
    subject: this.subject,
    htmlContent: this.htmlContent,
    textContent: this.textContent,
    variables: [...this.variables],
    language: this.language,
    createdBy: createdBy,
    isSystemTemplate: false,
    metadata: {
      ...this.metadata.toObject(),
      tags: [...(this.metadata.tags || []), 'cloned'],
      usageCount: 0,
      lastUsed: undefined
    }
  });
  
  return await clonedTemplate.save();
};

// Instance method to approve template
emailTemplateSchema.methods.approve = function(approvedBy) {
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this;
};

// Instance method to increment usage
emailTemplateSchema.methods.incrementUsage = function() {
  this.metadata.usageCount += 1;
  this.metadata.lastUsed = new Date();
  return this.save();
};

// Pre-save middleware to validate template syntax
emailTemplateSchema.pre('save', function(next) {
  try {
    // Validate Handlebars syntax
    Handlebars.compile(this.subject);
    Handlebars.compile(this.htmlContent);
    Handlebars.compile(this.textContent);
    next();
  } catch (error) {
    next(new Error(`Template syntax error: ${error.message}`));
  }
});

// Pre-save middleware to prevent system template modification
emailTemplateSchema.pre('save', function(next) {
  if (this.isSystemTemplate && this.isModified() && !this.isNew) {
    const allowedModifications = ['isActive', 'metadata.usageCount', 'metadata.lastUsed'];
    const modifiedPaths = this.modifiedPaths();
    const unauthorizedModifications = modifiedPaths.filter(path => 
      !allowedModifications.some(allowed => path.startsWith(allowed))
    );
    
    if (unauthorizedModifications.length > 0) {
      return next(new Error('System templates cannot be modified'));
    }
  }
  next();
});

// Post-save middleware for audit logging
emailTemplateSchema.post('save', async function(doc, next) {
  try {
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: doc.isNew ? 'email_template_created' : 'email_template_updated',
      userId: doc.createdBy,
      details: {
        templateId: doc._id,
        templateName: doc.name,
        category: doc.category,
        language: doc.language,
        isSystemTemplate: doc.isSystemTemplate,
        isApproved: doc.isApproved
      },
      ipAddress: doc._ipAddress || 'system',
      userAgent: doc._userAgent || 'system',
      category: 'administration'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
  next();
});

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(date, format) {
  if (!date) return '';
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return d.toLocaleTimeString();
    default:
      return d.toLocaleString();
  }
});

Handlebars.registerHelper('capitalize', function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('ne', function(a, b) {
  return a !== b;
});

Handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

Handlebars.registerHelper('lt', function(a, b) {
  return a < b;
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
