const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const {
  balanceAdjustmentRateLimit,
  userDataAccessRateLimit,
  exportOperationsRateLimit,
  logAdminAction
} = require('../middleware/security');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const bulkActionController = require('../controllers/bulkActionController');
const userExportController = require('../controllers/userExportController');

// ============================================================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================================================

// Get all users with advanced filtering and pagination
router.get('/admin/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

// Get specific user by ID
router.get('/admin/users/:id', authMiddleware, adminMiddleware, adminController.getUserById);

// Create new user (admin only)
router.post('/admin/users', authMiddleware, adminMiddleware, adminController.createUser);

// Update user information
router.put('/admin/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);

// Delete user (soft delete)
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

// Update user status (approve/reject/suspend)
router.patch('/admin/users/:id/status', authMiddleware, adminMiddleware, adminController.updateUserStatus);

// Reset user password
router.post('/admin/users/:id/reset-password', authMiddleware, adminMiddleware, adminController.resetUserPassword);

// ============================================================================
// ADMIN FINANCIAL MANAGEMENT ENDPOINTS
// ============================================================================

// Adjust user balance
router.post('/admin/users/:id/adjust-balance', 
  balanceAdjustmentRateLimit,
  authMiddleware, 
  adminMiddleware, 
  logAdminAction('adjust_user_balance', 'financial_operations'),
  adminController.adjustUserBalance
);

// Get balance history for user
router.get('/admin/users/:id/balance-history', 
  userDataAccessRateLimit,
  authMiddleware, 
  adminMiddleware, 
  logAdminAction('view_balance_history', 'user_data_access'),
  adminController.getBalanceHistory
);

// Export balance history for user
router.get('/admin/users/:id/balance-history/export', 
  exportOperationsRateLimit,
  authMiddleware, 
  adminMiddleware, 
  logAdminAction('export_balance_history', 'data_export'),
  adminController.exportBalanceHistory
);

// Get flagged transactions
router.get('/admin/transactions/flagged', authMiddleware, adminMiddleware, adminController.getFlaggedTransactions);

// Get filtered transactions with advanced search
router.get('/admin/transactions/filtered', authMiddleware, adminMiddleware, adminController.getFilteredTransactions);

// Approve transaction
router.post('/admin/transactions/:id/approve', authMiddleware, adminMiddleware, adminController.approveTransaction);

// Reject transaction
router.post('/admin/transactions/:id/reject', authMiddleware, adminMiddleware, adminController.rejectTransaction);

// Add comment to transaction
router.post('/admin/transactions/:id/comments', authMiddleware, adminMiddleware, adminController.addTransactionComment);

// Get transaction with comments
router.get('/admin/transactions/:id/comments', authMiddleware, adminMiddleware, adminController.getTransactionWithComments);

// ============================================================================
// ADMIN BULK OPERATIONS ENDPOINTS
// ============================================================================

// Bulk approve transactions
router.post('/admin/transactions/bulk-approve', authMiddleware, adminMiddleware, adminController.bulkApproveTransactions);

// Bulk reject transactions
router.post('/admin/transactions/bulk-reject', authMiddleware, adminMiddleware, adminController.bulkRejectTransactions);

// Bulk user operations
router.post('/admin/users/bulk-action', authMiddleware, adminMiddleware, bulkActionController.performBulkAction);

// Bulk approve deposit requests
router.post('/admin/deposits/bulk-approve', authMiddleware, adminMiddleware, adminController.bulkApproveDepositRequests);

// Bulk cancel deposit requests
router.post('/admin/deposits/bulk-cancel', authMiddleware, adminMiddleware, adminController.bulkCancelDepositRequests);

// Bulk approve withdrawal requests
router.post('/admin/withdrawals/bulk-approve', authMiddleware, adminMiddleware, adminController.bulkApproveWithdrawalRequests);

// Bulk reject withdrawal requests
router.post('/admin/withdrawals/bulk-reject', authMiddleware, adminMiddleware, adminController.bulkRejectWithdrawalRequests);

// Bulk update withdrawal priority
router.post('/admin/withdrawals/bulk-priority', authMiddleware, adminMiddleware, adminController.bulkUpdateWithdrawalPriority);

// ============================================================================
// ADMIN DEPOSIT/WITHDRAWAL MANAGEMENT ENDPOINTS
// ============================================================================

// Get deposit requests
router.get('/admin/deposits', authMiddleware, adminMiddleware, adminController.getDepositRequests);

// Approve deposit request
router.post('/admin/deposits/:id/approve', authMiddleware, adminMiddleware, adminController.approveDepositRequest);

// Cancel deposit request
router.post('/admin/deposits/:id/cancel', authMiddleware, adminMiddleware, adminController.cancelDepositRequest);

// Get withdrawal requests
router.get('/admin/withdrawals', authMiddleware, adminMiddleware, adminController.getWithdrawalRequests);

// Approve withdrawal request
router.post('/admin/withdrawals/:id/approve', authMiddleware, adminMiddleware, adminController.approveWithdrawalRequest);

// Reject withdrawal request
router.post('/admin/withdrawals/:id/reject', authMiddleware, adminMiddleware, adminController.rejectWithdrawalRequest);

// Update withdrawal priority
router.patch('/admin/withdrawals/:id/priority', authMiddleware, adminMiddleware, adminController.updateWithdrawalPriority);

// ============================================================================
// ADMIN DASHBOARD & ANALYTICS ENDPOINTS
// ============================================================================

// Get system statistics
router.get('/admin/stats/system', authMiddleware, adminMiddleware, adminController.getSystemStats);

// Get dashboard statistics
router.get('/admin/stats/dashboard', authMiddleware, adminMiddleware, adminController.getDashboardStats);

// Get monitoring statistics
router.get('/admin/stats/monitoring', authMiddleware, adminMiddleware, adminController.getMonitoringStats);

// Get financial reports
router.get('/admin/reports/financial', authMiddleware, adminMiddleware, adminController.getFinancialReports);

// ============================================================================
// ADMIN SETTINGS & CONFIGURATION ENDPOINTS
// ============================================================================

// Get verification settings
router.get('/admin/settings/verification', authMiddleware, adminMiddleware, adminController.getVerificationSettings);

// Update verification settings
router.put('/admin/settings/verification', authMiddleware, adminMiddleware, adminController.updateVerificationSettings);

// ============================================================================
// ADMIN EXPORT ENDPOINTS
// ============================================================================

// Export users data
router.get('/admin/export/users', authMiddleware, adminMiddleware, userExportController.exportUsers);

// Export transactions data
router.get('/admin/export/transactions', authMiddleware, adminMiddleware, userExportController.exportTransactions);

// Export financial reports
router.get('/admin/export/reports', authMiddleware, adminMiddleware, userExportController.exportReports);

// ============================================================================
// ADMIN SEARCH ENDPOINTS
// ============================================================================

// Global search across users and transactions
router.get('/admin/search', authMiddleware, adminMiddleware, (req, res) => {
  const { query, type = 'all', page = 1, limit = 10 } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  // Implement global search logic here
  // This would search across users, transactions, and other entities
  res.json({
    success: true,
    message: 'Search functionality coming soon',
    data: {
      results: [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: 0,
        totalResults: 0
      }
    }
  });
});

// ============================================================================
// ADMIN AUDIT LOG ENDPOINTS
// ============================================================================

// Get audit logs
router.get('/admin/audit-logs', authMiddleware, adminMiddleware, (req, res) => {
  const { page = 1, limit = 20, action = '', userId = '', startDate = '', endDate = '' } = req.query;
  
  // Implement audit log retrieval
  res.json({
    success: true,
    message: 'Audit logs retrieved successfully',
    data: {
      logs: [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: 0,
        totalLogs: 0
      }
    }
  });
});

// ============================================================================
// ADMIN NOTIFICATION ENDPOINTS
// ============================================================================

// Get admin notifications
router.get('/admin/notifications', authMiddleware, adminMiddleware, (req, res) => {
  const { page = 1, limit = 10, type = '', read = '' } = req.query;
  
  // Implement notification retrieval
  res.json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications: [],
      unreadCount: 0,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 0,
        totalNotifications: 0
      }
    }
  });
});

// Mark notification as read
router.patch('/admin/notifications/:id/read', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// Mark all notifications as read
router.patch('/admin/notifications/read-all', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = router;