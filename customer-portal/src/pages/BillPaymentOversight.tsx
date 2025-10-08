import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  EyeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface BillPayment {
  id: string;
  transactionId: string;
  user: {
    name: string;
    account: string;
    email: string;
    userId: string;
  };
  biller: {
    name: string;
    category: string;
    billerId: string;
    accountNumber: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentDate: string;
  dueDate: string;
  billPeriod: string;
  reference: string;
  fees: number;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  nextPaymentDate?: string;
  location: string;
  deviceInfo: string;
  confirmationNumber?: string;
}

interface Biller {
  id: string;
  name: string;
  category: 'utility' | 'telecom' | 'insurance' | 'loan' | 'credit_card' | 'government' | 'other';
  isActive: boolean;
  agreementDate: string;
  totalPayments: number;
  totalAmount: number;
  lastPaymentDate?: string;
  averageAmount: number;
  paymentLimits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

interface PaymentLimit {
  id: string;
  userId: string;
  userName: string;
  category: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
  lastUpdated: string;
}

const BillPaymentOversight: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'payments' | 'billers' | 'limits' | 'recurring' | 'analytics'>('payments');
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [paymentLimits, setPaymentLimits] = useState<PaymentLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<BillPayment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  useEffect(() => {
    fetchPayments();
    fetchBillers();
    fetchPaymentLimits();
  }, []);

  const fetchPayments = async () => {
    // Mock data - replace with actual API call
    const mockPayments: BillPayment[] = [
      {
        id: 'BP001',
        transactionId: 'TXN2024012101',
        user: {
          name: 'Ahmed Rahman',
          account: '1001234567',
          email: 'ahmed.rahman@email.com',
          userId: 'U001'
        },
        biller: {
          name: 'DESCO',
          category: 'utility',
          billerId: 'DESCO001',
          accountNumber: '12345678901'
        },
        amount: 3500,
        currency: 'BDT',
        status: 'completed',
        paymentDate: '2024-01-21T10:30:00Z',
        dueDate: '2024-01-25T23:59:59Z',
        billPeriod: 'December 2023',
        reference: 'ELEC-DEC-2023',
        fees: 25,
        isRecurring: true,
        recurringFrequency: 'monthly',
        nextPaymentDate: '2024-02-21T10:30:00Z',
        location: 'Dhaka, Bangladesh',
        deviceInfo: 'Mobile App - Android 12',
        confirmationNumber: 'DESCO123456789'
      },
      {
        id: 'BP002',
        transactionId: 'TXN2024012102',
        user: {
          name: 'Fatima Khan',
          account: '1001234568',
          email: 'fatima.khan@email.com',
          userId: 'U002'
        },
        biller: {
          name: 'Grameenphone',
          category: 'telecom',
          billerId: 'GP001',
          accountNumber: '01712345678'
        },
        amount: 1200,
        currency: 'BDT',
        status: 'processing',
        paymentDate: '2024-01-21T14:15:00Z',
        dueDate: '2024-01-22T23:59:59Z',
        billPeriod: 'January 2024',
        reference: 'GP-JAN-2024',
        fees: 15,
        isRecurring: false,
        location: 'Chittagong, Bangladesh',
        deviceInfo: 'Web Browser - Chrome 120'
      },
      {
        id: 'BP003',
        transactionId: 'TXN2024012103',
        user: {
          name: 'Rashid Ali',
          account: '1001234569',
          email: 'rashid.ali@email.com',
          userId: 'U003'
        },
        biller: {
          name: 'Dhaka WASA',
          category: 'utility',
          billerId: 'WASA001',
          accountNumber: '98765432101'
        },
        amount: 850,
        currency: 'BDT',
        status: 'failed',
        paymentDate: '2024-01-21T09:45:00Z',
        dueDate: '2024-01-20T23:59:59Z',
        billPeriod: 'December 2023',
        reference: 'WATER-DEC-2023',
        fees: 20,
        isRecurring: true,
        recurringFrequency: 'monthly',
        nextPaymentDate: '2024-02-21T09:45:00Z',
        location: 'Dhaka, Bangladesh',
        deviceInfo: 'Mobile App - iOS 17'
      }
    ];
    setPayments(mockPayments);
  };

  const fetchBillers = async () => {
    // Mock data - replace with actual API call
    const mockBillers: Biller[] = [
      {
        id: 'B001',
        name: 'DESCO',
        category: 'utility',
        isActive: true,
        agreementDate: '2023-06-15T00:00:00Z',
        totalPayments: 24,
        totalAmount: 84000,
        lastPaymentDate: '2024-01-21T10:30:00Z',
        averageAmount: 3500,
        paymentLimits: {
          minAmount: 100,
          maxAmount: 50000,
          dailyLimit: 100000,
          monthlyLimit: 500000
        },
        riskLevel: 'low',
        verificationStatus: 'verified'
      },
      {
        id: 'B002',
        name: 'Grameenphone',
        category: 'telecom',
        isActive: true,
        agreementDate: '2023-08-20T00:00:00Z',
        totalPayments: 18,
        totalAmount: 21600,
        lastPaymentDate: '2024-01-21T14:15:00Z',
        averageAmount: 1200,
        paymentLimits: {
          minAmount: 50,
          maxAmount: 10000,
          dailyLimit: 50000,
          monthlyLimit: 200000
        },
        riskLevel: 'low',
        verificationStatus: 'verified'
      },
      {
        id: 'B003',
        name: 'Suspicious Biller Ltd',
        category: 'other',
        isActive: false,
        agreementDate: '2024-01-10T00:00:00Z',
        totalPayments: 2,
        totalAmount: 15000,
        lastPaymentDate: '2024-01-15T12:00:00Z',
        averageAmount: 7500,
        paymentLimits: {
          minAmount: 1000,
          maxAmount: 20000,
          dailyLimit: 50000,
          monthlyLimit: 100000
        },
        riskLevel: 'high',
        verificationStatus: 'rejected'
      }
    ];
    setBillers(mockBillers);
  };

  const fetchPaymentLimits = async () => {
    // Mock data - replace with actual API call
    const mockLimits: PaymentLimit[] = [
      {
        id: 'PL001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        category: 'utility',
        dailyLimit: 50000,
        monthlyLimit: 500000,
        perTransactionLimit: 25000,
        currentDailyUsage: 3500,
        currentMonthlyUsage: 84000,
        isActive: true,
        lastUpdated: '2024-01-20T10:00:00Z'
      },
      {
        id: 'PL002',
        userId: 'U002',
        userName: 'Fatima Khan',
        category: 'telecom',
        dailyLimit: 20000,
        monthlyLimit: 200000,
        perTransactionLimit: 10000,
        currentDailyUsage: 1200,
        currentMonthlyUsage: 21600,
        isActive: true,
        lastUpdated: '2024-01-20T09:30:00Z'
      }
    ];
    setPaymentLimits(mockLimits);
    setLoading(false);
  };

  const handlePaymentAction = async (paymentId: string, action: 'cancel' | 'retry' | 'refund') => {
    try {
      // API call to handle payment action
      console.log(`${action} payment ${paymentId}`);
      
      setPayments(prev =>
        prev.map(payment =>
          payment.id === paymentId
            ? { 
                ...payment, 
                status: action === 'cancel' ? 'cancelled' : 
                        action === 'retry' ? 'processing' : 'completed'
              }
            : payment
        )
      );
      
      alert(`Payment ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling payment action:', error);
      alert('Error processing payment action');
    }
  };

  const toggleBillerStatus = async (billerId: string) => {
    try {
      // API call to toggle biller status
      console.log(`Toggling biller ${billerId}`);
      
      setBillers(prev =>
        prev.map(biller =>
          biller.id === billerId ? { ...biller, isActive: !biller.isActive } : biller
        )
      );
      
      alert('Biller status updated successfully');
    } catch (error) {
      console.error('Error updating biller status:', error);
      alert('Error updating biller status');
    }
  };

  const updatePaymentLimit = async (limitId: string, newLimit: Partial<PaymentLimit>) => {
    try {
      // API call to update limit
      console.log(`Updating limit ${limitId}:`, newLimit);
      
      setPaymentLimits(prev =>
        prev.map(limit =>
          limit.id === limitId ? { ...limit, ...newLimit } : limit
        )
      );
      
      alert('Payment limit updated successfully');
    } catch (error) {
      console.error('Error updating payment limit:', error);
      alert('Error updating payment limit');
    }
  };

  const stopRecurringPayment = async (paymentId: string) => {
    try {
      // API call to stop recurring payment
      console.log(`Stopping recurring payment ${paymentId}`);
      
      setPayments(prev =>
        prev.map(payment =>
          payment.id === paymentId
            ? { ...payment, isRecurring: false, nextPaymentDate: undefined }
            : payment
        )
      );
      
      alert('Recurring payment stopped successfully');
    } catch (error) {
      console.error('Error stopping recurring payment:', error);
      alert('Error stopping recurring payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'utility': return 'text-blue-600 bg-blue-100';
      case 'telecom': return 'text-green-600 bg-green-100';
      case 'insurance': return 'text-purple-600 bg-purple-100';
      case 'loan': return 'text-orange-600 bg-orange-100';
      case 'credit_card': return 'text-red-600 bg-red-100';
      case 'government': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.biller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || payment.biller.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const recurringPayments = payments.filter(payment => payment.isRecurring);

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
          Bill Payment Oversight
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive monitoring and management of all bill payment activities
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'payments', label: 'Payment History', count: payments.length },
            { key: 'billers', label: 'Biller Management', count: billers.filter(b => b.isActive).length },
            { key: 'limits', label: 'Payment Limits', count: paymentLimits.length },
            { key: 'recurring', label: 'Recurring Payments', count: recurringPayments.length },
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

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search payments..."
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
                </select>
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="utility">Utility</option>
                  <option value="telecom">Telecom</option>
                  <option value="insurance">Insurance</option>
                  <option value="loan">Loan</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="government">Government</option>
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
                  onClick={() => fetchPayments()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Bill Payments ({filteredPayments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(payment.biller.category)}`}>
                          {payment.biller.category.toUpperCase()}
                        </span>
                        {payment.isRecurring && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <ArrowPathIcon className="w-3 h-3 mr-1" />
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p><strong>User:</strong> {payment.user.name} ({payment.user.account})</p>
                          <p><strong>Biller:</strong> {payment.biller.name}</p>
                          <p><strong>Account:</strong> {payment.biller.accountNumber}</p>
                        </div>
                        <div>
                          <p><strong>Bill Period:</strong> {payment.billPeriod}</p>
                          <p><strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}</p>
                          <p><strong>Reference:</strong> {payment.reference}</p>
                        </div>
                      </div>
                      {payment.confirmationNumber && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Confirmation: {payment.confirmationNumber}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      {payment.status === 'failed' && (
                        <button
                          onClick={() => handlePaymentAction(payment.id, 'retry')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Retry
                        </button>
                      )}
                      {payment.status === 'processing' && (
                        <button
                          onClick={() => handlePaymentAction(payment.id, 'cancel')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Cancel
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

      {/* Biller Management Tab */}
      {activeTab === 'billers' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Registered Billers ({billers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Biller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Payments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk Level
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
                  {billers.map((biller) => (
                    <tr key={biller.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {biller.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {biller.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(biller.category)}`}>
                          {biller.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {biller.totalPayments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {biller.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(biller.riskLevel)}`}>
                          {biller.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          biller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {biller.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleBillerStatus(biller.id)}
                          className={`${
                            biller.isActive 
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400' 
                              : 'text-green-600 hover:text-green-900 dark:text-green-400'
                          } mr-4`}
                        >
                          {biller.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit Limits
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

      {/* Payment Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Payment Limits Management
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
                  {paymentLimits.map((limit) => (
                    <tr key={limit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {limit.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(limit.category)}`}>
                          {limit.category.toUpperCase()}
                        </span>
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
                              updatePaymentLimit(limit.id, { dailyLimit: parseInt(newDailyLimit) });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => updatePaymentLimit(limit.id, { isActive: !limit.isActive })}
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

      {/* Recurring Payments Tab */}
      {activeTab === 'recurring' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Recurring Payments ({recurringPayments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recurringPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(payment.biller.category)}`}>
                          {payment.biller.category.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {payment.recurringFrequency?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p><strong>User:</strong> {payment.user.name}</p>
                          <p><strong>Biller:</strong> {payment.biller.name}</p>
                          <p><strong>Account:</strong> {payment.biller.accountNumber}</p>
                        </div>
                        <div>
                          <p><strong>Last Payment:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</p>
                          <p><strong>Next Payment:</strong> {payment.nextPaymentDate ? new Date(payment.nextPaymentDate).toLocaleDateString() : 'N/A'}</p>
                          <p><strong>Reference:</strong> {payment.reference}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => stopRecurringPayment(payment.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <StopIcon className="w-4 h-4 mr-1" />
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Payments Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        BDT 125,450
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
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Billers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {billers.filter(b => b.isActive).length}
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
                        Pending Payments
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {payments.filter(p => p.status === 'pending').length}
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
                    <ArrowPathIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Recurring Payments
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {recurringPayments.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Payment Volume by Category (Last 30 Days)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Utility</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telecom</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Government</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Payment Details - {selectedPayment.transactionId}
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
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
                      {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.user.account}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biller</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.biller.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.biller.accountNumber}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedPayment.biller.category)}`}>
                      {selectedPayment.biller.category.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bill Period</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.billPeriod}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedPayment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.deviceInfo}</p>
                  </div>
                </div>
                
                {selectedPayment.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recurring Payment</label>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {selectedPayment.recurringFrequency?.toUpperCase()}
                      </span>
                      {selectedPayment.nextPaymentDate && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Next: {new Date(selectedPayment.nextPaymentDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPaymentOversight;