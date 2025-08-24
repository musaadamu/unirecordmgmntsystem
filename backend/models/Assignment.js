const mongoose = require('mongoose');


const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  instructions: { type: String },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_points: { type: Number },
  due_date: { type: Date },
  available_from: { type: Date },
  available_until: { type: Date },
  submission_types: [{ type: String, enum: ['file', 'text', 'url', 'quiz'] }],
  max_file_size: { type: Number },
  allowed_file_types: [{ type: String }],
  allow_late_submissions: { type: Boolean, default: false },
  late_penalty_per_day: { type: Number },
  max_attempts: { type: Number, default: 1 },
  group_assignment: { type: Boolean, default: false },
  rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric' },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  deleted_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
