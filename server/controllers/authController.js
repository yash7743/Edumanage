const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/generateToken');

// @route POST /api/auth/register  (students only — admins are created via seed script)
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, studentId, semester } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId,
      semester,
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
// Single, unified login endpoint for BOTH students and all admin sub-roles
// (Super Admin / Content Admin / Faculty Admin). The frontend exposes exactly
// ONE admin login page — role/adminRole is resolved server-side from the
// matched user record, never chosen by the client.
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout
const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

module.exports = { register, login, logout, getMe };
