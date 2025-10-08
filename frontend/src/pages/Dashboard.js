import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    accounts: [],
    recentTransactions: [],
    transactionStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false); // Balance hidden by default

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError('');
      } else {
        setRefreshing(true);
      }

      // Use the correct backend endpoint that provides all dashboard data
      const response = await axios.get('/api/user/dashboard', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const { data } = response.data;
        
        const newData = {
          accounts: [data.account], // Backend returns single account object
          recentTransactions: data.recentTransactions || [],
          transactionStats: data.statistics?.transactionStats || {},
          user: data.user,
          statistics: data.statistics
        };

        setDashboardData(newData);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.data.message || 'Failed to load dashboard data');
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      
      if (retryCount < 3) {
        setError(`Connection error. Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        
        // Retry after delay
        setTimeout(() => {
          fetchDashboardData(true);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '**** **** ****';
    const str = accountNumber.toString();
    return `**** **** ${str.slice(-4)}`;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      transfer: '🔄',
      payment: '💳',
      recharge: '📱'
    };
    return icons[type] || '💼';
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'text-green-600',
      withdrawal: 'text-red-600',
      transfer: 'text-blue-600',
      payment: 'text-purple-600',
      recharge: 'text-orange-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchDashboardData();
  };

  // Get primary account
  const primaryAccount = dashboardData.accounts.length > 0 ? dashboardData.accounts[0] : null;

  // Filter transactions
  const filteredTransactions = dashboardData.recentTransactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading && !refreshing && retryCount >= 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8">
          <div className="alert alert-error">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Connection Error</h3>
                <p>{error}</p>
              </div>
              <button 
                onClick={() => {
                  setRetryCount(0);
                  fetchDashboardData();
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="mobile-container py-responsive">
        {/* Error Banner */}
        {error && (refreshing || retryCount < 3) && (
          <div className="mb-6 alert alert-warning fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-warning-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-warning-800">{error}</span>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="slide-up">
            <h1 className="text-3xl font-bold text-secondary-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-secondary-600 mt-1">
              Here's your account overview for today
            </p>
          </div>
        </div>

        {/* Account Summary Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-elevated p-6 mb-6 sm:mb-8 text-white slide-up">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium opacity-90">Current Balance</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
                >
                  <svg 
                    className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
              </div>
              <p className="text-3xl font-bold mt-2 cursor-pointer select-none" onClick={toggleBalanceVisibility}>
                {primaryAccount ? (
                  balanceVisible ? formatCurrency(primaryAccount.balance) : '৳ ****.**'
                ) : 'Loading...'}
                {primaryAccount && (
                  <span className="ml-2 text-sm opacity-75">
                    {balanceVisible ? '👁️' : '👁️‍🗨️'}
                  </span>
                )}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs opacity-90">Account Number</p>
              <p className="text-sm font-mono mt-1">
                {maskAccountNumber(primaryAccount?.accountNumber)}
              </p>
            </div>
          </div>
          
          <div className="border-t border-primary-400 pt-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs opacity-90">Branch</p>
                <p className="text-sm font-medium">{primaryAccount?.branch || 'Main Branch'}</p>
              </div>
              <div>
                <p className="text-xs opacity-90">Account Type</p>
                <p className="text-sm font-medium">{primaryAccount?.accountType || 'Savings'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
            <Link to="/add-money" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">💰</div>
              <p className="text-sm font-medium text-secondary-700">Add Money</p>
            </Link>
            
            <Link to="/transfer" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">💸</div>
              <p className="text-sm font-medium text-secondary-700">Transfer Money</p>
            </Link>
            
            <Link to="/mobile-recharge" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📱</div>
              <p className="text-sm font-medium text-secondary-700">Mobile Recharge</p>
            </Link>
            
            <Link to="/npsb-transfer" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">🏦</div>
              <p className="text-sm font-medium text-secondary-700">NPSB Transfer</p>
            </Link>
            
            <Link to="/beftn-transfer" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">🔄</div>
              <p className="text-sm font-medium text-secondary-700">BEFTN Transfer</p>
            </Link>
            
            <Link to="/mobile-wallet-transfer" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">💳</div>
              <p className="text-sm font-medium text-secondary-700">Mobile Wallet Transfer</p>
            </Link>
            
            <Link to="/qr-payment" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📲</div>
              <p className="text-sm font-medium text-secondary-700">QR Pay</p>
            </Link>

            <Link to="/transactions" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</div>
              <p className="text-sm font-medium text-secondary-700">Transactions</p>
            </Link>

            <Link to="/beneficiaries" className="card hover:shadow-card-hover transition-all duration-200 p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">👥</div>
              <p className="text-sm font-medium text-secondary-700">Beneficiaries</p>
            </Link>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card-elevated">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-secondary-900">Recent Transactions</h3>
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                {showFullHistory ? 'Show Less' : 'View Full History'}
              </button>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-4">
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
                <option value="payment">Payments</option>
                <option value="recharge">Recharges</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {(showFullHistory ? filteredTransactions : filteredTransactions.slice(0, 5)).map((transaction, index) => (
                  <div key={transaction._id || transaction.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {transaction.status || 'completed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        {dashboardData.transactionStats && Object.keys(dashboardData.transactionStats).length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📈</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.transactionStats.monthlyIncome || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📉</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(dashboardData.transactionStats.monthlyExpenses || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">💼</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.transactionStats.totalTransactions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;