import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import { adminAPI } from '../../services/api';
import './TransactionComments.css';

const TransactionComments = ({ transactionId, onClose }) => {
  const { user } = useAuth();
  const { checkAdminAccess } = useAdminSecurity();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkAdminAccess()) return;
    fetchTransactionWithComments();
  }, [transactionId, checkAdminAccess]);

  const fetchTransactionWithComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getTransactionWithComments(transactionId);
      
      if (response.success) {
        setTransaction(response.data.transaction);
      } else {
        setError(response.message || 'Failed to fetch transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError(error.message || 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await adminAPI.addTransactionComment(transactionId, {
        comment: newComment.trim(),
        isInternal
      });

      if (response.success) {
        setSuccess('Comment added successfully');
        setNewComment('');
        setIsInternal(false);
        // Refresh transaction data
        await fetchTransactionWithComments();
      } else {
        setError(response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    
    const priorityClasses = {
      low: 'priority-low',
      normal: 'priority-normal',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };

    return (
      <span className={`priority-badge ${priorityClasses[priority] || 'priority-normal'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </span>
    );
  };

  if (loading) {
    return (
      <div className="transaction-comments-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Transaction Details</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading transaction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="transaction-comments-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Transaction Details</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-container">
            <p className="error-message">{error || 'Transaction not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-comments-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Transaction Details & Comments</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Transaction Details */}
          <div className="transaction-details">
            <h3>Transaction Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Transaction ID:</label>
                <span>{transaction._id}</span>
              </div>
              <div className="detail-item">
                <label>Type:</label>
                <span className={`transaction-type type-${transaction.type}`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <label>Amount:</label>
                <span className="amount">{formatAmount(transaction.amount)}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                {getStatusBadge(transaction.status)}
              </div>
              {transaction.priority && (
                <div className="detail-item">
                  <label>Priority:</label>
                  {getPriorityBadge(transaction.priority)}
                </div>
              )}
              <div className="detail-item">
                <label>User:</label>
                <span>
                  {transaction.user ? 
                    `${transaction.user.firstName} ${transaction.user.lastName} (${transaction.user.email})` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="detail-item">
                <label>Account:</label>
                <span>{transaction.account?.accountNumber || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              {transaction.reference && (
                <div className="detail-item">
                  <label>Reference:</label>
                  <span>{transaction.reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3>Admin Comments & Notes</h3>
            
            {/* Add New Comment Form */}
            <form onSubmit={handleAddComment} className="add-comment-form">
              <div className="form-group">
                <label htmlFor="comment">Add Comment:</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment or note..."
                  rows="3"
                  disabled={submitting}
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    disabled={submitting}
                  />
                  Internal comment (not visible to user)
                </label>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </form>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Comments List */}
            <div className="comments-list">
              {transaction.adminComments && transaction.adminComments.length > 0 ? (
                transaction.adminComments.map((comment, index) => (
                  <div key={index} className={`comment-item ${comment.isInternal ? 'internal-comment' : ''}`}>
                    <div className="comment-header">
                      <div className="comment-author">
                        <strong>{comment.addedByEmail}</strong>
                        {comment.isInternal && <span className="internal-badge">Internal</span>}
                      </div>
                      <div className="comment-date">
                        {formatDate(comment.addedAt)}
                      </div>
                    </div>
                    <div className="comment-content">
                      {comment.comment}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <p>No comments added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionComments;