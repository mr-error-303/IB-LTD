import React, { useState } from 'react';
import { 
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  HomeIcon,
  UserGroupIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, convertCurrency } from '../utils/currency';

// Transaction category mapping with icons and colors
const TRANSACTION_CATEGORIES = {
  'ATM থেকে টাকা তোলা': {
    icon: CreditCardIcon,
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-500/10',
    category: 'withdrawal'
  },
  'বেতন জমা': {
    icon: BanknotesIcon,
    color: 'from-success-400 to-success-600',
    bgColor: 'bg-success-500/10',
    category: 'salary'
  },
  'বিদ্যুৎ বিল': {
    icon: BoltIcon,
    color: 'from-warning-400 to-warning-600',
    bgColor: 'bg-warning-500/10',
    category: 'utility'
  },
  'মোবাইল রিচার্জ': {
    icon: DevicePhoneMobileIcon,
    color: 'from-info-400 to-info-600',
    bgColor: 'bg-info-500/10',
    category: 'mobile'
  },
  'অনলাইন ট্রান্সফার': {
    icon: ArrowUpRightIcon,
    color: 'from-primary-400 to-primary-600',
    bgColor: 'bg-primary-500/10',
    category: 'transfer'
  },
  'চেক জমা': {
    icon: BanknotesIcon,
    color: 'from-success-400 to-success-600',
    bgColor: 'bg-success-500/10',
    category: 'deposit'
  },
  'গ্যাস বিল': {
    icon: HomeIcon,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-500/10',
    category: 'utility'
  },
  'ইন্টারনেট বিল': {
    icon: BoltIcon,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-500/10',
    category: 'utility'
  },
  'ব্যাংক ট্রান্সফার': {
    icon: BuildingOfficeIcon,
    color: 'from-success-400 to-success-600',
    bgColor: 'bg-success-500/10',
    category: 'transfer'
  },
  'অনলাইন শপিং': {
    icon: ShoppingBagIcon,
    color: 'from-accent-400 to-accent-600',
    bgColor: 'bg-accent-500/10',
    category: 'shopping'
  },
  'পানির বিল': {
    icon: HomeIcon,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-500/10',
    category: 'utility'
  },
  'ফ্রিল্যান্সিং পেমেন্ট': {
    icon: BanknotesIcon,
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    category: 'income'
  },
  'রেস্টুরেন্ট বিল': {
    icon: ShoppingBagIcon,
    color: 'from-rose-400 to-rose-600',
    bgColor: 'bg-rose-500/10',
    category: 'food'
  },
  'ব্যাংক চার্জ': {
    icon: ExclamationTriangleIcon,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-500/10',
    category: 'fee'
  },
  'নববর্ষ বোনাস': {
    icon: GiftIcon,
    color: 'from-success-400 to-success-600',
    bgColor: 'bg-success-500/10',
    category: 'bonus'
  }
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'সব লেনদেন', labelEn: 'All Transactions' },
  { value: 'credit', label: 'জমা', labelEn: 'Credit' },
  { value: 'debit', label: 'খরচ', labelEn: 'Debit' },
  { value: 'transfer', label: 'ট্রান্সফার', labelEn: 'Transfer' },
  { value: 'utility', label: 'বিল পেমেন্ট', labelEn: 'Bill Payment' },
  { value: 'shopping', label: 'কেনাকাটা', labelEn: 'Shopping' }
];

const RecentActivity = ({ 
  transactions = [], 
  selectedCurrency = 'BDT',
  showAll = false,
  onViewAll = null 
}) => {
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const getTransactionIcon = (description) => {
    const categoryData = TRANSACTION_CATEGORIES[description];
    return categoryData || {
      icon: BanknotesIcon,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-500/10',
      category: 'other'
    };
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    
    const categoryData = getTransactionIcon(transaction.description);
    
    if (filter === 'credit') return transaction.type === 'credit';
    if (filter === 'debit') return transaction.type === 'debit';
    
    return categoryData.category === filter;
  });

  const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

  return (
    <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white/90">সাম্প্রতিক কার্যকলাপ</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
            {onViewAll && !showAll && (
              <button
                onClick={onViewAll}
                className="flex items-center space-x-2 text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors"
              >
                <span>সব দেখুন</span>
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in-up">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === option.value
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="p-6">
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BanknotesIcon className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60">কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                selectedCurrency={selectedCurrency}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionCard = ({ transaction, selectedCurrency, index }) => {
  const categoryData = TRANSACTION_CATEGORIES[transaction.description] || {
    icon: BanknotesIcon,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-500/10',
    category: 'other'
  };

  const IconComponent = categoryData.icon;
  const convertedAmount = convertCurrency(transaction.amount, 'BDT', selectedCurrency);

  return (
    <div 
      className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Transaction Icon */}
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${categoryData.color} shadow-glow group-hover:scale-110 transition-transform duration-300`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white/90 truncate">
          {transaction.description}
        </h4>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-sm text-white/60">
            {new Date(transaction.date).toLocaleDateString('bn-BD')}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            transaction.status === 'completed' 
              ? 'bg-success-500/20 text-success-300' 
              : 'bg-warning-500/20 text-warning-300'
          }`}>
            {transaction.status === 'completed' ? 'সম্পন্ন' : 'অপেক্ষমাণ'}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className={`font-semibold ${
          transaction.type === 'credit' 
            ? 'text-success-400' 
            : 'text-red-400'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}
          {formatCurrency(convertedAmount, selectedCurrency)}
        </p>
        {selectedCurrency !== 'BDT' && (
          <p className="text-xs text-white/50 mt-1">
            ≈ {formatCurrency(transaction.amount, 'BDT')}
          </p>
        )}
      </div>

      {/* Transaction Type Indicator */}
      <div className={`p-2 rounded-full ${
        transaction.type === 'credit' 
          ? 'bg-success-500/20' 
          : 'bg-red-500/20'
      }`}>
        {transaction.type === 'credit' ? (
          <ArrowDownLeftIcon className="w-4 h-4 text-success-400" />
        ) : (
          <ArrowUpRightIcon className="w-4 h-4 text-red-400" />
        )}
      </div>
    </div>
  );
};

export default RecentActivity;