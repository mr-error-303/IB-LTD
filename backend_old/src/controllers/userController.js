const { User, Account, Transaction } = require('../models');

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if we're in development mode with memory database
    if (process.env.MONGODB_URI === 'memory') {
      // Return demo data for development
      const demoData = {
        user: {
          id: userId,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isActive: true,
          createdAt: new Date()
        },
        account: {
          accountNumber: 'ACC-' + userId.slice(-8),
          balance: 15750.50,
          accountType: 'savings',
          currency: 'USD',
          isActive: true,
          createdAt: new Date()
        },
        recentTransactions: [
          {
            id: '1',
            type: 'deposit',
            amount: 1000,
            balanceBefore: 14750.50,
            balanceAfter: 15750.50,
            description: 'Salary deposit',
            transactionRef: 'TXN-001',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            toUser: null
          },
          {
            id: '2',
            type: 'transfer_out',
            amount: 250,
            balanceBefore: 16000.50,
            balanceAfter: 15750.50,
            description: 'Transfer to John Doe',
            transactionRef: 'TXN-002',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            toUser: { id: '2', name: 'John Doe', email: 'john@example.com' }
          }
        ],
        statistics: {
          transactionStats: {
            deposit: { count: 5, totalAmount: 5000 },
            withdraw: { count: 2, totalAmount: 500 },
            transfer_in: { count: 3, totalAmount: 1500 },
            transfer_out: { count: 4, totalAmount: 1000 }
          },
          thisMonthTransactions: 8,
          totalTransactions: 14
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully (Demo Mode)',
        data: demoData
      });
    }

    // Regular database mode
    // userId is already declared at the top of the function

    // Get user information
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's account information
    const account = await Account.findOne({ userId }).populate('userId', 'name email');
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('toUserId', 'name email')
      .select('type amount balanceBefore balanceAfter description createdAt toUserId transactionRef status');

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly transaction summary (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Calculate account summary
    const accountSummary = {
      accountNumber: account.accountNumber,
      balance: account.balance,
      formattedBalance: account.getFormattedBalance(),
      accountType: account.accountType,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt
    };

    // Format transaction statistics
    const formattedStats = {
      deposit: { count: 0, totalAmount: 0 },
      withdraw: { count: 0, totalAmount: 0 },
      transfer_in: { count: 0, totalAmount: 0 },
      transfer_out: { count: 0, totalAmount: 0 }
    };

    transactionStats.forEach(stat => {
      if (formattedStats[stat._id]) {
        formattedStats[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
      }
    });

    // Calculate total transactions this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthTransactions = await Transaction.countDocuments({
      userId,
      createdAt: { $gte: currentMonth }
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        account: accountSummary,
        recentTransactions: recentTransactions.map(transaction => ({
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
          toUser: transaction.toUserId ? {
            id: transaction.toUserId._id,
            name: transaction.toUserId.name,
            email: transaction.toUserId.email
          } : null
        })),
        statistics: {
          transactionStats: formattedStats,
          monthlyStats,
          thisMonthTransactions,
          totalTransactions: recentTransactions.length > 0 ? 
            await Transaction.countDocuments({ userId }) : 0
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Check if we're in development mode with memory database
    if (process.env.MONGODB_URI === 'memory') {
      // Return the user data from the auth middleware directly
      const user = req.user;
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt || user.createdAt
          }
        }
      });
    }

    // Regular database mode
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or email to update'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered with another account'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's account information
// @route   GET /api/user/account
// @access  Private
const getAccount = async (req, res) => {
  try {
    // Development mode - return mock account data
    if (process.env.MONGODB_URI === 'memory') {
      return res.status(200).json({
        success: true,
        message: 'Account information retrieved successfully',
        data: {
          account: {
            id: 'mock-account-id',
            accountNumber: '123456789012',
            balance: 5000.00,
            formattedBalance: 'USD 5000.00',
            accountType: 'savings',
            currency: 'USD',
            isActive: true,
            createdAt: new Date(),
            user: {
              id: req.user.id,
              name: req.user.name,
              email: req.user.email
            }
          }
        }
      });
    }

    const account = await Account.findOne({ userId: req.user.id })
      .populate('userId', 'name email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account information retrieved successfully',
      data: {
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          formattedBalance: account.getFormattedBalance(),
          accountType: account.accountType,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
          user: {
            id: account.userId._id,
            name: account.userId.name,
            email: account.userId.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching account information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getAccount
};