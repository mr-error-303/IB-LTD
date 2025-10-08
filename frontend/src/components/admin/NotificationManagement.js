import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import notificationChannelManager from '../../services/notificationChannels';
import AdminAlerts from './AdminAlerts';
import UserCommunication from './UserCommunication';

const NotificationManagement = () => {
  const { addNotification } = useNotifications();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [channelSettings, setChannelSettings] = useState({});
  const [deliveryStats, setDeliveryStats] = useState({});
  const [systemSettings, setSystemSettings] = useState({
    realTimeEnabled: true,
    batchProcessing: true,
    retryAttempts: 3,
    retryDelay: 300,
    maxDailyNotifications: 10000,
    rateLimiting: true,
    maintenanceMode: false
  });

  // Load initial data
  useEffect(() => {
    loadChannelSettings();
    loadDeliveryStats();
  }, []);

  const loadChannelSettings = () => {
    const settings = notificationChannelManager.loadSettings();
    setChannelSettings(settings);
  };

  const loadDeliveryStats = () => {
    const stats = notificationChannelManager.getDeliveryStats();
    setDeliveryStats(stats);
  };

  // Handle channel settings update
  const updateChannelSettings = async (channel, settings) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...channelSettings,
        [channel]: { ...channelSettings[channel], ...settings }
      };
      
      const success = notificationChannelManager.saveSettings(updatedSettings);
      if (success) {
        setChannelSettings(updatedSettings);
        addNotification({
          type: 'success',
          title: 'Settings Updated',
          message: `${channel} channel settings updated successfully`,
          autoClose: true,
          duration: 3000
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update channel settings',
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle system settings update
  const updateSystemSettings = async (newSettings) => {
    setLoading(true);
    try {
      setSystemSettings(newSettings);
      // In real app, save to backend
      localStorage.setItem('notificationSystemSettings', JSON.stringify(newSettings));
      
      addNotification({
        type: 'success',
        title: 'System Settings Updated',
        message: 'Notification system settings updated successfully',
        autoClose: true,
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update system settings',
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Test notification channels
  const testChannel = async (channelType) => {
    setLoading(true);
    try {
      const testNotification = {
        id: `test-${Date.now()}`,
        title: 'Test Notification',
        message: `This is a test notification for ${channelType} channel`,
        type: 'info',
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const results = await notificationChannelManager.sendWithPreferences(
        testNotification,
        { channels: [channelType] }
      );

      if (results[channelType]?.success) {
        addNotification({
          type: 'success',
          title: 'Test Successful',
          message: `${channelType} channel test completed successfully`,
          autoClose: true,
          duration: 3000
        });
      } else {
        throw new Error(results[channelType]?.error || 'Test failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: `${channelType} channel test failed: ${error.message}`,
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'channels', label: 'Channels', icon: '📡' },
    { id: 'alerts', label: 'Admin Alerts', icon: '🚨' },
    { id: 'communication', label: 'User Communication', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' }
  ];

  const getChannelStatusColor = (available) => {
    return available ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Notification Management</h2>
        <p className="text-gray-600 mt-1">Manage notification channels, settings, and monitor delivery performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Sent</p>
                    <p className="text-2xl font-bold text-blue-800">{formatNumber(deliveryStats.totalSent || 0)}</p>
                  </div>
                  <span className="text-2xl">📤</span>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Delivered</p>
                    <p className="text-2xl font-bold text-green-800">{formatNumber(deliveryStats.delivered || 0)}</p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red-800">{formatNumber(deliveryStats.failed || 0)}</p>
                  </div>
                  <span className="text-2xl">❌</span>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-800">{formatPercentage(deliveryStats.deliveryRate || 0)}</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            {/* Channel Status Overview */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Channel Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(notificationChannelManager.getAllChannelsStatus()).map(([channel, status]) => (
                  <div key={channel} className={`p-4 rounded-lg border ${getChannelStatusColor(status.available)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{channel}</h4>
                      <span className={`w-3 h-3 rounded-full ${status.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    <p className="text-sm opacity-75">{status.description}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {status.available ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <span className="text-4xl mb-2 block">📋</span>
                <p className="text-gray-500">Recent notification activity will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {Object.entries(channelSettings).map(([channelType, settings]) => {
              const status = notificationChannelManager.getChannelStatus(channelType);
              return (
                <div key={channelType} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-800 capitalize">{channelType}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {status.available ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => testChannel(channelType)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        Test
                      </button>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.enabled}
                          onChange={(e) => updateChannelSettings(channelType, { enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Enabled</span>
                      </label>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{status.description}</p>

                  {/* Channel-specific settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={settings.priority}
                        onChange={(e) => updateChannelSettings(channelType, { priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>High (1)</option>
                        <option value={2}>Medium (2)</option>
                        <option value={3}>Low (3)</option>
                        <option value={4}>Lowest (4)</option>
                      </select>
                    </div>

                    {/* In-app specific settings */}
                    {channelType === 'in-app' && (
                      <>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={settings.autoClose}
                              onChange={(e) => updateChannelSettings(channelType, { autoClose: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Auto Close</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (ms)
                          </label>
                          <input
                            type="number"
                            value={settings.duration}
                            onChange={(e) => updateChannelSettings(channelType, { duration: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1000"
                            max="30000"
                          />
                        </div>
                      </>
                    )}

                    {/* Push specific settings */}
                    {channelType === 'push' && settings.quietHours && (
                      <>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={settings.quietHours.enabled}
                              onChange={(e) => updateChannelSettings(channelType, { 
                                quietHours: { ...settings.quietHours, enabled: e.target.checked }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Quiet Hours</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Start</label>
                            <input
                              type="time"
                              value={settings.quietHours.start}
                              onChange={(e) => updateChannelSettings(channelType, { 
                                quietHours: { ...settings.quietHours, start: e.target.value }
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">End</label>
                            <input
                              type="time"
                              value={settings.quietHours.end}
                              onChange={(e) => updateChannelSettings(channelType, { 
                                quietHours: { ...settings.quietHours, end: e.target.value }
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Channel features */}
                  {status.features && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {status.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Channel limits */}
                  {status.limits && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Limits:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(status.limits).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Admin Alerts Tab */}
        {activeTab === 'alerts' && (
          <AdminAlerts />
        )}

        {/* User Communication Tab */}
        {activeTab === 'communication' && (
          <UserCommunication />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Channel Performance */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Channel Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deliveryStats.channelStats && Object.entries(deliveryStats.channelStats).map(([channel, stats]) => (
                  <div key={channel} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 capitalize mb-2">{channel}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sent:</span>
                        <span className="font-medium">{formatNumber(stats.sent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium">{formatNumber(stats.delivered)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium text-green-600">{formatPercentage(stats.rate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Trends */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Delivery Trends</h3>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <span className="text-4xl mb-2 block">📈</span>
                <p className="text-gray-500">Delivery trend charts will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">General Settings</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.realTimeEnabled}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, realTimeEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Real-time Notifications</span>
                      <p className="text-xs text-gray-500">Enable WebSocket real-time delivery</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.batchProcessing}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, batchProcessing: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Batch Processing</span>
                      <p className="text-xs text-gray-500">Process notifications in batches</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.rateLimiting}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, rateLimiting: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Rate Limiting</span>
                      <p className="text-xs text-gray-500">Limit notification sending rate</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                      <p className="text-xs text-gray-500">Disable all notifications</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Performance Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      value={systemSettings.retryAttempts}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, retryAttempts: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of retry attempts for failed notifications</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retry Delay (seconds)
                    </label>
                    <input
                      type="number"
                      value={systemSettings.retryDelay}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, retryDelay: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                      max="3600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Delay between retry attempts</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Notification Limit
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxDailyNotifications}
                      onChange={(e) => updateSystemSettings({ ...systemSettings, maxDailyNotifications: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1000"
                      max="100000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum notifications per day</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => updateSystemSettings(systemSettings)}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;