const { User, Student, Staff } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    status,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
      { userId: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Execute query
  const users = await User.find(filter)
    .select('-password -emailVerificationToken -passwordResetToken')
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  logger.audit('Users retrieved', req.user._id, {
    filter,
    page,
    limit,
    total
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

/**
 * Get user by ID
 */
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -emailVerificationToken -passwordResetToken');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get role-specific profile
  let profile = null;
  if (user.role === USER_ROLES.STUDENT) {
    profile = await Student.findOne({ user: user._id });
  } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(user.role)) {
    profile = await Staff.findOne({ user: user._id });
  }

  logger.audit('User retrieved', req.user._id, {
    targetUserId: id
  });

  res.json({
    success: true,
    data: {
      user,
      profile
    }
  });
});

/**
 * Update user
 */
const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { personalInfo, contactInfo, status } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can update status and other users' profiles
  if (req.user._id.toString() !== id && !['admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('You can only update your own profile', 403);
  }

  // Only admins can update status
  if (status && !['admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Only administrators can update user status', 403);
  }

  // Update fields
  if (personalInfo) {
    user.personalInfo = { ...user.personalInfo, ...personalInfo };
  }
  if (contactInfo) {
    user.contactInfo = { ...user.contactInfo, ...contactInfo };
  }
  if (status && ['admin', 'super_admin'].includes(req.user.role)) {
    user.status = status;
  }

  user.updatedBy = req.user._id;
  await user.save();

  logger.audit('User updated', req.user._id, {
    targetUserId: id,
    updatedFields: Object.keys(req.body)
  });

  const updatedUser = await User.findById(id)
    .select('-password -emailVerificationToken -passwordResetToken');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Delete user (soft delete)
 */
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Only super admins can delete users
  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new AppError('Only super administrators can delete users', 403);
  }

  // Soft delete by setting status to inactive
  user.status = 'inactive';
  user.updatedBy = req.user._id;
  await user.save();

  // Also update role-specific profile
  if (user.role === USER_ROLES.STUDENT) {
    await Student.findOneAndUpdate(
      { user: user._id },
      { isActive: false, updatedBy: req.user._id }
    );
  } else if ([USER_ROLES.ACADEMIC_STAFF, USER_ROLES.SUPPORT_STAFF].includes(user.role)) {
    await Staff.findOneAndUpdate(
      { user: user._id },
      { isActive: false, updatedBy: req.user._id }
    );
  }

  logger.audit('User deleted', req.user._id, {
    targetUserId: id,
    userEmail: user.email
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get user statistics
 */
const getUserStats = catchAsync(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const recentUsers = await User.find()
    .select('personalInfo.firstName personalInfo.lastName email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  logger.audit('User statistics retrieved', req.user._id);

  res.json({
    success: true,
    data: {
      totalUsers,
      roleStats: stats,
      recentUsers
    }
  });
});

/**
 * Search users
 */
const searchUsers = catchAsync(async (req, res) => {
  const { q, role, limit = 10 } = req.query;

  if (!q || q.length < 2) {
    throw new AppError('Search query must be at least 2 characters long', 400);
  }

  const filter = {
    $or: [
      { email: { $regex: q, $options: 'i' } },
      { 'personalInfo.firstName': { $regex: q, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: q, $options: 'i' } },
      { userId: { $regex: q, $options: 'i' } }
    ]
  };

  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('userId email personalInfo.firstName personalInfo.lastName role status')
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      count: users.length
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  searchUsers
};
