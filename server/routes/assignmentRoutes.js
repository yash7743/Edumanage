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
  viewAssignmentFile,
} = require('../controllers/assignmentController');

const router = express.Router();
const uploadAssignment = createUploader('assignments');

// Require authentication for all assignment routes
router.use(protect);

// Routes accessible to both Students and Admins
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.get('/:id/view', viewAssignmentFile);
router.get('/:id/download', downloadAssignmentFile);

// Admin-only management routes
router.post('/', requireAdminRole('super_admin', 'content_admin'), uploadAssignment.single('file'), createAssignment);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), uploadAssignment.single('file'), updateAssignment);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteAssignment);

module.exports = router;