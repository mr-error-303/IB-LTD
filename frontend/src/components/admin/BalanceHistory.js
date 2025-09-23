import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import './BalanceHistory.css';

// Import admin API functions
import { adminAPI } from '../../services/api';

const BalanceHistory = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: '', // 'add', 'deduct', 'transaction', 'refund', etc.
    reason: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    if (selectedUser) {
      fetchBalanceHistory();
    }
  }, [selectedUser, filters, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      if (response.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceHistory = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError('');
      
      const params = {
        userId: selectedUser.id,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };

      const response = await adminAPI.getUserBalanceHistory(params);
      
      if (response.success) {
        setBalanceHistory(response.data.history || []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / prev.itemsPerPage)
        }));
      } else {
        setError(response.message || 'Failed to fetch balance history');
      }
    } catch (err) {
      setError('Error fetching balance history');
      console.error('Fetch balance history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setBalanceHistory([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setError('');
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      type: '',
      reason: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const exportBalanceHistory = async (format) => {
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }

    try {
      setLoading(true);
      
      const params = {
        userId: selectedUser.id,
        format,
        ...filters
      };

      const response = await adminAPI.exportBalanceHistory(params);
      
      if (format === 'csv') {
        // Create CSV download
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance_history_${selectedUser.name || selectedUser.id}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Handle PDF download
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance_history_${selectedUser.name || selectedUser.id}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Error exporting balance history');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'add':
      case 'deposit':
      case 'refund':
      case 'bonus':
        return 'transaction-positive';
      case 'deduct':
      case 'withdrawal':
      case 'fee':
      case 'penalty':
        return 'transaction-negative';
      default:
        return 'transaction-neutral';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'add':
      case 'deposit':
        return '↗';
      case 'deduct':
      case 'withdrawal':
        return '↙';
      case 'refund':
        return '↩';
      case 'bonus':
        return '🎁';
      case 'fee':
      case 'penalty':
        return '⚠';
      default:
        return '•';
    }
  };

  return (
    <div className="balance-history">
      <div className="balance-history-header">
        <h2>Balance History</h2>
        <p>View complete balance history for any user with advanced filtering</p>
      </div>

      <div className="balance-history-content">
        {/* User Selection */}
        <div className="user-selection-section">
          <h3>Select User</h3>
          <div className="user-search">
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="users-list">
            {loading && !selectedUser ? (
              <div className="loading">Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.slice(0, 8).map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-info">
                    <div className="user-name">{user.name || 'N/A'}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="user-balance">
                    {formatCurrency(user.balance)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-users">No users found</div>
            )}
          </div>
        </div>

        {/* Balance History */}
        {selectedUser && (
          <div className="history-section">
            <div className="history-header">
              <h3>Balance History for {selectedUser.name || selectedUser.email}</h3>
              <div className="export-buttons">
                <button
                  onClick={() => exportBalanceHistory('csv')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportBalanceHistory('pdf')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Min Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    className="filter-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="filter-group">
                  <label>Max Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    className="filter-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="filter-group">
                  <label>Transaction Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="add">Add Funds</option>
                    <option value="deduct">Deduct Funds</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="refund">Refund</option>
                    <option value="bonus">Bonus</option>
                    <option value="fee">Fee</option>
                    <option value="penalty">Penalty</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="filter-select"
                  >
                    <option value="date-desc">Date (Newest First)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="amount-desc">Amount (Highest First)</option>
                    <option value="amount-asc">Amount (Lowest First)</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="history-table-container">
              {loading ? (
                <div className="loading">Loading balance history...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : balanceHistory.length > 0 ? (
                <>
                  <div className="history-table">
                    <div className="table-header">
                      <div className="header-cell">Date</div>
                      <div className="header-cell">Type</div>
                      <div className="header-cell">Amount</div>
                      <div className="header-cell">Balance After</div>
                      <div className="header-cell">Reason</div>
                      <div className="header-cell">Notes</div>
                      <div className="header-cell">Admin</div>
                    </div>

                    <div className="table-body">
                      {balanceHistory.map((transaction, index) => (
                        <div key={transaction.id || index} className="table-row">
                          <div className="table-cell">
                            {formatDate(transaction.createdAt || transaction.date)}
                          </div>
                          <div className="table-cell">
                            <span className={`transaction-type ${getTransactionTypeClass(transaction.type)}`}>
                              <span className="transaction-icon">{getTransactionIcon(transaction.type)}</span>
                              {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span className={`amount ${getTransactionTypeClass(transaction.type)}`}>
                              {transaction.type === 'add' || transaction.type === 'deposit' || transaction.type === 'refund' || transaction.type === 'bonus' ? '+' : '-'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </div>
                          <div className="table-cell">
                            {formatCurrency(transaction.balanceAfter)}
                          </div>
                          <div className="table-cell">
                            <span className="reason">{transaction.reason || 'N/A'}</span>
                          </div>
                          <div className="table-cell">
                            <span className="notes" title={transaction.notes}>
                              {transaction.notes ? (
                                transaction.notes.length > 30 
                                  ? `${transaction.notes.substring(0, 30)}...`
                                  : transaction.notes
                              ) : 'N/A'}
                            </span>
                          </div>
                          <div className="table-cell">
                            {transaction.adminName || transaction.adminId || 'System'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-btn"
                      >
                        Previous
                      </button>

                      <div className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                        ({pagination.totalItems} total items)
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-history">
                  No balance history found for the selected filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceHistory;