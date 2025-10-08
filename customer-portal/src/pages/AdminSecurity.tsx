import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'failed_transaction' | 'unusual_activity' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  userId?: string;
  userName?: string;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordComplexity: boolean;
  ipWhitelisting: boolean;
  fraudDetection: boolean;
}

const AdminSecurity: React.FC = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorRequired: true,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    passwordComplexity: true,
    ipWhitelisting: false,
    fraudDetection: true
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'logs'>('alerts');

  useEffect(() => {
    // Simulate API call to fetch security data
    const fetchSecurityData = async () => {
      try {
        // Mock data - replace with actual API call
        setTimeout(() => {
          const mockAlerts: SecurityAlert[] = [
            {
              id: 'SEC001',
              type: 'suspicious_login',
              severity: 'high',
              title: 'Suspicious Login Attempt',
              description: 'Multiple failed login attempts from IP 192.168.1.100',
              timestamp: '2024-01-20T10:30:00Z',
              status: 'active',
              userId: 'user123',
              userName: 'John Doe'
            },
            {
              id: 'SEC002',
              type: 'unusual_activity',
              severity: 'medium',
              title: 'Unusual Transaction Pattern',
              description: 'Large transaction outside normal pattern detected',
              timestamp: '2024-01-20T09:15:00Z',
              status: 'investigating',
              userId: 'user456',
              userName: 'Jane Smith'
            },
            {
              id: 'SEC003',
              type: 'failed_transaction',
              severity: 'low',
              title: 'Failed Transaction Attempt',
              description: 'Transaction failed due to insufficient funds',
              timestamp: '2024-01-20T08:45:00Z',
              status: 'resolved',
              userId: 'user789',
              userName: 'Bob Johnson'
            }
          ];
          setAlerts(mockAlerts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching security data:', error);
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const severityClasses = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityClasses[severity as keyof typeof severityClasses]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleAlertStatusChange = (alertId: string, newStatus: SecurityAlert['status']) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const handleSettingChange = (setting: keyof SecuritySettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
        <div className="flex space-x-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Emergency Lock
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Security Report
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Alerts</h3>
          <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Under Investigation</h3>
          <p className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.status === 'investigating').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved Today</h3>
          <p className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">System Status</h3>
          <p className="text-2xl font-bold text-green-600">Secure</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'alerts', label: 'Security Alerts' },
              { id: 'settings', label: 'Security Settings' },
              { id: 'logs', label: 'Audit Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Security Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                        {getSeverityBadge(alert.severity)}
                        {getStatusBadge(alert.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {alert.id}</span>
                        <span>Time: {formatDateTime(alert.timestamp)}</span>
                        {alert.userName && <span>User: {alert.userName}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'investigating')}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        >
                          Investigate
                        </button>
                      )}
                      {alert.status === 'investigating' && (
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'resolved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      )}
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Authentication Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                      <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.twoFactorRequired}
                      onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Password Complexity</label>
                      <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.passwordComplexity}
                      onChange={(e) => handleSettingChange('passwordComplexity', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Security Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">IP Whitelisting</label>
                      <p className="text-sm text-gray-500">Restrict access to approved IP addresses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ipWhitelisting}
                      onChange={(e) => handleSettingChange('ipWhitelisting', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fraud Detection</label>
                      <p className="text-sm text-gray-500">Enable automated fraud detection</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.fraudDetection}
                      onChange={(e) => handleSettingChange('fraudDetection', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Reset to Default
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Security Audit Logs</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Export Logs
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-gray-600">[2024-01-20 10:30:15] INFO: Admin login successful - user: admin@bank.com</div>
                  <div className="text-yellow-600">[2024-01-20 10:25:32] WARN: Failed login attempt - IP: 192.168.1.100</div>
                  <div className="text-red-600">[2024-01-20 10:20:45] ERROR: Suspicious activity detected - user: user123</div>
                  <div className="text-gray-600">[2024-01-20 10:15:22] INFO: Security settings updated - admin: admin@bank.com</div>
                  <div className="text-gray-600">[2024-01-20 10:10:18] INFO: User account locked - user: user456</div>
                  <div className="text-yellow-600">[2024-01-20 10:05:33] WARN: Multiple failed transactions - user: user789</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;