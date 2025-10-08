import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Shield, Activity, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, Zap, Link, Server, Database, Cloud, Code, Monitor, Bell, Lock, Unlock } from 'lucide-react';

// Interfaces for API management
interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'deprecated' | 'maintenance';
  version: string;
  category: 'payment' | 'authentication' | 'notification' | 'analytics' | 'integration' | 'internal';
  description: string;
  lastUsed: string;
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
  rateLimit: number;
  authentication: 'api_key' | 'oauth' | 'jwt' | 'basic' | 'none';
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'production' | 'development' | 'testing';
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  usageCount: number;
  rateLimit: number;
  ipWhitelist: string[];
}

interface ThirdPartyIntegration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'sms' | 'email' | 'analytics' | 'storage' | 'security';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  version: string;
  description: string;
  configuredAt: string;
  lastSync: string;
  webhookUrl: string;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
  settings: Record<string, any>;
  healthCheck: {
    status: 'healthy' | 'warning' | 'error';
    lastCheck: string;
    responseTime: number;
  };
}

interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  peakRequestsPerMinute: number;
  uptime: number;
  errorRate: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    avgResponseTime: number;
  }>;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  secret: string;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  lastDelivery: string;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
}

const APIManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Mock data for API endpoints
  const [apiEndpoints] = useState<APIEndpoint[]>([
    {
      id: 'ep_1',
      name: 'User Authentication',
      url: '/api/v1/auth/login',
      method: 'POST',
      status: 'active',
      version: 'v1',
      category: 'authentication',
      description: 'Authenticate users and generate JWT tokens',
      lastUsed: '2024-01-15T14:30:00Z',
      requestCount: 15420,
      avgResponseTime: 120,
      errorRate: 0.5,
      rateLimit: 1000,
      authentication: 'jwt'
    },
    {
      id: 'ep_2',
      name: 'Process Payment',
      url: '/api/v1/payments/process',
      method: 'POST',
      status: 'active',
      version: 'v1',
      category: 'payment',
      description: 'Process payment transactions',
      lastUsed: '2024-01-15T14:25:00Z',
      requestCount: 8930,
      avgResponseTime: 450,
      errorRate: 1.2,
      rateLimit: 500,
      authentication: 'api_key'
    },
    {
      id: 'ep_3',
      name: 'Send Notification',
      url: '/api/v1/notifications/send',
      method: 'POST',
      status: 'active',
      version: 'v1',
      category: 'notification',
      description: 'Send push notifications to users',
      lastUsed: '2024-01-15T14:20:00Z',
      requestCount: 25670,
      avgResponseTime: 80,
      errorRate: 0.3,
      rateLimit: 2000,
      authentication: 'api_key'
    },
    {
      id: 'ep_4',
      name: 'Legacy User Data',
      url: '/api/v0/users/data',
      method: 'GET',
      status: 'deprecated',
      version: 'v0',
      category: 'internal',
      description: 'Legacy endpoint for user data retrieval',
      lastUsed: '2024-01-10T10:15:00Z',
      requestCount: 234,
      avgResponseTime: 200,
      errorRate: 5.2,
      rateLimit: 100,
      authentication: 'basic'
    },
    {
      id: 'ep_5',
      name: 'Analytics Data',
      url: '/api/v1/analytics/reports',
      method: 'GET',
      status: 'maintenance',
      version: 'v1',
      category: 'analytics',
      description: 'Generate analytics reports',
      lastUsed: '2024-01-14T16:45:00Z',
      requestCount: 1250,
      avgResponseTime: 1200,
      errorRate: 0.8,
      rateLimit: 200,
      authentication: 'oauth'
    }
  ]);

  // Mock data for API keys
  const [apiKeys] = useState<APIKey[]>([
    {
      id: 'key_1',
      name: 'Production API Key',
      key: 'pk_live_51H7zBkJ2eZvKYlo2C8...',
      type: 'production',
      permissions: ['read:users', 'write:transactions', 'read:reports'],
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      lastUsed: '2024-01-15T14:30:00Z',
      usageCount: 45230,
      rateLimit: 10000,
      ipWhitelist: ['192.168.1.100', '10.0.0.50']
    },
    {
      id: 'key_2',
      name: 'Development API Key',
      key: 'pk_test_51H7zBkJ2eZvKYlo2C8...',
      type: 'development',
      permissions: ['read:users', 'write:test_transactions'],
      status: 'active',
      createdAt: '2024-01-05T10:00:00Z',
      expiresAt: '2024-06-30T23:59:59Z',
      lastUsed: '2024-01-15T12:15:00Z',
      usageCount: 8920,
      rateLimit: 1000,
      ipWhitelist: ['127.0.0.1', '192.168.1.0/24']
    },
    {
      id: 'key_3',
      name: 'Mobile App Key',
      key: 'pk_mobile_51H7zBkJ2eZvKYlo2C8...',
      type: 'production',
      permissions: ['read:users', 'write:transactions', 'read:notifications'],
      status: 'active',
      createdAt: '2024-01-10T08:30:00Z',
      expiresAt: '2025-01-10T08:30:00Z',
      lastUsed: '2024-01-15T14:28:00Z',
      usageCount: 23450,
      rateLimit: 5000,
      ipWhitelist: []
    },
    {
      id: 'key_4',
      name: 'Legacy Integration Key',
      key: 'pk_legacy_51H7zBkJ2eZvKYlo2C8...',
      type: 'production',
      permissions: ['read:legacy_data'],
      status: 'revoked',
      createdAt: '2023-06-01T00:00:00Z',
      expiresAt: '2024-06-01T00:00:00Z',
      lastUsed: '2024-01-05T09:20:00Z',
      usageCount: 1250,
      rateLimit: 500,
      ipWhitelist: ['203.0.113.10']
    }
  ]);

  // Mock data for third-party integrations
  const [integrations] = useState<ThirdPartyIntegration[]>([
    {
      id: 'int_1',
      name: 'Stripe Payment Gateway',
      provider: 'Stripe',
      type: 'payment',
      status: 'connected',
      version: 'v3',
      description: 'Process credit card and bank transfers',
      configuredAt: '2024-01-01T00:00:00Z',
      lastSync: '2024-01-15T14:30:00Z',
      webhookUrl: 'https://api.bankingportal.com/webhooks/stripe',
      credentials: {
        apiKey: 'sk_live_51H7zBkJ2eZvKYlo2C8...',
        secretKey: 'whsec_1234567890abcdef...'
      },
      settings: {
        currency: 'USD',
        captureMethod: 'automatic',
        paymentMethods: ['card', 'bank_transfer']
      },
      healthCheck: {
        status: 'healthy',
        lastCheck: '2024-01-15T14:30:00Z',
        responseTime: 120
      }
    },
    {
      id: 'int_2',
      name: 'Twilio SMS Service',
      provider: 'Twilio',
      type: 'sms',
      status: 'connected',
      version: 'v1',
      description: 'Send SMS notifications and OTP codes',
      configuredAt: '2024-01-02T10:00:00Z',
      lastSync: '2024-01-15T14:25:00Z',
      webhookUrl: 'https://api.bankingportal.com/webhooks/twilio',
      credentials: {
        apiKey: 'AC****************************',
        secretKey: '****************************'
      },
      settings: {
        fromNumber: '+1234567890',
        messagingService: 'MG1234567890abcdef1234567890abcdef'
      },
      healthCheck: {
        status: 'healthy',
        lastCheck: '2024-01-15T14:25:00Z',
        responseTime: 85
      }
    },
    {
      id: 'int_3',
      name: 'SendGrid Email Service',
      provider: 'SendGrid',
      type: 'email',
      status: 'connected',
      version: 'v3',
      description: 'Send transactional and marketing emails',
      configuredAt: '2024-01-03T15:30:00Z',
      lastSync: '2024-01-15T14:20:00Z',
      webhookUrl: 'https://api.bankingportal.com/webhooks/sendgrid',
      credentials: {
        apiKey: 'SG.1234567890abcdef.1234567890abcdef1234567890abcdef'
      },
      settings: {
        fromEmail: 'noreply@bankingportal.com',
        fromName: 'Banking Portal',
        trackingEnabled: true
      },
      healthCheck: {
        status: 'healthy',
        lastCheck: '2024-01-15T14:20:00Z',
        responseTime: 95
      }
    },
    {
      id: 'int_4',
      name: 'Google Analytics',
      provider: 'Google',
      type: 'analytics',
      status: 'error',
      version: 'v4',
      description: 'Track user behavior and application metrics',
      configuredAt: '2024-01-05T12:00:00Z',
      lastSync: '2024-01-14T10:30:00Z',
      webhookUrl: '',
      credentials: {
        clientId: '1234567890-abcdef1234567890abcdef.apps.googleusercontent.com',
        clientSecret: 'GOCSPX-1234567890abcdef1234567890'
      },
      settings: {
        trackingId: 'GA-1234567890',
        dataRetention: '26 months',
        enhancedEcommerce: true
      },
      healthCheck: {
        status: 'error',
        lastCheck: '2024-01-15T14:15:00Z',
        responseTime: 0
      }
    },
    {
      id: 'int_5',
      name: 'AWS S3 Storage',
      provider: 'Amazon Web Services',
      type: 'storage',
      status: 'connected',
      version: 'v4',
      description: 'Store documents and file uploads',
      configuredAt: '2024-01-04T09:15:00Z',
      lastSync: '2024-01-15T14:28:00Z',
      webhookUrl: '',
      credentials: {
        apiKey: 'AKIA1234567890ABCDEF',
        secretKey: 'abcdef1234567890abcdef1234567890abcdef12'
      },
      settings: {
        bucket: 'banking-portal-documents',
        region: 'us-east-1',
        encryption: 'AES256'
      },
      healthCheck: {
        status: 'healthy',
        lastCheck: '2024-01-15T14:28:00Z',
        responseTime: 45
      }
    }
  ]);

  // Mock data for API metrics
  const [metrics] = useState<APIMetrics>({
    totalRequests: 125430,
    successfulRequests: 123890,
    failedRequests: 1540,
    avgResponseTime: 185,
    peakRequestsPerMinute: 450,
    uptime: 99.87,
    errorRate: 1.23,
    topEndpoints: [
      { endpoint: '/api/v1/notifications/send', requests: 25670, avgResponseTime: 80 },
      { endpoint: '/api/v1/auth/login', requests: 15420, avgResponseTime: 120 },
      { endpoint: '/api/v1/payments/process', requests: 8930, avgResponseTime: 450 },
      { endpoint: '/api/v1/users/profile', requests: 7850, avgResponseTime: 95 },
      { endpoint: '/api/v1/transactions/history', requests: 6420, avgResponseTime: 220 }
    ]
  });

  // Mock data for webhooks
  const [webhooks] = useState<WebhookEndpoint[]>([
    {
      id: 'wh_1',
      name: 'Payment Status Updates',
      url: 'https://api.bankingportal.com/webhooks/payments',
      events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
      status: 'active',
      secret: 'whsec_1234567890abcdef1234567890abcdef',
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2
      },
      lastDelivery: '2024-01-15T14:30:00Z',
      successRate: 98.5,
      totalDeliveries: 8920,
      failedDeliveries: 134
    },
    {
      id: 'wh_2',
      name: 'User Registration Events',
      url: 'https://api.bankingportal.com/webhooks/users',
      events: ['user.created', 'user.verified', 'user.suspended'],
      status: 'active',
      secret: 'whsec_abcdef1234567890abcdef1234567890',
      retryPolicy: {
        maxRetries: 5,
        backoffMultiplier: 1.5
      },
      lastDelivery: '2024-01-15T14:25:00Z',
      successRate: 99.2,
      totalDeliveries: 2340,
      failedDeliveries: 19
    },
    {
      id: 'wh_3',
      name: 'Transaction Monitoring',
      url: 'https://external-service.com/webhooks/transactions',
      events: ['transaction.created', 'transaction.completed', 'transaction.disputed'],
      status: 'failed',
      secret: 'whsec_fedcba0987654321fedcba0987654321',
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2
      },
      lastDelivery: '2024-01-14T16:20:00Z',
      successRate: 45.2,
      totalDeliveries: 1250,
      failedDeliveries: 685
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'disconnected':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'deprecated':
      case 'maintenance':
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'error':
      case 'failed':
      case 'revoked':
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
      case 'disconnected':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'deprecated':
      case 'maintenance':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
      case 'failed':
      case 'revoked':
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <Database className="h-4 w-4" />;
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'analytics':
        return <Monitor className="h-4 w-4" />;
      case 'integration':
        return <Link className="h-4 w-4" />;
      case 'internal':
        return <Server className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Database className="h-5 w-5" />;
      case 'sms':
        return <Bell className="h-5 w-5" />;
      case 'email':
        return <Bell className="h-5 w-5" />;
      case 'analytics':
        return <Monitor className="h-5 w-5" />;
      case 'storage':
        return <Cloud className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-600 bg-green-100';
      case 'POST':
        return 'text-blue-600 bg-blue-100';
      case 'PUT':
        return 'text-yellow-600 bg-yellow-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      case 'PATCH':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'text-red-600 bg-red-100';
      case 'development':
        return 'text-blue-600 bg-blue-100';
      case 'testing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleTestEndpoint = (endpointId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Testing endpoint:', endpointId);
    }, 2000);
  };

  const handleRevokeKey = (keyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      console.log('Revoking API key:', keyId);
    }
  };

  const handleTestIntegration = (integrationId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Testing integration:', integrationId);
    }, 2000);
  };

  const handleTestWebhook = (webhookId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Testing webhook:', webhookId);
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Management</h1>
              <p className="text-gray-600">Manage API endpoints, keys, and third-party integrations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Key className="h-4 w-4" />
                <span>Generate API Key</span>
              </button>
              <button
                onClick={() => setShowIntegrationModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                <span>Add Integration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('endpoints')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'endpoints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>API Endpoints</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>API Keys</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Integrations</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'webhooks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Webhooks</span>
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

        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiEndpoints.map((endpoint) => (
                      <tr key={endpoint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                            <div className="text-sm text-gray-500">{endpoint.url}</div>
                            <div className="text-xs text-gray-400">{endpoint.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(endpoint.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                              {endpoint.status.charAt(0).toUpperCase() + endpoint.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(endpoint.category)}
                            <span className="text-sm text-gray-900">{endpoint.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{formatNumber(endpoint.requestCount)} requests</div>
                            <div className="text-xs text-gray-500">
                              {endpoint.avgResponseTime}ms avg • {endpoint.errorRate}% error
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTestEndpoint(endpoint.id)}
                              disabled={isLoading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
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

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{key.name}</div>
                            <div className="text-sm text-gray-500 font-mono flex items-center space-x-2">
                              <span>{showApiKey[key.id] ? key.key : maskApiKey(key.key)}</span>
                              <button
                                onClick={() => toggleApiKeyVisibility(key.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showApiKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">
                              Permissions: {key.permissions.join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKeyTypeColor(key.type)}`}>
                            {key.type.charAt(0).toUpperCase() + key.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(key.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                              {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{formatNumber(key.usageCount)} requests</div>
                            <div className="text-xs text-gray-500">
                              Limit: {formatNumber(key.rateLimit)}/hour
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(key.expiresAt)}</div>
                          <div className="text-xs text-gray-500">
                            Last used: {formatDateTime(key.lastUsed)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Lock className="h-4 w-4" />
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

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(integration.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.healthCheck.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{integration.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">{integration.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="font-medium">{formatDateTime(integration.lastSync)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{integration.healthCheck.responseTime}ms</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTestIntegration(integration.id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Test</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <Settings className="h-4 w-4" />
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Webhook
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webhooks.map((webhook) => (
                      <tr key={webhook.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{webhook.name}</div>
                            <div className="text-sm text-gray-500">{webhook.url}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {webhook.events.slice(0, 2).map((event, index) => (
                              <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1 mb-1">
                                {event}
                              </div>
                            ))}
                            {webhook.events.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{webhook.events.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(webhook.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                              {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{webhook.successRate}%</div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(webhook.totalDeliveries - webhook.failedDeliveries)}/{formatNumber(webhook.totalDeliveries)} delivered
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(webhook.lastDelivery)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTestWebhook(webhook.id)}
                              disabled={isLoading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
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

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalRequests)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.uptime}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Endpoints */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top API Endpoints</h3>
              <div className="space-y-4">
                {metrics.topEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{endpoint.endpoint}</div>
                        <div className="text-xs text-gray-500">{formatNumber(endpoint.requests)} requests</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{endpoint.avgResponseTime}ms</div>
                      <div className="text-xs text-gray-500">avg response</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Successful Requests</span>
                    <span className="text-sm font-bold text-green-600">{formatNumber(metrics.successfulRequests)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${(metrics.successfulRequests / metrics.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Failed Requests</span>
                    <span className="text-sm font-bold text-red-600">{formatNumber(metrics.failedRequests)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{ width: `${(metrics.failedRequests / metrics.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Peak Requests/min</span>
                    <span className="text-sm font-bold text-gray-900">{formatNumber(metrics.peakRequestsPerMinute)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Error Rate</span>
                    <span className="text-sm font-bold text-red-600">{metrics.errorRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">System Uptime</span>
                    <span className="text-sm font-bold text-green-600">{metrics.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-bold text-blue-600">{metrics.avgResponseTime}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate API Key Modal */}
        {showKeyModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Generate API Key</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Name</label>
                    <input
                      type="text"
                      placeholder="Enter key name..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="production">Production</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Permissions</label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Read Users</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Write Transactions</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Read Reports</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowKeyModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700"
                    >
                      Generate Key
                    </button>
                    <button
                      onClick={() => setShowKeyModal(false)}
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

        {/* Add Integration Modal */}
        {showIntegrationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Link className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Add Integration</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Provider</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a provider...</option>
                      <option value="stripe">Stripe (Payment)</option>
                      <option value="twilio">Twilio (SMS)</option>
                      <option value="sendgrid">SendGrid (Email)</option>
                      <option value="aws">AWS S3 (Storage)</option>
                      <option value="google">Google Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Integration Name</label>
                    <input
                      type="text"
                      placeholder="Enter integration name..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="password"
                      placeholder="Enter API key..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="items-center px-4 py-3 mt-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowIntegrationModal(false)}
                      className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700"
                    >
                      Add Integration
                    </button>
                    <button
                      onClick={() => setShowIntegrationModal(false)}
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

export default APIManagement;