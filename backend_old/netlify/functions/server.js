const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('../../src/routes/auth');
const loanRoutes = require('../../src/routes/loans');
const userRoutes = require('../../src/routes/users');
const adminRoutes = require('../../src/routes/admin');
const reportRoutes = require('../../src/routes/reports');
const balanceRoutes = require('../../src/routes/balance');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: ['https://international-bank-limited.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'IB LTD Admin Panel API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Netlify Functions'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/balance', balanceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IB LTD Admin Panel API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      loans: '/api/loans',
      users: '/api/users',
      admin: '/api/admin',
      reports: '/api/reports',
      balance: '/api/balance'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports.handler = serverless(app);