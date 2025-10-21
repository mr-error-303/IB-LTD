// Enhanced Netlify function with better error handling and performance
const crypto = require('crypto');

// In-memory storage for demo purposes
let users = [];
let transactions = [];
let loanApplications = [];

// Helper function to generate secure tokens
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to hash passwords (simplified for demo)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to generate account number
const generateAccountNumber = () => {
  return '1001' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
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
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;
    
    console.log(`API Request: ${method} ${path}`);

    // Health check endpoints
    if (path === '/health' || path === '/' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          message: 'IB LTD API is working!',
          timestamp: new Date().toISOString(),
          version: '13.0.0',
          platform: 'Netlify Functions',
          path: path,
          method: method,
          environment: process.env.NODE_ENV || 'production'
        })
      };
    }

    // User registration endpoint
    if (path === '/register' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { firstName, lastName, email, password, phone, dateOfBirth, address } = body;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields'
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

      // Check if user already exists
      const existingUser = users.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'User already exists'
          })
        };
      }

      // Create new user
      const newUser = {
        id: users.length + 1,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashPassword(password),
        phone,
        dateOfBirth,
        address,
        accountNumber: generateAccountNumber(),
        balance: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            accountNumber: newUser.accountNumber,
            status: newUser.status
          }
        })
      };
    }

    // User login endpoint
    if (path === '/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Email and password are required'
          })
        };
      }

      const user = users.find(u => 
        u.email === email.toLowerCase() && 
        u.password === hashPassword(password)
      );

      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: generateToken(),
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountNumber: user.accountNumber,
            balance: user.balance,
            status: user.status
          }
        })
      };
    }

    // Admin authentication endpoint
    if (path === '/admin/auth/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { email, password, adminKey } = body;

      // Input validation
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
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid admin credentials'
          })
        };
      }

      // Generate token (in production, use JWT)
      const token = `admin-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
      };
    }

    // Get user profile endpoint
    if (path === '/profile' && method === 'GET') {
      // Mock user data for demo
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            accountNumber: '1001234567',
            balance: 15000,
            status: 'active'
          }
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Endpoint not found',
        path: path,
        method: method,
        availableEndpoints: [
          'GET /health',
          'POST /admin/auth/login',
          'POST /register',
          'POST /login',
          'GET /profile'
        ]
      })
    };

  } catch (error) {
    console.error('API Error:', error);
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