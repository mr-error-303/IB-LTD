import React, { useState, useEffect } from 'react';

// Interfaces
interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  history: { timestamp: Date; value: number }[];
  lastUpdated: Date;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  endpoint: string;
}

interface DatabaseMetric {
  id: string;
  name: string;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryPerformance: {
    avgResponseTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  storage: {
    used: number;
    total: number;
    growth: number;
  };
  lastUpdated: Date;
}

const SystemHealthMetrics: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetric[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  useEffect(() => {
    // Generate mock system metrics
    const generateSystemMetrics = (): SystemMetric[] => [
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: Math.floor(Math.random() * 100),
        unit: '%',
        status: 'healthy',
        threshold: { warning: 70, critical: 90 },
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000),
          value: Math.floor(Math.random() * 100)
        })),
        lastUpdated: new Date()
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: Math.floor(Math.random() * 100),
        unit: '%',
        status: 'warning',
        threshold: { warning: 80, critical: 95 },
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000),
          value: Math.floor(Math.random() * 100)
        })),
        lastUpdated: new Date()
      },
      {
        id: 'disk',
        name: 'Disk Usage',
        value: Math.floor(Math.random() * 100),
        unit: '%',
        status: 'healthy',
        threshold: { warning: 85, critical: 95 },
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000),
          value: Math.floor(Math.random() * 100)
        })),
        lastUpdated: new Date()
      },
      {
        id: 'network',
        name: 'Network I/O',
        value: Math.floor(Math.random() * 1000),
        unit: 'MB/s',
        status: 'healthy',
        threshold: { warning: 800, critical: 950 },
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000),
          value: Math.floor(Math.random() * 1000)
        })),
        lastUpdated: new Date()
      }
    ];

    // Generate mock service statuses
    const generateServiceStatuses = (): ServiceStatus[] => [
      {
        id: 'api',
        name: 'Core API Service',
        status: 'online',
        uptime: 99.9,
        responseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 0.1,
        lastCheck: new Date(),
        endpoint: 'https://api.bank.com/health'
      },
      {
        id: 'auth',
        name: 'Authentication Service',
        status: 'online',
        uptime: 99.8,
        responseTime: Math.floor(Math.random() * 80) + 30,
        errorRate: Math.random() * 0.05,
        lastCheck: new Date(),
        endpoint: 'https://auth.bank.com/health'
      },
      {
        id: 'payment',
        name: 'Payment Processing',
        status: 'degraded',
        uptime: 98.5,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: Math.random() * 0.2,
        lastCheck: new Date(),
        endpoint: 'https://payments.bank.com/health'
      },
      {
        id: 'notification',
        name: 'Notification Service',
        status: 'online',
        uptime: 99.7,
        responseTime: Math.floor(Math.random() * 60) + 20,
        errorRate: Math.random() * 0.03,
        lastCheck: new Date(),
        endpoint: 'https://notifications.bank.com/health'
      }
    ];

    // Generate mock database metrics
    const generateDatabaseMetrics = (): DatabaseMetric[] => [
      {
        id: 'primary',
        name: 'Primary Database',
        connectionPool: {
          active: Math.floor(Math.random() * 50) + 10,
          idle: Math.floor(Math.random() * 20) + 5,
          total: 100
        },
        queryPerformance: {
          avgResponseTime: Math.floor(Math.random() * 50) + 10,
          slowQueries: Math.floor(Math.random() * 5),
          totalQueries: Math.floor(Math.random() * 10000) + 5000
        },
        storage: {
          used: Math.floor(Math.random() * 800) + 200,
          total: 1000,
          growth: Math.random() * 5
        },
        lastUpdated: new Date()
      },
      {
        id: 'replica',
        name: 'Read Replica',
        connectionPool: {
          active: Math.floor(Math.random() * 30) + 5,
          idle: Math.floor(Math.random() * 15) + 3,
          total: 50
        },
        queryPerformance: {
          avgResponseTime: Math.floor(Math.random() * 40) + 8,
          slowQueries: Math.floor(Math.random() * 3),
          totalQueries: Math.floor(Math.random() * 8000) + 3000
        },
        storage: {
          used: Math.floor(Math.random() * 800) + 200,
          total: 1000,
          growth: Math.random() * 3
        },
        lastUpdated: new Date()
      }
    ];

    const updateMetrics = () => {
      const metrics = generateSystemMetrics();
      // Update status based on thresholds
      metrics.forEach(metric => {
        if (metric.value >= metric.threshold.critical) {
          metric.status = 'critical';
        } else if (metric.value >= metric.threshold.warning) {
          metric.status = 'warning';
        } else {
          metric.status = 'healthy';
        }
      });
      
      setSystemMetrics(metrics);
      setServiceStatuses(generateServiceStatuses());
      setDatabaseMetrics(generateDatabaseMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'online': return 'text-green-600 bg-green-100';
      case 'warning': case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health Metrics</h1>
              <p className="text-gray-600 mt-1">Detailed system performance and health monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              <div className="text-sm text-gray-500">
                Auto-refresh: 5s
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Warning</span>
                  <span className="text-yellow-600">{metric.threshold.warning}{metric.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Critical</span>
                  <span className="text-red-600">{metric.threshold.critical}{metric.unit}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'critical' ? 'bg-red-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metric.value / metric.threshold.critical * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
            <p className="text-sm text-gray-600">Microservices health and performance</p>
          </div>
          <div className="overflow-hidden">
            {serviceStatuses.map((service) => (
              <div key={service.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'online' ? 'bg-green-500' :
                      service.status === 'degraded' ? 'bg-yellow-500' :
                      service.status === 'offline' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                      <p className="text-xs text-gray-500">{service.endpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-medium text-gray-900">{formatUptime(service.uptime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Response Time</p>
                      <p className="text-sm font-medium text-gray-900">{service.responseTime}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className="text-sm font-medium text-gray-900">{(service.errorRate * 100).toFixed(2)}%</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {databaseMetrics.map((db) => (
            <div key={db.id} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{db.name}</h2>
                <p className="text-sm text-gray-600">Database performance metrics</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Connection Pool */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Connection Pool</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{db.connectionPool.active}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{db.connectionPool.idle}</p>
                      <p className="text-xs text-gray-500">Idle</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{db.connectionPool.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(db.connectionPool.active / db.connectionPool.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Query Performance */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Query Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="text-sm font-medium text-gray-900">{db.queryPerformance.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Slow Queries</span>
                      <span className="text-sm font-medium text-red-600">{db.queryPerformance.slowQueries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Queries</span>
                      <span className="text-sm font-medium text-gray-900">{db.queryPerformance.totalQueries.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Storage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="text-sm font-medium text-gray-900">{formatBytes(db.storage.used * 1024 * 1024 * 1024)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-sm font-medium text-gray-900">{formatBytes(db.storage.total * 1024 * 1024 * 1024)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm font-medium text-blue-600">+{db.storage.growth.toFixed(1)}% /day</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (db.storage.used / db.storage.total) > 0.9 ? 'bg-red-500' :
                          (db.storage.used / db.storage.total) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(db.storage.used / db.storage.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMetrics;