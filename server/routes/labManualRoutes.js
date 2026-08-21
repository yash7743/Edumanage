const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getLabManuals,
  createLabManual,
  updateLabManual,
  deleteLabManual,
  downloadLabManual,
  viewLabManual,
} = require('../controllers/labManualController');

const router = express.Router();
const uploadManual = createUploader('labmanuals');

// Require authentication for all routes
router.use(protect);

// Routes accessible to both Students and Admins
router.get('/', getLabManuals);
router.get('/:id/view', viewLabManual);
router.get('/:id/download', downloadLabManual);

// Admin-only management routes
const adminGuard =
  typeof requireAdminRole === 'function'
    ? requireAdminRole('super_admin', 'content_admin')
    : authorize('admin');

router.post('/', adminGuard, uploadManual.single('file'), createLabManual);
router.put('/:id', adminGuard, uploadManual.single('file'), updateLabManual);
router.delete('/:id', adminGuard, deleteLabManual);

module.exports = router;