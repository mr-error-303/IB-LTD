import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';

interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  currentBalance: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

interface BalanceTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  amount: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
  adminId: string;
  adminName: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

const BalanceManagement: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showError, showSuccess, showWarning } = useNotifications();
  
  const [users, setUsers] = useState<User[]>([]);
  const [balanceTransactions, setBalanceTransactions] = useState<BalanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchBalanceTransactions();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: 'USER001',
            name: 'John Doe',
            email: 'john.doe@email.com',
            accountNumber: '1234567890',
            currentBalance: 150000,
            status: 'active',
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'USER002',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            accountNumber: '1234567891',
            currentBalance: 75000,
            status: 'active',
            lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'USER003',
            name: 'Bob Johnson',
            email: 'bob.johnson@email.com',
            accountNumber: '1234567892',
            currentBalance: 200000,
            status: 'active',
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'USER004',
            name: 'Alice Brown',
            email: 'alice.brown@email.com',
            accountNumber: '1234567893',
            currentBalance: 50000,
            status: 'inactive',
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      const appError = handleError(error, 'BalanceManagement');
      log.error('Error fetching users', appError, 'BalanceManagement');
      showError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const fetchBalanceTransactions = async () => {
    try {
      // Simulate API call
      const mockTransactions: BalanceTransaction[] = [
        {
          id: 'BAL001',
          userId: 'USER001',
          userName: 'John Doe',
          type: 'credit',
          amount: 10000,
          previousBalance: 140000,
          newBalance: 150000,
          reason: 'Bonus credit for loyal customer',
          adminId: 'ADMIN001',
          adminName: 'Admin User',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          approvedBy: 'ADMIN001',
          approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'BAL002',
          userId: 'USER002',
          userName: 'Jane Smith',
          type: 'debit',
          amount: 5000,
          previousBalance: 80000,
          newBalance: 75000,
          reason: 'Correction for duplicate transaction',
          adminId: 'ADMIN001',
          adminName: 'Admin User',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ];
      setBalanceTransactions(mockTransactions);
    } catch (error) {
      log.error('Error fetching balance transactions', error, 'BalanceManagement');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.accountNumber.includes(searchTerm)
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !amount || !reason) {
      showError('Please fill in all required fields');
      return;
    }

    const adjustmentAmount = parseFloat(amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (transactionType === 'debit' && adjustmentAmount > selectedUser.currentBalance) {
      showError('Insufficient balance for debit transaction');
      return;
    }

    try {
      const newTransaction: BalanceTransaction = {
        id: `BAL${Date.now()}`,
        userId: selectedUser.id,
        userName: selectedUser.name,
        type: transactionType,
        amount: adjustmentAmount,
        previousBalance: selectedUser.currentBalance,
        newBalance: transactionType === 'credit' 
          ? selectedUser.currentBalance + adjustmentAmount
          : selectedUser.currentBalance - adjustmentAmount,
        reason,
        adminId: user?.id || 'ADMIN001',
        adminName: user?.name || 'Admin User',
        timestamp: new Date().toISOString(),
        status: requiresApproval ? 'pending' : 'approved',
        ...(requiresApproval ? {} : {
          approvedBy: user?.id || 'ADMIN001',
          approvedAt: new Date().toISOString()
        })
      };

      // Update user balance if not requiring approval
      if (!requiresApproval) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, currentBalance: newTransaction.newBalance }
            : u
        ));
      }

      setBalanceTransactions(prev => [newTransaction, ...prev]);

      // Log the transaction
      log.transaction(
        `Balance ${transactionType} of ৳${adjustmentAmount} for user ${selectedUser.name}`,
        {
          userId: selectedUser.id,
          amount: adjustmentAmount,
          type: transactionType,
          reason,
          adminId: user?.id,
          requiresApproval
        }
      );

      showSuccess(
        requiresApproval 
          ? 'Balance adjustment submitted for approval'
          : `Balance ${transactionType === 'credit' ? 'credited' : 'debited'} successfully`
      );

      // Reset form
      setShowBalanceModal(false);
      setSelectedUser(null);
      setAmount('');
      setReason('');
      setRequiresApproval(false);

    } catch (error) {
      const appError = handleError(error, 'BalanceManagement');
      log.error('Error processing balance adjustment', appError, 'BalanceManagement');
      showError('Failed to process balance adjustment. Please try again.');
    }
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      const transaction = balanceTransactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // Update transaction status
      setBalanceTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { 
              ...t, 
              status: 'approved',
              approvedBy: user?.id || 'ADMIN001',
              approvedAt: new Date().toISOString()
            }
          : t
      ));

      // Update user balance
      setUsers(prev => prev.map(u => 
        u.id === transaction.userId 
          ? { ...u, currentBalance: transaction.newBalance }
          : u
      ));

      showSuccess('Transaction approved successfully');
    } catch (error) {
      showError('Failed to approve transaction');
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    try {
      setBalanceTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { 
              ...t, 
              status: 'rejected',
              approvedBy: user?.id || 'ADMIN001',
              approvedAt: new Date().toISOString()
            }
          : t
      ));

      showSuccess('Transaction rejected');
    } catch (error) {
      showError('Failed to reject transaction');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Balance Management</h1>
            <p className="text-gray-600">Manage user account balances with comprehensive audit trail</p>
          </div>
          <div className="flex space-x-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ৳{users.reduce((sum, user) => sum + user.currentBalance, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Balance</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or account number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Accounts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ৳{user.currentBalance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTimeAgo(user.lastActivity)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowBalanceModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Balance Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Balance Transactions</h2>
        <div className="space-y-3">
          {balanceTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount.toLocaleString()} - {transaction.userName}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.reason}</p>
                    <p className="text-xs text-gray-500">
                      By {transaction.adminName} • {formatTimeAgo(transaction.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </span>
                {transaction.status === 'pending' && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => approveTransaction(transaction.id)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectTransaction(transaction.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Adjust Balance - {selectedUser.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  ৳{selectedUser.currentBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as 'credit' | 'debit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Deduct Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for balance adjustment"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="requiresApproval" className="text-sm text-gray-700">
                  Requires additional approval
                </label>
              </div>

              {amount && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    New Balance: ৳{(
                      transactionType === 'credit' 
                        ? selectedUser.currentBalance + parseFloat(amount || '0')
                        : selectedUser.currentBalance - parseFloat(amount || '0')
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBalanceAdjustment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {requiresApproval ? 'Submit for Approval' : 'Apply Changes'}
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                  setAmount('');
                  setReason('');
                  setRequiresApproval(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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

export default BalanceManagement;