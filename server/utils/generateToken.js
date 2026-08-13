const jwt = require('jsonwebtoken');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const setTokenCookie = (res, token) => {
  const cookieName = process.env.COOKIE_NAME || 'edumanage_token';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearTokenCookie = (res) => {
  const cookieName = process.env.COOKIE_NAME || 'edumanage_token';
  res.clearCookie(cookieName, { path: '/' });
};

module.exports = { generateToken, setTokenCookie, clearTokenCookie };
