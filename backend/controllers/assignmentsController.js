exports.getPendingAssignments = (req, res) => {
  // Sample pending assignments data
  const data = [
    {
      id: 'a1',
      title: 'Assignment 1',
      description: 'Complete the project proposal',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    },
    {
      id: 'a2',
      title: 'Assignment 2',
      description: 'Read chapters 4 and 5',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    },
  ];
  res.status(200).json({ success: true, message: 'Pending assignments data', data });
};
