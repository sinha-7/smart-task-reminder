const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(auth);

/**
 * GET /api/tasks/stats — must be before /:id to avoid matching "stats" as an id
 */
router.get('/stats', getStats);

/**
 * GET /api/tasks
 * Query params: search, category, priority, completed, sortBy, order, page, limit
 */
router.get('/', getTasks);

/**
 * POST /api/tasks
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('dueDate')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('reminderAt')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Reminder date must be a valid date'),
    validate,
  ],
  createTask
);

/**
 * GET /api/tasks/:id
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    validate,
  ],
  getTask
);

/**
 * PUT /api/tasks/:id
 */
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('dueDate')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Completed must be a boolean'),
    body('reminderAt')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Reminder date must be a valid date'),
    validate,
  ],
  updateTask
);

/**
 * DELETE /api/tasks/:id
 */
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    validate,
  ],
  deleteTask
);

module.exports = router;
