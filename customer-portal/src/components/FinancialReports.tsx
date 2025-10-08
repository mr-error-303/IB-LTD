import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, CreditCard, PieChart, BarChart3, FileText } from 'lucide-react';

// Interfaces for financial data
interface DailyTransaction {
  id: string;
  date: string;
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  avgTransactionValue: number;
  topTransactionType: string;
}

interface RevenueData {
  id: string;
  period: string;
  totalRevenue: number;
  transactionFees: number;
  serviceFees: number;
  interestIncome: number;
  growth: number;
}

interface UserGrowthMetric {
  id: string;
  period: string;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  churnRate: number;
  totalUsers: number;
}

interface ServiceUsageStat {
  id: string;
  serviceName: string;
  usageCount: number;
  revenue: number;
  popularityRank: number;
  growthRate: number;
}

interface LoanPortfolioData {
  id: string;
  loanType: string;
  totalLoans: number;
  totalAmount: number;
  defaultRate: number;
  avgInterestRate: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
}

const FinancialReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily-transactions');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for daily transactions
  const [dailyTransactions] = useState<DailyTransaction[]>([
    {
      id: '1',
      date: '2024-01-15',
      totalTransactions: 1250,
      totalAmount: 2500000,
      successRate: 98.5,
      avgTransactionValue: 2000,
      topTransactionType: 'Fund Transfer'
    },
    {
      id: '2',
      date: '2024-01-14',
      totalTransactions: 1180,
      totalAmount: 2350000,
      successRate: 97.8,
      avgTransactionValue: 1992,
      topTransactionType: 'Bill Payment'
    },
    {
      id: '3',
      date: '2024-01-13',
      totalTransactions: 1320,
      totalAmount: 2680000,
      successRate: 98.9,
      avgTransactionValue: 2030,
      topTransactionType: 'Fund Transfer'
    }
  ]);

  // Mock data for revenue analysis
  const [revenueData] = useState<RevenueData[]>([
    {
      id: '1',
      period: 'January 2024',
      totalRevenue: 125000,
      transactionFees: 75000,
      serviceFees: 30000,
      interestIncome: 20000,
      growth: 12.5
    },
    {
      id: '2',
      period: 'December 2023',
      totalRevenue: 118000,
      transactionFees: 70000,
      serviceFees: 28000,
      interestIncome: 20000,
      growth: 8.3
    },
    {
      id: '3',
      period: 'November 2023',
      totalRevenue: 109000,
      transactionFees: 65000,
      serviceFees: 26000,
      interestIncome: 18000,
      growth: 5.2
    }
  ]);

  // Mock data for user growth metrics
  const [userGrowthData] = useState<UserGrowthMetric[]>([
    {
      id: '1',
      period: 'January 2024',
      newUsers: 450,
      activeUsers: 8500,
      retentionRate: 85.2,
      churnRate: 2.1,
      totalUsers: 12500
    },
    {
      id: '2',
      period: 'December 2023',
      newUsers: 380,
      activeUsers: 8200,
      retentionRate: 83.8,
      churnRate: 2.3,
      totalUsers: 12050
    },
    {
      id: '3',
      period: 'November 2023',
      newUsers: 420,
      activeUsers: 7950,
      retentionRate: 84.5,
      churnRate: 2.0,
      totalUsers: 11670
    }
  ]);

  // Mock data for service usage statistics
  const [serviceUsageData] = useState<ServiceUsageStat[]>([
    {
      id: '1',
      serviceName: 'Fund Transfer',
      usageCount: 15420,
      revenue: 77100,
      popularityRank: 1,
      growthRate: 15.2
    },
    {
      id: '2',
      serviceName: 'Bill Payment',
      usageCount: 12350,
      revenue: 61750,
      popularityRank: 2,
      growthRate: 12.8
    },
    {
      id: '3',
      serviceName: 'Mobile Top-up',
      usageCount: 8920,
      revenue: 26760,
      popularityRank: 3,
      growthRate: 8.5
    },
    {
      id: '4',
      serviceName: 'Cash Withdrawal',
      usageCount: 6780,
      revenue: 20340,
      popularityRank: 4,
      growthRate: 5.2
    }
  ]);

  // Mock data for loan portfolio performance
  const [loanPortfolioData] = useState<LoanPortfolioData[]>([
    {
      id: '1',
      loanType: 'Personal Loans',
      totalLoans: 1250,
      totalAmount: 125000000,
      defaultRate: 2.1,
      avgInterestRate: 12.5,
      performance: 'excellent'
    },
    {
      id: '2',
      loanType: 'Business Loans',
      totalLoans: 680,
      totalAmount: 340000000,
      defaultRate: 1.8,
      avgInterestRate: 10.2,
      performance: 'excellent'
    },
    {
      id: '3',
      loanType: 'Auto Loans',
      totalLoans: 920,
      totalAmount: 184000000,
      defaultRate: 3.2,
      avgInterestRate: 8.5,
      performance: 'good'
    },
    {
      id: '4',
      loanType: 'Home Loans',
      totalLoans: 450,
      totalAmount: 450000000,
      defaultRate: 1.2,
      avgInterestRate: 7.8,
      performance: 'excellent'
    }
  ]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      alert(`Exporting ${activeTab} report as ${format.toUpperCase()}...`);
    }, 2000);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const tabs = [
    { id: 'daily-transactions', name: 'Daily Transactions', icon: BarChart3 },
    { id: 'revenue-analysis', name: 'Revenue Analysis', icon: TrendingUp },
    { id: 'user-growth', name: 'User Growth', icon: Users },
    { id: 'service-usage', name: 'Service Usage', icon: PieChart },
    { id: 'loan-portfolio', name: 'Loan Portfolio', icon: CreditCard }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive financial analytics and reporting dashboard</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'daily-transactions' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Transaction Reports</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(transaction.totalTransactions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transaction.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.successRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transaction.avgTransactionValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.topTransactionType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'revenue-analysis' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(125000)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-900">+12.5%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Transaction Fees</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(75000)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Service Fees</p>
                      <p className="text-2xl font-bold text-orange-900">{formatCurrency(30000)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Income</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.map((revenue) => (
                      <tr key={revenue.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {revenue.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(revenue.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(revenue.transactionFees)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(revenue.serviceFees)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(revenue.interestIncome)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            revenue.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {revenue.growth > 0 ? '+' : ''}{revenue.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'user-growth' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth Metrics</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userGrowthData.map((metric) => (
                      <tr key={metric.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {metric.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(metric.newUsers)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(metric.activeUsers)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {metric.retentionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {metric.churnRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(metric.totalUsers)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'service-usage' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Usage Statistics</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularity Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceUsageData.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.serviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(service.usageCount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(service.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{service.popularityRank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.growthRate > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.growthRate > 0 ? '+' : ''}{service.growthRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'loan-portfolio' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Portfolio Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Loans</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Interest Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loanPortfolioData.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.loanType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(loan.totalLoans)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(loan.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            loan.defaultRate < 2 ? 'bg-green-100 text-green-800' : 
                            loan.defaultRate < 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {loan.defaultRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.avgInterestRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(loan.performance)}`}>
                            {loan.performance.charAt(0).toUpperCase() + loan.performance.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;