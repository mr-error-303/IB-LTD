const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection function
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (mongoURI === 'memory') {
      console.log('🔧 Development mode: Using in-memory database');
      console.log('📝 Note: Using in-memory data - changes will not persist');
      
      // Import MongoMemoryServer
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      // Create and start in-memory MongoDB instance
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      // Connect to in-memory MongoDB
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      
      console.log('✅ Connected to in-memory MongoDB');
      return;
    } else {
      // Connect to regular MongoDB
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      console.log('✅ Connected to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing in development mode without database...');
      return;
    }
    process.exit(1);
  }
};


// Connect to database
connectDB();

// Import routes
const authRoutes = require('./backend/src/routes/auth');
const adminAuthRoutes = require('./backend/src/routes/adminAuth');
const userRoutes = require('./backend/src/routes/user');
const transactionRoutes = require('./backend/src/routes/transaction');
const adminRoutes = require('./backend/src/routes/admin');
const beneficiaryRoutes = require('./backend/src/routes/beneficiaries');
const twoFactorAuthRoutes = require('./backend/src/routes/twoFactorAuth');
const { setupWebSocketServer } = require('./backend/src/routes/websocket');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/2fa', twoFactorAuthRoutes);

// Setup WebSocket server
setupWebSocketServer(server);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to IB LTD Backend API',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}/ws/admin`);
});

module.exports = app;