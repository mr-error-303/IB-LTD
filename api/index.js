module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple API response
  res.status(200).json({
    success: true,
    message: 'IB LTD API is working! (API folder structure)',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: '5.0.0',
    deployment: 'api-folder'
  });
};