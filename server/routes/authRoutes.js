const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('semester').isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
// Single unified login endpoint used by BOTH the student login page and the
// one admin login page — server resolves role/adminRole, client never sends it.
router.post('/login', loginLimiter, loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
