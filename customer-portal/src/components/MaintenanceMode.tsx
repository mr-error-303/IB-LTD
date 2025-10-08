import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, Clock, CheckCircle, Calendar, Users, Server, Database, Globe, Shield, Activity, Bell, Play, Pause, Square, RefreshCw, Download, Upload, Eye, Edit, Trash2, Plus } from 'lucide-react';

// Interfaces for maintenance mode
interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  type: 'planned' | 'emergency' | 'routine';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startTime: string;
  endTime: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  affectedServices: string[];
  assignedTo: string;
  notificationsSent: boolean;
  createdAt: string;
  updatedAt: string;
  completionNotes?: string;
}

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  uptime: number;
  lastCheck: string;
  responseTime: number;
  description: string;
}

interface MaintenanceSettings {
  enableMaintenanceMode: boolean;
  maintenanceMessage: string;
  allowedIPs: string[];
  redirectUrl: string;
  showEstimatedTime: boolean;
  enableNotifications: boolean;
  notificationChannels: string[];
  autoScheduleBackups: boolean;
  gracefulShutdownTime: number; // in minutes
}

interface MaintenanceMetrics {
  totalMaintenances: number;
  completedMaintenances: number;
  averageDuration: number;
  uptime: number;
  plannedDowntime: number;
  unplannedDowntime: number;
  mttr: number; // Mean Time To Recovery
  mtbf: number; // Mean Time Between Failures
}

const MaintenanceMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  // Mock data for maintenance schedules
  const [maintenanceSchedules] = useState<MaintenanceSchedule[]>([
    {
      id: 'maint_1',
      title: 'Database Optimization',
      description: 'Routine database maintenance and optimization tasks',
      type: 'routine',
      status: 'scheduled',
      priority: 'medium',
      startTime: '2024-01-20T02:00:00Z',
      endTime: '2024-01-20T04:00:00Z',
      estimatedDuration: 120,
      affectedServices: ['Database', 'API', 'User Portal'],
      assignedTo: 'Database Team',
      notificationsSent: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'maint_2',
      title: 'Security Patch Deployment',
      description: 'Critical security updates for all system components',
      type: 'planned',
      status: 'scheduled',
      priority: 'high',
      startTime: '2024-01-18T01:00:00Z',
      endTime: '2024-01-18T03:00:00Z',
      estimatedDuration: 120,
      affectedServices: ['All Services'],
      assignedTo: 'Security Team',
      notificationsSent: true,
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-14T09:15:00Z'
    },
    {
      id: 'maint_3',
      title: 'Server Hardware Upgrade',
      description: 'Upgrading primary server hardware for improved performance',
      type: 'planned',
      status: 'completed',
      priority: 'high',
      startTime: '2024-01-12T03:00:00Z',
      endTime: '2024-01-12T06:00:00Z',
      estimatedDuration: 180,
      actualDuration: 165,
      affectedServices: ['Web Portal', 'API', 'Database'],
      assignedTo: 'Infrastructure Team',
      notificationsSent: true,
      createdAt: '2024-01-05T11:20:00Z',
      updatedAt: '2024-01-12T06:15:00Z',
      completionNotes: 'Hardware upgrade completed successfully. System performance improved by 40%.'
    },
    {
      id: 'maint_4',
      title: 'Emergency Security Fix',
      description: 'Emergency maintenance to address critical security vulnerability',
      type: 'emergency',
      status: 'completed',
      priority: 'critical',
      startTime: '2024-01-08T15:30:00Z',
      endTime: '2024-01-08T16:45:00Z',
      estimatedDuration: 60,
      actualDuration: 75,
      affectedServices: ['Authentication', 'API'],
      assignedTo: 'Security Team',
      notificationsSent: true,
      createdAt: '2024-01-08T15:00:00Z',
      updatedAt: '2024-01-08T16:45:00Z',
      completionNotes: 'Security vulnerability patched. All systems secure.'
    },
    {
      id: 'maint_5',
      title: 'Load Balancer Configuration',
      description: 'Updating load balancer configuration for better traffic distribution',
      type: 'routine',
      status: 'active',
      priority: 'medium',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T15:30:00Z',
      estimatedDuration: 90,
      affectedServices: ['Web Portal', 'API'],
      assignedTo: 'DevOps Team',
      notificationsSent: true,
      createdAt: '2024-01-14T16:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z'
    }
  ]);

  // Mock data for system status
  const [systemStatus] = useState<SystemStatus[]>([
    {
      service: 'Web Portal',
      status: 'operational',
      uptime: 99.95,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 120,
      description: 'Customer-facing web application'
    },
    {
      service: 'API Gateway',
      status: 'operational',
      uptime: 99.98,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 85,
      description: 'Core API services'
    },
    {
      service: 'Database',
      status: 'operational',
      uptime: 99.99,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 45,
      description: 'Primary database cluster'
    },
    {
      service: 'Authentication',
      status: 'operational',
      uptime: 99.97,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 95,
      description: 'User authentication service'
    },
    {
      service: 'Payment Processing',
      status: 'operational',
      uptime: 99.92,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 200,
      description: 'Payment gateway integration'
    },
    {
      service: 'Notification Service',
      status: 'degraded',
      uptime: 98.85,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 350,
      description: 'Email and SMS notifications'
    },
    {
      service: 'File Storage',
      status: 'operational',
      uptime: 99.94,
      lastCheck: '2024-01-15T14:30:00Z',
      responseTime: 150,
      description: 'Document and file storage'
    },
    {
      service: 'Analytics',
      status: 'maintenance',
      uptime: 99.88,
      lastCheck: '2024-01-15T14:00:00Z',
      responseTime: 0,
      description: 'Analytics and reporting service'
    }
  ]);

  // Mock data for maintenance settings
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    enableMaintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back shortly.',
    allowedIPs: ['192.168.1.100', '10.0.0.50'],
    redirectUrl: 'https://status.bankingportal.com',
    showEstimatedTime: true,
    enableNotifications: true,
    notificationChannels: ['email', 'sms', 'slack'],
    autoScheduleBackups: true,
    gracefulShutdownTime: 5
  });

  // Mock data for maintenance metrics
  const [metrics] = useState<MaintenanceMetrics>({
    totalMaintenances: 24,
    completedMaintenances: 22,
    averageDuration: 95,
    uptime: 99.87,
    plannedDowntime: 8.5,
    unplannedDowntime: 1.2,
    mttr: 45,
    mtbf: 720
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'maintenance':
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'outage':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
      case 'scheduled':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance':
      case 'active':
        return <Settings className="h-4 w-4" />;
      case 'outage':
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'text-red-600 bg-red-100';
      case 'planned':
        return 'text-blue-600 bg-blue-100';
      case 'routine':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleToggleMaintenanceMode = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsMaintenanceActive(!isMaintenanceActive);
      setMaintenanceSettings(prev => ({
        ...prev,
        enableMaintenanceMode: !isMaintenanceActive
      }));
      setIsLoading(false);
    }, 2000);
  };

  const handleStartMaintenance = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to start this maintenance? This will affect system availability.')) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        console.log('Starting maintenance:', scheduleId);
      }, 2000);
    }
  };

  const handleCompleteMaintenance = (scheduleId: string) => {
    if (window.confirm('Mark this maintenance as completed?')) {
      console.log('Completing maintenance:', scheduleId);
    }
  };

  const handleCancelMaintenance = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to cancel this maintenance?')) {
      console.log('Cancelling maintenance:', scheduleId);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance schedule?')) {
      console.log('Deleting schedule:', scheduleId);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Mode</h1>
              <p className="text-gray-600">Manage system maintenance and downtime</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleMaintenanceMode}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium disabled:opacity-50 ${
                  isMaintenanceActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isMaintenanceActive ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isMaintenanceActive ? 'Exit Maintenance' : 'Enter Maintenance'}</span>
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule Maintenance</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Status Alert */}
        {isMaintenanceActive && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">System is in Maintenance Mode</h3>
                <p className="text-red-700">The system is currently undergoing maintenance. Users may experience limited functionality.</p>
              </div>
            </div>
          </div>
        )}

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
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('schedules')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Maintenance Schedules</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'status'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>System Status</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Metrics</span>
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
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {maintenanceSchedules.filter(s => s.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Settings className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {maintenanceSchedules.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.uptime}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(metrics.averageDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current System Status</h3>
                <div className="space-y-3">
                  {systemStatus.slice(0, 4).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.service}</div>
                          <div className="text-xs text-gray-500">{service.uptime}% uptime</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Maintenance</h3>
                <div className="space-y-3">
                  {maintenanceSchedules
                    .filter(s => s.status === 'scheduled')
                    .slice(0, 3)
                    .map((schedule) => (
                      <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                            {schedule.priority}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>{formatDateTime(schedule.startTime)}</div>
                          <div>Duration: {formatDuration(schedule.estimatedDuration)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Maintenance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                            <div className="text-sm text-gray-500">{schedule.description}</div>
                            <div className="text-xs text-gray-400">
                              Assigned to: {schedule.assignedTo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(schedule.type)}`}>
                            {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(schedule.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                              {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                            {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{formatDateTime(schedule.startTime)}</div>
                            <div className="text-xs text-gray-500">
                              to {formatDateTime(schedule.endTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Est: {formatDuration(schedule.estimatedDuration)}</div>
                            {schedule.actualDuration && (
                              <div className="text-xs text-gray-500">
                                Actual: {formatDuration(schedule.actualDuration)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {schedule.status === 'scheduled' && (
                              <button
                                onClick={() => handleStartMaintenance(schedule.id)}
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            {schedule.status === 'active' && (
                              <button
                                onClick={() => handleCompleteMaintenance(schedule.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            {schedule.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancelMaintenance(schedule.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Pause className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-600 hover:text-red-900"
                            >
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

        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemStatus.map((service, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Server className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.service}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Check:</span>
                      <span className="font-medium">{formatDateTime(service.lastCheck)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          service.uptime >= 99.5 ? 'bg-green-600' :
                          service.uptime >= 98 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${service.uptime}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Maintenances</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalMaintenances}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((metrics.completedMaintenances / metrics.totalMaintenances) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">MTTR</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.mttr}min</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">MTBF</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.mtbf}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Downtime Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Planned Downtime</span>
                    <span className="text-sm font-bold text-blue-600">{metrics.plannedDowntime}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${(metrics.plannedDowntime / (metrics.plannedDowntime + metrics.unplannedDowntime)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Unplanned Downtime</span>
                    <span className="text-sm font-bold text-red-600">{metrics.unplannedDowntime}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{ width: `${(metrics.unplannedDowntime / (metrics.plannedDowntime + metrics.unplannedDowntime)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">System Uptime</span>
                    <span className="text-sm font-bold text-green-600">{metrics.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Average Duration</span>
                    <span className="text-sm font-bold text-gray-900">{formatDuration(metrics.averageDuration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Completed Maintenances</span>
                    <span className="text-sm font-bold text-gray-900">{metrics.completedMaintenances}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {((metrics.completedMaintenances / metrics.totalMaintenances) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Maintenance Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Schedule Maintenance</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      placeholder="Enter maintenance title..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Enter maintenance description..."
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="routine">Routine</option>
                      <option value="planned">Planned</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="datetime-local"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <input
                        type="number"
                        placeholder="60"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => setShowScheduleModal(false)}
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

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Maintenance Settings</h3>
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                    <textarea
                      value={maintenanceSettings.maintenanceMessage}
                      onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL</label>
                    <input
                      type="url"
                      value={maintenanceSettings.redirectUrl}
                      onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, redirectUrl: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Addresses</label>
                    <input
                      type="text"
                      value={maintenanceSettings.allowedIPs.join(', ')}
                      onChange={(e) => setMaintenanceSettings(prev => ({ 
                        ...prev, 
                        allowedIPs: e.target.value.split(',').map(ip => ip.trim()) 
                      }))}
                      placeholder="192.168.1.100, 10.0.0.50"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Graceful Shutdown Time (minutes)</label>
                    <input
                      type="number"
                      value={maintenanceSettings.gracefulShutdownTime}
                      onChange={(e) => setMaintenanceSettings(prev => ({ 
                        ...prev, 
                        gracefulShutdownTime: parseInt(e.target.value) 
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={maintenanceSettings.showEstimatedTime}
                        onChange={(e) => setMaintenanceSettings(prev => ({ 
                          ...prev, 
                          showEstimatedTime: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show estimated completion time</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={maintenanceSettings.enableNotifications}
                        onChange={(e) => setMaintenanceSettings(prev => ({ 
                          ...prev, 
                          enableNotifications: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable maintenance notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={maintenanceSettings.autoScheduleBackups}
                        onChange={(e) => setMaintenanceSettings(prev => ({ 
                          ...prev, 
                          autoScheduleBackups: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto-schedule backups before maintenance</span>
                    </label>
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(false)}
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

export default MaintenanceMode;