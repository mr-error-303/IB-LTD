import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Smartphone, 
  Monitor,
  Filter,
  Search,
  Download,
  Eye,
  Ban,
  XCircle
} from 'lucide-react';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  activityType: 'login' | 'logout' | 'transaction' | 'failed_login' | 'password_change' | 'profile_update';
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  userAgent: string;
  suspicious: boolean;
  riskScore: number;
  details?: string;
}

interface SuspiciousPattern {
  id: string;
  userId: string;
  userName: string;
  patternType: 'multiple_locations' | 'unusual_hours' | 'failed_attempts' | 'device_change' | 'high_frequency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  firstDetected: Date;
  lastActivity: Date;
  occurrences: number;
  status: 'active' | 'resolved' | 'investigating';
}

const UserActivityTracking: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState<SuspiciousPattern[]>([]);
  const [activeTab, setActiveTab] = useState<'activities' | 'patterns' | 'analytics'>('activities');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Mock data for user activities
  useEffect(() => {
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId: 'user_001',
        userName: 'John Doe',
        email: 'john.doe@email.com',
        activityType: 'login',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        ipAddress: '192.168.1.100',
        location: 'Dhaka, Bangladesh',
        device: 'Desktop',
        userAgent: 'Chrome 120.0.0.0',
        suspicious: false,
        riskScore: 2
      },
      {
        id: '2',
        userId: 'user_002',
        userName: 'Jane Smith',
        email: 'jane.smith@email.com',
        activityType: 'failed_login',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        ipAddress: '203.112.45.67',
        location: 'Chittagong, Bangladesh',
        device: 'Mobile',
        userAgent: 'Safari 17.0',
        suspicious: true,
        riskScore: 8,
        details: '5 consecutive failed login attempts'
      },
      {
        id: '3',
        userId: 'user_003',
        userName: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        activityType: 'transaction',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ipAddress: '10.0.0.50',
        location: 'Sylhet, Bangladesh',
        device: 'Tablet',
        userAgent: 'Firefox 121.0',
        suspicious: false,
        riskScore: 3
      },
      {
        id: '4',
        userId: 'user_004',
        userName: 'Alice Brown',
        email: 'alice.brown@email.com',
        activityType: 'login',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '45.123.78.90',
        location: 'Unknown Location',
        device: 'Desktop',
        userAgent: 'Chrome 119.0.0.0',
        suspicious: true,
        riskScore: 9,
        details: 'Login from unusual location'
      }
    ];

    const mockPatterns: SuspiciousPattern[] = [
      {
        id: 'pattern_1',
        userId: 'user_002',
        userName: 'Jane Smith',
        patternType: 'failed_attempts',
        severity: 'high',
        description: 'Multiple failed login attempts detected',
        firstDetected: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        occurrences: 8,
        status: 'active'
      },
      {
        id: 'pattern_2',
        userId: 'user_004',
        userName: 'Alice Brown',
        patternType: 'multiple_locations',
        severity: 'critical',
        description: 'Login attempts from multiple countries within 1 hour',
        firstDetected: new Date(Date.now() - 3 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        occurrences: 3,
        status: 'investigating'
      },
      {
        id: 'pattern_3',
        userId: 'user_005',
        userName: 'Charlie Wilson',
        patternType: 'unusual_hours',
        severity: 'medium',
        description: 'Account access during unusual hours (2-5 AM)',
        firstDetected: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
        occurrences: 5,
        status: 'resolved'
      }
    ];

    setActivities(mockActivities);
    setSuspiciousPatterns(mockPatterns);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="w-4 h-4 text-green-600" />;
      case 'logout': return <User className="w-4 h-4 text-gray-600" />;
      case 'transaction': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'failed_login': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'password_change': return <Shield className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.activityType === filterType;
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.ipAddress.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Activity Tracking</h1>
          <p className="text-gray-600">Monitor user activities and detect suspicious patterns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Logins</p>
                <p className="text-2xl font-bold text-gray-900">3,456</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity Log
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'patterns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Suspicious Patterns
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Activity Log Tab */}
          {activeTab === 'activities' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Activities</option>
                  <option value="login">Logins</option>
                  <option value="logout">Logouts</option>
                  <option value="transaction">Transactions</option>
                  <option value="failed_login">Failed Logins</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Activities Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User & Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time & Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device & IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className={activity.suspicious ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getActivityIcon(activity.activityType)}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                              <div className="text-sm text-gray-500">{activity.email}</div>
                              <div className="text-xs text-gray-400 capitalize">{activity.activityType.replace('_', ' ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {activity.timestamp.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            {activity.device === 'Mobile' ? <Smartphone className="w-3 h-3 mr-1" /> : <Monitor className="w-3 h-3 mr-1" />}
                            {activity.device}
                          </div>
                          <div className="text-sm text-gray-500">{activity.ipAddress}</div>
                          <div className="text-xs text-gray-400">{activity.userAgent}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                            activity.riskScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.riskScore}/10
                          </div>
                          {activity.suspicious && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Suspicious
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {activity.suspicious && (
                              <button className="text-red-600 hover:text-red-900">
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suspicious Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="p-6">
              <div className="space-y-4">
                {suspiciousPatterns.map((pattern) => (
                  <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <h3 className="text-lg font-medium text-gray-900">{pattern.userName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                            {pattern.severity.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pattern.status)}`}>
                            {pattern.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{pattern.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>First detected: {pattern.firstDetected.toLocaleString()}</span>
                          <span>Last activity: {pattern.lastActivity.toLocaleString()}</span>
                          <span>Occurrences: {pattern.occurrences}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          Investigate
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Resolve
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                          Block User
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Login Patterns</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hours:</span>
                      <span className="font-medium">9 AM - 11 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most Active Day:</span>
                      <span className="font-medium">Monday</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Session:</span>
                      <span className="font-medium">24 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed Login Rate:</span>
                      <span className="font-medium text-red-600">2.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blocked IPs:</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suspicious Activities:</span>
                      <span className="font-medium text-orange-600">23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityTracking;