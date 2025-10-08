import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  EyeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  UserIcon,
  ClockIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface FundTransfer {
  id: string;
  transactionId: string;
  sender: {
    name: string;
    account: string;
    email: string;
    userId: string;
  };
  receiver: {
    name: string;
    account: string;
    bankName: string;
    routingNumber?: string;
  };
  amount: number;
  currency: string;
  transferType: 'own_bank' | 'other_bank' | 'international';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'flagged';
  timestamp: string;
  completedAt?: string;
  purpose: string;
  reference: string;
  fees: number;
  exchangeRate?: number;
  riskScore: number;
  flags: string[];
  location: string;
  deviceInfo: string;
  ipAddress: string;
}

interface TransferLimit {
  id: string;
  userId: string;
  userName: string;
  category: 'own_bank' | 'other_bank' | 'international';
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
  lastUpdated: string;
}

interface BlockedAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  reason: string;
  blockedBy: string;
  blockedAt: string;
  isActive: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const FundTransferMonitoring: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'live' | 'limits' | 'blocked' | 'analytics'>('live');
  const [transfers, setTransfers] = useState<FundTransfer[]>([]);
  const [transferLimits, setTransferLimits] = useState<TransferLimit[]>([]);
  const [blockedAccounts, setBlockedAccounts] = useState<BlockedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<FundTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransfers();
    fetchTransferLimits();
    fetchBlockedAccounts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchTransfers();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchTransfers = async () => {
    // Mock data - replace with actual API call
    const mockTransfers: FundTransfer[] = [
      {
        id: 'FT001',
        transactionId: 'TXN2024012001',
        sender: {
          name: 'Ahmed Rahman',
          account: '1001234567',
          email: 'ahmed.rahman@email.com',
          userId: 'U001'
        },
        receiver: {
          name: 'Fatima Khan',
          account: '2001234568',
          bankName: 'Standard Bank',
          routingNumber: 'SB001'
        },
        amount: 75000,
        currency: 'BDT',
        transferType: 'other_bank',
        status: 'processing',
        timestamp: '2024-01-20T14:30:00Z',
        purpose: 'Business payment',
        reference: 'INV-2024-001',
        fees: 150,
        riskScore: 85,
        flags: ['Large amount', 'New recipient', 'High frequency'],
        location: 'Dhaka, Bangladesh',
        deviceInfo: 'Mobile App - Android 12',
        ipAddress: '103.15.200.45'
      },
      {
        id: 'FT002',
        transactionId: 'TXN2024012002',
        sender: {
          name: 'Rashid Ali',
          account: '1001234569',
          email: 'rashid.ali@email.com',
          userId: 'U002'
        },
        receiver: {
          name: 'John Smith',
          account: 'US123456789',
          bankName: 'Chase Bank',
          routingNumber: 'CHASUS33'
        },
        amount: 125000,
        currency: 'BDT',
        transferType: 'international',
        status: 'flagged',
        timestamp: '2024-01-20T13:15:00Z',
        purpose: 'Family support',
        reference: 'FAM-SUP-001',
        fees: 2500,
        exchangeRate: 110.50,
        riskScore: 95,
        flags: ['International transfer', 'High amount', 'Suspicious pattern'],
        location: 'Chittagong, Bangladesh',
        deviceInfo: 'Web Browser - Chrome 120',
        ipAddress: '103.15.201.78'
      },
      {
        id: 'FT003',
        transactionId: 'TXN2024012003',
        sender: {
          name: 'Nasir Uddin',
          account: '1001234570',
          email: 'nasir.uddin@email.com',
          userId: 'U003'
        },
        receiver: {
          name: 'Salma Begum',
          account: '1001234571',
          bankName: 'IB LTD',
          routingNumber: 'IB001'
        },
        amount: 25000,
        currency: 'BDT',
        transferType: 'own_bank',
        status: 'completed',
        timestamp: '2024-01-20T12:45:00Z',
        completedAt: '2024-01-20T12:47:00Z',
        purpose: 'Personal transfer',
        reference: 'PERS-001',
        fees: 0,
        riskScore: 15,
        flags: [],
        location: 'Sylhet, Bangladesh',
        deviceInfo: 'Mobile App - iOS 17',
        ipAddress: '103.15.202.123'
      }
    ];
    setTransfers(mockTransfers);
  };

  const fetchTransferLimits = async () => {
    // Mock data - replace with actual API call
    const mockLimits: TransferLimit[] = [
      {
        id: 'TL001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        category: 'other_bank',
        dailyLimit: 200000,
        monthlyLimit: 5000000,
        perTransactionLimit: 100000,
        currentDailyUsage: 75000,
        currentMonthlyUsage: 450000,
        isActive: true,
        lastUpdated: '2024-01-20T10:00:00Z'
      },
      {
        id: 'TL002',
        userId: 'U002',
        userName: 'Rashid Ali',
        category: 'international',
        dailyLimit: 500000,
        monthlyLimit: 10000000,
        perTransactionLimit: 200000,
        currentDailyUsage: 125000,
        currentMonthlyUsage: 800000,
        isActive: true,
        lastUpdated: '2024-01-20T09:30:00Z'
      }
    ];
    setTransferLimits(mockLimits);
  };

  const fetchBlockedAccounts = async () => {
    // Mock data - replace with actual API call
    const mockBlocked: BlockedAccount[] = [
      {
        id: 'BA001',
        accountNumber: '9999999999',
        bankName: 'Suspicious Bank',
        reason: 'Fraudulent activity detected',
        blockedBy: 'System Auto',
        blockedAt: '2024-01-19T15:30:00Z',
        isActive: true,
        riskLevel: 'high'
      },
      {
        id: 'BA002',
        accountNumber: '8888888888',
        bankName: 'Test Bank',
        reason: 'Multiple failed transactions',
        blockedBy: 'Admin User',
        blockedAt: '2024-01-18T10:15:00Z',
        isActive: true,
        riskLevel: 'medium'
      }
    ];
    setBlockedAccounts(mockBlocked);
    setLoading(false);
  };

  const handleTransferAction = async (transferId: string, action: 'reverse' | 'flag' | 'approve') => {
    try {
      // API call to handle transfer action
      console.log(`${action} transfer ${transferId}`);
      
      setTransfers(prev =>
        prev.map(transfer =>
          transfer.id === transferId
            ? { 
                ...transfer, 
                status: action === 'reverse' ? 'reversed' : 
                        action === 'flag' ? 'flagged' : 'completed'
              }
            : transfer
        )
      );
      
      alert(`Transfer ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling transfer action:', error);
      alert('Error processing transfer action');
    }
  };

  const updateTransferLimit = async (limitId: string, newLimit: Partial<TransferLimit>) => {
    try {
      // API call to update limit
      console.log(`Updating limit ${limitId}:`, newLimit);
      
      setTransferLimits(prev =>
        prev.map(limit =>
          limit.id === limitId ? { ...limit, ...newLimit } : limit
        )
      );
      
      alert('Transfer limit updated successfully');
    } catch (error) {
      console.error('Error updating transfer limit:', error);
      alert('Error updating transfer limit');
    }
  };

  const toggleBlockedAccount = async (accountId: string) => {
    try {
      // API call to toggle blocked status
      console.log(`Toggling blocked account ${accountId}`);
      
      setBlockedAccounts(prev =>
        prev.map(account =>
          account.id === accountId ? { ...account, isActive: !account.isActive } : account
        )
      );
      
      alert('Blocked account status updated successfully');
    } catch (error) {
      console.error('Error updating blocked account:', error);
      alert('Error updating blocked account status');
    }
  };

  const addBlockedAccount = async (accountNumber: string, bankName: string, reason: string) => {
    try {
      const newBlocked: BlockedAccount = {
        id: `BA${Date.now()}`,
        accountNumber,
        bankName,
        reason,
        blockedBy: 'Admin User',
        blockedAt: new Date().toISOString(),
        isActive: true,
        riskLevel: 'medium'
      };
      
      setBlockedAccounts(prev => [...prev, newBlocked]);
      alert('Account blocked successfully');
    } catch (error) {
      console.error('Error blocking account:', error);
      alert('Error blocking account');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'reversed': return 'text-purple-600 bg-purple-100';
      case 'flagged': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesType = typeFilter === 'all' || transfer.transferType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
          Fund Transfer Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time monitoring and control of all fund transfer activities
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'live', label: 'Live Transfers', count: transfers.filter(t => t.status === 'processing').length },
            { key: 'limits', label: 'Transfer Limits', count: transferLimits.length },
            { key: 'blocked', label: 'Blocked Accounts', count: blockedAccounts.filter(a => a.isActive).length },
            { key: 'analytics', label: 'Analytics', count: 0 }
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
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Live Transfers Tab */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="own_bank">Own Bank</option>
                  <option value="other_bank">Other Bank</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => fetchTransfers()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Transfers List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Fund Transfers ({filteredTransfers.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransfers.map((transfer) => (
                <div key={transfer.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {transfer.currency} {transfer.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(transfer.riskScore)}`}>
                          Risk: {transfer.riskScore}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {transfer.transferType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p><strong>From:</strong> {transfer.sender.name} ({transfer.sender.account})</p>
                          <p><strong>To:</strong> {transfer.receiver.name} ({transfer.receiver.account})</p>
                        </div>
                        <div>
                          <p><strong>Reference:</strong> {transfer.reference}</p>
                          <p><strong>Bank:</strong> {transfer.receiver.bankName}</p>
                        </div>
                      </div>
                      {transfer.flags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {transfer.flags.map((flag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <ShieldExclamationIcon className="w-3 h-3 mr-1" />
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedTransfer(transfer)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      {transfer.status === 'completed' && (
                        <button
                          onClick={() => handleTransferAction(transfer.id, 'reverse')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Reverse
                        </button>
                      )}
                      {transfer.status === 'processing' && (
                        <button
                          onClick={() => handleTransferAction(transfer.id, 'flag')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Flag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Transfer Limits Management
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
                      Per Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transferLimits.map((limit) => (
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
                        BDT {limit.perTransactionLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm">BDT {limit.currentDailyUsage.toLocaleString()}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(limit.currentDailyUsage / limit.dailyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const newDailyLimit = prompt('Enter new daily limit:', limit.dailyLimit.toString());
                            if (newDailyLimit) {
                              updateTransferLimit(limit.id, { dailyLimit: parseInt(newDailyLimit) });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => updateTransferLimit(limit.id, { isActive: !limit.isActive })}
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

      {/* Blocked Accounts Tab */}
      {activeTab === 'blocked' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Blocked Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Account Number"
                id="blockAccountNumber"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Bank Name"
                id="blockBankName"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Reason"
                id="blockReason"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={() => {
                  const accountNumber = (document.getElementById('blockAccountNumber') as HTMLInputElement).value;
                  const bankName = (document.getElementById('blockBankName') as HTMLInputElement).value;
                  const reason = (document.getElementById('blockReason') as HTMLInputElement).value;
                  
                  if (accountNumber && bankName && reason) {
                    addBlockedAccount(accountNumber, bankName, reason);
                    (document.getElementById('blockAccountNumber') as HTMLInputElement).value = '';
                    (document.getElementById('blockBankName') as HTMLInputElement).value = '';
                    (document.getElementById('blockReason') as HTMLInputElement).value = '';
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Block Account
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Blocked Accounts ({blockedAccounts.filter(a => a.isActive).length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Account Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Bank Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk Level
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
                  {blockedAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {account.accountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {account.bankName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {account.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                          account.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {account.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {account.blockedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.isActive ? 'BLOCKED' : 'UNBLOCKED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleBlockedAccount(account.id)}
                          className={`${
                            account.isActive 
                              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                              : 'text-red-600 hover:text-red-900 dark:text-red-400'
                          }`}
                        >
                          {account.isActive ? 'Unblock' : 'Block'}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BanknotesIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Transfers Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        BDT 2,450,000
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
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Users
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
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Pending Transfers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        23
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
                    <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Flagged Transfers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        5
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Transfer Volume by Type (Last 7 Days)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Own Bank</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Other Bank</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">International</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Transfer Details - {selectedTransfer.transactionId}
                </h3>
                <button
                  onClick={() => setSelectedTransfer(null)}
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
                      {selectedTransfer.currency} {selectedTransfer.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransfer.status)}`}>
                      {selectedTransfer.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sender</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.sender.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransfer.sender.account}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransfer.sender.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receiver</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.receiver.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransfer.receiver.account}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransfer.receiver.bankName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.purpose}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.reference}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.deviceInfo}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Assessment</label>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedTransfer.riskScore)}`}>
                      Risk Score: {selectedTransfer.riskScore}%
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTransfer.flags.map((flag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <ShieldExclamationIcon className="w-3 h-3 mr-1" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundTransferMonitoring;