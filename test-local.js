const http = require('http');
const url = require('url');

// Import our API function
const apiHandler = require('./index.js');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  // Use our API handler
  apiHandler(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});