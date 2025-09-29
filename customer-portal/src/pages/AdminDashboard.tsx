import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  securityAlerts: number;
}

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
    securityAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Mock data - replace with actual API call
        setTimeout(() => {
          setStats({
            totalUsers: 1250,
            activeUsers: 890,
            totalTransactions: 15420,
            totalAmount: 2450000,
            pendingTransactions: 23,
            securityAlerts: 3
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h1>
        <p className="text-blue-100">Here's what's happening with your banking system today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          color="#3B82F6"
          trend="+12%"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon="🟢"
          color="#10B981"
          trend="+8%"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon="💳"
          color="#8B5CF6"
          trend="+15%"
        />
        <StatCard
          title="Total Amount"
          value={`৳${stats.totalAmount.toLocaleString()}`}
          icon="💰"
          color="#F59E0B"
          trend="+22%"
        />
        <StatCard
          title="Pending Transactions"
          value={stats.pendingTransactions}
          icon="⏳"
          color="#EF4444"
        />
        <StatCard
          title="Security Alerts"
          value={stats.securityAlerts}
          icon="🚨"
          color="#DC2626"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <span className="text-2xl mr-3">👤</span>
            <span className="font-medium text-blue-700">Manage Users</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <span className="text-2xl mr-3">💸</span>
            <span className="font-medium text-green-700">View Transactions</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <span className="text-2xl mr-3">📊</span>
            <span className="font-medium text-purple-700">Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <span className="text-2xl mr-3">🔒</span>
            <span className="font-medium text-red-700">Security</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">New user registration: john.doe@email.com</span>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Transaction completed: ৳50,000</span>
            </div>
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Security alert: Multiple login attempts</span>
            </div>
            <span className="text-xs text-gray-500">10 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;