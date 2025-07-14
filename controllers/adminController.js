const { User, Student, Staff } = require('../models');
const { USER_ROLES, USER_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { generateStudentId, generateEmployeeId, generateRandomString } = require('../utils/helpers');
const logger = require('../utils/logger');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * Bulk user registration
 */
const bulkRegisterUsers = catchAsync(async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    throw new AppError('Users array is required and cannot be empty', 400);
  }

  if (users.length > 100) {
    throw new AppError('Cannot register more than 100 users at once', 400);
  }

  const results = {
    successful: [],
    failed: [],
    total: users.length
  };

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        results.failed.push({
          email: userData.email,
          error: 'User with this email already exists'
        });
        continue;
      }

      // Generate user ID based on role
      let userId;
      if (userData.role === USER_ROLES.STUDENT) {
        userId = generateStudentId(userData.academicYear || '2024', userData.department || 'GEN');
      } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(userData.role)) {
        userId = generateEmployeeId(userData.department || 'GEN', userData.role);
      } else {
        userId = `ADMIN${Date.now().toString().slice(-6)}`;
      }

      // Create user
      const user = new User({
        userId,
        email: userData.email.toLowerCase(),
        password: userData.password || generateRandomString(12),
        role: userData.role,
        status: userData.status || USER_STATUS.PENDING,
        personalInfo: userData.personalInfo,
        contactInfo: userData.contactInfo,
        emailVerificationToken: generateRandomString(32),
        createdBy: req.user._id
      });

      await user.save();

      // Create role-specific profile
      if (userData.role === USER_ROLES.STUDENT) {
        const student = new Student({
          user: user._id,
          studentId: userId,
          academicInfo: userData.academicInfo || {},
          enrollmentInfo: userData.enrollmentInfo || {},
          createdBy: req.user._id
        });
        await student.save();
      } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(userData.role)) {
        const staff = new Staff({
          user: user._id,
          employeeId: userId,
          employmentInfo: userData.employmentInfo || {},
          academicInfo: userData.role === USER_ROLES.ACADEMIC_STAFF ? (userData.academicInfo || {}) : {},
          administrativeInfo: userData.role === USER_ROLES.SUPPORT_STAFF ? (userData.administrativeInfo || {}) : {},
          createdBy: req.user._id
        });
        await staff.save();
      }

      results.successful.push({
        email: userData.email,
        userId: userId,
        role: userData.role
      });

    } catch (error) {
      results.failed.push({
        email: userData.email,
        error: error.message
      });
    }
  }

  logger.audit('Bulk user registration', req.user._id, {
    total: results.total,
    successful: results.successful.length,
    failed: results.failed.length
  });

  res.status(201).json({
    success: true,
    message: `Bulk registration completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
    data: results
  });
});

/**
 * Import users from CSV file
 */
const importUsersFromCSV = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('CSV file is required', 400);
  }

  const users = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Validate required fields
          if (!row.email || !row.role || !row.firstName || !row.lastName) {
            errors.push({
              row: users.length + 1,
              error: 'Missing required fields: email, role, firstName, lastName'
            });
            return;
          }

          const user = {
            email: row.email,
            role: row.role,
            personalInfo: {
              firstName: row.firstName,
              lastName: row.lastName,
              middleName: row.middleName || '',
              dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : new Date('1990-01-01'),
              gender: row.gender || 'other',
              nationality: row.nationality || 'US'
            },
            contactInfo: {
              phone: row.phone || '',
              address: {
                street: row.street || '',
                city: row.city || '',
                state: row.state || '',
                zipCode: row.zipCode || '',
                country: row.country || 'USA'
              }
            }
          };

          // Add role-specific information
          if (row.role === USER_ROLES.STUDENT) {
            user.academicInfo = {
              program: row.program || '',
              department: row.department || '',
              faculty: row.faculty || '',
              level: row.level || 'undergraduate',
              yearOfStudy: parseInt(row.yearOfStudy) || 1,
              academicYear: row.academicYear || '2024'
            };
          } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(row.role)) {
            user.employmentInfo = {
              position: row.position || '',
              department: row.department || '',
              faculty: row.faculty || '',
              employmentType: row.employmentType || 'full_time',
              hireDate: row.hireDate ? new Date(row.hireDate) : new Date()
            };
          }

          users.push(user);
        } catch (error) {
          errors.push({
            row: users.length + 1,
            error: error.message
          });
        }
      })
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          if (users.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No valid users found in CSV file',
              errors
            });
          }

          // Process bulk registration
          const bulkResult = await processBulkRegistration(users, req.user._id);

          logger.audit('CSV user import', req.user._id, {
            fileName: req.file.originalname,
            totalRows: users.length + errors.length,
            validUsers: users.length,
            csvErrors: errors.length,
            successful: bulkResult.successful.length,
            failed: bulkResult.failed.length
          });

          res.status(201).json({
            success: true,
            message: `CSV import completed. ${bulkResult.successful.length} users created successfully.`,
            data: {
              ...bulkResult,
              csvErrors: errors
            }
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        reject(error);
      });
  });
});

/**
 * Export users to CSV
 */
const exportUsersToCSV = catchAsync(async (req, res) => {
  const { role, status, department, format = 'csv' } = req.query;

  // Build filter
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  // Get users with populated profiles
  const users = await User.find(filter)
    .select('-password -emailVerificationToken -passwordResetToken')
    .lean();

  // Get additional profile information
  const enrichedUsers = [];
  for (const user of users) {
    let profile = null;
    if (user.role === USER_ROLES.STUDENT) {
      profile = await Student.findOne({ user: user._id }).lean();
    } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(user.role)) {
      profile = await Staff.findOne({ user: user._id }).lean();
    }

    enrichedUsers.push({
      ...user,
      profile
    });
  }

  if (format === 'json') {
    return res.json({
      success: true,
      data: {
        users: enrichedUsers,
        count: enrichedUsers.length,
        exportDate: new Date().toISOString()
      }
    });
  }

  // Generate CSV
  const csvHeaders = [
    'userId', 'email', 'role', 'status', 'firstName', 'lastName', 'phone',
    'department', 'program', 'position', 'createdAt'
  ];

  const csvData = enrichedUsers.map(user => ({
    userId: user.userId,
    email: user.email,
    role: user.role,
    status: user.status,
    firstName: user.personalInfo?.firstName || '',
    lastName: user.personalInfo?.lastName || '',
    phone: user.contactInfo?.phone || '',
    department: user.profile?.academicInfo?.department || user.profile?.employmentInfo?.department || '',
    program: user.profile?.academicInfo?.program || '',
    position: user.profile?.employmentInfo?.position || '',
    createdAt: user.createdAt
  }));

  const csvContent = [
    csvHeaders.join(','),
    ...csvData.map(row => csvHeaders.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  logger.audit('User data export', req.user._id, {
    format,
    filter,
    userCount: enrichedUsers.length
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.csv`);
  res.send(csvContent);
});

/**
 * Activate/Deactivate multiple users
 */
const bulkUpdateUserStatus = catchAsync(async (req, res) => {
  const { userIds, status, reason } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('User IDs array is required', 400);
  }

  if (!Object.values(USER_STATUS).includes(status)) {
    throw new AppError('Invalid status value', 400);
  }

  const results = {
    successful: [],
    failed: [],
    total: userIds.length
  };

  for (const userId of userIds) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        results.failed.push({
          userId,
          error: 'User not found'
        });
        continue;
      }

      user.status = status;
      user.updatedBy = req.user._id;
      await user.save();

      // Update role-specific profiles
      if (user.role === USER_ROLES.STUDENT) {
        await Student.findOneAndUpdate(
          { user: userId },
          { isActive: status === USER_STATUS.ACTIVE, updatedBy: req.user._id }
        );
      } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(user.role)) {
        await Staff.findOneAndUpdate(
          { user: userId },
          { isActive: status === USER_STATUS.ACTIVE, updatedBy: req.user._id }
        );
      }

      results.successful.push({
        userId,
        email: user.email,
        newStatus: status
      });

      logger.audit('User status updated', req.user._id, {
        targetUserId: userId,
        oldStatus: user.status,
        newStatus: status,
        reason
      });

    } catch (error) {
      results.failed.push({
        userId,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    message: `Status update completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
    data: results
  });
});

/**
 * Helper function to process bulk registration
 */
const processBulkRegistration = async (users, createdBy) => {
  const results = {
    successful: [],
    failed: []
  };

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        results.failed.push({
          email: userData.email,
          error: 'User with this email already exists'
        });
        continue;
      }

      // Generate user ID
      let userId;
      if (userData.role === USER_ROLES.STUDENT) {
        userId = generateStudentId(userData.academicInfo?.academicYear || '2024', userData.academicInfo?.department || 'GEN');
      } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(userData.role)) {
        userId = generateEmployeeId(userData.employmentInfo?.department || 'GEN', userData.role);
      } else {
        userId = `ADMIN${Date.now().toString().slice(-6)}`;
      }

      // Create user
      const user = new User({
        userId,
        email: userData.email.toLowerCase(),
        password: userData.password || generateRandomString(12),
        role: userData.role,
        status: userData.status || USER_STATUS.PENDING,
        personalInfo: userData.personalInfo,
        contactInfo: userData.contactInfo,
        emailVerificationToken: generateRandomString(32),
        createdBy
      });

      await user.save();

      // Create role-specific profile
      if (userData.role === USER_ROLES.STUDENT) {
        const student = new Student({
          user: user._id,
          studentId: userId,
          academicInfo: userData.academicInfo || {},
          enrollmentInfo: userData.enrollmentInfo || {},
          createdBy
        });
        await student.save();
      } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(userData.role)) {
        const staff = new Staff({
          user: user._id,
          employeeId: userId,
          employmentInfo: userData.employmentInfo || {},
          academicInfo: userData.role === USER_ROLES.ACADEMIC_STAFF ? (userData.academicInfo || {}) : {},
          administrativeInfo: userData.role === USER_ROLES.SUPPORT_STAFF ? (userData.administrativeInfo || {}) : {},
          createdBy
        });
        await staff.save();
      }

      results.successful.push({
        email: userData.email,
        userId: userId,
        role: userData.role
      });

    } catch (error) {
      results.failed.push({
        email: userData.email,
        error: error.message
      });
    }
  }

  return results;
};

module.exports = {
  bulkRegisterUsers,
  importUsersFromCSV,
  exportUsersToCSV,
  bulkUpdateUserStatus
};
