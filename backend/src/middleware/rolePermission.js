const { AdminRole, ActivityLog } = require('../models');

/**
 * Middleware to check if user has specific permission
 * @param {string} category - Permission category (e.g., 'users', 'transactions')
 * @param {string} permission - Specific permission (e.g., 'view', 'create', 'edit')
 * @param {boolean} logActivity - Whether to log this permission check
 */
const requirePermission = (category, permission, logActivity = false) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin has all permissions
      if (user.role === 'admin') {
        if (logActivity) {
          await logPermissionCheck(user, category, permission, 'granted', 'super_admin');
        }
        return next();
      }

      // Sub-admin permission check
      if (user.role === 'sub_admin') {
        if (!user.adminRole) {
          return res.status(403).json({
            success: false,
            message: 'No role assigned to sub-admin account'
          });
        }

        // Get the admin role with permissions
        const adminRole = await AdminRole.findById(user.adminRole);
        
        if (!adminRole || !adminRole.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Invalid or inactive admin role'
          });
        }

        // Check if role has the required permission
        if (!adminRole.hasPermission(category, permission)) {
          if (logActivity) {
            await logPermissionCheck(user, category, permission, 'denied', 'insufficient_permissions');
          }
          
          return res.status(403).json({
            success: false,
            message: `Access denied. Missing permission: ${category}.${permission}`,
            requiredPermission: `${category}.${permission}`,
            userRole: adminRole.name
          });
        }

        // Permission granted
        if (logActivity) {
          await logPermissionCheck(user, category, permission, 'granted', 'role_based');
        }
        
        // Add role info to request for further use
        req.adminRole = adminRole;
        return next();
      }

      // Regular users don't have admin permissions
      if (logActivity) {
        await logPermissionCheck(user, category, permission, 'denied', 'not_admin');
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });

    } catch (error) {
      console.error('Permission check error:', error);
      
      if (logActivity) {
        await logPermissionCheck(req.user, category, permission, 'error', error.message);
      }

      return res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

/**
 * Middleware to check multiple permissions (user must have ALL)
 * @param {Array} permissions - Array of {category, permission} objects
 * @param {boolean} logActivity - Whether to log this permission check
 */
const requireAllPermissions = (permissions, logActivity = false) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin has all permissions
      if (user.role === 'admin') {
        if (logActivity) {
          await logPermissionCheck(user, 'multiple', permissions.map(p => `${p.category}.${p.permission}`).join(','), 'granted', 'super_admin');
        }
        return next();
      }

      // Sub-admin permission check
      if (user.role === 'sub_admin') {
        if (!user.adminRole) {
          return res.status(403).json({
            success: false,
            message: 'No role assigned to sub-admin account'
          });
        }

        const adminRole = await AdminRole.findById(user.adminRole);
        
        if (!adminRole || !adminRole.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Invalid or inactive admin role'
          });
        }

        // Check all required permissions
        const missingPermissions = [];
        for (const perm of permissions) {
          if (!adminRole.hasPermission(perm.category, perm.permission)) {
            missingPermissions.push(`${perm.category}.${perm.permission}`);
          }
        }

        if (missingPermissions.length > 0) {
          if (logActivity) {
            await logPermissionCheck(user, 'multiple', missingPermissions.join(','), 'denied', 'insufficient_permissions');
          }
          
          return res.status(403).json({
            success: false,
            message: 'Access denied. Missing required permissions.',
            missingPermissions,
            userRole: adminRole.name
          });
        }

        // All permissions granted
        if (logActivity) {
          await logPermissionCheck(user, 'multiple', permissions.map(p => `${p.category}.${p.permission}`).join(','), 'granted', 'role_based');
        }
        
        req.adminRole = adminRole;
        return next();
      }

      // Regular users don't have admin permissions
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });

    } catch (error) {
      console.error('Multiple permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param {Array} permissions - Array of {category, permission} objects
 * @param {boolean} logActivity - Whether to log this permission check
 */
const requireAnyPermission = (permissions, logActivity = false) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin has all permissions
      if (user.role === 'admin') {
        if (logActivity) {
          await logPermissionCheck(user, 'any', permissions.map(p => `${p.category}.${p.permission}`).join(','), 'granted', 'super_admin');
        }
        return next();
      }

      // Sub-admin permission check
      if (user.role === 'sub_admin') {
        if (!user.adminRole) {
          return res.status(403).json({
            success: false,
            message: 'No role assigned to sub-admin account'
          });
        }

        const adminRole = await AdminRole.findById(user.adminRole);
        
        if (!adminRole || !adminRole.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Invalid or inactive admin role'
          });
        }

        // Check if user has any of the required permissions
        let hasPermission = false;
        for (const perm of permissions) {
          if (adminRole.hasPermission(perm.category, perm.permission)) {
            hasPermission = true;
            break;
          }
        }

        if (!hasPermission) {
          if (logActivity) {
            await logPermissionCheck(user, 'any', permissions.map(p => `${p.category}.${p.permission}`).join(','), 'denied', 'insufficient_permissions');
          }
          
          return res.status(403).json({
            success: false,
            message: 'Access denied. None of the required permissions found.',
            requiredPermissions: permissions.map(p => `${p.category}.${p.permission}`),
            userRole: adminRole.name
          });
        }

        // Permission granted
        if (logActivity) {
          await logPermissionCheck(user, 'any', permissions.map(p => `${p.category}.${p.permission}`).join(','), 'granted', 'role_based');
        }
        
        req.adminRole = adminRole;
        return next();
      }

      // Regular users don't have admin permissions
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });

    } catch (error) {
      console.error('Any permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

/**
 * Helper function to log permission checks
 */
async function logPermissionCheck(user, category, permission, result, reason) {
  try {
    await ActivityLog.logActivity({
      adminId: user.id,
      adminName: user.name,
      adminEmail: user.email,
      action: 'permission_check',
      category: 'system_management',
      description: `Permission check: ${category}.${permission} - ${result}`,
      details: {
        category,
        permission,
        result,
        reason,
        userRole: user.role
      },
      severity: result === 'denied' ? 'medium' : 'low',
      status: result === 'error' ? 'failed' : 'success'
    });
  } catch (error) {
    console.error('Failed to log permission check:', error);
  }
}

/**
 * Middleware to log admin activities
 * @param {string} action - The action being performed
 * @param {string} category - The category of the action
 * @param {string} description - Description of the action
 * @param {Object} options - Additional options
 */
const logActivity = (action, category, description, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Determine status based on response
      let status = 'success';
      let severity = options.severity || 'medium';
      
      if (res.statusCode >= 400) {
        status = 'failed';
        severity = res.statusCode >= 500 ? 'high' : 'medium';
      }

      // Log the activity
      setImmediate(async () => {
        try {
          await ActivityLog.logActivity({
            adminId: req.user.id,
            adminName: req.user.name,
            adminEmail: req.user.email,
            action,
            category,
            description,
            targetType: options.targetType,
            targetId: options.targetId || req.params.id || req.params.userId,
            targetName: options.targetName,
            details: {
              ...options.details,
              requestBody: req.body,
              responseStatus: res.statusCode,
              parameters: req.params,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID,
            severity,
            status,
            duration
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  logActivity
};