import React, { useState, useEffect } from 'react';

// Interfaces
interface FraudPattern {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionCount: number;
  accuracy: number;
  falsePositiveRate: number;
  enabled: boolean;
  lastTriggered: Date;
  rules: string[];
}

interface FraudAlert {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  riskScore: number;
  patterns: string[];
  status: 'pending' | 'investigating' | 'confirmed' | 'false_positive';
  timestamp: Date;
  location: {
    country: string;
    city: string;
    ip: string;
  };
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  investigator?: string;
  notes?: string;
}

interface RiskMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  confirmedFraud: number;
  falsePositives: number;
  averageRiskScore: number;
  topRiskFactors: { factor: string; weight: number; count: number }[];
  riskDistribution: { range: string; count: number; percentage: number }[];
}

interface MLModelMetrics {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
  trainingDataSize: number;
  status: 'active' | 'training' | 'deprecated';
  features: string[];
}

const FraudDetectionAnalytics: React.FC = () => {
  const [fraudPatterns, setFraudPatterns] = useState<FraudPattern[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [mlModels, setMlModels] = useState<MLModelMetrics[]>([]);
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'alerts' | 'metrics' | 'models'>('patterns');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    // Generate mock fraud patterns
    const generateFraudPatterns = (): FraudPattern[] => [
      {
        id: 'velocity',
        name: 'Transaction Velocity',
        description: 'Multiple transactions in short time period',
        riskLevel: 'high',
        detectionCount: 45,
        accuracy: 92.5,
        falsePositiveRate: 3.2,
        enabled: true,
        lastTriggered: new Date(Date.now() - Math.random() * 86400000),
        rules: [
          'More than 5 transactions in 10 minutes',
          'Transaction amount > $1000 each',
          'Different merchant categories'
        ]
      },
      {
        id: 'location',
        name: 'Unusual Location',
        description: 'Transaction from unexpected geographic location',
        riskLevel: 'medium',
        detectionCount: 23,
        accuracy: 87.3,
        falsePositiveRate: 8.1,
        enabled: true,
        lastTriggered: new Date(Date.now() - Math.random() * 86400000),
        rules: [
          'Location differs from usual pattern',
          'Distance > 500km from last transaction',
          'High-risk country'
        ]
      },
      {
        id: 'amount',
        name: 'Unusual Amount',
        description: 'Transaction amount significantly different from user pattern',
        riskLevel: 'medium',
        detectionCount: 67,
        accuracy: 78.9,
        falsePositiveRate: 12.4,
        enabled: true,
        lastTriggered: new Date(Date.now() - Math.random() * 86400000),
        rules: [
          'Amount > 3x average transaction',
          'Round number amounts',
          'Just below reporting threshold'
        ]
      },
      {
        id: 'device',
        name: 'Device Anomaly',
        description: 'Transaction from new or suspicious device',
        riskLevel: 'high',
        detectionCount: 34,
        accuracy: 94.1,
        falsePositiveRate: 2.8,
        enabled: true,
        lastTriggered: new Date(Date.now() - Math.random() * 86400000),
        rules: [
          'New device fingerprint',
          'VPN or proxy detected',
          'Suspicious user agent'
        ]
      },
      {
        id: 'behavioral',
        name: 'Behavioral Pattern',
        description: 'Deviation from normal user behavior',
        riskLevel: 'critical',
        detectionCount: 12,
        accuracy: 96.7,
        falsePositiveRate: 1.5,
        enabled: true,
        lastTriggered: new Date(Date.now() - Math.random() * 86400000),
        rules: [
          'Login pattern anomaly',
          'Navigation behavior change',
          'Time-of-day deviation'
        ]
      }
    ];

    // Generate mock fraud alerts
    const generateFraudAlerts = (): FraudAlert[] => 
      Array.from({ length: 15 }, (_, i) => ({
        id: `alert-${i + 1}`,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: `user-${Math.floor(Math.random() * 10000)}`,
        userName: `User ${Math.floor(Math.random() * 10000)}`,
        amount: Math.floor(Math.random() * 50000) + 100,
        currency: 'USD',
        riskScore: Math.floor(Math.random() * 100),
        patterns: ['velocity', 'location', 'amount'].slice(0, Math.floor(Math.random() * 3) + 1),
        status: ['pending', 'investigating', 'confirmed', 'false_positive'][Math.floor(Math.random() * 4)] as any,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
        location: {
          country: ['USA', 'UK', 'Germany', 'France', 'Canada'][Math.floor(Math.random() * 5)],
          city: ['New York', 'London', 'Berlin', 'Paris', 'Toronto'][Math.floor(Math.random() * 5)],
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        },
        deviceInfo: {
          type: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          os: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)]
        },
        investigator: Math.random() > 0.5 ? 'John Doe' : undefined,
        notes: Math.random() > 0.7 ? 'Under investigation for suspicious activity patterns' : undefined
      }));

    // Generate mock risk metrics
    const generateRiskMetrics = (): RiskMetrics => ({
      totalTransactions: 125430,
      flaggedTransactions: 1254,
      confirmedFraud: 89,
      falsePositives: 156,
      averageRiskScore: 23.4,
      topRiskFactors: [
        { factor: 'Unusual Location', weight: 0.35, count: 234 },
        { factor: 'High Velocity', weight: 0.28, count: 189 },
        { factor: 'Large Amount', weight: 0.22, count: 167 },
        { factor: 'New Device', weight: 0.15, count: 98 }
      ],
      riskDistribution: [
        { range: '0-20', count: 98234, percentage: 78.3 },
        { range: '21-40', count: 15678, percentage: 12.5 },
        { range: '41-60', count: 7890, percentage: 6.3 },
        { range: '61-80', count: 2345, percentage: 1.9 },
        { range: '81-100', count: 1283, percentage: 1.0 }
      ]
    });

    // Generate mock ML model metrics
    const generateMLModels = (): MLModelMetrics[] => [
      {
        id: 'ensemble-v3',
        name: 'Ensemble Fraud Detector',
        version: '3.2.1',
        accuracy: 94.7,
        precision: 91.2,
        recall: 88.9,
        f1Score: 90.0,
        lastTrained: new Date(Date.now() - 86400000 * 3),
        trainingDataSize: 2500000,
        status: 'active',
        features: [
          'Transaction Amount',
          'Merchant Category',
          'Time of Day',
          'Day of Week',
          'Location',
          'Device Fingerprint',
          'User Behavior Score',
          'Historical Patterns'
        ]
      },
      {
        id: 'neural-v2',
        name: 'Deep Neural Network',
        version: '2.1.0',
        accuracy: 92.3,
        precision: 89.7,
        recall: 85.4,
        f1Score: 87.5,
        lastTrained: new Date(Date.now() - 86400000 * 7),
        trainingDataSize: 1800000,
        status: 'active',
        features: [
          'Transaction Sequence',
          'Behavioral Embeddings',
          'Network Analysis',
          'Temporal Patterns'
        ]
      },
      {
        id: 'xgboost-v1',
        name: 'XGBoost Classifier',
        version: '1.5.2',
        accuracy: 89.1,
        precision: 86.3,
        recall: 82.7,
        f1Score: 84.5,
        lastTrained: new Date(Date.now() - 86400000 * 14),
        trainingDataSize: 1200000,
        status: 'deprecated',
        features: [
          'Statistical Features',
          'Aggregated Metrics',
          'Risk Indicators'
        ]
      }
    ];

    setFraudPatterns(generateFraudPatterns());
    setFraudAlerts(generateFraudAlerts());
    setRiskMetrics(generateRiskMetrics());
    setMlModels(generateMLModels());
  }, [timeRange]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-red-600 bg-red-100';
      case 'false_positive': return 'text-green-600 bg-green-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'deprecated': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateAlertStatus = (alertId: string, newStatus: FraudAlert['status']) => {
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const togglePattern = (patternId: string) => {
    setFraudPatterns(prev => prev.map(pattern => 
      pattern.id === patternId ? { ...pattern, enabled: !pattern.enabled } : pattern
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Analytics</h1>
              <p className="text-gray-600 mt-1">AI-powered fraud detection and pattern analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'patterns', label: 'Fraud Patterns' },
                { id: 'alerts', label: 'Active Alerts' },
                { id: 'metrics', label: 'Risk Metrics' },
                { id: 'models', label: 'ML Models' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Fraud Patterns Tab */}
        {selectedTab === 'patterns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fraudPatterns.map((pattern) => (
              <div key={pattern.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(pattern.riskLevel)}`}>
                      {pattern.riskLevel}
                    </div>
                    <button
                      onClick={() => togglePattern(pattern.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pattern.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pattern.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{pattern.detectionCount}</p>
                    <p className="text-xs text-gray-500">Detections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{pattern.accuracy}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{pattern.falsePositiveRate}%</p>
                    <p className="text-xs text-gray-500">False Positive</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Detection Rules:</h4>
                  <ul className="space-y-1">
                    {pattern.rules.map((rule, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last triggered: {pattern.lastTriggered.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Alerts Tab */}
        {selectedTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Fraud Alerts</h2>
              <p className="text-sm text-gray-600">Recent fraud detection alerts requiring attention</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patterns
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fraudAlerts.slice(0, 10).map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{alert.transactionId}</div>
                          <div className="text-sm text-gray-500">${alert.amount.toLocaleString()} {alert.currency}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{alert.userName}</div>
                          <div className="text-sm text-gray-500">{alert.location.city}, {alert.location.country}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{alert.riskScore}</div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                alert.riskScore >= 80 ? 'bg-red-500' :
                                alert.riskScore >= 60 ? 'bg-orange-500' :
                                alert.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${alert.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {alert.patterns.map((pattern) => (
                            <span key={pattern} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {alert.status === 'pending' && (
                          <select
                            onChange={(e) => updateAlertStatus(alert.id, e.target.value as any)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="" disabled>Update Status</option>
                            <option value="investigating">Investigating</option>
                            <option value="confirmed">Confirmed Fraud</option>
                            <option value="false_positive">False Positive</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Risk Metrics Tab */}
        {selectedTab === 'metrics' && riskMetrics && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{riskMetrics.totalTransactions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Flagged Transactions</p>
                    <p className="text-2xl font-bold text-yellow-600">{riskMetrics.flaggedTransactions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{((riskMetrics.flaggedTransactions / riskMetrics.totalTransactions) * 100).toFixed(2)}% of total</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Confirmed Fraud</p>
                    <p className="text-2xl font-bold text-red-600">{riskMetrics.confirmedFraud.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{((riskMetrics.confirmedFraud / riskMetrics.flaggedTransactions) * 100).toFixed(1)}% of flagged</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                    <p className="text-2xl font-bold text-blue-600">{riskMetrics.averageRiskScore}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Risk Factors</h3>
                <div className="space-y-4">
                  {riskMetrics.topRiskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                          <span className="text-sm text-gray-500">{factor.count} detections</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${factor.weight * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
                <div className="space-y-3">
                  {riskMetrics.riskDistribution.map((range, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 w-12">{range.range}</span>
                        <div className="flex-1 w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-green-500' :
                                index === 1 ? 'bg-yellow-500' :
                                index === 2 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${range.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{range.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{range.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ML Models Tab */}
        {selectedTab === 'models' && (
          <div className="space-y-6">
            {mlModels.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-600">Version {model.version}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(model.status)}`}>
                    {model.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{model.accuracy}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{model.precision}%</p>
                    <p className="text-xs text-gray-500">Precision</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{model.recall}%</p>
                    <p className="text-xs text-gray-500">Recall</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{model.f1Score}%</p>
                    <p className="text-xs text-gray-500">F1 Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Model Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Trained:</span>
                        <span className="text-gray-900">{model.lastTrained.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Training Data Size:</span>
                        <span className="text-gray-900">{model.trainingDataSize.toLocaleString()} samples</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features ({model.features.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedAlert.transactionId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Risk Score</label>
                    <p className="text-sm text-gray-900">{selectedAlert.riskScore}/100</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-sm text-gray-900">${selectedAlert.amount.toLocaleString()} {selectedAlert.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User</label>
                    <p className="text-sm text-gray-900">{selectedAlert.userName}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-sm text-gray-900">{selectedAlert.location.city}, {selectedAlert.location.country}</p>
                  <p className="text-xs text-gray-500">IP: {selectedAlert.location.ip}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Device Information</label>
                  <p className="text-sm text-gray-900">{selectedAlert.deviceInfo.type} - {selectedAlert.deviceInfo.browser} on {selectedAlert.deviceInfo.os}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Triggered Patterns</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAlert.patterns.map((pattern) => (
                      <span key={pattern} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedAlert.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-sm text-gray-900">{selectedAlert.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'investigating');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Start Investigation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionAnalytics;