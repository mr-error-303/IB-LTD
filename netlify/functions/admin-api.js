const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

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
app.use('/admin-api/', limiter);

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

// Mock data for admin panel
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', balance: 50000 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', balance: 75000 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending', balance: 25000 }
];

const mockLoans = [
  { id: 1, userId: 1, amount: 100000, status: 'approved', type: 'personal', interestRate: 12.5 },
  { id: 2, userId: 2, amount: 250000, status: 'pending', type: 'home', interestRate: 8.5 },
  { id: 3, userId: 3, amount: 50000, status: 'rejected', type: 'business', interestRate: 15.0 }
];

// Admin authentication
app.post('/admin-api/auth/login', (req, res) => {
  const { email, password, adminKey } = req.body;
  
  // Simple admin authentication
  if (email === 'admin@iblimited.com' && password === 'admin123' && adminKey === 'ADMIN2024') {
    res.json({
      success: true,
      token: 'admin-jwt-token-' + Date.now(),
      user: {
        id: 'admin',
        email: 'admin@iblimited.com',
        role: 'admin',
        name: 'Admin User'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }
});

// Admin dashboard stats
app.get('/admin-api/dashboard/stats', (req, res) => {
  res.json({
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    totalLoans: mockLoans.length,
    approvedLoans: mockLoans.filter(l => l.status === 'approved').length,
    pendingLoans: mockLoans.filter(l => l.status === 'pending').length,
    totalLoanAmount: mockLoans.reduce((sum, loan) => sum + loan.amount, 0),
    totalBalance: mockUsers.reduce((sum, user) => sum + user.balance, 0)
  });
});

// User management
app.get('/admin-api/users', (req, res) => {
  res.json({
    success: true,
    users: mockUsers
  });
});

app.get('/admin-api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Loan management
app.get('/admin-api/loans', (req, res) => {
  res.json({
    success: true,
    loans: mockLoans.map(loan => ({
      ...loan,
      user: mockUsers.find(u => u.id === loan.userId)
    }))
  });
});

app.put('/admin-api/loans/:id/status', (req, res) => {
  const loanId = parseInt(req.params.id);
  const { status } = req.body;
  const loan = mockLoans.find(l => l.id === loanId);
  
  if (loan) {
    loan.status = status;
    res.json({
      success: true,
      message: `Loan ${status} successfully`,
      loan
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Loan not found'
    });
  }
});

// Reports
app.get('/admin-api/reports/loans', (req, res) => {
  const { startDate, endDate, status } = req.query;
  let filteredLoans = mockLoans;
  
  if (status && status !== 'all') {
    filteredLoans = filteredLoans.filter(loan => loan.status === status);
  }
  
  res.json({
    success: true,
    loans: filteredLoans,
    summary: {
      total: filteredLoans.length,
      totalAmount: filteredLoans.reduce((sum, loan) => sum + loan.amount, 0),
      averageAmount: filteredLoans.length > 0 ? filteredLoans.reduce((sum, loan) => sum + loan.amount, 0) / filteredLoans.length : 0
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IB LTD Admin Panel API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/admin-api/auth',
      dashboard: '/admin-api/dashboard',
      users: '/admin-api/users',
      loans: '/admin-api/loans',
      reports: '/admin-api/reports'
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
    message: `Admin API route ${req.originalUrl} not found`
  });
});

exports.handler = serverless(app);