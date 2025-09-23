import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import { adminAPI } from '../../services/api';
import DataTable from './DataTable';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material';
import './TransactionFiltering.css';

const TransactionFiltering = () => {
  const { user } = useAuth();
  const { isAuthorized } = useAdminSecurity();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // DataTable uses 0-based indexing
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    amountRange: {
      minAmount: '',
      maxAmount: ''
    },
    userFilter: {
      userId: '',
      accountNumber: '',
      email: ''
    },
    transactionType: 'all',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (isAuthorized) {
      fetchTransactions();
    }
  }, [isAuthorized, filters, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getFilteredTransactions({
        ...filters,
        page: currentPage + 1, // Convert to 1-based for API
        limit: itemsPerPage
      });
      
      if (response.success) {
        setTransactions(response.data.transactions);
        setTotalCount(response.data.total);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (category, field, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSimpleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      amountRange: {
        minAmount: '',
        maxAmount: ''
      },
      userFilter: {
        userId: '',
        accountNumber: '',
        email: ''
      },
      transactionType: 'all',
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setCurrentPage(0);
  };

  // DataTable columns configuration
  const transactionColumns = [
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {value === 'deposit' && <TrendingUpIcon fontSize="small" color="success" />}
          {value === 'withdrawal' && <TrendingDownIcon fontSize="small" color="error" />}
          {value === 'transfer' && <TransferIcon fontSize="small" color="primary" />}
          <span style={{ textTransform: 'capitalize' }}>{value}</span>
        </div>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'currency',
      width: 120,
      align: 'right',
      render: (value, row) => (
        <span style={{ 
          color: row.type === 'withdrawal' ? '#f44336' : '#4caf50',
          fontWeight: 600 
        }}>
          {row.type === 'withdrawal' ? '-' : '+'}${Math.abs(value).toLocaleString()}
        </span>
      ),
    },
    {
      field: 'user',
      headerName: 'User',
      width: 200,
      render: (value) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value?.name || 'Unknown'}</div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>{value?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      type: 'datetime',
      width: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      width: 100,
      chipColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'completed': return 'success';
          case 'pending': return 'warning';
          case 'failed': return 'error';
          case 'cancelled': return 'default';
          default: return 'default';
        }
      },
    },
    {
      field: 'reference',
      headerName: 'Reference',
      width: 150,
      render: (value, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {value || row.id}
        </span>
      ),
    },
  ];

  // DataTable actions
  const transactionActions = [
    {
      label: 'View Details',
      icon: <ViewIcon fontSize="small" />,
      onClick: (transaction) => console.log('View transaction:', transaction),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (transaction) => console.log('Edit transaction:', transaction),
    },
    {
      label: 'Flag',
      icon: <FlagIcon fontSize="small" />,
      onClick: (transaction) => console.log('Flag transaction:', transaction),
      color: 'warning',
    },
  ];

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
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
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTransactions.length === 0) return;

    try {
      setLoading(true);
      
      const response = await adminAPI.bulkTransactionAction({
        action: bulkAction,
        transactionIds: selectedTransactions
      });
      
      if (response.success) {
        await fetchTransactions();
        setSelectedTransactions([]);
        setBulkAction('');
      } else {
        setError(response.message || 'Failed to perform bulk action');
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async (format = 'csv') => {
    try {
      setLoading(true);
      
      const response = await adminAPI.exportTransactions({
        ...filters,
        format,
        transactionIds: selectedTransactions.length > 0 ? selectedTransactions : null
      });
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(response.message || 'Failed to export transactions');
      }
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      cancelled: 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-unknown'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      transfer: '🔄',
      fee: '💳',
      refund: '↩️'
    };
    return icons[type] || '📄';
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!isAuthorized) {
    return (
      <div className="transaction-filtering">
        <div className="error-container">
          <div className="error-message">
            <h3>🔒 Access Denied</h3>
            <p>You don't have permission to view transaction filtering.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-filtering">
      {/* Header */}
      <div className="filtering-header">
        <div className="header-content">
          <h2>🔍 Transaction Filtering</h2>
          <p>Advanced filtering and search for transaction management</p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`btn ${isFilterPanelOpen ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isFilterPanelOpen ? '🔽 Hide Filters' : '🔼 Show Filters'}
          </button>
          
          <button
            onClick={() => exportTransactions('csv')}
            className="btn btn-info"
            disabled={loading}
          >
            📊 Export CSV
          </button>
          
          <button
            onClick={() => exportTransactions('json')}
            className="btn btn-secondary"
            disabled={loading}
          >
            📄 Export JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Filter Panel */}
      {isFilterPanelOpen && (
        <div className="filter-panel">
          <div className="filter-section">
            <h3>📅 Date Range</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>From:</label>
                <input
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) => handleFilterChange('dateRange', 'startDate', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>To:</label>
                <input
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) => handleFilterChange('dateRange', 'endDate', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>💰 Amount Range</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>Min Amount:</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountRange.minAmount}
                  onChange={(e) => handleFilterChange('amountRange', 'minAmount', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Max Amount:</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.amountRange.maxAmount}
                  onChange={(e) => handleFilterChange('amountRange', 'maxAmount', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>👤 User Filters</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>User ID:</label>
                <input
                  type="text"
                  placeholder="Enter user ID"
                  value={filters.userFilter.userId}
                  onChange={(e) => handleFilterChange('userFilter', 'userId', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Account Number:</label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={filters.userFilter.accountNumber}
                  onChange={(e) => handleFilterChange('userFilter', 'accountNumber', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={filters.userFilter.email}
                  onChange={(e) => handleFilterChange('userFilter', 'email', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>🔄 Transaction Details</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>Type:</label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => handleSimpleFilterChange('transactionType', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                  <option value="fee">Fees</option>
                  <option value="refund">Refunds</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleSimpleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sort By:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSimpleFilterChange('sortBy', e.target.value)}
                  className="filter-select"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Order:</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleSimpleFilterChange('sortOrder', e.target.value)}
                  className="filter-select"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              🔄 Clear Filters
            </button>
            <button
              onClick={fetchTransactions}
              className="btn btn-primary"
              disabled={loading}
            >
              🔍 Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="bulk-actions-panel">
          <div className="bulk-info">
            <span>{selectedTransactions.length} transaction(s) selected</span>
          </div>
          <div className="bulk-controls">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-select"
            >
              <option value="">Select Action</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="flag">Flag for Review</option>
              <option value="export">Export Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || loading}
              className="btn btn-warning"
            >
              Execute Action
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <div className="summary-info">
          <span>Showing {filteredTransactions.length} of {totalCount} transactions</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
        <div className="view-options">
          <button
            onClick={handleSelectAll}
            className="btn btn-secondary btn-sm"
          >
            {selectedTransactions.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <DataTable
        title="Filtered Transactions"
        data={transactions}
        columns={transactionColumns}
        loading={loading}
        error={error}
        serverSide={true}
        page={currentPage}
        rowsPerPage={itemsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        actions={transactionActions}
        selectable={true}
        searchable={false} // We handle search through filters
        sortable={false} // We handle sorting through filters
        dense={true}
        stickyHeader={true}
        maxHeight={600}
      />
    </div>
  );
};

export default TransactionFiltering;