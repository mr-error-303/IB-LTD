const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dbConfig = require('./src/config/database');
require('dotenv').config({ path: '../.env' });

// Log counter to track total logs
let logCounter = 0;
const logWithCounter = (message) => {
  logCounter++;
  console.log(`[LOG #${logCounter}] ${message}`);
};

logWithCounter('🚀 Starting IB LTD Backend Server...');
logWithCounter(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

const app = express();

// Trust proxy for rate limiting (required for proper IP detection)
app.set('trust proxy', 1);

// Custom logging middleware for debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logWithCounter(`\n=== HTTP REQUEST LOG ===`);
  logWithCounter(`📥 ${timestamp} - ${req.method} ${req.url}`);
  logWithCounter(`🌐 IP: ${req.ip || req.connection.remoteAddress}`);
  logWithCounter(`📋 Headers: ${JSON.stringify(req.headers, null, 2)}`);
  if (req.body && Object.keys(req.body).length > 0) {
    logWithCounter(`📦 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  logWithCounter(`========================\n`);
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    logWithCounter(`\n=== HTTP RESPONSE LOG ===`);
    logWithCounter(`📤 ${timestamp} - ${req.method} ${req.url} - Status: ${res.statusCode}`);
    logWithCounter(`📊 Response Length: ${data ? data.length : 0} bytes`);
    logWithCounter(`=========================\n`);
    originalSend.call(this, data);
  };
  
  next();
});

// Logging middleware - detailed format for development
if (process.env.NODE_ENV === 'development') {
  logWithCounter('🔧 Setting up Morgan logging in development mode');
  app.use(morgan('combined'));
} else {
  logWithCounter('🔧 Setting up Morgan logging in production mode');
  app.use(morgan('common'));
}

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

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin/auth', require('./src/routes/adminAuth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/user', require('./src/routes/user'));
app.use('/api/transactions', require('./src/routes/transaction'));
app.use('/api/beneficiaries', require('./src/routes/beneficiaries'));
app.use('/api/2fa', require('./src/routes/twoFactorAuth'));
app.use('/api', require('./src/routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
logWithCounter(`🌐 Server will start on port: ${PORT}`);

// Database connection and server startup
const startServer = async () => {
  try {
    logWithCounter('🔌 Attempting to connect to database...');
    // First, connect to database
    await dbConfig.connect();
    logWithCounter('✅ Database connected successfully');
    
    logWithCounter('🚀 Starting HTTP server...');
    // Then start the server
    const server = app.listen(PORT, () => {
      logWithCounter(`✅ Server running on port ${PORT}`);
      logWithCounter(`🌍 Server URL: http://localhost:${PORT}`);
      logWithCounter('📝 Morgan logging is active - HTTP requests will be logged');
      logWithCounter(`🎯 TOTAL LOGS SO FAR: ${logCounter}`);
    });

    logWithCounter('🔌 Initializing WebSocket services...');
    // Finally, initialize WebSocket server after database is connected
    const websocketService = require('./src/services/websocketService');
    websocketService.initialize(server);
    logWithCounter('✅ WebSocket server initialized');
    logWithCounter('🎉 Backend server fully initialized and ready!');
    logWithCounter(`🏁 FINAL STARTUP LOG COUNT: ${logCounter}`);
    
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  console.log('🏁 Starting server (not in test mode)...');
  startServer();
} else {
  console.log('🧪 Test mode detected - server not started automatically');
}

module.exports = app;