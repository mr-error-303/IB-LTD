const { AnomalyDetection, ActivityLog } = require('../models');
const { getClientIP } = require('./ipWhitelist');

/**
 * Anomaly detection middleware to monitor admin activities
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether anomaly detection is enabled (default: true)
 * @param {Array} options.skipActions - Actions to skip detection for
 */
const detectAnomalies = (options = {}) => {
  const {
    enabled = true,
    skipActions = []
  } = options;

  return async (req, res, next) => {
    if (!enabled) {
      return next();
    }

    try {
      const user = req.user;
      const clientIP = getClientIP(req);
      const userAgent = req.headers['user-agent'];
      const action = req.route?.path || req.originalUrl;

      // Skip detection for certain actions
      if (skipActions.includes(action)) {
        return next();
      }

      // Store request info for post-processing
      req.anomalyContext = {
        user,
        clientIP,
        userAgent,
        action,
        startTime: Date.now()
      };

      // Intercept response to analyze after completion
      const originalJson = res.json;
      res.json = function(data) {
        // Perform anomaly detection after response
        setImmediate(() => {
          performAnomalyDetection(req, res, data);
        });
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Anomaly detection middleware error:', error);
      next(); // Continue even if anomaly detection fails
    }
  };
};

/**
 * Perform various anomaly detection checks
 */
async function performAnomalyDetection(req, res, responseData) {
  try {
    const { user, clientIP, userAgent, action, startTime } = req.anomalyContext;
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Run different anomaly detection checks
    await Promise.all([
      checkUnusualLoginTime(user, clientIP),
      checkUnusualLoginLocation(user, clientIP),
      checkMultipleFailedLogins(user, clientIP),
      checkSuspiciousIPChange(user, clientIP),
      checkUnusualActivityPattern(user, action, duration),
      checkBulkOperationsSpike(user, action, req.body),
      checkRapidSuccessiveActions(user, action),
      checkOffHoursActivity(user, action),
      checkUnusualDataAccess(user, action, responseData)
    ]);

  } catch (error) {
    console.error('Error performing anomaly detection:', error);
  }
}

/**
 * Check for unusual login times
 */
async function checkUnusualLoginTime(user, clientIP) {
  try {
    const currentHour = new Date().getHours();
    
    // Get user's typical login hours from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogins = await ActivityLog.find({
      adminId: user.id,
      action: 'login',
      createdAt: { $gte: thirtyDaysAgo }
    }).select('createdAt');

    if (recentLogins.length < 5) return; // Not enough data

    const loginHours = recentLogins.map(log => log.createdAt.getHours());
    const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;
    const hourDifference = Math.abs(currentHour - avgHour);

    // If current login is more than 6 hours different from average
    if (hourDifference > 6) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'unusual_login_time',
        description: `Login at unusual time: ${currentHour}:00, typical time around ${Math.round(avgHour)}:00`,
        details: {
          ipAddress: clientIP,
          currentHour,
          typicalHour: Math.round(avgHour),
          hourDifference,
          recentLoginCount: recentLogins.length
        }
      });
    }
  } catch (error) {
    console.error('Error checking unusual login time:', error);
  }
}

/**
 * Check for unusual login locations (based on IP geolocation)
 */
async function checkUnusualLoginLocation(user, clientIP) {
  try {
    // Get recent IPs for this user
    const recentIPs = await ActivityLog.find({
      adminId: user.id,
      'details.clientIP': { $exists: true },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).distinct('details.clientIP');

    // If this is a completely new IP
    if (!recentIPs.includes(clientIP)) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'unusual_login_location',
        description: `Login from new IP address: ${clientIP}`,
        details: {
          ipAddress: clientIP,
          recentIPs: recentIPs.slice(0, 5), // Store last 5 IPs
          isNewIP: true
        }
      });
    }
  } catch (error) {
    console.error('Error checking unusual login location:', error);
  }
}

/**
 * Check for multiple failed login attempts
 */
async function checkMultipleFailedLogins(user, clientIP) {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const failedLogins = await ActivityLog.countDocuments({
      adminId: user.id,
      action: 'login_failed',
      createdAt: { $gte: lastHour }
    });

    if (failedLogins >= 5) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'multiple_failed_logins',
        description: `${failedLogins} failed login attempts in the last hour`,
        details: {
          ipAddress: clientIP,
          failedAttempts: failedLogins,
          timeWindow: '1 hour',
          threshold: 5
        }
      });
    }
  } catch (error) {
    console.error('Error checking multiple failed logins:', error);
  }
}

/**
 * Check for suspicious IP changes
 */
async function checkSuspiciousIPChange(user, clientIP) {
  try {
    const lastLogin = await ActivityLog.findOne({
      adminId: user.id,
      action: 'login',
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // More than 5 minutes ago
    }).sort({ createdAt: -1 });

    if (lastLogin && lastLogin.details?.clientIP && lastLogin.details.clientIP !== clientIP) {
      const timeDiff = Date.now() - lastLogin.createdAt.getTime();
      
      // If IP changed within 30 minutes
      if (timeDiff < 30 * 60 * 1000) {
        await createAnomaly({
          adminId: user.id,
          adminName: user.name,
          anomalyType: 'suspicious_ip_change',
          description: `IP address changed from ${lastLogin.details.clientIP} to ${clientIP} within 30 minutes`,
          details: {
            ipAddress: clientIP,
            previousIP: lastLogin.details.clientIP,
            timeDifference: timeDiff,
            threshold: 30 * 60 * 1000
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking suspicious IP change:', error);
  }
}

/**
 * Check for unusual activity patterns
 */
async function checkUnusualActivityPattern(user, action, duration) {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivities = await ActivityLog.countDocuments({
      adminId: user.id,
      createdAt: { $gte: lastHour }
    });

    // Get user's typical hourly activity from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const historicalActivities = await ActivityLog.aggregate([
      {
        $match: {
          adminId: user.id,
          createdAt: { $gte: thirtyDaysAgo, $lt: lastHour }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d-%H",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgHourlyActivity: { $avg: "$count" }
        }
      }
    ]);

    const avgActivity = historicalActivities[0]?.avgHourlyActivity || 10;
    
    // If current activity is 3x higher than average
    if (recentActivities > avgActivity * 3 && recentActivities > 50) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'unusual_activity_pattern',
        description: `Unusually high activity: ${recentActivities} actions in last hour (avg: ${Math.round(avgActivity)})`,
        details: {
          currentActivity: recentActivities,
          averageActivity: Math.round(avgActivity),
          threshold: Math.round(avgActivity * 3),
          timeWindow: '1 hour'
        }
      });
    }
  } catch (error) {
    console.error('Error checking unusual activity pattern:', error);
  }
}

/**
 * Check for bulk operations spike
 */
async function checkBulkOperationsSpike(user, action, requestBody) {
  try {
    if (!action.includes('bulk') && !requestBody?.bulk) return;

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const bulkOperations = await ActivityLog.countDocuments({
      adminId: user.id,
      category: 'bulk_operations',
      createdAt: { $gte: lastHour }
    });

    if (bulkOperations >= 10) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'bulk_operations_spike',
        description: `${bulkOperations} bulk operations performed in the last hour`,
        details: {
          bulkOperations,
          timeWindow: '1 hour',
          threshold: 10,
          currentAction: action
        }
      });
    }
  } catch (error) {
    console.error('Error checking bulk operations spike:', error);
  }
}

/**
 * Check for rapid successive actions
 */
async function checkRapidSuccessiveActions(user, action) {
  try {
    const lastMinute = new Date(Date.now() - 60 * 1000);
    const recentActions = await ActivityLog.countDocuments({
      adminId: user.id,
      createdAt: { $gte: lastMinute }
    });

    if (recentActions >= 30) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'rapid_successive_actions',
        description: `${recentActions} actions performed in the last minute`,
        details: {
          actionsPerMinute: recentActions,
          threshold: 30,
          timeWindow: '1 minute'
        }
      });
    }
  } catch (error) {
    console.error('Error checking rapid successive actions:', error);
  }
}

/**
 * Check for off-hours activity
 */
async function checkOffHoursActivity(user, action) {
  try {
    const currentHour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    // Define off-hours (10 PM to 6 AM on weekdays, all day on weekends for high-risk actions)
    const isOffHours = currentHour < 6 || currentHour > 22 || isWeekend;
    
    const highRiskActions = ['delete', 'bulk', 'export', 'role', 'permission'];
    const isHighRiskAction = highRiskActions.some(risk => action.toLowerCase().includes(risk));

    if (isOffHours && isHighRiskAction) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'off_hours_activity',
        description: `High-risk action performed during off-hours: ${action}`,
        details: {
          currentHour,
          isWeekend,
          action,
          isHighRiskAction
        }
      });
    }
  } catch (error) {
    console.error('Error checking off-hours activity:', error);
  }
}

/**
 * Check for unusual data access patterns
 */
async function checkUnusualDataAccess(user, action, responseData) {
  try {
    if (!responseData?.data || !Array.isArray(responseData.data)) return;

    const dataCount = responseData.data.length;
    
    // Check for large data exports
    if (action.includes('export') && dataCount > 10000) {
      await createAnomaly({
        adminId: user.id,
        adminName: user.name,
        anomalyType: 'unusual_data_access',
        description: `Large data export: ${dataCount} records`,
        details: {
          action,
          recordCount: dataCount,
          threshold: 10000
        }
      });
    }
  } catch (error) {
    console.error('Error checking unusual data access:', error);
  }
}

/**
 * Create an anomaly record
 */
async function createAnomaly(anomalyData) {
  try {
    // Check if similar anomaly exists in the last hour to avoid duplicates
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const existingAnomaly = await AnomalyDetection.findOne({
      adminId: anomalyData.adminId,
      anomalyType: anomalyData.anomalyType,
      createdAt: { $gte: lastHour }
    });

    if (existingAnomaly) {
      return; // Don't create duplicate anomalies
    }

    const anomaly = new AnomalyDetection(anomalyData);
    await anomaly.save();

    // Send notifications for high-risk anomalies
    if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
      // TODO: Implement notification system
      console.log(`High-risk anomaly detected for admin ${anomalyData.adminName}: ${anomalyData.description}`);
    }

  } catch (error) {
    console.error('Error creating anomaly record:', error);
  }
}

module.exports = {
  detectAnomalies,
  performAnomalyDetection
};