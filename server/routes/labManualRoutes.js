const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getLabManuals,
  createLabManual,
  updateLabManual,
  deleteLabManual,
  downloadLabManual,
} = require('../controllers/labManualController');

const router = express.Router();
const uploadManual = createUploader('labmanuals');

router.use(protect);

router.get('/', getLabManuals);
router.get('/:id/download', downloadLabManual);
router.post('/', requireAdminRole('super_admin', 'content_admin'), uploadManual.single('file'), createLabManual);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), uploadManual.single('file'), updateLabManual);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteLabManual);

module.exports = router;
