const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Admin middleware to check if the authenticated user has admin role
 * This middleware should be used after the auth middleware
 */
const adminMiddleware = async (req, res, next) => {
  try {
    console.log('=== ADMIN MIDDLEWARE DEBUG ===');
    console.log('Admin middleware - req.user:', JSON.stringify(req.user, null, 2));
    console.log('Admin middleware - typeof req.user:', typeof req.user);
    console.log('Admin middleware - req.user exists:', !!req.user);
    
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      console.log('Admin middleware - FAILED: No user object');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log('Admin middleware - User role:', req.user.role);
    console.log('Admin middleware - Role type:', typeof req.user.role);
    console.log('Admin middleware - Role comparison result:', req.user.role === 'admin');

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      console.log('Admin middleware - FAILED: Role is not admin, role is:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log('Admin middleware - SUCCESS: Access granted');
    console.log('=== END ADMIN MIDDLEWARE DEBUG ===');
    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authorization'
    });
  }
};

/**
 * Combined auth and admin middleware for convenience
 * This can be used as a single middleware instead of chaining auth + admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (check both 'id' and 'userId' for compatibility)
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = {
  admin: adminMiddleware,
  adminMiddleware,
  requireAdmin
};