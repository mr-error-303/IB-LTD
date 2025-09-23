import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import './DepositRequestManagement.css';

// Import admin API functions
import { adminAPI } from '../../services/api';

const DepositRequestManagement = () => {
  const { user } = useAuth();
  const { performSecureOperation } = useAdminSecurity();
  const [depositRequests, setDepositRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [filters, setFilters] = useState({
    status: 'pending',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      const response = await adminAPI.getDepositRequests(params);
      setDepositRequests(response.data.requests || []);
      setFilteredRequests(response.data.requests || []);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      setMessage({ type: 'error', text: 'Failed to fetch deposit requests' });
    } finally {
      setLoading(false);
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId, comment = '') => {
    try {
      await performSecureOperation('approve_deposit', async () => {
        await adminAPI.approveDepositRequest(requestId, { comment });
        setMessage({ type: 'success', text: 'Deposit request approved successfully' });
        fetchDepositRequests();
        setShowCommentModal(false);
        setComment('');
      });
    } catch (error) {
      console.error('Error approving deposit request:', error);
      setMessage({ type: 'error', text: 'Failed to approve deposit request' });
    }
  };

  // Handle request cancellation
  const handleCancelRequest = async (requestId, comment = '') => {
    try {
      await performSecureOperation('cancel_deposit', async () => {
        await adminAPI.cancelDepositRequest(requestId, { comment });
        setMessage({ type: 'success', text: 'Deposit request cancelled successfully' });
        fetchDepositRequests();
        setShowCommentModal(false);
        setComment('');
      });
    } catch (error) {
      console.error('Error cancelling deposit request:', error);
      setMessage({ type: 'error', text: 'Failed to cancel deposit request' });
    }
  };

  // Handle bulk operations
  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      setMessage({ type: 'warning', text: 'Please select requests to approve' });
      return;
    }

    try {
      await performSecureOperation('bulk_approve_deposits', async () => {
        await adminAPI.bulkApproveDepositRequests({ requestIds: selectedRequests });
        setMessage({ type: 'success', text: `${selectedRequests.length} deposit requests approved` });
        setSelectedRequests([]);
        fetchDepositRequests();
      });
    } catch (error) {
      console.error('Error bulk approving deposits:', error);
      setMessage({ type: 'error', text: 'Failed to approve selected requests' });
    }
  };

  const handleBulkCancel = async () => {
    if (selectedRequests.length === 0) {
      setMessage({ type: 'warning', text: 'Please select requests to cancel' });
      return;
    }

    try {
      await performSecureOperation('bulk_cancel_deposits', async () => {
        await adminAPI.bulkCancelDepositRequests({ requestIds: selectedRequests });
        setMessage({ type: 'success', text: `${selectedRequests.length} deposit requests cancelled` });
        setSelectedRequests([]);
        fetchDepositRequests();
      });
    } catch (error) {
      console.error('Error bulk cancelling deposits:', error);
      setMessage({ type: 'error', text: 'Failed to cancel selected requests' });
    }
  };

  // Handle filters
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle request selection
  const handleRequestSelection = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  // Open comment modal
  const openCommentModal = (request, action) => {
    setCurrentRequest({ ...request, action });
    setShowCommentModal(true);
    setComment('');
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (currentRequest.action === 'approve') {
      handleApproveRequest(currentRequest.id, comment);
    } else if (currentRequest.action === 'cancel') {
      handleCancelRequest(currentRequest.id, comment);
    }
  };

  useEffect(() => {
    fetchDepositRequests();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  return (
    <div className="deposit-request-management">
      <div className="deposit-header">
        <h2>💰 Deposit Request Management</h2>
        <div className="deposit-stats">
          <div className="stat-item">
            <span className="stat-label">Total Requests:</span>
            <span className="stat-value">{pagination.totalItems}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Selected:</span>
            <span className="stat-value">{selectedRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="deposit-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by user, amount, or reference..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Amount Range:</label>
            <div className="amount-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bulk-actions">
          <span className="bulk-info">{selectedRequests.length} requests selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn-success"
              onClick={handleBulkApprove}
            >
              ✅ Approve Selected
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleBulkCancel}
            >
              ❌ Cancel Selected
            </button>
          </div>
        </div>
      )}

      {/* Deposit Requests Table */}
      <div className="deposit-table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading deposit requests...</p>
          </div>
        ) : (
          <table className="deposit-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Date</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className={selectedRequests.includes(request.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleRequestSelection(request.id)}
                    />
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{request.user?.firstName} {request.user?.lastName}</div>
                      <div className="user-email">{request.user?.email}</div>
                    </div>
                  </td>
                  <td className="amount">${request.amount?.toLocaleString()}</td>
                  <td>
                    <span className="method-badge">{request.method}</span>
                  </td>
                  <td className="reference">{request.reference || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => openCommentModal(request, 'approve')}
                            title="Approve Request"
                          >
                            ✅
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openCommentModal(request, 'cancel')}
                            title="Cancel Request"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => {/* View details */}}
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-sm ${page === pagination.currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="btn btn-sm"
            disabled={pagination.currentPage === totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {currentRequest?.action === 'approve' ? '✅ Approve' : '❌ Cancel'} Deposit Request
              </h3>
              <button onClick={() => setShowCommentModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="request-details">
                <p><strong>User:</strong> {currentRequest?.user?.firstName} {currentRequest?.user?.lastName}</p>
                <p><strong>Amount:</strong> ${currentRequest?.amount?.toLocaleString()}</p>
                <p><strong>Method:</strong> {currentRequest?.method}</p>
                <p><strong>Reference:</strong> {currentRequest?.reference || 'N/A'}</p>
              </div>
              
              <div className="form-group">
                <label>Comment (Optional):</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment or note for this action..."
                  rows="4"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowCommentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`btn ${currentRequest?.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleCommentSubmit}
                >
                  {currentRequest?.action === 'approve' ? '✅ Approve' : '❌ Cancel'} Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositRequestManagement;