import React, { useState, useEffect } from 'react';

// Interfaces
interface LiveTransaction {
  id: string;
  type: 'transfer' | 'payment' | 'withdrawal' | 'deposit';
  amount: number;
  currency: string;
  from: string;
  to: string;
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  timestamp: Date;
  riskScore: number;
  location: string;
}

interface SystemHealth {
  serverStatus: 'online' | 'offline' | 'maintenance';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseLatency: number;
  activeConnections: number;
  uptime: string;
  lastUpdate: Date;
}

interface FraudAlert {
  id: string;
  type: 'suspicious_pattern' | 'unusual_amount' | 'location_anomaly' | 'velocity_check' | 'blacklist_match';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  transactionId: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  aiConfidence: number;
}

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_ip' | 'multiple_devices' | 'unusual_time' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  timestamp: Date;
  attempts: number;
  blocked: boolean;
}

const RealTimeDashboard: React.FC = () => {
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'health' | 'fraud' | 'security'>('transactions');

  // Mock data generation
  useEffect(() => {
    // Generate mock live transactions
    const generateMockTransaction = (): LiveTransaction => {
      const types: LiveTransaction['type'][] = ['transfer', 'payment', 'withdrawal', 'deposit'];
      const statuses: LiveTransaction['status'][] = ['pending', 'completed', 'failed', 'flagged'];
      const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Dubai', 'Singapore'];
      
      return {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: types[Math.floor(Math.random() * types.length)],
        amount: Math.floor(Math.random() * 50000) + 100,
        currency: 'USD',
        from: `user_${Math.floor(Math.random() * 1000)}`,
        to: `user_${Math.floor(Math.random() * 1000)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(),
        riskScore: Math.floor(Math.random() * 100),
        location: locations[Math.floor(Math.random() * locations.length)]
      };
    };

    // Generate mock system health
    const generateSystemHealth = (): SystemHealth => ({
      serverStatus: Math.random() > 0.1 ? 'online' : 'maintenance',
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskUsage: Math.floor(Math.random() * 100),
      databaseLatency: Math.floor(Math.random() * 100) + 10,
      activeConnections: Math.floor(Math.random() * 1000) + 100,
      uptime: '15d 8h 32m',
      lastUpdate: new Date()
    });

    // Generate mock fraud alerts
    const generateFraudAlert = (): FraudAlert => {
      const types: FraudAlert['type'][] = ['suspicious_pattern', 'unusual_amount', 'location_anomaly', 'velocity_check', 'blacklist_match'];
      const severities: FraudAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
      const statuses: FraudAlert['status'][] = ['new', 'investigating', 'resolved', 'false_positive'];
      
      return {
        id: `fraud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: 'Suspicious transaction pattern detected',
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        transactionId: `txn_${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        aiConfidence: Math.floor(Math.random() * 40) + 60
      };
    };

    // Generate mock security events
    const generateSecurityEvent = (): SecurityEvent => {
      const types: SecurityEvent['type'][] = ['failed_login', 'suspicious_ip', 'multiple_devices', 'unusual_time', 'brute_force'];
      const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
      const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1'];
      const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Dubai'];
      
      return {
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        ipAddress: ips[Math.floor(Math.random() * ips.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(),
        attempts: Math.floor(Math.random() * 10) + 1,
        blocked: Math.random() > 0.5
      };
    };

    // Initialize with some data
    setLiveTransactions(Array.from({ length: 10 }, generateMockTransaction));
    setSystemHealth(generateSystemHealth());
    setFraudAlerts(Array.from({ length: 5 }, generateFraudAlert));
    setSecurityEvents(Array.from({ length: 8 }, generateSecurityEvent));

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new transaction
      if (Math.random() > 0.7) {
        setLiveTransactions(prev => [generateMockTransaction(), ...prev.slice(0, 19)]);
      }

      // Update system health
      if (Math.random() > 0.8) {
        setSystemHealth(generateSystemHealth());
      }

      // Add new fraud alert
      if (Math.random() > 0.9) {
        setFraudAlerts(prev => [generateFraudAlert(), ...prev.slice(0, 9)]);
      }

      // Add new security event
      if (Math.random() > 0.85) {
        setSecurityEvents(prev => [generateSecurityEvent(), ...prev.slice(0, 14)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'online': case 'resolved': return 'text-green-600 bg-green-100';
      case 'pending': case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'offline': case 'new': return 'text-red-600 bg-red-100';
      case 'flagged': case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitoring Dashboard</h1>
              <p className="text-gray-600 mt-1">Live system monitoring and security oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'transactions', name: 'Live Transactions', icon: '💳' },
                { id: 'health', name: 'System Health', icon: '🏥' },
                { id: 'fraud', name: 'Fraud Detection', icon: '🚨' },
                { id: 'security', name: 'Security Events', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Live Transactions Tab */}
        {selectedTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Live Transaction Feed</h2>
                <p className="text-sm text-gray-600">Real-time transaction monitoring</p>
              </div>
              <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {liveTransactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {transaction.type === 'transfer' ? '↔️' : 
                                 transaction.type === 'payment' ? '💳' :
                                 transaction.type === 'withdrawal' ? '💸' : '💰'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {transaction.type}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {transaction.from} → {transaction.to}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">{formatTime(transaction.timestamp)}</p>
                            <div className={`px-2 py-1 text-xs rounded ${
                              transaction.riskScore > 70 ? 'bg-red-100 text-red-800' :
                              transaction.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Risk: {transaction.riskScore}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {selectedTab === 'health' && systemHealth && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      systemHealth.serverStatus === 'online' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className={systemHealth.serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
                        {systemHealth.serverStatus === 'online' ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Server Status</p>
                    <p className={`text-lg font-semibold capitalize ${
                      systemHealth.serverStatus === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {systemHealth.serverStatus}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">🔗</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Connections</p>
                    <p className="text-lg font-semibold text-gray-900">{systemHealth.activeConnections}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">DB Latency</p>
                    <p className="text-lg font-semibold text-gray-900">{systemHealth.databaseLatency}ms</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">⏰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-lg font-semibold text-gray-900">{systemHealth.uptime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resource Usage</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[
                    { name: 'CPU Usage', value: systemHealth.cpuUsage, color: 'blue' },
                    { name: 'Memory Usage', value: systemHealth.memoryUsage, color: 'green' },
                    { name: 'Disk Usage', value: systemHealth.diskUsage, color: 'yellow' }
                  ].map((metric) => (
                    <div key={metric.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                        <span className="text-sm text-gray-600">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-${metric.color}-500`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Tab */}
        {selectedTab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Fraud Detection</h2>
                <p className="text-sm text-gray-600">Suspicious activity alerts and pattern analysis</p>
              </div>
              <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                              <span className="font-semibold">
                                {alert.severity === 'critical' ? '🚨' :
                                 alert.severity === 'high' ? '⚠️' :
                                 alert.severity === 'medium' ? '⚡' : 'ℹ️'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {alert.type.replace('_', ' ')}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{alert.description}</p>
                            <p className="text-xs text-gray-500">
                              User: {alert.userId} | Transaction: {alert.transactionId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(alert.timestamp)}</p>
                          <div className="text-xs text-blue-600 mt-1">
                            AI Confidence: {alert.aiConfidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Events Tab */}
        {selectedTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Security Monitoring</h2>
                <p className="text-sm text-gray-600">Failed login attempts and unusual patterns</p>
              </div>
              <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(event.severity)}`}>
                              <span className="font-semibold">
                                {event.type === 'failed_login' ? '🔐' :
                                 event.type === 'suspicious_ip' ? '🌐' :
                                 event.type === 'brute_force' ? '💥' :
                                 event.type === 'multiple_devices' ? '📱' : '⏰'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {event.type.replace('_', ' ')}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                                {event.severity}
                              </span>
                              {event.blocked && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              User: {event.userId} | IP: {event.ipAddress}
                            </p>
                            <p className="text-xs text-gray-500">
                              Location: {event.location} | Attempts: {event.attempts}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatTime(event.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDashboard;