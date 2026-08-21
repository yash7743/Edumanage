const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  downloadMaterial,
  viewMaterial,
} = require('../controllers/chapterController');

const router = express.Router();
const uploadMaterial = createUploader('materials');

// Require authentication for all chapter routes
router.use(protect);

// Routes accessible to both Students and Admins
router.get('/', getChapters);
router.get('/:id/view', viewMaterial);
router.get('/:id/download', downloadMaterial);

// Admin-only management routes
router.post('/', requireAdminRole('super_admin', 'content_admin'), uploadMaterial.single('materialFile'), createChapter);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), uploadMaterial.single('materialFile'), updateChapter);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteChapter);

module.exports = router;