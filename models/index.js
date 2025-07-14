// Central export file for all models
const User = require('./User');
const Student = require('./Student');
const Staff = require('./Staff');
const Course = require('./Course');
const Grade = require('./Grade');
const Enrollment = require('./Enrollment');
const Transcript = require('./Transcript');
const Payment = require('./Payment');

module.exports = {
  User,
  Student,
  Staff,
  Course,
  Grade,
  Enrollment,
  Transcript,
  Payment
};
