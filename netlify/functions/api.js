const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'IB LTD API is working!',
    timestamp: new Date().toISOString(),
    version: '12.0.0',
    platform: 'Netlify'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - replace with real authentication logic
  if (email === 'admin@example.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User'
      }
    });
  } else if (email === 'user@example.com' && password === 'user123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'user',
        name: 'Regular User'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Admin auth routes
app.post('/api/admin/auth/login', (req, res) => {
  const { email, password, adminKey } = req.body;
  
  // Mock admin authentication with admin key validation
  const validAdminCredentials = [
    { email: 'admin@example.com', password: 'admin123', adminKey: 'admin123' },
    { email: 'admin@ibltd.com', password: 'admin123', adminKey: 'admin123' },
    { email: 'admin', password: 'admin123', adminKey: 'admin123' }
  ];

  // Normalize email input (trim whitespace and convert to lowercase)
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const normalizedPassword = password ? password.trim() : '';
  const normalizedAdminKey = adminKey ? adminKey.trim() : '';

  console.log('Admin login attempt:', { 
    originalEmail: email, 
    normalizedEmail, 
    password: normalizedPassword, 
    adminKey: normalizedAdminKey 
  });

  console.log('Valid credentials array:', validAdminCredentials.map(admin => ({
    email: admin.email,
    emailLower: admin.email.toLowerCase(),
    password: admin.password,
    adminKey: admin.adminKey
  })));

  const isValidAdmin = validAdminCredentials.some((admin, index) => {
    const emailMatch = admin.email.toLowerCase() === normalizedEmail;
    const passwordMatch = admin.password === normalizedPassword;
    const adminKeyMatch = admin.adminKey === normalizedAdminKey;
    
    console.log(`Credential ${index} check:`, {
      adminEmail: admin.email,
      adminEmailLower: admin.email.toLowerCase(),
      normalizedEmail,
      emailMatch,
      passwordMatch,
      adminKeyMatch,
      allMatch: emailMatch && passwordMatch && adminKeyMatch
    });
    
    return emailMatch && passwordMatch && adminKeyMatch;
  });

  console.log('Final validation result:', isValidAdmin);

  if (isValidAdmin) {
    res.json({
      success: true,
      message: 'Admin login successful',
      token: 'mock-admin-jwt-token',
      user: {
        id: 1,
        email: email,
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

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports.handler = serverless(app);