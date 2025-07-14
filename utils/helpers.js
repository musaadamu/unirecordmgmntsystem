const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Match result
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration
 * @returns {string} - JWT token
 */
const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {object} - Decoded token
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} - Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate student ID
 * @param {string} year - Academic year
 * @param {string} department - Department code
 * @returns {string} - Student ID
 */
const generateStudentId = (year, department) => {
  const timestamp = Date.now().toString().slice(-4);
  return `${year}${department}${timestamp}`;
};

/**
 * Generate employee ID
 * @param {string} department - Department code
 * @param {string} role - Employee role
 * @returns {string} - Employee ID
 */
const generateEmployeeId = (department, role) => {
  const timestamp = Date.now().toString().slice(-4);
  const roleCode = role.substring(0, 2).toUpperCase();
  return `${department}${roleCode}${timestamp}`;
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Validation result
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} - Validation result
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Calculate GPA
 * @param {Array} grades - Array of grade objects
 * @returns {number} - GPA value
 */
const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;
  
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(grade => {
    const points = gradePoints[grade.letterGrade] || 0;
    const credits = grade.credits || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRandomString,
  generateStudentId,
  generateEmployeeId,
  isValidEmail,
  isValidPhone,
  calculateGPA,
  formatDate,
  sanitizeInput
};
