module.exports = (req, res) => {
  // Set content type
  res.setHeader('Content-Type', 'application/json');
  
  // Create response data
  const responseData = {
    message: 'IB LTD API is working!',
    status: 'success',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: '12.0.0'
  };
  
  // Send response
  res.statusCode = 200;
  res.end(JSON.stringify(responseData, null, 2));
};