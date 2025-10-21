import React, { useState, useEffect } from 'react';
// @ts-ignore – lucide-react types not installed, but icons exist at runtime
import { 
  Receipt, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  User, 
  Clock, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  Settings,
  Building,
  Zap,
  Wifi,
  Phone,
  Car,
  Home,
  CreditCard,
  Shield,
  Ban,
  CheckSquare
} from 'lucide-react';




interface BillPayment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  billType: 'electricity' | 'gas' | 'water' | 'internet' | 'mobile' | 'insurance' | 'loan' | 'credit_card';
  billerName: string;
  billerId: string;
  accountNumber: string;
  amount: number;
  billAmount: number;
  convenienceFee: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'wallet' | 'bank_transfer' | 'card';
  transactionId: string;
  billReference: string;
  dueDate: Date;
  paidAt?: Date;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Biller {
  id: string;
  name: string;
  category: string;
  type: 'electricity' | 'gas' | 'water' | 'internet' | 'mobile' | 'insurance' | 'loan' | 'credit_card';
  isActive: boolean;
  convenienceFee: number;
  feeType: 'fixed' | 'percentage';
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  supportContact: string;
  apiEndpoint: string;
  lastSyncAt: Date;
  totalTransactions: number;
  successRate: number;
  avgProcessingTime: number;
}

interface PaymentLimit {
  id: string;
  userId: string;
  userName: string;
  billType: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
  setBy: string;
  setAt: Date;
  reason: string;
}

interface FailedPaymentResolution {
  id: string;
  paymentId: string;
  userName: string;
  billType: string;
  amount: number;
  failureReason: string;
  resolutionStatus: 'pending' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  resolutionNotes?: string;
  customerNotified: boolean;
  refundProcessed: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

const BillPaymentOversight: React.FC = () => {
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [paymentLimits, setPaymentLimits] = useState<PaymentLimit[]>([]);
  const [failedResolutions, setFailedResolutions] = useState<FailedPaymentResolution[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'billers' | 'limits' | 'resolutions' | 'analytics'>('payments');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<BillPayment | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<FailedPaymentResolution | null>(null);

  // Mock data for bill payments
  useEffect(() => {
    const mockPayments: BillPayment[] = [
      {
        id: 'bill_001',
        userId: 'user_001',
        userName: 'John Doe',
        userEmail: 'john.doe@email.com',
        billType: 'electricity',
        billerName: 'Dhaka Power Distribution Company',
        billerId: 'DPDC_001',
        accountNumber: 'ELC123456789',
        amount: 2500,
        billAmount: 2450,
        convenienceFee: 50,
        status: 'completed',
        paymentMethod: 'wallet',
        transactionId: 'TXN_BILL_001',
        billReference: 'DPDC_REF_001',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        id: 'bill_002',
        userId: 'user_002',
        userName: 'Jane Smith',
        userEmail: 'jane.smith@email.com',
        billType: 'internet',
        billerName: 'Link3 Technologies',
        billerId: 'LINK3_001',
        accountNumber: 'INT987654321',
        amount: 1200,
        billAmount: 1180,
        convenienceFee: 20,
        status: 'failed',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN_BILL_002',
        billReference: 'LINK3_REF_002',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        failureReason: 'Insufficient balance in linked account',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        id: 'bill_003',
        userId: 'user_003',
        userName: 'Bob Johnson',
        userEmail: 'bob.johnson@email.com',
        billType: 'mobile',
        billerName: 'Grameenphone',
        billerId: 'GP_001',
        accountNumber: '01712345678',
        amount: 850,
        billAmount: 830,
        convenienceFee: 20,
        status: 'processing',
        paymentMethod: 'card',
        transactionId: 'TXN_BILL_003',
        billReference: 'GP_REF_003',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'low'
      }
    ];

    const mockBillers: Biller[] = [
      {
        id: 'biller_001',
        name: 'Dhaka Power Distribution Company',
        category: 'Utility',
        type: 'electricity',
        isActive: true,
        convenienceFee: 50,
        feeType: 'fixed',
        minAmount: 100,
        maxAmount: 50000,
        processingTime: '2-5 minutes',
        supportContact: '+880123456789',
        apiEndpoint: 'https://api.dpdc.gov.bd',
        lastSyncAt: new Date(Date.now() - 15 * 60 * 1000),
        totalTransactions: 15420,
        successRate: 98.5,
        avgProcessingTime: 3.2
      },
      {
        id: 'biller_002',
        name: 'Link3 Technologies',
        category: 'Internet Service Provider',
        type: 'internet',
        isActive: true,
        convenienceFee: 2.5,
        feeType: 'percentage',
        minAmount: 500,
        maxAmount: 10000,
        processingTime: '1-3 minutes',
        supportContact: '+880987654321',
        apiEndpoint: 'https://api.link3.com.bd',
        lastSyncAt: new Date(Date.now() - 5 * 60 * 1000),
        totalTransactions: 8750,
        successRate: 96.8,
        avgProcessingTime: 2.1
      },
      {
        id: 'biller_003',
        name: 'Grameenphone',
        category: 'Mobile Operator',
        type: 'mobile',
        isActive: false,
        convenienceFee: 20,
        feeType: 'fixed',
        minAmount: 50,
        maxAmount: 5000,
        processingTime: '1-2 minutes',
        supportContact: '+880555666777',
        apiEndpoint: 'https://api.grameenphone.com',
        lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalTransactions: 25630,
        successRate: 94.2,
        avgProcessingTime: 1.8
      }
    ];

    const mockPaymentLimits: PaymentLimit[] = [
      {
        id: 'limit_001',
        userId: 'user_001',
        userName: 'John Doe',
        billType: 'electricity',
        dailyLimit: 10000,
        monthlyLimit: 50000,
        currentDailyUsage: 2500,
        currentMonthlyUsage: 15000,
        isActive: true,
        setBy: 'Admin User',
        setAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reason: 'High-value transaction monitoring'
      },
      {
        id: 'limit_002',
        userId: 'user_002',
        userName: 'Jane Smith',
        billType: 'all',
        dailyLimit: 5000,
        monthlyLimit: 25000,
        currentDailyUsage: 1200,
        currentMonthlyUsage: 8500,
        isActive: true,
        setBy: 'System Auto',
        setAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reason: 'New user default limits'
      }
    ];

    const mockFailedResolutions: FailedPaymentResolution[] = [
      {
        id: 'resolution_001',
        paymentId: 'bill_002',
        userName: 'Jane Smith',
        billType: 'internet',
        amount: 1200,
        failureReason: 'Insufficient balance in linked account',
        resolutionStatus: 'investigating',
        assignedTo: 'Support Agent 1',
        resolutionNotes: 'Contacted user to verify account balance. Awaiting response.',
        customerNotified: true,
        refundProcessed: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: 'resolution_002',
        paymentId: 'bill_004',
        userName: 'Alice Brown',
        billType: 'electricity',
        amount: 3500,
        failureReason: 'Biller system timeout',
        resolutionStatus: 'resolved',
        assignedTo: 'Support Agent 2',
        resolutionNotes: 'Payment processed successfully after system recovery. Refund issued for duplicate charge.',
        customerNotified: true,
        refundProcessed: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    setPayments(mockPayments);
    setBillers(mockBillers);
    setPaymentLimits(mockPaymentLimits);
    setFailedResolutions(mockFailedResolutions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'gas': return <Home className="w-4 h-4" />;
      case 'water': return <Home className="w-4 h-4" />;
      case 'internet': return <Wifi className="w-4 h-4" />;
      case 'mobile': return <Phone className="w-4 h-4" />;
      case 'insurance': return <Shield className="w-4 h-4" />;
      case 'loan': return <CreditCard className="w-4 h-4" />;
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.billType === filterType;
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.billerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const toggleBillerStatus = (billerId: string) => {
    setBillers(billers.map(biller => 
      biller.id === billerId 
        ? { ...biller, isActive: !biller.isActive }
        : biller
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bill Payment Oversight</h1>
          <p className="text-gray-600">Monitor bill payments, manage billers, and resolve failed transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments Today</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">96.8%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                <p className="text-2xl font-bold text-gray-900">92</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">৳8.4M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('billers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'billers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Biller Management
              </button>
              <button
                onClick={() => setActiveTab('limits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'limits'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Limits
              </button>
              <button
                onClick={() => setActiveTab('resolutions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resolutions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Failed Payment Resolution
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Payment History Tab */}
          {activeTab === 'payments' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by user, biller, or transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                  <option value="water">Water</option>
                  <option value="internet">Internet</option>
                  <option value="mobile">Mobile</option>
                  <option value="insurance">Insurance</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User & Bill Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biller & Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount & Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Timing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className={payment.status === 'failed' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                              {getBillTypeIcon(payment.billType)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                              <div className="text-sm text-gray-500">{payment.userEmail}</div>
                              <div className="text-xs text-gray-400 capitalize">{payment.billType} Bill</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.billerName}</div>
                          <div className="text-sm text-gray-500">Account: {payment.accountNumber}</div>
                          <div className="text-xs text-gray-400">Ref: {payment.billReference}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ৳{payment.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Bill: ৳{payment.billAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Fee: ৳{payment.convenienceFee}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Due: {payment.dueDate.toLocaleDateString()}
                          </div>
                          {payment.paidAt && (
                            <div className="text-xs text-green-600">
                              Paid: {payment.paidAt.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {payment.status === 'failed' && (
                              <button className="text-red-600 hover:text-red-900">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            {payment.status === 'processing' && (
                              <button className="text-orange-600 hover:text-orange-900">
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Biller Management Tab */}
          {activeTab === 'billers' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biller Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Structure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Sync
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billers.map((biller) => (
                      <tr key={biller.id} className={!biller.isActive ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                              {getBillTypeIcon(biller.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{biller.name}</div>
                              <div className="text-sm text-gray-500">{biller.category}</div>
                              <div className="text-xs text-gray-400 capitalize">{biller.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {biller.feeType === 'fixed' 
                              ? `৳${biller.convenienceFee}` 
                              : `${biller.convenienceFee}%`
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            Range: ৳{biller.minAmount.toLocaleString()} - ৳{biller.maxAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Processing: {biller.processingTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {biller.totalTransactions.toLocaleString()} transactions
                          </div>
                          <div className="text-sm text-green-600">
                            Success: {biller.successRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg: {biller.avgProcessingTime}min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              biller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {biller.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last sync: {biller.lastSyncAt.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleBillerStatus(biller.id)}
                              className={biller.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                            >
                              {biller.isActive ? <Ban className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Limits Tab */}
          {activeTab === 'limits' && (
            <div className="p-6">
              <div className="mb-4">
                <button 
                  onClick={() => setShowLimitModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Set New Limit
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User & Bill Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Daily Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Set By & Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentLimits.map((limit) => (
                      <tr key={limit.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{limit.userName}</div>
                          <div className="text-sm text-gray-500 capitalize">{limit.billType} Bills</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ৳{limit.dailyLimit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Used: ৳{limit.currentDailyUsage.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(limit.currentDailyUsage / limit.dailyLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ৳{limit.monthlyLimit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Used: ৳{limit.currentMonthlyUsage.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(limit.currentMonthlyUsage / limit.monthlyLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{limit.setBy}</div>
                          <div className="text-sm text-gray-500">{limit.reason}</div>
                          <div className="text-xs text-gray-400">
                            {limit.setAt.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed Payment Resolution Tab */}
          {activeTab === 'resolutions' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Failure Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolution Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned & Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {failedResolutions.map((resolution) => (
                      <tr key={resolution.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{resolution.userName}</div>
                          <div className="text-sm text-gray-500 capitalize">{resolution.billType} Bill</div>
                          <div className="text-sm text-gray-900">৳{resolution.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-red-600">{resolution.failureReason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resolution.resolutionStatus)}`}>
                            {resolution.resolutionStatus.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center mt-2 space-x-2">
                            {resolution.customerNotified && (
                              <span className="text-xs text-green-600">Customer Notified</span>
                            )}
                            {resolution.refundProcessed && (
                              <span className="text-xs text-blue-600">Refund Processed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resolution.assignedTo || 'Unassigned'}</div>
                          <div className="text-xs text-gray-500">
                            Created: {resolution.createdAt.toLocaleDateString()}
                          </div>
                          {resolution.resolvedAt && (
                            <div className="text-xs text-green-600">
                              Resolved: {resolution.resolvedAt.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedResolution(resolution);
                                setShowResolutionModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {resolution.resolutionStatus === 'pending' && (
                              <button className="text-green-600 hover:text-green-900">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Volume</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-medium">৳8.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-medium">৳52.1M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium">৳198.7M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Success Rates</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall:</span>
                      <span className="font-medium text-green-600">96.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Electricity:</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internet:</span>
                      <span className="font-medium text-yellow-600">94.2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Billers</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">DPDC:</span>
                      <span className="font-medium">15,420 txns</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grameenphone:</span>
                      <span className="font-medium">25,630 txns</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Link3:</span>
                      <span className="font-medium">8,750 txns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals would go here - simplified for brevity */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Set Payment Limit</h3>
                <p className="text-sm text-gray-600 mb-4">Configure payment limits for a user</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Set Limit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResolutionModal && selectedResolution && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>User:</strong> {selectedResolution.userName}</p>
                  <p><strong>Amount:</strong> ৳{selectedResolution.amount.toLocaleString()}</p>
                  <p><strong>Failure:</strong> {selectedResolution.failureReason}</p>
                  <p><strong>Notes:</strong> {selectedResolution.resolutionNotes}</p>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowResolutionModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPaymentOversight;