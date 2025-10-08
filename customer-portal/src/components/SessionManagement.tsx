import React, { useState, useEffect } from 'react';
import { Monitor, Users, Clock, MapPin, Smartphone, Laptop, Tablet, Shield, AlertTriangle, CheckCircle, LogOut, Eye, Trash2, RefreshCw, Search, Filter, Globe, Wifi, Lock } from 'lucide-react';

// Interfaces for session management
interface AdminSession {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  sessionToken: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'expired' | 'terminated';
  duration: number; // in minutes
  isCurrentSession: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  activities: number;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
  suspiciousSessions: number;
  averageSessionDuration: number;
  deviceBreakdown: { type: string; count: number }[];
  locationBreakdown: { location: string; count: number }[];
}

interface SessionFilter {
  status: string;
  deviceType: string;
  riskLevel: string;
  location: string;
  timeRange: string;
}

const SessionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<AdminSession | null>(null);
  const [filters, setFilters] = useState<SessionFilter>({
    status: 'all',
    deviceType: 'all',
    riskLevel: 'all',
    location: 'all',
    timeRange: 'all'
  });

  // Mock data for admin sessions
  const [sessions] = useState<AdminSession[]>([
    {
      id: 'session_1',
      adminId: '1',
      adminName: 'John Smith',
      adminRole: 'Super Admin',
      sessionToken: 'tok_abc123xyz789',
      ipAddress: '192.168.1.100',
      location: 'New York, USA',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      deviceType: 'desktop',
      loginTime: '2024-01-15T09:00:00Z',
      lastActivity: '2024-01-15T14:30:00Z',
      status: 'active',
      duration: 330,
      isCurrentSession: true,
      riskLevel: 'low',
      activities: 45
    },
    {
      id: 'session_2',
      adminId: '2',
      adminName: 'Sarah Johnson',
      adminRole: 'Financial Admin',
      sessionToken: 'tok_def456abc123',
      ipAddress: '192.168.1.101',
      location: 'London, UK',
      device: 'MacBook Pro',
      browser: 'Safari 17.0',
      os: 'macOS Sonoma',
      deviceType: 'desktop',
      loginTime: '2024-01-15T08:30:00Z',
      lastActivity: '2024-01-15T14:25:00Z',
      status: 'active',
      duration: 355,
      isCurrentSession: false,
      riskLevel: 'low',
      activities: 67
    },
    {
      id: 'session_3',
      adminId: '3',
      adminName: 'Mike Davis',
      adminRole: 'Support Admin',
      sessionToken: 'tok_ghi789def456',
      ipAddress: '10.0.0.50',
      location: 'Toronto, Canada',
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      os: 'iOS 17.2',
      deviceType: 'mobile',
      loginTime: '2024-01-15T12:00:00Z',
      lastActivity: '2024-01-15T13:45:00Z',
      status: 'idle',
      duration: 105,
      isCurrentSession: false,
      riskLevel: 'medium',
      activities: 23
    },
    {
      id: 'session_4',
      adminId: '4',
      adminName: 'Lisa Wilson',
      adminRole: 'Compliance Admin',
      sessionToken: 'tok_jkl012ghi789',
      ipAddress: '203.0.113.45',
      location: 'Sydney, Australia',
      device: 'iPad Pro',
      browser: 'Safari Mobile',
      os: 'iPadOS 17.2',
      deviceType: 'tablet',
      loginTime: '2024-01-15T07:00:00Z',
      lastActivity: '2024-01-15T14:15:00Z',
      status: 'active',
      duration: 435,
      isCurrentSession: false,
      riskLevel: 'low',
      activities: 89
    },
    {
      id: 'session_5',
      adminId: '1',
      adminName: 'John Smith',
      adminRole: 'Super Admin',
      sessionToken: 'tok_mno345jkl012',
      ipAddress: '198.51.100.25',
      location: 'Unknown Location',
      device: 'Linux Desktop',
      browser: 'Firefox 121.0',
      os: 'Ubuntu 22.04',
      deviceType: 'desktop',
      loginTime: '2024-01-15T11:30:00Z',
      lastActivity: '2024-01-15T12:00:00Z',
      status: 'expired',
      duration: 30,
      isCurrentSession: false,
      riskLevel: 'high',
      activities: 5
    },
    {
      id: 'session_6',
      adminId: '5',
      adminName: 'Alex Brown',
      adminRole: 'Support Admin',
      sessionToken: 'tok_pqr678mno345',
      ipAddress: '172.16.0.100',
      location: 'Chicago, USA',
      device: 'Android Phone',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      deviceType: 'mobile',
      loginTime: '2024-01-15T13:00:00Z',
      lastActivity: '2024-01-15T14:00:00Z',
      status: 'terminated',
      duration: 60,
      isCurrentSession: false,
      riskLevel: 'medium',
      activities: 12
    }
  ]);

  // Mock data for session statistics
  const [sessionStats] = useState<SessionStats>({
    totalSessions: 156,
    activeSessions: 12,
    idleSessions: 3,
    suspiciousSessions: 2,
    averageSessionDuration: 245,
    deviceBreakdown: [
      { type: 'Desktop', count: 89 },
      { type: 'Mobile', count: 45 },
      { type: 'Tablet', count: 22 }
    ],
    locationBreakdown: [
      { location: 'New York, USA', count: 45 },
      { location: 'London, UK', count: 32 },
      { location: 'Toronto, Canada', count: 28 },
      { location: 'Sydney, Australia', count: 25 },
      { location: 'Other', count: 26 }
    ]
  });

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Laptop className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'idle':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'terminated':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      case 'terminated':
        return <LogOut className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ipAddress.includes(searchTerm) ||
                         session.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || session.status === filters.status;
    const matchesDeviceType = filters.deviceType === 'all' || session.deviceType === filters.deviceType;
    const matchesRiskLevel = filters.riskLevel === 'all' || session.riskLevel === filters.riskLevel;
    const matchesLocation = filters.location === 'all' || session.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesDeviceType && matchesRiskLevel && matchesLocation;
  });

  const handleTerminateSession = (session: AdminSession) => {
    setSessionToTerminate(session);
    setShowTerminateModal(true);
  };

  const confirmTerminateSession = () => {
    if (sessionToTerminate) {
      // Handle session termination logic here
      console.log('Terminating session:', sessionToTerminate.id);
      setShowTerminateModal(false);
      setSessionToTerminate(null);
    }
  };

  const handleBulkTerminate = () => {
    if (selectedSessions.length > 0) {
      if (window.confirm(`Are you sure you want to terminate ${selectedSessions.length} selected sessions?`)) {
        // Handle bulk termination logic here
        console.log('Terminating sessions:', selectedSessions);
        setSelectedSessions([]);
      }
    }
  };

  const handleRefreshSessions = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAllSessions = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(session => session.id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
              <p className="text-gray-600">Monitor and manage active admin sessions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshSessions}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {selectedSessions.length > 0 && (
                <button
                  onClick={handleBulkTerminate}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Terminate Selected ({selectedSessions.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Active Sessions</span>
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
                  <Users className="h-4 w-4" />
                  <span>Session Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Monitor className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{sessionStats.totalSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{sessionStats.activeSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Idle Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{sessionStats.idleSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Suspicious Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{sessionStats.suspiciousSessions}</p>
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
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
                <select
                  value={filters.deviceType}
                  onChange={(e) => setFilters({...filters, deviceType: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <input
                  type="text"
                  placeholder="Location filter..."
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>Advanced</span>
                </button>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                          onChange={handleSelectAllSessions}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device & Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className={`hover:bg-gray-50 ${session.isCurrentSession ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.id)}
                            onChange={() => handleSelectSession(session.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {session.adminName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">{session.adminName}</div>
                                {session.isCurrentSession && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{session.adminRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getDeviceIcon(session.deviceType)}
                              <span className="text-sm text-gray-900">{session.device}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{session.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{session.ipAddress}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">Duration: {formatDuration(session.duration)}</div>
                            <div className="text-xs text-gray-500">Login: {formatDateTime(session.loginTime)}</div>
                            <div className="text-xs text-gray-500">Last: {formatDateTime(session.lastActivity)}</div>
                            <div className="text-xs text-gray-500">{session.activities} activities</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(session.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRiskIcon(session.riskLevel)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(session.riskLevel)}`}>
                              {session.riskLevel.charAt(0).toUpperCase() + session.riskLevel.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {!session.isCurrentSession && session.status === 'active' && (
                              <button
                                onClick={() => handleTerminateSession(session)}
                                className="text-red-600 hover:text-red-900"
                                title="Terminate Session"
                              >
                                <LogOut className="h-4 w-4" />
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
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Session Duration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Session Duration</h3>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{formatDuration(sessionStats.averageSessionDuration)}</p>
                  <p className="text-sm text-gray-600">Average session duration</p>
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {sessionStats.deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {device.type === 'Desktop' && <Laptop className="h-5 w-5 text-gray-600" />}
                        {device.type === 'Mobile' && <Smartphone className="h-5 w-5 text-gray-600" />}
                        {device.type === 'Tablet' && <Tablet className="h-5 w-5 text-gray-600" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{device.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(device.count / sessionStats.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8 text-right">{device.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Breakdown</h3>
              <div className="space-y-3">
                {sessionStats.locationBreakdown.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(location.count / sessionStats.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8 text-right">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Terminate Session Modal */}
        {showTerminateModal && sessionToTerminate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Terminate Session</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to terminate the session for <strong>{sessionToTerminate.adminName}</strong>?
                  </p>
                  <div className="mt-4 text-left bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600">Session ID: {sessionToTerminate.id}</p>
                    <p className="text-xs text-gray-600">IP: {sessionToTerminate.ipAddress}</p>
                    <p className="text-xs text-gray-600">Location: {sessionToTerminate.location}</p>
                  </div>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={confirmTerminateSession}
                      className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Terminate Session
                    </button>
                    <button
                      onClick={() => setShowTerminateModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
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

export default SessionManagement;