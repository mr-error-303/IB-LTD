import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import SystemStatistics from '../components/SystemStatistics';
import FinancialReports from '../components/FinancialReports';
import TransactionFiltering from '../components/TransactionFiltering';
import RealTimeActivityFeed from '../components/RealTimeActivityFeed';
import QuickActionsPanel from '../components/QuickActionsPanel';
import FinancialReportsSection from '../components/FinancialReportsSection';
import ServiceUsageReports from '../components/ServiceUsageReports';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [liveActivities, setLiveActivities] = useState([]);
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [realTimeStats, setRealTimeStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    todayTransactions: 0,
    todayTransactionValue: 0,
    pendingApprovals: 0,
    systemRevenue: 0,
    totalBalance: 0,
    totalTransactions: 0,
    pendingTransactions: 0
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setRealTimeStats(prev => ({
        ...prev,
        todayTransactions: prev.todayTransactions + Math.floor(Math.random() * 3),
        todayTransactionValue: prev.todayTransactionValue + (Math.random() * 1000),
        systemRevenue: prev.systemRevenue + (Math.random() * 100)
      }));

      // Add new live activity
      const activities = [
        'New user registration: John Doe',
        'Large transaction alert: $50,000 transfer',
        'System backup completed',
        'Security scan completed',
        'New loan application submitted',
        'User verification completed'
      ];
      
      const newActivity = {
        id: Date.now(),
        message: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(),
        type: Math.random() > 0.7 ? 'alert' : 'info'
      };

      setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setRealTimeStats(prev => ({ ...prev, ...statsData }));
        } else {
          // Simulate data if API is not available
          setRealTimeStats({
            totalUsers: 1247,
            activeUsers: 1156,
            pendingUsers: 23,
            suspendedUsers: 68,
            todayTransactions: 342,
            todayTransactionValue: 2847593,
            pendingApprovals: 15,
            systemRevenue: 45892,
            totalBalance: 15847293,
            totalTransactions: 8934,
            pendingTransactions: 23
          });
        }

        // Fetch users
        const usersResponse = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          // Simulate user data
          setUsers([
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', accountNumber: '1001', balance: 5000, status: 'active' },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', accountNumber: '1002', balance: 7500, status: 'active' },
            { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', accountNumber: '1003', balance: 2300, status: 'suspended' }
          ]);
        }

        // Fetch transactions
        const transactionsResponse = await fetch('/api/admin/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        } else {
          // Simulate transaction data
          setTransactions([
            { id: 1, user: 'John Doe', type: 'deposit', amount: 1000, createdAt: new Date(), status: 'completed' },
            { id: 2, user: 'Jane Smith', type: 'transfer', amount: 500, createdAt: new Date(), status: 'completed' },
            { id: 3, user: 'Bob Johnson', type: 'withdraw', amount: 200, createdAt: new Date(), status: 'pending' }
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Set simulated data on error
        setRealTimeStats({
          totalUsers: 1247,
          activeUsers: 1156,
          pendingUsers: 23,
          suspendedUsers: 68,
          todayTransactions: 342,
          todayTransactionValue: 2847593,
          pendingApprovals: 15,
          systemRevenue: 45892,
          totalBalance: 15847293,
          totalTransactions: 8934,
          pendingTransactions: 23
        });
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Filter users based on search term and status
  useEffect(() => {
    let filtered = Array.isArray(users) ? users : [];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.accountNumber?.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  // Filter transactions based on type
  useEffect(() => {
    let filtered = Array.isArray(transactions) ? transactions : [];
    
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === transactionFilter);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, transactionFilter]);

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    // Store original state for potential rollback
    const originalUsers = [...users];
    
    try {
      // Optimistic UI update - immediately change status
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      
      // Rollback optimistic update on error
      setUsers(originalUsers);
      
      // Show error message to user (you might want to add a toast notification here)
      alert('Failed to update user status. Please try again.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, transactions, and system overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">${realTimeStats.totalBalance?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeStats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeStats.pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'users', name: 'Users', icon: '👥' },
                { id: 'transactions', name: 'Transactions', icon: '💳' },
                { id: 'statistics', name: 'Statistics', icon: '📈' },
                { id: 'financial-reports', name: 'Financial Reports', icon: '📋' },
                { id: 'service-reports', name: 'Service Reports', icon: '🔍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {realTimeStats.totalUsers?.toLocaleString() || '0'}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">Increased by</span>
                              12%
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-green-600 font-medium">Active: {realTimeStats.activeUsers?.toLocaleString() || '0'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-yellow-600 font-medium">Pending: {realTimeStats.pendingUsers?.toLocaleString() || '0'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-red-600 font-medium">Suspended: {realTimeStats.suspendedUsers?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Today's Transactions */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Today's Transactions</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              ${realTimeStats.todayTransactionValue?.toLocaleString() || '0'}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">Increased by</span>
                              8%
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        Volume: {realTimeStats.todayTransactions?.toLocaleString() || '0'} transactions
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {realTimeStats.pendingApprovals?.toLocaleString() || '0'}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                              <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">Increased by</span>
                              3
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        Requires immediate attention
                      </div>
                    </div>
                  </div>

                  {/* System Revenue */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">System Revenue</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              ${realTimeStats.systemRevenue?.toLocaleString() || '0'}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">Increased by</span>
                              15%
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        Monthly target: 85% achieved
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Activity Feed */}
                  <div className="lg:col-span-2">
                    <RealTimeActivityFeed />
                  </div>

                  {/* Right Column - Quick Actions */}
                  <div className="lg:col-span-1">
                    <QuickActionsPanel 
                      onQuickSearch={(term) => setQuickSearchTerm(term)}
                      onNavigate={(path) => {
                        // In a real app, this would use React Router
                        console.log('Navigate to:', path);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Add New User
                  </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search Users
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name, email, or account number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:w-48">
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing {filteredUsers?.length || 0} of {users?.length || 0} users
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.accountNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${user.balance?.toLocaleString() || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleUserStatusToggle(user.id, user.status)}
                              className={`mr-2 px-3 py-1 rounded text-xs ${
                                user.status === 'active'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                  <div className="sm:w-48">
                    <label htmlFor="transaction-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Type
                    </label>
                    <select
                      id="transaction-filter"
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdraw">Withdrawals</option>
                      <option value="transfer">Transfers</option>
                      <option value="bill_payment">Bill Payments</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing {filteredTransactions?.length || 0} of {transactions?.length || 0} transactions
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(filteredTransactions) && filteredTransactions.map((transaction, index) => (
                        <tr key={transaction._id || transaction.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'deposit' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'withdraw' ? 'bg-red-100 text-red-800' :
                              transaction.type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                              transaction.type === 'bill_payment' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${transaction.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <SystemStatistics />
            )}

            {/* Financial Reports Tab */}
            {activeTab === 'financial-reports' && (
              <FinancialReportsSection />
            )}

            {/* Service Usage Reports Tab */}
            {activeTab === 'service-reports' && (
              <ServiceUsageReports />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Analytics & Reporting</h2>
                
                {/* Financial Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Transaction Volume</h3>
                    <div className="h-64">
                      <Line data={chartData.transactionVolume} options={chartOptions} />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                    <div className="h-64">
                      <Doughnut data={chartData.revenueBreakdown} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* User Growth Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64">
                      <Bar data={chartData.userGrowth} options={chartOptions} />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Usage</h3>
                    <div className="h-64">
                      <Bar data={chartData.serviceUsage} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Key Performance Indicators */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {((realTimeStats.activeUsers / realTimeStats.totalUsers) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">User Activation Rate</div>
                      <div className="text-xs text-green-600 mt-1">↑ 2.3% from last month</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${(realTimeStats.systemRevenue / realTimeStats.totalUsers).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue per User</div>
                      <div className="text-xs text-green-600 mt-1">↑ 5.7% from last month</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {(realTimeStats.todayTransactionCount / realTimeStats.activeUsers).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Transactions per User</div>
                      <div className="text-xs text-red-600 mt-1">↓ 1.2% from last month</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {((realTimeStats.pendingApprovals / realTimeStats.totalTransactions) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Approval Rate</div>
                      <div className="text-xs text-green-600 mt-1">↑ 0.8% from last month</div>
                    </div>
                  </div>
                </div>

                {/* Peak Usage Times */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Usage Analysis</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-4">Daily Peak Hours</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">9:00 AM - 11:00 AM</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">85%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">1:00 PM - 3:00 PM</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">72%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">7:00 PM - 9:00 PM</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{width: '68%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">68%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-4">Most Used Services</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Money Transfer</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">92%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bill Payment</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">78%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Account Balance</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-purple-600 h-2 rounded-full" style={{width: '65%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">65%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Loan Services</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">45%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Session Timeout</span>
                        <span className="text-sm text-gray-600">30 minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Failed Login Attempts</span>
                        <span className="text-sm text-gray-600">5 attempts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Maintenance</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Generate System Report
                      </button>
                      <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Schedule Maintenance
                      </button>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Backup Database
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;