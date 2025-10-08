const { IPWhitelist, ActivityLog } = require('../models');

/**
 * Middleware to check if the client IP is whitelisted for admin access
 * @param {Object} options - Configuration options
 * @param {boolean} options.enforceForAll - Whether to enforce for all admin users (default: false)
 * @param {boolean} options.logAttempts - Whether to log access attempts (default: true)
 */
const checkIPWhitelist = (options = {}) => {
  const {
    enforceForAll = false,
    logAttempts = true
  } = options;

  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get client IP address
      const clientIP = getClientIP(req);
      
      // Super admin bypass (unless enforceForAll is true)
      if (user.role === 'admin' && !enforceForAll) {
        if (logAttempts) {
          await logIPAccess(user, clientIP, 'allowed', 'super_admin_bypass');
        }
        return next();
      }

      // Check if IP is whitelisted
      const whitelistResult = await IPWhitelist.isIPWhitelisted(clientIP);
      
      if (!whitelistResult.isWhitelisted) {
        if (logAttempts) {
          await logIPAccess(user, clientIP, 'blocked', 'ip_not_whitelisted');
        }
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Your IP address is not whitelisted for admin access.',
          code: 'IP_NOT_WHITELISTED'
        });
      }

      // Check if the whitelisted IP belongs to the current admin
      if (whitelistResult.entry.adminId.toString() !== user.id.toString()) {
        if (logAttempts) {
          await logIPAccess(user, clientIP, 'blocked', 'ip_belongs_to_different_admin');
        }
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. This IP is whitelisted for a different admin.',
          code: 'IP_ADMIN_MISMATCH'
        });
      }

      if (logAttempts) {
        await logIPAccess(user, clientIP, 'allowed', 'ip_whitelisted');
      }

      // Add IP whitelist info to request for potential use in routes
      req.ipWhitelist = whitelistResult.entry;
      
      next();
    } catch (error) {
      console.error('IP whitelist middleware error:', error);
      
      // In case of error, log and allow access to prevent system lockout
      if (logAttempts) {
        await logIPAccess(req.user, getClientIP(req), 'allowed', 'middleware_error');
      }
      
      next();
    }
  };
};

/**
 * Middleware specifically for IP whitelist management routes
 * Ensures only super admins can manage IP whitelists
 */
const requireSuperAdminForIPManagement = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required for IP whitelist management.'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin IP management middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
  return req.ip ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
}

/**
 * Log IP access attempts
 * @param {Object} user - User object
 * @param {string} clientIP - Client IP address
 * @param {string} status - Access status (allowed/blocked)
 * @param {string} reason - Reason for the status
 */
async function logIPAccess(user, clientIP, status, reason) {
  try {
    await ActivityLog.logActivity({
      adminId: user.id,
      adminName: user.name,
      adminEmail: user.email,
      action: 'ip_access_check',
      category: 'security',
      description: `IP access ${status}: ${clientIP}`,
      targetType: 'ip_address',
      targetId: clientIP,
      details: {
        clientIP,
        status,
        reason,
        userAgent: null // Will be set by the calling middleware if available
      },
      severity: status === 'blocked' ? 'high' : 'low'
    });
  } catch (error) {
    console.error('Error logging IP access:', error);
  }
}

/**
 * Middleware to validate IP address format in request body
 */
const validateIPAddress = (req, res, next) => {
  const { ipAddress } = req.body;
  
  if (!ipAddress) {
    return res.status(400).json({
      success: false,
      message: 'IP address is required'
    });
  }

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 validation (basic)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  // CIDR notation validation
  const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
  
  const isValid = ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress) || cidrRegex.test(ipAddress);
  
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IP address format. Supports IPv4, IPv6, and CIDR notation.'
    });
  }

  next();
};

module.exports = {
  checkIPWhitelist,
  requireSuperAdminForIPManagement,
  validateIPAddress,
  getClientIP
};