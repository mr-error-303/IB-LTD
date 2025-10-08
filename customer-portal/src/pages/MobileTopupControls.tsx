import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  EyeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ClockIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface MobileTopup {
  id: string;
  transactionId: string;
  user: {
    name: string;
    account: string;
    email: string;
    userId: string;
  };
  mobileNumber: string;
  operator: 'Grameenphone' | 'Robi' | 'Banglalink' | 'Teletalk' | 'Airtel';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  topupDate: string;
  reference: string;
  fees: number;
  location: string;
  deviceInfo: string;
  confirmationNumber?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  nextTopupDate?: string;
}

interface TopupLimit {
  id: string;
  userId: string;
  userName: string;
  operator: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
  lastUpdated: string;
}

interface BlockedNumber {
  id: string;
  mobileNumber: string;
  operator: string;
  reason: string;
  blockedDate: string;
  blockedBy: string;
  isActive: boolean;
  suspiciousActivity?: {
    frequentTopups: boolean;
    unusualAmounts: boolean;
    multipleUsers: boolean;
    rapidTransactions: boolean;
  };
}

interface RefundRequest {
  id: string;
  topupId: string;
  transactionId: string;
  user: {
    name: string;
    account: string;
  };
  mobileNumber: string;
  operator: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedBy?: string;
  processedDate?: string;
  comments?: string;
}

const MobileTopupControls: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'topups' | 'limits' | 'blocked' | 'refunds' | 'analytics'>('topups');
  const [topups, setTopups] = useState<MobileTopup[]>([]);
  const [topupLimits, setTopupLimits] = useState<TopupLimit[]>([]);
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopup, setSelectedTopup] = useState<MobileTopup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  useEffect(() => {
    fetchTopups();
    fetchTopupLimits();
    fetchBlockedNumbers();
    fetchRefundRequests();
  }, []);

  const fetchTopups = async () => {
    // Mock data - replace with actual API call
    const mockTopups: MobileTopup[] = [
      {
        id: 'MT001',
        transactionId: 'TXN2024012201',
        user: {
          name: 'Ahmed Rahman',
          account: '1001234567',
          email: 'ahmed.rahman@email.com',
          userId: 'U001'
        },
        mobileNumber: '01712345678',
        operator: 'Grameenphone',
        amount: 500,
        currency: 'BDT',
        status: 'completed',
        topupDate: '2024-01-22T10:30:00Z',
        reference: 'GP-TOP-001',
        fees: 5,
        location: 'Dhaka, Bangladesh',
        deviceInfo: 'Mobile App - Android 12',
        confirmationNumber: 'GP123456789',
        isRecurring: false
      },
      {
        id: 'MT002',
        transactionId: 'TXN2024012202',
        user: {
          name: 'Fatima Khan',
          account: '1001234568',
          email: 'fatima.khan@email.com',
          userId: 'U002'
        },
        mobileNumber: '01812345678',
        operator: 'Robi',
        amount: 200,
        currency: 'BDT',
        status: 'failed',
        topupDate: '2024-01-22T14:15:00Z',
        reference: 'RB-TOP-002',
        fees: 3,
        location: 'Chittagong, Bangladesh',
        deviceInfo: 'Web Browser - Chrome 120',
        failureReason: 'Operator system unavailable',
        isRecurring: true,
        recurringFrequency: 'weekly',
        nextTopupDate: '2024-01-29T14:15:00Z'
      },
      {
        id: 'MT003',
        transactionId: 'TXN2024012203',
        user: {
          name: 'Suspicious User',
          account: '1001234569',
          email: 'suspicious@email.com',
          userId: 'U003'
        },
        mobileNumber: '01912345678',
        operator: 'Banglalink',
        amount: 1000,
        currency: 'BDT',
        status: 'cancelled',
        topupDate: '2024-01-22T09:45:00Z',
        reference: 'BL-TOP-003',
        fees: 10,
        location: 'Sylhet, Bangladesh',
        deviceInfo: 'Mobile App - iOS 17',
        isRecurring: false
      },
      {
        id: 'MT004',
        transactionId: 'TXN2024012204',
        user: {
          name: 'Rashid Ali',
          account: '1001234570',
          email: 'rashid.ali@email.com',
          userId: 'U004'
        },
        mobileNumber: '01512345678',
        operator: 'Teletalk',
        amount: 100,
        currency: 'BDT',
        status: 'refunded',
        topupDate: '2024-01-21T16:20:00Z',
        reference: 'TT-TOP-004',
        fees: 2,
        location: 'Rajshahi, Bangladesh',
        deviceInfo: 'Web Browser - Firefox 121',
        refundAmount: 100,
        refundDate: '2024-01-22T10:00:00Z',
        isRecurring: false
      }
    ];
    setTopups(mockTopups);
  };

  const fetchTopupLimits = async () => {
    // Mock data - replace with actual API call
    const mockLimits: TopupLimit[] = [
      {
        id: 'TL001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        operator: 'Grameenphone',
        dailyLimit: 2000,
        monthlyLimit: 20000,
        perTransactionLimit: 1000,
        currentDailyUsage: 500,
        currentMonthlyUsage: 8500,
        isActive: true,
        lastUpdated: '2024-01-20T10:00:00Z'
      },
      {
        id: 'TL002',
        userId: 'U002',
        userName: 'Fatima Khan',
        operator: 'Robi',
        dailyLimit: 1500,
        monthlyLimit: 15000,
        perTransactionLimit: 500,
        currentDailyUsage: 200,
        currentMonthlyUsage: 3200,
        isActive: true,
        lastUpdated: '2024-01-20T09:30:00Z'
      },
      {
        id: 'TL003',
        userId: 'U003',
        userName: 'Suspicious User',
        operator: 'All',
        dailyLimit: 500,
        monthlyLimit: 2000,
        perTransactionLimit: 200,
        currentDailyUsage: 1000,
        currentMonthlyUsage: 5000,
        isActive: false,
        lastUpdated: '2024-01-22T08:00:00Z'
      }
    ];
    setTopupLimits(mockLimits);
  };

  const fetchBlockedNumbers = async () => {
    // Mock data - replace with actual API call
    const mockBlocked: BlockedNumber[] = [
      {
        id: 'BN001',
        mobileNumber: '01912345678',
        operator: 'Banglalink',
        reason: 'Suspicious activity - Multiple rapid transactions',
        blockedDate: '2024-01-22T09:00:00Z',
        blockedBy: 'Admin User',
        isActive: true,
        suspiciousActivity: {
          frequentTopups: true,
          unusualAmounts: true,
          multipleUsers: true,
          rapidTransactions: true
        }
      },
      {
        id: 'BN002',
        mobileNumber: '01612345678',
        operator: 'Airtel',
        reason: 'Fraud investigation - Reported stolen number',
        blockedDate: '2024-01-20T15:30:00Z',
        blockedBy: 'Security Team',
        isActive: true,
        suspiciousActivity: {
          frequentTopups: false,
          unusualAmounts: true,
          multipleUsers: true,
          rapidTransactions: false
        }
      },
      {
        id: 'BN003',
        mobileNumber: '01712345679',
        operator: 'Grameenphone',
        reason: 'Temporary block - Investigation completed',
        blockedDate: '2024-01-15T12:00:00Z',
        blockedBy: 'Admin User',
        isActive: false,
        suspiciousActivity: {
          frequentTopups: true,
          unusualAmounts: false,
          multipleUsers: false,
          rapidTransactions: true
        }
      }
    ];
    setBlockedNumbers(mockBlocked);
  };

  const fetchRefundRequests = async () => {
    // Mock data - replace with actual API call
    const mockRefunds: RefundRequest[] = [
      {
        id: 'RF001',
        topupId: 'MT004',
        transactionId: 'TXN2024012204',
        user: {
          name: 'Rashid Ali',
          account: '1001234570'
        },
        mobileNumber: '01512345678',
        operator: 'Teletalk',
        amount: 100,
        reason: 'Top-up not received on mobile number',
        requestDate: '2024-01-21T18:00:00Z',
        status: 'processed',
        processedBy: 'Admin User',
        processedDate: '2024-01-22T10:00:00Z',
        comments: 'Verified with operator. Refund processed successfully.'
      },
      {
        id: 'RF002',
        topupId: 'MT002',
        transactionId: 'TXN2024012202',
        user: {
          name: 'Fatima Khan',
          account: '1001234568'
        },
        mobileNumber: '01812345678',
        operator: 'Robi',
        amount: 200,
        reason: 'Transaction failed but amount deducted',
        requestDate: '2024-01-22T15:00:00Z',
        status: 'pending',
        comments: 'Under investigation with operator'
      }
    ];
    setRefundRequests(mockRefunds);
    setLoading(false);
  };

  const handleTopupAction = async (topupId: string, action: 'cancel' | 'retry' | 'refund') => {
    try {
      // API call to handle topup action
      console.log(`${action} topup ${topupId}`);
      
      setTopups(prev =>
        prev.map(topup =>
          topup.id === topupId
            ? { 
                ...topup, 
                status: action === 'cancel' ? 'cancelled' : 
                        action === 'retry' ? 'processing' : 'refunded'
              }
            : topup
        )
      );
      
      alert(`Top-up ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling topup action:', error);
      alert('Error processing top-up action');
    }
  };

  const updateTopupLimit = async (limitId: string, newLimit: Partial<TopupLimit>) => {
    try {
      // API call to update limit
      console.log(`Updating limit ${limitId}:`, newLimit);
      
      setTopupLimits(prev =>
        prev.map(limit =>
          limit.id === limitId ? { ...limit, ...newLimit } : limit
        )
      );
      
      alert('Top-up limit updated successfully');
    } catch (error) {
      console.error('Error updating topup limit:', error);
      alert('Error updating top-up limit');
    }
  };

  const toggleBlockedNumber = async (numberId: string) => {
    try {
      // API call to toggle blocked number status
      console.log(`Toggling blocked number ${numberId}`);
      
      setBlockedNumbers(prev =>
        prev.map(blocked =>
          blocked.id === numberId ? { ...blocked, isActive: !blocked.isActive } : blocked
        )
      );
      
      alert('Blocked number status updated successfully');
    } catch (error) {
      console.error('Error updating blocked number:', error);
      alert('Error updating blocked number status');
    }
  };

  const blockMobileNumber = async (mobileNumber: string, reason: string) => {
    try {
      // API call to block mobile number
      console.log(`Blocking number ${mobileNumber}: ${reason}`);
      
      const newBlocked: BlockedNumber = {
        id: `BN${Date.now()}`,
        mobileNumber,
        operator: 'Unknown',
        reason,
        blockedDate: new Date().toISOString(),
        blockedBy: 'Current Admin',
        isActive: true
      };
      
      setBlockedNumbers(prev => [newBlocked, ...prev]);
      alert('Mobile number blocked successfully');
    } catch (error) {
      console.error('Error blocking mobile number:', error);
      alert('Error blocking mobile number');
    }
  };

  const processRefundRequest = async (refundId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      // API call to process refund request
      console.log(`${action} refund ${refundId}: ${comments}`);
      
      setRefundRequests(prev =>
        prev.map(refund =>
          refund.id === refundId
            ? { 
                ...refund, 
                status: action === 'approve' ? 'approved' : 'rejected',
                processedBy: 'Current Admin',
                processedDate: new Date().toISOString(),
                comments: comments || refund.comments
              }
            : refund
        )
      );
      
      alert(`Refund request ${action}d successfully`);
    } catch (error) {
      console.error('Error processing refund request:', error);
      alert('Error processing refund request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOperatorColor = (operator: string) => {
    switch (operator) {
      case 'Grameenphone': return 'text-green-600 bg-green-100';
      case 'Robi': return 'text-orange-600 bg-orange-100';
      case 'Banglalink': return 'text-blue-600 bg-blue-100';
      case 'Teletalk': return 'text-red-600 bg-red-100';
      case 'Airtel': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTopups = topups.filter(topup => {
    const matchesSearch = topup.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topup.mobileNumber.includes(searchTerm) ||
                         topup.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || topup.status === statusFilter;
    const matchesOperator = operatorFilter === 'all' || topup.operator === operatorFilter;
    
    return matchesSearch && matchesStatus && matchesOperator;
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
          Mobile Top-up Controls
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive monitoring and management of mobile recharge transactions
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'topups', label: 'Transaction History', count: topups.length },
            { key: 'limits', label: 'Top-up Limits', count: topupLimits.filter(l => l.isActive).length },
            { key: 'blocked', label: 'Blocked Numbers', count: blockedNumbers.filter(b => b.isActive).length },
            { key: 'refunds', label: 'Refund Requests', count: refundRequests.filter(r => r.status === 'pending').length },
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

      {/* Transaction History Tab */}
      {activeTab === 'topups' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search top-ups..."
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
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Operators</option>
                  <option value="Grameenphone">Grameenphone</option>
                  <option value="Robi">Robi</option>
                  <option value="Banglalink">Banglalink</option>
                  <option value="Teletalk">Teletalk</option>
                  <option value="Airtel">Airtel</option>
                </select>
              </div>
              <div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => fetchTopups()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Top-ups List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Mobile Top-ups ({filteredTopups.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTopups.map((topup) => (
                <div key={topup.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {topup.currency} {topup.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(topup.status)}`}>
                          {topup.status.charAt(0).toUpperCase() + topup.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>To: {topup.mobileNumber}</span>
                        <span>Operator: {topup.operator}</span>
                        <span>{new Date(topup.topupDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTopup(topup)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTopupControls;