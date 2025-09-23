const { User, Account } = require('../models');
const json2csv = require('json2csv').parse;

/**
 * Export users to CSV format
 * @route GET /api/admin/users/export/csv
 * @access Private/Admin
 */
const exportUsersToCSV = async (req, res) => {
  try {
    const { 
      search = '', 
      status = '', 
      role = '', 
      isActive = '' 
    } = req.query;

    // Build query with same filters as getAllUsers
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Get all users matching the criteria
    const users = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Get user accounts for balance information
    const userIds = users.map(user => user._id);
    const accounts = await Account.find({ userId: { $in: userIds } });
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account.userId.toString()] = account;
    });

    // Format data for CSV export
    const csvData = users.map(user => {
      const account = accountMap[user._id.toString()];
      return {
        'User ID': user._id,
        'Name': user.name,
        'Email': user.email,
        'Phone': user.phone || '',
        'Role': user.role,
        'Status': user.status,
        'Active': user.isActive ? 'Yes' : 'No',
        'Verified': user.isVerified ? 'Yes' : 'No',
        'Account Number': account ? account.accountNumber : '',
        'Balance': account ? account.balance : 0,
        'Account Type': account ? account.accountType : '',
        'Approved By': user.approvedBy ? user.approvedBy.name : '',
        'Approved At': user.approvedAt ? user.approvedAt.toISOString().split('T')[0] : '',
        'Rejection Reason': user.rejectionReason || '',
        'Last Login': user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '',
        'Created At': user.createdAt.toISOString().split('T')[0],
        'Updated At': user.updatedAt.toISOString().split('T')[0]
      };
    });

    // Define CSV fields
    const fields = [
      'User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Active', 'Verified',
      'Account Number', 'Balance', 'Account Type', 'Approved By', 'Approved At',
      'Rejection Reason', 'Last Login', 'Created At', 'Updated At'
    ];

    // Convert to CSV
    const csv = json2csv(csvData, { fields });

    // Set response headers for file download
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(csv);

  } catch (error) {
    console.error('Export users to CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting users to CSV'
    });
  }
};

/**
 * Export users to Excel format (JSON for frontend to handle)
 * @route GET /api/admin/users/export/excel
 * @access Private/Admin
 */
const exportUsersToExcel = async (req, res) => {
  try {
    const { 
      search = '', 
      status = '', 
      role = '', 
      isActive = '' 
    } = req.query;

    // Build query with same filters as getAllUsers
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Get all users matching the criteria
    const users = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Get user accounts for balance information
    const userIds = users.map(user => user._id);
    const accounts = await Account.find({ userId: { $in: userIds } });
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account.userId.toString()] = account;
    });

    // Format data for Excel export
    const excelData = users.map(user => {
      const account = accountMap[user._id.toString()];
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        isVerified: user.isVerified,
        accountNumber: account ? account.accountNumber : '',
        balance: account ? account.balance : 0,
        accountType: account ? account.accountType : '',
        approvedBy: user.approvedBy ? user.approvedBy.name : '',
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason || '',
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    // Return JSON data for frontend Excel generation
    res.status(200).json({
      success: true,
      message: 'User data prepared for Excel export',
      data: {
        users: excelData,
        filename: `users_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        totalRecords: excelData.length
      }
    });

  } catch (error) {
    console.error('Export users to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while preparing users for Excel export'
    });
  }
};

/**
 * Get export statistics
 * @route GET /api/admin/users/export/stats
 * @access Private/Admin
 */
const getExportStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const rejectedUsers = await User.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      message: 'Export statistics retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        pendingUsers,
        approvedUsers,
        rejectedUsers,
        exportDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get export stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching export statistics'
    });
  }
};

// Export users data (generic handler)
const exportUsers = async (req, res) => {
  const { format = 'csv' } = req.query;
  
  if (format === 'excel') {
    return await exportUsersToExcel(req, res);
  } else {
    return await exportUsersToCSV(req, res);
  }
};

// Export transactions data
const exportTransactions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Transaction export functionality not yet implemented',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while exporting transactions'
    });
  }
};

// Export financial reports
const exportReports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Reports export functionality not yet implemented',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while exporting reports'
    });
  }
};

module.exports = {
  exportUsersToCSV,
  exportUsersToExcel,
  getExportStats,
  exportUsers,
  exportTransactions,
  exportReports
};