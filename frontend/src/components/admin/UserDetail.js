import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './UserDetail.css';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: '',
    type: 'credit',
    reason: ''
  });
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserById(userId);
      
      if (response.success) {
        setUser(response.data.user);
        setEditForm({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          role: response.data.user.role || 'user',
          isActive: response.data.user.isActive || false,
          isVerified: response.data.user.isVerified || false
        });
      } else {
        setError(response.message || 'Failed to fetch user details');
      }
    } catch (err) {
      setError('Error fetching user details');
      console.error('Fetch user details error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle balance adjustment input changes
  const handleBalanceInputChange = (e) => {
    const { name, value } = e.target;
    setBalanceAdjustment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save user changes
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.updateUser(userId, editForm);
      
      if (response.success) {
        setUser(response.data.user);
        setIsEditing(false);
        setError('');
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Error updating user');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async () => {
    try {
      const newStatus = !user.isActive;
      const response = await adminAPI.updateUserStatus(userId, {
        isActive: newStatus,
        reason: `Status ${newStatus ? 'activated' : 'deactivated'} by admin`
      });
      
      if (response.success) {
        setUser(prev => ({ ...prev, isActive: newStatus }));
        setEditForm(prev => ({ ...prev, isActive: newStatus }));
      } else {
        setError(response.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('Error updating user status');
      console.error('Toggle status error:', err);
    }
  };

  // Handle balance adjustment
  const handleBalanceAdjustment = async () => {
    try {
      if (!balanceAdjustment.amount || !balanceAdjustment.reason) {
        setError('Amount and reason are required for balance adjustment');
        return;
      }

      const response = await adminAPI.adjustBalance(userId, balanceAdjustment);
      
      if (response.success) {
        setUser(prev => ({ 
          ...prev, 
          balance: response.data.newBalance 
        }));
        setBalanceAdjustment({ amount: '', type: 'credit', reason: '' });
        setShowBalanceModal(false);
        setError('');
      } else {
        setError(response.message || 'Failed to adjust balance');
      }
    } catch (err) {
      setError('Error adjusting balance');
      console.error('Balance adjustment error:', err);
    }
  };

  // Reset user password
  const handlePasswordReset = async () => {
    try {
      const response = await adminAPI.resetUserPassword(userId);
      
      if (response.success) {
        setShowPasswordReset(false);
        setError('');
        alert('Password reset successfully. New password sent to user email.');
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error resetting password');
      console.error('Password reset error:', err);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await adminAPI.deleteUser(userId);
        
        if (response.success) {
          navigate('/admin/users');
        } else {
          setError(response.message || 'Failed to delete user');
        }
      } catch (err) {
        setError('Error deleting user');
        console.error('Delete user error:', err);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="user-detail">
        <div className="loading">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail">
        <div className="error-message">User not found</div>
        <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail">
      {/* Header */}
      <div className="user-detail-header">
        <div className="header-left">
          <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
          <div className="user-title">
            <h2>{user.name}</h2>
            <div className="user-badges">
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              <span className={`status-badge status-${user.status || 'default'}`}>
                {user.status || 'Active'}
              </span>
              <span className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit User
              </button>
              <button 
                className={`btn ${user.isActive ? 'btn-warning' : 'btn-primary'}`}
                onClick={handleToggleStatus}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBalanceModal(true)}>
                Adjust Balance
              </button>
              <button className="btn btn-outline" onClick={() => setShowPasswordReset(true)}>
                Reset Password
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser}>
                Delete User
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleSaveChanges}>
                Save Changes
              </button>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.name}</div>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.email}</div>
                )}
              </div>

              <div className="form-group">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.phone || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Role</label>
                {isEditing ? (
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <div className="form-value">
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="form-value">
                  <span className={`status-badge status-${user.status || 'default'}`}>
                    {user.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Account Status</label>
                {isEditing ? (
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={editForm.isActive}
                        onChange={handleInputChange}
                      />
                      Active
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={editForm.isVerified}
                        onChange={handleInputChange}
                      />
                      Verified
                    </label>
                  </div>
                ) : (
                  <div className="form-value">
                    <span className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {user.isVerified && (
                      <span className="verified-badge">Verified</span>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Created At</label>
                <div className="form-value">{formatDate(user.createdAt)}</div>
              </div>

              <div className="form-group">
                <label>Last Updated</label>
                <div className="form-value">{formatDate(user.updatedAt)}</div>
              </div>

              {user.lastLogin && (
                <div className="form-group">
                  <label>Last Login</label>
                  <div className="form-value">{formatDate(user.lastLogin)}</div>
                </div>
              )}

              {user.approvedBy && (
                <div className="form-group">
                  <label>Approved By</label>
                  <div className="form-value">
                    {user.approvedBy.name} ({user.approvedBy.email})
                    <br />
                    <small>{formatDate(user.approvedAt)}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="account-tab">
            <div className="account-info">
              <div className="account-card">
                <h3>Account Information</h3>
                <div className="account-details">
                  <div className="detail-item">
                    <label>Account Number</label>
                    <div className="value">
                      {user.accountNumber || 'No account created'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Account Type</label>
                    <div className="value">
                      {user.accountType || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Current Balance</label>
                    <div className="value balance">
                      {formatCurrency(user.balance)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <div className="transactions-header">
              <h3>Transaction History</h3>
              <div className="transaction-stats">
                <div className="stat-item">
                  <label>Total Transactions</label>
                  <div className="value">{transactions.length}</div>
                </div>
              </div>
            </div>
            
            {transactions.length > 0 ? (
              <div className="transactions-list">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-type">{transaction.type}</div>
                      <div className="transaction-date">{formatDate(transaction.createdAt)}</div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'credit' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-transactions">
                No transactions found for this user.
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="security-info">
              <div className="security-item">
                <label>Two-Factor Authentication</label>
                <div className="value">
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="security-item">
                <label>Login Attempts</label>
                <div className="value">{user.loginAttempts || 0}</div>
              </div>
              <div className="security-item">
                <label>Account Locked</label>
                <div className="value">
                  {user.isLocked ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Adjust Balance</h3>
              <button className="close-btn" onClick={() => setShowBalanceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={balanceAdjustment.type}
                  onChange={handleBalanceInputChange}
                  className="form-select"
                >
                  <option value="credit">Credit (Add)</option>
                  <option value="debit">Debit (Subtract)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={balanceAdjustment.amount}
                  onChange={handleBalanceInputChange}
                  className="form-input"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={balanceAdjustment.reason}
                  onChange={handleBalanceInputChange}
                  className="form-textarea"
                  placeholder="Enter reason for adjustment"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleBalanceAdjustment}>
                Adjust Balance
              </button>
              <button className="btn btn-outline" onClick={() => setShowBalanceModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="close-btn" onClick={() => setShowPasswordReset(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reset this user's password?</p>
              <p>A new temporary password will be sent to their email address.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={handlePasswordReset}>
                Reset Password
              </button>
              <button className="btn btn-outline" onClick={() => setShowPasswordReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;