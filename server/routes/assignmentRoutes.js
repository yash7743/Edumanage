const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  downloadAssignmentFile,
} = require('../controllers/assignmentController');

const router = express.Router();
const uploadAssignment = createUploader('assignments');

router.use(protect);

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.get('/:id/download', downloadAssignmentFile);
router.post('/', requireAdminRole('super_admin', 'content_admin'), uploadAssignment.single('file'), createAssignment);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), uploadAssignment.single('file'), updateAssignment);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteAssignment);

module.exports = router;
