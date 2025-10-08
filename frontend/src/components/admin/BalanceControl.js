import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './BalanceControl.css';

const BalanceControl = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Balance adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    amount: '',
    type: 'add', // 'add' or 'deduct'
    reason: '',
    notes: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    maxAdjustmentAmount: 10000,
    requireApproval: true,
    allowNegativeBalance: false
  });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getBalanceSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setError('');
    setSuccess('');
  };

  const handleFormChange = (field, value) => {
    setAdjustmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAdjustment = () => {
    const amount = parseFloat(adjustmentForm.amount);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }

    if (amount > settings.maxAdjustmentAmount) {
      setError(`Amount cannot exceed $${settings.maxAdjustmentAmount.toLocaleString()}`);
      return false;
    }

    if (!adjustmentForm.reason.trim()) {
      setError('Please provide a reason for the adjustment');
      return false;
    }

    if (adjustmentForm.type === 'deduct') {
      const newBalance = selectedUser.balance - amount;
      if (newBalance < 0 && !settings.allowNegativeBalance) {
        setError('This adjustment would result in a negative balance');
        return false;
      }
    }

    return true;
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!validateAdjustment()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const adjustmentData = {
        userId: selectedUser.id,
        amount: parseFloat(adjustmentForm.amount),
        type: adjustmentForm.type,
        reason: adjustmentForm.reason,
        notes: adjustmentForm.notes,
        requireApproval: settings.requireApproval
      };

      const response = await adminAPI.adjustUserBalance(adjustmentData);
      
      if (response.success) {
        setSuccess(`Balance ${adjustmentForm.type === 'add' ? 'added' : 'deducted'} successfully${settings.requireApproval ? ' (pending approval)' : ''}`);
        
        // Update user balance in local state
        if (!settings.requireApproval) {
          const updatedUser = {
            ...selectedUser,
            balance: adjustmentForm.type === 'add' 
              ? selectedUser.balance + parseFloat(adjustmentForm.amount)
              : selectedUser.balance - parseFloat(adjustmentForm.amount)
          };
          setSelectedUser(updatedUser);
          
          // Update users list
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id ? updatedUser : user
          ));
        }
        
        // Reset form
        setAdjustmentForm({
          amount: '',
          type: 'add',
          reason: '',
          notes: ''
        });
      } else {
        setError(response.message || 'Failed to adjust balance');
      }
    } catch (err) {
      setError('Error adjusting balance');
      console.error('Balance adjustment error:', err);
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

  const getBalanceClass = (balance) => {
    if (balance < 0) return 'balance-negative';
    if (balance < 100) return 'balance-low';
    return 'balance-positive';
  };

  return (
    <div className="balance-control">
      <div className="balance-control-header">
        <h2>Balance Control</h2>
        <p>Add or deduct funds from user accounts with proper documentation</p>
      </div>

      <div className="balance-control-content">
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
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.slice(0, 10).map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-info">
                    <div className="user-name">{user.name || 'N/A'}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-id">ID: {user.id}</div>
                  </div>
                  <div className="user-balance">
                    <span className={`balance ${getBalanceClass(user.balance)}`}>
                      {formatCurrency(user.balance)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-users">No users found</div>
            )}
          </div>
        </div>

        {/* Balance Adjustment Form */}
        {selectedUser && (
          <div className="adjustment-section">
            <h3>Adjust Balance for {selectedUser.name || selectedUser.email}</h3>
            <div className="current-balance">
              Current Balance: <span className={`balance ${getBalanceClass(selectedUser.balance)}`}>
                {formatCurrency(selectedUser.balance)}
              </span>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="adjustment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Adjustment Type</label>
                  <select
                    value={adjustmentForm.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="form-select"
                  >
                    <option value="add">Add Funds</option>
                    <option value="deduct">Deduct Funds</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={settings.maxAdjustmentAmount}
                    value={adjustmentForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                  <small>Max: {formatCurrency(settings.maxAdjustmentAmount)}</small>
                </div>
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <select
                  value={adjustmentForm.reason}
                  onChange={(e) => handleFormChange('reason', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="manual_correction">Manual Correction</option>
                  <option value="refund">Refund</option>
                  <option value="bonus">Bonus/Promotion</option>
                  <option value="penalty">Penalty/Fee</option>
                  <option value="system_error">System Error Correction</option>
                  <option value="customer_service">Customer Service Adjustment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={adjustmentForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  className="form-textarea"
                  placeholder="Optional additional details..."
                  rows="3"
                />
              </div>

              {adjustmentForm.amount && (
                <div className="preview-section">
                  <h4>Preview</h4>
                  <div className="balance-preview">
                    <div className="preview-row">
                      <span>Current Balance:</span>
                      <span>{formatCurrency(selectedUser.balance)}</span>
                    </div>
                    <div className="preview-row">
                      <span>{adjustmentForm.type === 'add' ? 'Adding:' : 'Deducting:'}</span>
                      <span className={adjustmentForm.type === 'add' ? 'positive' : 'negative'}>
                        {adjustmentForm.type === 'add' ? '+' : '-'}{formatCurrency(parseFloat(adjustmentForm.amount) || 0)}
                      </span>
                    </div>
                    <div className="preview-row total">
                      <span>New Balance:</span>
                      <span className={getBalanceClass(
                        adjustmentForm.type === 'add' 
                          ? selectedUser.balance + (parseFloat(adjustmentForm.amount) || 0)
                          : selectedUser.balance - (parseFloat(adjustmentForm.amount) || 0)
                      )}>
                        {formatCurrency(
                          adjustmentForm.type === 'add' 
                            ? selectedUser.balance + (parseFloat(adjustmentForm.amount) || 0)
                            : selectedUser.balance - (parseFloat(adjustmentForm.amount) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : `${adjustmentForm.type === 'add' ? 'Add' : 'Deduct'} Funds`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentForm({
                      amount: '',
                      type: 'add',
                      reason: '',
                      notes: ''
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceControl;