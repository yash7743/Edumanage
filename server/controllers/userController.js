const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const LabManual = require('../models/LabManual');

const getStudents = async (req, res, next) => {
  try {
    const { search, semester, page = 1, limit = 20 } = req.query;
    const filter = { role: 'student' };
    if (semester) filter.semester = semester;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { password, role, adminRole, ...safeFields } = req.body;
    const student = await User.findOneAndUpdate({ _id: req.params.id, role: 'student' }, safeFields, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminRole } = req.body;

    if (!name || !email || !password || !adminRole) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and admin role are required.' });
    }
    if (!['super_admin', 'content_admin', 'faculty_admin'].includes(adminRole)) {
      return res.status(400).json({ success: false, message: 'Invalid admin role.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const admin = await User.create({ name, email, password, role: 'admin', adminRole });
    res.status(201).json({ success: true, data: admin.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

const toggleAdminStatus = async (req, res, next) => {
  try {
    const target = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!target) return res.status(404).json({ success: false, message: 'Admin not found.' });

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    target.isActive = !target.isActive;
    await target.save();
    res.json({ success: true, data: target.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalStudents, totalSubjects, totalChapters, totalAssignments,
      totalLabManuals, pendingSubmissions, recentSubmissions, upcomingDeadlines,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Subject.countDocuments(),
      Chapter.countDocuments(),
      Assignment.countDocuments(),
      LabManual.countDocuments(),
      Submission.countDocuments({ status: { $in: ['submitted', 'late'] } }),
      Submission.find().sort({ submittedAt: -1 }).limit(5).populate('student', 'name').populate('assignment', 'title'),
      Assignment.find({ deadline: { $gte: now, $lte: in7Days } }).sort({ deadline: 1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: { totalStudents, totalSubjects, totalChapters, totalAssignments, totalLabManuals, pendingSubmissions, recentSubmissions, upcomingDeadlines },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, updateStudent, getAdmins, createAdmin, toggleAdminStatus, getDashboardStats };