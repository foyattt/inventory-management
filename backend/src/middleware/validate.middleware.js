// backend/src/middleware/validate.middleware.js

const { AppError } = require('./error.middleware');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return next(new AppError('Validation failed', 400, details));
    }

    req.body = value;
    next();
  };
};

module.exports = { validate };