const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting (required for proper IP detection)
app.set('trust proxy', 1);

// Basic security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory database simulation for testing
let isConnected = true;

const connectToDatabase = async () => {
  // For now, just simulate a successful connection
  console.log('Using simplified database connection for serverless deployment');
  return Promise.resolve();
};

// Simplified routes for testing
app.use('/api/auth', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/signup') {
    return res.status(201).json({
      success: true,
      message: 'User registration endpoint (demo)',
      data: { id: 'demo-user-123', email: req.body.email }
    });
  }
  if (req.method === 'POST' && req.path === '/login') {
    return res.status(200).json({
      success: true,
      message: 'User login endpoint (demo)',
      token: 'demo-jwt-token',
      user: { id: 'demo-user-123', email: req.body.email }
    });
  }
  res.status(200).json({
    success: true,
    message: 'Auth endpoints available',
    endpoints: ['/signup', '/login']
  });
});

app.use('/api/admin', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin endpoints (demo)',
    note: 'This is a simplified version for testing'
  });
});

app.use('/api/user', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User endpoints (demo)',
    note: 'This is a simplified version for testing'
  });
});

app.use('/api/transactions', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Transaction endpoints (demo)',
    note: 'This is a simplified version for testing'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'IB LTD Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/api/auth',
      '/api/admin',
      '/api/user',
      '/api/transactions',
      '/api/beneficiaries',
      '/api/2fa'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Serverless function handler
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

// Also export the app for local development
module.exports.app = app;