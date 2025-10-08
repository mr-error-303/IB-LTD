import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';

interface PendingTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment' | 'loan_disbursement';
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  fromUser?: string;
  toUser?: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  riskScore: number;
  requiredApprovals: number;
  currentApprovals: number;
  approvedBy: string[];
  rejectedBy: string[];
  metadata: {
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
    userAgent?: string;
    sessionId?: string;
  };
  attachments?: string[];
  notes?: string;
}

interface ApprovalAction {
  id: string;
  transactionId: string;
  adminId: string;
  adminName: string;
  action: 'approved' | 'rejected' | 'requested_info';
  timestamp: string;
  notes?: string;
  reason?: string;
}

const TransactionApproval: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showError, showSuccess, showWarning } = useNotifications();
  
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'priority' | 'riskScore'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPendingTransactions();
    fetchApprovalHistory();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockTransactions: PendingTransaction[] = [
          {
            id: 'TXN001',
            type: 'transfer',
            amount: 500000,
            fromAccount: '1234567890',
            toAccount: '1234567891',
            fromUser: 'John Doe',
            toUser: 'Jane Smith',
            description: 'Large transfer - requires approval',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            status: 'pending',
            priority: 'high',
            riskScore: 85,
            requiredApprovals: 2,
            currentApprovals: 0,
            approvedBy: [],
            rejectedBy: [],
            metadata: {
              ipAddress: '192.168.1.100',
              deviceInfo: 'Chrome 120.0.0.0 on Windows 10',
              location: 'Dhaka, Bangladesh',
              sessionId: 'sess_123456'
            }
          },
          {
            id: 'TXN002',
            type: 'withdrawal',
            amount: 100000,
            fromAccount: '1234567892',
            fromUser: 'Bob Johnson',
            description: 'ATM withdrawal - unusual amount',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            status: 'pending',
            priority: 'medium',
            riskScore: 65,
            requiredApprovals: 1,
            currentApprovals: 0,
            approvedBy: [],
            rejectedBy: [],
            metadata: {
              ipAddress: '192.168.1.101',
              deviceInfo: 'Mobile App v2.1.0 on Android 12',
              location: 'Chittagong, Bangladesh'
            }
          },
          {
            id: 'TXN003',
            type: 'loan_disbursement',
            amount: 1000000,
            toAccount: '1234567893',
            toUser: 'Alice Brown',
            description: 'Personal loan disbursement',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            status: 'pending',
            priority: 'urgent',
            riskScore: 95,
            requiredApprovals: 3,
            currentApprovals: 1,
            approvedBy: ['ADMIN002'],
            rejectedBy: [],
            metadata: {
              ipAddress: '192.168.1.102',
              deviceInfo: 'Chrome 120.0.0.0 on macOS 14',
              location: 'Sylhet, Bangladesh'
            },
            notes: 'Credit score verified, employment confirmed'
          },
          {
            id: 'TXN004',
            type: 'payment',
            amount: 25000,
            fromAccount: '1234567890',
            fromUser: 'John Doe',
            description: 'Online merchant payment',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'approved',
            priority: 'low',
            riskScore: 25,
            requiredApprovals: 1,
            currentApprovals: 1,
            approvedBy: ['ADMIN001'],
            rejectedBy: [],
            metadata: {
              ipAddress: '192.168.1.100',
              deviceInfo: 'Chrome 120.0.0.0 on Windows 10',
              location: 'Dhaka, Bangladesh'
            }
          }
        ];
        setPendingTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      const appError = handleError(error, 'TransactionApproval');
      log.error('Error fetching pending transactions', appError, 'TransactionApproval');
      showError('Failed to load pending transactions. Please try again.');
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const mockHistory: ApprovalAction[] = [
        {
          id: 'APP001',
          transactionId: 'TXN004',
          adminId: 'ADMIN001',
          adminName: 'Admin User',
          action: 'approved',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          notes: 'Standard merchant payment, low risk'
        },
        {
          id: 'APP002',
          transactionId: 'TXN003',
          adminId: 'ADMIN002',
          adminName: 'Senior Admin',
          action: 'approved',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          notes: 'First approval - documentation verified'
        }
      ];
      setApprovalHistory(mockHistory);
    } catch (error) {
      log.error('Error fetching approval history', error, 'TransactionApproval');
    }
  };

  const filteredTransactions = pendingTransactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || transaction.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'priority':
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'riskScore':
        aValue = a.riskScore;
        bValue = b.riskScore;
        break;
      default:
        aValue = a.timestamp;
        bValue = b.timestamp;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const handleApproveTransaction = async (transactionId: string, notes?: string) => {
    try {
      const transaction = pendingTransactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const newApproval: ApprovalAction = {
        id: `APP${Date.now()}`,
        transactionId,
        adminId: user?.id || 'ADMIN001',
        adminName: user?.name || 'Admin User',
        action: 'approved',
        timestamp: new Date().toISOString(),
        notes: notes || approvalNotes
      };

      // Update transaction
      const updatedTransaction = {
        ...transaction,
        currentApprovals: transaction.currentApprovals + 1,
        approvedBy: [...transaction.approvedBy, user?.id || 'ADMIN001'],
        status: (transaction.currentApprovals + 1 >= transaction.requiredApprovals) ? 'approved' : 'pending'
      } as PendingTransaction;

      setPendingTransactions(prev => prev.map(t => 
        t.id === transactionId ? updatedTransaction : t
      ));

      setApprovalHistory(prev => [newApproval, ...prev]);

      // Log the approval
      log.transaction(
        `Transaction ${transactionId} approved by ${user?.name}`,
        {
          transactionId,
          amount: transaction.amount,
          type: transaction.type,
          adminId: user?.id,
          notes: notes || approvalNotes
        }
      );

      showSuccess(
        updatedTransaction.status === 'approved' 
          ? 'Transaction fully approved and processed'
          : `Approval recorded (${updatedTransaction.currentApprovals}/${updatedTransaction.requiredApprovals})`
      );

      setApprovalNotes('');
      setShowDetailModal(false);

    } catch (error) {
      const appError = handleError(error, 'TransactionApproval');
      log.error('Error approving transaction', appError, 'TransactionApproval');
      showError('Failed to approve transaction. Please try again.');
    }
  };

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    try {
      const transaction = pendingTransactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const newRejection: ApprovalAction = {
        id: `REJ${Date.now()}`,
        transactionId,
        adminId: user?.id || 'ADMIN001',
        adminName: user?.name || 'Admin User',
        action: 'rejected',
        timestamp: new Date().toISOString(),
        reason,
        notes: approvalNotes
      };

      // Update transaction
      setPendingTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { 
              ...t, 
              status: 'rejected',
              rejectedBy: [...t.rejectedBy, user?.id || 'ADMIN001']
            }
          : t
      ));

      setApprovalHistory(prev => [newRejection, ...prev]);

      // Log the rejection
      log.transaction(
        `Transaction ${transactionId} rejected by ${user?.name}`,
        {
          transactionId,
          amount: transaction.amount,
          type: transaction.type,
          adminId: user?.id,
          reason,
          notes: approvalNotes
        }
      );

      showSuccess('Transaction rejected successfully');
      setApprovalNotes('');
      setShowDetailModal(false);

    } catch (error) {
      const appError = handleError(error, 'TransactionApproval');
      log.error('Error rejecting transaction', appError, 'TransactionApproval');
      showError('Failed to reject transaction. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
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
            <h1 className="text-2xl font-bold text-gray-900">Transaction Approval</h1>
            <p className="text-gray-600">Review and approve pending transactions</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pendingTransactions.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {pendingTransactions.filter(t => t.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-500">Urgent</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp-desc">Newest First</option>
            <option value="timestamp-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="priority-desc">Highest Priority</option>
            <option value="riskScore-desc">Highest Risk</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approvals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id} - {transaction.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.fromUser && `From: ${transaction.fromUser}`}
                        {transaction.toUser && ` To: ${transaction.toUser}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimeAgo(transaction.timestamp)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ৳{transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(transaction.priority)}`}>
                      {transaction.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getRiskColor(transaction.riskScore)}`}>
                      {transaction.riskScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.currentApprovals}/{transaction.requiredApprovals}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveTransaction(transaction.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Quick Approve
                          </button>
                        </>
                      )}
                    </div>
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
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

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Transaction Details - {selectedTransaction.id}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedTransaction.type.replace('_', ' ').toUpperCase()}</div>
                    <div><span className="font-medium">Amount:</span> ৳{selectedTransaction.amount.toLocaleString()}</div>
                    <div><span className="font-medium">Description:</span> {selectedTransaction.description}</div>
                    <div><span className="font-medium">Timestamp:</span> {new Date(selectedTransaction.timestamp).toLocaleString()}</div>
                    {selectedTransaction.fromUser && (
                      <div><span className="font-medium">From:</span> {selectedTransaction.fromUser} ({selectedTransaction.fromAccount})</div>
                    )}
                    {selectedTransaction.toUser && (
                      <div><span className="font-medium">To:</span> {selectedTransaction.toUser} ({selectedTransaction.toAccount})</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Risk Score:</span>
                      <span className={`font-bold ${getRiskColor(selectedTransaction.riskScore)}`}>
                        {selectedTransaction.riskScore}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTransaction.priority)}`}>
                        {selectedTransaction.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Device & Location</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">IP Address:</span> {selectedTransaction.metadata.ipAddress}</div>
                    <div><span className="font-medium">Device:</span> {selectedTransaction.metadata.deviceInfo}</div>
                    <div><span className="font-medium">Location:</span> {selectedTransaction.metadata.location}</div>
                  </div>
                </div>
              </div>

              {/* Approval Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Approval Status</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Required Approvals:</span> {selectedTransaction.requiredApprovals}</div>
                    <div><span className="font-medium">Current Approvals:</span> {selectedTransaction.currentApprovals}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedTransaction.notes}</p>
                  </div>
                )}

                {selectedTransaction.status === 'pending' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Approval Actions</h4>
                    <div className="space-y-3">
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add notes for this approval/rejection..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTransaction(selectedTransaction.id, approvalNotes)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve Transaction
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(selectedTransaction.id, 'Rejected by admin')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject Transaction
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Approval History */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Approval History</h4>
              <div className="space-y-2">
                {approvalHistory
                  .filter(action => action.transactionId === selectedTransaction.id)
                  .map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {action.adminName} {action.action} this transaction
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(action.timestamp).toLocaleString()}
                        </div>
                        {action.notes && (
                          <div className="text-sm text-gray-600 mt-1">{action.notes}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        action.action === 'approved' ? 'bg-green-100 text-green-800' :
                        action.action === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {action.action}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionApproval;