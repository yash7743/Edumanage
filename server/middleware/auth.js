const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies JWT from httpOnly cookie and attaches req.user
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'edumanage_token'];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
};

module.exports = { protect };
