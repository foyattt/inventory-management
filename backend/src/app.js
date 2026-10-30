// backend/src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Config & Error Handling
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Route Imports

// Authentication (login, register, profile)
const authRoutes = require('./modules/auth/auth.routes');

// User management (list users, update role, change password)
const userRoutes = require('./modules/users/users.routes');

// Inventory & Stock (products, stock sources, movements, adjustments)
const inventoryRoutes = require('./modules/inventory/inventory.routes');

// Point of Sale (create transactions, Gate Pass + Invoice)
const posRoutes = require('./modules/pos/pos.routes');

// Customer management
const customerRoutes = require('./modules/customers/customers.routes');

// Credit & Payments
const creditRoutes = require('./modules/credit/credit.routes');

// Reconciliation (compare Gate Pass vs Invoice)
const reconciliationRoutes = require('./modules/reconciliation/reconciliation.routes');

// System settings (tax rate, thresholds, etc.)
const settingsRoutes = require('./modules/settings/settings.routes');

// App Initialization

const app = express();

// Global Middleware

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (!env.isProduction) {
  app.use(morgan('dev'));          // Detailed logs in development
} else {
  app.use(morgan('combined'));     // Standard logs in production
}
// Health Check

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ze-Sino Inventory API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// API Routes

app.use('/api/auth', authRoutes);                 // /api/auth/login, /register, /me
app.use('/api/users', userRoutes);                // /api/users
app.use('/api/inventory', inventoryRoutes);       // /api/inventory/products, /stock-sources, ...
app.use('/api/pos', posRoutes);                   // /api/pos/transactions
app.use('/api/customers', customerRoutes);        // /api/customers
app.use('/api/credit', creditRoutes);             // /api/credit, /payments
app.use('/api/reconciliation', reconciliationRoutes); // /api/reconciliation
app.use('/api/settings', settingsRoutes);         // /api/settings


// 404 & Global Error Handlers


// Handle undefined routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

// Export App


module.exports = app;