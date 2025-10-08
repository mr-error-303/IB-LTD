import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Monitor, 
  MapPin, 
  Search, 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Eye, 
  Flag, 
  X 
} from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'authentication' | 'transaction' | 'account' | 'security' | 'system';
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'pending' | 'warning';
  metadata?: {
    amount?: number;
    transactionId?: string;
    accountNumber?: string;
    location?: string;
    deviceType?: string;
  };
}

const UserActivityLogs: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotifications();
  
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  // Enhanced state for advanced monitoring
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [suspiciousActivities, setSuspiciousActivities] = useState<ActivityLog[]>([]);
  const [activityStats, setActivityStats] = useState({
    totalToday: 0,
    failedLogins: 0,
    suspiciousTransactions: 0,
    newDevices: 0,
    locationChanges: 0
  });
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'user' | 'action'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    fetchActivityLogs();
  }, [selectedCategory, selectedStatus, selectedTimeRange, sortBy, sortOrder]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      
      // Simulate API call with comprehensive mock data
      setTimeout(() => {
        const mockActivities: ActivityLog[] = [
          {
            id: 'LOG001',
            userId: 'USER001',
            userName: 'John Doe',
            userEmail: 'john.doe@email.com',
            action: 'Login',
            category: 'authentication',
            details: 'Successful login from mobile application',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            status: 'success',
            metadata: {
              deviceType: 'Mobile',
              location: 'Dhaka, Bangladesh'
            }
          },
          {
            id: 'LOG002',
            userId: 'USER002',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@email.com',
            action: 'Transfer Initiated',
            category: 'transaction',
            details: 'Initiated transfer of ৳25,000 to account ending in 1234',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            status: 'pending',
            metadata: {
              amount: 25000,
              transactionId: 'TXN001',
              accountNumber: '****1234',
              deviceType: 'Desktop'
            }
          },
          {
            id: 'LOG003',
            userId: 'USER003',
            userName: 'Bob Johnson',
            userEmail: 'bob.johnson@email.com',
            action: 'Failed Login Attempt',
            category: 'security',
            details: 'Multiple failed login attempts detected',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            status: 'failed',
            metadata: {
              deviceType: 'Desktop',
              location: 'Unknown'
            }
          },
          {
            id: 'LOG004',
            userId: 'USER004',
            userName: 'Alice Brown',
            userEmail: 'alice.brown@email.com',
            action: 'Account Balance Check',
            category: 'account',
            details: 'Checked account balance via mobile app',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.103',
            userAgent: 'IBL Mobile App v2.1.0',
            status: 'success',
            metadata: {
              deviceType: 'Mobile',
              location: 'Chittagong, Bangladesh'
            }
          },
          {
            id: 'LOG005',
            userId: 'USER005',
            userName: 'Charlie Wilson',
            userEmail: 'charlie.wilson@email.com',
            action: 'Password Changed',
            category: 'security',
            details: 'Successfully changed account password',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.104',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success',
            metadata: {
              deviceType: 'Desktop',
              location: 'Sylhet, Bangladesh'
            }
          },
          {
            id: 'LOG006',
            userId: 'USER006',
            userName: 'Diana Prince',
            userEmail: 'diana.prince@email.com',
            action: 'Large Withdrawal',
            category: 'transaction',
            details: 'ATM withdrawal of ৳50,000 - flagged for review',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.105',
            userAgent: 'ATM Terminal',
            status: 'warning',
            metadata: {
              amount: 50000,
              transactionId: 'TXN002',
              deviceType: 'ATM',
              location: 'Gulshan, Dhaka'
            }
          }
        ];

        setActivities(mockActivities);
        setLoading(false);
      }, 1000);
    } catch (error) {
      const appError = handleError(error, 'UserActivityLogs');
      log.error('Error fetching activity logs', appError, 'UserActivityLogs');
      showError('Failed to load activity logs. Please try again.');
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'user':
        comparison = a.userName.localeCompare(b.userName);
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  const viewActivityDetails = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const getActivityRiskLevel = (activity: ActivityLog): 'low' | 'medium' | 'high' => {
    let riskScore = 0;
    
    if (activity.category === 'security') riskScore += 20;
    if (activity.metadata?.amount && activity.metadata.amount > 100000) riskScore += 40;
    if (activity.action.includes('Failed')) riskScore += 25;
    if (activity.metadata?.location === 'Unknown') riskScore += 15;
    
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return '🔐';
      case 'transaction': return '💳';
      case 'account': return '👤';
      case 'security': return '🛡️';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Email', 'Action', 'Category', 'Status', 'IP Address', 'Details'],
      ...sortedActivities.map(activity => [
        new Date(activity.timestamp).toLocaleString(),
        activity.userName,
        activity.userEmail,
        activity.action,
        activity.category,
        activity.status,
        activity.ipAddress,
        activity.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess('Activity logs exported successfully');
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
      {/* Enhanced Header with Real-time Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              User Activity Logs
              {realTimeEnabled && (
                <div className="ml-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="ml-1 text-sm text-green-600">Live</span>
                </div>
              )}
            </h1>
            <p className="text-gray-600">Monitor and track all user activities across the system</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                realTimeEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {realTimeEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{realTimeEnabled ? 'Live Mode' : 'Static Mode'}</span>
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Today</p>
                <p className="text-2xl font-bold text-blue-900">{activityStats.totalToday}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Failed Logins</p>
                <p className="text-2xl font-bold text-red-900">{activityStats.failedLogins}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Suspicious</p>
                <p className="text-2xl font-bold text-orange-900">{suspiciousActivities.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Large Transactions</p>
                <p className="text-2xl font-bold text-yellow-900">{activityStats.suspiciousTransactions}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">New Devices</p>
                <p className="text-2xl font-bold text-purple-900">{activityStats.newDevices}</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Location Changes</p>
                <p className="text-2xl font-bold text-green-900">{activityStats.locationChanges}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Filters with Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="transaction">Transaction</option>
              <option value="account">Account</option>
              <option value="security">Security</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto Refresh</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-full px-3 py-2 rounded-md transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              {autoRefresh ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <button
              onClick={fetchActivityLogs}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suspicious Activities Alert */}
      {suspiciousActivities.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-md font-medium text-red-800">
                {suspiciousActivities.length} Suspicious Activities Detected
              </h3>
            </div>
            <button
              onClick={() => setSuspiciousActivities([])}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Review these activities for potential security concerns
          </p>
        </div>
      )}

      {/* Enhanced Activity Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Activity Logs ({sortedActivities.length} entries)
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live Updates</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedActivities.map((activity) => {
                const riskLevel = getActivityRiskLevel(activity);
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {activity.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                          <div className="text-sm text-gray-500">{activity.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCategoryIcon(activity.category)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                          <div className="text-sm text-gray-500 capitalize">{activity.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{activity.details}</div>
                      {activity.metadata?.amount && (
                        <div className="text-sm text-gray-500">Amount: ৳{activity.metadata.amount.toLocaleString()}</div>
                      )}
                      <div className="text-xs text-gray-400">IP: {activity.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(riskLevel)}`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTimeAgo(activity.timestamp)}</div>
                      <div className="text-xs text-gray-500">
                        {activity.metadata?.location || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.metadata?.deviceType || 'Unknown Device'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewActivityDetails(activity)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {riskLevel === 'high' && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Flag as Suspicious"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedActivities.length)} of {sortedActivities.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityLogs;