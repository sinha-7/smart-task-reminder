const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator validation results.
 * If there are errors, returns 400 with the first error message.
 * Use after validation chain arrays in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
