const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API routes to the backend, preserving the /api prefix
  app.use(
    createProxyMiddleware('/api', {
      target: 'http://localhost:5001',
      changeOrigin: true,
      // Do not rewrite path; backend expects /api prefix
      // pathRewrite: { '^/api': '' },
    })
  );
};