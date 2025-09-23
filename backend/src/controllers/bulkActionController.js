const { User, Transaction, ActivityLog } = require('../models');
const json2csv = require('json2csv').parse;
const ExcelJS = require('exceljs');

/**
 * @desc    Bulk balance adjustment for multiple users
 * @route   POST /api/admin/bulk/balance-adjustment
 * @access  Private/Admin
 */
const bulkBalanceAdjustment = async (req, res) => {
  try {
    const { userIds, adjustmentType, amount, reason, notifyUsers = false } = req.body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!adjustmentType || !['credit', 'debit'].includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment type must be either "credit" or "debit"'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for bulk balance adjustment'
      });
    }

    // Limit bulk operations to prevent abuse
    if (userIds.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Bulk operation limited to 1000 users at a time'
      });
    }

    // Fetch users to validate they exist
    const users = await User.find({ _id: { $in: userIds } }).select('_id name email balance');
    
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some user IDs are invalid or do not exist'
      });
    }

    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0,
      totalAmount: 0
    };

    // Process each user
    for (const user of users) {
      try {
        const oldBalance = user.balance;
        let newBalance;

        if (adjustmentType === 'credit') {
          newBalance = oldBalance + amount;
        } else {
          newBalance = Math.max(0, oldBalance - amount); // Prevent negative balance
        }

        // Update user balance
        await User.findByIdAndUpdate(user._id, { balance: newBalance });

        // Create transaction record
        const transaction = new Transaction({
          userId: user._id,
          type: adjustmentType === 'credit' ? 'deposit' : 'withdrawal',
          amount: amount,
          status: 'completed',
          description: `Bulk ${adjustmentType} adjustment: ${reason}`,
          adminId: req.user._id,
          adminNote: `Bulk operation by ${req.user.name} (${req.user.email})`,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          metadata: {
            bulkOperation: true,
            operationType: 'balance_adjustment',
            reason: reason
          }
        });

        await transaction.save();

        results.successful.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          oldBalance,
          newBalance,
          adjustment: adjustmentType === 'credit' ? amount : -amount,
          transactionId: transaction._id
        });

        results.totalAmount += amount;

      } catch (error) {
        console.error(`Failed to adjust balance for user ${user._id}:`, error);
        results.failed.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          error: error.message
        });
      }

      results.totalProcessed++;
    }

    // Log the bulk operation
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'bulk_balance_adjustment',
      category: 'financial_management',
      description: `Bulk ${adjustmentType} adjustment for ${results.successful.length} users`,
      details: {
        adjustmentType,
        amount,
        reason,
        userCount: userIds.length,
        successfulCount: results.successful.length,
        failedCount: results.failed.length,
        totalAmount: results.totalAmount
      },
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: `Bulk balance adjustment completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: {
        summary: {
          totalUsers: userIds.length,
          successful: results.successful.length,
          failed: results.failed.length,
          totalAmount: results.totalAmount,
          adjustmentType,
          reason
        },
        results: {
          successful: results.successful,
          failed: results.failed
        },
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk balance adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk balance adjustment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Bulk export selected user data
 * @route   POST /api/admin/bulk/export-users
 * @access  Private/Admin
 */
const bulkExportUsers = async (req, res) => {
  try {
    const { 
      userIds, 
      format = 'csv', 
      fields = ['name', 'email', 'balance', 'role', 'isActive', 'createdAt'],
      includeTransactions = false,
      includeActivityLogs = false
    } = req.body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!['csv', 'excel', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format must be csv, excel, or json'
      });
    }

    // Limit export to prevent performance issues
    if (userIds.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Export limited to 5000 users at a time'
      });
    }

    // Build user query with selected fields
    const selectFields = fields.join(' ');
    const users = await User.find({ _id: { $in: userIds } })
      .select(selectFields)
      .lean();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with provided IDs'
      });
    }

    // Enhance user data if additional information is requested
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      const userData = { ...user };

      // Add transaction data if requested
      if (includeTransactions) {
        const transactions = await Transaction.find({ userId: user._id })
          .select('type amount status createdAt description')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        
        userData.recentTransactions = transactions;
        userData.transactionCount = await Transaction.countDocuments({ userId: user._id });
      }

      // Add activity logs if requested
      if (includeActivityLogs) {
        const activityCount = await ActivityLog.countDocuments({ 
          $or: [
            { targetId: user._id.toString() },
            { 'details.userId': user._id.toString() }
          ]
        });
        userData.activityLogCount = activityCount;
      }

      // Format dates and other fields
      if (userData.createdAt) {
        userData.createdAt = new Date(userData.createdAt).toISOString();
      }
      if (userData.updatedAt) {
        userData.updatedAt = new Date(userData.updatedAt).toISOString();
      }

      return userData;
    }));

    // Generate export based on format
    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'csv':
        exportData = json2csv(enhancedUsers);
        contentType = 'text/csv';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'excel':
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Add headers
        const headers = Object.keys(enhancedUsers[0] || {});
        worksheet.addRow(headers);

        // Add data rows
        enhancedUsers.forEach(user => {
          const row = headers.map(header => {
            const value = user[header];
            if (Array.isArray(value)) {
              return JSON.stringify(value);
            }
            return value;
          });
          worksheet.addRow(row);
        });

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        exportData = await workbook.xlsx.writeBuffer();
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'json':
        exportData = JSON.stringify({
          exportInfo: {
            totalUsers: enhancedUsers.length,
            exportedAt: new Date().toISOString(),
            exportedBy: {
              id: req.user._id,
              name: req.user.name,
              email: req.user.email
            },
            fields,
            includeTransactions,
            includeActivityLogs
          },
          users: enhancedUsers
        }, null, 2);
        contentType = 'application/json';
        filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    // Log the export operation
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'bulk_export_users',
      category: 'data_management',
      description: `Exported ${enhancedUsers.length} users in ${format} format`,
      details: {
        userCount: enhancedUsers.length,
        format,
        fields,
        includeTransactions,
        includeActivityLogs,
        filename
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (format === 'excel') {
      res.send(exportData);
    } else {
      res.send(exportData);
    }

  } catch (error) {
    console.error('Bulk export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk user export',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Bulk transaction approval/rejection
 * @route   POST /api/admin/bulk/transaction-actions
 * @access  Private/Admin
 */
const bulkTransactionActions = async (req, res) => {
  try {
    const { transactionIds, action, reason, notifyUsers = false } = req.body;

    // Validation
    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction IDs array is required'
      });
    }

    if (!action || !['approve', 'reject', 'cancel'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be approve, reject, or cancel'
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for bulk transaction actions'
      });
    }

    // Limit bulk operations
    if (transactionIds.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bulk operation limited to 500 transactions at a time'
      });
    }

    // Fetch transactions to validate they exist and are in correct status
    const transactions = await Transaction.find({ 
      _id: { $in: transactionIds },
      status: 'pending' // Only pending transactions can be bulk processed
    }).populate('userId', 'name email balance');

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending transactions found with provided IDs'
      });
    }

    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0,
      totalAmount: 0
    };

    // Process each transaction
    for (const transaction of transactions) {
      try {
        let newStatus;
        let balanceUpdate = null;

        switch (action) {
          case 'approve':
            newStatus = 'completed';
            // Update user balance for approved transactions
            if (transaction.type === 'deposit') {
              balanceUpdate = transaction.userId.balance + transaction.amount;
            } else if (transaction.type === 'withdrawal') {
              balanceUpdate = Math.max(0, transaction.userId.balance - transaction.amount);
            }
            break;
          case 'reject':
            newStatus = 'rejected';
            break;
          case 'cancel':
            newStatus = 'cancelled';
            break;
        }

        // Update transaction
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: newStatus,
          adminId: req.user._id,
          adminNote: `Bulk ${action}: ${reason}`,
          processedAt: new Date(),
          metadata: {
            ...transaction.metadata,
            bulkOperation: true,
            bulkReason: reason,
            processedBy: req.user.email
          }
        });

        // Update user balance if needed
        if (balanceUpdate !== null) {
          await User.findByIdAndUpdate(transaction.userId._id, { 
            balance: balanceUpdate 
          });
        }

        results.successful.push({
          transactionId: transaction._id,
          userId: transaction.userId._id,
          userName: transaction.userId.name,
          userEmail: transaction.userId.email,
          amount: transaction.amount,
          type: transaction.type,
          oldStatus: 'pending',
          newStatus,
          balanceUpdate
        });

        results.totalAmount += transaction.amount;

      } catch (error) {
        console.error(`Failed to process transaction ${transaction._id}:`, error);
        results.failed.push({
          transactionId: transaction._id,
          userId: transaction.userId._id,
          amount: transaction.amount,
          error: error.message
        });
      }

      results.totalProcessed++;
    }

    // Log the bulk operation
    await ActivityLog.logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `bulk_transaction_${action}`,
      category: 'transaction_management',
      description: `Bulk ${action} for ${results.successful.length} transactions`,
      details: {
        action,
        reason,
        transactionCount: transactionIds.length,
        successfulCount: results.successful.length,
        failedCount: results.failed.length,
        totalAmount: results.totalAmount
      },
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: `Bulk transaction ${action} completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: {
        summary: {
          totalTransactions: transactionIds.length,
          successful: results.successful.length,
          failed: results.failed.length,
          totalAmount: results.totalAmount,
          action,
          reason
        },
        results: {
          successful: results.successful,
          failed: results.failed
        },
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk transaction actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk transaction processing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get bulk operation history
 * @route   GET /api/admin/bulk/history
 * @access  Private/Admin
 */
const getBulkOperationHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      operationType,
      startDate,
      endDate,
      adminId
    } = req.query;

    // Build query for bulk operations
    const query = {
      action: { 
        $in: [
          'bulk_balance_adjustment',
          'bulk_export_users',
          'bulk_transaction_approve',
          'bulk_transaction_reject',
          'bulk_transaction_cancel'
        ]
      }
    };

    if (operationType) {
      query.action = { $regex: operationType, $options: 'i' };
    }

    if (adminId) {
      query.adminId = adminId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [operations, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Bulk operation history retrieved successfully',
      data: {
        operations: operations.map(op => ({
          id: op._id,
          admin: {
            id: op.adminId?._id,
            name: op.adminName,
            email: op.adminEmail
          },
          action: op.action,
          description: op.description,
          details: op.details,
          severity: op.severity,
          timestamp: op.createdAt,
          duration: op.duration
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOperations: total,
          hasNext: skip + operations.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get bulk operation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bulk operation history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get bulk operation statistics
 * @route   GET /api/admin/bulk/stats
 * @access  Private/Admin
 */
const getBulkOperationStats = async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = req.query;

    // Get operation statistics
    const stats = await ActivityLog.aggregate([
      {
        $match: {
          action: { 
            $in: [
              'bulk_balance_adjustment',
              'bulk_export_users',
              'bulk_transaction_approve',
              'bulk_transaction_reject',
              'bulk_transaction_cancel'
            ]
          },
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalUsers: { $sum: '$details.userCount' },
          totalTransactions: { $sum: '$details.transactionCount' },
          totalAmount: { $sum: '$details.totalAmount' },
          avgDuration: { $avg: '$duration' },
          lastOperation: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get admin activity for bulk operations
    const adminStats = await ActivityLog.aggregate([
      {
        $match: {
          action: { 
            $in: [
              'bulk_balance_adjustment',
              'bulk_export_users',
              'bulk_transaction_approve',
              'bulk_transaction_reject',
              'bulk_transaction_cancel'
            ]
          },
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$adminName' },
          adminEmail: { $first: '$adminEmail' },
          operationCount: { $sum: 1 },
          operations: { $addToSet: '$action' }
        }
      },
      { $sort: { operationCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Bulk operation statistics retrieved successfully',
      data: {
        summary: {
          totalOperations: stats.reduce((sum, stat) => sum + stat.count, 0),
          totalUsersAffected: stats.reduce((sum, stat) => sum + (stat.totalUsers || 0), 0),
          totalTransactionsProcessed: stats.reduce((sum, stat) => sum + (stat.totalTransactions || 0), 0),
          totalAmountProcessed: stats.reduce((sum, stat) => sum + (stat.totalAmount || 0), 0)
        },
        operationBreakdown: stats,
        topAdmins: adminStats,
        dateRange: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Get bulk operation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bulk operation statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generic bulk action handler
const performBulkAction = async (req, res) => {
  try {
    const { action, userIds, ...params } = req.body;
    
    switch (action) {
      case 'balance_adjustment':
        return await bulkBalanceAdjustment(req, res);
      case 'export_users':
        return await bulkExportUsers(req, res);
      case 'transaction_actions':
        return await bulkTransactionActions(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action type'
        });
    }
  } catch (error) {
    console.error('Perform bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while performing bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  bulkBalanceAdjustment,
  bulkExportUsers,
  bulkTransactionActions,
  getBulkOperationHistory,
  getBulkOperationStats,
  performBulkAction
};