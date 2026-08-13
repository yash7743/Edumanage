const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

const getSubjects = async (req, res, next) => {
  try {
    const { semester, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (semester) filter.semester = semester;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [subjects, total] = await Promise.all([
      Subject.find(filter).sort({ semester: 1, name: 1 }).skip(skip).limit(Number(limit)),
      Subject.countDocuments(filter),
    ]);

    res.json({ success: true, data: subjects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
    const chapters = await Chapter.find({ subject: subject._id }).sort({ chapterNumber: 1 });
    res.json({ success: true, data: { subject, chapters } });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, semester } = req.body;
    const subject = await Subject.create({ name, code, description, semester, createdBy: req.user._id });
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
    await Chapter.deleteMany({ subject: subject._id });
    res.json({ success: true, message: 'Subject deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
