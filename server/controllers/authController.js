const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/generateToken');

// @desc    Register a new Student
// @route   POST /api/auth/register (or /api/register)
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, semester } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    if (studentId) {
      const idExists = await User.findOne({ studentId: studentId.trim() });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already in use.',
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId: studentId ? studentId.trim() : undefined,
      semester: semester ? Number(semester) : undefined,
    });

    const token = generateToken(user._id);
    if (typeof setTokenCookie === 'function') {
      setTokenCookie(res, token);
    }

    const userObject = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();

    res.status(201).json({
      success: true,
      data: {
        ...userObject,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login User (Student or Admin)
// @route   POST /api/auth/login (or /api/login)
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Select password explicitly since select: false is configured in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = generateToken(user._id);
    if (typeof setTokenCookie === 'function') {
      setTokenCookie(res, token);
    }

    const userObject = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();

    res.json({
      success: true,
      data: {
        ...userObject,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current Logged-in User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userObject = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();

    res.json({
      success: true,
      data: userObject,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  if (typeof clearTokenCookie === 'function') {
    clearTokenCookie(res);
  } else {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};