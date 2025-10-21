import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/.netlify/functions/api' : '/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate admin API instance
const adminApiInstance = axios.create({
  baseURL: process.env.REACT_APP_ADMIN_API_URL || (process.env.NODE_ENV === 'production' ? '/.netlify/functions/admin-api' : '/api'),
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

// Request interceptor for admin API instance
adminApiInstance.interceptors.request.use(
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

// Response interceptor for admin API instance
adminApiInstance.interceptors.response.use(
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
  get: (endpoint, config = {}) => adminApiInstance.get(endpoint, config),
  
  // Generic POST method for admin endpoints
  post: (endpoint, data, config = {}) => adminApiInstance.post(endpoint, data, config),
  
  // Generic PUT method for admin endpoints
  put: (endpoint, data, config = {}) => adminApiInstance.put(endpoint, data, config),
  
  // Generic DELETE method for admin endpoints
  delete: (endpoint, config = {}) => adminApiInstance.delete(endpoint, config),

  // Specific admin methods
  getUsers: async (params = {}) => adminApiInstance.get('/admin/users', { params }),
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await adminApiInstance.put(`/admin/users/${userId}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await adminApiInstance.post('/admin/users', userData);
      return response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await adminApiInstance.put(`/admin/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      return response;
    } catch (error) {
      console.error('Reset user password error:', error);
      throw error;
    }
  },

  adjustBalance: async (userId, balanceData) => {
    try {
      const response = await api.post(`/admin/users/${userId}/balance`, balanceData);
      return response;
    } catch (error) {
      console.error('Adjust balance error:', error);
      throw error;
    }
  },

  getBalanceHistory: async (userId, params = {}) => {
    try {
      const response = await api.get(`/admin/users/${userId}/balance-history`, { params });
      return response;
    } catch (error) {
      console.error('Get balance history error:', error);
      throw error;
    }
  },

  getFlaggedTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/transactions/flagged', { params });
      return response;
    } catch (error) {
      console.error('Get flagged transactions error:', error);
      throw error;
    }
  },

  approveTransaction: async (transactionId, data = {}) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve transaction error:', error);
      throw error;
    }
  },

  rejectTransaction: async (transactionId, data) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/reject`, data);
      return response;
    } catch (error) {
      console.error('Reject transaction error:', error);
      throw error;
    }
  },

  bulkApproveTransactions: async (data) => {
    try {
      const response = await api.post('/admin/transactions/bulk-approve', data);
      return response;
    } catch (error) {
      console.error('Bulk approve transactions error:', error);
      throw error;
    }
  },

  bulkRejectTransactions: async (data) => {
    try {
      const response = await api.post('/admin/transactions/bulk-reject', data);
      return response;
    } catch (error) {
      console.error('Bulk reject transactions error:', error);
      throw error;
    }
  },

  getVerificationSettings: async () => {
    try {
      const response = await api.get('/admin/settings/verification');
      return response;
    } catch (error) {
      console.error('Get verification settings error:', error);
      throw error;
    }
  },

  updateVerificationSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings/verification', settings);
      return response;
    } catch (error) {
      console.error('Update verification settings error:', error);
      throw error;
    }
  },

  exportUsersToCSV: async (params = {}) => {
    try {
      const response = await api.get('/admin/users/export/csv', { params });
      return response;
    } catch (error) {
      console.error('Export users to CSV error:', error);
      throw error;
    }
  },

  exportUsersToExcel: async (params = {}) => {
    try {
      const response = await api.get('/admin/users/export/excel', { params });
      return response;
    } catch (error) {
      console.error('Export users to Excel error:', error);
      throw error;
    }
  },

  getExportStats: async () => {
    try {
      const response = await api.get('/admin/export/stats');
      return response;
    } catch (error) {
      console.error('Get export stats error:', error);
      throw error;
    }
  },

  getPendingSignupRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/signup/requests/pending', { params });
      return response;
    } catch (error) {
      console.error('Get pending signup requests error:', error);
      throw error;
    }
  },

  approveSignupRequest: async (requestId) => {
    try {
      const response = await api.post(`/admin/signup/requests/${requestId}/approve`);
      return response;
    } catch (error) {
      console.error('Approve signup request error:', error);
      throw error;
    }
  },

  rejectSignupRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/admin/signup/requests/${requestId}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Reject signup request error:', error);
      throw error;
    }
  },

  getSignupRequestStats: async () => {
    try {
      const response = await api.get('/admin/signup/stats');
      return response;
    } catch (error) {
      console.error('Get signup request stats error:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats/dashboard');
      return response;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats/system');
      return response;
    } catch (error) {
      console.error('Get system stats error:', error);
      throw error;
    }
  },

  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const response = await api.put('/admin/users/bulk-update', { userIds, updateData });
      return response;
    } catch (error) {
      console.error('Bulk update users error:', error);
      throw error;
    }
  },

  bulkDeleteUsers: async (userIds) => {
    try {
      const response = await api.post('/admin/users/bulk-delete', { userIds });
      return response;
    } catch (error) {
      console.error('Bulk delete users error:', error);
      throw error;
    }
  },

  bulkUpdateUserStatus: async (userIds, statusData) => {
    try {
      const response = await api.put('/admin/users/bulk-status', { userIds, statusData });
      return response;
    } catch (error) {
      console.error('Bulk update user status error:', error);
      throw error;
    }
  },
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
      const response = await api.post(`/admin/deposits/requests/${requestId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve deposit request error:', error);
      throw error;
    }
  },

  cancelDepositRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/deposits/requests/${requestId}/cancel`, data);
      return response;
    } catch (error) {
      console.error('Cancel deposit request error:', error);
      throw error;
    }
  },

  bulkApproveDepositRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/deposits/requests/bulk-approve', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk approve deposit requests error:', error);
      throw error;
    }
  },

  bulkCancelDepositRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/deposits/requests/bulk-cancel', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk cancel deposit requests error:', error);
      throw error;
    }
  },

  // Withdrawal Request Management
  approveWithdrawalRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/withdrawals/requests/${requestId}/approve`, data);
      return response;
    } catch (error) {
      console.error('Approve withdrawal request error:', error);
      throw error;
    }
  },

  rejectWithdrawalRequest: async (requestId, data = {}) => {
    try {
      const response = await api.post(`/admin/withdrawals/requests/${requestId}/reject`, data);
      return response;
    } catch (error) {
      console.error('Reject withdrawal request error:', error);
      throw error;
    }
  },

  updateWithdrawalPriority: async (requestId, priority) => {
    try {
      const response = await api.put(`/admin/withdrawals/requests/${requestId}/priority`, { priority });
      return response;
    } catch (error) {
      console.error('Update withdrawal priority error:', error);
      throw error;
    }
  },

  bulkApproveWithdrawalRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/withdrawals/requests/bulk-approve', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk approve withdrawal requests error:', error);
      throw error;
    }
  },

  bulkRejectWithdrawalRequests: async (requestIds) => {
    try {
      const response = await api.post('/admin/withdrawals/requests/bulk-reject', { requestIds });
      return response;
    } catch (error) {
      console.error('Bulk reject withdrawal requests error:', error);
      throw error;
    }
  },

  bulkUpdateWithdrawalPriority: async (requestIds, priority) => {
    try {
      const response = await api.put('/admin/withdrawals/requests/bulk-priority', { requestIds, priority });
      return response;
    } catch (error) {
      console.error('Bulk update withdrawal priority error:', error);
      throw error;
    }
  },

  // Comments
  addTransactionComment: async (transactionId, data) => {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/comments`, data);
      return response;
    } catch (error) {
      console.error('Add transaction comment error:', error);
      throw error;
    }
  },

  getTransactionWithComments: async (transactionId) => {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}`);
      return response;
    } catch (error) {
      console.error('Get transaction with comments error:', error);
      throw error;
    }
  },
};

export default api;