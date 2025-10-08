import React, { useState, useEffect } from 'react';

interface DashboardMetrics {
  totalTransactions: number;
  pendingApprovals: number;
  flaggedTransactions: number;
  blockedAccounts: number;
  dailyVolume: number;
  successRate: number;
  averageProcessingTime: number;
  riskScore: number;
}

interface RecentActivity {
  id: string;
  type: 'approval' | 'flag' | 'block' | 'alert';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
}

interface TransactionTrend {
  date: string;
  volume: number;
  count: number;
  flags: number;
}

interface AlertSummary {
  id: string;
  type: 'fraud' | 'limit' | 'pattern' | 'system';
  title: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastOccurred: string;
}

const AdminTransactionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTransactions: 0,
    pendingApprovals: 0,
    flaggedTransactions: 0,
    blockedAccounts: 0,
    dailyVolume: 0,
    successRate: 0,
    averageProcessingTime: 0,
    riskScore: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [transactionTrends, setTransactionTrends] = useState<TransactionTrend[]>([]);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setRefreshing(true);
    
    // Simulate API calls with mock data
    setTimeout(() => {
      setMetrics({
        totalTransactions: 15847,
        pendingApprovals: 23,
        flaggedTransactions: 8,
        blockedAccounts: 3,
        dailyVolume: 2847392.50,
        successRate: 98.7,
        averageProcessingTime: 2.3,
        riskScore: 15
      });

      setRecentActivity([
        {
          id: '1',
          type: 'approval',
          description: 'Large fund transfer approved for John Doe ($50,000)',
          timestamp: '2 minutes ago',
          severity: 'medium',
          user: 'Admin User'
        },
        {
          id: '2',
          type: 'flag',
          description: 'Suspicious pattern detected in mobile top-ups',
          timestamp: '5 minutes ago',
          severity: 'high'
        },
        {
          id: '3',
          type: 'block',
          description: 'Account blocked due to multiple failed attempts',
          timestamp: '8 minutes ago',
          severity: 'critical',
          user: 'System'
        },
        {
          id: '4',
          type: 'alert',
          description: 'Daily transaction limit exceeded for 3 accounts',
          timestamp: '12 minutes ago',
          severity: 'medium'
        },
        {
          id: '5',
          type: 'approval',
          description: 'Bill payment batch processed (127 transactions)',
          timestamp: '15 minutes ago',
          severity: 'low',
          user: 'Admin User'
        }
      ]);

      setTransactionTrends([
        { date: '2024-01-15', volume: 2847392.50, count: 15847, flags: 8 },
        { date: '2024-01-14', volume: 2654123.75, count: 14523, flags: 12 },
        { date: '2024-01-13', volume: 2891456.25, count: 16234, flags: 6 },
        { date: '2024-01-12', volume: 2734567.80, count: 15678, flags: 9 },
        { date: '2024-01-11', volume: 2456789.90, count: 13456, flags: 15 },
        { date: '2024-01-10', volume: 2678901.45, count: 14789, flags: 7 },
        { date: '2024-01-09', volume: 2567890.30, count: 14123, flags: 11 }
      ]);

      setAlerts([
        {
          id: '1',
          type: 'fraud',
          title: 'Potential Fraud Patterns',
          count: 3,
          severity: 'high',
          lastOccurred: '5 minutes ago'
        },
        {
          id: '2',
          type: 'limit',
          title: 'Transaction Limit Breaches',
          count: 7,
          severity: 'medium',
          lastOccurred: '12 minutes ago'
        },
        {
          id: '3',
          type: 'pattern',
          title: 'Unusual Activity Patterns',
          count: 2,
          severity: 'medium',
          lastOccurred: '18 minutes ago'
        },
        {
          id: '4',
          type: 'system',
          title: 'System Performance Issues',
          count: 1,
          severity: 'low',
          lastOccurred: '1 hour ago'
        }
      ]);

      setRefreshing(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return '✅';
      case 'flag': return '🚩';
      case 'block': return '🚫';
      case 'alert': return '⚠️';
      default: return '📋';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Oversight Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and control center</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '24h' | '7d' | '30d')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalTransactions)}</p>
            </div>
            <div className="text-3xl">💳</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">↗ +12.5% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600">Requires attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Volume</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.dailyVolume)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">↗ +8.3% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">Excellent performance</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm text-gray-600">Flagged Transactions</p>
            <p className="text-xl font-bold text-red-600">{metrics.flaggedTransactions}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm text-gray-600">Blocked Accounts</p>
            <p className="text-xl font-bold text-red-600">{metrics.blockedAccounts}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Processing Time</p>
            <p className="text-xl font-bold text-blue-600">{metrics.averageProcessingTime}s</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm text-gray-600">Risk Score</p>
            <p className="text-xl font-bold text-yellow-600">{metrics.riskScore}/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600">Latest oversight actions and alerts</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="text-xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      {activity.user && (
                        <span className="text-xs text-blue-600">by {activity.user}</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                        {activity.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Activity →
              </button>
            </div>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
            <p className="text-gray-600">Current system alerts and warnings</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">Last: {alert.lastOccurred}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{alert.count}</span>
                    <p className="text-xs text-gray-500">incidents</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Manage Alerts →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Trends</h2>
          <p className="text-gray-600">Volume and flag patterns over time</p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-2">
            {transactionTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                  <div 
                    className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                    style={{ height: `${(trend.volume / 3000000) * 200}px` }}
                  ></div>
                  {trend.flags > 0 && (
                    <div 
                      className="bg-red-500 absolute bottom-0 w-full"
                      style={{ height: `${(trend.flags / 20) * 200}px` }}
                    ></div>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  <div>{new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-blue-600">{formatCurrency(trend.volume)}</div>
                  {trend.flags > 0 && <div className="text-red-600">{trend.flags} flags</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Transaction Volume</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Flagged Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600">Common oversight tasks and navigation</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-sm font-medium">Review Pending</div>
              <div className="text-xs text-gray-600">{metrics.pendingApprovals} items</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🚩</div>
              <div className="text-sm font-medium">Flagged Items</div>
              <div className="text-xs text-gray-600">{metrics.flaggedTransactions} items</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-sm font-medium">Blocked Accounts</div>
              <div className="text-xs text-gray-600">{metrics.blockedAccounts} accounts</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Generate Report</div>
              <div className="text-xs text-gray-600">Export data</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDashboard;