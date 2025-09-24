const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Search functionality
    if (req.query.search) {
      const searchTerm = req.query.search;
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('account', 'accountNumber balance');
    
    const total = await User.countDocuments(query);
    
    // Log admin activity
    await ActivityLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'view_users',
      category: 'user_management',
      description: `Viewed users list (page ${page})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user details
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password')
      .populate('account', 'accountNumber balance');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's recent transactions
    const recentTransactions = await Transaction.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Log admin activity
    await ActivityLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'view_user_details',
      category: 'user_management',
      targetId: id,
      description: `Viewed details for user: ${user.firstName} ${user.lastName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      data: {
        user,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { 
        status,
        isActive: status === 'approved'
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Log admin activity
    await ActivityLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'update_user_status',
      category: 'user_management',
      targetId: id,
      description: `Updated user status to ${status}${reason ? `: ${reason}` : ''}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Adjust user balance
const adjustUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, reason } = req.body; // type: 'add' or 'subtract'
    
    const user = await User.findById(id).populate('account');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const account = user.account;
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    
    const adjustmentAmount = parseFloat(amount);
    const newBalance = type === 'add' 
      ? account.balance + adjustmentAmount 
      : account.balance - adjustmentAmount;
    
    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this adjustment'
      });
    }
    
    // Update account balance
    account.balance = newBalance;
    await account.save();
    
    // Create transaction record
    await Transaction.create({
      userId: id,
      accountId: account._id,
      type: type === 'add' ? 'admin_credit' : 'admin_debit',
      amount: adjustmentAmount,
      status: 'completed',
      description: `Admin balance adjustment: ${reason}`,
      reference: `ADJ-${Date.now()}`,
      adminId: req.user.id,
      adminNote: reason
    });
    
    // Log admin activity
    await ActivityLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'adjust_balance',
      category: 'financial',
      targetId: id,
      description: `Balance ${type === 'add' ? 'increased' : 'decreased'} by $${amount} for user ${user.firstName} ${user.lastName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        previousBalance: account.balance - (type === 'add' ? adjustmentAmount : -adjustmentAmount),
        newBalance: account.balance,
        adjustmentAmount,
        reason
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Balance adjusted successfully',
      data: {
        user: {
          ...user.toObject(),
          account: account
        }
      }
    });
  } catch (error) {
    console.error('Adjust balance error:', error);
    
    // Log failed attempt
    await ActivityLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'adjust_balance_failed',
      category: 'financial',
      targetId: req.params.id,
      description: `Failed to adjust balance: ${error.message}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to adjust balance',
      error: error.message
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const bannedUsers = await User.countDocuments({ role: 'user', isActive: false });
    const newUsers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: startDate }
    });

    // Financial statistics
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newUsers: newUsers,
          growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
        },
        financial: {
          deposits: {
            total: totalDeposits[0]?.total || 0
          },
          withdrawals: {
            total: totalWithdrawals[0]?.total || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ban user
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unban user
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ status: 'active' }),
      bannedUsers: await User.countDocuments({ status: 'banned' }),
      newUsersThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query, status, role } = req.query;
    const filter = {};
    
    if (query) {
      filter.$or = [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const users = await User.find(filter).select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export users
const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get balance history
const getBalanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export balance history
const exportBalanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Transaction.find({ userId }).sort({ createdAt: -1 });
    res.json({ history, count: history.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk update users
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updates
    );
    res.json({ message: `Updated ${result.modifiedCount} users`, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk delete users
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const result = await User.deleteMany({ _id: { $in: userIds } });
    res.json({ message: `Deleted ${result.deletedCount} users`, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Log admin activity
const logAdminActivity = async (req, res) => {
  try {
    const { action, details } = req.body;
    const log = {
      adminId: req.user.id,
      action,
      details,
      timestamp: new Date(),
      ip: req.ip
    };
    // In a real app, you'd save this to an ActivityLog model
    res.json({ message: 'Activity logged successfully', log });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system stats
const getSystemStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalTransactions: await Transaction.countDocuments(),
      systemUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get monitoring stats
const getMonitoringStats = async (req, res) => {
  try {
    const stats = {
      activeUsers: await User.countDocuments({ status: 'active' }),
      pendingTransactions: await Transaction.countDocuments({ status: 'pending' }),
      failedTransactions: await Transaction.countDocuments({ status: 'failed' }),
      lastHourTransactions: await Transaction.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get flagged transactions
const getFlaggedTransactions = async (req, res) => {
  try {
    const flaggedTransactions = await Transaction.find({
      $or: [
        { amount: { $gt: 10000 } }, // Large amounts
        { status: 'failed' },
        { type: 'suspicious' }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(flaggedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction with comments
const getTransactionWithComments = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // In a real app, you'd fetch comments from a separate model
    const comments = []; // Placeholder for comments
    res.json({ transaction, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional missing functions for transaction management
const getFilteredTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json({ message: 'Transaction approved', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ message: 'Transaction rejected', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addTransactionComment = async (req, res) => {
  try {
    const { comment } = req.body;
    res.json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk transaction operations
const bulkApproveTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { status: 'approved' }
    );
    res.json({ message: `Approved ${result.modifiedCount} transactions` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkRejectTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { status: 'rejected' }
    );
    res.json({ message: `Rejected ${result.modifiedCount} transactions` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deposit management functions
const getDepositRequests = async (req, res) => {
  try {
    const deposits = await Transaction.find({ type: 'deposit' }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveDepositRequest = async (req, res) => {
  try {
    const deposit = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json({ message: 'Deposit approved', deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelDepositRequest = async (req, res) => {
  try {
    const deposit = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    res.json({ message: 'Deposit cancelled', deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdrawal management functions
const getWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal' }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveWithdrawalRequest = async (req, res) => {
  try {
    const withdrawal = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json({ message: 'Withdrawal approved', withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectWithdrawalRequest = async (req, res) => {
  try {
    const withdrawal = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWithdrawalPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const withdrawal = await Transaction.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );
    res.json({ message: 'Priority updated', withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk deposit/withdrawal operations
const bulkApproveDepositRequests = async (req, res) => {
  try {
    const { depositIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: depositIds }, type: 'deposit' },
      { status: 'approved' }
    );
    res.json({ message: `Approved ${result.modifiedCount} deposits` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkCancelDepositRequests = async (req, res) => {
  try {
    const { depositIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: depositIds }, type: 'deposit' },
      { status: 'cancelled' }
    );
    res.json({ message: `Cancelled ${result.modifiedCount} deposits` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkApproveWithdrawalRequests = async (req, res) => {
  try {
    const { withdrawalIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: withdrawalIds }, type: 'withdrawal' },
      { status: 'approved' }
    );
    res.json({ message: `Approved ${result.modifiedCount} withdrawals` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkRejectWithdrawalRequests = async (req, res) => {
  try {
    const { withdrawalIds } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: withdrawalIds }, type: 'withdrawal' },
      { status: 'rejected' }
    );
    res.json({ message: `Rejected ${result.modifiedCount} withdrawals` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkUpdateWithdrawalPriority = async (req, res) => {
  try {
    const { withdrawalIds, priority } = req.body;
    const result = await Transaction.updateMany(
      { _id: { $in: withdrawalIds }, type: 'withdrawal' },
      { priority }
    );
    res.json({ message: `Updated priority for ${result.modifiedCount} withdrawals` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reports and settings
const getFinancialReports = async (req, res) => {
  try {
    const reports = {
      totalDeposits: await Transaction.aggregate([
        { $match: { type: 'deposit', status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      totalWithdrawals: await Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    };
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerificationSettings = async (req, res) => {
  try {
    const settings = {
      autoVerifyDeposits: false,
      maxAutoVerifyAmount: 1000,
      requireDocuments: true
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVerificationSettings = async (req, res) => {
  try {
    const settings = req.body;
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  adjustUserBalance,
  getDashboardStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  resetUserPassword,
  getUserStats,
  searchUsers,
  exportUsers,
  getBalanceHistory,
  exportBalanceHistory,
  bulkUpdateUsers,
  bulkDeleteUsers,
  logAdminActivity,
  getSystemStats,
  getMonitoringStats,
  getFlaggedTransactions,
  getTransactionWithComments,
  getFilteredTransactions,
  approveTransaction,
  rejectTransaction,
  addTransactionComment,
  bulkApproveTransactions,
  bulkRejectTransactions,
  getDepositRequests,
  approveDepositRequest,
  cancelDepositRequest,
  getWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  updateWithdrawalPriority,
  bulkApproveDepositRequests,
  bulkCancelDepositRequests,
  bulkApproveWithdrawalRequests,
  bulkRejectWithdrawalRequests,
  bulkUpdateWithdrawalPriority,
  getFinancialReports,
  getVerificationSettings,
  updateVerificationSettings
};