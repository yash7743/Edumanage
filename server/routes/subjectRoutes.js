const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

const router = express.Router();

router.use(protect);

router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.post('/', requireAdminRole('super_admin', 'content_admin'), createSubject);
router.put('/:id', requireAdminRole('super_admin', 'content_admin'), updateSubject);
router.delete('/:id', requireAdminRole('super_admin', 'content_admin'), deleteSubject);

module.exports = router;
