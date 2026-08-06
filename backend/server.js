const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const startReminderJob = require('./utils/reminderJob');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ── Security ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────────
if (!env.isTest) {
  app.use(morgan(env.isDev ? 'dev' : 'combined'));
}

// ── Rate limiting ────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Task API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Error handler ────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    if (!env.isTest) {
      await connectDB();
    }

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`   Health: http://localhost:${env.PORT}/api/health\n`);
    });

    // Start reminder cron job (only in non-test mode)
    if (!env.isTest) {
      startReminderJob();
    }

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start if this is the main module (not imported for testing)
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };
