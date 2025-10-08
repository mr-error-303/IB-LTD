import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CreditCard,
  Lock,
  Unlock,
  Settings,
  Plus,
  Minus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Bell,
  Phone,
  Mail,
  User,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Smartphone,
  Wifi,
  ShoppingBag,
  Car,
  Plane,
  Home,
  Utensils
} from 'lucide-react';

interface Card {
  id: string;
  cardNumber: string;
  cardType: 'debit' | 'credit' | 'prepaid';
  cardBrand: 'visa' | 'mastercard' | 'amex';
  holderName: string;
  expiryDate: string;
  cvv: string;
  status: 'active' | 'blocked' | 'expired' | 'inactive';
  balance?: number;
  creditLimit?: number;
  availableCredit?: number;
  cashLimit: number;
  dailyLimit: number;
  monthlySpent: number;
  issueDate: string;
  linkedAccount: string;
  cardDesign: string;
  contactless: boolean;
  international: boolean;
  onlineShopping: boolean;
}

interface CardTransaction {
  id: string;
  cardId: string;
  date: string;
  time: string;
  description: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'purchase' | 'withdrawal' | 'refund' | 'fee';
  status: 'completed' | 'pending' | 'failed';
  location: string;
  reference: string;
  mcc: string;
}

interface CardOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  validUntil: string;
  terms: string;
  image: string;
}

const Cards: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'offers' | 'settings'>('overview');
  const [selectedCard, setSelectedCard] = useState<string>('CARD001');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [isBlocking, setIsBlocking] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);

  // Mock data for cards
  const [cards] = useState<Card[]>([
    {
      id: 'CARD001',
      cardNumber: '4532123456789012',
      cardType: 'debit',
      cardBrand: 'visa',
      holderName: 'JOHN DOE',
      expiryDate: '12/26',
      cvv: '123',
      status: 'active',
      balance: 125000,
      cashLimit: 50000,
      dailyLimit: 100000,
      monthlySpent: 45000,
      issueDate: '2022-01-15',
      linkedAccount: '1234567890123456',
      cardDesign: 'classic-blue',
      contactless: true,
      international: true,
      onlineShopping: true
    },
    {
      id: 'CARD002',
      cardNumber: '5555444433332222',
      cardType: 'credit',
      cardBrand: 'mastercard',
      holderName: 'JOHN DOE',
      expiryDate: '08/27',
      cvv: '456',
      status: 'active',
      creditLimit: 200000,
      availableCredit: 155000,
      cashLimit: 40000,
      dailyLimit: 150000,
      monthlySpent: 65000,
      issueDate: '2021-08-10',
      linkedAccount: '1234567890123456',
      cardDesign: 'premium-gold',
      contactless: true,
      international: true,
      onlineShopping: true
    },
    {
      id: 'CARD003',
      cardNumber: '3782822463100005',
      cardType: 'credit',
      cardBrand: 'amex',
      holderName: 'JOHN DOE',
      expiryDate: '03/25',
      cvv: '7890',
      status: 'blocked',
      creditLimit: 500000,
      availableCredit: 450000,
      cashLimit: 100000,
      dailyLimit: 300000,
      monthlySpent: 85000,
      issueDate: '2020-03-20',
      linkedAccount: '1234567890123456',
      cardDesign: 'platinum-black',
      contactless: true,
      international: true,
      onlineShopping: false
    }
  ]);

  // Mock data for transactions
  const [transactions] = useState<CardTransaction[]>([
    {
      id: 'TXN001',
      cardId: 'CARD001',
      date: '2024-01-15',
      time: '14:30',
      description: 'Online Purchase',
      merchant: 'Amazon',
      category: 'Shopping',
      amount: 2500,
      type: 'purchase',
      status: 'completed',
      location: 'Online',
      reference: 'AMZ123456',
      mcc: '5399'
    },
    {
      id: 'TXN002',
      cardId: 'CARD001',
      date: '2024-01-14',
      time: '18:45',
      description: 'Restaurant',
      merchant: 'Pizza Hut',
      category: 'Food & Dining',
      amount: 1200,
      type: 'purchase',
      status: 'completed',
      location: 'Dhaka, Bangladesh',
      reference: 'PH789012',
      mcc: '5812'
    },
    {
      id: 'TXN003',
      cardId: 'CARD001',
      date: '2024-01-14',
      time: '10:15',
      description: 'ATM Withdrawal',
      merchant: 'DBBL ATM',
      category: 'Cash Withdrawal',
      amount: 5000,
      type: 'withdrawal',
      status: 'completed',
      location: 'Gulshan, Dhaka',
      reference: 'ATM345678',
      mcc: '6011'
    },
    {
      id: 'TXN004',
      cardId: 'CARD002',
      date: '2024-01-13',
      time: '16:20',
      description: 'Fuel Purchase',
      merchant: 'Padma Oil',
      category: 'Gas & Fuel',
      amount: 3500,
      type: 'purchase',
      status: 'completed',
      location: 'Dhanmondi, Dhaka',
      reference: 'PO901234',
      mcc: '5541'
    },
    {
      id: 'TXN005',
      cardId: 'CARD002',
      date: '2024-01-12',
      time: '12:00',
      description: 'Grocery Shopping',
      merchant: 'Shwapno',
      category: 'Groceries',
      amount: 4500,
      type: 'purchase',
      status: 'completed',
      location: 'Uttara, Dhaka',
      reference: 'SW567890',
      mcc: '5411'
    }
  ]);

  // Mock data for offers
  const [offers] = useState<CardOffer[]>([
    {
      id: 'OFFER001',
      title: '20% Cashback on Dining',
      description: 'Get 20% cashback on all restaurant purchases',
      discount: '20%',
      category: 'Food & Dining',
      validUntil: '2024-02-29',
      terms: 'Maximum cashback ৳2000 per month',
      image: 'dining-offer.jpg'
    },
    {
      id: 'OFFER002',
      title: '10% Off on Online Shopping',
      description: 'Save 10% on all online purchases',
      discount: '10%',
      category: 'Shopping',
      validUntil: '2024-03-31',
      terms: 'Valid on purchases above ৳1000',
      image: 'shopping-offer.jpg'
    },
    {
      id: 'OFFER003',
      title: 'Free Airport Lounge Access',
      description: 'Complimentary access to airport lounges worldwide',
      discount: 'Free',
      category: 'Travel',
      validUntil: '2024-12-31',
      terms: 'Valid for primary cardholder only',
      image: 'lounge-offer.jpg'
    }
  ]);

  const currentCard = cards.find(card => card.id === selectedCard) || cards[0];
  const cardTransactions = transactions.filter(t => t.cardId === selectedCard);

  const filteredTransactions = cardTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa': return 'from-blue-600 to-blue-800';
      case 'mastercard': return 'from-red-600 to-orange-600';
      case 'amex': return 'from-green-600 to-teal-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard className="w-6 h-6" />;
      case 'debit': return <CreditCard className="w-6 h-6" />;
      case 'prepaid': return <CreditCard className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'blocked': return 'text-red-400';
      case 'expired': return 'text-yellow-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'blocked': return <Lock className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping': return <ShoppingBag className="w-5 h-5" />;
      case 'food & dining': return <Utensils className="w-5 h-5" />;
      case 'gas & fuel': return <Car className="w-5 h-5" />;
      case 'groceries': return <Home className="w-5 h-5" />;
      case 'travel': return <Plane className="w-5 h-5" />;
      case 'cash withdrawal': return <DollarSign className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const handleBlockCard = async () => {
    setIsBlocking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBlocking(false);
      alert('Card blocked successfully!');
    }, 2000);
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(currentCard.cardNumber);
    // You could add a toast notification here
  };

  const formatCardNumber = (number: string, showFull: boolean = false) => {
    if (!showFull) {
      return `**** **** **** ${number.slice(-4)}`;
    }
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const calculateSpendingByCategory = () => {
    const categorySpending: { [key: string]: number } = {};
    cardTransactions.forEach(transaction => {
      if (transaction.type === 'purchase') {
        categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
      }
    });
    return Object.entries(categorySpending).map(([category, amount]) => ({ category, amount }));
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
          <h1 className="text-2xl font-bold">My Cards</h1>
        </div>

        {/* Card Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Select Card</h2>
            <button
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Card Details
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className={`relative overflow-hidden rounded-2xl transition-all duration-200 ${
                  selectedCard === card.id ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${getCardBrandColor(card.cardBrand)} p-6 text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getCardTypeIcon(card.cardType)}
                      <span className="ml-2 text-sm font-medium uppercase">{card.cardType}</span>
                    </div>
                    <div className={`flex items-center text-xs ${getStatusColor(card.status)}`}>
                      {getStatusIcon(card.status)}
                      <span className="ml-1 capitalize">{card.status}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-lg font-mono tracking-wider">
                      {formatCardNumber(card.cardNumber)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-80">VALID THRU</p>
                      <p className="text-sm font-medium">{card.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">{card.cardBrand.toUpperCase()}</p>
                      <p className="text-sm font-medium">{card.holderName}</p>
                    </div>
                  </div>
                  
                  {/* Card features */}
                  <div className="flex justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex space-x-2">
                      {card.contactless && <Wifi className="w-4 h-4 opacity-80" />}
                      {card.international && <Globe className="w-4 h-4 opacity-80" />}
                      {card.onlineShopping && <Smartphone className="w-4 h-4 opacity-80" />}
                    </div>
                    <div className="text-right">
                      {card.cardType === 'credit' ? (
                        <p className="text-sm">
                          Available: ৳{card.availableCredit?.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm">
                          Balance: ৳{card.balance?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Card Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 mr-3 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">{currentCard.cardType.toUpperCase()} Card</h2>
                <p className="text-gray-400">{currentCard.cardBrand.toUpperCase()}</p>
              </div>
            </div>
            <div className={`flex items-center ${getStatusColor(currentCard.status)}`}>
              {getStatusIcon(currentCard.status)}
              <span className="ml-2 font-medium capitalize">{currentCard.status}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentCard.cardType === 'credit' ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Credit Limit</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ৳{currentCard.creditLimit?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Available Credit</p>
                  <p className="text-xl font-semibold text-green-400">
                    ৳{currentCard.availableCredit?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Monthly Spent</p>
                  <p className="text-xl font-semibold text-red-400">
                    ৳{currentCard.monthlySpent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Cash Limit</p>
                  <p className="text-xl font-semibold text-purple-400">
                    ৳{currentCard.cashLimit.toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    ৳{currentCard.balance?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Daily Limit</p>
                  <p className="text-xl font-semibold text-blue-400">
                    ৳{currentCard.dailyLimit.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Monthly Spent</p>
                  <p className="text-xl font-semibold text-red-400">
                    ৳{currentCard.monthlySpent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Cash Limit</p>
                  <p className="text-xl font-semibold text-purple-400">
                    ৳{currentCard.cashLimit.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Offers & Rewards
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-r-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowLimitsModal(true)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center"
                >
                  <Settings className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="font-medium">Set Limits</p>
                </button>
                <button
                  onClick={handleBlockCard}
                  disabled={isBlocking || currentCard.status === 'blocked'}
                  className="p-4 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-center"
                >
                  {isBlocking ? (
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-red-400 animate-spin" />
                  ) : (
                    <Lock className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  )}
                  <p className="font-medium text-red-400">
                    {isBlocking ? 'Blocking...' : currentCard.status === 'blocked' ? 'Blocked' : 'Block Card'}
                  </p>
                </button>
                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="font-medium">Statement</p>
                </button>
                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="font-medium">Apply New</p>
                </button>
              </div>
            </div>

            {/* Spending Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
                <div className="space-y-4">
                  {calculateSpendingByCategory().slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCategoryIcon(item.category)}
                        <span className="ml-3 font-medium">{item.category}</span>
                      </div>
                      <span className="font-semibold">৳{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Card Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="w-5 h-5 mr-3 text-blue-400" />
                      <span>Contactless Payment</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      currentCard.contactless ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {currentCard.contactless ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-purple-400" />
                      <span>International Usage</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      currentCard.international ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {currentCard.international ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-3 text-green-400" />
                      <span>Online Shopping</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      currentCard.onlineShopping ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {currentCard.onlineShopping ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {cardTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg mr-3">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.merchant}</p>
                        <p className="text-sm text-gray-400">{transaction.date} • {transaction.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-400">
                        -৳{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="py-2 px-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Gas & Fuel">Gas & Fuel</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Travel">Travel</option>
                  <option value="Cash Withdrawal">Cash Withdrawal</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="py-2 px-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center flex-1">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg mr-4">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{transaction.merchant}</h3>
                        <p className="text-sm text-gray-300 mb-2">{transaction.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>Date: {transaction.date}</span>
                          <span>Time: {transaction.time}</span>
                          <span>Location: {transaction.location}</span>
                          <span>Ref: {transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'refund' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'refund' ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{transaction.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">Available Offers & Rewards</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium">
                        {offer.discount}
                      </div>
                      <span className="text-sm text-gray-400">{offer.category}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
                    <p className="text-gray-300 mb-4">{offer.description}</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">Valid until: {offer.validUntil}</p>
                      <p className="text-gray-400">Terms: {offer.terms}</p>
                    </div>
                    <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors">
                      Activate Offer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Summary */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Rewards Summary</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">2,450</p>
                  <p className="text-sm text-gray-400">Reward Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">৳1,250</p>
                  <p className="text-sm text-gray-400">Cashback Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">Gold</p>
                  <p className="text-sm text-gray-400">Membership Tier</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Card Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Card Controls</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Contactless Payments</p>
                    <p className="text-sm text-gray-400">Enable tap-to-pay functionality</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full relative ${
                    currentCard.contactless ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      currentCard.contactless ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">International Transactions</p>
                    <p className="text-sm text-gray-400">Allow overseas usage</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full relative ${
                    currentCard.international ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      currentCard.international ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Online Shopping</p>
                    <p className="text-sm text-gray-400">Enable e-commerce transactions</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full relative ${
                    currentCard.onlineShopping ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      currentCard.onlineShopping ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium">Change PIN</p>
                      <p className="text-sm text-gray-400">Update your card PIN</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-3 text-yellow-400" />
                    <div>
                      <p className="font-medium">Transaction Alerts</p>
                      <p className="text-sm text-gray-400">SMS/Email notifications</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-green-400" />
                    <div>
                      <p className="font-medium">Fraud Protection</p>
                      <p className="text-sm text-gray-400">Advanced security monitoring</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Active
                  </div>
                </button>
              </div>
            </div>

            {/* Card Management */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Card Management</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium">Replace Card</p>
                      <p className="text-sm text-gray-400">Request a replacement card</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 mr-3 text-green-400" />
                    <div>
                      <p className="font-medium">Add-on Card</p>
                      <p className="text-sm text-gray-400">Request additional cards</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Trash2 className="w-5 h-5 mr-3 text-red-400" />
                    <div>
                      <p className="font-medium text-red-400">Close Card</p>
                      <p className="text-sm text-gray-400">Permanently close this card</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Details Modal */}
        {showCardDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Card Details</h3>
                <button
                  onClick={() => setShowCardDetails(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Card Number</p>
                    <div className="flex items-center">
                      <p className="font-mono text-lg mr-2">
                        {formatCardNumber(currentCard.cardNumber, showCardDetails)}
                      </p>
                      <button
                        onClick={copyCardNumber}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Cardholder Name</p>
                    <p className="font-medium">{currentCard.holderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Expiry Date</p>
                    <p className="font-medium">{currentCard.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">CVV</p>
                    <div className="flex items-center">
                      <p className="font-mono text-lg mr-2">
                        {showCVV ? currentCard.cvv : '***'}
                      </p>
                      <button
                        onClick={() => setShowCVV(!showCVV)}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Card Type</p>
                    <p className="font-medium capitalize">{currentCard.cardType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Card Brand</p>
                    <p className="font-medium uppercase">{currentCard.cardBrand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Issue Date</p>
                    <p className="font-medium">{currentCard.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Linked Account</p>
                    <p className="font-mono text-sm">****{currentCard.linkedAccount.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Limits Modal */}
        {showLimitsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Set Card Limits</h3>
                <button
                  onClick={() => setShowLimitsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Daily Limit</label>
                  <input
                    type="number"
                    defaultValue={currentCard.dailyLimit}
                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cash Withdrawal Limit</label>
                  <input
                    type="number"
                    defaultValue={currentCard.cashLimit}
                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowLimitsModal(false)}
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLimitsModal(false);
                      alert('Limits updated successfully!');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                  >
                    Update
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

export default Cards;