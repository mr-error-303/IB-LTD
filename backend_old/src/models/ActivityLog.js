const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  adminName: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true
  },
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required'],
    trim: true,
    lowercase: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: [
        // User Management
        'user_created', 'user_updated', 'user_deleted', 'user_approved', 'user_rejected',
        'user_banned', 'user_unbanned', 'user_activated', 'user_deactivated', 'view_users',
        // Transaction Management
        'transaction_created', 'transaction_updated', 'transaction_approved', 'transaction_rejected',
        'transaction_cancelled', 'transaction_reversed',
        // Balance Management
        'balance_adjusted', 'balance_bulk_adjusted',
        // Role Management
        'role_created', 'role_updated', 'role_deleted', 'role_assigned', 'role_revoked',
        // System Management
        'settings_updated', 'system_backup', 'alert_configured',
        // Authentication
        'admin_login', 'admin_logout', 'password_changed', 'two_factor_enabled', 'two_factor_disabled',
        // Data Export
        'users_exported', 'transactions_exported', 'reports_exported', 'logs_exported',
        // Other
        'bulk_action_performed', 'alert_triggered', 'system_maintenance'
      ],
      message: 'Invalid action type'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'user_management', 'transaction_management', 'balance_management',
        'role_management', 'system_management', 'authentication',
        'data_export', 'bulk_operations', 'alerts', 'maintenance'
      ],
      message: 'Invalid category'
    }
  },
  targetType: {
    type: String,
    enum: ['user', 'transaction', 'role', 'system', 'bulk', 'alert', 'report'],
    required: function() {
      return this.targetId !== undefined;
    }
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  targetName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  details: {
    // Store additional context as flexible object
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    affectedCount: Number,
    parameters: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  sessionId: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in milliseconds
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ adminId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 }); // For time-based queries

// Compound indexes
activityLogSchema.index({ adminId: 1, category: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, status: 1, createdAt: -1 });

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for duration in seconds
activityLogSchema.virtual('durationSeconds').get(function() {
  return this.duration ? (this.duration / 1000).toFixed(2) : null;
});

// Method to get summary info
activityLogSchema.methods.getSummary = function() {
  return {
    id: this._id,
    admin: {
      id: this.adminId,
      name: this.adminName,
      email: this.adminEmail
    },
    action: this.action,
    category: this.category,
    description: this.description,
    target: this.targetName || this.targetId,
    severity: this.severity,
    status: this.status,
    timestamp: this.createdAt,
    duration: this.durationSeconds
  };
};

// Static method to log activity
activityLogSchema.statics.logActivity = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};

// Static method to get activity by admin
activityLogSchema.statics.getByAdmin = function(adminId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    category,
    action,
    startDate,
    endDate,
    severity,
    status
  } = options;

  const query = { adminId };

  if (category) query.category = category;
  if (action) query.action = action;
  if (severity) query.severity = severity;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('adminId', 'name email role');
};

// Static method to get activity statistics
activityLogSchema.statics.getStatistics = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date()
  } = options;

  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate }
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        successfulActivities: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedActivities: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        criticalActivities: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        uniqueAdmins: { $addToSet: '$adminId' },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $project: {
        _id: 0,
        totalActivities: 1,
        successfulActivities: 1,
        failedActivities: 1,
        criticalActivities: 1,
        uniqueAdminCount: { $size: '$uniqueAdmins' },
        avgDurationMs: { $round: ['$avgDuration', 2] },
        successRate: {
          $round: [
            { $multiply: [{ $divide: ['$successfulActivities', '$totalActivities'] }, 100] },
            2
          ]
        }
      }
    }
  ]);

  return stats[0] || {
    totalActivities: 0,
    successfulActivities: 0,
    failedActivities: 0,
    criticalActivities: 0,
    uniqueAdminCount: 0,
    avgDurationMs: 0,
    successRate: 0
  };
};

// Static method to clean old logs
activityLogSchema.statics.cleanOldLogs = async function(daysToKeep = 365) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    severity: { $nin: ['critical'] } // Keep critical logs longer
  });

  return result.deletedCount;
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);