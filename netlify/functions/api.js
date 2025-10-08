// Simple Netlify function without Express
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

  const path = event.path;
  const method = event.httpMethod;

  console.log(`API Request: ${method} ${path}`);

  // Health check endpoints
  if (path === '/health' || path === '/api/health' || path === '/') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'OK',
        message: 'IB LTD API is working!',
        timestamp: new Date().toISOString(),
        version: '12.0.0',
        platform: 'Netlify',
        path: path,
        method: method
      })
    };
  }

  // Admin login endpoint
  if (path === '/api/admin/auth/login' && method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { email, password, adminKey } = body;

      console.log('Admin login attempt:', { email, adminKey });

      // Normalize inputs
      const normalizedEmail = email ? email.toLowerCase().trim() : '';
      const normalizedPassword = password ? password.trim() : '';
      const normalizedAdminKey = adminKey ? adminKey.trim() : '';

      console.log('Normalized inputs:', { 
        email: normalizedEmail, 
        password: normalizedPassword ? '[PROVIDED]' : '[MISSING]',
        adminKey: normalizedAdminKey ? '[PROVIDED]' : '[MISSING]'
      });

      // Valid admin credentials
      const validCredentials = [
        { email: 'admin@example.com', password: 'admin123', adminKey: 'admin123' },
        { email: 'admin@ibltd.com', password: 'admin123', adminKey: 'admin123' }
      ];

      // Check credentials
      const isValid = validCredentials.some(cred => 
        cred.email === normalizedEmail && 
        cred.password === normalizedPassword && 
        cred.adminKey === normalizedAdminKey
      );

      console.log('Credential validation result:', isValid);
      console.log('Checking against credentials:', validCredentials);

      if (isValid) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Admin login successful',
            token: 'mock-admin-jwt-token-' + Date.now(),
            user: {
              id: 1,
              email: normalizedEmail,
              role: 'admin',
              name: 'Admin User'
            }
          })
        };
      } else {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid admin credentials',
            debug: {
              provided: { email: normalizedEmail, password: normalizedPassword ? '[PROVIDED]' : '[MISSING]', adminKey: normalizedAdminKey ? '[PROVIDED]' : '[MISSING]' },
              expected: validCredentials
            }
          })
        };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      };
    }
  }

  // Test credentials endpoint
  if (path === '/api/admin/test-credentials' && method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { email, adminKey } = body;

      const normalizedEmail = email ? email.toLowerCase().trim() : '';
      const normalizedAdminKey = adminKey ? adminKey.trim() : '';

      const validCredentials = [
        { email: 'admin@example.com', adminKey: 'admin123' },
        { email: 'admin@ibltd.com', adminKey: 'admin123' }
      ];

      const matchingCred = validCredentials.find(cred => 
        cred.email === normalizedEmail && cred.adminKey === normalizedAdminKey
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          inputEmail: email,
          inputAdminKey: adminKey,
          normalizedEmail,
          normalizedAdminKey,
          validCredentials,
          matchFound: !!matchingCred,
          matchingCredential: matchingCred || null
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // Default 404 response
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      error: 'Not Found',
      path: path,
      method: method,
      message: 'API endpoint not found'
    })
  };
};