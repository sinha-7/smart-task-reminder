const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { suggestPriority, parseTask, dailyPlan, weeklyReview } = require('../controllers/aiController');

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

/**
 * POST /api/ai/parse-task
 */
router.post(
  '/parse-task',
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Text input is required to parse'),
    validate,
  ],
  parseTask
);

/**
 * GET /api/ai/daily-plan
 */
router.get('/daily-plan', dailyPlan);

/**
 * GET /api/ai/weekly-review
 */
router.get('/weekly-review', weeklyReview);

module.exports = router;
