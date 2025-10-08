import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Flag, 
  Clock, 
  DollarSign, 
  Globe, 
  User, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Settings, 
  Bell, 
  Activity, 
  TrendingUp, 
  Shield, 
  Zap, 
  FileText, 
  MoreHorizontal,
  CheckSquare,
  Square,
  RefreshCw,
  AlertCircle,
  MapPin,
  CreditCard,
  Building,
  Phone,
  Mail
} from 'lucide-react';

interface PendingTransaction {
  id: string;
  transactionId: string;
  senderName: string;
  senderAccount: string;
  receiverName: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  purpose: string;
  timestamp: Date;
  flagReason: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  transactionType: 'domestic' | 'international' | 'internal';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  senderLocation?: string;
  receiverLocation?: string;
  paymentMethod: string;
  reference?: string;
  isSelected?: boolean;
}

interface LiveTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'processing' | 'completed' | 'failed';
  timestamp: Date;
  account: string;
  description: string;
}

interface FraudAlert {
  id: string;
  type: 'suspicious_pattern' | 'high_velocity' | 'unusual_location' | 'blacklist_match';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  transactionId?: string;
  account: string;
}

const TransactionApprovalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockPendingTransactions: PendingTransaction[] = [
      {
        id: 'PT001',
        transactionId: 'TXN-2024-001234',
        senderName: 'Ahmed Hassan',
        senderAccount: '1234567890',
        receiverName: 'Sarah Johnson',
        receiverAccount: '0987654321',
        amount: 75000,
        currency: 'BDT',
        purpose: 'Property purchase payment',
        timestamp: new Date('2024-01-15T10:30:00'),
        flagReason: ['High Amount', 'International Transfer'],
        riskLevel: 'high',
        transactionType: 'international',
        status: 'pending',
        senderLocation: 'Dhaka, Bangladesh',
        receiverLocation: 'New York, USA',
        paymentMethod: 'Wire Transfer',
        reference: 'PROP-2024-001'
      },
      {
        id: 'PT002',
        transactionId: 'TXN-2024-001235',
        senderName: 'Mohammad Rahman',
        senderAccount: '2345678901',
        receiverName: 'Fatima Ali',
        receiverAccount: '1098765432',
        amount: 125000,
        currency: 'BDT',
        purpose: 'Business investment',
        timestamp: new Date('2024-01-15T11:15:00'),
        flagReason: ['High Amount', 'Rapid Transactions'],
        riskLevel: 'critical',
        transactionType: 'domestic',
        status: 'pending',
        senderLocation: 'Chittagong, Bangladesh',
        receiverLocation: 'Sylhet, Bangladesh',
        paymentMethod: 'Online Transfer',
        reference: 'BUS-INV-2024'
      },
      {
        id: 'PT003',
        transactionId: 'TXN-2024-001236',
        senderName: 'Rashida Begum',
        senderAccount: '3456789012',
        receiverName: 'John Smith',
        receiverAccount: '2109876543',
        amount: 45000,
        currency: 'BDT',
        purpose: 'Educational expenses',
        timestamp: new Date('2024-01-15T12:00:00'),
        flagReason: ['International Transfer', 'New Recipient'],
        riskLevel: 'medium',
        transactionType: 'international',
        status: 'pending',
        senderLocation: 'Dhaka, Bangladesh',
        receiverLocation: 'London, UK',
        paymentMethod: 'Swift Transfer'
      },
      {
        id: 'PT004',
        transactionId: 'TXN-2024-001237',
        senderName: 'Karim Uddin',
        senderAccount: '4567890123',
        receiverName: 'Nasir Ahmed',
        receiverAccount: '3210987654',
        amount: 85000,
        currency: 'BDT',
        purpose: 'Medical treatment',
        timestamp: new Date('2024-01-15T13:30:00'),
        flagReason: ['High Amount', 'Unusual Pattern'],
        riskLevel: 'high',
        transactionType: 'domestic',
        status: 'pending',
        senderLocation: 'Rajshahi, Bangladesh',
        receiverLocation: 'Dhaka, Bangladesh',
        paymentMethod: 'Bank Transfer'
      },
      {
        id: 'PT005',
        transactionId: 'TXN-2024-001238',
        senderName: 'Salma Khatun',
        senderAccount: '5678901234',
        receiverName: 'Maria Garcia',
        receiverAccount: '4321098765',
        amount: 35000,
        currency: 'BDT',
        purpose: 'Family support',
        timestamp: new Date('2024-01-15T14:45:00'),
        flagReason: ['International Transfer'],
        riskLevel: 'low',
        transactionType: 'international',
        status: 'pending',
        senderLocation: 'Dhaka, Bangladesh',
        receiverLocation: 'Madrid, Spain',
        paymentMethod: 'Remittance'
      }
    ];

    const mockLiveTransactions: LiveTransaction[] = [
      {
        id: 'LT001',
        type: 'transfer',
        amount: 15000,
        currency: 'BDT',
        status: 'processing',
        timestamp: new Date(),
        account: '1234567890',
        description: 'Online transfer to savings account'
      },
      {
        id: 'LT002',
        type: 'deposit',
        amount: 25000,
        currency: 'BDT',
        status: 'completed',
        timestamp: new Date(Date.now() - 30000),
        account: '2345678901',
        description: 'Cash deposit at ATM'
      },
      {
        id: 'LT003',
        type: 'withdrawal',
        amount: 8000,
        currency: 'BDT',
        status: 'completed',
        timestamp: new Date(Date.now() - 60000),
        account: '3456789012',
        description: 'ATM withdrawal'
      }
    ];

    const mockFraudAlerts: FraudAlert[] = [
      {
        id: 'FA001',
        type: 'suspicious_pattern',
        severity: 'high',
        message: 'Multiple large transactions detected from account 2345678901',
        timestamp: new Date(Date.now() - 120000),
        transactionId: 'TXN-2024-001235',
        account: '2345678901'
      },
      {
        id: 'FA002',
        type: 'unusual_location',
        severity: 'medium',
        message: 'Transaction initiated from unusual location for account 1234567890',
        timestamp: new Date(Date.now() - 300000),
        transactionId: 'TXN-2024-001234',
        account: '1234567890'
      },
      {
        id: 'FA003',
        type: 'high_velocity',
        severity: 'critical',
        message: 'High velocity transactions detected - 5 transactions in 10 minutes',
        timestamp: new Date(Date.now() - 600000),
        account: '4567890123'
      }
    ];

    setPendingTransactions(mockPendingTransactions);
    setLiveTransactions(mockLiveTransactions);
    setFraudAlerts(mockFraudAlerts);
  }, []);

  // Auto-refresh live data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new live transactions
      const newTransaction: LiveTransaction = {
        id: `LT${Date.now()}`,
        type: ['transfer', 'deposit', 'withdrawal'][Math.floor(Math.random() * 3)] as any,
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: 'BDT',
        status: ['processing', 'completed'][Math.floor(Math.random() * 2)] as any,
        timestamp: new Date(),
        account: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        description: 'Real-time transaction update'
      };

      setLiveTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTransactionAction = (transactionId: string, action: 'approve' | 'reject' | 'flag', reason?: string) => {
    setPendingTransactions(prev =>
      prev.map(transaction =>
        transaction.id === transactionId
          ? { ...transaction, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
          : transaction
      )
    );
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'flag') => {
    setPendingTransactions(prev =>
      prev.map(transaction =>
        selectedTransactions.includes(transaction.id)
          ? { ...transaction, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
          : transaction
      )
    );
    setSelectedTransactions([]);
    setShowBulkActions(false);
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const selectAllTransactions = () => {
    const visibleTransactionIds = filteredPendingTransactions.map(t => t.id);
    setSelectedTransactions(
      selectedTransactions.length === visibleTransactionIds.length ? [] : visibleTransactionIds
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'flagged':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPendingTransactions = pendingTransactions.filter(transaction => {
    const matchesSearch = transaction.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || transaction.riskLevel === filterRisk;
    const matchesType = filterType === 'all' || transaction.transactionType === filterType;
    const matchesStatus = transaction.status === 'pending';
    return matchesSearch && matchesRisk && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Approval System</h1>
              <p className="text-gray-600">Monitor, approve, and manage pending transactions with advanced fraud detection</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingTransactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3</span>
              <span className="text-gray-500 ml-1">new today</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingTransactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">Requires attention</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{pendingTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Pending approval</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fraud Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{fraudAlerts.length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Bell className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-orange-600">Active alerts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Pending Transactions ({filteredPendingTransactions.length})
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'live'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Live Feed
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Fraud Alerts ({fraudAlerts.length})
              </button>
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                {selectedTransactions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{selectedTransactions.length} selected</span>
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Bulk Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Bulk Reject
                    </button>
                    <button
                      onClick={() => handleBulkAction('flag')}
                      className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                    >
                      Bulk Flag
                    </button>
                  </div>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                {/* Select All Checkbox */}
                <div className="mb-4 flex items-center">
                  <button
                    onClick={selectAllTransactions}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {selectedTransactions.length === filteredPendingTransactions.length && filteredPendingTransactions.length > 0 ? (
                      <CheckSquare className="w-4 h-4 mr-2" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    Select All ({filteredPendingTransactions.length})
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredPendingTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleTransactionSelection(transaction.id)}
                            className="mt-1"
                          >
                            {selectedTransactions.includes(transaction.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {transaction.transactionId}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(transaction.riskLevel)}`}>
                                  {transaction.riskLevel.toUpperCase()} RISK
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  transaction.transactionType === 'international' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100'
                                }`}>
                                  {transaction.transactionType.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  ৳{transaction.amount.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.timestamp.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  Sender Details
                                </h4>
                                <div className="pl-6 space-y-1">
                                  <p className="text-sm"><span className="font-medium">Name:</span> {transaction.senderName}</p>
                                  <p className="text-sm"><span className="font-medium">Account:</span> {transaction.senderAccount}</p>
                                  {transaction.senderLocation && (
                                    <p className="text-sm flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {transaction.senderLocation}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <Building className="w-4 h-4 mr-2" />
                                  Receiver Details
                                </h4>
                                <div className="pl-6 space-y-1">
                                  <p className="text-sm"><span className="font-medium">Name:</span> {transaction.receiverName}</p>
                                  <p className="text-sm"><span className="font-medium">Account:</span> {transaction.receiverAccount}</p>
                                  {transaction.receiverLocation && (
                                    <p className="text-sm flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {transaction.receiverLocation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Purpose:</span> {transaction.purpose}</p>
                                  <p><span className="font-medium">Payment Method:</span> {transaction.paymentMethod}</p>
                                  {transaction.reference && (
                                    <p><span className="font-medium">Reference:</span> {transaction.reference}</p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Flag Reasons</h4>
                                <div className="flex flex-wrap gap-2">
                                  {transaction.flagReason.map((reason, index) => (
                                    <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'flag')}
                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Flag
                          </button>
                          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPendingTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Transactions</h3>
                    <p className="text-gray-500">All transactions have been processed or no transactions match your filters.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Live Transaction Feed</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live Updates {autoRefresh ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                {liveTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'transfer' ? 'bg-blue-100' :
                        transaction.type === 'deposit' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {transaction.type === 'transfer' && <CreditCard className="w-5 h-5 text-blue-600" />}
                        {transaction.type === 'deposit' && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {transaction.type === 'withdrawal' && <DollarSign className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400">Account: {transaction.account}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">৳{transaction.amount.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {transaction.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Fraud Detection Alerts</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    Clear All Alerts
                  </button>
                </div>

                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'high' ? 'bg-orange-100' :
                          alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {alert.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Account: {alert.account}</span>
                            {alert.transactionId && (
                              <span>Transaction: {alert.transactionId}</span>
                            )}
                            <span>{alert.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Investigate
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {fraudAlerts.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                    <p className="text-gray-500">All fraud alerts have been resolved or dismissed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionApprovalDashboard;