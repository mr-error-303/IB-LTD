import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, EyeIcon, FlagIcon } from '@heroicons/react/24/outline';

interface PendingTransaction {
  id: string;
  type: 'fund_transfer' | 'bill_payment' | 'mobile_topup' | 'cash_withdrawal' | 'international_transfer';
  amount: number;
  currency: string;
  sender: {
    name: string;
    account: string;
    email: string;
  };
  receiver: {
    name: string;
    account: string;
    identifier: string;
  };
  purpose: string;
  timestamp: string;
  status: 'pending_approval' | 'flagged' | 'under_review';
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  location?: string;
  deviceInfo?: string;
}

interface TransactionLimit {
  id: string;
  userId: string;
  userName: string;
  category: 'fund_transfer' | 'bill_payment' | 'mobile_topup' | 'cash_withdrawal';
  dailyLimit: number;
  monthlyLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
}

interface BlockedEntity {
  id: string;
  type: 'account' | 'mobile_number' | 'location';
  identifier: string;
  reason: string;
  blockedBy: string;
  blockedAt: string;
  isActive: boolean;
}

const AdminTransactionOversight: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'limits' | 'blocked' | 'monitoring'>('pending');
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [transactionLimits, setTransactionLimits] = useState<TransactionLimit[]>([]);
  const [blockedEntities, setBlockedEntities] = useState<BlockedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [auditComment, setAuditComment] = useState('');

  useEffect(() => {
    fetchPendingTransactions();
    fetchTransactionLimits();
    fetchBlockedEntities();
  }, []);

  const fetchPendingTransactions = async () => {
    // Mock data - replace with actual API call
    const mockPendingTransactions: PendingTransaction[] = [
      {
        id: 'PT001',
        type: 'fund_transfer',
        amount: 75000,
        currency: 'BDT',
        sender: {
          name: 'Ahmed Rahman',
          account: '1001234567',
          email: 'ahmed.rahman@email.com'
        },
        receiver: {
          name: 'Fatima Khan',
          account: '1001234568',
          identifier: '1001234568'
        },
        purpose: 'Business payment',
        timestamp: '2024-01-20T14:30:00Z',
        status: 'pending_approval',
        riskLevel: 'high',
        flags: ['Large amount', 'New recipient'],
        location: 'Dhaka, Bangladesh',
        deviceInfo: 'Mobile App - Android'
      },
      {
        id: 'PT002',
        type: 'international_transfer',
        amount: 25000,
        currency: 'BDT',
        sender: {
          name: 'Rashid Ali',
          account: '1001234569',
          email: 'rashid.ali@email.com'
        },
        receiver: {
          name: 'John Smith',
          account: 'US123456789',
          identifier: 'SWIFT: CHASUS33'
        },
        purpose: 'Family support',
        timestamp: '2024-01-20T13:15:00Z',
        status: 'flagged',
        riskLevel: 'high',
        flags: ['International transfer', 'Frequent sender'],
        location: 'Chittagong, Bangladesh',
        deviceInfo: 'Web Browser - Chrome'
      },
      {
        id: 'PT003',
        type: 'cash_withdrawal',
        amount: 55000,
        currency: 'BDT',
        sender: {
          name: 'Nasir Uddin',
          account: '1001234570',
          email: 'nasir.uddin@email.com'
        },
        receiver: {
          name: 'ATM Withdrawal',
          account: 'ATM001',
          identifier: 'ATM-DH-001'
        },
        purpose: 'Cash withdrawal',
        timestamp: '2024-01-20T12:45:00Z',
        status: 'under_review',
        riskLevel: 'medium',
        flags: ['Above daily limit'],
        location: 'Gulshan, Dhaka',
        deviceInfo: 'ATM Terminal'
      }
    ];
    setPendingTransactions(mockPendingTransactions);
  };

  const fetchTransactionLimits = async () => {
    // Mock data - replace with actual API call
    const mockLimits: TransactionLimit[] = [
      {
        id: 'TL001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        category: 'fund_transfer',
        dailyLimit: 100000,
        monthlyLimit: 2000000,
        currentDailyUsage: 75000,
        currentMonthlyUsage: 450000,
        isActive: true
      },
      {
        id: 'TL002',
        userId: 'U002',
        userName: 'Fatima Khan',
        category: 'cash_withdrawal',
        dailyLimit: 50000,
        monthlyLimit: 1000000,
        currentDailyUsage: 25000,
        currentMonthlyUsage: 200000,
        isActive: true
      }
    ];
    setTransactionLimits(mockLimits);
  };

  const fetchBlockedEntities = async () => {
    // Mock data - replace with actual API call
    const mockBlocked: BlockedEntity[] = [
      {
        id: 'BE001',
        type: 'account',
        identifier: '1001234999',
        reason: 'Suspicious activity detected',
        blockedBy: 'Admin User',
        blockedAt: '2024-01-19T10:00:00Z',
        isActive: true
      },
      {
        id: 'BE002',
        type: 'mobile_number',
        identifier: '+8801712345678',
        reason: 'Fraudulent top-up attempts',
        blockedBy: 'System Auto',
        blockedAt: '2024-01-18T15:30:00Z',
        isActive: true
      }
    ];
    setBlockedEntities(mockBlocked);
    setLoading(false);
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject' | 'flag', comment: string) => {
    try {
      // API call to handle transaction action
      console.log(`${action} transaction ${transactionId} with comment: ${comment}`);
      
      // Update local state
      setPendingTransactions(prev => 
        prev.filter(t => t.id !== transactionId)
      );
      
      setSelectedTransaction(null);
      setAuditComment('');
      
      // Show success notification
      alert(`Transaction ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling transaction action:', error);
      alert('Error processing transaction action');
    }
  };

  const updateTransactionLimit = async (limitId: string, newLimit: Partial<TransactionLimit>) => {
    try {
      // API call to update limit
      console.log(`Updating limit ${limitId}:`, newLimit);
      
      setTransactionLimits(prev =>
        prev.map(limit =>
          limit.id === limitId ? { ...limit, ...newLimit } : limit
        )
      );
      
      alert('Transaction limit updated successfully');
    } catch (error) {
      console.error('Error updating transaction limit:', error);
      alert('Error updating transaction limit');
    }
  };

  const toggleBlockedEntity = async (entityId: string) => {
    try {
      // API call to toggle blocked status
      console.log(`Toggling blocked entity ${entityId}`);
      
      setBlockedEntities(prev =>
        prev.map(entity =>
          entity.id === entityId ? { ...entity, isActive: !entity.isActive } : entity
        )
      );
      
      alert('Blocked entity status updated successfully');
    } catch (error) {
      console.error('Error updating blocked entity:', error);
      alert('Error updating blocked entity status');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'text-blue-600 bg-blue-100';
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Transaction Oversight
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor, approve, and manage all user transactions and service controls
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending Approvals', count: pendingTransactions.length },
            { key: 'limits', label: 'Transaction Limits', count: transactionLimits.length },
            { key: 'blocked', label: 'Blocked Entities', count: blockedEntities.filter(e => e.isActive).length },
            { key: 'monitoring', label: 'Real-time Monitoring', count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Pending Transactions Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Pending Transaction Approvals
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(transaction.riskLevel)}`}>
                          {transaction.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p><strong>From:</strong> {transaction.sender.name} ({transaction.sender.account})</p>
                          <p><strong>To:</strong> {transaction.receiver.name} ({transaction.receiver.identifier})</p>
                        </div>
                        <div>
                          <p><strong>Purpose:</strong> {transaction.purpose}</p>
                          <p><strong>Location:</strong> {transaction.location}</p>
                        </div>
                      </div>
                      {transaction.flags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {transaction.flags.map((flag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <FlagIcon className="w-3 h-3 mr-1" />
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Transaction Limits Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Daily Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monthly Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactionLimits.map((limit) => (
                    <tr key={limit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {limit.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {limit.category.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {limit.dailyLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {limit.monthlyLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="space-y-1">
                          <div>Daily: {((limit.currentDailyUsage / limit.dailyLimit) * 100).toFixed(1)}%</div>
                          <div>Monthly: {((limit.currentMonthlyUsage / limit.monthlyLimit) * 100).toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const newDailyLimit = prompt('Enter new daily limit:', limit.dailyLimit.toString());
                            if (newDailyLimit) {
                              updateTransactionLimit(limit.id, { dailyLimit: parseInt(newDailyLimit) });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit Limits
                        </button>
                        <button
                          onClick={() => updateTransactionLimit(limit.id, { isActive: !limit.isActive })}
                          className={`${limit.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} dark:text-red-400 dark:hover:text-red-300`}
                        >
                          {limit.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Entities Tab */}
      {activeTab === 'blocked' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Blocked Entities Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Identifier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blocked By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {blockedEntities.map((entity) => (
                    <tr key={entity.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {entity.type.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {entity.identifier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {entity.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {entity.blockedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entity.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entity.isActive ? 'BLOCKED' : 'UNBLOCKED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleBlockedEntity(entity.id)}
                          className={`${
                            entity.isActive 
                              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                              : 'text-red-600 hover:text-red-900 dark:text-red-400'
                          }`}
                        >
                          {entity.isActive ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">FT</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Fund Transfers Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        1,247
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BP</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Bill Payments Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        892
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">MT</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Mobile Top-ups Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        2,156
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CW</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Cash Withdrawals Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        634
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Real-time Transaction Feed
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Mock real-time transactions */}
              {[
                { time: '14:32', type: 'Fund Transfer', amount: 'BDT 15,000', user: 'Ahmed Rahman', status: 'completed' },
                { time: '14:31', type: 'Bill Payment', amount: 'BDT 2,500', user: 'Fatima Khan', status: 'completed' },
                { time: '14:30', type: 'Mobile Top-up', amount: 'BDT 500', user: 'Rashid Ali', status: 'completed' },
                { time: '14:29', type: 'Cash Withdrawal', amount: 'BDT 10,000', user: 'Nasir Uddin', status: 'pending' },
                { time: '14:28', type: 'International Transfer', amount: 'BDT 50,000', user: 'Salma Begum', status: 'flagged' }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{transaction.time}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{transaction.amount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">by {transaction.user}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Review Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Transaction Review - {selectedTransaction.id}
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Level</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(selectedTransaction.riskLevel)}`}>
                      {selectedTransaction.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sender</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.sender.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.sender.account}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receiver</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.receiver.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.receiver.identifier}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.purpose}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Flags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTransaction.flags.map((flag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <FlagIcon className="w-3 h-3 mr-1" />
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Audit Comment</label>
                  <textarea
                    value={auditComment}
                    onChange={(e) => setAuditComment(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your review comments..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => handleTransactionAction(selectedTransaction.id, 'reject', auditComment)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleTransactionAction(selectedTransaction.id, 'flag', auditComment)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <FlagIcon className="w-4 h-4 mr-2" />
                    Flag for Review
                  </button>
                  <button
                    onClick={() => handleTransactionAction(selectedTransaction.id, 'approve', auditComment)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionOversight;