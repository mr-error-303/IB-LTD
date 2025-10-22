// Simple Netlify function for admin API
const crypto = require('crypto');

// Helper function to generate secure tokens
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// In-memory storage for demo
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

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/admin-api', '');
    const method = event.httpMethod;
    
    console.log(`Admin API Request: ${method} ${path}`);

    // Health check
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          message: 'IB LTD Admin API is working!',
          timestamp: new Date().toISOString(),
          version: '13.0.0',
          platform: 'Netlify Functions',
          environment: process.env.NODE_ENV || 'production'
        })
      };
    }

    // Admin login
    if (path === '/admin/auth/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { email, password, adminKey } = body;

      // Validate input
      if (!email || !password || !adminKey) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Email, password, and admin key are required'
          })
        };
      }

      if (!isValidEmail(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid email format'
          })
        };
      }

      // Check credentials
      const validCredentials = [
        { email: 'admin@example.com', password: 'admin123', adminKey: 'admin123' },
        { email: 'admin@ibltd.com', password: 'admin123', adminKey: 'admin123' }
      ];

      const isValid = validCredentials.some(cred => 
        cred.email.toLowerCase() === email.toLowerCase() &&
        cred.password === password &&
        cred.adminKey === adminKey
      );

      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          })
        };
      }

      // Generate token
      const token = generateToken();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              email: email.toLowerCase(),
              role: 'admin',
              permissions: ['read', 'write', 'delete', 'admin']
            }
          }
        })
      };
    }

    // Admin dashboard stats
    if (path === '/admin/dashboard/stats' && method === 'GET') {
      const totalUsers = users.length;
      const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
      const totalLoans = loans.length;
      const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            totalUsers,
            totalBalance,
            totalLoans,
            totalLoanAmount,
            activeUsers: users.filter(u => u.status === 'active').length,
            pendingLoans: loans.filter(l => l.status === 'pending').length
          }
        })
      };
    }

    // Get all users
    if (path === '/admin/users' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: users
        })
      };
    }

    // Get all loans
    if (path === '/admin/loans' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: loans
        })
      };
    }

    // 404 for unknown endpoints
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Admin API endpoint not found',
        path,
        method,
        availableEndpoints: [
          'GET /health',
          'POST /admin/auth/login',
          'GET /admin/dashboard/stats',
          'GET /admin/users',
          'GET /admin/loans'
        ]
      })
    };

  } catch (error) {
    console.error('Admin API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    };
  }
};