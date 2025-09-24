const { ActivityLog, User } = require('../models');
const json2csv = require('json2csv').parse;

/**
 * @desc    Get activity logs with filtering
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      adminId,
      action,
      category,
      severity,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search in description, admin name, or admin email
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('adminId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query)
    ]);

    // Format logs for response
    const formattedLogs = logs.map(log => ({
      id: log._id,
      admin: {
        id: log.adminId?._id || log.adminId,
        name: log.adminName,
        email: log.adminEmail,
        role: log.adminId?.role
      },
      action: log.action,
      category: log.category,
      description: log.description,
      target: {
        type: log.targetType,
        id: log.targetId,
        name: log.targetName
      },
      details: log.details,
      severity: log.severity,
      status: log.status,
      errorMessage: log.errorMessage,
      duration: log.duration,
      durationSeconds: log.durationSeconds,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt,
      formattedTimestamp: log.formattedTimestamp
    }));

    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: {
        logs: formattedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalLogs: total,
          hasNext: skip + logs.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get activity log by ID
 * @route   GET /api/admin/activity-logs/:id
 * @access  Private/Admin
 */
const getActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('adminId', 'name email role');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity log retrieved successfully',
      data: {
        log: {
          id: log._id,
          admin: {
            id: log.adminId?._id || log.adminId,
            name: log.adminName,
            email: log.adminEmail,
            role: log.adminId?.role
          },
          action: log.action,
          category: log.category,
          description: log.description,
          target: {
            type: log.targetType,
            id: log.targetId,
            name: log.targetName
          },
          details: log.details,
          severity: log.severity,
          status: log.status,
          errorMessage: log.errorMessage,
          duration: log.duration,
          durationSeconds: log.durationSeconds,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          sessionId: log.sessionId,
          timestamp: log.createdAt,
          formattedTimestamp: log.formattedTimestamp
        }
      }
    });

  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get activity statistics
 * @route   GET /api/admin/activity-logs/stats
 * @access  Private/Admin
 */
const getActivityStats = async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = req.query;

    // Get basic statistics
    const basicStats = await ActivityLog.getStatistics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    // Get activity by category
    const categoryStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top active admins
    const topAdmins = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$adminName' },
          adminEmail: { $first: '$adminEmail' },
          activityCount: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]);

    // Get activity timeline (daily)
    const timeline = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Format timeline data
    const formattedTimeline = timeline.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
      total: item.count,
      success: item.successCount,
      failed: item.failedCount
    }));

    res.status(200).json({
      success: true,
      message: 'Activity statistics retrieved successfully',
      data: {
        summary: basicStats,
        categoryBreakdown: categoryStats,
        topAdmins,
        timeline: formattedTimeline,
        dateRange: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Export activity logs to CSV
 * @route   GET /api/admin/activity-logs/export/csv
 * @access  Private/Admin
 */
const exportLogsToCSV = async (req, res) => {
  try {
    const {
      adminId,
      action,
      category,
      severity,
      status,
      startDate,
      endDate,
      limit = 10000
    } = req.query;

    // Build query (same as getActivityLogs)
    const query = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get logs for export
    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format data for CSV
    const csvData = logs.map(log => ({
      'Log ID': log._id,
      'Admin Name': log.adminName,
      'Admin Email': log.adminEmail,
      'Admin Role': log.adminId?.role || 'Unknown',
      'Action': log.action,
      'Category': log.category,
      'Description': log.description,
      'Target Type': log.targetType || '',
      'Target ID': log.targetId || '',
      'Target Name': log.targetName || '',
      'Severity': log.severity,
      'Status': log.status,
      'Error Message': log.errorMessage || '',
      'Duration (ms)': log.duration || '',
      'IP Address': log.ipAddress || '',
      'User Agent': log.userAgent || '',
      'Session ID': log.sessionId || '',
      'Timestamp': log.createdAt.toISOString(),
      'Date': log.createdAt.toLocaleDateString(),
      'Time': log.createdAt.toLocaleTimeString()
    }));

    // Convert to CSV
    const csv = json2csv(csvData);

    // Set headers for file download
    const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(csv);

  } catch (error) {
    console.error('Export logs to CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete old activity logs
 * @route   DELETE /api/admin/activity-logs/cleanup
 * @access  Private/Admin
 */
const cleanupOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;

    if (daysToKeep < 30) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete logs newer than 30 days'
      });
    }

    const deletedCount = await ActivityLog.cleanOldLogs(parseInt(daysToKeep));

    res.status(200).json({
      success: true,
      message: 'Old activity logs cleaned up successfully',
      data: {
        deletedCount,
        daysToKeep: parseInt(daysToKeep),
        cutoffDate: new Date(Date.now() - parseInt(daysToKeep) * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cleaning up logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get admin activity summary
 * @route   GET /api/admin/activity-logs/admin/:adminId/summary
 * @access  Private/Admin
 */
const getAdminActivitySummary = async (req, res) => {
  try {
    const { adminId } = req.params;
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;

    // Verify admin exists
    const admin = await User.findById(adminId).select('name email role');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Get activity summary for this admin
    const summary = await ActivityLog.aggregate([
      {
        $match: {
          adminId: admin._id,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
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
          categories: { $addToSet: '$category' },
          actions: { $addToSet: '$action' },
          avgDuration: { $avg: '$duration' },
          lastActivity: { $max: '$createdAt' }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await ActivityLog.aggregate([
      {
        $match: {
          adminId: admin._id,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const summaryData = summary[0] || {
      totalActivities: 0,
      successfulActivities: 0,
      failedActivities: 0,
      categories: [],
      actions: [],
      avgDuration: 0,
      lastActivity: null
    };

    res.status(200).json({
      success: true,
      message: 'Admin activity summary retrieved successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        summary: {
          ...summaryData,
          successRate: summaryData.totalActivities > 0 
            ? Math.round((summaryData.successfulActivities / summaryData.totalActivities) * 100)
            : 0,
          avgDurationSeconds: summaryData.avgDuration ? (summaryData.avgDuration / 1000).toFixed(2) : 0
        },
        categoryBreakdown,
        dateRange: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Get admin activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin activity summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getActivityLogs,
  getActivityLog,
  getActivityStats,
  exportLogsToCSV,
  cleanupOldLogs,
  getAdminActivitySummary
};