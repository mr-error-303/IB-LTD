import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Bell,
  Shield,
  DollarSign,
  Smartphone,
  Building,
  MapPin
} from 'lucide-react';

interface ServiceStats {
  id: string;
  name: string;
  activeTransactions: number;
  totalTransactions: number;
  successRate: number;
  failedTransactions: number;
  avgResponseTime: number;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdated: string;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  service: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  ipAddress: string;
  location: string;
  suspicious: boolean;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const ServiceMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'activity' | 'alerts'>('overview');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data for service statistics
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([
    {
      id: 'fund-transfer',
      name: 'Fund Transfer',
      activeTransactions: 45,
      totalTransactions: 1247,
      successRate: 98.5,
      failedTransactions: 18,
      avgResponseTime: 1.2,
      status: 'online',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'bill-payment',
      name: 'Bill Payment',
      activeTransactions: 23,
      totalTransactions: 892,
      successRate: 97.8,
      failedTransactions: 20,
      avgResponseTime: 2.1,
      status: 'online',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'mobile-topup',
      name: 'Mobile Top-up',
      activeTransactions: 67,
      totalTransactions: 2156,
      successRate: 99.2,
      failedTransactions: 17,
      avgResponseTime: 0.8,
      status: 'online',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'cash-withdrawal',
      name: 'Cash Withdrawal',
      activeTransactions: 12,
      totalTransactions: 456,
      successRate: 96.5,
      failedTransactions: 16,
      avgResponseTime: 3.2,
      status: 'maintenance',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'loan-management',
      name: 'Loan Management',
      activeTransactions: 8,
      totalTransactions: 234,
      successRate: 99.1,
      failedTransactions: 2,
      avgResponseTime: 4.5,
      status: 'online',
      lastUpdated: new Date().toISOString()
    }
  ]);

  // Mock data for user activities
  const [userActivities, setUserActivities] = useState<UserActivity[]>([
    {
      id: '1',
      userId: 'USR001',
      userName: 'John Doe',
      action: 'Fund Transfer',
      service: 'fund-transfer',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'success',
      ipAddress: '192.168.1.100',
      location: 'Dhaka, Bangladesh',
      suspicious: false
    },
    {
      id: '2',
      userId: 'USR002',
      userName: 'Jane Smith',
      action: 'Bill Payment',
      service: 'bill-payment',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'failed',
      ipAddress: '203.112.45.67',
      location: 'Chittagong, Bangladesh',
      suspicious: true
    },
    {
      id: '3',
      userId: 'USR003',
      userName: 'Bob Johnson',
      action: 'Mobile Top-up',
      service: 'mobile-topup',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'success',
      ipAddress: '192.168.1.105',
      location: 'Sylhet, Bangladesh',
      suspicious: false
    }
  ]);

  // Mock data for alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'error',
      service: 'cash-withdrawal',
      message: 'Cash Withdrawal service experiencing high failure rate (15%)',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'warning',
      service: 'fund-transfer',
      message: 'Unusual spike in fund transfer requests from single IP',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      service: 'system',
      message: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      resolved: true
    }
  ]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setServiceStats(prev => prev.map(service => ({
        ...service,
        activeTransactions: Math.max(0, service.activeTransactions + Math.floor(Math.random() * 10) - 5),
        totalTransactions: service.totalTransactions + Math.floor(Math.random() * 3),
        lastUpdated: new Date().toISOString()
      })));
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'fund-transfer': return <CreditCard className="h-6 w-6" />;
      case 'bill-payment': return <Building className="h-6 w-6" />;
      case 'mobile-topup': return <Smartphone className="h-6 w-6" />;
      case 'cash-withdrawal': return <DollarSign className="h-6 w-6" />;
      case 'loan-management': return <Shield className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  const totalActiveTransactions = serviceStats.reduce((sum, service) => sum + service.activeTransactions, 0);
  const totalTransactions = serviceStats.reduce((sum, service) => sum + service.totalTransactions, 0);
  const averageSuccessRate = serviceStats.reduce((sum, service) => sum + service.successRate, 0) / serviceStats.length;
  const totalFailedTransactions = serviceStats.reduce((sum, service) => sum + service.failedTransactions, 0);
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved).length;
  const suspiciousActivities = userActivities.filter(activity => activity.suspicious).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Monitoring Dashboard</h1>
              <p className="text-gray-600">Real-time monitoring of all banking services and user activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    autoRefresh 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </button>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveTransactions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+12% from last hour</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+8% from yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{averageSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+0.3% improvement</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalFailedTransactions}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 ml-1">+5 from last hour</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{unresolvedAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600 ml-1">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                <p className="text-2xl font-bold text-gray-900">{suspiciousActivities}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-600 ml-1">Under review</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Service Overview', icon: Activity },
                { id: 'services', label: 'Service Details', icon: CreditCard },
                { id: 'activity', label: 'User Activity', icon: Users },
                { id: 'alerts', label: 'Alerts & Notifications', icon: Bell }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Service Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {serviceStats.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            {getServiceIcon(service.id)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                              {getStatusIcon(service.status)}
                              <span>{service.status.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{service.activeTransactions}</p>
                          <p className="text-sm text-gray-600">Active</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Today</p>
                          <p className="text-lg font-semibold text-gray-900">{service.totalTransactions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-lg font-semibold text-green-600">{service.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Response</p>
                          <p className="text-lg font-semibold text-blue-600">{service.avgResponseTime}s</p>
                        </div>
                      </div>

                      {service.failedTransactions > 0 && (
                        <div className="mt-4 p-3 bg-red-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-700">
                              {service.failedTransactions} failed transactions today
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Details Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Service Metrics</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                      <option>All Services</option>
                      <option>Online Only</option>
                      <option>Issues Only</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceStats.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              {getServiceIcon(service.id)}
                              <span className="text-sm font-medium text-gray-900">{service.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                              {getStatusIcon(service.status)}
                              <span>{service.status.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.activeTransactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.totalTransactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${service.successRate >= 98 ? 'text-green-600' : service.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {service.successRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${service.failedTransactions > 20 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {service.failedTransactions}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.avgResponseTime}s</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">View Details</button>
                            <button className="text-gray-600 hover:text-gray-900">Configure</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* User Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent User Activities</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                      <option>All Activities</option>
                      <option>Suspicious Only</option>
                      <option>Failed Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className={`bg-white border rounded-lg p-4 ${activity.suspicious ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">{activity.userName}</h4>
                              <span className="text-xs text-gray-500">({activity.userId})</span>
                              {activity.suspicious && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Suspicious
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{activity.action} - {activity.service}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {activity.location}
                              </span>
                              <span className="text-xs text-gray-500">IP: {activity.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'success' ? 'bg-green-100 text-green-800' :
                            activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {activity.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {activity.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {activity.status.toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts & Notifications</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    Mark All as Read
                  </button>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${
                      alert.resolved ? 'bg-gray-50 border-gray-200' : 
                      alert.type === 'error' ? 'bg-red-50 border-red-200' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            alert.type === 'error' ? 'bg-red-100' :
                            alert.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                            {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                            {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">{alert.service.toUpperCase()}</h4>
                              {alert.resolved && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs">
                              Resolve
                            </button>
                            <button className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs">
                              Investigate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMonitoringDashboard;