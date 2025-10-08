import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../common/NotificationSystem';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Ban, 
  UserCheck, 
  UserX, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Users,
  Database,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'suspicious' | 'blocked';
  riskScore: number;
  sessionDuration: number;
  activityCount: number;
  flags: string[];
}

interface ActivityPattern {
  userId: string;
  userName: string;
  patterns: {
    loginTimes: number[];
    locations: string[];
    devices: string[];
    transactionPatterns: {
      frequency: number;
      amounts: number[];
      recipients: string[];
    };
    behaviorScore: number;
    anomalies: string[];
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'unusual_activity' | 'multiple_sessions' | 'location_change' | 'device_change' | 'failed_attempts';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  details: Record<string, any>;
  actions: string[];
}

const UserActivityMonitor: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotifications();

  // State management
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [activityPatterns, setActivityPatterns] = useState<ActivityPattern[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'sessions' | 'patterns' | 'alerts' | 'analytics'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Real-time monitoring
  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls for comprehensive monitoring data
      await Promise.all([
        loadActiveSessions(),
        loadActivityPatterns(),
        loadSecurityAlerts()
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      showError('Failed to load monitoring data');
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    // Simulate real-time session data
    const mockSessions: UserSession[] = [
      {
        id: 'SESSION001',
        userId: 'USER001',
        userName: 'John Doe',
        userEmail: 'john.doe@email.com',
        deviceType: 'Desktop',
        browser: 'Chrome 120.0',
        os: 'Windows 11',
        ipAddress: '192.168.1.100',
        location: 'Dhaka, Bangladesh',
        loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'active',
        riskScore: 15,
        sessionDuration: 7200,
        activityCount: 45,
        flags: []
      },
      {
        id: 'SESSION002',
        userId: 'USER002',
        userName: 'Jane Smith',
        userEmail: 'jane.smith@email.com',
        deviceType: 'Mobile',
        browser: 'Safari 17.0',
        os: 'iOS 17.1',
        ipAddress: '203.112.58.45',
        location: 'Chittagong, Bangladesh',
        loginTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'active',
        riskScore: 25,
        sessionDuration: 1800,
        activityCount: 12,
        flags: ['new_device']
      },
      {
        id: 'SESSION003',
        userId: 'USER003',
        userName: 'Bob Johnson',
        userEmail: 'bob.johnson@email.com',
        deviceType: 'Desktop',
        browser: 'Firefox 119.0',
        os: 'Ubuntu 22.04',
        ipAddress: '45.123.67.89',
        location: 'Unknown Location',
        loginTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'suspicious',
        riskScore: 85,
        sessionDuration: 900,
        activityCount: 3,
        flags: ['unusual_location', 'rapid_actions', 'failed_attempts']
      }
    ];

    setActiveSessions(mockSessions);
  };

  const loadActivityPatterns = async () => {
    // Simulate behavioral analysis data
    const mockPatterns: ActivityPattern[] = [
      {
        userId: 'USER001',
        userName: 'John Doe',
        patterns: {
          loginTimes: [9, 14, 18], // Hours of day
          locations: ['Dhaka, Bangladesh'],
          devices: ['Desktop - Chrome', 'Mobile - Safari'],
          transactionPatterns: {
            frequency: 3.2, // per day
            amounts: [5000, 15000, 25000],
            recipients: ['ACCT001', 'ACCT002']
          },
          behaviorScore: 92,
          anomalies: []
        },
        riskLevel: 'low',
        recommendations: ['Normal user behavior', 'No action required']
      },
      {
        userId: 'USER003',
        userName: 'Bob Johnson',
        patterns: {
          loginTimes: [2, 3, 23], // Unusual hours
          locations: ['Multiple Unknown Locations'],
          devices: ['Multiple Unknown Devices'],
          transactionPatterns: {
            frequency: 15.7, // Unusually high
            amounts: [100000, 250000, 500000], // Large amounts
            recipients: ['Multiple New Recipients']
          },
          behaviorScore: 23,
          anomalies: [
            'Login at unusual hours',
            'Multiple location changes',
            'High transaction frequency',
            'Large transaction amounts',
            'New recipient patterns'
          ]
        },
        riskLevel: 'critical',
        recommendations: [
          'Immediate account review required',
          'Consider temporary restrictions',
          'Enhanced monitoring',
          'Contact user for verification'
        ]
      }
    ];

    setActivityPatterns(mockPatterns);
  };

  const loadSecurityAlerts = async () => {
    // Simulate security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'ALERT001',
        type: 'suspicious_login',
        severity: 'high',
        userId: 'USER003',
        userName: 'Bob Johnson',
        description: 'Login from unusual location with multiple failed attempts',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: 'new',
        details: {
          ipAddress: '45.123.67.89',
          location: 'Unknown Location',
          failedAttempts: 5,
          deviceFingerprint: 'unknown'
        },
        actions: ['Block User', 'Require Verification', 'Monitor']
      },
      {
        id: 'ALERT002',
        type: 'unusual_activity',
        severity: 'medium',
        userId: 'USER002',
        userName: 'Jane Smith',
        description: 'New device detected for user account',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'investigating',
        details: {
          deviceType: 'Mobile',
          browser: 'Safari 17.0',
          firstSeen: new Date().toISOString()
        },
        actions: ['Send Notification', 'Require 2FA', 'Monitor']
      }
    ];

    setSecurityAlerts(mockAlerts);
  };

  // Control actions
  const handleSessionAction = async (sessionId: string, action: 'terminate' | 'block' | 'monitor' | 'verify') => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;

      switch (action) {
        case 'terminate':
          showSuccess(`Session terminated for ${session.userName}`);
          setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
          break;
        case 'block':
          showWarning(`User ${session.userName} has been blocked`);
          setActiveSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, status: 'blocked' as const } : s
          ));
          break;
        case 'monitor':
          showSuccess(`Enhanced monitoring enabled for ${session.userName}`);
          setActiveSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, flags: [...s.flags, 'enhanced_monitoring'] } : s
          ));
          break;
        case 'verify':
          showSuccess(`Verification request sent to ${session.userName}`);
          break;
      }
    } catch (error) {
      showError('Failed to perform action');
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      const alert = securityAlerts.find(a => a.id === alertId);
      if (!alert) return;

      setSecurityAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'investigating' as const } : a
      ));

      showSuccess(`Action "${action}" executed for alert`);
    } catch (error) {
      showError('Failed to execute alert action');
    }
  };

  // Filtering and search
  const filteredSessions = activeSessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ipAddress.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    const matchesRisk = filterRisk === 'all' || 
                       (filterRisk === 'low' && session.riskScore < 30) ||
                       (filterRisk === 'medium' && session.riskScore >= 30 && session.riskScore < 70) ||
                       (filterRisk === 'high' && session.riskScore >= 70);

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-yellow-600 bg-yellow-100';
      case 'suspicious': return 'text-red-600 bg-red-100';
      case 'blocked': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              User Activity Monitor
            </h1>
            <p className="text-gray-600">Real-time monitoring and control of user activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{autoRefresh ? 'Live' : 'Paused'}</span>
            </button>
            <button
              onClick={loadMonitoringData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {activeSessions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Suspicious Activity</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {activeSessions.filter(s => s.status === 'suspicious').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Security Alerts</p>
                <p className="text-2xl font-bold text-red-900">
                  {securityAlerts.filter(a => a.status === 'new').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">System Health</p>
                <p className="text-2xl font-bold text-green-900">98.5%</p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'sessions', label: 'Active Sessions', icon: Monitor },
              { id: 'patterns', label: 'Behavior Patterns', icon: BarChart3 },
              { id: 'alerts', label: 'Security Alerts', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users, emails, IPs..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk (&lt;30)</option>
                  <option value="medium">Medium Risk (30-70)</option>
                  <option value="high">High Risk (&gt;70)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Refresh</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {session.deviceType === 'Desktop' && <Monitor className="h-8 w-8 text-gray-400" />}
                          {session.deviceType === 'Mobile' && <Smartphone className="h-8 w-8 text-gray-400" />}
                          {session.deviceType === 'Tablet' && <Tablet className="h-8 w-8 text-gray-400" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                          <div className="text-sm text-gray-500">{session.userEmail}</div>
                          <div className="text-xs text-gray-400">{session.browser} • {session.os}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {session.location}
                      </div>
                      <div className="text-sm text-gray-500">{session.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Duration: {formatDuration(session.sessionDuration)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Activities: {session.activityCount}
                      </div>
                      <div className="text-xs text-gray-400">
                        Last: {formatTimeAgo(session.lastActivity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${getRiskColor(session.riskScore)}`}>
                        Risk: {session.riskScore}%
                      </div>
                      {session.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {session.flags.map((flag, index) => (
                            <span key={index} className="inline-flex px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSessionAction(session.id, 'monitor')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Monitor"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSessionAction(session.id, 'verify')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Verify"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSessionAction(session.id, 'terminate')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Terminate"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSessionAction(session.id, 'block')}
                          className="text-red-600 hover:text-red-900"
                          title="Block"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'patterns' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Patterns</h2>
          <div className="space-y-6">
            {activityPatterns.map((pattern) => (
              <div key={pattern.userId} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{pattern.userName}</h3>
                    <p className="text-sm text-gray-500">User ID: {pattern.userId}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pattern.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      pattern.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      pattern.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pattern.riskLevel.toUpperCase()} RISK
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Behavior Score</div>
                      <div className={`text-lg font-bold ${
                        pattern.patterns.behaviorScore >= 80 ? 'text-green-600' :
                        pattern.patterns.behaviorScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {pattern.patterns.behaviorScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Login Times</div>
                    <div className="text-sm font-medium">
                      {pattern.patterns.loginTimes.map(hour => `${hour}:00`).join(', ')}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Locations</div>
                    <div className="text-sm font-medium">
                      {pattern.patterns.locations.join(', ')}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Transaction Frequency</div>
                    <div className="text-sm font-medium">
                      {pattern.patterns.transactionPatterns.frequency}/day
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Avg Transaction</div>
                    <div className="text-sm font-medium">
                      ৳{(pattern.patterns.transactionPatterns.amounts.reduce((a, b) => a + b, 0) / pattern.patterns.transactionPatterns.amounts.length).toLocaleString()}
                    </div>
                  </div>
                </div>

                {pattern.patterns.anomalies.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-red-600 mb-2">Detected Anomalies:</div>
                    <div className="flex flex-wrap gap-2">
                      {pattern.patterns.anomalies.map((anomaly, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          {anomaly}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Recommendations:</div>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {pattern.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h2>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{alert.type.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  <div className="flex space-x-2">
                    {alert.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleAlertAction(alert.id, action)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{alert.userName}</div>
                  <div className="text-sm text-gray-600">{alert.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  <div>User ID: {alert.userId}</div>
                  {alert.details.ipAddress && <div>IP: {alert.details.ipAddress}</div>}
                  {alert.details.location && <div>Location: {alert.details.location}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Session Status Distribution</h3>
              <div className="space-y-2">
                {['active', 'idle', 'suspicious', 'blocked'].map(status => {
                  const count = activeSessions.filter(s => s.status === status).length;
                  const percentage = activeSessions.length > 0 ? (count / activeSessions.length * 100).toFixed(1) : '0';
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'active' ? 'bg-green-500' :
                              status === 'idle' ? 'bg-yellow-500' :
                              status === 'suspicious' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Risk Score Distribution</h3>
              <div className="space-y-2">
                {[
                  { label: 'Low Risk (0-30)', min: 0, max: 30, color: 'bg-green-500' },
                  { label: 'Medium Risk (30-70)', min: 30, max: 70, color: 'bg-yellow-500' },
                  { label: 'High Risk (70-100)', min: 70, max: 100, color: 'bg-red-500' }
                ].map(range => {
                  const count = activeSessions.filter(s => s.riskScore >= range.min && s.riskScore < range.max).length;
                  const percentage = activeSessions.length > 0 ? (count / activeSessions.length * 100).toFixed(1) : '0';
                  return (
                    <div key={range.label} className="flex items-center justify-between">
                      <span className="text-sm">{range.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${range.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Device Type Distribution</h3>
              <div className="space-y-2">
                {['Desktop', 'Mobile', 'Tablet'].map(deviceType => {
                  const count = activeSessions.filter(s => s.deviceType === deviceType).length;
                  const percentage = activeSessions.length > 0 ? (count / activeSessions.length * 100).toFixed(1) : '0';
                  return (
                    <div key={deviceType} className="flex items-center justify-between">
                      <span className="text-sm">{deviceType}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alert Trends */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Alert Severity Trends</h3>
              <div className="space-y-2">
                {['low', 'medium', 'high', 'critical'].map(severity => {
                  const count = securityAlerts.filter(a => a.severity === severity).length;
                  const percentage = securityAlerts.length > 0 ? (count / securityAlerts.length * 100).toFixed(1) : '0';
                  return (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              severity === 'low' ? 'bg-blue-500' :
                              severity === 'medium' ? 'bg-yellow-500' :
                              severity === 'high' ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityMonitor;