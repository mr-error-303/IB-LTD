import React, { useState, useEffect } from 'react';
import { Database, HardDrive, RefreshCw, Download, Upload, Trash2, Play, Pause, AlertTriangle, CheckCircle, Clock, BarChart3, Settings, Zap, Shield, FileText, Calendar, Activity, TrendingUp, Server, Cpu, MemoryStick } from 'lucide-react';

// Interfaces for database management
interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
  size: string;
  tables: number;
  connections: number;
  maxConnections: number;
}

interface BackupJob {
  id: string;
  name: string;
  database: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun: string;
  nextRun: string;
  size: string;
  duration: number;
  retention: number;
  location: string;
}

interface DatabaseMetrics {
  totalSize: string;
  totalTables: number;
  totalConnections: number;
  queryPerformance: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  storage: {
    used: string;
    available: string;
    percentage: number;
  };
  performance: {
    cpu: number;
    memory: number;
    diskIO: number;
  };
}

interface OptimizationTask {
  id: string;
  name: string;
  type: 'index' | 'vacuum' | 'analyze' | 'reindex' | 'cleanup';
  database: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun: string;
  duration: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

const DatabaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState('main');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Mock data for database connections
  const [databases] = useState<DatabaseConnection[]>([
    {
      id: 'main',
      name: 'Main Database',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'banking_portal',
      status: 'connected',
      lastChecked: '2024-01-15T14:30:00Z',
      size: '2.4 GB',
      tables: 45,
      connections: 12,
      maxConnections: 100
    },
    {
      id: 'analytics',
      name: 'Analytics Database',
      type: 'postgresql',
      host: 'analytics-db.internal',
      port: 5432,
      database: 'analytics',
      status: 'connected',
      lastChecked: '2024-01-15T14:29:00Z',
      size: '890 MB',
      tables: 23,
      connections: 5,
      maxConnections: 50
    },
    {
      id: 'cache',
      name: 'Redis Cache',
      type: 'redis',
      host: 'redis.internal',
      port: 6379,
      database: '0',
      status: 'connected',
      lastChecked: '2024-01-15T14:30:00Z',
      size: '156 MB',
      tables: 0,
      connections: 8,
      maxConnections: 1000
    },
    {
      id: 'logs',
      name: 'Logs Database',
      type: 'mongodb',
      host: 'mongo.internal',
      port: 27017,
      database: 'logs',
      status: 'disconnected',
      lastChecked: '2024-01-15T14:25:00Z',
      size: '1.2 GB',
      tables: 12,
      connections: 0,
      maxConnections: 200
    }
  ]);

  // Mock data for backup jobs
  const [backupJobs] = useState<BackupJob[]>([
    {
      id: 'backup_1',
      name: 'Daily Full Backup',
      database: 'Main Database',
      type: 'full',
      schedule: 'Daily at 2:00 AM',
      status: 'completed',
      lastRun: '2024-01-15T02:00:00Z',
      nextRun: '2024-01-16T02:00:00Z',
      size: '2.4 GB',
      duration: 45,
      retention: 30,
      location: '/backups/daily/'
    },
    {
      id: 'backup_2',
      name: 'Hourly Incremental',
      database: 'Main Database',
      type: 'incremental',
      schedule: 'Every hour',
      status: 'running',
      lastRun: '2024-01-15T14:00:00Z',
      nextRun: '2024-01-15T15:00:00Z',
      size: '45 MB',
      duration: 5,
      retention: 7,
      location: '/backups/incremental/'
    },
    {
      id: 'backup_3',
      name: 'Weekly Analytics Backup',
      database: 'Analytics Database',
      type: 'full',
      schedule: 'Weekly on Sunday',
      status: 'scheduled',
      lastRun: '2024-01-14T03:00:00Z',
      nextRun: '2024-01-21T03:00:00Z',
      size: '890 MB',
      duration: 20,
      retention: 12,
      location: '/backups/weekly/'
    },
    {
      id: 'backup_4',
      name: 'Monthly Archive',
      database: 'Main Database',
      type: 'full',
      schedule: 'Monthly on 1st',
      status: 'failed',
      lastRun: '2024-01-01T01:00:00Z',
      nextRun: '2024-02-01T01:00:00Z',
      size: '2.2 GB',
      duration: 0,
      retention: 365,
      location: '/backups/archive/'
    }
  ]);

  // Mock data for database metrics
  const [metrics] = useState<DatabaseMetrics>({
    totalSize: '4.6 GB',
    totalTables: 80,
    totalConnections: 25,
    queryPerformance: {
      avgQueryTime: 45,
      slowQueries: 12,
      totalQueries: 15420
    },
    storage: {
      used: '4.6 GB',
      available: '15.4 GB',
      percentage: 23
    },
    performance: {
      cpu: 35,
      memory: 68,
      diskIO: 42
    }
  });

  // Mock data for optimization tasks
  const [optimizationTasks] = useState<OptimizationTask[]>([
    {
      id: 'opt_1',
      name: 'Rebuild Indexes',
      type: 'reindex',
      database: 'Main Database',
      status: 'pending',
      lastRun: '2024-01-10T03:00:00Z',
      duration: 25,
      impact: 'medium',
      description: 'Rebuild fragmented indexes to improve query performance',
      recommendation: 'Run during low-traffic hours'
    },
    {
      id: 'opt_2',
      name: 'Vacuum Tables',
      type: 'vacuum',
      database: 'Main Database',
      status: 'completed',
      lastRun: '2024-01-15T04:00:00Z',
      duration: 15,
      impact: 'low',
      description: 'Clean up dead tuples and update statistics',
      recommendation: 'Schedule weekly'
    },
    {
      id: 'opt_3',
      name: 'Analyze Statistics',
      type: 'analyze',
      database: 'Analytics Database',
      status: 'running',
      lastRun: '2024-01-15T14:20:00Z',
      duration: 8,
      impact: 'low',
      description: 'Update table statistics for query optimizer',
      recommendation: 'Run after data loads'
    },
    {
      id: 'opt_4',
      name: 'Clean Old Logs',
      type: 'cleanup',
      database: 'Logs Database',
      status: 'failed',
      lastRun: '2024-01-14T05:00:00Z',
      duration: 0,
      impact: 'high',
      description: 'Remove logs older than 90 days',
      recommendation: 'Check database connection'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'disconnected':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'scheduled':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'disconnected':
      case 'error':
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return <Database className="h-5 w-5" />;
      case 'mongodb':
        return <Server className="h-5 w-5" />;
      case 'redis':
        return <MemoryStick className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleCreateBackup = () => {
    setShowBackupModal(true);
  };

  const handleRestoreDatabase = () => {
    setShowRestoreModal(true);
  };

  const handleRunOptimization = (taskId: string) => {
    if (window.confirm('Are you sure you want to run this optimization task?')) {
      console.log('Running optimization task:', taskId);
    }
  };

  const handleTestConnection = (databaseId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Testing connection for:', databaseId);
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
              <p className="text-gray-600">Monitor, backup, and optimize your databases</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateBackup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Create Backup</span>
              </button>
              <button
                onClick={handleRestoreDatabase}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                <span>Restore</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Connections</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('backups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'backups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Backups</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('optimization')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'optimization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Optimization</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalSize}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tables</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalTables}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Connections</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalConnections}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.queryPerformance.avgQueryTime}ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Used Space</span>
                    <span className="text-sm font-bold text-gray-900">{metrics.storage.used}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${metrics.storage.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Available: {metrics.storage.available}</span>
                    <span>{metrics.storage.percentage}% used</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">CPU Usage</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{metrics.performance.cpu}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Memory Usage</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{metrics.performance.memory}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Disk I/O</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{metrics.performance.diskIO}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.queryPerformance.totalQueries.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.queryPerformance.avgQueryTime}ms</div>
                  <div className="text-sm text-gray-600">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{metrics.queryPerformance.slowQueries}</div>
                  <div className="text-sm text-gray-600">Slow Queries</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map((db) => (
                <div key={db.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getDatabaseIcon(db.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                        <p className="text-sm text-gray-600">{db.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(db.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(db.status)}`}>
                        {db.status.charAt(0).toUpperCase() + db.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Host:</span>
                      <span className="font-medium">{db.host}:{db.port}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Database:</span>
                      <span className="font-medium">{db.database}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{db.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tables:</span>
                      <span className="font-medium">{db.tables}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Connections:</span>
                      <span className="font-medium">{db.connections}/{db.maxConnections}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Checked:</span>
                      <span className="font-medium">{formatDateTime(db.lastChecked)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleTestConnection(db.id)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backup Job
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Database
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backupJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.name}</div>
                            <div className="text-sm text-gray-500">
                              {job.type.charAt(0).toUpperCase() + job.type.slice(1)} backup
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.database}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{job.schedule}</div>
                          <div className="text-sm text-gray-500">Next: {formatDateTime(job.nextRun)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(job.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(job.lastRun)}</div>
                          <div className="text-sm text-gray-500">Duration: {formatDuration(job.duration)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Play className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
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

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Database
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.name}</div>
                            <div className="text-sm text-gray-500">{task.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.database}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(task.impact)}`}>
                            {task.impact.charAt(0).toUpperCase() + task.impact.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(task.lastRun)}</div>
                          <div className="text-sm text-gray-500">Duration: {formatDuration(task.duration)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRunOptimization(task.id)}
                            disabled={task.status === 'running'}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
              <div className="space-y-4">
                {optimizationTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{task.recommendation}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImpactColor(task.impact)}`}>
                        {task.impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Backup Modal */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Create Database Backup</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Database</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      {databases.map(db => (
                        <option key={db.id} value={db.id}>{db.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Backup Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="full">Full Backup</option>
                      <option value="incremental">Incremental Backup</option>
                      <option value="differential">Differential Backup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Backup Name</label>
                    <input
                      type="text"
                      placeholder="Enter backup name..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowBackupModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700"
                    >
                      Create Backup
                    </button>
                    <button
                      onClick={() => setShowBackupModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore Database Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Restore Database</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Database</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      {databases.map(db => (
                        <option key={db.id} value={db.id}>{db.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Backup File</label>
                    <input
                      type="file"
                      accept=".sql,.dump,.backup"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          Warning: This will overwrite the existing database. Make sure you have a backup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowRestoreModal(false)}
                      className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700"
                    >
                      Restore Database
                    </button>
                    <button
                      onClick={() => setShowRestoreModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400"
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

export default DatabaseManagement;