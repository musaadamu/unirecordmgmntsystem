const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  attempt_number: { type: Number, default: 1 },
  submission_content: { type: mongoose.Schema.Types.Mixed },
  file_attachments: [{ type: String }],
  submitted_at: { type: Date },
  graded_at: { type: Date },
  grade: { type: Number },
  feedback: { type: String },
  status: { type: String, enum: ['submitted', 'graded', 'returned', 'late'] },
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
