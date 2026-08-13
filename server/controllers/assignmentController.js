const Assignment = require('../models/Assignment');
const path = require('path');
const fs = require('fs');

const getAssignments = async (req, res, next) => {
  try {
    const { subject, chapter } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    const assignments = await Assignment.find(filter)
      .populate('subject', 'name code')
      .sort({ deadline: 1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('subject', 'name code');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const { title, subject, chapter, description, startDate, deadline, maxMarks } = req.body;

    const data = { title, subject, chapter, description, startDate, deadline, maxMarks, createdBy: req.user._id };

    if (req.file) {
      data.file = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `assignments/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const assignment = await Assignment.create(data);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.file = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `assignments/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    if (assignment.file?.storedName) {
      const filePath = path.join(__dirname, '..', 'uploads', 'assignments', assignment.file.storedName);
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) {
    next(err);
  }
};

const downloadAssignmentFile = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment || !assignment.file?.storedName) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }
    const filePath = path.join(__dirname, '..', 'uploads', 'assignments', assignment.file.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing.' });
    res.download(filePath, assignment.file.originalName);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  downloadAssignmentFile,
};
