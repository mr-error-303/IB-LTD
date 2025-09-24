const { User, Transaction, ActivityLog } = require('../models');
const { logActivity } = require('../middleware/rolePermission');

// Search users with advanced filters
const searchUsers = async (req, res) => {
  try {
    const { filters, page = 1, limit = 20 } = req.body;
    const skip = (page - 1) * limit;

    // Build query object
    let query = {};
    let sort = { createdAt: -1 };

    // Text search
    if (filters.query) {
      query.$or = [
        { name: { $regex: filters.query, $options: 'i' } },
        { email: { $regex: filters.query, $options: 'i' } },
        { _id: filters.query }
      ];
    }

    // Role filter
    if (filters.role) {
      query.role = filters.role;
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Balance range
    if (filters.balanceMin || filters.balanceMax) {
      query.balance = {};
      if (filters.balanceMin) query.balance.$gte = parseFloat(filters.balanceMin);
      if (filters.balanceMax) query.balance.$lte = parseFloat(filters.balanceMax);
    }

    // Date range
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    // Verification status
    if (filters.isVerified !== undefined && filters.isVerified !== '') {
      query.isVerified = filters.isVerified === 'true';
    }

    // Has transactions filter
    if (filters.hasTransactions === 'true') {
      const usersWithTransactions = await Transaction.distinct('userId');
      query._id = { $in: usersWithTransactions };
    } else if (filters.hasTransactions === 'false') {
      const usersWithTransactions = await Transaction.distinct('userId');
      query._id = { $nin: usersWithTransactions };
    }

    // Execute search
    const [results, total] = await Promise.all([
      User.find(query)
        .populate('adminRole', 'name level')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Log search activity
    await logActivity(req.user._id, 'user_search', 'search', 'User', null, {
      filters,
      resultsCount: results.length,
      totalMatches: total
    });

    res.json({
      success: true,
      results,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: skip + results.length < total
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// Search transactions with advanced filters
const searchTransactions = async (req, res) => {
  try {
    const { filters, page = 1, limit = 20 } = req.body;
    const skip = (page - 1) * limit;

    // Build query object
    let query = {};
    let sort = { createdAt: -1 };

    // Text search
    if (filters.query) {
      query.$or = [
        { _id: filters.query },
        { description: { $regex: filters.query, $options: 'i' } },
        { reference: { $regex: filters.query, $options: 'i' } }
      ];
    }

    // Type filter
    if (filters.type) {
      query.type = filters.type;
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Amount range
    if (filters.amountMin || filters.amountMax) {
      query.amount = {};
      if (filters.amountMin) query.amount.$gte = parseFloat(filters.amountMin);
      if (filters.amountMax) query.amount.$lte = parseFloat(filters.amountMax);
    }

    // Date range
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    // User filter
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Method filter
    if (filters.method) {
      query.method = filters.method;
    }

    // Execute search
    const [results, total] = await Promise.all([
      Transaction.find(query)
        .populate('userId', 'name email')
        .populate('approvedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(query)
    ]);

    // Log search activity
    await logActivity(req.user._id, 'transaction_search', 'search', 'Transaction', null, {
      filters,
      resultsCount: results.length,
      totalMatches: total
    });

    res.json({
      success: true,
      results,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: skip + results.length < total
    });

  } catch (error) {
    console.error('Transaction search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search transactions'
    });
  }
};

// Search activity logs with advanced filters
const searchLogs = async (req, res) => {
  try {
    const { filters, page = 1, limit = 20 } = req.body;
    const skip = (page - 1) * limit;

    // Build query object
    let query = {};
    let sort = { timestamp: -1 };

    // Text search
    if (filters.query) {
      query.$or = [
        { action: { $regex: filters.query, $options: 'i' } },
        { details: { $regex: filters.query, $options: 'i' } },
        { targetId: filters.query }
      ];
    }

    // Action filter
    if (filters.action) {
      query.action = filters.action;
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Admin filter
    if (filters.adminId) {
      query.adminId = filters.adminId;
    }

    // Target type filter
    if (filters.targetType) {
      query.targetType = filters.targetType;
    }

    // Date range
    if (filters.dateFrom || filters.dateTo) {
      query.timestamp = {};
      if (filters.dateFrom) query.timestamp.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.timestamp.$lte = new Date(filters.dateTo);
    }

    // Execute search
    const [results, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('adminId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    // Log search activity
    await logActivity(req.user._id, 'log_search', 'search', 'ActivityLog', null, {
      filters,
      resultsCount: results.length,
      totalMatches: total
    });

    res.json({
      success: true,
      results,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: skip + results.length < total
    });

  } catch (error) {
    console.error('Log search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search logs'
    });
  }
};

// Save search for future use
const saveSearch = async (req, res) => {
  try {
    const { name, description, type, filters } = req.body;

    if (!name || !type || !filters) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and filters are required'
      });
    }

    // Check if search name already exists for this user
    const existingSearch = await SavedSearch.findOne({
      adminId: req.user._id,
      name: name.trim()
    });

    if (existingSearch) {
      return res.status(400).json({
        success: false,
        message: 'A search with this name already exists'
      });
    }

    const savedSearch = new SavedSearch({
      adminId: req.user._id,
      name: name.trim(),
      description: description?.trim(),
      type,
      filters,
      createdAt: new Date()
    });

    await savedSearch.save();

    // Log activity
    await logActivity(req.user._id, 'search_save', 'search', 'SavedSearch', savedSearch._id, {
      searchName: name,
      searchType: type
    });

    res.json({
      success: true,
      message: 'Search saved successfully',
      search: savedSearch
    });

  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search'
    });
  }
};

// Get saved searches for current user
const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ adminId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      searches
    });

  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved searches'
    });
  }
};

// Delete saved search
const deleteSavedSearch = async (req, res) => {
  try {
    const { searchId } = req.params;

    const search = await SavedSearch.findOne({
      _id: searchId,
      adminId: req.user._id
    });

    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found'
      });
    }

    await SavedSearch.findByIdAndDelete(searchId);

    // Log activity
    await logActivity(req.user._id, 'search_delete', 'search', 'SavedSearch', searchId, {
      searchName: search.name
    });

    res.json({
      success: true,
      message: 'Search deleted successfully'
    });

  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete search'
    });
  }
};

// Save recent search
const saveRecentSearch = async (req, res) => {
  try {
    const { type, filters } = req.body;

    // Remove old recent searches (keep only last 10)
    const recentSearches = await RecentSearch.find({ adminId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(9);

    if (recentSearches.length > 0) {
      await RecentSearch.deleteMany({
        _id: { $in: recentSearches.map(s => s._id) }
      });
    }

    const recentSearch = new RecentSearch({
      adminId: req.user._id,
      type,
      filters,
      timestamp: new Date()
    });

    await recentSearch.save();

    res.json({
      success: true,
      message: 'Recent search saved'
    });

  } catch (error) {
    console.error('Save recent search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save recent search'
    });
  }
};

// Get recent searches for current user
const getRecentSearches = async (req, res) => {
  try {
    const searches = await RecentSearch.find({ adminId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      searches
    });

  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent searches'
    });
  }
};

// Export search results
const exportSearchResults = async (req, res) => {
  try {
    const { type } = req.params;
    const { filters, format = 'csv' } = req.body;

    let results = [];
    let headers = [];

    // Get results based on type
    switch (type) {
      case 'users':
        const userQuery = buildUserQuery(filters);
        results = await User.find(userQuery)
          .populate('adminRole', 'name')
          .lean();
        headers = ['Name', 'Email', 'Role', 'Balance', 'Status', 'Verified', 'Created'];
        break;

      case 'transactions':
        const transactionQuery = buildTransactionQuery(filters);
        results = await Transaction.find(transactionQuery)
          .populate('userId', 'name email')
          .lean();
        headers = ['ID', 'Type', 'Amount', 'User', 'Status', 'Method', 'Created'];
        break;

      case 'logs':
        const logQuery = buildLogQuery(filters);
        results = await ActivityLog.find(logQuery)
          .populate('adminId', 'name')
          .lean();
        headers = ['Timestamp', 'Action', 'Admin', 'Category', 'Target Type', 'Details'];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      const csv = convertToCSV(results, type, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.json"`);
      res.json(results);
    }

    // Log export activity
    await logActivity(req.user._id, 'search_export', 'search', type, null, {
      exportType: type,
      format,
      recordCount: results.length
    });

  } catch (error) {
    console.error('Export search results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export results'
    });
  }
};

// Helper functions
const buildUserQuery = (filters) => {
  let query = {};

  if (filters.query) {
    query.$or = [
      { name: { $regex: filters.query, $options: 'i' } },
      { email: { $regex: filters.query, $options: 'i' } }
    ];
  }

  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.balanceMin || filters.balanceMax) {
    query.balance = {};
    if (filters.balanceMin) query.balance.$gte = parseFloat(filters.balanceMin);
    if (filters.balanceMax) query.balance.$lte = parseFloat(filters.balanceMax);
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  return query;
};

const buildTransactionQuery = (filters) => {
  let query = {};

  if (filters.query) {
    query.$or = [
      { _id: filters.query },
      { description: { $regex: filters.query, $options: 'i' } }
    ];
  }

  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.amountMin || filters.amountMax) {
    query.amount = {};
    if (filters.amountMin) query.amount.$gte = parseFloat(filters.amountMin);
    if (filters.amountMax) query.amount.$lte = parseFloat(filters.amountMax);
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  return query;
};

const buildLogQuery = (filters) => {
  let query = {};

  if (filters.query) {
    query.$or = [
      { action: { $regex: filters.query, $options: 'i' } },
      { details: { $regex: filters.query, $options: 'i' } }
    ];
  }

  if (filters.action) query.action = filters.action;
  if (filters.category) query.category = filters.category;
  if (filters.adminId) query.adminId = filters.adminId;
  if (filters.targetType) query.targetType = filters.targetType;
  if (filters.dateFrom || filters.dateTo) {
    query.timestamp = {};
    if (filters.dateFrom) query.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.timestamp.$lte = new Date(filters.dateTo);
  }

  return query;
};

const convertToCSV = (data, type, headers) => {
  if (data.length === 0) return headers.join(',');

  const rows = [headers.join(',')];

  data.forEach(item => {
    let row = [];
    
    switch (type) {
      case 'users':
        row = [
          item.name || '',
          item.email || '',
          item.role || '',
          item.balance || 0,
          item.status || 'active',
          item.isVerified ? 'Yes' : 'No',
          new Date(item.createdAt).toLocaleDateString()
        ];
        break;

      case 'transactions':
        row = [
          item._id || '',
          item.type || '',
          item.amount || 0,
          item.userId?.name || '',
          item.status || '',
          item.method || '',
          new Date(item.createdAt).toLocaleDateString()
        ];
        break;

      case 'logs':
        row = [
          new Date(item.timestamp).toLocaleString(),
          item.action || '',
          item.adminId?.name || 'System',
          item.category || '',
          item.targetType || '',
          (item.details || '').replace(/,/g, ';')
        ];
        break;
    }

    rows.push(row.map(field => `"${field}"`).join(','));
  });

  return rows.join('\n');
};

// Create models for saved and recent searches
const mongoose = require('mongoose');

const SavedSearchSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['users', 'transactions', 'logs'], required: true },
  filters: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RecentSearchSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['users', 'transactions', 'logs'], required: true },
  filters: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SavedSearch = mongoose.model('SavedSearch', SavedSearchSchema);
const RecentSearch = mongoose.model('RecentSearch', RecentSearchSchema);

module.exports = {
  searchUsers,
  searchTransactions,
  searchLogs,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  saveRecentSearch,
  getRecentSearches,
  exportSearchResults
};