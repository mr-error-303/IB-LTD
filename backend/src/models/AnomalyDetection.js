const mongoose = require('mongoose');

const anomalyDetectionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  anomalyType: {
    type: String,
    required: true,
    enum: [
      'unusual_login_time',
      'unusual_login_location',
      'multiple_failed_logins',
      'suspicious_ip_change',
      'unusual_activity_pattern',
      'bulk_operations_spike',
      'permission_escalation_attempt',
      'rapid_successive_actions',
      'unusual_data_access',
      'off_hours_activity'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  details: {
    // Flexible object to store anomaly-specific data
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    activityCount: Number,
    timeWindow: String,
    previousPattern: mongoose.Schema.Types.Mixed,
    currentPattern: mongoose.Schema.Types.Mixed,
    threshold: Number,
    actualValue: Number,
    relatedActivities: [String]
  },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'resolved', 'false_positive'],
    default: 'detected'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    maxlength: [1000, 'Resolution notes cannot be more than 1000 characters']
  },
  actionsTaken: [{
    action: {
      type: String,
      enum: [
        'account_locked',
        'session_terminated',
        'ip_blocked',
        'notification_sent',
        'manual_review_required',
        'permissions_revoked',
        'no_action'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  relatedAnomalies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnomalyDetection'
  }],
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'webhook', 'dashboard']
    },
    recipient: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
anomalyDetectionSchema.index({ adminId: 1, createdAt: -1 });
anomalyDetectionSchema.index({ anomalyType: 1 });
anomalyDetectionSchema.index({ severity: 1 });
anomalyDetectionSchema.index({ status: 1 });
anomalyDetectionSchema.index({ riskScore: -1 });
anomalyDetectionSchema.index({ isResolved: 1 });
anomalyDetectionSchema.index({ 'details.ipAddress': 1 });

// Virtual for time since detection
anomalyDetectionSchema.virtual('timeSinceDetection').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to calculate risk score based on anomaly type and details
anomalyDetectionSchema.methods.calculateRiskScore = function() {
  let baseScore = 0;
  
  // Base scores by anomaly type
  const typeScores = {
    'unusual_login_time': 20,
    'unusual_login_location': 40,
    'multiple_failed_logins': 60,
    'suspicious_ip_change': 50,
    'unusual_activity_pattern': 30,
    'bulk_operations_spike': 70,
    'permission_escalation_attempt': 90,
    'rapid_successive_actions': 40,
    'unusual_data_access': 80,
    'off_hours_activity': 25
  };
  
  baseScore = typeScores[this.anomalyType] || 30;
  
  // Adjust based on details
  if (this.details.activityCount > 100) baseScore += 20;
  if (this.details.actualValue > this.details.threshold * 3) baseScore += 15;
  
  // Cap at 100
  this.riskScore = Math.min(baseScore, 100);
  
  // Set severity based on risk score
  if (this.riskScore >= 80) this.severity = 'critical';
  else if (this.riskScore >= 60) this.severity = 'high';
  else if (this.riskScore >= 30) this.severity = 'medium';
  else this.severity = 'low';
  
  return this.riskScore;
};

// Method to resolve anomaly
anomalyDetectionSchema.methods.resolve = function(resolvedBy, notes, actionTaken = 'no_action') {
  this.status = 'resolved';
  this.isResolved = true;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  
  if (actionTaken !== 'no_action') {
    this.actionsTaken.push({
      action: actionTaken,
      performedBy: resolvedBy,
      notes: notes
    });
  }
  
  return this.save();
};

// Method to mark as false positive
anomalyDetectionSchema.methods.markAsFalsePositive = function(resolvedBy, notes) {
  this.status = 'false_positive';
  this.isResolved = true;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  
  return this.save();
};

// Static method to find unresolved anomalies
anomalyDetectionSchema.statics.findUnresolved = function(severity = null) {
  const query = { isResolved: false };
  if (severity) query.severity = severity;
  
  return this.find(query).sort({ riskScore: -1, createdAt: -1 });
};

// Static method to find anomalies for admin
anomalyDetectionSchema.statics.findForAdmin = function(adminId, limit = 50) {
  return this.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('resolvedBy', 'name email');
};

// Static method to get anomaly statistics
anomalyDetectionSchema.statics.getStatistics = async function(timeframe = '24h') {
  const timeMap = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  };
  
  const hours = timeMap[timeframe] || 24;
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        resolved: { $sum: { $cond: ['$isResolved', 1, 0] } },
        avgRiskScore: { $avg: '$riskScore' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    avgRiskScore: 0
  };
};

// Pre-save middleware to calculate risk score
anomalyDetectionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('anomalyType') || this.isModified('details')) {
    this.calculateRiskScore();
  }
  next();
});

module.exports = mongoose.model('AnomalyDetection', anomalyDetectionSchema);