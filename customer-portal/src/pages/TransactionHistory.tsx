import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/common/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  X, 
  CreditCard, 
  Building, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | 'interest' | 'adjustment';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  reference: string;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
  category?: string;
  channel: 'online' | 'mobile' | 'atm' | 'branch' | 'admin';
  location?: string;
  recipientName?: string;
  recipientAccount?: string;
  fees?: number;
  notes?: string;
}

interface TransactionHistoryProps {
  userId?: string;
  userName?: string;
  onClose?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, userName, onClose }) => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Transaction['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Transaction['status']>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | Transaction['channel']>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load transactions
  useEffect(() => {
    const loadTransactions = () => {
      try {
        // Generate mock transaction data for the user
        const mockTransactions: Transaction[] = [];
        const transactionTypes: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'interest'];
        const statuses: Transaction['status'][] = ['completed', 'pending', 'failed'];
        const channels: Transaction['channel'][] = ['online', 'mobile', 'atm', 'branch', 'admin'];
        
        for (let i = 0; i < 50; i++) {
          const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
          const amount = Math.floor(Math.random() * 100000) + 100;
          const balanceBefore = Math.floor(Math.random() * 500000) + 10000;
          const balanceAfter = type === 'deposit' || type === 'interest' 
            ? balanceBefore + amount 
            : balanceBefore - amount;

          mockTransactions.push({
            id: `TXN${Date.now()}${i}`,
            userId: userId || 'user123',
            userName: userName || 'John Doe',
            type,
            amount,
            currency: 'BDT',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            description: getTransactionDescription(type),
            reference: `REF${Date.now()}${i}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            balanceBefore,
            balanceAfter,
            channel: channels[Math.floor(Math.random() * channels.length)],
            location: Math.random() > 0.5 ? 'Dhaka Branch' : 'Online',
            fees: type === 'transfer' ? Math.floor(Math.random() * 50) + 5 : 0,
            recipientName: type === 'transfer' ? 'Jane Smith' : undefined,
            recipientAccount: type === 'transfer' ? '1234567890' : undefined,
            notes: Math.random() > 0.7 ? 'Additional transaction notes' : undefined
          });
        }

        setTransactions(mockTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (error) {
        console.error('Error loading transactions:', error);
        showError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [userId, userName, showError]);

  const getTransactionDescription = (type: Transaction['type']): string => {
    switch (type) {
      case 'deposit':
        return 'Account deposit';
      case 'withdrawal':
        return 'Cash withdrawal';
      case 'transfer':
        return 'Fund transfer';
      case 'payment':
        return 'Bill payment';
      case 'fee':
        return 'Service fee';
      case 'interest':
        return 'Interest credit';
      default:
        return 'Transaction';
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || transaction.channel === channelFilter;
    
    const transactionDate = new Date(transaction.timestamp);
    const matchesDateFrom = !dateFrom || transactionDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || transactionDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesType && matchesStatus && matchesChannel && matchesDateFrom && matchesDateTo;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'timestamp':
      default:
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
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

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'interest':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
      case 'payment':
      case 'fee':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const exportTransactions = () => {
    try {
      const csvContent = [
        ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference', 'Balance After'].join(','),
        ...sortedTransactions.map(t => [
          new Date(t.timestamp).toLocaleDateString(),
          t.type,
          t.description,
          t.amount,
          t.status,
          t.reference,
          t.balanceAfter
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-history-${userId || 'user'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showSuccess('Transaction history exported successfully');
    } catch (error) {
      showError('Failed to export transaction history');
    }
  };

  const calculateSummary = () => {
    const totalDeposits = filteredTransactions
      .filter(t => t.type === 'deposit' || t.type === 'interest')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal' || t.type === 'payment' || t.type === 'fee')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalTransfers = filteredTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalDeposits, totalWithdrawals, totalTransfers };
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          {userName && (
            <p className="text-gray-600">User: {userName}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Deposits</p>
              <p className="text-lg font-semibold text-gray-900">৳{summary.totalDeposits.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Withdrawals</p>
              <p className="text-lg font-semibold text-gray-900">৳{summary.totalWithdrawals.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ArrowUpRight className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Transfers</p>
              <p className="text-lg font-semibold text-gray-900">৳{summary.totalTransfers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
              <option value="payment">Payment</option>
              <option value="fee">Fee</option>
              <option value="interest">Interest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Channels</option>
              <option value="online">Online</option>
              <option value="mobile">Mobile</option>
              <option value="atm">ATM</option>
              <option value="branch">Branch</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportTransactions}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
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
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.reference}
                        </div>
                        {transaction.recipientName && (
                          <div className="text-xs text-gray-400">
                            To: {transaction.recipientName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'deposit' || transaction.type === 'interest' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-'}
                      ৳{transaction.amount.toLocaleString()}
                    </div>
                    {transaction.fees && transaction.fees > 0 && (
                      <div className="text-xs text-gray-500">
                        Fee: ৳{transaction.fees}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ৳{transaction.balanceAfter.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      View
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.reference}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className={`text-lg font-semibold ${
                    selectedTransaction.type === 'deposit' || selectedTransaction.type === 'interest' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'deposit' || selectedTransaction.type === 'interest' ? '+' : '-'}
                    ৳{selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-1 capitalize">{selectedTransaction.status}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedTransaction.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTransaction.channel}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Balance Before</label>
                  <p className="text-sm text-gray-900">৳{selectedTransaction.balanceBefore.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Balance After</label>
                  <p className="text-sm text-gray-900">৳{selectedTransaction.balanceAfter.toLocaleString()}</p>
                </div>
                {selectedTransaction.fees && selectedTransaction.fees > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees</label>
                    <p className="text-sm text-gray-900">৳{selectedTransaction.fees}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedTransaction.recipientName && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Recipient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.recipientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient Account</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.recipientAccount}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTransaction.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <p className="text-sm text-gray-900">{selectedTransaction.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;