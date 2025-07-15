const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Student, Staff } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { generateToken, comparePassword, generateRandomString } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, role, personalInfo, contactInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Only admins can create admin/staff accounts
    if (req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      if (['admin', 'super_admin', 'academic_staff', 'support_staff'].includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create this type of account'
        });
      }
    }

    // Generate user ID based on role
    let userId;
    if (role === USER_ROLES.STUDENT) {
      userId = `STU${Date.now().toString().slice(-6)}`;
    } else if (role === USER_ROLES.ACADEMIC_STAFF || role === USER_ROLES.SUPPORT_STAFF) {
      userId = `STAFF${Date.now().toString().slice(-6)}`;
    } else {
      userId = `ADMIN${Date.now().toString().slice(-6)}`;
    }

    // Create user
    const user = new User({
      userId,
      email: email.toLowerCase(),
      password,
      role,
      personalInfo,
      contactInfo,
      emailVerificationToken: generateRandomString(32),
      createdBy: req.user ? req.user._id : null
    });

    await user.save();

    // Create role-specific profile
    if (role === USER_ROLES.STUDENT) {
      const student = new Student({
        user: user._id,
        studentId: userId,
        academicInfo: req.body.academicInfo || {},
        enrollmentInfo: req.body.enrollmentInfo || {},
        createdBy: req.user ? req.user._id : null
      });
      await student.save();
    } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(role)) {
      const staff = new Staff({
        user: user._id,
        employeeId: userId,
        employmentInfo: req.body.employmentInfo || {},
        academicInfo: role === USER_ROLES.ACADEMIC_STAFF ? (req.body.academicInfo || {}) : {},
        administrativeInfo: role === USER_ROLES.SUPPORT_STAFF ? (req.body.administrativeInfo || {}) : {},
        createdBy: req.user ? req.user._id : null
      });
      await staff.save();
    }

    logger.audit('User registered', user._id, {
      email: user.email,
      role: user.role,
      registeredBy: req.user ? req.user._id : 'self'
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.audit('Failed login attempt', user._id, {
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Generate tokens
    const accessToken = generateToken(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE
    );

    const refreshToken = generateToken(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRE
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.audit('User logged in', user._id, {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          userId: user.userId,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          status: user.status,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    logger.audit('User logged out', req.user._id, {
      email: req.user.email
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -passwordResetToken');
    
    let profile = null;
    
    // Get role-specific profile
    if (user.role === USER_ROLES.STUDENT) {
      profile = await Student.findOne({ user: user._id }).populate('user', '-password');
    } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(user.role)) {
      profile = await Staff.findOne({ user: user._id }).populate('user', '-password');
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { personalInfo, contactInfo } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (personalInfo) {
      user.personalInfo = { ...user.personalInfo, ...personalInfo };
    }
    
    if (contactInfo) {
      user.contactInfo = { ...user.contactInfo, ...contactInfo };
    }
    
    user.updatedBy = req.user._id;
    await user.save();

    logger.audit('Profile updated', user._id, {
      updatedFields: Object.keys(req.body)
    });

    const updatedUser = await User.findById(user._id).select('-password -emailVerificationToken -passwordResetToken');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedBy = req.user._id;
    await user.save();

    logger.audit('Password changed', user._id, {
      email: user.email
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
