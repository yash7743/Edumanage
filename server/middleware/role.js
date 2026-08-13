// Restrict to one of the top-level roles: 'student' | 'admin'
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied: insufficient role.' });
  }
  next();
};

// Restrict to specific admin sub-roles, e.g. requireAdminRole('super_admin', 'content_admin')
const requireAdminRole = (...adminRoles) => (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' || !adminRoles.includes(req.user.adminRole)) {
    return res.status(403).json({ success: false, message: 'Access denied: insufficient admin permissions.' });
  }
  next();
};

module.exports = { requireRole, requireAdminRole };
