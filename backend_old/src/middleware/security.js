const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { ActivityLog } = require('../models');

/**
 * Enhanced rate limiting for sensitive admin operations
 */
const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10, // limit each IP to 10 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = null
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    skip: (req) => process.env.NODE_ENV === 'development',
    handler: async (req, res, next, options) => {
      // Log rate limit exceeded
      try {
        await ActivityLog.logActivity({
          adminId: req.user?.id || null,
          adminName: req.user?.name || 'Unknown',
          adminEmail: req.user?.email || 'Unknown',
          action: 'rate_limit_exceeded',
          category: 'security',
          description: `Rate limit exceeded for ${req.method} ${req.path}`,
          targetType: 'endpoint',
          targetId: req.path,
          details: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            method: req.method,
            path: req.path,
            limit: max,
            windowMs: windowMs
          },
          severity: 'high',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      } catch (error) {
        console.error('Error logging rate limit exceeded:', error);
      }

      if (onLimitReached) {
        onLimitReached(req, res, options);
      }
    }
  });
};

/**
 * Strict rate limiting for financial operations
 */
const financialOperationsRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Only 3 financial operations per 5 minutes
  message: 'Too many financial operations. Please wait before trying again.',
  skipSuccessfulRequests: false
});

/**
 * Rate limiting for balance adjustments
 */
const balanceAdjustmentRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Only 5 balance adjustments per 10 minutes
  message: 'Too many balance adjustment attempts. Please wait before trying again.',
  skipSuccessfulRequests: false
});

/**
 * Rate limiting for user data access
 */
const userDataAccessRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for user data access
  message: 'Too many user data access requests. Please slow down.',
  skipSuccessfulRequests: true
});

/**
 * Rate limiting for export operations
 */
const exportOperationsRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 exports per 15 minutes
  message: 'Too many export requests. Please wait before trying again.',
  skipSuccessfulRequests: false
});

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Request validation middleware
 */
const validateRequest = (options = {}) => {
  const {
    maxBodySize = '10mb',
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    requireContentType = false,
    allowedContentTypes = ['application/json', 'multipart/form-data']
  } = options;

  return (req, res, next) => {
    // Check request method
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    // Check content type for POST/PUT/PATCH requests
    if (requireContentType && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !allowedContentTypes.some(type => contentType.includes(type))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
      }
    }

    next();
  };
};

/**
 * Suspicious activity detection middleware
 */
const detectSuspiciousActivity = async (req, res, next) => {
  try {
    const user = req.user;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const path = req.path;
    const method = req.method;

    // Define suspicious patterns
    const suspiciousPatterns = [
      // SQL injection attempts
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      // XSS attempts
      /(<script|javascript:|vbscript:|onload=|onerror=)/i,
      // Path traversal attempts
      /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
      // Command injection attempts
      /(\b(cmd|exec|system|shell|bash|sh|powershell)\b)/i
    ];

    // Check request parameters and body for suspicious content
    const requestData = JSON.stringify({
      query: req.query,
      body: req.body,
      params: req.params
    });

    let isSuspicious = false;
    let suspiciousReason = '';

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        isSuspicious = true;
        suspiciousReason = `Suspicious pattern detected: ${pattern.source}`;
        break;
      }
    }

    // Check for unusual request frequency from same IP
    // This would require a more sophisticated implementation with Redis or similar

    if (isSuspicious) {
      // Log suspicious activity
      await ActivityLog.logActivity({
        adminId: user?.id || null,
        adminName: user?.name || 'Unknown',
        adminEmail: user?.email || 'Unknown',
        action: 'suspicious_activity_detected',
        category: 'security',
        description: `Suspicious activity detected: ${suspiciousReason}`,
        targetType: 'request',
        targetId: `${method} ${path}`,
        details: {
          ip: clientIP,
          userAgent: userAgent,
          method: method,
          path: path,
          query: req.query,
          body: req.body,
          params: req.params,
          suspiciousReason: suspiciousReason
        },
        severity: 'high',
        ipAddress: clientIP,
        userAgent: userAgent
      });

      // For now, just log and continue. In production, you might want to block the request
      console.warn(`Suspicious activity detected from ${clientIP}: ${suspiciousReason}`);
    }

    next();
  } catch (error) {
    console.error('Error in suspicious activity detection:', error);
    next(); // Continue even if detection fails
  }
};

/**
 * Session security middleware
 */
const sessionSecurity = (req, res, next) => {
  // Add security headers for session management
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  // Check for session hijacking indicators
  if (req.user && req.session) {
    const currentUserAgent = req.headers['user-agent'];
    const sessionUserAgent = req.session.userAgent;

    if (sessionUserAgent && sessionUserAgent !== currentUserAgent) {
      // Potential session hijacking
      console.warn(`Potential session hijacking detected for user ${req.user.id}`);
      
      // Log the incident
      setImmediate(async () => {
        try {
          await ActivityLog.logActivity({
            adminId: req.user.id,
            adminName: req.user.name,
            adminEmail: req.user.email,
            action: 'potential_session_hijacking',
            category: 'security',
            description: 'User agent mismatch detected in session',
            details: {
              currentUserAgent,
              sessionUserAgent,
              ip: req.ip
            },
            severity: 'high',
            ipAddress: req.ip,
            userAgent: currentUserAgent
          });
        } catch (error) {
          console.error('Error logging potential session hijacking:', error);
        }
      });
    }

    // Update session user agent if not set
    if (!sessionUserAgent) {
      req.session.userAgent = currentUserAgent;
    }
  }

  next();
};

/**
 * Admin action logging middleware
 */
const logAdminAction = (action, category = 'admin_action') => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Determine status based on response
      let status = 'success';
      let severity = 'medium';
      
      if (res.statusCode >= 400) {
        status = 'failed';
        severity = res.statusCode >= 500 ? 'high' : 'medium';
      }

      // Log the activity asynchronously
      setImmediate(async () => {
        try {
          await ActivityLog.logActivity({
            adminId: req.user?.id,
            adminName: req.user?.name || 'Unknown',
            adminEmail: req.user?.email || 'Unknown',
            action,
            category,
            description: `${action.replace(/_/g, ' ')} - ${req.method} ${req.path}`,
            targetType: 'endpoint',
            targetId: req.path,
            details: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: req.body,
              params: req.params,
              responseStatus: res.statusCode,
              duration: duration,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            },
            severity,
            status,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });
        } catch (error) {
          console.error('Error logging admin action:', error);
        }
      });

      // Call original json method
      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  createRateLimit,
  financialOperationsRateLimit,
  balanceAdjustmentRateLimit,
  userDataAccessRateLimit,
  exportOperationsRateLimit,
  securityHeaders,
  validateRequest,
  detectSuspiciousActivity,
  sessionSecurity,
  logAdminAction
};