const { ActivityLog, User, Account, Transaction } = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Generate comprehensive admin activity report
 * @desc    Generate detailed report of admin activities
 * @route   GET /api/admin/reports/activity
 * @access  Private/Admin
 */
const generateActivityReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      adminId,
      category,
      action,
      severity,
      format = 'json',
      includeDetails = false
    } = req.query;

    // Build query filters
    const filters = {};
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    if (adminId) filters.adminId = adminId;
    if (category) filters.category = category;
    if (action) filters.action = action;
    if (severity) filters.severity = severity;

    // Get activity logs with aggregation
    const activities = await ActivityLog.find(filters)
      .sort({ createdAt: -1 })
      .populate('adminId', 'name email')
      .lean();

    // Generate statistics
    const stats = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          categoriesBreakdown: {
            $push: {
              category: '$category',
              action: '$action',
              severity: '$severity'
            }
          }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Severity breakdown
    const severityStats = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Admin activity breakdown
    const adminStats = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$adminName' },
          adminEmail: { $first: '$adminEmail' },
          activityCount: { $sum: 1 },
          categories: { $addToSet: '$category' },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { activityCount: -1 } }
    ]);

    const reportData = {
      summary: {
        totalActivities: stats[0]?.totalActivities || 0,
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        },
        generatedAt: new Date(),
        generatedBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      },
      statistics: {
        byCategory: categoryStats,
        bySeverity: severityStats,
        byAdmin: adminStats
      },
      activities: includeDetails === 'true' ? activities : activities.slice(0, 100)
    };

    // Log report generation
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'generate_activity_report',
      category: 'reporting',
      description: `Generated activity report with ${reportData.summary.totalActivities} activities`,
      details: {
        filters,
        format,
        includeDetails,
        totalActivities: reportData.summary.totalActivities
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Handle different output formats
    if (format === 'excel') {
      return await generateExcelReport(res, reportData, 'activity_report');
    } else if (format === 'pdf') {
      return await generatePDFReport(res, reportData, 'Activity Report');
    }

    res.json({
      success: true,
      message: 'Activity report generated successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error generating activity report:', error);
    
    // Log failed report generation
    try {
      await ActivityLog.logActivity({
        adminId: req.user?.id,
        adminName: req.user?.name || 'Unknown',
        adminEmail: req.user?.email || 'Unknown',
        action: 'generate_activity_report_failed',
        category: 'reporting',
        description: 'Failed to generate activity report',
        details: {
          error: error.message,
          filters: req.query
        },
        severity: 'high',
        status: 'failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logError) {
      console.error('Error logging failed report generation:', logError);
    }

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error generating activity report' 
        : error.message
    });
  }
};

/**
 * Generate financial operations report
 * @desc    Generate report of financial operations and balance changes
 * @route   GET /api/admin/reports/financial
 * @access  Private/Admin
 */
const generateFinancialReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      adminId,
      userId,
      minAmount,
      maxAmount,
      format = 'json'
    } = req.query;

    // Build query filters for transactions
    const transactionFilters = {};
    
    if (startDate || endDate) {
      transactionFilters.createdAt = {};
      if (startDate) transactionFilters.createdAt.$gte = new Date(startDate);
      if (endDate) transactionFilters.createdAt.$lte = new Date(endDate);
    }
    
    if (userId) transactionFilters.userId = userId;
    if (minAmount) transactionFilters.amount = { $gte: parseFloat(minAmount) };
    if (maxAmount) {
      transactionFilters.amount = transactionFilters.amount || {};
      transactionFilters.amount.$lte = parseFloat(maxAmount);
    }

    // Get balance adjustment activities
    const balanceAdjustments = await ActivityLog.find({
      action: { $in: ['adjust_balance', 'bulk_balance_adjustment'] },
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      } : {}),
      ...(adminId && { adminId })
    }).populate('adminId', 'name email').lean();

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      { $match: transactionFilters },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    // Transaction type breakdown
    const typeBreakdown = await Transaction.aggregate([
      { $match: transactionFilters },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Admin financial activity breakdown
    const adminFinancialStats = await ActivityLog.aggregate([
      {
        $match: {
          action: { $in: ['adjust_balance', 'bulk_balance_adjustment'] },
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) })
            }
          } : {}),
          ...(adminId && { adminId })
        }
      },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$adminName' },
          adminEmail: { $first: '$adminEmail' },
          adjustmentCount: { $sum: 1 },
          lastAdjustment: { $max: '$createdAt' }
        }
      },
      { $sort: { adjustmentCount: -1 } }
    ]);

    const reportData = {
      summary: {
        totalBalanceAdjustments: balanceAdjustments.length,
        totalTransactions: transactionStats[0]?.totalTransactions || 0,
        totalTransactionAmount: transactionStats[0]?.totalAmount || 0,
        averageTransactionAmount: transactionStats[0]?.avgAmount || 0,
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        },
        generatedAt: new Date(),
        generatedBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      },
      statistics: {
        transactionTypes: typeBreakdown,
        adminActivity: adminFinancialStats,
        transactionStats: transactionStats[0] || {}
      },
      balanceAdjustments: balanceAdjustments.slice(0, 100)
    };

    // Log report generation
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'generate_financial_report',
      category: 'reporting',
      description: `Generated financial report with ${reportData.summary.totalBalanceAdjustments} balance adjustments`,
      details: {
        filters: req.query,
        format,
        totalAdjustments: reportData.summary.totalBalanceAdjustments,
        totalTransactions: reportData.summary.totalTransactions
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Handle different output formats
    if (format === 'excel') {
      return await generateExcelReport(res, reportData, 'financial_report');
    } else if (format === 'pdf') {
      return await generatePDFReport(res, reportData, 'Financial Report');
    }

    res.json({
      success: true,
      message: 'Financial report generated successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error generating financial report:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error generating financial report' 
        : error.message
    });
  }
};

/**
 * Generate system security report
 * @desc    Generate report of security events and suspicious activities
 * @route   GET /api/admin/reports/security
 * @access  Private/Admin
 */
const generateSecurityReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      severity,
      format = 'json'
    } = req.query;

    // Build query filters for security events
    const securityFilters = {
      category: 'security'
    };
    
    if (startDate || endDate) {
      securityFilters.createdAt = {};
      if (startDate) securityFilters.createdAt.$gte = new Date(startDate);
      if (endDate) securityFilters.createdAt.$lte = new Date(endDate);
    }
    
    if (severity) securityFilters.severity = severity;

    // Get security events
    const securityEvents = await ActivityLog.find(securityFilters)
      .sort({ createdAt: -1 })
      .lean();

    // Security event statistics
    const securityStats = await ActivityLog.aggregate([
      { $match: securityFilters },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          severity: { $first: '$severity' },
          lastOccurrence: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // IP address analysis
    const ipStats = await ActivityLog.aggregate([
      { $match: securityFilters },
      {
        $group: {
          _id: '$ipAddress',
          eventCount: { $sum: 1 },
          actions: { $addToSet: '$action' },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 20 }
    ]);

    const reportData = {
      summary: {
        totalSecurityEvents: securityEvents.length,
        highSeverityEvents: securityEvents.filter(e => e.severity === 'high').length,
        mediumSeverityEvents: securityEvents.filter(e => e.severity === 'medium').length,
        lowSeverityEvents: securityEvents.filter(e => e.severity === 'low').length,
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        },
        generatedAt: new Date(),
        generatedBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      },
      statistics: {
        eventTypes: securityStats,
        topIPs: ipStats
      },
      events: securityEvents.slice(0, 100)
    };

    // Log report generation
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'generate_security_report',
      category: 'reporting',
      description: `Generated security report with ${reportData.summary.totalSecurityEvents} security events`,
      details: {
        filters: req.query,
        format,
        totalEvents: reportData.summary.totalSecurityEvents,
        highSeverityCount: reportData.summary.highSeverityEvents
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Handle different output formats
    if (format === 'excel') {
      return await generateExcelReport(res, reportData, 'security_report');
    } else if (format === 'pdf') {
      return await generatePDFReport(res, reportData, 'Security Report');
    }

    res.json({
      success: true,
      message: 'Security report generated successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error generating security report:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error generating security report' 
        : error.message
    });
  }
};

/**
 * Generate Excel report
 */
const generateExcelReport = async (res, data, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Admin', key: 'admin', width: 25 },
      { header: 'Action', key: 'action', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Severity', key: 'severity', width: 15 },
      { header: 'Description', key: 'description', width: 50 }
    ];

    // Add data rows
    if (data.activities) {
      data.activities.forEach(activity => {
        worksheet.addRow({
          date: activity.createdAt,
          admin: activity.adminName,
          action: activity.action,
          category: activity.category,
          severity: activity.severity,
          description: activity.description
        });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};

/**
 * Generate PDF report
 */
const generatePDFReport = async (res, data, title) => {
  try {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

    doc.pipe(res);

    // Add title
    doc.fontSize(20).text(title, 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);
    doc.text(`Generated by: ${data.summary.generatedBy.name}`, 50, 100);

    // Add summary
    doc.fontSize(16).text('Summary', 50, 140);
    doc.fontSize(12);
    
    let yPosition = 160;
    Object.entries(data.summary).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        doc.text(`${key}: ${value}`, 50, yPosition);
        yPosition += 20;
      }
    });

    doc.end();

  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

module.exports = {
  generateActivityReport,
  generateFinancialReport,
  generateSecurityReport
};