require('dotenv').config();

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if session has expired (12 hours = 43200000 ms)
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 43200000; // Default to 12 hours
  if ((Date.now() - req.session.lastActivity) > sessionTimeout) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying expired session:', err);
      }
    });
    return res.status(401).json({
      success: false,
      message: 'Session expired'
    });
  }

  // Update last activity
  req.session.lastActivity = Date.now();
  next();
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.session.role !== requiredRole && req.session.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      next();
    });
  };
};

module.exports = { requireAuth, requireRole };