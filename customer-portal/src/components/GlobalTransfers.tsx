import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ArrowRightLeft, 
  Building2, 
  CreditCard, 
  Clock, 
  Shield, 
  DollarSign, 
  Euro, 
  PoundSterling,
  Eye,
  EyeOff,
  Send,
  History,
  Calculator,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  Download,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';

// Import individual transfer service components
import SWIFTTransfers from './SWIFTTransfers';
import InternationalWireTransfers from './InternationalWireTransfers';
import PayPalIntegration from './PayPalIntegration';
import WiseIntegration from './WiseIntegration';
import WesternUnionIntegration from './WesternUnionIntegration';

interface TransferService {
  id: string;
  name: string;
  type: 'swift' | 'wire' | 'paypal' | 'wise' | 'western_union';
  icon: string;
  description: string;
  features: string[];
  fees: {
    fixed: number;
    percentage: number;
    currency: string;
  };
  processingTime: string;
  limits: {
    min: number;
    max: number;
    currency: string;
  };
  rating: number;
  availability: string[];
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

interface TransferHistory {
  id: string;
  recipient: string;
  amount: number;
  currency: string;
  service: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  date: string;
  reference: string;
  fees: number;
}

const GlobalTransfers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'swift' | 'wire' | 'paypal' | 'wise' | 'western-union' | 'history' | 'settings'>('overview');

  // Transfer services data
  const [transferServices] = useState<TransferService[]>([
    {
      id: 'swift',
      name: 'SWIFT Network',
      type: 'swift',
      icon: '🏦',
      description: 'Secure bank-to-bank transfers via SWIFT network',
      features: ['Bank-to-bank transfers', 'Global reach', 'Secure & reliable', 'Detailed tracking'],
      fees: { fixed: 25, percentage: 0.1, currency: 'USD' },
      processingTime: '1-5 business days',
      limits: { min: 100, max: 1000000, currency: 'USD' },
      rating: 4.5,
      availability: ['Worldwide']
    },
    {
      id: 'wire',
      name: 'International Wire',
      type: 'wire',
      icon: '⚡',
      description: 'Fast international wire transfers',
      features: ['Same-day processing', 'High limits', 'Bank verification', 'Priority support'],
      fees: { fixed: 35, percentage: 0.15, currency: 'USD' },
      processingTime: 'Same day - 2 business days',
      limits: { min: 500, max: 5000000, currency: 'USD' },
      rating: 4.7,
      availability: ['US', 'EU', 'UK', 'Canada', 'Australia']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'paypal',
      icon: '💙',
      description: 'Send money via PayPal network',
      features: ['Instant transfers', 'Email/phone sending', 'Buyer protection', 'Mobile app'],
      fees: { fixed: 0.99, percentage: 2.9, currency: 'USD' },
      processingTime: 'Instant - 30 minutes',
      limits: { min: 1, max: 10000, currency: 'USD' },
      rating: 4.3,
      availability: ['200+ countries']
    },
    {
      id: 'wise',
      name: 'Wise (TransferWise)',
      type: 'wise',
      icon: '🌍',
      description: 'Low-cost international transfers with real exchange rates',
      features: ['Real exchange rates', 'Low fees', 'Fast transfers', 'Multi-currency account'],
      fees: { fixed: 0, percentage: 0.45, currency: 'USD' },
      processingTime: '20 minutes - 2 business days',
      limits: { min: 1, max: 1000000, currency: 'USD' },
      rating: 4.8,
      availability: ['80+ countries']
    },
    {
      id: 'western_union',
      name: 'Western Union',
      type: 'western_union',
      icon: '🟡',
      description: 'Cash pickup and bank deposit worldwide',
      features: ['Cash pickup', 'Bank deposits', 'Mobile wallets', 'Agent locations'],
      fees: { fixed: 5, percentage: 1.5, currency: 'USD' },
      processingTime: 'Minutes - 1 business day',
      limits: { min: 1, max: 50000, currency: 'USD' },
      rating: 4.2,
      availability: ['200+ countries']
    }
  ]);

  // Exchange rates data
  const [exchangeRates] = useState<ExchangeRate[]>([
    { from: 'USD', to: 'EUR', rate: 0.85, lastUpdated: '2024-01-15 10:30:00', trend: 'up' },
    { from: 'USD', to: 'GBP', rate: 0.73, lastUpdated: '2024-01-15 10:30:00', trend: 'down' },
    { from: 'USD', to: 'BDT', rate: 110.25, lastUpdated: '2024-01-15 10:30:00', trend: 'stable' },
    { from: 'EUR', to: 'USD', rate: 1.18, lastUpdated: '2024-01-15 10:30:00', trend: 'up' },
    { from: 'GBP', to: 'USD', rate: 1.37, lastUpdated: '2024-01-15 10:30:00', trend: 'up' },
    { from: 'BDT', to: 'USD', rate: 0.0091, lastUpdated: '2024-01-15 10:30:00', trend: 'stable' }
  ]);

  // Transfer history data
  const [transferHistory] = useState<TransferHistory[]>([
    {
      id: 'TXN001',
      recipient: 'John Smith (UK)',
      amount: 2500,
      currency: 'USD',
      service: 'Wise',
      status: 'completed',
      date: '2024-01-10',
      reference: 'WS-2024-001',
      fees: 11.25
    },
    {
      id: 'TXN002',
      recipient: 'Maria Garcia (Spain)',
      amount: 1800,
      currency: 'EUR',
      service: 'SWIFT',
      status: 'pending',
      date: '2024-01-12',
      reference: 'SW-2024-002',
      fees: 25.00
    },
    {
      id: 'TXN003',
      recipient: 'Ahmed Hassan (UAE)',
      amount: 5000,
      currency: 'USD',
      service: 'Western Union',
      status: 'completed',
      date: '2024-01-08',
      reference: 'WU-2024-003',
      fees: 75.00
    }
  ]);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' }
  ];

  // Get current exchange rate
  const getCurrentRate = (from: string, to: string): number => {
    const rate = exchangeRates.find(r => r.from === from && r.to === to);
    return rate ? rate.rate : 1;
  };

  // Calculate transfer fees
  const calculateFees = (amount: number, serviceId: string): number => {
    const service = transferServices.find(s => s.id === serviceId);
    if (!service) return 0;
    
    return service.fees.fixed + (amount * service.fees.percentage / 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Transfers</h1>
              <p className="text-gray-600">Send money worldwide with competitive rates and secure transfers</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Exchange Rates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Exchange Rates</h2>
          <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {exchangeRates.slice(0, 6).map((rate) => (
            <div key={`${rate.from}-${rate.to}`} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{rate.from}/{rate.to}</span>
                {getTrendIcon(rate.trend)}
              </div>
              <div className="text-lg font-bold text-gray-900">{rate.rate.toFixed(4)}</div>
              <div className="text-xs text-gray-500">Updated: {new Date(rate.lastUpdated).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Globe },
              { id: 'swift', label: 'SWIFT', icon: Building2 },
              { id: 'wire', label: 'Wire Transfer', icon: Zap },
              { id: 'paypal', label: 'PayPal', icon: CreditCard },
              { id: 'wise', label: 'Wise', icon: Globe },
              { id: 'western-union', label: 'Western Union', icon: MapPin },
              { id: 'history', label: 'History', icon: History },
              { id: 'settings', label: 'Settings', icon: Shield }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Transfer Services Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Available Transfer Services</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Compare services to find the best rates and features</span>
                </div>
              </div>

              <div className="grid gap-4">
                {transferServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{service.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{service.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                              <ul className="space-y-1">
                                {service.features.map((feature, index) => (
                                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm font-medium text-gray-500">Processing Time</span>
                                <p className="text-sm text-gray-900">{service.processingTime}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Transfer Limits</span>
                                <p className="text-sm text-gray-900">
                                  {service.limits.currency} {service.limits.min.toLocaleString()} - {service.limits.max.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Fees</span>
                                <p className="text-sm text-gray-900">
                                  {service.fees.currency} {service.fees.fixed} + {service.fees.percentage}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => {
                            setActiveTab(service.type === 'western_union' ? 'western-union' : service.type);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Use Service
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* SWIFT Transfers */}
          {activeTab === 'swift' && <SWIFTTransfers />}

          {/* International Wire Transfers */}
          {activeTab === 'wire' && <InternationalWireTransfers />}

          {/* PayPal Integration */}
          {activeTab === 'paypal' && <PayPalIntegration />}

          {/* Wise Integration */}
          {activeTab === 'wise' && <WiseIntegration />}

          {/* Western Union Integration */}
          {activeTab === 'western-union' && <WesternUnionIntegration />}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Global Transfer Settings</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Default Preferences</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Transfer Service</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="swift">SWIFT Network</option>
                          <option value="wire">International Wire</option>
                          <option value="paypal">PayPal</option>
                          <option value="wise">Wise</option>
                          <option value="western-union">Western Union</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Notification Settings</h4>
                    <div className="space-y-3">
                      {[
                        'Email notifications for transfers',
                        'SMS alerts for status updates',
                        'Rate change notifications',
                        'Security alerts'
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={index < 3}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label className="text-sm text-gray-700">{setting}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-500">Extra security for transfers</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Enabled
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Transfer Limits</div>
                          <div className="text-sm text-gray-500">Daily: $50,000 | Monthly: $500,000</div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          Modify
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Security Notice</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      All transfers are encrypted and monitored for security. We comply with 
                      international regulations and anti-money laundering requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Transfer History</h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Send className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipient}</div>
                          <div className="text-sm text-gray-500">
                            {transfer.currency} {transfer.amount.toLocaleString()} via {transfer.service}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(transfer.date).toLocaleDateString()} • Ref: {transfer.reference}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          Fee: {currencies.find(c => c.code === transfer.currency)?.symbol}{transfer.fees}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalTransfers;