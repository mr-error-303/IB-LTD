import React, { useState, useEffect } from 'react';

// Interfaces
interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'transaction' | 'security' | 'system' | 'fraud';
  condition: string;
  threshold: number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: ('push' | 'email' | 'sms')[];
  recipients: string[];
  cooldown: number; // minutes
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  createdBy: string;
}

interface NotificationChannel {
  id: string;
  type: 'push' | 'email' | 'sms';
  name: string;
  enabled: boolean;
  config: {
    endpoint?: string;
    apiKey?: string;
    template?: string;
    sender?: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastUsed?: Date;
  successRate: number;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  type: 'transaction' | 'security' | 'system' | 'fraud';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  channels: string[];
  recipients: string[];
  status: 'sent' | 'failed' | 'pending';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

interface ReportSchedule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  frequency: string; // cron expression
  recipients: string[];
  channels: ('email' | 'sms')[];
  content: string[];
  enabled: boolean;
  lastSent?: Date;
  nextSend: Date;
  createdAt: Date;
}

const AlertSystem: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [selectedTab, setSelectedTab] = useState<'rules' | 'channels' | 'history' | 'reports'>('rules');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [editingReport, setEditingReport] = useState<ReportSchedule | null>(null);

  // Mock data initialization
  useEffect(() => {
    // Mock alert rules
    const mockRules: AlertRule[] = [
      {
        id: 'rule_1',
        name: 'High Value Transaction',
        description: 'Alert when transaction exceeds $10,000',
        type: 'transaction',
        condition: 'amount > threshold',
        threshold: 10000,
        enabled: true,
        priority: 'high',
        channels: ['push', 'email'],
        recipients: ['admin@bank.com', 'security@bank.com'],
        cooldown: 5,
        triggerCount: 23,
        createdAt: new Date('2024-01-15'),
        createdBy: 'admin'
      },
      {
        id: 'rule_2',
        name: 'Failed Login Attempts',
        description: 'Alert after 5 consecutive failed login attempts',
        type: 'security',
        condition: 'failed_attempts >= threshold',
        threshold: 5,
        enabled: true,
        priority: 'critical',
        channels: ['push', 'email', 'sms'],
        recipients: ['security@bank.com', '+1234567890'],
        cooldown: 10,
        triggerCount: 8,
        createdAt: new Date('2024-01-10'),
        createdBy: 'security_admin'
      },
      {
        id: 'rule_3',
        name: 'System CPU Usage',
        description: 'Alert when CPU usage exceeds 85%',
        type: 'system',
        condition: 'cpu_usage > threshold',
        threshold: 85,
        enabled: true,
        priority: 'medium',
        channels: ['email'],
        recipients: ['ops@bank.com'],
        cooldown: 15,
        triggerCount: 12,
        createdAt: new Date('2024-01-20'),
        createdBy: 'ops_admin'
      },
      {
        id: 'rule_4',
        name: 'Fraud Pattern Detection',
        description: 'Alert when AI detects suspicious patterns',
        type: 'fraud',
        condition: 'ai_confidence > threshold',
        threshold: 90,
        enabled: true,
        priority: 'critical',
        channels: ['push', 'email', 'sms'],
        recipients: ['fraud@bank.com', '+1234567891'],
        cooldown: 0,
        triggerCount: 5,
        createdAt: new Date('2024-01-25'),
        createdBy: 'fraud_admin'
      }
    ];

    // Mock notification channels
    const mockChannels: NotificationChannel[] = [
      {
        id: 'channel_1',
        type: 'push',
        name: 'Web Push Notifications',
        enabled: true,
        config: {
          endpoint: 'https://fcm.googleapis.com/fcm/send',
          apiKey: 'AIza***************'
        },
        status: 'active',
        lastUsed: new Date(),
        successRate: 98.5
      },
      {
        id: 'channel_2',
        type: 'email',
        name: 'SMTP Email Service',
        enabled: true,
        config: {
          endpoint: 'smtp.bank.com:587',
          sender: 'alerts@bank.com',
          template: 'alert_template_v1'
        },
        status: 'active',
        lastUsed: new Date(),
        successRate: 99.2
      },
      {
        id: 'channel_3',
        type: 'sms',
        name: 'Twilio SMS Service',
        enabled: true,
        config: {
          endpoint: 'https://api.twilio.com/2010-04-01',
          apiKey: 'AC***************',
          sender: '+1234567890'
        },
        status: 'active',
        lastUsed: new Date(),
        successRate: 97.8
      }
    ];

    // Mock alert history
    const mockHistory: AlertHistory[] = [
      {
        id: 'alert_1',
        ruleId: 'rule_1',
        ruleName: 'High Value Transaction',
        type: 'transaction',
        priority: 'high',
        message: 'Transaction of $15,000 detected from user_123',
        channels: ['push', 'email'],
        recipients: ['admin@bank.com', 'security@bank.com'],
        status: 'sent',
        timestamp: new Date(),
        acknowledged: false
      },
      {
        id: 'alert_2',
        ruleId: 'rule_2',
        ruleName: 'Failed Login Attempts',
        type: 'security',
        priority: 'critical',
        message: '5 consecutive failed login attempts from IP 192.168.1.100',
        channels: ['push', 'email', 'sms'],
        recipients: ['security@bank.com', '+1234567890'],
        status: 'sent',
        timestamp: new Date(Date.now() - 300000),
        acknowledged: true,
        acknowledgedBy: 'security_admin',
        acknowledgedAt: new Date(Date.now() - 240000)
      }
    ];

    // Mock report schedules
    const mockReports: ReportSchedule[] = [
      {
        id: 'report_1',
        name: 'Daily Security Summary',
        type: 'daily',
        frequency: '0 8 * * *',
        recipients: ['security@bank.com', 'admin@bank.com'],
        channels: ['email'],
        content: ['failed_logins', 'blocked_ips', 'fraud_alerts'],
        enabled: true,
        lastSent: new Date(Date.now() - 86400000),
        nextSend: new Date(Date.now() + 3600000),
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'report_2',
        name: 'Weekly Transaction Report',
        type: 'weekly',
        frequency: '0 9 * * 1',
        recipients: ['finance@bank.com', 'admin@bank.com'],
        channels: ['email'],
        content: ['transaction_volume', 'high_value_transactions', 'failed_transactions'],
        enabled: true,
        lastSent: new Date(Date.now() - 604800000),
        nextSend: new Date(Date.now() + 86400000),
        createdAt: new Date('2024-01-01')
      }
    ];

    setAlertRules(mockRules);
    setNotificationChannels(mockChannels);
    setAlertHistory(mockHistory);
    setReportSchedules(mockReports);
  }, []);

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleToggleChannel = (channelId: string) => {
    setNotificationChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlertHistory(prev => prev.map(alert => 
      alert.id === alertId ? { 
        ...alert, 
        acknowledged: true, 
        acknowledgedBy: 'current_user',
        acknowledgedAt: new Date()
      } : alert
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'sent': return 'text-green-600 bg-green-100';
      case 'inactive': case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alert Management System</h1>
              <p className="text-gray-600 mt-1">Configure notifications, alerts, and automated reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRuleModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>New Alert Rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'rules', name: 'Alert Rules', icon: '⚡', count: alertRules.length },
                { id: 'channels', name: 'Notification Channels', icon: '📢', count: notificationChannels.length },
                { id: 'history', name: 'Alert History', icon: '📋', count: alertHistory.length },
                { id: 'reports', name: 'Scheduled Reports', icon: '📊', count: reportSchedules.length }
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
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Alert Rules Tab */}
        {selectedTab === 'rules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Custom Alert Rules</h2>
                <p className="text-sm text-gray-600">Configure conditions and thresholds for automated alerts</p>
              </div>
              <div className="overflow-hidden">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={() => handleToggleRule(rule.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rule.priority)}`}>
                              {rule.priority}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                              {rule.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Threshold: {rule.threshold.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Triggered: {rule.triggerCount} times
                            </p>
                            <p className="text-xs text-gray-500">
                              Channels: {rule.channels.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setShowRuleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notification Channels Tab */}
        {selectedTab === 'channels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notificationChannels.map((channel) => (
                <div key={channel.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">
                          {channel.type === 'push' ? '🔔' : 
                           channel.type === 'email' ? '📧' : '📱'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{channel.type}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channel.enabled}
                        onChange={() => handleToggleChannel(channel.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(channel.status)}`}>
                        {channel.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-gray-900">{channel.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Used</span>
                      <span className="text-sm text-gray-900">
                        {channel.lastUsed ? formatTime(channel.lastUsed) : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setEditingChannel(channel);
                        setShowChannelModal(true);
                      }}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Configure Channel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert History Tab */}
        {selectedTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                <p className="text-sm text-gray-600">History of triggered alerts and notifications</p>
              </div>
              <div className="overflow-hidden">
                {alertHistory.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPriorityColor(alert.priority)}`}>
                            <span className="font-semibold">
                              {alert.priority === 'critical' ? '🚨' :
                               alert.priority === 'high' ? '⚠️' :
                               alert.priority === 'medium' ? '⚡' : 'ℹ️'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{alert.ruleName}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                              {alert.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Channels: {alert.channels.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Recipients: {alert.recipients.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTime(alert.timestamp)}</p>
                        {!alert.acknowledged ? (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <div className="mt-2">
                            <span className="text-xs text-green-600">✓ Acknowledged</span>
                            <p className="text-xs text-gray-500">
                              by {alert.acknowledgedBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
                <p className="text-sm text-gray-600">Automated email and SMS reports</p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>New Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportSchedules.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{report.type} Report</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={report.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recipients</span>
                      <span className="text-sm font-medium text-gray-900">{report.recipients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Channels</span>
                      <span className="text-sm text-gray-900">{report.channels.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sent</span>
                      <span className="text-sm text-gray-900">
                        {report.lastSent ? formatTime(report.lastSent) : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Send</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatTime(report.nextSend)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingReport(report);
                        setShowReportModal(true);
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium">
                      Send Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertSystem;