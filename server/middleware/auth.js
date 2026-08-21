const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies JWT from httpOnly cookie OR Authorization Bearer header and attaches req.user
const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check cookies
    const cookieName = process.env.COOKIE_NAME || 'edumanage_token';
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Check Authorization Bearer header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    const secret = process.env.JWT_SECRET || 'edumanage_jwt_secret_fallback_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

// Grant access to specific roles (e.g. authorize('admin', 'faculty_admin'))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    const userRole = req.user.role;
    const adminRole = req.user.adminRole;

    const hasRole = roles.includes(userRole) || (adminRole && roles.includes(adminRole));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is unauthorized to access this route.`,
      });
    }

    next();
  };
};

// Specific helper for Admin only routes
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to administrators only.',
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  adminOnly,
};