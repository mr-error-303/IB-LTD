import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { bankingService } from '../services/bankingService';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const transactionsData = await bankingService.getTransactions(user.accountNumber);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(dateRange.to)
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, searchTerm, filterType, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // Simple CSV export functionality
    const csvContent = [
      [t('date') || 'তারিখ', t('description') || 'বিবরণ', t('type') || 'ধরন', t('amount') || 'পরিমাণ', t('transactionId') || 'লেনদেন ID'],
      ...filteredTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.description,
        transaction.type === 'credit' ? (t('credit') || 'জমা') : (t('debit') || 'খরচ'),
        transaction.amount.toString(),
        transaction.id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('transactionDetails') || 'লেনদেনের বিস্তারিত'}
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  selectedTransaction.type === 'credit' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {selectedTransaction.type === 'credit' ? (
                    <ArrowDownLeft className="w-6 h-6" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedTransaction.description}</p>
                  <p className={`text-lg font-bold ${
                    selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('transactionId') || 'লেনদেন ID'}:</span>
                  <span className="font-mono text-sm">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('date') || 'তারিখ'}:</span>
                  <span>{formatDate(selectedTransaction.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('type') || 'ধরন'}:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    selectedTransaction.type === 'credit' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.type === 'credit' ? (t('credit') || 'জমা') : (t('debit') || 'খরচ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('transactionHistory') || 'লেনদেনের ইতিহাস'}
              </h1>
              <p className="text-gray-500">
                {t('transactionHistoryDesc') || 'আপনার সকল লেনদেনের বিস্তারিত'}
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('download') || 'ডাউনলোড'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder') || 'খুঁজুন...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('allTypes') || 'সব ধরনের'}</option>
              <option value="credit">{t('credit') || 'জমা'}</option>
              <option value="debit">{t('debit') || 'খরচ'}</option>
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              placeholder={t('fromDate') || 'শুরুর তারিখ'}
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              placeholder={t('toDate') || 'শেষের তারিখ'}
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterType !== 'all' || dateRange.from || dateRange.to) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setDateRange({ from: '', to: '' });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('clearFilters') || 'সব ফিল্টার মুছুন'}
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('transactionList') || 'লেনদেনের তালিকা'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('showingResults') || 'দেখানো হচ্ছে'} {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} {t('of') || 'এর মধ্যে'} {filteredTransactions.length} {t('transactions') || 'লেনদেন'}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.date)} • ID: {transaction.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {transaction.type === 'credit' ? (t('credit') || 'জমা') : (t('debit') || 'খরচ')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <History className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('noTransactions') || 'কোন লেনদেন পাওয়া যায়নি'}
              </h3>
              <p className="text-gray-500">
                {t('noTransactionsMessage') || 'আপনার ফিল্টার অনুযায়ী কোন লেনদেন খুঁজে পাওয়া যায়নি।'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('showingResults') || 'দেখানো হচ্ছে'} {startIndex + 1} {t('to') || 'থেকে'} {Math.min(endIndex, filteredTransactions.length)} {t('of') || 'এর মধ্যে'} {filteredTransactions.length} {t('results') || 'ফলাফল'}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} {t('of') || 'এর'} {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('transactionSummary') || 'লেনদেনের সারসংক্ষেপ'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">{t('totalCredit') || 'মোট জমা'}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.type === 'credit')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
                <ArrowUpRight className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">{t('totalDebit') || 'মোট খরচ'}</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.type === 'debit')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">{t('netBalance') || 'নেট ব্যালেন্স'}</p>
              <p className={`text-2xl font-bold ${
                filteredTransactions
                  .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0) >= 0
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(
                  filteredTransactions
                    .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
