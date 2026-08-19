const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
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

    // Frontend and backend are on different domains
    sameSite: 'none',

    maxAge: 7 * 24 * 60 * 60 * 1000,

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

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
};