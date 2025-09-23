const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * Get all transactions with filtering and pagination
 */
const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      userId,
      accountId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (accountId) filter.accountId = accountId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('accountId', 'accountNumber accountType')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + transactions.length < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message
    });
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      totalVolume,
      avgTransactionAmount,
      transactionsByType,
      dailyStats
    ] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: 'pending', createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: 'completed', createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: 'failed', createdAt: { $gte: startDate } }),
      Transaction.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, avg: { $avg: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$type', count: { $sum: 1 }, volume: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalTransactions,
          pendingTransactions,
          completedTransactions,
          failedTransactions,
          totalVolume: totalVolume[0]?.total || 0,
          avgTransactionAmount: avgTransactionAmount[0]?.avg || 0
        },
        transactionsByType,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction statistics',
      error: error.message
    });
  }
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    const transaction = await Transaction.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('accountId', 'accountNumber accountType balance');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction',
      error: error.message
    });
  }
};

/**
 * Update transaction status
 */
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update transaction
    transaction.status = status;
    if (reason) {
      transaction.statusReason = reason;
    }
    transaction.updatedAt = new Date();

    await transaction.save();

    // If transaction is being completed, update account balance
    if (status === 'completed' && transaction.status !== 'completed') {
      const account = await Account.findById(transaction.accountId);
      if (account) {
        if (transaction.type === 'deposit') {
          account.balance += transaction.amount;
        } else if (transaction.type === 'withdrawal') {
          account.balance -= transaction.amount;
        }
        await account.save();
      }
    }

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
};

/**
 * Export transactions data
 */
const exportTransactions = async (req, res) => {
  try {
    const {
      format = 'csv',
      status,
      type,
      startDate,
      endDate,
      userId
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('accountId', 'accountNumber accountType')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit to prevent memory issues

    if (format === 'csv') {
      const csvData = transactions.map(t => ({
        'Transaction ID': t._id,
        'User': `${t.userId?.firstName} ${t.userId?.lastName}`,
        'Email': t.userId?.email,
        'Account': t.accountId?.accountNumber,
        'Type': t.type,
        'Amount': t.amount,
        'Status': t.status,
        'Date': t.createdAt.toISOString(),
        'Description': t.description || ''
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
      
      // Simple CSV conversion
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');
      
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: { transactions }
      });
    }
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: error.message
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionStats,
  getTransactionById,
  updateTransactionStatus,
  exportTransactions
};