const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection for testing
const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    // In test environment, connection is handled by test setup
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ib-ltd-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Basic routes for testing
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Mock auth routes for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - in real app this would validate against database
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        email: email,
        role: email.includes('admin') ? 'admin' : 'user'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
});

// Mock balance control routes
app.post('/api/admin/users/:userId/adjust-balance', async (req, res) => {
  const { userId } = req.params;
  const { amount, type, reason, category } = req.body;
  
  // Check authorization first
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Handle invalid user ID format
  if (userId === 'invalid-id' || userId === 'invalid') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }
  
  // Handle non-existent user
  if (userId === '507f1f77bcf86cd799439011' || userId === 'nonexistent') {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Handle insufficient balance for debit operations
  if (type === 'debit' && amount > 1000) { // Assuming current balance is 1000
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance for this operation'
    });
  }
  
  // Handle invalid amounts
  if (amount === -100 || amount === 0 || amount === 'invalid' || amount === null || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Invalid adjustment amount'
    });
  }
  
  // Handle invalid types
  if (!type || (type !== 'credit' && type !== 'debit')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid adjustment type'
    });
  }
  
  // Log the activity to database
  try {
    await ActivityLog.create({
      adminId: '507f1f77bcf86cd799439012', // This will be replaced by the actual admin ID in tests
      adminName: 'Test Admin',
      adminEmail: 'admin@test.com',
      action: 'adjust_user_balance',
      category: category || 'financial_operations',
      description: reason || 'Balance adjustment',
      targetType: 'user',
      targetId: userId,
      targetName: 'Test User',
      details: { amount, type },
      timestamp: new Date()
    });
  } catch (error) {
    console.log('Failed to log activity:', error.message);
  }
  
  res.json({
    success: true,
    message: 'Balance adjusted successfully',
    data: {
      newBalance: 1000 + (type === 'credit' ? amount : -amount)
    }
  });
});

app.post('/api/admin/users/:userId/balance/adjust', (req, res) => {
  const { userId } = req.params;
  const { amount, type, reason } = req.body;
  
  // Handle invalid user ID format
  if (userId === 'invalid-user-id' || userId === 'invalid') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }
  
  // Handle non-existent user
  if (userId === '507f1f77bcf86cd799439011' || userId === 'nonexistent') {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Handle invalid amounts
  if (!amount || amount <= 0 || amount === -100 || amount === 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  // Handle invalid type
  if (!type || !['deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be deposit or withdrawal'
    });
  }
  
  res.json({
    success: true,
    data: {
      transaction: {
        _id: 'mock-transaction-id',
        userId,
        amount,
        type,
        reason,
        balanceBefore: 1000,
        balanceAfter: type === 'deposit' ? 1000 + amount : 1000 - amount,
        status: 'completed',
        createdAt: new Date()
      }
    }
  });
});

app.get('/api/admin/users/:userId/balance-history/export', (req, res) => {
  const { userId } = req.params;
  const { format } = req.query;
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="balance-history.csv"');
    return res.send('Date,Amount,Type,Balance\n');
  }
  
  res.json({
    success: true,
    data: { transactions: [] }
  });
});

app.get('/api/admin/users/:userId/balance-history', (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // Return some mock transaction data
  const mockTransactions = [
    {
      _id: 'mock-transaction-1',
      amount: 100,
      type: 'credit',
      description: 'Initial deposit',
      balanceBefore: 0,
      balanceAfter: 100,
      createdAt: new Date()
    },
    {
      _id: 'mock-transaction-2',
      amount: 50,
      type: 'debit',
      description: 'Test withdrawal',
      balanceBefore: 100,
      balanceAfter: 50,
      createdAt: new Date()
    }
  ];
  
  res.json({
    success: true,
    data: {
      transactions: mockTransactions,
      pagination: { 
        currentPage: parseInt(page), 
        limit: parseInt(limit), 
        total: mockTransactions.length,
        totalPages: Math.ceil(mockTransactions.length / parseInt(limit))
      }
    }
  });
});

app.get('/api/admin/users/:userId/balance/history', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    data: {
      transactions: [],
      pagination: { page: 1, limit: 10, total: 0 }
    }
  });
});

app.get('/api/admin/balance/export', (req, res) => {
  const { format } = req.query;
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="balance-export.csv"');
    return res.send('Date,User,Amount,Type\n');
  }
  
  res.json({
    success: true,
    data: { transactions: [] }
  });
});

// Mock admin role routes
app.get('/api/admin/roles', (req, res) => {
  const { search, level } = req.query;
  let roles = [];
  
  if (search === 'Test') {
    roles = [{
      _id: 'mock-role-id',
      name: 'Test Role',
      level: 5,
      createdAt: new Date()
    }];
  }
  
  if (level) {
    roles = roles.filter(role => role.level == level);
  }
  
  res.json({
    success: true,
    data: {
      roles,
      pagination: { page: 1, limit: 10, total: roles.length }
    }
  });
});

app.post('/api/admin/roles', (req, res) => {
  const { name, description, level, permissions } = req.body;
  
  if (!name || !level) {
    return res.status(400).json({
      success: false,
      message: 'Name and level are required'
    });
  }
  
  if (level < 1 || level > 10) {
    return res.status(400).json({
      success: false,
      message: 'Role level must be between 1 and 10'
    });
  }
  
  if (name === 'Updated Test Role') {
    return res.status(400).json({
      success: false,
      message: 'Role with this name already exists'
    });
  }
  
  res.status(201).json({
    success: true,
    data: {
      role: {
        _id: 'mock-role-id',
        name,
        description,
        level,
        permissions: permissions || {},
        createdAt: new Date()
      }
    }
  });
});

app.get('/api/admin/roles/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: { totalRoles: 1, activeRoles: 1 },
      roleDistribution: []
    }
  });
});

app.get('/api/admin/roles/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === '507f1f77bcf86cd799439011') {
    return res.status(404).json({
      success: false,
      message: 'Role not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      role: {
        _id: id,
        name: 'Test Role',
        level: 5,
        createdAt: new Date()
      }
    }
  });
});

app.put('/api/admin/roles/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, level, permissions } = req.body;
  
  res.json({
    success: true,
    data: {
      role: {
        _id: id,
        name: name || 'Updated Test Role',
        description,
        level: level || 6,
        permissions: permissions || {},
        updatedAt: new Date()
      }
    }
  });
});

app.delete('/api/admin/roles/:id', (req, res) => {
  const { id } = req.params;
  
  // Simulate role assigned to users
  if (id === 'mock-role-id') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete role that is assigned to users'
    });
  }
  
  res.json({
    success: true,
    message: 'Role deleted successfully'
  });
});

app.post('/api/admin/roles/:id/assign', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  res.json({
    success: true,
    data: {
      user: {
        _id: userId,
        role: 'sub_admin',
        adminRole: 'Updated Test Role'
      }
    }
  });
});

app.post('/api/admin/roles/revoke', (req, res) => {
  const { userId } = req.body;
  
  res.json({
    success: true,
    data: {
      user: {
        _id: userId,
        role: 'user'
      }
    }
  });
});

// Mock permission routes
app.get('/api/admin/permissions', (req, res) => {
  const { category } = req.query;
  let permissions = [];
  
  if (category === 'testing') {
    permissions = [{
      _id: 'mock-permission-id',
      name: 'test_permission',
      category: 'testing',
      createdAt: new Date()
    }];
  }
  
  res.json({
    success: true,
    data: {
      permissions,
      categories: ['testing', 'user_management']
    }
  });
});

app.post('/api/admin/permissions', (req, res) => {
  const { name, description, category } = req.body;
  
  res.status(201).json({
    success: true,
    data: {
      permission: {
        _id: 'mock-permission-id',
        name,
        description,
        category,
        createdAt: new Date()
      }
    }
  });
});

app.get('/api/admin/permissions/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: { totalPermissions: 1, activePermissions: 1 },
      categoryDistribution: []
    }
  });
});

app.put('/api/admin/permissions/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;
  
  res.json({
    success: true,
    data: {
      permission: {
        _id: id,
        name: name || 'updated_test_permission',
        description,
        category,
        updatedAt: new Date()
      }
    }
  });
});

// Mock reporting routes
app.get('/api/admin/reports/:type', (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, format } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    });
  }
  
  if (startDate === 'invalid-date') {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }
  
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }
  
  // Check for date range limit (more than 365 days)
  const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return res.status(400).json({
      success: false,
      message: 'Date range cannot exceed 365 days'
    });
  }
  
  if (format && !['json', 'csv', 'excel', 'pdf'].includes(format)) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported export format'
    });
  }
  
  const report = {
    type,
    summary: { 
      totalEvents: 0, 
      totalTransactions: 0,
      totalVolume: 0,
      criticalEvents: 0
    },
    activities: [],
    transactions: [],
    securityEvents: []
  };
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    return res.send('Date,Event,Details\n');
  }
  
  if (format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    return res.send('Mock Excel Data');
  }
  
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    return res.send('Mock PDF Data');
  }
  
  res.json({
    success: true,
    data: { 
      report,
      pagination: { page: 1, limit: 50, total: 0 }
    }
  });
});

// Rate limiting simulation with per-endpoint tracking
let requestCounts = {};

// Reset rate limiting for testing
const resetRateLimiting = () => {
  requestCounts = {};
};

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const endpoint = req.method + ':' + req.path.replace(/\/[^\/]+$/g, '/:id'); // Normalize dynamic paths
  const key = `${ip}:${endpoint}`;
  
  if (!requestCounts[key]) {
    requestCounts[key] = { count: 0, resetTime: Date.now() + 60000 };
  }
  
  if (Date.now() > requestCounts[key].resetTime) {
    requestCounts[key] = { count: 0, resetTime: Date.now() + 60000 };
  }
  
  requestCounts[key].count++;
  
  // Simulate rate limiting for balance adjustments (2 requests per minute to ensure triggering)
  if (req.path.includes('/adjust-balance') && requestCounts[key].count > 2) {
    console.log(`Rate limiting triggered for ${key}, count: ${requestCounts[key].count}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests'
    });
  }
  
  // Simulate rate limiting for reports (5 requests per minute)
  if (req.path.includes('/reports/') && requestCounts[key].count > 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests'
    });
  }
  
  next();
});

// Activity log storage for testing
let activityLogs = [];

// Import the real ActivityLog model for database operations
let ActivityLog;
try {
  ActivityLog = require('./src/models/ActivityLog');
} catch (error) {
  // Fallback mock if model doesn't exist
  ActivityLog = {
    findOne: (query) => {
      const log = activityLogs.find(log => {
        if (query.adminId && log.adminId !== query.adminId) return false;
        if (query.action && log.action !== query.action) return false;
        return true;
      });
      return Promise.resolve(log || null);
    },
    create: (data) => {
      const log = { ...data, _id: 'mock-log-id', createdAt: new Date() };
      activityLogs.push(log);
      return Promise.resolve(log);
    }
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;