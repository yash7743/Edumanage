const express = require('express');
const { protect, authorize } = require('../middleware/auth');
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
const adminGuard = typeof requireAdminRole === 'function' 
  ? requireAdminRole('super_admin', 'content_admin') 
  : authorize('admin');

router.post('/', adminGuard, uploadMaterial.single('materialFile'), createChapter);
router.put('/:id', adminGuard, uploadMaterial.single('materialFile'), updateChapter);
router.delete('/:id', adminGuard, deleteChapter);

module.exports = router;