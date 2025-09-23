import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import './TransactionVerification.css';

// Import admin API functions
import { adminAPI } from '../../services/api';

const TransactionVerification = () => {
  const [flaggedTransactions, setFlaggedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    status: 'pending', // 'pending', 'approved', 'rejected', 'all'
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    userId: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Settings state
  const [settings, setSettings] = useState({
    thresholdAmount: 5000,
    autoFlagEnabled: true,
    requireTwoFactorAuth: true,
    notificationEnabled: true
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 15,
    totalItems: 0,
    totalPages: 0
  });

  // Selected transactions for bulk actions
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    fetchFlaggedTransactions();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchFlaggedTransactions();
  }, [filters, pagination.currentPage]);

  const fetchFlaggedTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };

      const response = await adminAPI.getFlaggedTransactions(params);
      
      if (response.success) {
        setFlaggedTransactions(response.data.transactions || []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / prev.itemsPerPage)
        }));
      } else {
        setError(response.message || 'Failed to fetch flagged transactions');
      }
    } catch (err) {
      setError('Error fetching flagged transactions');
      console.error('Fetch flagged transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getTransactionSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
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
      status: 'pending',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      userId: '',
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

  const handleTransactionAction = async (transactionId, action, reason = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.verifyTransaction({
        transactionId,
        action, // 'approve' or 'reject'
        reason
      });
      
      if (response.success) {
        setSuccess(`Transaction ${action}d successfully`);
        fetchFlaggedTransactions();
        
        // Remove from selected if it was selected
        setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
      } else {
        setError(response.message || `Failed to ${action} transaction`);
      }
    } catch (err) {
      setError(`Error ${action}ing transaction`);
      console.error(`Transaction ${action} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTransactions.length === 0) {
      setError('Please select transactions to perform bulk action');
      return;
    }

    const reason = prompt(`Please provide a reason for ${action}ing these transactions:`);
    if (!reason) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.bulkVerifyTransactions({
        transactionIds: selectedTransactions,
        action,
        reason
      });
      
      if (response.success) {
        setSuccess(`${selectedTransactions.length} transactions ${action}d successfully`);
        fetchFlaggedTransactions();
        setSelectedTransactions([]);
      } else {
        setError(response.message || `Failed to ${action} transactions`);
      }
    } catch (err) {
      setError(`Error performing bulk ${action}`);
      console.error(`Bulk ${action} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === flaggedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(flaggedTransactions.map(t => t.id));
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateTransactionSettings(newSettings);
      
      if (response.success) {
        setSettings(newSettings);
        setSuccess('Settings updated successfully');
        setShowSettingsModal(false);
      } else {
        setError(response.message || 'Failed to update settings');
      }
    } catch (err) {
      setError('Error updating settings');
      console.error('Update settings error:', err);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  const getRiskLevelClass = (amount) => {
    if (amount >= settings.thresholdAmount * 3) return 'risk-critical';
    if (amount >= settings.thresholdAmount * 2) return 'risk-high';
    if (amount >= settings.thresholdAmount) return 'risk-medium';
    return 'risk-low';
  };

  return (
    <div className="transaction-verification">
      <div className="verification-header">
        <div className="header-content">
          <h2>Transaction Verification</h2>
          <p>Review and verify large transactions flagged for manual approval</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card pending">
          <div className="stat-number">
            {flaggedTransactions.filter(t => t.status === 'pending').length}
          </div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card threshold">
          <div className="stat-number">{formatCurrency(settings.thresholdAmount)}</div>
          <div className="stat-label">Current Threshold</div>
        </div>
        <div className="stat-card total">
          <div className="stat-number">{pagination.totalItems}</div>
          <div className="stat-label">Total Flagged</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

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
            <label>User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="filter-input"
              placeholder="Enter user ID"
            />
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
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            {selectedTransactions.length} transaction(s) selected
          </div>
          <div className="bulk-buttons">
            <button
              onClick={() => handleBulkAction('approve')}
              className="btn btn-success"
              disabled={loading}
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="btn btn-danger"
              disabled={loading}
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="transactions-table-container">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : flaggedTransactions.length > 0 ? (
          <>
            <div className="transactions-table">
              <div className="table-header">
                <div className="header-cell">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === flaggedTransactions.length && flaggedTransactions.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="header-cell">Date</div>
                <div className="header-cell">User</div>
                <div className="header-cell">Amount</div>
                <div className="header-cell">Type</div>
                <div className="header-cell">Risk Level</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Actions</div>
              </div>

              <div className="table-body">
                {flaggedTransactions.map((transaction) => (
                  <div key={transaction.id} className="table-row">
                    <div className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleTransactionSelect(transaction.id)}
                      />
                    </div>
                    <div className="table-cell">
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="table-cell">
                      <div className="user-info">
                        <div className="user-name">{transaction.userName || 'N/A'}</div>
                        <div className="user-id">ID: {transaction.userId}</div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="amount">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="table-cell">
                      <span className="transaction-type">{transaction.type}</span>
                    </div>
                    <div className="table-cell">
                      <span className={`risk-level ${getRiskLevelClass(transaction.amount)}`}>
                        {transaction.amount >= settings.thresholdAmount * 3 ? 'Critical' :
                         transaction.amount >= settings.thresholdAmount * 2 ? 'High' :
                         transaction.amount >= settings.thresholdAmount ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="table-cell">
                      {transaction.status === 'pending' ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for approval:');
                              if (reason) handleTransactionAction(transaction.id, 'approve', reason);
                            }}
                            className="btn btn-success btn-sm"
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) handleTransactionAction(transaction.id, 'reject', reason);
                            }}
                            className="btn btn-danger btn-sm"
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="action-completed">
                          {transaction.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      )}
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
          <div className="no-transactions">
            No flagged transactions found for the selected filters
          </div>
        )}
      </div>

      {success && <div className="success-message">{success}</div>}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Transaction Verification Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="setting-group">
                <label>Threshold Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.thresholdAmount}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thresholdAmount: parseFloat(e.target.value) || 0
                  }))}
                  className="setting-input"
                />
                <small>Transactions above this amount will be flagged for review</small>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.autoFlagEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      autoFlagEnabled: e.target.checked
                    }))}
                  />
                  Enable automatic flagging
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.requireTwoFactorAuth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      requireTwoFactorAuth: e.target.checked
                    }))}
                  />
                  Require 2FA for verification actions
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notificationEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notificationEnabled: e.target.checked
                    }))}
                  />
                  Enable email notifications for flagged transactions
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => updateSettings(settings)}
                className="btn btn-primary"
                disabled={loading}
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionVerification;