const express = require('express');
const { protect } = require('../middleware/auth');
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
router.put('/:id', requireAdminRole('super_admin', 'faculty_admin'), updateSubmission);

module.exports = router;