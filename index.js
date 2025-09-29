// Railway/Heroku compatible server setup
const http = require('http');
const PORT = process.env.PORT || 3000;

const handler = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // API response data
  const responseData = {
    message: "IB LTD API is working!",
    status: "success",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: "12.0.0",
    platform: "Railway"
  };

  // Send JSON response
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(responseData, null, 2));
};

// For serverless environments (Vercel)
module.exports = handler;

// For Railway/Heroku (when run directly)
if (require.main === module) {
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`🚀 IB LTD API Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/`);
  });
}