import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import UserActivityMonitor from '../components/admin/UserActivityMonitor';
import UserControlSystem from '../components/admin/UserControlSystem';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  securityAlerts: number;
  pendingApprovals: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  totalLoanApplications: number;
  pendingLoanApplications: number;
  approvedLoans: number;
  totalLoanAmount: number;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'pending';
}

interface PendingTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'transfer' | 'withdrawal' | 'deposit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending_approval';
}

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
    securityAlerts: 0,
    pendingApprovals: 0,
    systemHealth: 'excellent',
    totalLoanApplications: 0,
    pendingLoanApplications: 0,
    approvedLoans: 0,
    totalLoanAmount: 0
  });
  
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls to fetch real-time data
      setTimeout(() => {
        // Mock stats with more comprehensive data
        setStats({
          totalUsers: 1250,
          activeUsers: 890,
          totalTransactions: 15420,
          totalAmount: 2450000,
          pendingTransactions: 23,
          securityAlerts: 3,
          pendingApprovals: 12,
          systemHealth: 'excellent',
          totalLoanApplications: 156,
          pendingLoanApplications: 23,
          approvedLoans: 89,
          totalLoanAmount: 45000000
        });

        // Mock user activities
        setUserActivities([
          {
            id: 'ACT001',
            userId: 'USER001',
            userName: 'John Doe',
            userEmail: 'john.doe@email.com',
            action: 'Login',
            details: 'Successful login from mobile app',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
            status: 'success'
          },
          {
            id: 'ACT002',
            userId: 'USER002',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@email.com',
            action: 'Transfer',
            details: 'Initiated transfer of ৳25,000',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.101',
            status: 'pending'
          },
          {
            id: 'ACT003',
            userId: 'USER003',
            userName: 'Bob Johnson',
            userEmail: 'bob.johnson@email.com',
            action: 'Failed Login',
            details: 'Multiple failed login attempts',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.102',
            status: 'failed'
          }
        ]);

        // Mock pending transactions
        setPendingTransactions([
          {
            id: 'TXN001',
            userId: 'USER002',
            userName: 'Jane Smith',
            type: 'transfer',
            amount: 25000,
            description: 'Transfer to savings account',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            status: 'pending_approval'
          },
          {
            id: 'TXN002',
            userId: 'USER004',
            userName: 'Alice Brown',
            type: 'withdrawal',
            amount: 50000,
            description: 'ATM withdrawal',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'pending_approval'
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      const appError = handleError(error, 'AdminDashboard');
      log.error('Error fetching dashboard data', appError, 'AdminDashboard');
      showError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingTransactions(prev => 
        prev.filter(txn => txn.id !== transactionId)
      );
      
      setStats(prev => ({
        ...prev,
        pendingTransactions: prev.pendingTransactions - 1
      }));
      
      showSuccess('Transaction approved successfully');
    } catch (error) {
      showError('Failed to approve transaction');
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingTransactions(prev => 
        prev.filter(txn => txn.id !== transactionId)
      );
      
      setStats(prev => ({
        ...prev,
        pendingTransactions: prev.pendingTransactions - 1
      }));
      
      showSuccess('Transaction rejected');
    } catch (error) {
      showError('Failed to reject transaction');
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, trend, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} 
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <span className="font-medium">{trend}</span> from last month
            </p>
          )}
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'activity-monitor', label: 'Activity Monitor', icon: '👁️' },
              { id: 'user-control', label: 'User Control', icon: '🎛️' },
              { id: 'activity-logs', label: 'Activity Logs', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Welcome Section with System Health */}
           <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
             <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h1>
                 <p className="text-blue-100">Here's what's happening with your banking system today.</p>
               </div>
               <div className="text-right">
                 <div className="flex items-center space-x-2 mb-2">
                   <div className={`w-3 h-3 rounded-full ${
                     stats.systemHealth === 'excellent' ? 'bg-green-400' :
                     stats.systemHealth === 'good' ? 'bg-yellow-400' :
                     stats.systemHealth === 'warning' ? 'bg-orange-400' : 'bg-red-400'
                   }`}></div>
                   <span className="text-sm">System Status: {stats.systemHealth}</span>
                 </div>
                 <div className="text-sm text-blue-100">
                   Last updated: {new Date().toLocaleTimeString()}
                 </div>
               </div>
             </div>
           </div>

           {/* Time Range Selector */}
           <div className="flex justify-end">
             <select
               value={selectedTimeRange}
               onChange={(e) => setSelectedTimeRange(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="1h">Last Hour</option>
               <option value="24h">Last 24 Hours</option>
               <option value="7d">Last 7 Days</option>
               <option value="30d">Last 30 Days</option>
             </select>
           </div>

          {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon="👥"
              color="#3B82F6"
              trend="+12%"
              onClick={() => navigate('/admin/users')}
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon="🟢"
              color="#10B981"
              trend="+8%"
            />
            <StatCard
              title="Pending Users"
              value={stats.pendingApprovals}
              icon="⏳"
              color="#F59E0B"
              onClick={() => navigate('/admin/approval')}
            />
            <StatCard
              title="Banned Users"
              value="12"
              icon="🚫"
              color="#DC2626"
              onClick={() => navigate('/admin/users')}
            />
            <StatCard
              title="Pending Registrations"
              value={stats.pendingApprovals}
              icon="📝"
              color="#F59E0B"
              onClick={() => navigate('/admin/approval')}
            />
            <StatCard
              title="Pending Loans"
              value={stats.pendingLoanApplications}
              icon="🏦"
              color="#8B5CF6"
              onClick={() => navigate('/admin/panel')}
            />
            <StatCard
              title="Pending Transactions"
              value={stats.pendingTransactions}
              icon="💳"
              color="#F59E0B"
              onClick={() => navigate('/admin/transactions/pending')}
            />
            <StatCard
              title="Today's Transaction Volume"
              value={`৳${stats.totalAmount.toLocaleString()}`}
              icon="💰"
              color="#10B981"
              trend="+22%"
            />
            <StatCard
              title="System Revenue"
              value={`৳${(stats.totalAmount * 0.02).toLocaleString()}`}
              icon="💎"
              color="#8B5CF6"
              trend="+18%"
            />
            <StatCard
              title="Security Alerts"
              value={stats.securityAlerts}
              icon="🚨"
              color="#DC2626"
              onClick={() => navigate('/admin/security')}
            />
            <StatCard
              title="System Health"
              value={stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
              icon="🔧"
              color="#6366F1"
            />
            <StatCard
              title="Total Transactions"
              value={stats.totalTransactions.toLocaleString()}
              icon="📊"
              color="#8B5CF6"
              trend="+15%"
              onClick={() => navigate('/admin/transactions')}
            />
          </div>

          {/* Real-time User Activity Monitor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Real-time User Activity</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{activity.userName}</span>
                        <span className="text-sm text-gray-500">({activity.userEmail})</span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.action}: {activity.details}</p>
                      <p className="text-xs text-gray-500">IP: {activity.ipAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Approval System */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Transaction Approvals</h2>
            {pendingTransactions.length > 0 ? (
              <div className="space-y-3">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {transaction.userName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.userName}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - ৳{transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatTimeAgo(transaction.timestamp)}</span>
                      <button
                        onClick={() => approveTransaction(transaction.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectTransaction(transaction.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No pending transactions requiring approval</p>
              </div>
            )}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/admin/users')}
                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">👤</span>
                <span className="font-medium text-blue-700">Manage Users</span>
              </button>
              <button 
                onClick={() => navigate('/admin/transactions')}
                className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">💸</span>
                <span className="font-medium text-green-700">View Transactions</span>
              </button>
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">📊</span>
                <span className="font-medium text-purple-700">Analytics</span>
              </button>
              <button 
                onClick={() => navigate('/admin/security')}
                className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">🔒</span>
                <span className="font-medium text-red-700">Security</span>
              </button>
              <button 
                onClick={() => navigate('/admin/approval')}
                className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">✅</span>
                <span className="font-medium text-yellow-700">User Approvals</span>
              </button>
              <button 
                onClick={() => navigate('/admin/settings')}
                className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">⚙️</span>
                <span className="font-medium text-gray-700">Settings</span>
              </button>
              <button 
                onClick={() => navigate('/admin/panel')}
                className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">🏦</span>
                <span className="font-medium text-orange-700">Loan Management</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                <span className="text-2xl mr-3">💰</span>
                <span className="font-medium text-indigo-700">Balance Management</span>
              </button>
              <button 
                onClick={() => setActiveTab('activity-logs')}
                className="flex items-center justify-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-3">📋</span>
                <span className="font-medium text-pink-700">Audit Logs</span>
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'activity-monitor' && <UserActivityMonitor />}
      {activeTab === 'user-control' && <UserControlSystem />}
      {activeTab === 'activity-logs' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Activity Logs</h2>
          <p className="text-gray-600 mb-4">
            View detailed activity logs with advanced filtering and real-time monitoring capabilities.
          </p>
          <button
            onClick={() => navigate('/admin/activity-logs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Activity Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;