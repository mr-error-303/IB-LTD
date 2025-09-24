const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { requirePermission, requireAnyPermission, logActivity } = require('../middleware/rolePermission');
const rateLimit = require('express-rate-limit');
const {
  financialOperationsRateLimit,
  balanceAdjustmentRateLimit,
  userDataAccessRateLimit,
  exportOperationsRateLimit,
  securityHeaders,
  validateRequest,
  detectSuspiciousActivity,
  sessionSecurity,
  logAdminAction
} = require('../middleware/security');

// Import controllers
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  getUserStats,
  adjustBalance,
  getDashboardStats,
  searchUsers,
  exportUsers,
  bulkUpdateUsers,
  bulkDeleteUsers,
  logAdminActivity,
  resetUserPassword,
  getBalanceHistory,
  exportBalanceHistory,
  getSystemStats,
  getMonitoringStats,
  getFlaggedTransactions,
  getTransactionWithComments
} = require('../controllers/adminController');

const {
  getAllTransactions,
  getTransactionStats,
  getTransactionById,
  updateTransactionStatus,
  exportTransactions
} = require('../controllers/transactionAdminController');

const {
  searchTransactions
} = require('../controllers/searchController');

const {
  exportUsersToCSV
} = require('../controllers/userExportController');

const {
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  revokeRole,
  getRoleStats
} = require('../controllers/roleController');

const {
  getAllPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats
} = require('../controllers/permissionController');

const {
  getActivityLogs,
  getActivityLog,
  getActivityStats,
  exportLogsToCSV,
  cleanupOldLogs,
  getAdminActivitySummary
} = require('../controllers/activityLogController');

const {
  getAlertConfig,
  updateAlertConfig,
  checkSuspiciousTransactions,
  checkFailedLogins,
  sendAlertNotification,
  getAlertHistory,
  resetAlertConfig
} = require('../controllers/alertController');

const {
  bulkBalanceAdjustment,
  bulkUserExport,
  bulkTransactionActions,
  getBulkOperationHistory,
  getBulkOperationStats
} = require('../controllers/bulkActionController');

const {
  generateActivityReport,
  generateFinancialReport,
  generateSecurityReport
} = require('../controllers/reportController');

// Rate limiting for admin actions
const adminActionLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests, please try again later'
  }
});

// Apply security middleware to all admin routes
router.use(securityHeaders);
router.use(sessionSecurity);
router.use(detectSuspiciousActivity);
router.use(validateRequest({
  maxBodySize: '10mb',
  requireContentType: true,
  allowedContentTypes: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']
}));

// Apply rate limiting to all admin routes
router.use(adminActionLimit);

// Apply authentication and admin middleware to all routes
router.use(auth);
router.use(admin);

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
router.get('/users', 
  requireAnyPermission(['user_management', 'user_view']),
  logActivity('view_users', 'user_management'),
  getAllUsers
);

/**
 * @desc    Search users
 * @route   GET /api/admin/users/search
 * @access  Private/Admin
 */
router.get('/users/search',
  requireAnyPermission(['user_management', 'user_view']),
  logActivity('search_users', 'user_management'),
  searchUsers
);

/**
 * @desc    Export users data
 * @route   GET /api/admin/users/export
 * @access  Private/Admin
 */
router.get('/users/export',
  exportOperationsRateLimit,
  requirePermission('user_export'),
  logActivity('export_users', 'user_management'),
  logAdminAction('export_users', 'data_export'),
  exportUsersToCSV
);

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/users/stats
 * @access  Private/Admin
 */
router.get('/users/stats',
  requireAnyPermission(['user_management', 'user_view']),
  logActivity('view_user_stats', 'user_management'),
  (req, res) => {
    res.json({
      success: true,
      message: 'User statistics endpoint - to be implemented',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
      }
    });
  }
);

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
router.get('/users/:id',
  requireAnyPermission(['user_management', 'user_view']),
  logActivity('view_user_details', 'user_management'),
  getUserById
);

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
router.put('/users/:id',
  requirePermission('user_management'),
  logActivity('update_user', 'user_management'),
  updateUser
);

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
router.delete('/users/:id',
  requirePermission('user_delete'),
  logActivity('delete_user', 'user_management'),
  deleteUser
);

/**
 * @desc    Ban user
 * @route   POST /api/admin/users/:id/ban
 * @access  Private/Admin
 */
router.post('/users/:id/ban',
  requirePermission('user_ban'),
  logActivity('ban_user', 'user_management'),
  banUser
);

/**
 * @desc    Unban user
 * @route   POST /api/admin/users/:id/unban
 * @access  Private/Admin
 */
router.post('/users/:id/unban',
  requirePermission('user_ban'),
  logActivity('unban_user', 'user_management'),
  unbanUser
);

// ============================================================================
// TRANSACTION MANAGEMENT ROUTES
// ============================================================================

/**
 * @desc    Get all transactions with filtering
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
router.get('/transactions',
  requireAnyPermission(['transaction_management', 'transaction_view']),
  logActivity('view_transactions', 'transaction_management'),
  getAllTransactions
);

/**
 * @desc    Search transactions
 * @route   GET /api/admin/transactions/search
 * @access  Private/Admin
 */
router.get('/transactions/search',
  requireAnyPermission(['transaction_management', 'transaction_view']),
  logActivity('search_transactions', 'transaction_management'),
  searchTransactions
);

/**
 * @desc    Export transactions data
 * @route   GET /api/admin/transactions/export
 * @access  Private/Admin
 */
router.get('/transactions/export',
  exportOperationsRateLimit,
  requirePermission('transaction_export'),
  logActivity('export_transactions', 'transaction_management'),
  logAdminAction('export_transactions', 'data_export'),
  exportTransactions
);

/**
 * @desc    Get transaction statistics
 * @route   GET /api/admin/transactions/stats
 * @access  Private/Admin
 */
router.get('/transactions/stats',
  requireAnyPermission(['transaction_management', 'transaction_view']),
  logActivity('view_transaction_stats', 'transaction_management'),
  getTransactionStats
);

/**
 * @desc    Get transaction by ID
 * @route   GET /api/admin/transactions/:id
 * @access  Private/Admin
 */
router.get('/transactions/:id',
  requireAnyPermission(['transaction_management', 'transaction_view']),
  logActivity('view_transaction_details', 'transaction_management'),
  getTransactionById
);

/**
 * @desc    Update transaction status
 * @route   PUT /api/admin/transactions/:id/status
 * @access  Private/Admin
 */
router.put('/transactions/:id/status',
  requirePermission('transaction_management'),
  logActivity('update_transaction_status', 'transaction_management'),
  updateTransactionStatus
);

// ============================================================================
// ROLE MANAGEMENT ROUTES
// ============================================================================

/**
 * @desc    Get all admin roles
 * @route   GET /api/admin/roles
 * @access  Private/Admin
 */
// Replace all undefined function references with placeholders
const placeholderHandler = (message) => (req, res) => {
res.json({
success: true,
message: `${message} - to be implemented`,
data: {}
});
};

router.get('/roles',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_roles', 'role_management'),
  logAdminAction('view_roles', 'role_management'),
  getAllRoles
);

router.get('/roles/stats',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_role_stats', 'role_management'),
  logAdminAction('view_role_stats', 'role_management'),
  getRoleStats
);

router.get('/roles/:id',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_role_details', 'role_management'),
  logAdminAction('view_role_details', 'role_management'),
  getRole
);

router.post('/roles',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('create_role', 'role_management'),
  logAdminAction('create_role', 'role_management'),
  createRole
);

router.put('/roles/:id',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('update_role', 'role_management'),
  logAdminAction('update_role', 'role_management'),
  updateRole
);

router.delete('/roles/:id',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('delete_role', 'role_management'),
  logAdminAction('delete_role', 'role_management'),
  deleteRole
);

router.get('/permissions',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_permissions', 'role_management'),
  logAdminAction('view_permissions', 'role_management'),
  getAllPermissions
);

router.get('/permissions/stats',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_permission_stats', 'role_management'),
  logAdminAction('view_permission_stats', 'role_management'),
  getPermissionStats
);

router.get('/permissions/:id',
  userDataAccessRateLimit,
  requirePermission('role_management'),
  logActivity('view_permission_details', 'role_management'),
  logAdminAction('view_permission_details', 'role_management'),
  getPermission
);

router.post('/permissions',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('create_permission', 'role_management'),
  logAdminAction('create_permission', 'role_management'),
  createPermission
);

router.put('/permissions/:id',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('update_permission', 'role_management'),
  logAdminAction('update_permission', 'role_management'),
  updatePermission
);

router.delete('/permissions/:id',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('delete_permission', 'role_management'),
  logAdminAction('delete_permission', 'role_management'),
  deletePermission
);

router.post('/users/:id/roles',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('assign_user_role', 'role_management'),
  logAdminAction('assign_user_role', 'role_management'),
  assignRole
);

router.delete('/users/:id/roles/:roleId',
  balanceAdjustmentRateLimit,
  requirePermission('role_management'),
  logActivity('remove_user_role', 'role_management'),
  logAdminAction('remove_user_role', 'role_management'),
  revokeRole
);

router.get('/activity-logs',
  requirePermission('system_monitoring'),
  logActivity('view_activity_logs', 'system_monitoring'),
  placeholderHandler('Get activity logs endpoint')
);

router.get('/activity-logs/export',
  requirePermission('system_monitoring'),
  logActivity('export_activity_logs', 'system_monitoring'),
  placeholderHandler('Export activity logs endpoint')
);

router.get('/system/health',
  requirePermission('system_monitoring'),
  logActivity('view_system_health', 'system_monitoring'),
  placeholderHandler('Get system health endpoint')
);

router.get('/system/stats',
  requirePermission('system_monitoring'),
  logActivity('view_system_stats', 'system_monitoring'),
  placeholderHandler('Get system statistics endpoint')
);

router.get('/system/config',
  requirePermission('system_config'),
  logActivity('view_system_config', 'system_monitoring'),
  placeholderHandler('Get system configuration endpoint')
);

router.put('/system/config',
  requirePermission('system_config'),
  logActivity('update_system_config', 'system_monitoring'),
  placeholderHandler('Update system configuration endpoint')
);

router.post('/system/backup',
  requirePermission('system_config'),
  logActivity('create_backup', 'system_monitoring'),
  placeholderHandler('Create system backup endpoint')
);

router.get('/system/backups',
  requirePermission('system_config'),
  logActivity('view_backups', 'system_monitoring'),
  placeholderHandler('Get system backups endpoint')
);

router.post('/system/restore/:backupId',
  requirePermission('system_config'),
  logActivity('restore_backup', 'system_monitoring'),
  placeholderHandler('Restore system backup endpoint')
);

router.get('/activity-logs',
  requirePermission('system_monitoring'),
  logActivity('view_activity_logs', 'system_monitoring'),
  getActivityLogs
);

router.get('/activity-logs/stats',
  requirePermission('activity_logs'),
  logActivity('view_activity_stats', 'system_monitoring'),
  getActivityStats
);

router.get('/activity-logs/export/csv',
  requirePermission('activity_export'),
  logActivity('export_activity_logs', 'system_monitoring'),
  exportLogsToCSV
);

router.delete('/activity-logs/cleanup',
  requirePermission('system_maintenance'),
  logActivity('cleanup_activity_logs', 'system_maintenance'),
  cleanupOldLogs
);

router.get('/activity-logs/admin/:adminId/summary',
  requirePermission('activity_logs'),
  logActivity('view_admin_activity_summary', 'system_monitoring'),
  getAdminActivitySummary
);

router.get('/activity-logs/:id',
  requirePermission('activity_logs'),
  logActivity('view_activity_log_details', 'system_monitoring'),
  getActivityLog
);

// ============================================================================
// ALERT SYSTEM ROUTES
// ============================================================================

router.get('/alerts/config',
  requirePermission('view_alerts'),
  logActivity('view_alert_config', 'system_monitoring'),
  getAlertConfig
);

router.put('/alerts/config',
  requirePermission('manage_alerts'),
  logActivity('update_alert_config', 'system_monitoring'),
  updateAlertConfig
);

router.post('/alerts/check/suspicious-transactions',
  requirePermission('manage_alerts'),
  logActivity('check_suspicious_transactions', 'system_monitoring'),
  checkSuspiciousTransactions
);

router.post('/alerts/check/failed-logins',
  requirePermission('manage_alerts'),
  logActivity('check_failed_logins', 'system_monitoring'),
  checkFailedLogins
);

router.post('/alerts/send',
  requirePermission('manage_alerts'),
  logActivity('send_alert_notification', 'system_monitoring'),
  sendAlertNotification
);

router.get('/alerts/history',
  requirePermission('view_alerts'),
  logActivity('view_alert_history', 'system_monitoring'),
  getAlertHistory
);

router.post('/alerts/config/reset',
  requirePermission('manage_system'),
  logActivity('reset_alert_config', 'system_monitoring'),
  resetAlertConfig
);

// ============================================================================
// BULK ACTIONS ROUTES
// ============================================================================

router.post('/bulk/balance-adjustment',
  balanceAdjustmentRateLimit,
  financialOperationsRateLimit,
  requirePermission('manage_balances'),
  logActivity('bulk_balance_adjustment', 'bulk_operations'),
  logAdminAction('bulk_balance_adjustment', 'financial_operations'),
  placeholderHandler('Bulk balance adjustment endpoint')
);

router.post('/bulk/export-users',
  exportOperationsRateLimit,
  requirePermission('export_data'),
  logActivity('bulk_export_users', 'bulk_operations'),
  logAdminAction('bulk_export_users', 'data_export'),
  placeholderHandler('Bulk export users endpoint')
);

router.post('/bulk/transaction-actions',
  financialOperationsRateLimit,
  requirePermission('manage_transactions'),
  logActivity('bulk_transaction_actions', 'bulk_operations'),
  logAdminAction('bulk_transaction_actions', 'financial_operations'),
  placeholderHandler('Bulk transaction actions endpoint')
);

router.get('/bulk/operations/history',
  requirePermission('view_logs'),
  logActivity('view_bulk_operations', 'bulk_operations'),
  placeholderHandler('Get bulk operations history endpoint')
);

router.get('/bulk/operations/stats',
  requirePermission('view_logs'),
  logActivity('view_bulk_stats', 'bulk_operations'),
  placeholderHandler('Get bulk operations stats endpoint')
);

// ============================================================================
// ADVANCED SEARCH ROUTES
// ============================================================================

router.post('/search/users',
  requirePermission('user_management'),
  logActivity('advanced_search_users', 'search_operations'),
  placeholderHandler('Advanced user search endpoint')
);

router.post('/search/transactions',
  requirePermission('transaction_management'),
  logActivity('advanced_search_transactions', 'search_operations'),
  placeholderHandler('Advanced transaction search endpoint')
);

router.post('/search/logs',
  requirePermission('system_monitoring'),
  logActivity('advanced_search_logs', 'search_operations'),
  placeholderHandler('Advanced log search endpoint')
);

router.post('/search/save',
  requirePermission('system_monitoring'),
  logActivity('save_search_query', 'search_operations'),
  placeholderHandler('Save search query endpoint')
);

router.get('/search/saved',
  requirePermission('system_monitoring'),
  placeholderHandler('Get saved searches endpoint')
);

router.delete('/search/saved/:searchId',
  requirePermission('system_monitoring'),
  logActivity('delete_saved_search', 'search_operations'),
  placeholderHandler('Delete saved search endpoint')
);

router.post('/search/recent',
  requirePermission('system_monitoring'),
  placeholderHandler('Save recent search endpoint')
);

router.get('/search/recent',
  requirePermission('system_monitoring'),
  placeholderHandler('Get recent searches endpoint')
);

router.post('/search/export/:type',
  exportOperationsRateLimit,
  requirePermission('system_monitoring'),
  logActivity('export_search_results', 'search_operations'),
  logAdminAction('export_search_results', 'data_export'),
  placeholderHandler('Export search results endpoint')
);

// ============================================================================
// REPORTING ROUTES
// ============================================================================

/**
 * @desc    Generate admin activity report
 * @route   GET /api/admin/reports/activity
 * @access  Private/Admin
 */
router.get('/reports/activity',
  exportOperationsRateLimit,
  requirePermission('view_reports'),
  logActivity('generate_activity_report', 'reporting'),
  logAdminAction('generate_activity_report', 'reporting'),
  generateActivityReport
);

/**
 * @desc    Generate financial operations report
 * @route   GET /api/admin/reports/financial
 * @access  Private/Admin
 */
router.get('/reports/financial',
  exportOperationsRateLimit,
  requirePermission('view_reports'),
  logActivity('generate_financial_report', 'reporting'),
  logAdminAction('generate_financial_report', 'reporting'),
  generateFinancialReport
);

/**
 * @desc    Generate security events report
 * @route   GET /api/admin/reports/security
 * @access  Private/Admin
 */
router.get('/reports/security',
  exportOperationsRateLimit,
  requirePermission('view_reports'),
  logActivity('generate_security_report', 'reporting'),
  logAdminAction('generate_security_report', 'reporting'),
  generateSecurityReport
);

module.exports = router;