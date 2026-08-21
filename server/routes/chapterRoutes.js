const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  downloadMaterial,
  viewMaterial,
} = require('../controllers/chapterController');
const { protect, authorize } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'materials'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `material-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Routes
router.route('/')
  .get(protect, getChapters)
  .post(protect, authorize('admin'), upload.single('materialFile'), createChapter);

router.route('/:id')
  .put(protect, authorize('admin'), upload.single('materialFile'), updateChapter)
  .delete(protect, authorize('admin'), deleteChapter);

router.get('/:id/view', protect, viewMaterial);
router.get('/:id/download', protect, downloadMaterial);

module.exports = router;