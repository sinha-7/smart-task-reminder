const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { suggestPriority } = require('../controllers/aiController');

const router = express.Router();

// All AI routes require authentication
router.use(auth);

/**
 * POST /api/ai/suggest-priority
 */
router.post(
  '/suggest-priority',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required for AI suggestion'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    validate,
  ],
  suggestPriority
);

module.exports = router;
