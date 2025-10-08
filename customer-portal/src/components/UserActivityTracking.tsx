import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Eye, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed' | 'suspicious';
  riskScore: number;
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  device: string;
  location: string;
  status: 'active' | 'idle' | 'expired';
  duration: number;
}

const UserActivityTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  // Mock data for user activities
  useEffect(() => {
    const mockActivities: UserActivity[] = [
      {
        id: 'ACT001',
        userId: 'USR001',
        userName: 'John Doe',
        email: 'john.doe@email.com',
        action: 'Fund Transfer',
        timestamp: new Date('2024-01-15T10:30:00'),
        ipAddress: '192.168.1.100',
        device: 'Chrome/Windows',
        location: 'New York, USA',
        status: 'success',
        riskScore: 2
      },
      {
        id: 'ACT002',
        userId: 'USR002',
        userName: 'Jane Smith',
        email: 'jane.smith@email.com',
        action: 'Login Attempt',
        timestamp: new Date('2024-01-15T09:45:00'),
        ipAddress: '203.45.67.89',
        device: 'Safari/iOS',
        location: 'London, UK',
        status: 'failed',
        riskScore: 8
      },
      {
        id: 'ACT003',
        userId: 'USR003',
        userName: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        action: 'Bill Payment',
        timestamp: new Date('2024-01-15T11:15:00'),
        ipAddress: '10.0.0.50',
        device: 'Firefox/Linux',
        location: 'Toronto, Canada',
        status: 'success',
        riskScore: 1
      },
      {
        id: 'ACT004',
        userId: 'USR004',
        userName: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        action: 'Cash Withdrawal',
        timestamp: new Date('2024-01-15T08:20:00'),
        ipAddress: '172.16.0.25',
        device: 'Chrome/Android',
        location: 'Sydney, Australia',
        status: 'suspicious',
        riskScore: 9
      },
      {
        id: 'ACT005',
        userId: 'USR005',
        userName: 'David Brown',
        email: 'david.brown@email.com',
        action: 'Profile Update',
        timestamp: new Date('2024-01-15T12:00:00'),
        ipAddress: '192.168.0.75',
        device: 'Edge/Windows',
        location: 'Berlin, Germany',
        status: 'success',
        riskScore: 3
      }
    ];

    const mockSessions: UserSession[] = [
      {
        id: 'SES001',
        userId: 'USR001',
        userName: 'John Doe',
        loginTime: new Date('2024-01-15T09:00:00'),
        lastActivity: new Date('2024-01-15T11:30:00'),
        ipAddress: '192.168.1.100',
        device: 'Chrome/Windows',
        location: 'New York, USA',
        status: 'active',
        duration: 150
      },
      {
        id: 'SES002',
        userId: 'USR003',
        userName: 'Mike Johnson',
        loginTime: new Date('2024-01-15T10:30:00'),
        lastActivity: new Date('2024-01-15T11:45:00'),
        ipAddress: '10.0.0.50',
        device: 'Firefox/Linux',
        location: 'Toronto, Canada',
        status: 'idle',
        duration: 75
      },
      {
        id: 'SES003',
        userId: 'USR005',
        userName: 'David Brown',
        loginTime: new Date('2024-01-15T08:00:00'),
        lastActivity: new Date('2024-01-15T08:30:00'),
        ipAddress: '192.168.0.75',
        device: 'Edge/Windows',
        location: 'Berlin, Germany',
        status: 'expired',
        duration: 30
      }
    ];

    setActivities(mockActivities);
    setSessions(mockSessions);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ipAddress.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'suspicious':
        return 'text-orange-600 bg-orange-100';
      case 'idle':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Activity Tracking</h1>
          <p className="text-gray-600">Monitor user activities, sessions, and security events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">vs last hour</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">3,456</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">-15%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">-5%</span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                User Activities
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Active Sessions
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users, actions, or IPs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="suspicious">Suspicious</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'activity' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location & Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                              <div className="text-sm text-gray-500">{activity.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{activity.action}</div>
                          <div className="text-sm text-gray-500">ID: {activity.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {activity.location}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Monitor className="w-4 h-4 mr-1" />
                            {activity.device}
                          </div>
                          <div className="text-sm text-gray-500">{activity.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(activity.riskScore)}`}>
                              Risk: {activity.riskScore}/10
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.timestamp.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location & Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                              <div className="text-sm text-gray-500">ID: {session.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Login: {session.loginTime.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Last: {session.lastActivity.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {session.location}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Monitor className="w-4 h-4 mr-1" />
                            {session.device}
                          </div>
                          <div className="text-sm text-gray-500">{session.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.duration} min
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Activity Distribution
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fund Transfers</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bill Payments</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cash Withdrawals</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Other</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Security Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Successful Logins</span>
                      <span className="text-sm font-medium text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Failed Login Rate</span>
                      <span className="text-sm font-medium text-red-600">1.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Suspicious Activities</span>
                      <span className="text-sm font-medium text-orange-600">0.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Session Duration</span>
                      <span className="text-sm font-medium">24 min</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTracking;