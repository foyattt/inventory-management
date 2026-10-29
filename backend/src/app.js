// backend/src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// ───── Import Routes ─────
const authRoutes = require('./modules/auth/auth.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const posRoutes = require('./modules/pos/pos.routes');
const customerRoutes = require('./modules/customers/customers.routes');
const creditRoutes = require('./modules/credit/credit.routes');
const reconciliationRoutes = require('./modules/reconciliation/reconciliation.routes');

const app = express();

// ───── Security & Basic Middleware ─────
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (!env.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ───── Health Check ─────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ze-Sino Inventory API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// ───── API Routes ─────
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/reconciliation', reconciliationRoutes);

// ───── 404 & Error Handlers ─────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;