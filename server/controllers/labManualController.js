const Chapter = require('../models/Chapter');
const path = require('path');
const fs = require('fs');

const getChapters = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;

    const chapters = await Chapter.find(filter)
      .populate('subject', 'name code semester')
      .sort({ chapterNumber: 1, createdAt: 1 });

    res.json({ success: true, data: chapters });
  } catch (err) {
    next(err);
  }
};

const createChapter = async (req, res, next) => {
  try {
    const { title, chapterNumber, subject, description, notes, resourceUrl } = req.body;

    const chapterData = {
      title,
      chapterNumber: Number(chapterNumber),
      subject,
      description,
      notes,
      resourceUrl,
      createdBy: req.user._id,
    };

    if (req.file) {
      chapterData.materialFile = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `materials/${req.file.filename}`,
        mimeType: req.file.mimetype || 'application/pdf',
        size: req.file.size,
      };
    }

    const chapter = await Chapter.create(chapterData);
    res.status(201).json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
};

const updateChapter = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.chapterNumber) {
      updateData.chapterNumber = Number(updateData.chapterNumber);
    }

    if (req.file) {
      updateData.materialFile = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `materials/${req.file.filename}`,
        mimeType: req.file.mimetype || 'application/pdf',
        size: req.file.size,
      };
    }

    const chapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found.' });
    }

    res.json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
};

const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found.' });
    }

    if (chapter.materialFile?.storedName) {
      const filePath = path.resolve(__dirname, '..', 'uploads', 'materials', chapter.materialFile.storedName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, message: 'Chapter and attached files deleted.' });
  } catch (err) {
    next(err);
  }
};

const downloadMaterial = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter || !chapter.materialFile?.storedName) {
      return res.status(404).json({ success: false, message: 'Material file not found.' });
    }

    const filePath = path.resolve(__dirname, '..', 'uploads', 'materials', chapter.materialFile.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File is missing on server storage.' });
    }

    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.download(filePath, chapter.materialFile.originalName);
  } catch (err) {
    next(err);
  }
};

const viewMaterial = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter || !chapter.materialFile?.storedName) {
      return res.status(404).json({ success: false, message: 'Material file not found.' });
    }

    const filePath = path.resolve(__dirname, '..', 'uploads', 'materials', chapter.materialFile.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File missing on server storage.' });
    }

    res.setHeader('Content-Type', chapter.materialFile.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${chapter.materialFile.originalName}"`);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  downloadMaterial,
  viewMaterial,
};