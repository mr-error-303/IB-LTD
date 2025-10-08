module.exports = (req, res) => {
  res.status(200).json({
    message: 'IB LTD Backend API Working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: '1.0.0'
  });
};