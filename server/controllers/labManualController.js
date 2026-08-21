const LabManual = require('../models/LabManual');
const path = require('path');
const fs = require('fs');

const getLabManuals = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    const manuals = await LabManual.find(filter).populate('subject', 'name code').sort({ createdAt: -1 });
    res.json({ success: true, data: manuals });
  } catch (err) {
    next(err);
  }
};

const createLabManual = async (req, res, next) => {
  try {
    const { title, subject, chapter, description } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required.' });

    const manual = await LabManual.create({
      title,
      subject,
      chapter,
      description,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `labmanuals/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: manual });
  } catch (err) {
    next(err);
  }
};

const updateLabManual = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.file = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `labmanuals/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }
    const manual = await LabManual.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!manual) return res.status(404).json({ success: false, message: 'Lab manual not found.' });
    res.json({ success: true, data: manual });
  } catch (err) {
    next(err);
  }
};

const deleteLabManual = async (req, res, next) => {
  try {
    const manual = await LabManual.findByIdAndDelete(req.params.id);
    if (!manual) return res.status(404).json({ success: false, message: 'Lab manual not found.' });
    if (manual.file?.storedName) {
      const filePath = path.join(__dirname, '..', 'uploads', 'labmanuals', manual.file.storedName);
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Lab manual deleted.' });
  } catch (err) {
    next(err);
  }
};

const downloadLabManual = async (req, res, next) => {
  try {
    const manual = await LabManual.findById(req.params.id);
    if (!manual) return res.status(404).json({ success: false, message: 'Lab manual not found.' });
    const filePath = path.join(__dirname, '..', 'uploads', 'labmanuals', manual.file.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing.' });
    res.download(filePath, manual.file.originalName);
  } catch (err) {
    next(err);
  }
};

const viewLabManual = async (req, res, next) => {
  try {
    const manual = await LabManual.findById(req.params.id);
    if (!manual) return res.status(404).json({ success: false, message: 'Lab manual not found.' });
    const filePath = path.join(__dirname, '..', 'uploads', 'labmanuals', manual.file.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing.' });

    // Set headers for in-browser rendering
    res.setHeader('Content-Type', manual.file.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${manual.file.originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLabManuals,
  createLabManual,
  updateLabManual,
  deleteLabManual,
  downloadLabManual,
  viewLabManual,
};