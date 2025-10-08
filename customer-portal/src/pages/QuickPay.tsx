import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Scan,
  Users,
  Clock,
  Star,
  Search,
  Plus,
  Send,
  Eye,
  Filter,
  Download,
  Share2,
  Copy,
  Phone,
  Mail,
  User,
  CreditCard,
  Smartphone,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';

interface QuickContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  accountNumber: string;
  bank: string;
  isFavorite: boolean;
  lastTransactionDate?: string;
  totalTransactions: number;
}

interface QuickPayment {
  id: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  purpose: string;
  method: 'qr' | 'contact' | 'phone' | 'account';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  transactionId: string;
  fee: number;
}

interface QRPaymentData {
  merchantName: string;
  merchantId: string;
  amount?: number;
  currency: string;
  reference?: string;
}

const QuickPay: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pay' | 'contacts' | 'history'>('pay');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'contact' | 'phone' | 'account'>('qr');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedData, setScannedData] = useState<QRPaymentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContact, setSelectedContact] = useState<QuickContact | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentData, setPaymentData] = useState({
    recipient: '',
    phone: '',
    accountNumber: '',
    amount: '',
    purpose: '',
    pin: ''
  });

  // Mock data for quick contacts
  const [quickContacts, setQuickContacts] = useState<QuickContact[]>([
    {
      id: 'QC001',
      name: 'John Doe',
      phone: '+880171234567',
      email: 'john.doe@email.com',
      avatar: '👨',
      accountNumber: '1234567890',
      bank: 'ABC Bank',
      isFavorite: true,
      lastTransactionDate: '2024-01-15',
      totalTransactions: 15
    },
    {
      id: 'QC002',
      name: 'Sarah Ahmed',
      phone: '+880181234567',
      email: 'sarah.ahmed@email.com',
      avatar: '👩',
      accountNumber: '0987654321',
      bank: 'XYZ Bank',
      isFavorite: true,
      lastTransactionDate: '2024-01-12',
      totalTransactions: 8
    },
    {
      id: 'QC003',
      name: 'Mike Johnson',
      phone: '+880191234567',
      accountNumber: '1122334455',
      bank: 'DEF Bank',
      isFavorite: false,
      lastTransactionDate: '2024-01-10',
      totalTransactions: 3
    }
  ]);

  // Mock data for payment history
  const [paymentHistory] = useState<QuickPayment[]>([
    {
      id: 'QP001',
      recipientName: 'John Doe',
      recipientPhone: '+880171234567',
      amount: 5000,
      purpose: 'Lunch payment',
      method: 'contact',
      status: 'completed',
      date: '2024-01-15',
      transactionId: 'TXN123456789',
      fee: 0
    },
    {
      id: 'QP002',
      recipientName: 'Coffee Shop',
      recipientPhone: '+880181234567',
      amount: 250,
      purpose: 'Coffee purchase',
      method: 'qr',
      status: 'completed',
      date: '2024-01-14',
      transactionId: 'TXN987654321',
      fee: 5
    },
    {
      id: 'QP003',
      recipientName: 'Sarah Ahmed',
      recipientPhone: '+880191234567',
      amount: 2000,
      purpose: 'Shared expense',
      method: 'phone',
      status: 'pending',
      date: '2024-01-13',
      transactionId: 'TXN456789123',
      fee: 0
    }
  ]);

  const filteredContacts = quickContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.accountNumber.includes(searchTerm)
  );

  const filteredHistory = paymentHistory.filter(payment => {
    const matchesSearch = payment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const favoriteContacts = quickContacts.filter(contact => contact.isFavorite);

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Simulate QR code scanning
    setTimeout(() => {
      const mockQRData: QRPaymentData = {
        merchantName: 'Coffee Shop',
        merchantId: 'MERCHANT123',
        amount: 250,
        currency: 'BDT',
        reference: 'ORDER456'
      };
      setScannedData(mockQRData);
      setPaymentData(prev => ({
        ...prev,
        recipient: mockQRData.merchantName,
        amount: mockQRData.amount?.toString() || ''
      }));
      setShowQRScanner(false);
    }, 2000);
  };

  const handleContactSelect = (contact: QuickContact) => {
    setSelectedContact(contact);
    setPaymentData(prev => ({
      ...prev,
      recipient: contact.name,
      phone: contact.phone,
      accountNumber: contact.accountNumber
    }));
    setPaymentMethod('contact');
  };

  const toggleFavorite = (contactId: string) => {
    setQuickContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, isFavorite: !contact.isFavorite }
          : contact
      )
    );
  };

  const handlePayment = async () => {
    if (!paymentData.amount || !paymentData.recipient) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
      // Reset form
      setPaymentData({
        recipient: '',
        phone: '',
        accountNumber: '',
        amount: '',
        purpose: '',
        pin: ''
      });
      setSelectedContact(null);
      setScannedData(null);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr': return <QrCode className="w-4 h-4" />;
      case 'contact': return <Users className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'account': return <CreditCard className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
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
          <h1 className="text-2xl font-bold">Quick Pay</h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pay')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pay'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Quick Pay
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Contacts
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

        {/* Quick Pay Tab */}
        {activeTab === 'pay' && (
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setPaymentMethod('qr');
                    handleQRScan();
                  }}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    paymentMethod === 'qr'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <QrCode className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Scan QR</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('contact')}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    paymentMethod === 'contact'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Contacts</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('phone')}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    paymentMethod === 'phone'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Phone className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Phone</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('account')}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    paymentMethod === 'account'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Account</p>
                </button>
              </div>
            </div>

            {/* Favorite Contacts */}
            {favoriteContacts.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Favorite Contacts</h2>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {favoriteContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="flex-shrink-0 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center min-w-[100px]"
                    >
                      <div className="text-2xl mb-2">{contact.avatar || '👤'}</div>
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-xs text-gray-400 truncate">{contact.phone}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              
              {scannedData && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center mb-2">
                    <QrCode className="w-5 h-5 mr-2 text-green-400" />
                    <span className="font-medium text-green-400">QR Code Scanned</span>
                  </div>
                  <p className="text-sm">Merchant: {scannedData.merchantName}</p>
                  <p className="text-sm">ID: {scannedData.merchantId}</p>
                  {scannedData.reference && <p className="text-sm">Reference: {scannedData.reference}</p>}
                </div>
              )}

              <div className="space-y-4">
                {paymentMethod === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+880 1X XXXX XXXX"
                      className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'account' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      value={paymentData.accountNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                      className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {(paymentMethod === 'contact' || paymentMethod === 'phone' || paymentMethod === 'account') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Recipient Name</label>
                    <input
                      type="text"
                      value={paymentData.recipient}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="Enter recipient name"
                      className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      readOnly={paymentMethod === 'contact' && selectedContact !== null}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (৳)</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Purpose (Optional)</label>
                  <input
                    type="text"
                    value={paymentData.purpose}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Payment purpose"
                    className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Transaction PIN</label>
                  <input
                    type="password"
                    value={paymentData.pin}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="Enter your PIN"
                    maxLength={4}
                    className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!paymentData.amount || !paymentData.recipient || !paymentData.pin || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Send Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold">Quick Pay Contacts</h2>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Contact
                </button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{contact.avatar || '👤'}</div>
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-sm text-gray-400">{contact.phone}</p>
                          <p className="text-sm text-gray-500">{contact.bank} • {contact.accountNumber}</p>
                          <p className="text-xs text-gray-500">
                            {contact.totalTransactions} transactions
                            {contact.lastTransactionDate && ` • Last: ${contact.lastTransactionDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(contact.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            contact.isFavorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${contact.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleContactSelect(contact)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Pay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search payments..."
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="mr-3">
                          {getMethodIcon(payment.method)}
                        </div>
                        <h3 className="font-semibold mr-3">{payment.recipientName}</h3>
                        <div className={`flex items-center text-sm ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{payment.recipientPhone}</p>
                      <p className="text-sm text-gray-500">ID: {payment.transactionId}</p>
                      <p className="text-sm text-gray-500">Date: {payment.date}</p>
                      {payment.purpose && <p className="text-sm text-gray-500">Purpose: {payment.purpose}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">৳{payment.amount.toLocaleString()}</p>
                      {payment.fee > 0 && <p className="text-sm text-gray-400">Fee: ৳{payment.fee}</p>}
                      <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center">
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

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Scan QR Code</h3>
                <button
                  onClick={() => setShowQRScanner(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400 animate-pulse" />
                </div>
                <p className="text-gray-400 mb-4">Position the QR code within the frame</p>
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  <span>Scanning...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-gray-400 mb-6">Your payment has been processed successfully</p>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPay;