import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  monthlyGrowth: number;
  transactionGrowth: number;
  topTransactionTypes: { type: string; count: number; percentage: number }[];
  monthlyTransactions: { month: string; count: number; volume: number }[];
  userRegistrations: { month: string; count: number }[];
}

const AdminAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalyticsData = async () => {
      try {
        // Mock data - replace with actual API call
        setTimeout(() => {
          const mockData: AnalyticsData = {
            totalUsers: 15420,
            activeUsers: 8750,
            totalTransactions: 45680,
            totalVolume: 2850000000,
            monthlyGrowth: 12.5,
            transactionGrowth: 18.3,
            topTransactionTypes: [
              { type: 'Transfer', count: 18500, percentage: 40.5 },
              { type: 'Bill Payment', count: 12300, percentage: 26.9 },
              { type: 'Withdrawal', count: 8900, percentage: 19.5 },
              { type: 'Deposit', count: 5980, percentage: 13.1 }
            ],
            monthlyTransactions: [
              { month: 'Jan', count: 3200, volume: 180000000 },
              { month: 'Feb', count: 3450, volume: 195000000 },
              { month: 'Mar', count: 3800, volume: 220000000 },
              { month: 'Apr', count: 4100, volume: 245000000 },
              { month: 'May', count: 4350, volume: 265000000 },
              { month: 'Jun', count: 4680, volume: 285000000 }
            ],
            userRegistrations: [
              { month: 'Jan', count: 450 },
              { month: 'Feb', count: 520 },
              { month: 'Mar', count: 680 },
              { month: 'Apr', count: 750 },
              { month: 'May', count: 820 },
              { month: 'Jun', count: 920 }
            ]
          };
          setAnalyticsData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedPeriod]);

  const StatCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'positive' | 'negative' }> = ({ 
    title, value, change, changeType 
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? '+' : ''}{change}
          </span>
        )}
      </div>
    </div>
  );

  const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          change={`${analyticsData.monthlyGrowth}%`}
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={analyticsData.activeUsers.toLocaleString()}
          change="8.2%"
          changeType="positive"
        />
        <StatCard
          title="Total Transactions"
          value={analyticsData.totalTransactions.toLocaleString()}
          change={`${analyticsData.transactionGrowth}%`}
          changeType="positive"
        />
        <StatCard
          title="Transaction Volume"
          value={`৳${(analyticsData.totalVolume / 1000000).toFixed(1)}M`}
          change="15.7%"
          changeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Types */}
        <ChartCard title="Transaction Types Distribution">
          <div className="space-y-4">
            {analyticsData.topTransactionTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{type.count.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{type.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Monthly Transactions */}
        <ChartCard title="Monthly Transaction Trends">
          <div className="space-y-3">
            {analyticsData.monthlyTransactions.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{month.count.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">৳{(month.volume / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Registrations */}
        <ChartCard title="User Registrations">
          <div className="space-y-3">
            {analyticsData.userRegistrations.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <span className="text-sm font-semibold text-gray-900">{month.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* System Performance */}
        <ChartCard title="System Performance">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-green-600">99.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Response Time</span>
              <span className="text-sm font-semibold text-blue-600">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed Transactions</span>
              <span className="text-sm font-semibold text-red-600">0.8%</span>
            </div>
          </div>
        </ChartCard>

        {/* Top Performing Features */}
        <ChartCard title="Feature Usage">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Money Transfer</span>
              <span className="text-sm font-semibold text-gray-900">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bill Payment</span>
              <span className="text-sm font-semibold text-gray-900">72%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Balance</span>
              <span className="text-sm font-semibold text-gray-900">95%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transaction History</span>
              <span className="text-sm font-semibold text-gray-900">68%</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Detailed Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            User Activity Report
          </button>
          <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Financial Summary Report
          </button>
          <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Security Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;