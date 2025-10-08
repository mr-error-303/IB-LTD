import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  Filter,
  Search,
  Eye,
  Mail,
  Printer,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Building,
  User,
  Phone,
  Globe,
  Smartphone,
  Zap,
  ShoppingCart,
  Car,
  Home,
  Plane,
  Coffee,
  Fuel,
  ShoppingBag,
  Utensils,
  Film,
  Music,
  Book,
  Heart,
  Gift,
  Star,
  Award,
  Target,
  Briefcase,
  GraduationCap,
  Shield,
  Umbrella,
  Wrench,
  Truck,
  MapPin,
  RefreshCw,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Settings,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  category: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
  channel: string;
  location?: string;
  merchant?: string;
  icon: React.ReactNode;
}

interface StatementType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

interface DateRange {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const Statement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState('savings-001');
  const [selectedStatementType, setSelectedStatementType] = useState('account');
  const [selectedDateRange, setSelectedDateRange] = useState('last-3-months');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Transaction[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Mock accounts data
  const accounts = [
    { id: 'savings-001', name: 'Savings Account', number: '****1234', balance: 125000 },
    { id: 'current-001', name: 'Current Account', number: '****5678', balance: 85000 },
    { id: 'fixed-001', name: 'Fixed Deposit', number: '****9012', balance: 500000 }
  ];

  // Statement types
  const statementTypes: StatementType[] = [
    {
      id: 'account',
      name: 'Account Statement',
      description: 'Complete transaction history for your account',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-600',
      available: true
    },
    {
      id: 'mini',
      name: 'Mini Statement',
      description: 'Last 10 transactions summary',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-green-600 to-emerald-600',
      available: true
    },
    {
      id: 'tax',
      name: 'Tax Statement',
      description: 'Annual tax deduction summary',
      icon: <Building className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-600',
      available: true
    },
    {
      id: 'interest',
      name: 'Interest Certificate',
      description: 'Interest earned certificate',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-yellow-600 to-orange-600',
      available: true
    },
    {
      id: 'loan',
      name: 'Loan Statement',
      description: 'Loan account statement and payment history',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-red-600 to-pink-600',
      available: false
    },
    {
      id: 'card',
      name: 'Card Statement',
      description: 'Credit/Debit card transaction statement',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-indigo-600 to-purple-600',
      available: true
    }
  ];

  // Date ranges
  const dateRanges: DateRange[] = [
    {
      id: 'last-month',
      name: 'Last Month',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      id: 'last-3-months',
      name: 'Last 3 Months',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      id: 'last-6-months',
      name: 'Last 6 Months',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      id: 'last-year',
      name: 'Last Year',
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    {
      id: 'custom',
      name: 'Custom Range',
      startDate: '',
      endDate: ''
    }
  ];

  // Mock transactions data
  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001',
      date: '2024-01-15',
      description: 'Salary Credit - ABC Company Ltd',
      type: 'credit',
      amount: 75000,
      balance: 125000,
      category: 'salary',
      reference: 'SAL/2024/001',
      status: 'completed',
      channel: 'Bank Transfer',
      merchant: 'ABC Company Ltd',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      id: 'txn-002',
      date: '2024-01-14',
      description: 'ATM Withdrawal - Gulshan Branch',
      type: 'debit',
      amount: 5000,
      balance: 50000,
      category: 'cash',
      reference: 'ATM/2024/002',
      status: 'completed',
      channel: 'ATM',
      location: 'Gulshan, Dhaka',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'txn-003',
      date: '2024-01-13',
      description: 'Online Purchase - Daraz.com.bd',
      type: 'debit',
      amount: 2500,
      balance: 55000,
      category: 'shopping',
      reference: 'ONL/2024/003',
      status: 'completed',
      channel: 'Online',
      merchant: 'Daraz.com.bd',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      id: 'txn-004',
      date: '2024-01-12',
      description: 'Electricity Bill Payment - DESCO',
      type: 'debit',
      amount: 3200,
      balance: 57500,
      category: 'utilities',
      reference: 'BILL/2024/004',
      status: 'completed',
      channel: 'Mobile Banking',
      merchant: 'DESCO',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'txn-005',
      date: '2024-01-11',
      description: 'Fund Transfer to John Doe',
      type: 'debit',
      amount: 10000,
      balance: 60700,
      category: 'transfer',
      reference: 'TRF/2024/005',
      status: 'completed',
      channel: 'Mobile Banking',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'txn-006',
      date: '2024-01-10',
      description: 'Mobile Recharge - Grameenphone',
      type: 'debit',
      amount: 500,
      balance: 70700,
      category: 'mobile',
      reference: 'MOB/2024/006',
      status: 'completed',
      channel: 'Mobile Banking',
      merchant: 'Grameenphone',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      id: 'txn-007',
      date: '2024-01-09',
      description: 'Restaurant Payment - The Westin Dhaka',
      type: 'debit',
      amount: 4500,
      balance: 71200,
      category: 'dining',
      reference: 'POS/2024/007',
      status: 'completed',
      channel: 'POS',
      merchant: 'The Westin Dhaka',
      location: 'Gulshan, Dhaka',
      icon: <Utensils className="w-5 h-5" />
    },
    {
      id: 'txn-008',
      date: '2024-01-08',
      description: 'Interest Credit - Savings Account',
      type: 'credit',
      amount: 1200,
      balance: 75700,
      category: 'interest',
      reference: 'INT/2024/008',
      status: 'completed',
      channel: 'System',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'txn-009',
      date: '2024-01-07',
      description: 'Fuel Purchase - Padma Oil Company',
      type: 'debit',
      amount: 2800,
      balance: 74500,
      category: 'fuel',
      reference: 'POS/2024/009',
      status: 'completed',
      channel: 'POS',
      merchant: 'Padma Oil Company',
      location: 'Dhanmondi, Dhaka',
      icon: <Fuel className="w-5 h-5" />
    },
    {
      id: 'txn-010',
      date: '2024-01-06',
      description: 'Netflix Subscription',
      type: 'debit',
      amount: 800,
      balance: 77300,
      category: 'entertainment',
      reference: 'SUB/2024/010',
      status: 'completed',
      channel: 'Online',
      merchant: 'Netflix',
      icon: <Film className="w-5 h-5" />
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Star className="w-4 h-4" /> },
    { id: 'salary', name: 'Salary', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'shopping', name: 'Shopping', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'utilities', name: 'Utilities', icon: <Zap className="w-4 h-4" /> },
    { id: 'transfer', name: 'Transfer', icon: <User className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'dining', name: 'Dining', icon: <Utensils className="w-4 h-4" /> },
    { id: 'fuel', name: 'Fuel', icon: <Fuel className="w-4 h-4" /> },
    { id: 'entertainment', name: 'Entertainment', icon: <Film className="w-4 h-4" /> },
    { id: 'cash', name: 'Cash', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'interest', name: 'Interest', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const handleGenerateStatement = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      
      if (selectedStatementType === 'mini') {
        setPreviewData(mockTransactions.slice(0, 10));
      } else {
        setPreviewData(mockTransactions);
      }
      
      setShowPreview(true);
    }, 2000);
  };

  const handleDownloadStatement = (format: 'pdf' | 'excel' | 'csv') => {
    // Simulate download
    const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
    const statementTypeData = statementTypes.find(type => type.id === selectedStatementType);
    const filename = `${statementTypeData?.name.replace(' ', '_')}_${selectedAccountData?.number}_${new Date().toISOString().split('T')[0]}.${format}`;
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename;
    link.click();
    
    alert(`Statement downloaded as ${filename}`);
  };

  const handleEmailStatement = () => {
    alert('Statement has been sent to your registered email address');
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
  const selectedStatementTypeData = statementTypes.find(type => type.id === selectedStatementType);

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
          <h1 className="text-2xl font-bold">Account Statements</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Statement Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Select Account</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedAccount === account.id
                        ? 'ring-2 ring-blue-400 bg-white/20'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="flex items-center mb-2">
                      <Building className="w-5 h-5 mr-2 text-blue-400" />
                      <h3 className="font-medium">{account.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{account.number}</p>
                    <p className="text-lg font-bold text-green-400">৳{account.balance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statement Type Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Statement Type</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {statementTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      !type.available
                        ? 'opacity-50 cursor-not-allowed'
                        : selectedStatementType === type.id
                        ? 'ring-2 ring-blue-400 bg-white/20'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={() => type.available && setSelectedStatementType(type.id)}
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${type.color} text-white mb-3`}>
                      {type.icon}
                    </div>
                    <h3 className="font-medium mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                    {!type.available && (
                      <div className="mt-2 text-xs text-yellow-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {dateRanges.map((range) => (
                  <div
                    key={range.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDateRange === range.id
                        ? 'ring-2 ring-blue-400 bg-white/20'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={() => setSelectedDateRange(range.id)}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="font-medium">{range.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDateRange === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Statement Button */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGenerateStatement}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Preview Statement
                    </>
                  )}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadStatement('pdf')}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownloadStatement('excel')}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center"
                    title="Download Excel"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleEmailStatement}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center"
                    title="Email Statement"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statement Summary */}
          <div className="space-y-6">
            {/* Selected Configuration */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Statement Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account:</span>
                  <span className="font-medium">{selectedAccountData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account No:</span>
                  <span className="font-medium">{selectedAccountData?.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Statement Type:</span>
                  <span className="font-medium">{selectedStatementTypeData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Period:</span>
                  <span className="font-medium">
                    {dateRanges.find(range => range.id === selectedDateRange)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="font-bold text-green-400">৳{selectedAccountData?.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center">
                  <Printer className="w-5 h-5 mr-3 text-blue-400" />
                  Print Statement
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center">
                  <Share2 className="w-5 h-5 mr-3 text-green-400" />
                  Share Statement
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-purple-400" />
                  Statement Settings
                </button>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center text-left">
                  <HelpCircle className="w-5 h-5 mr-3 text-yellow-400" />
                  <div>
                    <p className="font-medium">Statement FAQ</p>
                    <p className="text-sm text-gray-400">Common questions</p>
                  </div>
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center text-left">
                  <Phone className="w-5 h-5 mr-3 text-green-400" />
                  <div>
                    <p className="font-medium">Contact Support</p>
                    <p className="text-sm text-gray-400">Get help from our team</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statement Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-6xl max-h-[90vh] overflow-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Statement Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Statement Header */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold">IB Bank Limited</h4>
                    <p className="text-gray-400">Account Statement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Generated on</p>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Account Details</h5>
                    <p className="text-sm text-gray-400">Account Name: {selectedAccountData?.name}</p>
                    <p className="text-sm text-gray-400">Account Number: {selectedAccountData?.number}</p>
                    <p className="text-sm text-gray-400">Statement Type: {selectedStatementTypeData?.name}</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Period</h5>
                    <p className="text-sm text-gray-400">
                      From: {dateRanges.find(range => range.id === selectedDateRange)?.startDate || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      To: {dateRanges.find(range => range.id === selectedDateRange)?.endDate || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">Current Balance: ৳{selectedAccountData?.balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="date" className="bg-gray-800">Sort by Date</option>
                    <option value="amount" className="bg-gray-800">Sort by Amount</option>
                    <option value="description" className="bg-gray-800">Sort by Description</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center"
                  >
                    {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Reference</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Balance</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="mr-3 text-gray-400">
                                {transaction.icon}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-gray-400">{transaction.channel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {transaction.reference}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${
                            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ৳{transaction.balance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {transaction.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Download Actions */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => handleDownloadStatement('pdf')}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownloadStatement('excel')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Download Excel
                </button>
                <button
                  onClick={handleEmailStatement}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Statement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statement;