const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting (required for proper IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'development' // Skip rate limiting in development
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection for serverless
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Use in-memory database for serverless
    if (process.env.MONGODB_URI === 'memory') {
      console.log('Using in-memory database for serverless deployment');
      isConnected = true;
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ib-ltd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't throw error in serverless - continue with in-memory fallback
    isConnected = true;
  }
};

// Routes
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/admin/auth', require('../src/routes/adminAuth'));
app.use('/api/admin', require('../src/routes/admin'));
app.use('/api/user', require('../src/routes/user'));
app.use('/api/transactions', require('../src/routes/transaction'));
app.use('/api/beneficiaries', require('../src/routes/beneficiaries'));
app.use('/api/2fa', require('../src/routes/twoFactorAuth'));
app.use('/api', require('../src/routes/api'));

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