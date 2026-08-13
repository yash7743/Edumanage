const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole, requireAdminRole } = require('../middleware/role');
const { createUploader } = require('../middleware/upload');
const {
  getSubmissions,
  createSubmission,
  updateSubmission,
  downloadSubmissionFile,
} = require('../controllers/submissionController');

const router = express.Router();
const uploadSubmission = createUploader('submissions');

router.use(protect);

router.get('/', getSubmissions);
router.get('/:id/download', downloadSubmissionFile);
router.post('/', requireRole('student'), uploadSubmission.single('file'), createSubmission);
router.put('/:id', requireAdminRole('super_admin', 'faculty_admin'), updateSubmission);

module.exports = router;
