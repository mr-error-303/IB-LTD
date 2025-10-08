import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Building,
  Phone,
  Mail,
  Copy,
  RefreshCw,
  Bell,
  FileText,
  Globe,
  Smartphone,
  CreditCard
} from 'lucide-react';

interface RemittanceTransaction {
  id: string;
  senderName: string;
  senderCountry: string;
  senderPhone: string;
  senderEmail: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  localAmount: number;
  reference: string;
  mtcn: string; // Money Transfer Control Number
  purpose: string;
  status: 'pending' | 'ready' | 'collected' | 'cancelled';
  receivedDate: string;
  expiryDate: string;
  agentLocation?: string;
  fees: number;
  provider: string;
  message?: string;
}

interface RemittanceProvider {
  id: string;
  name: string;
  logo: string;
  countries: string[];
  fees: number;
  exchangeRate: number;
  processingTime: string;
}

const ReceiveRemittance: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'receive' | 'history' | 'track'>('receive');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<RemittanceTransaction | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RemittanceTransaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for remittance transactions
  const [remittanceHistory] = useState<RemittanceTransaction[]>([
    {
      id: 'REM001',
      senderName: 'John Smith',
      senderCountry: 'United States',
      senderPhone: '+1-555-0123',
      senderEmail: 'john.smith@email.com',
      amount: 500,
      currency: 'USD',
      exchangeRate: 82.50,
      localAmount: 41250,
      reference: 'Family Support',
      mtcn: 'WU123456789',
      purpose: 'Family Support',
      status: 'ready',
      receivedDate: '2024-01-15',
      expiryDate: '2024-02-15',
      agentLocation: 'Dhaka Main Branch',
      fees: 15,
      provider: 'Western Union',
      message: 'Monthly support from USA'
    },
    {
      id: 'REM002',
      senderName: 'Ahmed Hassan',
      senderCountry: 'Saudi Arabia',
      senderPhone: '+966-50-123-4567',
      senderEmail: 'ahmed.hassan@email.com',
      amount: 1000,
      currency: 'SAR',
      exchangeRate: 22.00,
      localAmount: 22000,
      reference: 'Salary Transfer',
      mtcn: 'MG987654321',
      purpose: 'Salary',
      status: 'collected',
      receivedDate: '2024-01-10',
      expiryDate: '2024-02-10',
      agentLocation: 'Chittagong Branch',
      fees: 25,
      provider: 'MoneyGram'
    },
    {
      id: 'REM003',
      senderName: 'Maria Garcia',
      senderCountry: 'Spain',
      senderPhone: '+34-600-123-456',
      senderEmail: 'maria.garcia@email.com',
      amount: 300,
      currency: 'EUR',
      exchangeRate: 90.25,
      localAmount: 27075,
      reference: 'Gift Money',
      mtcn: 'RIA456789123',
      purpose: 'Gift',
      status: 'pending',
      receivedDate: '2024-01-20',
      expiryDate: '2024-02-20',
      fees: 12,
      provider: 'Ria Money Transfer'
    }
  ]);

  const [providers] = useState<RemittanceProvider[]>([
    {
      id: 'western-union',
      name: 'Western Union',
      logo: '🏦',
      countries: ['USA', 'UK', 'Canada', 'Australia'],
      fees: 15,
      exchangeRate: 82.50,
      processingTime: '10-15 minutes'
    },
    {
      id: 'moneygram',
      name: 'MoneyGram',
      logo: '💰',
      countries: ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar'],
      fees: 25,
      exchangeRate: 22.00,
      processingTime: '5-10 minutes'
    },
    {
      id: 'ria',
      name: 'Ria Money Transfer',
      logo: '🌍',
      countries: ['Spain', 'Italy', 'Germany', 'France'],
      fees: 12,
      exchangeRate: 90.25,
      processingTime: '15-30 minutes'
    }
  ]);

  const filteredHistory = remittanceHistory.filter(transaction => {
    const matchesSearch = transaction.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.mtcn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleTrackRemittance = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsTracking(true);
    // Simulate API call
    setTimeout(() => {
      const found = remittanceHistory.find(t => t.mtcn === trackingNumber);
      setTrackingResult(found || null);
      setIsTracking(false);
    }, 1500);
  };

  const handleCollectMoney = (transaction: RemittanceTransaction) => {
    // In a real app, this would initiate the collection process
    alert(`Initiating collection for ${transaction.mtcn}. Please visit the agent location with valid ID.`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'collected': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'collected': return <Download className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Receive Remittance</h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('receive')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'receive'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Receive Money
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'track'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Track Transfer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-r-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            History
          </button>
        </div>

        {/* Receive Money Tab */}
        {activeTab === 'receive' && (
          <div className="space-y-6">
            {/* Remittance Options */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">Choose Remittance Method</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {/* Bank Account */}
                <div className="p-6 bg-white/10 rounded-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-full p-3 mr-4">
                      <Building className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Bank Account</h3>
                      <p className="text-sm text-gray-300">Direct transfer to your bank account</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Instant transfer to any local bank</p>
                    <p>• Low processing fees</p>
                    <p>• Secure and reliable</p>
                  </div>
                </div>

                {/* Mobile Wallet */}
                <div className="p-6 bg-white/10 rounded-xl border-2 border-transparent hover:border-green-500 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-full p-3 mr-4">
                      <Smartphone className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Mobile Wallet</h3>
                      <p className="text-sm text-gray-300">Receive money in your mobile wallet</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• bKash, Nagad, Rocket supported</p>
                    <p>• Instant notification</p>
                    <p>• Easy mobile transactions</p>
                  </div>
                </div>

                {/* Cash Pickup */}
                <div className="p-6 bg-white/10 rounded-xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-3 mr-4">
                      <MapPin className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Cash Pickup</h3>
                      <p className="text-sm text-gray-300">Collect cash from agent locations</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• 5000+ pickup locations nationwide</p>
                    <p>• No bank account required</p>
                    <p>• Immediate cash availability</p>
                  </div>
                </div>

                {/* Card Deposit */}
                <div className="p-6 bg-white/10 rounded-xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-full p-3 mr-4">
                      <CreditCard className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Card Deposit</h3>
                      <p className="text-sm text-gray-300">Direct deposit to your debit/credit card</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Visa, Mastercard supported</p>
                    <p>• Quick card-to-card transfer</p>
                    <p>• Enhanced security features</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Transfers */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Available Transfers</h2>
              
              {remittanceHistory.filter(t => t.status === 'ready').length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Transfers Available</h3>
                  <p className="text-gray-400 mb-6">You don't have any money transfers ready for collection</p>
                  <button
                    onClick={() => setActiveTab('track')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Track a Transfer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {remittanceHistory.filter(t => t.status === 'ready').map((transaction) => (
                    <div key={transaction.id} className="p-4 bg-white/10 rounded-xl border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{transaction.senderName}</h3>
                          <p className="text-sm text-gray-400 flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {transaction.senderCountry}
                          </p>
                          <p className="text-sm text-gray-400">{transaction.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">
                            ৳{transaction.localAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {transaction.amount} {transaction.currency}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Reference</p>
                          <p className="font-medium">{transaction.reference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">MTCN</p>
                          <div className="flex items-center">
                            <p className="font-medium mr-2">{transaction.mtcn}</p>
                            <button
                              onClick={() => copyToClipboard(transaction.mtcn)}
                              className="p-1 hover:bg-white/20 rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Expires On</p>
                          <p className="font-medium">{transaction.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Collection Point</p>
                          <p className="font-medium">{transaction.agentLocation}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleCollectMoney(transaction)}
                          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Collect Money
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetails(true);
                          }}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Providers */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Our Partners</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{provider.logo}</span>
                      <h3 className="font-semibold">{provider.name}</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">Processing Time: {provider.processingTime}</p>
                      <p className="text-gray-400">Service Fee: ${provider.fees}</p>
                      <p className="text-gray-400">Countries: {provider.countries.slice(0, 2).join(', ')}
                        {provider.countries.length > 2 && ` +${provider.countries.length - 2} more`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Track Transfer Tab */}
        {activeTab === 'track' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Track Your Transfer</h2>
            
            <div className="max-w-md mx-auto mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter MTCN or Reference Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., WU123456789"
                    className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <button
                  onClick={handleTrackRemittance}
                  disabled={!trackingNumber.trim() || isTracking}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isTracking ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 mr-2" />
                  )}
                  {isTracking ? 'Tracking...' : 'Track Transfer'}
                </button>
              </div>
            </div>

            {/* Tracking Result */}
            {trackingResult && (
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Transfer Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Sender Information</p>
                      <p className="font-medium">{trackingResult.senderName}</p>
                      <p className="text-sm text-gray-400">{trackingResult.senderCountry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="font-medium text-lg">
                        {trackingResult.amount} {trackingResult.currency} = ৳{trackingResult.localAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reference</p>
                      <p className="font-medium">{trackingResult.reference}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <div className={`flex items-center ${getStatusColor(trackingResult.status)}`}>
                        {getStatusIcon(trackingResult.status)}
                        <span className="ml-2 font-medium capitalize">{trackingResult.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Provider</p>
                      <p className="font-medium">{trackingResult.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Received Date</p>
                      <p className="font-medium">{trackingResult.receivedDate}</p>
                    </div>
                  </div>
                </div>
                
                {trackingResult.status === 'ready' && (
                  <div className="mt-6 pt-6 border-t border-gray-600">
                    <button
                      onClick={() => handleCollectMoney(trackingResult)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Collect Money
                    </button>
                  </div>
                )}
              </div>
            )}

            {trackingNumber && !trackingResult && !isTracking && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Transfer not found. Please check your tracking number.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">Transfer History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transfers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2 px-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredHistory.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold mr-3">{transaction.senderName}</h3>
                        <div className={`flex items-center text-sm ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{transaction.senderCountry} • {transaction.provider}</p>
                      <p className="text-sm text-gray-500">MTCN: {transaction.mtcn}</p>
                      <p className="text-sm text-gray-500">Date: {transaction.receivedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">৳{transaction.localAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">{transaction.amount} {transaction.currency}</p>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Transfer Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Status */}
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor(selectedTransaction.status)} bg-white/10`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-2 font-medium capitalize">{selectedTransaction.status}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">৳{selectedTransaction.localAmount.toLocaleString()}</p>
                  <p className="text-gray-400">{selectedTransaction.amount} {selectedTransaction.currency}</p>
                  <p className="text-sm text-gray-500">Exchange Rate: 1 {selectedTransaction.currency} = ৳{selectedTransaction.exchangeRate}</p>
                </div>

                {/* Sender Information */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Sender Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{selectedTransaction.senderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="font-medium">{selectedTransaction.senderCountry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">{selectedTransaction.senderPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{selectedTransaction.senderEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Information */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Transaction Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">MTCN</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">{selectedTransaction.mtcn}</p>
                        <button
                          onClick={() => copyToClipboard(selectedTransaction.mtcn)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Provider</p>
                      <p className="font-medium">{selectedTransaction.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Purpose</p>
                      <p className="font-medium">{selectedTransaction.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reference</p>
                      <p className="font-medium">{selectedTransaction.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Received Date</p>
                      <p className="font-medium">{selectedTransaction.receivedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expiry Date</p>
                      <p className="font-medium">{selectedTransaction.expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Collection Information */}
                {selectedTransaction.agentLocation && (
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Collection Information
                    </h4>
                    <p className="font-medium">{selectedTransaction.agentLocation}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Please bring a valid government-issued ID for collection
                    </p>
                  </div>
                )}

                {/* Message */}
                {selectedTransaction.message && (
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="font-semibold mb-3">Message from Sender</h4>
                    <p className="text-gray-300">{selectedTransaction.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTransaction.status === 'ready' && (
                  <button
                    onClick={() => {
                      handleCollectMoney(selectedTransaction);
                      setShowDetails(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Collect Money
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveRemittance;