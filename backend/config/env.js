const dotenv = require('dotenv');
const path = require('path');

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Centralized environment configuration.
 * All env vars are accessed through this module for consistency.
 */
const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tasks',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // EmailJS
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
  EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:19006', 'http://localhost', 'capacitor://localhost'],

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = env;
