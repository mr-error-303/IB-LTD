const { User, Transaction, ActivityLog } = require('../models');
const nodemailer = require('nodemailer');

// Alert configuration with default thresholds
const DEFAULT_ALERT_CONFIG = {
  suspiciousTransaction: {
    enabled: true,
    largeAmountThreshold: 10000,
    rapidTransactionCount: 5,
    rapidTransactionTimeWindow: 300000, // 5 minutes in milliseconds
    unusualTimeThreshold: { start: 22, end: 6 }, // 10 PM to 6 AM
    multipleFailedAttempts: 3
  },
  failedLogins: {
    enabled: true,
    maxAttempts: 5,
    timeWindow: 900000, // 15 minutes in milliseconds
    lockoutDuration: 1800000 // 30 minutes in milliseconds
  },
  systemHealth: {
    enabled: true,
    errorRateThreshold: 0.1, // 10% error rate
    responseTimeThreshold: 5000, // 5 seconds
    diskSpaceThreshold: 0.9 // 90% disk usage
  }
};

// In-memory storage for alert configurations (in production, use database)
let alertConfig = { ...DEFAULT_ALERT_CONFIG };

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * @desc    Get alert configuration
 * @route   GET /api/admin/alerts/config
 * @access  Private/Admin
 */
const getAlertConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Alert configuration retrieved successfully',
      data: {
        config: alertConfig,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get alert config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alert configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update alert configuration
 * @route   PUT /api/admin/alerts/config
 * @access  Private/Admin
 */
const updateAlertConfig = async (req, res) => {
  try {
    const { suspiciousTransaction, failedLogins, systemHealth } = req.body;

    // Validate and update configuration
    if (suspiciousTransaction) {
      alertConfig.suspiciousTransaction = {
        ...alertConfig.suspiciousTransaction,
        ...suspiciousTransaction
      };
    }

    if (failedLogins) {
      alertConfig.failedLogins = {
        ...alertConfig.failedLogins,
        ...failedLogins
      };
    }

    if (systemHealth) {
      alertConfig.systemHealth = {
        ...alertConfig.systemHealth,
        ...systemHealth
      };
    }

    // Log the configuration update
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'update_alert_config',
      category: 'system_configuration',
      description: 'Updated alert system configuration',
      details: {
        updatedFields: Object.keys(req.body),
        newConfig: alertConfig
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Alert configuration updated successfully',
      data: {
        config: alertConfig,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update alert config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating alert configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check for suspicious transactions
 * @route   POST /api/admin/alerts/check-suspicious
 * @access  Private/Admin
 */
const checkSuspiciousTransactions = async (req, res) => {
  try {
    const { timeRange = 24 } = req.query; // hours
    const startTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    const suspiciousActivities = [];

    // Check for large amount transactions
    if (alertConfig.suspiciousTransaction.enabled) {
      const largeTransactions = await Transaction.find({
        amount: { $gte: alertConfig.suspiciousTransaction.largeAmountThreshold },
        createdAt: { $gte: startTime },
        status: { $in: ['completed', 'pending'] }
      }).populate('userId', 'name email');

      largeTransactions.forEach(transaction => {
        suspiciousActivities.push({
          type: 'large_amount',
          severity: 'high',
          transaction: {
            id: transaction._id,
            amount: transaction.amount,
            type: transaction.type,
            user: transaction.userId
          },
          threshold: alertConfig.suspiciousTransaction.largeAmountThreshold,
          timestamp: transaction.createdAt,
          description: `Large transaction of $${transaction.amount} detected`
        });
      });

      // Check for rapid transactions from same user
      const recentTransactions = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startTime },
            status: { $in: ['completed', 'pending'] }
          }
        },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            transactions: { $push: '$$ROOT' },
            firstTransaction: { $min: '$createdAt' },
            lastTransaction: { $max: '$createdAt' }
          }
        },
        {
          $match: {
            count: { $gte: alertConfig.suspiciousTransaction.rapidTransactionCount }
          }
        }
      ]);

      for (const userTransactions of recentTransactions) {
        const timeDiff = userTransactions.lastTransaction - userTransactions.firstTransaction;
        if (timeDiff <= alertConfig.suspiciousTransaction.rapidTransactionTimeWindow) {
          const user = await User.findById(userTransactions._id).select('name email');
          suspiciousActivities.push({
            type: 'rapid_transactions',
            severity: 'medium',
            user: user,
            transactionCount: userTransactions.count,
            timeWindow: timeDiff,
            threshold: alertConfig.suspiciousTransaction.rapidTransactionTimeWindow,
            timestamp: userTransactions.lastTransaction,
            description: `${userTransactions.count} transactions in ${Math.round(timeDiff / 1000)} seconds`
          });
        }
      }

      // Check for unusual time transactions
      const unusualTimeTransactions = await Transaction.find({
        createdAt: { $gte: startTime },
        status: { $in: ['completed', 'pending'] }
      }).populate('userId', 'name email');

      unusualTimeTransactions.forEach(transaction => {
        const hour = transaction.createdAt.getHours();
        const { start, end } = alertConfig.suspiciousTransaction.unusualTimeThreshold;
        
        if (hour >= start || hour <= end) {
          suspiciousActivities.push({
            type: 'unusual_time',
            severity: 'low',
            transaction: {
              id: transaction._id,
              amount: transaction.amount,
              type: transaction.type,
              user: transaction.userId
            },
            hour: hour,
            timestamp: transaction.createdAt,
            description: `Transaction at unusual time: ${hour}:00`
          });
        }
      });
    }

    // Sort by severity and timestamp
    suspiciousActivities.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.status(200).json({
      success: true,
      message: 'Suspicious transaction check completed',
      data: {
        suspiciousActivities,
        totalCount: suspiciousActivities.length,
        timeRange: `${timeRange} hours`,
        checkedAt: new Date().toISOString(),
        breakdown: {
          high: suspiciousActivities.filter(a => a.severity === 'high').length,
          medium: suspiciousActivities.filter(a => a.severity === 'medium').length,
          low: suspiciousActivities.filter(a => a.severity === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('Check suspicious transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking suspicious transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check for failed login attempts
 * @route   POST /api/admin/alerts/check-failed-logins
 * @access  Private/Admin
 */
const checkFailedLogins = async (req, res) => {
  try {
    const { timeRange = 1 } = req.query; // hours
    const startTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    if (!alertConfig.failedLogins.enabled) {
      return res.status(200).json({
        success: true,
        message: 'Failed login monitoring is disabled',
        data: { alerts: [], totalCount: 0 }
      });
    }

    // Get failed login attempts from activity logs
    const failedLogins = await ActivityLog.aggregate([
      {
        $match: {
          action: 'login_failed',
          createdAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: '$details.email',
          count: { $sum: 1 },
          attempts: { $push: '$$ROOT' },
          lastAttempt: { $max: '$createdAt' },
          ipAddresses: { $addToSet: '$ipAddress' }
        }
      },
      {
        $match: {
          count: { $gte: alertConfig.failedLogins.maxAttempts }
        }
      }
    ]);

    const alerts = failedLogins.map(loginData => ({
      type: 'failed_logins',
      severity: loginData.count >= alertConfig.failedLogins.maxAttempts * 2 ? 'high' : 'medium',
      email: loginData._id,
      attemptCount: loginData.count,
      threshold: alertConfig.failedLogins.maxAttempts,
      lastAttempt: loginData.lastAttempt,
      ipAddresses: loginData.ipAddresses,
      timeWindow: timeRange,
      description: `${loginData.count} failed login attempts for ${loginData._id}`,
      recommendedAction: loginData.count >= alertConfig.failedLogins.maxAttempts * 2 
        ? 'Consider IP blocking' 
        : 'Monitor closely'
    }));

    res.status(200).json({
      success: true,
      message: 'Failed login check completed',
      data: {
        alerts,
        totalCount: alerts.length,
        timeRange: `${timeRange} hours`,
        checkedAt: new Date().toISOString(),
        config: {
          maxAttempts: alertConfig.failedLogins.maxAttempts,
          timeWindow: alertConfig.failedLogins.timeWindow
        }
      }
    });

  } catch (error) {
    console.error('Check failed logins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking failed logins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Send alert notification
 * @route   POST /api/admin/alerts/notify
 * @access  Private/Admin
 */
const sendAlertNotification = async (req, res) => {
  try {
    const { alertType, severity, message, recipients, details } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients are required for alert notification'
      });
    }

    const transporter = createEmailTransporter();

    // Prepare email content
    const emailSubject = `[${severity.toUpperCase()}] ${alertType} Alert - IB LTD Admin`;
    const emailBody = `
      <h2>Alert Notification</h2>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Severity:</strong> ${severity}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      
      ${details ? `
        <h3>Details:</h3>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      ` : ''}
      
      <p>Please review and take appropriate action if necessary.</p>
      <p>This is an automated alert from the IB LTD Admin System.</p>
    `;

    // Send emails to all recipients
    const emailPromises = recipients.map(email => 
      transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: emailSubject,
        html: emailBody
      })
    );

    await Promise.all(emailPromises);

    // Log the alert notification
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'send_alert_notification',
      category: 'system_monitoring',
      description: `Sent ${alertType} alert notification`,
      details: {
        alertType,
        severity,
        recipients: recipients.length,
        message
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Alert notification sent successfully',
      data: {
        alertType,
        severity,
        recipientCount: recipients.length,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send alert notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending alert notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get alert history
 * @route   GET /api/admin/alerts/history
 * @access  Private/Admin
 */
const getAlertHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      alertType,
      severity,
      startDate,
      endDate
    } = req.query;

    // Build query for activity logs related to alerts
    const query = {
      category: 'system_monitoring',
      action: { $in: ['send_alert_notification', 'check_suspicious_transactions', 'check_failed_logins'] }
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (alertType) {
      query['details.alertType'] = alertType;
    }

    if (severity) {
      query['details.severity'] = severity;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [alerts, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Alert history retrieved successfully',
      data: {
        alerts: alerts.map(alert => ({
          id: alert._id,
          admin: {
            name: alert.adminName,
            email: alert.adminEmail
          },
          action: alert.action,
          description: alert.description,
          details: alert.details,
          severity: alert.severity,
          timestamp: alert.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAlerts: total,
          hasNext: skip + alerts.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get alert history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alert history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Reset alert configuration to defaults
 * @route   POST /api/admin/alerts/reset-config
 * @access  Private/Admin
 */
const resetAlertConfig = async (req, res) => {
  try {
    alertConfig = { ...DEFAULT_ALERT_CONFIG };

    // Log the configuration reset
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'reset_alert_config',
      category: 'system_configuration',
      description: 'Reset alert configuration to defaults',
      details: {
        resetConfig: alertConfig
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Alert configuration reset to defaults successfully',
      data: {
        config: alertConfig,
        resetAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Reset alert config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting alert configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAlertConfig,
  updateAlertConfig,
  checkSuspiciousTransactions,
  checkFailedLogins,
  sendAlertNotification,
  getAlertHistory,
  resetAlertConfig
};