const express = require('express');
const { protect, authorize } = require('../middleware/auth');
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
const adminGuard = typeof requireAdminRole === 'function'
  ? requireAdminRole('super_admin', 'content_admin')
  : authorize('admin');

router.post('/', adminGuard, uploadAssignment.single('file'), createAssignment);
router.put('/:id', adminGuard, uploadAssignment.single('file'), updateAssignment);
router.delete('/:id', adminGuard, deleteAssignment);

module.exports = router;