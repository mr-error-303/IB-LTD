import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Admin API methods
export const adminAPI = {
  // Generic GET method for admin endpoints
  get: (endpoint, config = {}) => api.get(`/admin${endpoint}`, config),
  
  // Generic POST method for admin endpoints
  post: (endpoint, data, config = {}) => api.post(`/admin${endpoint}`, data, config),
  
  // Generic PUT method for admin endpoints
  put: (endpoint, data, config = {}) => api.put(`/admin${endpoint}`, data, config),
  
  // Generic PATCH method for admin endpoints
  patch: (endpoint, data, config = {}) => api.patch(`/admin${endpoint}`, data, config),
  
  // Generic DELETE method for admin endpoints
  delete: (endpoint, config = {}) => api.delete(`/admin${endpoint}`, config),
  
  // Get all users with filtering and pagination
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  
  // Get user by ID
  getUserById: (userId) => api.get(`/admin/users/${userId}`),

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Update user details
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Reset user password
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      return response;
    } catch (error) {
      console.error('Reset user password error:', error);
      throw error;
    }
  },

  // Adjust user balance
  adjustBalance: async (userId, balanceData) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/balance`, balanceData);
      return response;
    } catch (error) {
      console.error('Adjust balance error:', error);
      throw error;
    }
  },

  // Get user balance history
  getBalanceHistory: async (userId, params = {}) => {
    try {
      const response = await api.get(`/admin/users/${userId}/balance-history`, { params });
      return response;
    } catch (error) {
      console.error('Get balance history error:', error);
      throw error;
    }
  },

  // Get flagged transactions
  getFlaggedTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/transactions/flagged', { params });
      return response;
    } catch (error) {
      console.error('Get flagged transactions error:', error);
      throw error;
    }
  },

  // Approve transaction
  approveTransaction: async (transactionId, data = {}) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve transaction error:', error);
      throw error;
    }
  },

  // Reject transaction
  rejectTransaction: async (transactionId, data) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/reject`, data);
      return response;
    } catch (error) {
      console.error('Reject transaction error:', error);
      throw error;
    }
  },

  // Bulk approve transactions
  bulkApproveTransactions: async (data) => {
    try {
      const response = await api.post('/admin/transactions/bulk-approve', data);
      return response;
    } catch (error) {
      console.error('Bulk approve transactions error:', error);
      throw error;
    }
  },

  // Bulk reject transactions
  bulkRejectTransactions: async (data) => {
    try {
      const response = await api.post('/admin/transactions/bulk-reject', data);
      return response;
    } catch (error) {
      console.error('Bulk reject transactions error:', error);
      throw error;
    }
  },

  // Get verification settings
  getVerificationSettings: async () => {
    try {
      const response = await api.get('/admin/verification/settings');
      return response;
    } catch (error) {
      console.error('Get verification settings error:', error);
      throw error;
    }
  },

  // Update verification settings
  updateVerificationSettings: async (settings) => {
    try {
      const response = await api.put('/admin/verification/settings', { settings });
      return response;
    } catch (error) {
      console.error('Update verification settings error:', error);
      throw error;
    }
  },

  // Export users to CSV
  exportUsersToCSV: async (params = {}) => {
    try {
      const response = await api.get('/admin/users/export/csv', { 
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Export users to CSV error:', error);
      throw error;
    }
  },

  // Export users to Excel
  exportUsersToExcel: async (params = {}) => {
    try {
      const response = await api.get('/admin/users/export/excel', { params });
      return response;
    } catch (error) {
      console.error('Export users to Excel error:', error);
      throw error;
    }
  },

  // Get export statistics
  getExportStats: async () => {
    try {
      const response = await api.get('/admin/users/export/stats');
      return response;
    } catch (error) {
      console.error('Get export stats error:', error);
      throw error;
    }
  },

  // Get pending signup requests
  getPendingSignupRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/signup-requests', { params });
      return response;
    } catch (error) {
      console.error('Get pending signup requests error:', error);
      throw error;
    }
  },

  // Approve signup request
  approveSignupRequest: async (requestId) => {
    try {
      const response = await api.post(`/admin/signup-requests/${requestId}/approve`);
      return response;
    } catch (error) {
      console.error('Approve signup request error:', error);
      throw error;
    }
  },

  // Reject signup request
  rejectSignupRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/admin/signup-requests/${requestId}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Reject signup request error:', error);
      throw error;
    }
  },

  // Get signup request statistics
  getSignupRequestStats: async () => {
    try {
      const response = await api.get('/admin/signup-requests/stats');
      return response;
    } catch (error) {
      console.error('Get signup request stats error:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get system statistics
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response;
    } catch (error) {
      console.error('Get system stats error:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const promises = userIds.map(userId => 
        api.put(`/admin/users/${userId}`, updateData)
      );
      const responses = await Promise.all(promises);
      return responses;
    } catch (error) {
      console.error('Bulk update users error:', error);
      throw error;
    }
  },

  bulkDeleteUsers: async (userIds) => {
    try {
      const promises = userIds.map(userId => 
        api.delete(`/admin/users/${userId}`)
      );
      const responses = await Promise.all(promises);
      return responses;
    } catch (error) {
      console.error('Bulk delete users error:', error);
      throw error;
    }
  },

  bulkUpdateUserStatus: async (userIds, statusData) => {
    try {
      const promises = userIds.map(userId => 
        api.patch(`/admin/users/${userId}/status`, statusData)
      );
      const responses = await Promise.all(promises);
      return responses;
    } catch (error) {
      console.error('Bulk update user status error:', error);
      throw error;
    }
  }
};

// User API methods
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Get user dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/users/dashboard');
      return response;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  },

  // Get user account
  getAccount: async () => {
    try {
      const response = await api.get('/user/account');
      return response;
    } catch (error) {
      console.error('Get account error:', error);
      throw error;
    }
  }
};

// Auth API methods
export const authAPI = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Admin login
  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/admin/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  // ===== TRANSACTION CONTROL METHODS =====

  // Deposit Request Management
  getDepositRequests: (params = {}) => api.get('/admin/deposits/requests', { params }),
  
  approveDepositRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/deposits/${requestId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve deposit request error:', error);
      throw error;
    }
  },

  cancelDepositRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/deposits/${requestId}/cancel`, data);
      return response;
    } catch (error) {
      console.error('Cancel deposit request error:', error);
      throw error;
    }
  },

  bulkApproveDepositRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/deposits/bulk/approve', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk approve deposit requests error:', error);
      throw error;
    }
  },

  bulkCancelDepositRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/deposits/bulk/cancel', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk cancel deposit requests error:', error);
      throw error;
    }
  },

  // Withdrawal Request Management
  getWithdrawalRequests: (params = {}) => api.get('/admin/withdrawals/requests', { params }),
  
  approveWithdrawalRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/withdrawals/${requestId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve withdrawal request error:', error);
      throw error;
    }
  },

  rejectWithdrawalRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/withdrawals/${requestId}/reject`, data);
      return response;
    } catch (error) {
      console.error('Reject withdrawal request error:', error);
      throw error;
    }
  },

  updateWithdrawalPriority: async (requestId, priority) => {
    try {
      const response = await api.put(`/admin/withdrawals/${requestId}/priority`, { priority });
      return response;
    } catch (error) {
      console.error('Update withdrawal priority error:', error);
      throw error;
    }
  },

  bulkApproveWithdrawalRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/withdrawals/bulk/approve', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk approve withdrawal requests error:', error);
      throw error;
    }
  },

  bulkRejectWithdrawalRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/withdrawals/bulk/reject', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk reject withdrawal requests error:', error);
      throw error;
    }
  },

  bulkUpdateWithdrawalPriority: async (requestIds, priority) => {
    try {
      const response = await api.put('/admin/withdrawals/bulk/priority', { requestIds, priority });
      return response;
    } catch (error) {
      console.error('Bulk update withdrawal priority error:', error);
      throw error;
    }
  },

  // Transaction Comments
  addTransactionComment: async (transactionId, data) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/comment`, data);
      return response;
    } catch (error) {
      console.error('Add transaction comment error:', error);
      throw error;
    }
  },

  getTransactionWithComments: async (transactionId) => {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}/comments`);
      return response;
    } catch (error) {
      console.error('Get transaction with comments error:', error);
      throw error;
    }
  },

  // Monitoring endpoints
  getMonitoringStats: (params = {}) => api.get('/admin/monitoring/stats', { params }),
  getFinancialReports: (params = {}) => api.get('/admin/monitoring/financial-reports', { params }),
  getFilteredTransactions: (params = {}) => api.get('/admin/monitoring/transactions', { params })
};

export default api;