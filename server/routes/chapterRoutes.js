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
} = require('../controllers/chapterController');

const router = express.Router();
const uploadMaterial = createUploader('materials');

router.use(protect);

router.get('/', getChapters);
router.get('/:id/download', downloadMaterial);
router.post('/', requireAdminRole('super_admin', 'content_admin'), uploadMaterial.single('materialFile'), createChapter);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), uploadMaterial.single('materialFile'), updateChapter);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteChapter);

module.exports = router;
