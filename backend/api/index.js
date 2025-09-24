// Minimal serverless function for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle different routes
  const { url, method } = req;
  
  try {
    // Root endpoint
    if (url === '/' || url === '') {
      return res.status(200).json({
        message: 'IB LTD Backend API - Minimal Version',
        status: 'running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }
    
    // Health check
    if (url === '/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }
    
    // API endpoints
    if (url.startsWith('/api/')) {
      return res.status(200).json({
        success: true,
        message: 'API endpoint reached',
        path: url,
        method: method,
        timestamp: new Date().toISOString()
      });
    }
    
    // 404 for other routes
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      path: url
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};