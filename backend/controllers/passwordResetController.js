const crypto = require('crypto');
const { User } = require('../models');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { generateRandomString } = require('../utils/helpers');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Request password reset
 */
const requestPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Check if user is active
  if (user.status !== 'active') {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = generateRandomString(32);
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save reset token to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  try {
    // Send reset email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - University Record Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.personalInfo.firstName},</p>
          <p>You have requested to reset your password for the University Record Management System.</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="margin: 24px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from the University Record Management System.
            Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    logger.audit('Password reset requested', user._id, {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    // Clear reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.error('Password reset email failed', {
      error: error.message,
      email: user.email
    });

    throw new AppError('Failed to send password reset email. Please try again later.', 500);
  }
});

/**
 * Reset password with token
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  // Validate password strength
  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400);
  }

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.audit('Password reset completed', user._id, {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.'
  });
});

/**
 * Admin reset user password
 */
const adminResetUserPassword = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { newPassword, sendEmail = true } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  let password = newPassword;
  
  // Generate random password if not provided
  if (!password) {
    password = generateRandomString(12);
  }

  // Validate password if provided
  if (newPassword) {
    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400);
    }
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send email with new password if requested
  if (sendEmail) {
    try {
      const transporter = createEmailTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset - University Record Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>Hello ${user.personalInfo.firstName},</p>
            <p>Your password has been reset by an administrator.</p>
            <p><strong>Your new temporary password is: ${password}</strong></p>
            <p style="color: #d9534f;">Please login and change this password immediately for security reasons.</p>
            <p>Login URL: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
            <hr style="margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the University Record Management System.
              Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Admin password reset email failed', {
        error: error.message,
        userId,
        adminId: req.user._id
      });
    }
  }

  logger.audit('Admin password reset', req.user._id, {
    targetUserId: userId,
    targetUserEmail: user.email,
    emailSent: sendEmail
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully.',
    data: {
      temporaryPassword: sendEmail ? undefined : password,
      emailSent: sendEmail
    }
  });
});

/**
 * Verify reset token validity
 */
const verifyResetToken = catchAsync(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError('Token is required', 400);
  }

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('email personalInfo.firstName');

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      email: user.email,
      firstName: user.personalInfo.firstName,
      expiresIn: Math.floor((user.passwordResetExpires - Date.now()) / 1000) // seconds
    }
  });
});

/**
 * Send email verification
 */
const sendEmailVerification = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.emailVerified) {
    return res.json({
      success: true,
      message: 'Email is already verified'
    });
  }

  // Generate verification token
  const verificationToken = generateRandomString(32);
  user.emailVerificationToken = verificationToken;
  await user.save();

  try {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification - University Record Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello ${user.personalInfo.firstName},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationURL}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Verify Email</a>
          <p>If you did not create this account, please ignore this email.</p>
          <hr style="margin: 24px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from the University Record Management System.
            Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    logger.audit('Email verification sent', req.user._id, {
      targetUserId: userId,
      targetUserEmail: user.email
    });

    res.json({
      success: true,
      message: 'Email verification link has been sent'
    });

  } catch (error) {
    logger.error('Email verification failed', {
      error: error.message,
      userId,
      adminId: req.user._id
    });

    throw new AppError('Failed to send email verification. Please try again later.', 500);
  }
});

/**
 * Verify email with token
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400);
  }

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    throw new AppError('Invalid verification token', 400);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.status = 'active'; // Activate user upon email verification
  await user.save();

  logger.audit('Email verified', user._id, {
    email: user.email
  });

  res.json({
    success: true,
    message: 'Email verified successfully. Your account is now active.'
  });
});

module.exports = {
  requestPasswordReset,
  resetPassword,
  adminResetUserPassword,
  verifyResetToken,
  sendEmailVerification,
  verifyEmail
};
