const Submission = require('../models/Submission');
const path = require('path');
const fs = require('fs');

// Students create/view their own submissions; admins/faculty view & evaluate all
const getSubmissions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.query.assignment) filter.assignment = req.query.assignment;
    if (req.query.student && req.user.role === 'admin') filter.student = req.query.student;

    const submissions = await Submission.find(filter)
      .populate('assignment', 'title deadline maxMarks')
      .populate('student', 'name email studentId')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

const createSubmission = async (req, res, next) => {
  try {
    const { assignment: assignmentId } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Submission file is required.' });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    const isLate = new Date() > new Date(assignment.deadline);

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: req.user._id },
      {
        assignment: assignmentId,
        student: req.user._id,
        file: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          path: `submissions/${req.file.filename}`,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// Faculty/Super admin: evaluate — add marks + feedback
const updateSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: 'evaluated' },
      { new: true, runValidators: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

const downloadSubmissionFile = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    // Students may only download their own submission file
    if (req.user.role === 'student' && String(submission.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'submissions', submission.file.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing.' });
    res.download(filePath, submission.file.originalName);
  } catch (err) {
    next(err);
  }
};

// Authenticated inline viewing for student submissions
const viewSubmissionFile = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission || !submission.file?.storedName) {
      return res.status(404).json({ success: false, message: 'Submission file not found.' });
    }

    // Students may only view their own submission file
    if (req.user.role === 'student' && String(submission.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'submissions', submission.file.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing.' });

    res.setHeader('Content-Type', submission.file.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${submission.file.originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubmissions,
  createSubmission,
  updateSubmission,
  downloadSubmissionFile,
  viewSubmissionFile,
};