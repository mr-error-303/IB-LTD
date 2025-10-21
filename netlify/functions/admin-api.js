const serverless = require('serverless-http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://international-bank-limited.netlify.app', 'https://ibltd.netlify.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Enhanced logging
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400 // Only log errors in production
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory storage for demo (replace with database in production)
let users = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    accountNumber: '1001234567',
    balance: 15000,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    accountNumber: '1001234568',
    balance: 25000,
    status: 'active',
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

let loans = [
  {
    id: 1,
    userId: 1,
    amount: 50000,
    type: 'Personal Loan',
    status: 'approved',
    interestRate: 12.5,
    term: 24,
    monthlyPayment: 2500,
    remainingBalance: 45000,
    nextPaymentDate: '2024-02-15',
    createdAt: '2024-01-15T00:00:00.000Z'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'IB LTD Admin API is working!',
    timestamp: new Date().toISOString(),
    version: '13.0.0',
    platform: 'Netlify Functions',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Enhanced admin authentication endpoint
app.post('/admin/auth/login', async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    // Input validation
    if (!email || !password || !adminKey) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and admin key are required'
      });
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();
    const normalizedAdminKey = adminKey.trim();

    // Valid admin credentials (in production, use environment variables)
    const validCredentials = [
      { 
        email: 'admin@example.com', 
        password: 'admin123', 
        adminKey: 'admin123',
        name: 'System Administrator'
      },
      { 
        email: 'admin@ibltd.com', 
        password: 'admin123', 
        adminKey: 'admin123',
        name: 'Bank Administrator'
      }
    ];

    // Authenticate
    const admin = validCredentials.find(cred => 
      cred.email === normalizedEmail && 
      cred.password === normalizedPassword && 
      cred.adminKey === normalizedAdminKey
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate token (in production, use JWT)
    const token = `admin-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: 1,
        email: normalizedEmail,
        role: 'admin',
        name: admin.name,
        permissions: ['users:read', 'users:write', 'loans:read', 'loans:write', 'reports:read']
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
});

// Enhanced dashboard statistics endpoint
app.get('/admin/dashboard/stats', (req, res) => {
  try {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const totalLoans = loans.length;
    const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoanAmount = loans
      .filter(loan => loan.status === 'approved')
      .reduce((sum, loan) => sum + loan.remainingBalance, 0);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          growth: '+12%' // Mock growth data
        },
        accounts: {
          total: totalUsers,
          totalBalance: totalBalance,
          averageBalance: totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0
        },
        loans: {
          total: totalLoans,
          totalAmount: totalLoanAmount,
          activeAmount: activeLoanAmount,
          defaultRate: '2.1%' // Mock default rate
        },
        transactions: {
          today: 45, // Mock data
          thisMonth: 1250,
          volume: 2500000
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Enhanced user management endpoints
app.get('/admin/users', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    let filteredUsers = users;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.accountNumber.includes(search)
      );
    }
    
    // Apply status filter
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalUsers: filteredUsers.length,
          hasNext: endIndex < filteredUsers.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Enhanced loan management endpoints
app.get('/admin/loans', (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', type = '' } = req.query;
    
    let filteredLoans = loans.map(loan => {
      const user = users.find(u => u.id === loan.userId);
      return {
        ...loan,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userEmail: user ? user.email : 'Unknown Email'
      };
    });
    
    // Apply filters
    if (status) {
      filteredLoans = filteredLoans.filter(loan => loan.status === status);
    }
    
    if (type) {
      filteredLoans = filteredLoans.filter(loan => loan.type === type);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLoans = filteredLoans.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        loans: paginatedLoans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredLoans.length / limit),
          totalLoans: filteredLoans.length,
          hasNext: endIndex < filteredLoans.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans'
    });
  }
});

// Enhanced loan reports endpoint
app.get('/admin/loans/reports', (req, res) => {
  try {
    const { startDate, endDate, type = 'summary' } = req.query;
    
    let reportData = {};
    
    if (type === 'summary') {
      reportData = {
        totalLoans: loans.length,
        totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
        averageLoanAmount: loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.amount, 0) / loans.length : 0,
        loansByStatus: {
          approved: loans.filter(l => l.status === 'approved').length,
          pending: loans.filter(l => l.status === 'pending').length,
          rejected: loans.filter(l => l.status === 'rejected').length
        },
        loansByType: loans.reduce((acc, loan) => {
          acc[loan.type] = (acc[loan.type] || 0) + 1;
          return acc;
        }, {})
      };
    }
    
    res.json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString(),
      reportType: type
    });
  } catch (error) {
    console.error('Loan reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating loan reports'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Admin API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'POST /admin/auth/login',
      'GET /admin/dashboard/stats',
      'GET /admin/users',
      'GET /admin/loans',
      'GET /admin/loans/reports'
    ]
  });
});

module.exports.handler = serverless(app);