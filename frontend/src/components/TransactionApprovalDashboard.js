import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FilterList as Filter, 
  Download, 
  CheckCircle, 
  Cancel as XCircle, 
  Warning as AlertTriangle, 
  AccessTime as Clock, 
  AttachMoney as DollarSign, 
  Public as Globe, 
  Security as Shield,
  Visibility as Eye,
  MoreVert as MoreVertical,
  Flag,
  Person as User,
  CalendarToday as Calendar,
  Settings,
  NotificationsActive as Bell,
  Timeline as Activity,
  TrendingUp,
  FlashOn as Zap,
  Description as FileText,
  MoreHoriz as MoreHorizontal,
  CheckBox as CheckSquare,
  CheckBoxOutlineBlank as Square,
  Refresh as RefreshCw,
  ErrorOutline as AlertCircle,
  LocationOn as MapPin,
  CreditCard,
  Business as Building,
  Phone,
  Email as Mail
} from '@mui/icons-material';

const TransactionApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockPendingTransactions = [
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
        reference: 'REF-2024-001'
      },
      {
        id: 'PT002',
        transactionId: 'TXN-2024-001235',
        senderName: 'Fatima Rahman',
        senderAccount: '2345678901',
        receiverName: 'Michael Chen',
        receiverAccount: '1098765432',
        amount: 150000,
        currency: 'BDT',
        purpose: 'Business investment',
        timestamp: new Date('2024-01-15T11:45:00'),
        flagReason: ['High Amount', 'Suspicious Pattern', 'New Recipient'],
        riskLevel: 'critical',
        transactionType: 'international',
        status: 'pending',
        senderLocation: 'Chittagong, Bangladesh',
        receiverLocation: 'Singapore',
        paymentMethod: 'SWIFT Transfer',
        reference: 'REF-2024-002'
      },
      {
        id: 'PT003',
        transactionId: 'TXN-2024-001236',
        senderName: 'Rashid Ahmed',
        senderAccount: '3456789012',
        receiverName: 'Local Vendor Ltd',
        receiverAccount: '2109876543',
        amount: 25000,
        currency: 'BDT',
        purpose: 'Equipment purchase',
        timestamp: new Date('2024-01-15T14:20:00'),
        flagReason: ['Unusual Time'],
        riskLevel: 'medium',
        transactionType: 'domestic',
        status: 'pending',
        paymentMethod: 'Bank Transfer'
      },
      {
        id: 'PT004',
        transactionId: 'TXN-2024-001237',
        senderName: 'Nasir Uddin',
        senderAccount: '4567890123',
        receiverName: 'Emma Thompson',
        receiverAccount: '3210987654',
        amount: 95000,
        currency: 'BDT',
        purpose: 'Educational expenses',
        timestamp: new Date('2024-01-15T16:10:00'),
        flagReason: ['High Amount', 'International Transfer', 'First Time Recipient'],
        riskLevel: 'high',
        transactionType: 'international',
        status: 'pending',
        senderLocation: 'Sylhet, Bangladesh',
        receiverLocation: 'London, UK',
        paymentMethod: 'Wire Transfer',
        reference: 'REF-2024-004'
      }
    ];

    const mockLiveTransactions = [
      {
        id: 'LT001',
        type: 'transfer',
        amount: 5000,
        currency: 'BDT',
        status: 'completed',
        timestamp: new Date(),
        account: '1234567890',
        description: 'Transfer to savings account'
      },
      {
        id: 'LT002',
        type: 'deposit',
        amount: 15000,
        currency: 'BDT',
        status: 'processing',
        timestamp: new Date(Date.now() - 60000),
        account: '2345678901',
        description: 'Salary deposit'
      },
      {
        id: 'LT003',
        type: 'withdrawal',
        amount: 8000,
        currency: 'BDT',
        status: 'completed',
        timestamp: new Date(Date.now() - 120000),
        account: '3456789012',
        description: 'ATM withdrawal'
      }
    ];

    const mockFraudAlerts = [
      {
        id: 'FA001',
        type: 'suspicious_pattern',
        severity: 'high',
        message: 'Multiple high-value transactions detected from same account within 1 hour',
        timestamp: new Date(Date.now() - 300000),
        transactionId: 'TXN-2024-001234',
        account: '1234567890'
      },
      {
        id: 'FA002',
        type: 'unusual_location',
        severity: 'medium',
        message: 'Transaction initiated from unusual geographic location',
        timestamp: new Date(Date.now() - 600000),
        transactionId: 'TXN-2024-001235',
        account: '2345678901'
      },
      {
        id: 'FA003',
        type: 'high_velocity',
        severity: 'critical',
        message: 'Rapid succession of transactions exceeding normal patterns',
        timestamp: new Date(Date.now() - 900000),
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
      const newTransaction = {
        id: `LT${Date.now()}`,
        type: ['transfer', 'deposit', 'withdrawal'][Math.floor(Math.random() * 3)],
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: 'BDT',
        status: ['processing', 'completed'][Math.floor(Math.random() * 2)],
        timestamp: new Date(),
        account: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        description: 'Live transaction update'
      };

      setLiveTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTransactionAction = (transactionId, action) => {
    setPendingTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
          : transaction
      )
    );
    
    // Remove from selected if action is taken
    setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    
    console.log(`Transaction ${transactionId} ${action}ed`);
  };

  const handleBulkAction = (action) => {
    selectedTransactions.forEach(transactionId => {
      handleTransactionAction(transactionId, action);
    });
    setSelectedTransactions([]);
    console.log(`Bulk ${action} completed for ${selectedTransactions.length} transactions`);
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const selectAllTransactions = () => {
    const allIds = filteredPendingTransactions.map(t => t.id);
    setSelectedTransactions(
      selectedTransactions.length === allIds.length ? [] : allIds
    );
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Filter pending transactions
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
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTransactions.filter(t => t.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Awaiting approval</span>
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
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <p className="text-2xl font-bold text-gray-900">৳{transaction.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{transaction.timestamp.toLocaleString()}</p>
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
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'high' ? 'bg-orange-100' :
                          alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <Shield className={`w-5 h-5 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {alert.type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {alert.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Account: {alert.account}</span>
                            {alert.transactionId && (
                              <span>Transaction: {alert.transactionId}</span>
                            )}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Fraud Alerts</h3>
                    <p className="text-gray-500">All systems are operating normally with no detected threats.</p>
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