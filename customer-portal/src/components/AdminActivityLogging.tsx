import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock, User, Calendar, MapPin, Monitor, FileText, Shield, Database, Settings, Trash2, Edit, Plus, RefreshCw } from 'lucide-react';

// Interfaces for admin activity logging
interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import' | 'system';
  resource: string;
  resourceId?: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  status: 'success' | 'failed' | 'warning';
  details: Record<string, any>;
  sessionId: string;
}

interface ActivityFilter {
  dateRange: string;
  adminId: string;
  actionType: string;
  status: string;
  resource: string;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  failedActivities: number;
  uniqueAdmins: number;
  topActions: { action: string; count: number }[];
  activityTrend: { date: string; count: number }[];
}

const AdminActivityLogging: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({
    dateRange: 'today',
    adminId: 'all',
    actionType: 'all',
    status: 'all',
    resource: 'all'
  });

  // Mock data for admin activities
  const [activities] = useState<AdminActivity[]>([
    {
      id: '1',
      adminId: '1',
      adminName: 'John Smith',
      adminRole: 'Super Admin',
      action: 'User Account Created',
      actionType: 'create',
      resource: 'User Management',
      resourceId: 'user_12345',
      description: 'Created new customer account for Sarah Johnson',
      timestamp: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, USA',
      status: 'success',
      details: {
        userId: 'user_12345',
        userName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        accountType: 'Premium'
      },
      sessionId: 'session_abc123'
    },
    {
      id: '2',
      adminId: '2',
      adminName: 'Sarah Johnson',
      adminRole: 'Financial Admin',
      action: 'Transaction Approved',
      actionType: 'update',
      resource: 'Transactions',
      resourceId: 'txn_67890',
      description: 'Approved wire transfer of $50,000',
      timestamp: '2024-01-15T13:45:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'London, UK',
      status: 'success',
      details: {
        transactionId: 'txn_67890',
        amount: 50000,
        currency: 'USD',
        fromAccount: 'ACC001',
        toAccount: 'ACC002',
        approvalLevel: 'Level 2'
      },
      sessionId: 'session_def456'
    },
    {
      id: '3',
      adminId: '3',
      adminName: 'Mike Davis',
      adminRole: 'Support Admin',
      action: 'Failed Login Attempt',
      actionType: 'login',
      resource: 'Authentication',
      description: 'Failed login attempt with incorrect password',
      timestamp: '2024-01-15T12:20:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Toronto, Canada',
      status: 'failed',
      details: {
        reason: 'Invalid password',
        attempts: 3,
        lockoutTriggered: false
      },
      sessionId: 'session_ghi789'
    },
    {
      id: '4',
      adminId: '4',
      adminName: 'Lisa Wilson',
      adminRole: 'Compliance Admin',
      action: 'Report Generated',
      actionType: 'export',
      resource: 'Reports',
      resourceId: 'report_compliance_001',
      description: 'Generated monthly compliance report',
      timestamp: '2024-01-15T11:15:00Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Sydney, Australia',
      status: 'success',
      details: {
        reportType: 'Compliance',
        period: 'December 2023',
        format: 'PDF',
        size: '2.5MB',
        recipients: ['compliance@iblimited.com', 'audit@iblimited.com']
      },
      sessionId: 'session_jkl012'
    },
    {
      id: '5',
      adminId: '1',
      adminName: 'John Smith',
      adminRole: 'Super Admin',
      action: 'System Settings Updated',
      actionType: 'system',
      resource: 'System Configuration',
      description: 'Updated security settings and password policy',
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, USA',
      status: 'success',
      details: {
        settings: ['password_policy', 'session_timeout', 'mfa_requirement'],
        changes: {
          password_policy: 'Increased minimum length to 12 characters',
          session_timeout: 'Reduced to 30 minutes',
          mfa_requirement: 'Enabled for all admin accounts'
        }
      },
      sessionId: 'session_abc123'
    },
    {
      id: '6',
      adminId: '2',
      adminName: 'Sarah Johnson',
      adminRole: 'Financial Admin',
      action: 'Database Backup Failed',
      actionType: 'system',
      resource: 'Database',
      description: 'Scheduled database backup failed due to insufficient storage',
      timestamp: '2024-01-15T09:00:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'System Process',
      location: 'Server Room',
      status: 'failed',
      details: {
        backupType: 'Full Backup',
        error: 'Insufficient disk space',
        requiredSpace: '50GB',
        availableSpace: '25GB',
        lastSuccessfulBackup: '2024-01-14T09:00:00Z'
      },
      sessionId: 'system_process'
    }
  ]);

  // Mock data for activity statistics
  const [activityStats] = useState<ActivityStats>({
    totalActivities: 1247,
    todayActivities: 23,
    failedActivities: 8,
    uniqueAdmins: 12,
    topActions: [
      { action: 'User Login', count: 156 },
      { action: 'Transaction View', count: 89 },
      { action: 'Report Generated', count: 67 },
      { action: 'User Account Updated', count: 45 },
      { action: 'System Settings Changed', count: 23 }
    ],
    activityTrend: [
      { date: '2024-01-09', count: 45 },
      { date: '2024-01-10', count: 52 },
      { date: '2024-01-11', count: 38 },
      { date: '2024-01-12', count: 61 },
      { date: '2024-01-13', count: 47 },
      { date: '2024-01-14', count: 55 },
      { date: '2024-01-15', count: 23 }
    ]
  });

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'login':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'logout':
        return <User className="h-4 w-4 text-orange-600" />;
      case 'export':
        return <Download className="h-4 w-4 text-indigo-600" />;
      case 'import':
        return <FileText className="h-4 w-4 text-teal-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'user management':
        return <User className="h-4 w-4" />;
      case 'transactions':
        return <FileText className="h-4 w-4" />;
      case 'reports':
        return <FileText className="h-4 w-4" />;
      case 'system configuration':
        return <Settings className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdmin = filters.adminId === 'all' || activity.adminId === filters.adminId;
    const matchesActionType = filters.actionType === 'all' || activity.actionType === filters.actionType;
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;
    const matchesResource = filters.resource === 'all' || activity.resource.toLowerCase().includes(filters.resource.toLowerCase());
    
    return matchesSearch && matchesAdmin && matchesActionType && matchesStatus && matchesResource;
  });

  const handleViewDetails = (activity: AdminActivity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const handleExportLogs = () => {
    // Handle export logic here
    console.log('Exporting activity logs...');
  };

  const handleRefreshLogs = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Activity Logging</h1>
              <p className="text-gray-600">Track and monitor all administrative actions and system events</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshLogs}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportLogs}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Export Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Activity Log</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{activityStats.totalActivities.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{activityStats.todayActivities}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{activityStats.failedActivities}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{activityStats.uniqueAdmins}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                <select
                  value={filters.actionType}
                  onChange={(e) => setFilters({...filters, actionType: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="view">View</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="export">Export</option>
                  <option value="system">System</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                </select>
                <input
                  type="text"
                  placeholder="Resource filter..."
                  value={filters.resource}
                  onChange={(e) => setFilters({...filters, resource: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>Advanced</span>
                </button>
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(activity.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-xs">
                                  {activity.adminName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{activity.adminName}</div>
                              <div className="text-xs text-gray-500">{activity.adminRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getActionTypeIcon(activity.actionType)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                              <div className="text-xs text-gray-500">{activity.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(activity.resource)}
                            <span className="text-sm text-gray-900">{activity.resource}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(activity.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{activity.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(activity)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Admin Actions</h3>
              <div className="space-y-3">
                {activityStats.topActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.action}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(action.count / activityStats.topActions[0].count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8 text-right">{action.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend (Last 7 Days)</h3>
              <div className="space-y-2">
                {activityStats.activityTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(day.count / Math.max(...activityStats.activityTrend.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Details Modal */}
        {showDetailsModal && selectedActivity && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedActivity.adminName} ({selectedActivity.adminRole})</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedActivity.timestamp)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Action</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedActivity.action}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resource</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedActivity.resource}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedActivity.ipAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedActivity.location}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedActivity.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedActivity.userAgent}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedActivity.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogging;