import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import './WithdrawalRequestManagement.css';

// Import admin API functions
import { adminAPI } from '../../services/api';

const WithdrawalRequestManagement = () => {
  const { user } = useAuth();
  const { performSecureOperation } = useAdminSecurity();
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [actionData, setActionData] = useState({
    action: '',
    comment: '',
    priority: 'normal',
    reason: ''
  });
  const [filters, setFilters] = useState({
    status: 'pending',
    priority: 'all',
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
  const [buttonLoading, setButtonLoading] = useState({});
  const [lastClickTime, setLastClickTime] = useState({});

  // Debounce function to prevent rapid clicks
  const debounce = useCallback((func, delay, key) => {
    const now = Date.now();
    const lastClick = lastClickTime[key] || 0;
    
    if (now - lastClick < delay) {
      return; // Ignore rapid clicks
    }
    
    setLastClickTime(prev => ({ ...prev, [key]: now }));
    return func();
  }, [lastClickTime]);

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: '#6c757d' },
    { value: 'normal', label: 'Normal Priority', color: '#007bff' },
    { value: 'high', label: 'High Priority', color: '#fd7e14' },
    { value: 'urgent', label: 'Urgent Priority', color: '#dc3545' }
  ];

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      const response = await adminAPI.getWithdrawalRequests(params);
      setWithdrawalRequests(response.data.requests || []);
      setFilteredRequests(response.data.requests || []);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      setMessage({ type: 'error', text: 'Failed to fetch withdrawal requests' });
    } finally {
      setLoading(false);
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId, data = {}) => {
    const buttonKey = `approve-${requestId}`;
    
    return debounce(async () => {
      setButtonLoading(prev => ({ ...prev, [buttonKey]: true }));
      
      try {
        await performSecureOperation('approve_withdrawal', async () => {
          await adminAPI.approveWithdrawalRequest(requestId, {
            comment: data.comment,
            priority: data.priority || 'normal'
          });
          setMessage({ type: 'success', text: 'Withdrawal request approved successfully' });
          
          // Optimistic UI update
          setWithdrawalRequests(prev => ({
            ...prev,
            data: prev.data.map(req => 
              req._id === requestId 
                ? { ...req, status: 'approved', adminComment: data.comment, priority: data.priority || 'normal' }
                : req
            )
          }));
          
          fetchWithdrawalRequests();
          setShowActionModal(false);
          resetActionData();
        });
      } catch (error) {
        console.error('Error approving withdrawal request:', error);
        setMessage({ type: 'error', text: 'Failed to approve withdrawal request' });
      } finally {
        setButtonLoading(prev => ({ ...prev, [buttonKey]: false }));
      }
    }, 300, buttonKey);
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId, data = {}) => {
    const buttonKey = `reject-${requestId}`;
    
    return debounce(async () => {
      setButtonLoading(prev => ({ ...prev, [buttonKey]: true }));
      
      try {
        await performSecureOperation('reject_withdrawal', async () => {
          await adminAPI.rejectWithdrawalRequest(requestId, {
            comment: data.comment,
            reason: data.reason
          });
          setMessage({ type: 'success', text: 'Withdrawal request rejected successfully' });
          
          // Optimistic UI update
          setWithdrawalRequests(prev => ({
            ...prev,
            data: prev.data.map(req => 
              req._id === requestId 
                ? { ...req, status: 'rejected', adminComment: data.comment, reason: data.reason }
                : req
            )
          }));
          
          fetchWithdrawalRequests();
          setShowActionModal(false);
          resetActionData();
        });
      } catch (error) {
        console.error('Error rejecting withdrawal request:', error);
        setMessage({ type: 'error', text: 'Failed to reject withdrawal request' });
      } finally {
        setButtonLoading(prev => ({ ...prev, [buttonKey]: false }));
      }
    }, 300, buttonKey);
  };

  // Handle priority update
  const handleUpdatePriority = async (requestId, priority) => {
    try {
      await performSecureOperation('update_withdrawal_priority', async () => {
        await adminAPI.updateWithdrawalPriority(requestId, { priority });
        setMessage({ type: 'success', text: 'Priority updated successfully' });
        fetchWithdrawalRequests();
      });
    } catch (error) {
      console.error('Error updating priority:', error);
      setMessage({ type: 'error', text: 'Failed to update priority' });
    }
  };

  // Handle bulk operations with optimistic UI updates
  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      setMessage({ type: 'warning', text: 'Please select requests to approve' });
      return;
    }

    // Store original state for potential rollback
    const originalRequests = withdrawalRequests.data;
    const requestsToUpdate = selectedRequests;

    try {
      // Optimistic UI update - immediately update status
      setWithdrawalRequests(prev => ({
        ...prev,
        data: prev.data.map(req => 
          requestsToUpdate.includes(req._id) 
            ? { ...req, status: 'approved' }
            : req
        )
      }));
      
      // Clear selection immediately for better UX
      setSelectedRequests([]);
      setMessage({ type: 'success', text: `${requestsToUpdate.length} withdrawal requests approved` });

      await performSecureOperation('bulk_approve_withdrawals', async () => {
        await adminAPI.bulkApproveWithdrawalRequests({ requestIds: requestsToUpdate });
        // Refresh data to ensure consistency
        fetchWithdrawalRequests();
      });
    } catch (error) {
      console.error('Error bulk approving withdrawals:', error);
      
      // Rollback optimistic updates on error
      setWithdrawalRequests(prev => ({ ...prev, data: originalRequests }));
      setSelectedRequests(requestsToUpdate);
      setMessage({ type: 'error', text: 'Failed to approve selected requests' });
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      setMessage({ type: 'warning', text: 'Please select requests to reject' });
      return;
    }

    // Store original state for potential rollback
    const originalRequests = withdrawalRequests.data;
    const requestsToUpdate = selectedRequests;

    try {
      // Optimistic UI update - immediately update status
      setWithdrawalRequests(prev => ({
        ...prev,
        data: prev.data.map(req => 
          requestsToUpdate.includes(req._id) 
            ? { ...req, status: 'rejected' }
            : req
        )
      }));
      
      // Clear selection immediately for better UX
      setSelectedRequests([]);
      setMessage({ type: 'success', text: `${requestsToUpdate.length} withdrawal requests rejected` });

      await performSecureOperation('bulk_reject_withdrawals', async () => {
        await adminAPI.bulkRejectWithdrawalRequests({ requestIds: requestsToUpdate });
        // Refresh data to ensure consistency
        fetchWithdrawalRequests();
      });
    } catch (error) {
      console.error('Error bulk rejecting withdrawals:', error);
      
      // Rollback optimistic updates on error
      setWithdrawalRequests(prev => ({ ...prev, data: originalRequests }));
      setSelectedRequests(requestsToUpdate);
      setMessage({ type: 'error', text: 'Failed to reject selected requests' });
    }
  };

  const handleBulkPriorityUpdate = async (priority) => {
    if (selectedRequests.length === 0) {
      setMessage({ type: 'warning', text: 'Please select requests to update priority' });
      return;
    }

    try {
      await performSecureOperation('bulk_update_priority', async () => {
        await adminAPI.bulkUpdateWithdrawalPriority({ requestIds: selectedRequests, priority });
        setMessage({ type: 'success', text: `Priority updated for ${selectedRequests.length} requests` });
        setSelectedRequests([]);
        fetchWithdrawalRequests();
      });
    } catch (error) {
      console.error('Error bulk updating priority:', error);
      setMessage({ type: 'error', text: 'Failed to update priority for selected requests' });
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

  // Handle view details
  const handleViewDetails = (request) => {
    const buttonKey = `view-${request._id}`;
    
    return debounce(() => {
      setButtonLoading(prev => ({ ...prev, [buttonKey]: true }));
      
      // Immediate UI response
      setTimeout(() => {
        setCurrentRequest(request);
        setShowDetailModal(true);
        setButtonLoading(prev => ({ ...prev, [buttonKey]: false }));
      }, 50); // Minimal delay for visual feedback
    }, 200, buttonKey);
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  // Open action modal
  const openActionModal = (request, action) => {
    setCurrentRequest(request);
    setActionData(prev => ({ ...prev, action }));
    setShowActionModal(true);
  };

  // Reset action data
  const resetActionData = () => {
    setActionData({
      action: '',
      comment: '',
      priority: 'normal',
      reason: ''
    });
  };

  // Handle action submission
  const handleActionSubmit = () => {
    if (actionData.action === 'approve') {
      handleApproveRequest(currentRequest.id, actionData);
    } else if (actionData.action === 'reject') {
      handleRejectRequest(currentRequest.id, actionData);
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : '#6c757d';
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  return (
    <div className="withdrawal-request-management">
      <div className="withdrawal-header">
        <h2>💸 Withdrawal Request Management</h2>
        <div className="withdrawal-stats">
          <div className="stat-item">
            <span className="stat-label">Total Requests:</span>
            <span className="stat-value">{pagination.totalItems}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Selected:</span>
            <span className="stat-value">{selectedRequests.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Urgent:</span>
            <span className="stat-value urgent">
              {filteredRequests.filter(req => req.priority === 'urgent').length}
            </span>
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
      <div className="withdrawal-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Priority:</label>
            <select 
              value={filters.priority} 
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              onClick={handleBulkReject}
            >
              ❌ Reject Selected
            </button>
            <div className="priority-dropdown">
              <select 
                onChange={(e) => e.target.value && handleBulkPriorityUpdate(e.target.value)}
                defaultValue=""
              >
                <option value="">Set Priority...</option>
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Requests Table */}
      <div className="withdrawal-table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading withdrawal requests...</p>
          </div>
        ) : (
          <table className="withdrawal-table">
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
                <th>Priority</th>
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
                  <td>
                    <div className="priority-cell">
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: getPriorityColor(request.priority) }}
                      >
                        {request.priority}
                      </span>
                      {request.status === 'pending' && (
                        <select
                          className="priority-select"
                          value={request.priority}
                          onChange={(e) => handleUpdatePriority(request.id, e.target.value)}
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
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
                             onClick={() => openActionModal(request, 'approve')}
                             title="Approve Request"
                             disabled={buttonLoading[`approve-${request._id}`]}
                           >
                             {buttonLoading[`approve-${request._id}`] ? '⏳' : '✅'}
                           </button>
                           <button
                             className="btn btn-sm btn-danger"
                             onClick={() => openActionModal(request, 'reject')}
                             title="Reject Request"
                             disabled={buttonLoading[`reject-${request._id}`]}
                           >
                             {buttonLoading[`reject-${request._id}`] ? '⏳' : '❌'}
                           </button>
                        </>
                      )}
                      <button
                         className="btn btn-sm btn-info"
                         onClick={() => handleViewDetails(request)}
                         title="View Details"
                         disabled={buttonLoading[`view-${request._id}`]}
                       >
                         {buttonLoading[`view-${request._id}`] ? '⏳' : '👁️'}
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

      {/* Action Modal */}
      {showActionModal && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {actionData.action === 'approve' ? '✅ Approve' : '❌ Reject'} Withdrawal Request
              </h3>
              <button onClick={() => setShowActionModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="request-details">
                <p><strong>User:</strong> {currentRequest?.user?.firstName} {currentRequest?.user?.lastName}</p>
                <p><strong>Amount:</strong> ${currentRequest?.amount?.toLocaleString()}</p>
                <p><strong>Method:</strong> {currentRequest?.method}</p>
                <p><strong>Current Priority:</strong> 
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(currentRequest?.priority) }}
                  >
                    {currentRequest?.priority}
                  </span>
                </p>
              </div>
              
              {actionData.action === 'approve' && (
                <div className="form-group">
                  <label>Processing Priority:</label>
                  <select
                    value={actionData.priority}
                    onChange={(e) => setActionData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {actionData.action === 'reject' && (
                <div className="form-group">
                  <label>Rejection Reason:</label>
                  <select
                    value={actionData.reason}
                    onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    <option value="">Select reason...</option>
                    <option value="insufficient_funds">Insufficient Funds</option>
                    <option value="invalid_account">Invalid Account Details</option>
                    <option value="security_concern">Security Concern</option>
                    <option value="compliance_issue">Compliance Issue</option>
                    <option value="duplicate_request">Duplicate Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Comment (Optional):</label>
                <textarea
                  value={actionData.comment}
                  onChange={(e) => setActionData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Add a comment or note for this action..."
                  rows="4"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`btn ${actionData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleActionSubmit}
                  disabled={actionData.action === 'reject' && !actionData.reason}
                >
                  {actionData.action === 'approve' ? '✅ Approve' : '❌ Reject'} Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Withdrawal Request Details</h3>
              <button onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="request-details">
                <div className="detail-row">
                  <strong>Request ID:</strong> {currentRequest?._id}
                </div>
                <div className="detail-row">
                  <strong>User:</strong> {currentRequest?.user?.firstName} {currentRequest?.user?.lastName}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {currentRequest?.user?.email}
                </div>
                <div className="detail-row">
                  <strong>Amount:</strong> ${currentRequest?.amount?.toLocaleString()}
                </div>
                <div className="detail-row">
                  <strong>Method:</strong> {currentRequest?.method}
                </div>
                <div className="detail-row">
                  <strong>Account Details:</strong> {currentRequest?.accountDetails || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge priority-${currentRequest?.priority}`}>
                    {currentRequest?.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span className={`status-badge status-${currentRequest?.status}`}>
                    {currentRequest?.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {new Date(currentRequest?.createdAt).toLocaleString()}
                </div>
                {currentRequest?.updatedAt && (
                  <div className="detail-row">
                    <strong>Updated:</strong> {new Date(currentRequest?.updatedAt).toLocaleString()}
                  </div>
                )}
                {currentRequest?.adminComment && (
                  <div className="detail-row">
                    <strong>Admin Comment:</strong> {currentRequest?.adminComment}
                  </div>
                )}
                {currentRequest?.reason && (
                  <div className="detail-row">
                    <strong>Reason:</strong> {currentRequest?.reason}
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestManagement;