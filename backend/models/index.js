// Central export file for all models
const User = require('./User');
const Student = require('./Student');
const Staff = require('./Staff');
const Course = require('./Course');
const Grade = require('./Grade');
const Enrollment = require('./Enrollment');
const Transcript = require('./Transcript');
const Payment = require('./Payment');
const Attendance = require('./Attendance');
const Document = require('./Document');
const ExtracurricularActivity = require('./ExtracurricularActivity');
const DisciplinaryRecord = require('./DisciplinaryRecord');
const HealthRecord = require('./HealthRecord');
const LibraryRecord = require('./LibraryRecord');

module.exports = {
  User,
  Student,
  Staff,
  Course,
  Grade,
  Enrollment,
  Transcript,
  Payment,
  Attendance,
  Document,
  ExtracurricularActivity,
  DisciplinaryRecord,
  HealthRecord,
  LibraryRecord
};
