const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    try {
      console.log('Auth middleware - Token received:', token.substring(0, 50) + '...');
      console.log('Auth middleware - Environment check:', {
        MONGODB_URI: process.env.MONGODB_URI,
        isDevelopment: process.env.MONGODB_URI === 'memory' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017')
      });
      
      // Check if we're in development mode without database first
      if (process.env.MONGODB_URI === 'memory' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017')) {
        // Development mode - allow demo tokens and create user object
        if (token.includes('demo-token') || token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
          // Decode the token to get the role
          const jwt = require('jsonwebtoken');
          try {
            const decoded = jwt.decode(token);
            const userRole = decoded && decoded.role ? decoded.role : 'user';
            
            // Create demo user object with proper role
            req.user = {
              id: decoded && decoded.userId ? decoded.userId : '507f1f77bcf86cd799439011',
              name: userRole === 'admin' ? 'Demo Admin' : 'Demo User',
              email: userRole === 'admin' ? 'admin@ibltd.com' : 'demo@example.com',
              role: userRole,
              isActive: true,
              createdAt: new Date()
            };
            
            console.log('Auth middleware - Development mode user:', {
              id: req.user.id,
              email: req.user.email,
              role: req.user.role
            });
            
            return next();
          } catch (decodeError) {
            console.error('Token decode error in dev mode:', decodeError);
            // Fallback to regular user
            req.user = {
              id: '507f1f77bcf86cd799439011',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'user',
              isActive: true,
              createdAt: new Date()
            };
            return next();
          }
        }
      }
      
      // Verify token for production mode
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      
      // Get user from token (check both 'id' and 'userId' for compatibility)
      const userId = decoded.id || decoded.userId;
      
      // In development mode, if token contains role, use it directly
      if (process.env.NODE_ENV === 'development' && decoded.role) {
        req.user = {
          id: userId,
          role: decoded.role
        };
        console.log('Auth middleware - Using token role:', decoded.role);
        return next();
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized. User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Add user to request object
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };
      
      console.log('Auth middleware - User authenticated:', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      });

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized. Token has expired.'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized. Invalid token.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token verification failed.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Optional auth - doesn't fail if no token, but adds user if token exists
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      
      // Get user from token (check both 'id' and 'userId' for compatibility)
      const userId = decoded.id || decoded.userId;
      const user = await User.findById(userId);
      
      if (user && user.isActive) {
        // Add user to request object
        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        };
      }
    } catch (error) {
      // If token is invalid, just continue without user
      console.log('Optional auth - invalid token:', error.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Don't fail the request, just continue without user
    next();
  }
};

// Check if user owns the resource (for user-specific routes)
const checkOwnership = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource user ID from request params, body, or query
      let resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] || 
                          req.query[resourceUserIdField];

      // If not found in standard places, try to get from the resource itself
      if (!resourceUserId && req.params.id) {
        // This would need to be customized based on your specific models
        // For now, we'll assume the resource ID is the user ID
        resourceUserId = req.params.id;
      }

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: 'Resource user ID not found'
        });
      }

      // Check if the authenticated user owns the resource
      if (req.user.id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in ownership verification'
      });
    }
  };
};

// Rate limiting middleware (basic implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }

    // Get current requests for this IP
    const currentRequests = requests.get(key) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    currentRequests.push(now);
    requests.set(key, currentRequests);

    next();
  };
};

module.exports = {
  auth: protect,
  protect,
  authMiddleware: protect,
  adminMiddleware: authorize(['admin']),
  authorize,
  optionalAuth,
  checkOwnership,
  rateLimit
};