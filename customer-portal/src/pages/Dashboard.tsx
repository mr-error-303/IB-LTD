import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Send, 
  History, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Bell,
  RefreshCw,
  Smartphone,
  Zap,
  QrCode,
  Building2,
  Wallet,
  Receipt,
  Settings,
  Users,
  Filter,
  Calendar,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Camera,
  Edit3,
  Plus,
  Trash2,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { bankingService } from '../services/bankingService';
import { mobileRechargeService } from '../services/mobileRechargeService';
import { Transaction } from '../types';
import { formatCurrency, convertCurrency, getCurrencyColor, getCurrencyGradient } from '../utils/currency';
import CurrencySelector from '../components/CurrencySelector';
import StatsGrid from '../components/StatsGrid';
import AccountSelector, { ACCOUNT_TYPES } from '../components/AccountSelector';
import QuickActionsGrid from '../components/QuickActionsGrid';
import RecentActivity from '../components/RecentActivity';
import SpendingAnalytics from '../components/SpendingAnalytics';
import CreditScore from '../components/CreditScore';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bank: string;
  nickname: string;
  category: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // State management
  const [selectedAccount, setSelectedAccount] = useState('current');
  const [balance, setBalance] = useState<number>(125000.50);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('BDT');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: '1', name: 'রহিম উদ্দিন', accountNumber: '1234567890', bank: 'Dutch Bangla Bank', nickname: 'রহিম ভাই', category: 'family' },
    { id: '2', name: 'ফাতেমা খাতুন', accountNumber: '0987654321', bank: 'BRAC Bank', nickname: 'ফাতেমা আপা', category: 'family' }
  ]);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', accountNumber: '', bank: '', nickname: '', category: 'family' });
  
  // Mobile recharge state
  const [mobileRechargeData, setMobileRechargeData] = useState({
    phoneNumber: '',
    operator: '',
    amount: ''
  });
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState('');

  // Mock data for transactions (last 15 transactions)
  const mockTransactions: Transaction[] = [
    { id: '1', date: '2024-01-15', description: 'ATM Withdrawal', amount: 5000, type: 'debit', status: 'completed' },
    { id: '2', date: '2024-01-14', description: 'Salary Deposit', amount: 50000, type: 'credit', status: 'completed' },
    { id: '3', date: '2024-01-13', description: 'Electricity Bill', amount: 2500, type: 'debit', status: 'completed' },
    { id: '4', date: '2024-01-12', description: 'Mobile Recharge', amount: 500, type: 'debit', status: 'completed' },
    { id: '5', date: '2024-01-11', description: 'Online Transfer', amount: 10000, type: 'debit', status: 'completed' },
    { id: '6', date: '2024-01-10', description: 'Check Deposit', amount: 25000, type: 'credit', status: 'completed' },
    { id: '7', date: '2024-01-09', description: 'Gas Bill', amount: 1200, type: 'debit', status: 'completed' },
    { id: '8', date: '2024-01-08', description: 'Internet Bill', amount: 1500, type: 'debit', status: 'completed' },
    { id: '9', date: '2024-01-07', description: 'Bank Transfer', amount: 15000, type: 'credit', status: 'completed' },
    { id: '10', date: '2024-01-06', description: 'Online Shopping', amount: 3500, type: 'debit', status: 'completed' },
    { id: '11', date: '2024-01-05', description: 'Water Bill', amount: 800, type: 'debit', status: 'completed' },
    { id: '12', date: '2024-01-04', description: 'Freelancing Payment', amount: 20000, type: 'credit', status: 'completed' },
    { id: '13', date: '2024-01-03', description: 'Restaurant Bill', amount: 1200, type: 'debit', status: 'completed' },
    { id: '14', date: '2024-01-02', description: 'Bank Charges', amount: 100, type: 'debit', status: 'completed' },
    { id: '15', date: '2024-01-01', description: 'New Year Bonus', amount: 5000, type: 'credit', status: 'completed' },
  ];

  useEffect(() => {
    setRecentTransactions(mockTransactions);
  }, []);

  // Update balance when account changes
  useEffect(() => {
    const accountData = ACCOUNT_TYPES[selectedAccount as keyof typeof ACCOUNT_TYPES];
    if (accountData) {
      setBalance(accountData.balance);
    }
  }, [selectedAccount]);

  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const maskAccountNumber = (accountNumber: string) => {
    return `**** **** ${accountNumber.slice(-4)}`;
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBalance(balance + Math.random() * 1000 - 500);
      setIsLoading(false);
    }, 1000);
  };

  const filteredTransactions = recentTransactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  const addBeneficiary = () => {
    if (newBeneficiary.name && newBeneficiary.accountNumber && newBeneficiary.bank) {
      setBeneficiaries([...beneficiaries, { ...newBeneficiary, id: Date.now().toString() }]);
      setNewBeneficiary({ name: '', accountNumber: '', bank: '', nickname: '', category: 'family' });
      setShowBeneficiaryModal(false);
    }
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
  };

  // Mobile recharge handlers
  const handleMobileRechargeInputChange = (field: string, value: string) => {
    setMobileRechargeData(prev => ({
      ...prev,
      [field]: value
    }));
    setRechargeError('');
  };

  const handleMobileRecharge = async () => {
    if (!mobileRechargeData.phoneNumber || !mobileRechargeData.operator || !mobileRechargeData.amount) {
      setRechargeError('সব ক্ষেত্র পূরণ করুন');
      return;
    }

    if (mobileRechargeData.phoneNumber.length !== 11) {
      setRechargeError('মোবাইল নম্বর ১১ সংখ্যার হতে হবে');
      return;
    }

    const amount = parseFloat(mobileRechargeData.amount);
    if (amount < 10 || amount > 5000) {
      setRechargeError('রিচার্জের পরিমাণ ১০ থেকে ৫০০০ টাকার মধ্যে হতে হবে');
      return;
    }

    setRechargeLoading(true);
    try {
      const result = await mobileRechargeService.processMobileRecharge(
        user?.id || '',
        user?.phone || '',
        {
          operator: mobileRechargeData.operator,
          phoneNumber: mobileRechargeData.phoneNumber,
          amount: amount,
          connectionType: 'prepaid'
        }
      );

      if (result.success) {
        // Reset form
        setMobileRechargeData({ phoneNumber: '', operator: '', amount: '' });
        // Show success message (you might want to add a toast notification here)
        alert(`রিচার্জ সফল হয়েছে! ট্রানজেকশন আইডি: ${result.transactionId}`);
      } else {
        setRechargeError(result.message);
      }
    } catch (error) {
      setRechargeError('রিচার্জ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setRechargeLoading(false);
    }
  };

  // Account Summary Card
  const AccountSummaryCard = () => {
    const displayBalance = convertCurrency(balance, 'BDT', selectedCurrency);
    const currentAccount = ACCOUNT_TYPES[selectedAccount as keyof typeof ACCOUNT_TYPES];
    
    return (
      <div className="space-y-4 mb-6">
        {/* Account Selector */}
        <AccountSelector 
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
        
        {/* Balance Display */}
        <div className="balance-card animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              {/* IB LTD Header - Enhanced */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">IB LTD</h1>
                  <p className="text-base text-white/80 font-medium">International Banking Limited</p>
                </div>
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                  className="w-32"
                />
              </div>
              
              {/* Enhanced Balance Display */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-xl font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">{selectedCurrency}</span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300 micro-bounce"
                  >
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="balance-amount text-5xl font-bold text-white mb-2 tracking-tight">
                  {showBalance ? '125,000' : '••••••••'}
                </div>
                <p className="text-lg text-white/70 font-medium">Available Balance</p>
              </div>
              
              {selectedCurrency !== 'BDT' && (
                <p className="text-sm text-white/60 mt-2 bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm">
                  ≈ {formatCurrency(balance, 'BDT')} (Primary Currency)
                </p>
              )}
            </div>
            <button
              onClick={refreshBalance}
              disabled={isLoading}
              className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 transition-all duration-300 backdrop-blur-sm micro-bounce shadow-lg"
            >
              <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Account Information - Enhanced */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-white/80">
              <div>
                <p className="text-sm opacity-80 mb-1">Account Number</p>
                <p className="font-mono text-lg font-medium">{maskAccountNumber(currentAccount.accountNumber)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80 mb-1">
                  {currentAccount.interestRate ? 'Interest Rate' : 'Branch'}
                </p>
                <p className="font-medium">
                  {currentAccount.interestRate ? `${currentAccount.interestRate}%` : 'Main Branch'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quick Actions Menu
  const QuickActionsMenu = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link
        to="/transfer"
        className="glass-card hover:glass-card-hover group animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-success-400 to-success-600 p-3 rounded-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-success">
            <Send className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-white/90 mb-1 text-sm">Quick Transfer</h3>
          <p className="text-xs text-white/70">Send Money</p>
        </div>
      </Link>

      <Link
        to="/bill-payment"
        className="glass-card hover:glass-card-hover group animate-fade-in-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-accent-400 to-accent-600 p-3 rounded-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-accent">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-white/90 mb-1 text-sm">Bills & Recharge</h3>
          <p className="text-xs text-white/70">Pay Bills</p>
        </div>
      </Link>

      <Link
        to="/account"
        className="glass-card hover:glass-card-hover group animate-fade-in-up"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-3 rounded-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-primary">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-white/90 mb-1 text-sm">Account Details</h3>
          <p className="text-xs text-white/70">View Details</p>
        </div>
      </Link>

      <Link
        to="/profile"
        className="glass-card hover:glass-card-hover group animate-fade-in-up"
        style={{ animationDelay: '0.4s' }}
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-purple">
            <User className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-white/90 mb-1 text-sm">Profile</h3>
          <p className="text-xs text-white/70">Management</p>
        </div>
      </Link>
    </div>
  );

  // Account Management Section
  const AccountManagementSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Full Account Number</p>
            <p className="font-mono text-lg">{user?.accountNumber || '1234567890123456'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Branch Name</p>
            <p className="font-medium">Main Branch</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Branch Address</p>
            <p className="font-medium">123 Main Street, Dhaka-1000</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Account Type</p>
            <p className="font-medium">Savings Account</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <div className="flex items-center space-x-2">
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
              <button
                onClick={() => setShowTransactionHistory(!showTransactionHistory)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showTransactionHistory ? 'Show Less' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {(showTransactionHistory ? filteredTransactions : filteredTransactions.slice(0, 5)).map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'credit' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Quick Transfers Section
  const QuickTransfersSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">দ্রুত ট্রান্সফার</h2>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NPSB Transfer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">NPSB ট্রান্সফার</h3>
          </div>
          <p className="text-gray-600 mb-4">অন্য ব্যাংকে তাৎক্ষণিক টাকা পাঠান</p>
          <Link
            to="/transfer?type=npsb"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
          >
            ট্রান্সফার করুন
          </Link>
        </div>

        {/* BEFTN Transfer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">BEFTN ট্রান্সফার</h3>
          </div>
          <p className="text-gray-600 mb-4">ব্যাচ ট্রান্সফারের মাধ্যমে টাকা পাঠান</p>
          <Link
            to="/transfer?type=beftn"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
          >
            ট্রান্সফার করুন
          </Link>
        </div>

        {/* Mobile Wallet Transfer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">মোবাইল ওয়ালেট</h3>
          </div>
          <p className="text-gray-600 mb-4">bKash, Nagad, Rocket এ টাকা পাঠান</p>
          <div className="space-y-2">
            <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
              bKash
            </button>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              Nagad
            </button>
          </div>
        </div>

        {/* QR Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">অগ্রণী স্মার্ট পে</h3>
          </div>
          <p className="text-gray-600 mb-4">QR কোড স্ক্যান করে পেমেন্ট করুন</p>
          <div className="space-y-2">
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              QR স্ক্যান করুন
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              আমার QR কোড
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Bills & Recharge Section
  const BillsRechargeSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">বিল পেমেন্ট ও রিচার্জ</h2>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mobile Recharge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">মোবাইল রিচার্জ</h3>
          </div>
          {rechargeError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {rechargeError}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="মোবাইল নম্বর"
              value={mobileRechargeData.phoneNumber}
              onChange={(e) => handleMobileRechargeInputChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <select 
              value={mobileRechargeData.operator}
              onChange={(e) => handleMobileRechargeInputChange('operator', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">অপারেটর নির্বাচন করুন</option>
              <option value="grameenphone">Grameenphone</option>
              <option value="robi">Robi</option>
              <option value="banglalink">Banglalink</option>
              <option value="teletalk">Teletalk</option>
              <option value="airtel">Airtel</option>
            </select>
            <input
              type="number"
              placeholder="পরিমাণ (টাকা)"
              value={mobileRechargeData.amount}
              onChange={(e) => handleMobileRechargeInputChange('amount', e.target.value)}
              min="10"
              max="5000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleMobileRechargeInputChange('amount', '50')}
                className="bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm"
              >
                ৫০ টাকা
              </button>
              <button 
                onClick={() => handleMobileRechargeInputChange('amount', '100')}
                className="bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm"
              >
                ১০০ টাকা
              </button>
              <button 
                onClick={() => handleMobileRechargeInputChange('amount', '200')}
                className="bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm"
              >
                ২০০ টাকা
              </button>
            </div>
            <button 
              onClick={handleMobileRecharge}
              disabled={rechargeLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {rechargeLoading ? 'রিচার্জ হচ্ছে...' : 'রিচার্জ করুন'}
            </button>
          </div>
        </div>

        {/* Electricity Bill */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">বিদ্যুৎ বিল</h3>
          </div>
          <div className="space-y-3">
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option>কোম্পানি নির্বাচন করুন</option>
              <option>DESCO</option>
              <option>DPDC</option>
              <option>BPDB</option>
            </select>
            <input
              type="text"
              placeholder="অ্যাকাউন্ট নম্বর"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
              বিল পরিশোধ করুন
            </button>
          </div>
        </div>

        {/* Gas Bill */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">গ্যাস বিল</h3>
          </div>
          <div className="space-y-3">
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option>কোম্পানি নির্বাচন করুন</option>
              <option>Titas Gas</option>
              <option>Jalalabad Gas</option>
              <option>Bakhrabad Gas</option>
            </select>
            <input
              type="text"
              placeholder="অ্যাকাউন্ট নম্বর"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              বিল পরিশোধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile & Management Section
  const ProfileManagementSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">প্রোফাইল ও ম্যানেজমেন্ট</h2>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">প্রোফাইল ম্যানেজমেন্ট</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                <input
                  type="text"
                  defaultValue={user?.name || 'মোহাম্মদ রহিম'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input
                  type="email"
                  defaultValue="rahim@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ফোন</label>
                <input
                  type="tel"
                  defaultValue="+8801712345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                <textarea
                  defaultValue="১২৩ গুলশান এভিনিউ, ঢাকা-১২১২"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                />
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              প্রোফাইল আপডেট করুন
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              পাসওয়ার্ড পরিবর্তন করুন
            </button>
          </div>
        </div>

        {/* Beneficiary Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">বেনিফিশিয়ারি ম্যানেজমেন্ট</h3>
            <button
              onClick={() => setShowBeneficiaryModal(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{beneficiary.name}</p>
                  <p className="text-sm text-gray-500">{beneficiary.bank}</p>
                  <p className="text-xs text-gray-400">{beneficiary.nickname}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBeneficiary(beneficiary.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add Beneficiary Modal
  const AddBeneficiaryModal = () => {
    if (!showBeneficiaryModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">নতুন বেনিফিশিয়ারি যোগ করুন</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="নাম"
              value={newBeneficiary.name}
              onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="অ্যাকাউন্ট নম্বর"
              value={newBeneficiary.accountNumber}
              onChange={(e) => setNewBeneficiary({...newBeneficiary, accountNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={newBeneficiary.bank}
              onChange={(e) => setNewBeneficiary({...newBeneficiary, bank: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">ব্যাংক নির্বাচন করুন</option>
              <option value="Dutch Bangla Bank">Dutch Bangla Bank</option>
              <option value="BRAC Bank">BRAC Bank</option>
              <option value="City Bank">City Bank</option>
              <option value="Eastern Bank">Eastern Bank</option>
            </select>
            <input
              type="text"
              placeholder="ডাকনাম"
              value={newBeneficiary.nickname}
              onChange={(e) => setNewBeneficiary({...newBeneficiary, nickname: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={newBeneficiary.category}
              onChange={(e) => setNewBeneficiary({...newBeneficiary, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="family">পরিবার</option>
              <option value="friends">বন্ধু</option>
              <option value="merchants">ব্যবসায়ী</option>
              <option value="others">অন্যান্য</option>
            </select>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={addBeneficiary}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              যোগ করুন
            </button>
            <button
                onClick={() => setShowBeneficiaryModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-colors duration-200">
      <div className="container-responsive py-responsive">
        {activeSection === 'dashboard' && (
          <div className="space-responsive">
            {/* Header Section - Bank Name & Balance */}
            <div className="mb-8">
              <AccountSummaryCard />
            </div>
            
            {/* Investment & Portfolio Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Investment & Portfolio</h2>
                <p className="text-white/70">Your financial metrics and performance indicators</p>
              </div>
              <StatsGrid selectedCurrency={selectedCurrency} balance={balance} />
            </div>
            
            {/* Quick Actions Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Quick Actions</h2>
                <p className="text-white/70">Access your most used banking services</p>
              </div>
              <QuickActionsGrid />
            </div>
            
            {/* Recent Activity Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Recent Activity</h2>
                <p className="text-white/70">Your latest transactions and account activity</p>
              </div>
              <RecentActivity 
                transactions={recentTransactions as Transaction[]}
                selectedCurrency={selectedCurrency}
                onViewAll={undefined}
              />
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Spending Analytics</h2>
                <p className="text-white/70">Insights into your spending patterns</p>
              </div>
              <SpendingAnalytics 
                transactions={recentTransactions as Transaction[]}
                selectedCurrency={selectedCurrency}
              />
            </div>

            {/* Credit Score Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Credit Profile</h2>
                <p className="text-white/70">Your credit score and financial health</p>
              </div>
              <CreditScore userId={user?.id} />
            </div>
          </div>
        )}
        {activeSection === 'account' && <AccountManagementSection />}
        {activeSection === 'transfers' && <QuickTransfersSection />}
        {activeSection === 'bills' && <BillsRechargeSection />}
        {activeSection === 'profile' && <ProfileManagementSection />}
      </div>
      <AddBeneficiaryModal />
    </div>
  );
};

export default Dashboard;




