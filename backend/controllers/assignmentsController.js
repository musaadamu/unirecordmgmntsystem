


// List all assignments, with optional staff/course filtering
exports.listAssignments = async (req, res) => {
  try {
    const { staffId, courseId, status } = req.query;
    const filter = {};
    if (staffId) filter.staff = staffId;
    if (courseId) filter.course = courseId;
    if (status) filter.status = status;
    const assignments = await Assignment.find(filter)
      .populate('staff', 'employeeId employmentInfo')
      .populate('course', 'courseCode courseName');
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
  }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, staff, course, status } = req.body;
    const assignment = new Assignment({ title, description, dueDate, staff, course, status });
    await assignment.save();
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating assignment', error: error.message });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const assignment = await Assignment.findByIdAndUpdate(id, update, { new: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating assignment', error: error.message });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting assignment', error: error.message });
  }
};

exports.getPendingAssignments = async (req, res) => {
  try {
    const { staffId, courseId } = req.query;
    const filter = { status: 'pending' };
    if (staffId) filter.staff = staffId;
    if (courseId) filter.course = courseId;
    const assignments = await Assignment.find(filter)
      .populate('staff', 'employeeId employmentInfo')
      .populate('course', 'courseCode courseName');
    res.status(200).json({ success: true, message: 'Pending assignments data', data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
  }
};
