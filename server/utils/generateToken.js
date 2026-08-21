const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'edumanage_jwt_secret_fallback_key';
  return jwt.sign(
    { id: userId },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const setTokenCookie = (res, token) => {
  const cookieName = process.env.COOKIE_NAME || 'edumanage_token';

  res.cookie(cookieName, token, {
    httpOnly: true,
    // Render uses HTTPS
    secure: true,
    // Frontend and backend cross-domain communication
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearTokenCookie = (res) => {
  const cookieName = process.env.COOKIE_NAME || 'edumanage_token';

  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
};

// Allows both `const generateToken = require(...)` and `const { generateToken } = require(...)`
module.exports = generateToken;
module.exports.generateToken = generateToken;
module.exports.setTokenCookie = setTokenCookie;
module.exports.clearTokenCookie = clearTokenCookie;