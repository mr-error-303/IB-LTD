module.exports = (req, res) => {
  res.status(200).json({
    message: 'IB LTD API is working!',
    status: 'success',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: '12.0.0'
  });
};