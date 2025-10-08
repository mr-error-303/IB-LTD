import React, { useState, useEffect } from 'react';
import { Settings, Database, Shield, Globe, Mail, Bell, Clock, Users, Lock, Key, Server, Wifi, AlertTriangle, CheckCircle, Save, RefreshCw, Eye, EyeOff, Upload, Download, Trash2, Edit3, Plus } from 'lucide-react';

// Interfaces for system configuration
interface SystemSetting {
  id: string;
  category: string;
  name: string;
  key: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'textarea' | 'file';
  description: string;
  options?: string[];
  required: boolean;
  sensitive: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface ConfigurationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  settingsCount: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  version: string;
  environment: string;
  lastRestart: string;
  configVersion: string;
}

const SystemConfiguration: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});

  // Mock data for configuration categories
  const [categories] = useState<ConfigurationCategory[]>([
    {
      id: 'general',
      name: 'General Settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Basic application configuration',
      settingsCount: 12
    },
    {
      id: 'security',
      name: 'Security Settings',
      icon: <Shield className="h-5 w-5" />,
      description: 'Authentication and security policies',
      settingsCount: 8
    },
    {
      id: 'database',
      name: 'Database Settings',
      icon: <Database className="h-5 w-5" />,
      description: 'Database connection and performance',
      settingsCount: 6
    },
    {
      id: 'email',
      name: 'Email Configuration',
      icon: <Mail className="h-5 w-5" />,
      description: 'SMTP and email notification settings',
      settingsCount: 7
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'System alerts and notification preferences',
      settingsCount: 5
    },
    {
      id: 'api',
      name: 'API Settings',
      icon: <Globe className="h-5 w-5" />,
      description: 'API endpoints and integration settings',
      settingsCount: 9
    }
  ]);

  // Mock data for system settings
  const [settings, setSettings] = useState<SystemSetting[]>([
    // General Settings
    {
      id: 'app_name',
      category: 'general',
      name: 'Application Name',
      key: 'app.name',
      value: 'IB Banking Portal',
      type: 'text',
      description: 'The display name of the application',
      required: true,
      sensitive: false,
      lastModified: '2024-01-15T10:30:00Z',
      modifiedBy: 'John Smith'
    },
    {
      id: 'app_version',
      category: 'general',
      name: 'Application Version',
      key: 'app.version',
      value: '2.1.0',
      type: 'text',
      description: 'Current version of the application',
      required: true,
      sensitive: false,
      lastModified: '2024-01-15T09:00:00Z',
      modifiedBy: 'System'
    },
    {
      id: 'maintenance_mode',
      category: 'general',
      name: 'Maintenance Mode',
      key: 'app.maintenance_mode',
      value: false,
      type: 'boolean',
      description: 'Enable maintenance mode to restrict access',
      required: false,
      sensitive: false,
      lastModified: '2024-01-14T16:45:00Z',
      modifiedBy: 'Sarah Johnson'
    },
    {
      id: 'session_timeout',
      category: 'general',
      name: 'Session Timeout (minutes)',
      key: 'app.session_timeout',
      value: 30,
      type: 'number',
      description: 'User session timeout in minutes',
      required: true,
      sensitive: false,
      lastModified: '2024-01-15T08:15:00Z',
      modifiedBy: 'Mike Davis'
    },
    {
      id: 'max_file_size',
      category: 'general',
      name: 'Max File Upload Size (MB)',
      key: 'app.max_file_size',
      value: 10,
      type: 'number',
      description: 'Maximum file upload size in megabytes',
      required: true,
      sensitive: false,
      lastModified: '2024-01-12T14:20:00Z',
      modifiedBy: 'Lisa Wilson'
    },
    // Security Settings
    {
      id: 'password_min_length',
      category: 'security',
      name: 'Minimum Password Length',
      key: 'security.password_min_length',
      value: 8,
      type: 'number',
      description: 'Minimum required password length',
      required: true,
      sensitive: false,
      lastModified: '2024-01-10T11:30:00Z',
      modifiedBy: 'John Smith'
    },
    {
      id: 'password_complexity',
      category: 'security',
      name: 'Password Complexity',
      key: 'security.password_complexity',
      value: 'high',
      type: 'select',
      options: ['low', 'medium', 'high'],
      description: 'Required password complexity level',
      required: true,
      sensitive: false,
      lastModified: '2024-01-10T11:30:00Z',
      modifiedBy: 'John Smith'
    },
    {
      id: 'two_factor_required',
      category: 'security',
      name: 'Require Two-Factor Authentication',
      key: 'security.two_factor_required',
      value: true,
      type: 'boolean',
      description: 'Require 2FA for all admin users',
      required: false,
      sensitive: false,
      lastModified: '2024-01-08T09:45:00Z',
      modifiedBy: 'Sarah Johnson'
    },
    {
      id: 'jwt_secret',
      category: 'security',
      name: 'JWT Secret Key',
      key: 'security.jwt_secret',
      value: 'super_secret_jwt_key_2024',
      type: 'password',
      description: 'Secret key for JWT token generation',
      required: true,
      sensitive: true,
      lastModified: '2024-01-01T00:00:00Z',
      modifiedBy: 'System'
    },
    // Database Settings
    {
      id: 'db_host',
      category: 'database',
      name: 'Database Host',
      key: 'database.host',
      value: 'localhost',
      type: 'text',
      description: 'Database server hostname or IP address',
      required: true,
      sensitive: false,
      lastModified: '2024-01-01T00:00:00Z',
      modifiedBy: 'System'
    },
    {
      id: 'db_port',
      category: 'database',
      name: 'Database Port',
      key: 'database.port',
      value: 5432,
      type: 'number',
      description: 'Database server port number',
      required: true,
      sensitive: false,
      lastModified: '2024-01-01T00:00:00Z',
      modifiedBy: 'System'
    },
    {
      id: 'db_name',
      category: 'database',
      name: 'Database Name',
      key: 'database.name',
      value: 'banking_portal',
      type: 'text',
      description: 'Name of the database',
      required: true,
      sensitive: false,
      lastModified: '2024-01-01T00:00:00Z',
      modifiedBy: 'System'
    },
    {
      id: 'db_password',
      category: 'database',
      name: 'Database Password',
      key: 'database.password',
      value: 'secure_db_password_123',
      type: 'password',
      description: 'Database user password',
      required: true,
      sensitive: true,
      lastModified: '2024-01-01T00:00:00Z',
      modifiedBy: 'System'
    },
    // Email Settings
    {
      id: 'smtp_host',
      category: 'email',
      name: 'SMTP Host',
      key: 'email.smtp_host',
      value: 'smtp.gmail.com',
      type: 'text',
      description: 'SMTP server hostname',
      required: true,
      sensitive: false,
      lastModified: '2024-01-05T14:20:00Z',
      modifiedBy: 'Lisa Wilson'
    },
    {
      id: 'smtp_port',
      category: 'email',
      name: 'SMTP Port',
      key: 'email.smtp_port',
      value: 587,
      type: 'number',
      description: 'SMTP server port number',
      required: true,
      sensitive: false,
      lastModified: '2024-01-05T14:20:00Z',
      modifiedBy: 'Lisa Wilson'
    },
    {
      id: 'smtp_username',
      category: 'email',
      name: 'SMTP Username',
      key: 'email.smtp_username',
      value: 'noreply@ibbanking.com',
      type: 'text',
      description: 'SMTP authentication username',
      required: true,
      sensitive: false,
      lastModified: '2024-01-05T14:20:00Z',
      modifiedBy: 'Lisa Wilson'
    },
    {
      id: 'smtp_password',
      category: 'email',
      name: 'SMTP Password',
      key: 'email.smtp_password',
      value: 'smtp_secure_password_456',
      type: 'password',
      description: 'SMTP authentication password',
      required: true,
      sensitive: true,
      lastModified: '2024-01-05T14:20:00Z',
      modifiedBy: 'Lisa Wilson'
    },
    // Notification Settings
    {
      id: 'enable_email_notifications',
      category: 'notifications',
      name: 'Enable Email Notifications',
      key: 'notifications.email_enabled',
      value: true,
      type: 'boolean',
      description: 'Enable system email notifications',
      required: false,
      sensitive: false,
      lastModified: '2024-01-12T10:15:00Z',
      modifiedBy: 'Mike Davis'
    },
    {
      id: 'enable_sms_notifications',
      category: 'notifications',
      name: 'Enable SMS Notifications',
      key: 'notifications.sms_enabled',
      value: false,
      type: 'boolean',
      description: 'Enable system SMS notifications',
      required: false,
      sensitive: false,
      lastModified: '2024-01-12T10:15:00Z',
      modifiedBy: 'Mike Davis'
    },
    // API Settings
    {
      id: 'api_rate_limit',
      category: 'api',
      name: 'API Rate Limit (requests/minute)',
      key: 'api.rate_limit',
      value: 100,
      type: 'number',
      description: 'Maximum API requests per minute per user',
      required: true,
      sensitive: false,
      lastModified: '2024-01-08T16:30:00Z',
      modifiedBy: 'Sarah Johnson'
    },
    {
      id: 'api_timeout',
      category: 'api',
      name: 'API Timeout (seconds)',
      key: 'api.timeout',
      value: 30,
      type: 'number',
      description: 'API request timeout in seconds',
      required: true,
      sensitive: false,
      lastModified: '2024-01-08T16:30:00Z',
      modifiedBy: 'Sarah Johnson'
    }
  ]);

  // Mock data for system health
  const [systemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '15 days, 8 hours, 23 minutes',
    version: '2.1.0',
    environment: 'Production',
    lastRestart: '2024-01-01T00:00:00Z',
    configVersion: 'v2.1.0-20240115'
  });

  const filteredSettings = settings.filter(setting => {
    const matchesCategory = setting.category === activeCategory;
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSettingChange = (settingId: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update settings with edited values
      setSettings(prev => prev.map(setting => ({
        ...setting,
        value: editingSettings[setting.id] !== undefined ? editingSettings[setting.id] : setting.value,
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current User'
      })));
      
      setEditingSettings({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all unsaved changes?')) {
      setEditingSettings({});
      setHasUnsavedChanges(false);
    }
  };

  const togglePasswordVisibility = (settingId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = editingSettings[setting.id] !== undefined ? editingSettings[setting.id] : setting.value;

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={currentValue as boolean}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        );
      
      case 'select':
        return (
          <select
            value={currentValue as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      
      case 'password':
        return (
          <div className="relative">
            <input
              type={showPasswords[setting.id] ? 'text' : 'password'}
              value={currentValue as string}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(setting.id)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords[setting.id] ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            value={currentValue as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={currentValue as number}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={currentValue as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configuration</h1>
              <p className="text-gray-600">Manage application settings and system configuration</p>
            </div>
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleResetSettings}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getHealthStatusIcon(systemHealth.status)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getHealthStatusColor(systemHealth.status)}`}>
                  {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span>Uptime: {systemHealth.uptime}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>Version: {systemHealth.version}</div>
              <div>Environment: {systemHealth.environment}</div>
              <div>Config: {systemHealth.configVersion}</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Categories Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <nav className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {category.icon}
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {category.settingsCount}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {categories.find(c => c.id === activeCategory)?.description}
              </p>
            </div>

            {hasUnsavedChanges && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    You have unsaved changes. Don't forget to save your configuration.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {filteredSettings.map((setting) => (
                <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-sm font-medium text-gray-900">
                          {setting.name}
                          {setting.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {setting.sensitive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <Lock className="h-3 w-3 mr-1" />
                            Sensitive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                      <div className="max-w-md">
                        {renderSettingInput(setting)}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Key: {setting.key}</span>
                        <span className="mx-2">•</span>
                        <span>Last modified: {new Date(setting.lastModified).toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>By: {setting.modifiedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSettings.length === 0 && (
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No settings found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No settings available in this category.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;