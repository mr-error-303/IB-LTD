import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Download,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Settings,
  Bell,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Copy,
  Edit,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed' | 'salary';
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'blocked' | 'dormant';
  openDate: string;
  branch: string;
  interestRate: number;
  minimumBalance: number;
  overdraftLimit?: number;
  lastTransactionDate: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  reference: string;
  category: string;
}

interface AccountStatement {
  id: string;
  month: string;
  year: number;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  status: 'available' | 'generating' | 'unavailable';
}

const BankAccount: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'statements' | 'settings' | 'beneficiaries'>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('ACC001');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [isGeneratingStatement, setIsGeneratingStatement] = useState(false);

  // Mock data for bank accounts
  const [accounts] = useState<BankAccount[]>([
    {
      id: 'ACC001',
      accountNumber: '1234567890123456',
      accountType: 'savings',
      balance: 125000,
      availableBalance: 124500,
      currency: 'BDT',
      status: 'active',
      openDate: '2020-01-15',
      branch: 'Dhaka Main Branch',
      interestRate: 3.5,
      minimumBalance: 1000,
      lastTransactionDate: '2024-01-15'
    },
    {
      id: 'ACC002',
      accountNumber: '9876543210987654',
      accountType: 'current',
      balance: 85000,
      availableBalance: 85000,
      currency: 'BDT',
      status: 'active',
      openDate: '2021-06-10',
      branch: 'Chittagong Branch',
      interestRate: 0,
      minimumBalance: 5000,
      overdraftLimit: 50000,
      lastTransactionDate: '2024-01-14'
    },
    {
      id: 'ACC003',
      accountNumber: '5555444433332222',
      accountType: 'fixed',
      balance: 500000,
      availableBalance: 0,
      currency: 'BDT',
      status: 'active',
      openDate: '2023-03-20',
      branch: 'Sylhet Branch',
      interestRate: 8.5,
      minimumBalance: 100000,
      lastTransactionDate: '2023-03-20'
    }
  ]);

  // Mock data for transactions
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: '2024-01-15',
      description: 'Salary Credit',
      amount: 50000,
      type: 'credit',
      balance: 125000,
      reference: 'SAL202401',
      category: 'Salary'
    },
    {
      id: 'TXN002',
      date: '2024-01-14',
      description: 'ATM Withdrawal',
      amount: 5000,
      type: 'debit',
      balance: 75000,
      reference: 'ATM123456',
      category: 'Cash Withdrawal'
    },
    {
      id: 'TXN003',
      date: '2024-01-13',
      description: 'Online Purchase',
      amount: 2500,
      type: 'debit',
      balance: 80000,
      reference: 'ONL789012',
      category: 'Shopping'
    },
    {
      id: 'TXN004',
      date: '2024-01-12',
      description: 'Fund Transfer Received',
      amount: 15000,
      type: 'credit',
      balance: 82500,
      reference: 'FT345678',
      category: 'Transfer'
    },
    {
      id: 'TXN005',
      date: '2024-01-11',
      description: 'Utility Bill Payment',
      amount: 3500,
      type: 'debit',
      balance: 67500,
      reference: 'BILL901234',
      category: 'Bills'
    }
  ]);

  // Mock data for statements
  const [statements] = useState<AccountStatement[]>([
    {
      id: 'STMT001',
      month: 'December',
      year: 2023,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      openingBalance: 95000,
      closingBalance: 120000,
      totalCredits: 75000,
      totalDebits: 50000,
      transactionCount: 28,
      status: 'available'
    },
    {
      id: 'STMT002',
      month: 'November',
      year: 2023,
      startDate: '2023-11-01',
      endDate: '2023-11-30',
      openingBalance: 80000,
      closingBalance: 95000,
      totalCredits: 65000,
      totalDebits: 50000,
      transactionCount: 32,
      status: 'available'
    },
    {
      id: 'STMT003',
      month: 'October',
      year: 2023,
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      openingBalance: 75000,
      closingBalance: 80000,
      totalCredits: 55000,
      totalDebits: 50000,
      transactionCount: 25,
      status: 'available'
    }
  ]);

  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'savings': return 'text-green-400';
      case 'current': return 'text-blue-400';
      case 'fixed': return 'text-purple-400';
      case 'salary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'blocked': return 'text-red-400';
      case 'dormant': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'blocked': return <Lock className="w-4 h-4" />;
      case 'dormant': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleGenerateStatement = async (statementId: string) => {
    setIsGeneratingStatement(true);
    // Simulate statement generation
    setTimeout(() => {
      setIsGeneratingStatement(false);
      alert('Statement generated successfully!');
    }, 2000);
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(currentAccount.accountNumber);
    // You could add a toast notification here
  };

  const calculateMonthlySpending = () => {
    const debits = transactions.filter(t => t.type === 'debit');
    return debits.reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyIncome = () => {
    const credits = transactions.filter(t => t.type === 'credit');
    return credits.reduce((sum, t) => sum + t.amount, 0);
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
          <h1 className="text-2xl font-bold">Bank Account</h1>
        </div>

        {/* Account Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Select Account</h2>
            <button
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Account Details
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedAccount === account.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${getAccountTypeColor(account.accountType)}`}>
                    {account.accountType.toUpperCase()}
                  </span>
                  <div className={`flex items-center text-xs ${getStatusColor(account.status)}`}>
                    {getStatusIcon(account.status)}
                    <span className="ml-1 capitalize">{account.status}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">****{account.accountNumber.slice(-4)}</p>
                <p className="text-lg font-bold">
                  {showBalance ? `৳${account.balance.toLocaleString()}` : '৳****'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Account Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 mr-3 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">{currentAccount.accountType.toUpperCase()} Account</h2>
                <p className="text-gray-400">{currentAccount.branch}</p>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Account Number</p>
              <div className="flex items-center justify-center">
                <p className="font-mono text-lg mr-2">
                  {showBalance ? currentAccount.accountNumber : '****-****-****-' + currentAccount.accountNumber.slice(-4)}
                </p>
                <button
                  onClick={copyAccountNumber}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Current Balance</p>
              <p className="text-2xl font-bold text-green-400">
                {showBalance ? `৳${currentAccount.balance.toLocaleString()}` : '৳****'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Available Balance</p>
              <p className="text-xl font-semibold">
                {showBalance ? `৳${currentAccount.availableBalance.toLocaleString()}` : '৳****'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Interest Rate</p>
              <p className="text-xl font-semibold text-purple-400">
                {currentAccount.interestRate}% p.a.
              </p>
            </div>
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
            onClick={() => setActiveTab('statements')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'statements'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Statements
          </button>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'beneficiaries'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Beneficiaries
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
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Monthly Income</h3>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  ৳{calculateMonthlyIncome().toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-2">+12% from last month</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Monthly Spending</h3>
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  ৳{calculateMonthlySpending().toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-2">-5% from last month</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Net Savings</h3>
                  <PieChart className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  ৳{(calculateMonthlyIncome() - calculateMonthlySpending()).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-2">+18% from last month</p>
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
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        transaction.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-400">{transaction.date} • {transaction.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">৳{transaction.balance.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Account Opened</p>
                    <p className="font-medium">{currentAccount.openDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Minimum Balance</p>
                    <p className="font-medium">৳{currentAccount.minimumBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Transaction</p>
                    <p className="font-medium">{currentAccount.lastTransactionDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Branch</p>
                    <p className="font-medium">{currentAccount.branch}</p>
                  </div>
                  {currentAccount.overdraftLimit && (
                    <div>
                      <p className="text-sm text-gray-400">Overdraft Limit</p>
                      <p className="font-medium">৳{currentAccount.overdraftLimit.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Account Status</p>
                    <div className={`flex items-center ${getStatusColor(currentAccount.status)}`}>
                      {getStatusIcon(currentAccount.status)}
                      <span className="ml-2 font-medium capitalize">{currentAccount.status}</span>
                    </div>
                  </div>
                </div>
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="py-2 px-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credits</option>
                  <option value="debit">Debits</option>
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
                      <div className={`p-3 rounded-lg mr-4 ${
                        transaction.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{transaction.description}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>Date: {transaction.date}</span>
                          <span>Ref: {transaction.reference}</span>
                          <span>Category: {transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Balance: ৳{transaction.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statements Tab */}
        {activeTab === 'statements' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Account Statements</h2>
              <button
                onClick={() => handleGenerateStatement('new')}
                disabled={isGeneratingStatement}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isGeneratingStatement ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 mr-2" />
                )}
                {isGeneratingStatement ? 'Generating...' : 'Generate Statement'}
              </button>
            </div>
            
            <div className="space-y-4">
              {statements.map((statement) => (
                <div key={statement.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{statement.month} {statement.year}</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Period</p>
                          <p className="font-medium">{statement.startDate} to {statement.endDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Opening Balance</p>
                          <p className="font-medium">৳{statement.openingBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Closing Balance</p>
                          <p className="font-medium">৳{statement.closingBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Transactions</p>
                          <p className="font-medium">{statement.transactionCount}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-400">Total Credits</p>
                          <p className="font-medium text-green-400">৳{statement.totalCredits.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Debits</p>
                          <p className="font-medium text-red-400">৳{statement.totalDebits.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        statement.status === 'available' ? 'bg-green-500/20 text-green-400' :
                        statement.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {statement.status}
                      </div>
                      {statement.status === 'available' && (
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beneficiaries Tab */}
        {activeTab === 'beneficiaries' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Beneficiary Management</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Beneficiary
              </button>
            </div>
            
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Beneficiaries Added</h3>
              <p className="text-gray-400 mb-6">Add beneficiaries to make transfers easier and faster</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center mx-auto">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Beneficiary
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Account Preferences */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-400">Receive SMS for transactions</p>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Statements</p>
                    <p className="text-sm text-gray-400">Monthly statements via email</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Alerts</p>
                    <p className="text-sm text-gray-400">Real-time transaction notifications</p>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
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
                      <p className="text-sm text-gray-400">Update your transaction PIN</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-green-400" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Enable 2FA for extra security</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Enabled
                  </div>
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-3 text-yellow-400" />
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-400">Get notified of new logins</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium">Request Checkbook</p>
                      <p className="text-sm text-gray-400">Order a new checkbook</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3 text-purple-400" />
                    <div>
                      <p className="font-medium">Request Debit Card</p>
                      <p className="text-sm text-gray-400">Apply for a new debit card</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
                    <div>
                      <p className="font-medium text-red-400">Close Account</p>
                      <p className="text-sm text-gray-400">Permanently close this account</p>
                    </div>
                  </div>
                  <Edit className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Details Modal */}
        {showAccountDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Account Details</h3>
                <button
                  onClick={() => setShowAccountDetails(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Account Number</p>
                    <p className="font-mono text-lg">{currentAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Account Type</p>
                    <p className="font-medium capitalize">{currentAccount.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Branch</p>
                    <p className="font-medium">{currentAccount.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Currency</p>
                    <p className="font-medium">{currentAccount.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Opening Date</p>
                    <p className="font-medium">{currentAccount.openDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <div className={`flex items-center ${getStatusColor(currentAccount.status)}`}>
                      {getStatusIcon(currentAccount.status)}
                      <span className="ml-2 font-medium capitalize">{currentAccount.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccount;