const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getSubmissions,
  createSubmission,
  updateSubmission,
  downloadSubmissionFile,
  viewSubmissionFile,
} = require('../controllers/submissionController');

const router = express.Router();
const uploadSubmission = createUploader('submissions');

router.use(protect);

router.get('/', getSubmissions);
router.get('/:id/view', viewSubmissionFile);
router.get('/:id/download', downloadSubmissionFile);
router.post('/', uploadSubmission.single('file'), createSubmission);

const facultyAdminGuard =
  typeof requireAdminRole === 'function'
    ? requireAdminRole('super_admin', 'faculty_admin')
    : authorize('admin');

router.put('/:id', facultyAdminGuard, updateSubmission);

module.exports = router;