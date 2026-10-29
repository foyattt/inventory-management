// backend/src/middleware/role.middleware.js

const { AppError } = require('./error.middleware');

/**
 * Restrict access to specific roles
 * Usage: authorize('ADMIN', 'MANAGER')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};