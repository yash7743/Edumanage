const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  getLabManuals,
  createLabManual,
  updateLabManual,
  deleteLabManual,
  downloadLabManual,
  viewLabManual,
} = require('../controllers/labManualController');
const { protect, authorize } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'labmanuals'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `lab-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
});

// Routes
router.route('/')
  .get(protect, getLabManuals)
  .post(protect, authorize('admin'), upload.single('file'), createLabManual);

router.route('/:id')
  .put(protect, authorize('admin'), upload.single('file'), updateLabManual)
  .delete(protect, authorize('admin'), deleteLabManual);

router.get('/:id/view', protect, viewLabManual);
router.get('/:id/download', protect, downloadLabManual);

module.exports = router;