const express = require('express');
const router = express.Router();
const { 
  deposit, 
  withdraw, 
  transfer, 
  getTransactionHistory, 
  getTransactionById,
  payBill,
  getTransactionStats
} = require('../controllers/transactionController');
const { protect, authorize, rateLimit } = require('../middleware/auth');

// Apply rate limiting to transaction routes
const transactionRateLimit = rateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes
const sensitiveTransactionRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes for sensitive operations

// All routes are protected (require authentication)
router.use(protect);

// @desc    Deposit money to user's account
// @route   POST /api/transaction/deposit
// @access  Private
router.post('/deposit', sensitiveTransactionRateLimit, deposit);

// @desc    Withdraw money from user's account
// @route   POST /api/transaction/withdraw
// @access  Private
router.post('/withdraw', sensitiveTransactionRateLimit, withdraw);

// @desc    Transfer money to another user's account
// @route   POST /api/transaction/transfer
// @access  Private
router.post('/transfer', sensitiveTransactionRateLimit, transfer);

// @desc    Pay bill
// @route   POST /api/transaction/bill-payment
// @access  Private
router.post('/bill-payment', sensitiveTransactionRateLimit, payBill);

// @desc    Get user's transaction history
// @route   GET /api/transaction/history
// @access  Private
router.get('/history', transactionRateLimit, getTransactionHistory);

// @desc    Get transaction statistics
// @route   GET /api/transaction/stats
// @access  Private
router.get('/stats', transactionRateLimit, getTransactionStats);

// @desc    Get transaction by ID
// @route   GET /api/transaction/:id
// @access  Private
router.get('/:id', transactionRateLimit, getTransactionById);

// @desc    Get all transactions (admin only)
// @route   GET /api/transaction/admin/all
// @access  Private/Admin
router.get('/admin/all', authorize('admin'), async (req, res) => {
  try {
    const { Transaction } = require('../models');
    const { page = 1, limit = 50, type, status, userId, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (type && ['deposit', 'withdraw', 'transfer_in', 'transfer_out'].includes(type)) {
      query.type = type;
    }
    
    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      query.status = status;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);
    
    res.status(200).json({
      success: true,
      message: 'All transactions retrieved successfully',
      data: {
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt,
          user: {
            id: transaction.userId._id,
            name: transaction.userId.name,
            email: transaction.userId.email
          },
          toUser: transaction.toUserId ? {
            id: transaction.toUserId._id,
            name: transaction.toUserId.name,
            email: transaction.toUserId.email
          } : null
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Admin get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get system transaction statistics (admin only)
// @route   GET /api/transaction/admin/stats
// @access  Private/Admin
router.get('/admin/stats', authorize('admin'), async (req, res) => {
  try {
    const { Transaction } = require('../models');
    const { period = '30' } = req.query; // days
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    // Get overall transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const recentTransactions = await Transaction.countDocuments({
      createdAt: { $gte: daysAgo }
    });
    
    // Get transaction statistics by type
    const statsByType = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get transaction statistics by status
    const statsByStatus = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily transaction volume for the period
    const dailyVolume = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
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
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: `System transaction statistics for the last ${period} days retrieved successfully`,
      data: {
        period: parseInt(period),
        overview: {
          totalTransactions,
          recentTransactions,
          recentPercentage: totalTransactions > 0 ? ((recentTransactions / totalTransactions) * 100).toFixed(2) : 0
        },
        byType: statsByType.map(stat => ({
          type: stat._id,
          count: stat.count,
          totalAmount: stat.totalAmount,
          formattedAmount: `$${stat.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        })),
        byStatus: statsByStatus.map(stat => ({
          status: stat._id,
          count: stat.count,
          percentage: totalTransactions > 0 ? ((stat.count / totalTransactions) * 100).toFixed(2) : 0
        })),
        dailyVolume: dailyVolume.map(day => ({
          date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
          count: day.count,
          totalAmount: day.totalAmount,
          formattedAmount: `$${day.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }))
      }
    });
    
  } catch (error) {
    console.error('Admin transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;