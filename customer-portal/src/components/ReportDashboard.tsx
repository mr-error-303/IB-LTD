import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, DollarSign, Activity, Shield, Clock, AlertTriangle, CheckCircle, ArrowRight, Plus, Settings } from 'lucide-react';

// Interfaces for dashboard data
interface ReportSummary {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'compliance' | 'security';
  lastGenerated: string;
  frequency: string;
  status: 'up-to-date' | 'outdated' | 'generating';
  size: string;
}

interface QuickStat {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'export' | 'schedule' | 'template';
  status: 'success' | 'failed' | 'pending';
}

const ReportDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for report summaries
  const [reportSummaries] = useState<ReportSummary[]>([
    {
      id: '1',
      name: 'Daily Transaction Report',
      type: 'financial',
      lastGenerated: '2024-01-15T08:00:00Z',
      frequency: 'Daily',
      status: 'up-to-date',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'System Performance Report',
      type: 'operational',
      lastGenerated: '2024-01-14T23:00:00Z',
      frequency: 'Weekly',
      status: 'outdated',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Security Audit Report',
      type: 'security',
      lastGenerated: '2024-01-15T06:00:00Z',
      frequency: 'Monthly',
      status: 'up-to-date',
      size: '3.2 MB'
    },
    {
      id: '4',
      name: 'Compliance Report',
      type: 'compliance',
      lastGenerated: '2024-01-15T10:30:00Z',
      frequency: 'Quarterly',
      status: 'generating',
      size: 'Processing...'
    }
  ]);

  // Mock data for quick stats
  const [quickStats] = useState<QuickStat[]>([
    {
      id: '1',
      title: 'Total Reports Generated',
      value: '1,247',
      change: '+12.5%',
      changeType: 'increase',
      icon: FileText,
      color: 'blue'
    },
    {
      id: '2',
      title: 'Active Schedules',
      value: '23',
      change: '+3',
      changeType: 'increase',
      icon: Clock,
      color: 'green'
    },
    {
      id: '3',
      title: 'Export Templates',
      value: '45',
      change: '+8',
      changeType: 'increase',
      icon: Download,
      color: 'purple'
    },
    {
      id: '4',
      title: 'Storage Used',
      value: '2.8 GB',
      change: '+0.3 GB',
      changeType: 'increase',
      icon: BarChart3,
      color: 'orange'
    }
  ]);

  // Mock data for recent activities
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      action: 'Generated Financial Report - Q4 2023',
      user: 'John Smith',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'export',
      status: 'success'
    },
    {
      id: '2',
      action: 'Created new export template: Weekly Performance',
      user: 'Sarah Johnson',
      timestamp: '2024-01-15T13:15:00Z',
      type: 'template',
      status: 'success'
    },
    {
      id: '3',
      action: 'Scheduled daily transaction report',
      user: 'Mike Davis',
      timestamp: '2024-01-15T12:45:00Z',
      type: 'schedule',
      status: 'success'
    },
    {
      id: '4',
      action: 'Export failed: System Performance Report',
      user: 'System',
      timestamp: '2024-01-15T11:20:00Z',
      type: 'export',
      status: 'failed'
    },
    {
      id: '5',
      action: 'Generated Compliance Report - PCI DSS',
      user: 'Admin User',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'export',
      status: 'success'
    }
  ]);

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up-to-date':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'outdated':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'generating':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up-to-date':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'outdated':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'generating':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'text-green-600 bg-green-100';
      case 'operational':
        return 'text-blue-600 bg-blue-100';
      case 'security':
        return 'text-red-600 bg-red-100';
      case 'compliance':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'operational':
        return <Activity className="h-5 w-5 text-blue-600" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      case 'orange':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Dashboard</h1>
              <p className="text-gray-600">Comprehensive reporting system overview and quick access</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="lastQuarter">Last Quarter</option>
                <option value="lastYear">Last Year</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>New Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Categories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
                    <p className="text-sm text-gray-600">Transaction analysis, revenue tracking, and financial metrics</p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Daily Transaction Reports</h3>
                  <p className="text-sm text-gray-600 mb-3">Comprehensive daily transaction analysis and trends</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 2 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Revenue Analysis</h3>
                  <p className="text-sm text-gray-600 mb-3">Revenue trends, forecasting, and performance metrics</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 4 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">User Growth Metrics</h3>
                  <p className="text-sm text-gray-600 mb-3">User acquisition, retention, and growth analysis</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 6 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Loan Portfolio Performance</h3>
                  <p className="text-sm text-gray-600 mb-3">Loan performance, risk analysis, and portfolio health</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 8 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Operational Reports</h2>
                    <p className="text-sm text-gray-600">System performance, admin activities, and operational metrics</p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Admin Activity Logs</h3>
                  <p className="text-sm text-gray-600 mb-3">Administrative actions, user management, and system changes</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 1 hour ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">System Performance</h3>
                  <p className="text-sm text-gray-600 mb-3">Server metrics, response times, and system health</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 3 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Security Audit</h3>
                  <p className="text-sm text-gray-600 mb-3">Security events, threat analysis, and audit trails</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 5 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-2">Compliance Reports</h3>
                  <p className="text-sm text-gray-600 mb-3">Regulatory compliance, audit results, and compliance scores</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last updated: 12 hours ago</span>
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Export System */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Export & Automation</h2>
                    <p className="text-sm text-gray-600">Report templates, scheduled exports, and delivery management</p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span>Manage</span>
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-center">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Export Templates</h3>
                  <p className="text-sm text-gray-600 mb-2">45 templates</p>
                  <span className="text-xs text-blue-600">Manage Templates</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-center">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Scheduled Reports</h3>
                  <p className="text-sm text-gray-600 mb-2">23 active schedules</p>
                  <span className="text-xs text-green-600">View Schedules</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Export History</h3>
                  <p className="text-sm text-gray-600 mb-2">1,247 exports</p>
                  <span className="text-xs text-orange-600">View History</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Status</h3>
              <div className="space-y-4">
                {reportSummaries.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{report.name}</h4>
                        <p className="text-xs text-gray-500">{report.frequency} • {report.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.user}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                View All Activity
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Download className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Export Custom Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Schedule New Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Create Template</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">System Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;