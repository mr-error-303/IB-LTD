module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from IB LTD Backend!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};