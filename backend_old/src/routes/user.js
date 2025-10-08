const express = require('express');
const router = express.Router();
const { 
  getDashboard, 
  getProfile, 
  updateProfile, 
  getAccount 
} = require('../controllers/userController');
const { protect, authorize, rateLimit } = require('../middleware/auth');

// Apply rate limiting to user routes
const userRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes

// All routes are protected (require authentication)
router.use(protect);

// @desc    Get user dashboard with account balance and recent transactions
// @route   GET /api/user/dashboard
// @access  Private
router.get('/dashboard', userRateLimit, getDashboard);

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', userRateLimit, getProfile);

// @desc    Update user profile
// @route   PUT /api/user/profile
// @route   PATCH /api/user/profile
// @access  Private
router.put('/profile', userRateLimit, updateProfile);
router.patch('/profile', userRateLimit, updateProfile);

// @desc    Get user's account information
// @route   GET /api/user/account
// @access  Private
router.get('/account', userRateLimit, getAccount);

// @desc    Get user statistics (admin only)
// @route   GET /api/user/stats
// @access  Private/Admin
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const { User, Account, Transaction } = require('../models');
    
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ isActive: true });
    
    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const transactionsByType = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate total balance across all accounts
    const totalBalanceResult = await Account.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' }
        }
      }
    ]);
    
    const totalBalance = totalBalanceResult.length > 0 ? totalBalanceResult[0].totalBalance : 0;
    
    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          recentRegistrations
        },
        accounts: {
          total: totalAccounts,
          active: activeAccounts,
          inactive: totalAccounts - activeAccounts,
          totalBalance,
          formattedTotalBalance: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        transactions: {
          total: totalTransactions,
          byType: transactionsByType
        }
      }
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/user/all
// @access  Private/Admin
router.get('/all', authorize('admin'), async (req, res) => {
  try {
    const { User } = require('../models');
    const { page = 1, limit = 20, search, status } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && ['active', 'inactive'].includes(status)) {
      query.isActive = status === 'active';
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Toggle user status (admin only)
// @route   PATCH /api/user/:id/toggle-status
// @access  Private/Admin
router.patch('/:id/toggle-status', authorize('admin'), async (req, res) => {
  try {
    const { User } = require('../models');
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id && user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }
    
    // Toggle status
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;