const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  saveFcmToken,
} = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/signup
 */
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validate,
  ],
  signup
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

/**
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validate,
  ],
  forgotPassword
);

/**
 * POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validate,
  ],
  resetPassword
);

/**
 * POST /api/auth/fcm-token
 */
router.post('/fcm-token', protect, saveFcmToken);

module.exports = router;
