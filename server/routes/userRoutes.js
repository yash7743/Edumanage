const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const {
  getStudents,
  updateStudent,
  getAdmins,
  createAdmin,
  toggleAdminStatus,
  getDashboardStats,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/students', requireAdminRole('super_admin', 'faculty_admin', 'content_admin'), getStudents);
router.put('/students/:id', requireAdminRole('super_admin'), updateStudent);

router.get('/admins', requireAdminRole('super_admin'), getAdmins);
router.post('/admins', requireAdminRole('super_admin'), createAdmin);
router.put('/admins/:id/toggle-status', requireAdminRole('super_admin'), toggleAdminStatus);

router.get('/dashboard/stats', requireAdminRole('super_admin', 'content_admin', 'faculty_admin'), getDashboardStats);

module.exports = router;