import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Banknote, 
  FileText, 
  Calendar, 
  User, 
  Shield,
  Network,
  Lock,
  DollarSign,
  Calculator,
  Smartphone,
  QrCode,
  Link,
  Star,
  TrendingUp,
  Users,
  CreditCard,
  MapPin,
  Percent,
  Timer,
  Target,
  Award,
  Briefcase,
  PiggyBank
} from 'lucide-react';

interface WiseAccount {
  id: string;
  profileId: string;
  type: 'personal' | 'business';
  name: string;
  email: string;
  verified: boolean;
  balances: WiseBalance[];
  limits: {
    daily: number;
    monthly: number;
    remaining: number;
  };
}

interface WiseBalance {
  currency: string;
  amount: number;
  reserved: number;
  available: number;
}

interface WiseTransfer {
  id: string;
  reference: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  recipient: {
    name: string;
    email?: string;
    accountNumber?: string;
    iban?: string;
    country: string;
  };
  status: 'processing' | 'sent' | 'completed' | 'cancelled' | 'refunded';
  created: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  purpose: string;
}

interface WiseRate {
  source: string;
  target: string;
  rate: number;
  fee: number;
  feePercentage: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

interface WiseRecipient {
  id: string;
  name: string;
  email?: string;
  country: string;
  currency: string;
  accountDetails: {
    type: 'bank' | 'iban' | 'swift' | 'local';
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
    routingNumber?: string;
    sortCode?: string;
  };
  verified: boolean;
}

const WiseIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'balances' | 'recipients' | 'rates' | 'history' | 'settings'>('send');
  const [transferAmount, setTransferAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true);

  // Wise Account Info
  const [wiseAccount] = useState<WiseAccount>({
    id: 'wise_acc_001',
    profileId: 'prof_12345',
    type: 'business',
    name: 'Your Business Account',
    email: 'business@company.com',
    verified: true,
    balances: [
      { currency: 'USD', amount: 25420.50, reserved: 1200.00, available: 24220.50 },
      { currency: 'EUR', amount: 18750.25, reserved: 500.00, available: 18250.25 },
      { currency: 'GBP', amount: 12340.80, reserved: 0, available: 12340.80 },
      { currency: 'CAD', amount: 8950.00, reserved: 250.00, available: 8700.00 },
      { currency: 'AUD', amount: 15600.75, reserved: 0, available: 15600.75 }
    ],
    limits: {
      daily: 50000,
      monthly: 250000,
      remaining: 42500
    }
  });

  // Exchange Rates
  const [exchangeRates] = useState<WiseRate[]>([
    { source: 'USD', target: 'EUR', rate: 0.8542, fee: 4.25, feePercentage: 0.43, lastUpdated: '2024-01-13T10:30:00Z', trend: 'up' },
    { source: 'USD', target: 'GBP', rate: 0.7891, fee: 3.85, feePercentage: 0.41, lastUpdated: '2024-01-13T10:30:00Z', trend: 'down' },
    { source: 'USD', target: 'CAD', rate: 1.3456, fee: 5.50, feePercentage: 0.45, lastUpdated: '2024-01-13T10:30:00Z', trend: 'stable' },
    { source: 'USD', target: 'AUD', rate: 1.4823, fee: 6.20, feePercentage: 0.48, lastUpdated: '2024-01-13T10:30:00Z', trend: 'up' },
    { source: 'EUR', target: 'USD', rate: 1.1706, fee: 4.25, feePercentage: 0.43, lastUpdated: '2024-01-13T10:30:00Z', trend: 'down' },
    { source: 'GBP', target: 'USD', rate: 1.2673, fee: 3.85, feePercentage: 0.41, lastUpdated: '2024-01-13T10:30:00Z', trend: 'up' }
  ]);

  // Recipients
  const [recipients] = useState<WiseRecipient[]>([
    {
      id: 'rec_001',
      name: 'European Supplier Ltd',
      email: 'payments@europeansupplier.com',
      country: 'Germany',
      currency: 'EUR',
      accountDetails: {
        type: 'iban',
        iban: 'DE89370400440532013000'
      },
      verified: true
    },
    {
      id: 'rec_002',
      name: 'UK Partner Services',
      country: 'United Kingdom',
      currency: 'GBP',
      accountDetails: {
        type: 'local',
        accountNumber: '12345678',
        sortCode: '12-34-56'
      },
      verified: true
    },
    {
      id: 'rec_003',
      name: 'Canadian Vendor Inc',
      email: 'finance@canadianvendor.ca',
      country: 'Canada',
      currency: 'CAD',
      accountDetails: {
        type: 'local',
        accountNumber: '123456789',
        routingNumber: '12345'
      },
      verified: false
    }
  ]);

  // Transfer History
  const [transferHistory] = useState<WiseTransfer[]>([
    {
      id: 'wise_001',
      reference: 'WS2024001001',
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      sourceAmount: 5000,
      targetAmount: 4271.00,
      rate: 0.8542,
      fee: 21.50,
      recipient: {
        name: 'European Supplier Ltd',
        country: 'Germany',
        iban: 'DE89370400440532013000'
      },
      status: 'completed',
      created: '2024-01-10T09:00:00Z',
      estimatedDelivery: '2024-01-10T15:00:00Z',
      actualDelivery: '2024-01-10T14:32:00Z',
      purpose: 'Invoice payment'
    },
    {
      id: 'wise_002',
      reference: 'WS2024001002',
      sourceCurrency: 'USD',
      targetCurrency: 'GBP',
      sourceAmount: 3000,
      targetAmount: 2367.30,
      rate: 0.7891,
      fee: 12.30,
      recipient: {
        name: 'UK Partner Services',
        country: 'United Kingdom',
        accountNumber: '12345678'
      },
      status: 'sent',
      created: '2024-01-11T11:30:00Z',
      estimatedDelivery: '2024-01-11T16:00:00Z',
      purpose: 'Service payment'
    },
    {
      id: 'wise_003',
      reference: 'WS2024001003',
      sourceCurrency: 'EUR',
      targetCurrency: 'USD',
      sourceAmount: 2500,
      targetAmount: 2926.50,
      rate: 1.1706,
      fee: 10.75,
      recipient: {
        name: 'US Technology Corp',
        country: 'United States',
        email: 'payments@ustech.com'
      },
      status: 'processing',
      created: '2024-01-12T14:15:00Z',
      estimatedDelivery: '2024-01-12T18:00:00Z',
      purpose: 'Software licensing'
    }
  ]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'refunded': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  // Calculate Wise fees
  const calculateWiseFees = (amount: number, source: string, target: string): { fee: number; rate: number; received: number } => {
    const rateInfo = exchangeRates.find(r => r.source === source && r.target === target);
    if (!rateInfo) return { fee: 0, rate: 1, received: amount };
    
    const fee = (amount * rateInfo.feePercentage / 100) + rateInfo.fee;
    const received = (amount - fee) * rateInfo.rate;
    
    return { fee, rate: rateInfo.rate, received };
  };

  // Get balance for currency
  const getBalance = (currency: string): WiseBalance | null => {
    return wiseAccount.balances.find(b => b.currency === currency) || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wise Integration</h1>
              <p className="text-gray-600">Low-cost international transfers with real exchange rates</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Connection Status</div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Quick Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Currency Balances Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-green-900">Wise Multi-Currency Account</h3>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
            {wiseAccount.balances.length} Currencies
          </span>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {wiseAccount.balances.map((balance) => (
            <div key={balance.currency} className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">{balance.currency}</div>
              <div className="font-bold text-green-900">{balance.amount.toLocaleString()}</div>
              <div className="text-xs text-green-600">Available: {balance.available.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send Money', icon: Globe },
              { id: 'balances', label: 'Balances', icon: PiggyBank },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'rates', label: 'Exchange Rates', icon: TrendingUp },
              { id: 'history', label: 'Transfer History', icon: FileText },
              { id: 'settings', label: 'Settings', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
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
          {/* Send Money */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Send International Transfer</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Transfer Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Transfer Details</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">You Send</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <select 
                              value={sourceCurrency}
                              onChange={(e) => setSourceCurrency(e.target.value)}
                              className="absolute right-2 top-2 border-0 bg-transparent text-sm font-medium focus:ring-0"
                            >
                              {wiseAccount.balances.map(balance => (
                                <option key={balance.currency} value={balance.currency}>{balance.currency}</option>
                              ))}
                            </select>
                          </div>
                          {(() => {
                            const balance = getBalance(sourceCurrency);
                            return balance && (
                              <div className="text-xs text-gray-500 mt-1">
                                Available: {balance.available.toLocaleString()} {sourceCurrency}
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Gets</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={transferAmount ? calculateWiseFees(parseFloat(transferAmount), sourceCurrency, targetCurrency).received.toFixed(2) : ''}
                              readOnly
                              placeholder="0.00"
                              className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg bg-gray-50"
                            />
                            <select 
                              value={targetCurrency}
                              onChange={(e) => setTargetCurrency(e.target.value)}
                              className="absolute right-2 top-2 border-0 bg-transparent text-sm font-medium focus:ring-0"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="CAD">CAD</option>
                              <option value="AUD">AUD</option>
                              <option value="JPY">JPY</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                        <select 
                          value={selectedRecipient}
                          onChange={(e) => setSelectedRecipient(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select a recipient</option>
                          {recipients.map(recipient => (
                            <option key={recipient.id} value={recipient.id}>
                              {recipient.name} ({recipient.country})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Purpose</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="invoice">Invoice payment</option>
                          <option value="salary">Salary payment</option>
                          <option value="services">Payment for services</option>
                          <option value="goods">Payment for goods</option>
                          <option value="family">Family support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reference (Optional)</label>
                        <input
                          type="text"
                          placeholder="Payment reference"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Exchange Rate Info */}
                  {sourceCurrency !== targetCurrency && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-medium text-green-900 mb-4 flex items-center space-x-2">
                        <Calculator className="w-4 h-4" />
                        <span>Exchange Rate</span>
                      </h4>
                      {(() => {
                        const rate = exchangeRates.find(r => r.source === sourceCurrency && r.target === targetCurrency);
                        return rate ? (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700">Rate:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-green-900">
                                  1 {sourceCurrency} = {rate.rate} {targetCurrency}
                                </span>
                                {getTrendIcon(rate.trend)}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Fee:</span>
                              <span className="font-medium text-green-900">{rate.feePercentage}% + {rate.fee} {sourceCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Last Updated:</span>
                              <span className="font-medium text-green-900">
                                {new Date(rate.lastUpdated).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-green-700">Exchange rate not available</div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Transfer Summary */}
                  {transferAmount && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Transfer Summary</h4>
                      {(() => {
                        const { fee, rate, received } = calculateWiseFees(parseFloat(transferAmount), sourceCurrency, targetCurrency);
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">You send:</span>
                              <span className="font-medium text-gray-900">{parseFloat(transferAmount).toLocaleString()} {sourceCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Wise fee:</span>
                              <span className="font-medium text-gray-900">{fee.toFixed(2)} {sourceCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Amount converted:</span>
                              <span className="font-medium text-gray-900">{(parseFloat(transferAmount) - fee).toFixed(2)} {sourceCurrency}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="font-medium text-gray-900">Recipient gets:</span>
                              <span className="font-bold text-gray-900">{received.toFixed(2)} {targetCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Delivery time:</span>
                              <span className="font-medium text-gray-900">Usually within 1 hour</span>
                            </div>
                          </div>
                        );
                      })()}
                      <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mt-4 font-medium">
                        Send Transfer
                      </button>
                    </div>
                  )}

                  {/* Wise Benefits */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Why Choose Wise?</span>
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Real exchange rate, no markup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Up to 8x cheaper than banks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Fast transfers, usually within 1 hour</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Regulated and secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Balances */}
          {activeTab === 'balances' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Multi-Currency Balances</h3>
                <button className="text-green-600 hover:text-green-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Add Money</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wiseAccount.balances.map((balance) => (
                  <div key={balance.currency} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">{balance.currency}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Total Balance</div>
                        <div className="text-2xl font-bold text-gray-900">{balance.amount.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Available</div>
                          <div className="font-medium text-green-600">{balance.available.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Reserved</div>
                          <div className="font-medium text-orange-600">{balance.reserved.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                        Add Money
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors">
                        Convert
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-medium text-green-900 mb-4">Account Details</h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-green-700 mb-1">Account Holder</div>
                    <div className="font-medium text-green-900">{wiseAccount.name}</div>
                  </div>
                  <div>
                    <div className="text-green-700 mb-1">Account Type</div>
                    <div className="font-medium text-green-900 capitalize">{wiseAccount.type}</div>
                  </div>
                  <div>
                    <div className="text-green-700 mb-1">Profile ID</div>
                    <div className="font-medium text-green-900 font-mono">{wiseAccount.profileId}</div>
                  </div>
                  <div>
                    <div className="text-green-700 mb-1">Verification Status</div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipients */}
          {activeTab === 'recipients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Saved Recipients</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Add Recipient
                </button>
              </div>

              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{recipient.name}</div>
                          <div className="text-sm text-gray-500">{recipient.country} • {recipient.currency}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {recipient.verified ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Account Type:</span>
                        <div className="font-medium capitalize">{recipient.accountDetails.type}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Account Details:</span>
                        <div className="font-medium font-mono">
                          {recipient.accountDetails.iban || 
                           recipient.accountDetails.accountNumber || 
                           'Account details'}
                        </div>
                      </div>
                      {recipient.email && (
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <div className="font-medium">{recipient.email}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors">
                        Send Money
                      </button>
                      <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exchange Rates */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Live Exchange Rates</h3>
                <div className="text-sm text-gray-500">
                  Updated: {new Date().toLocaleString()}
                </div>
              </div>

              <div className="grid gap-4">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {rate.source} to {rate.target}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>1 {rate.source} = {rate.rate} {rate.target}</span>
                            {getTrendIcon(rate.trend)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{rate.rate}</div>
                        <div className="text-sm text-gray-500">
                          Fee: {rate.feePercentage}% + {rate.fee}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-green-800">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Real Exchange Rates</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Wise uses the real exchange rate (the one you see on Google) with no markup. 
                  You only pay a small, transparent fee for the transfer.
                </p>
              </div>
            </div>
          )}

          {/* Transfer History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Transfer History</h3>
                <button className="text-green-600 hover:text-green-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipient.name}</div>
                          <div className="text-sm text-gray-500">{transfer.recipient.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">You sent:</span>
                        <div className="font-medium">{transfer.sourceCurrency} {transfer.sourceAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">They received:</span>
                        <div className="font-medium">{transfer.targetCurrency} {transfer.targetAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <div className="font-medium font-mono">{transfer.reference}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="font-medium">{new Date(transfer.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-gray-500">Fee:</span>
                          <span className="font-medium ml-1">{transfer.sourceCurrency} {transfer.fee}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rate:</span>
                          <span className="font-medium ml-1">{transfer.rate}</span>
                        </div>
                      </div>
                      <div className="text-gray-500">
                        {transfer.status === 'completed' && transfer.actualDelivery ? 
                          `Delivered: ${new Date(transfer.actualDelivery).toLocaleString()}` :
                          `Est. delivery: ${new Date(transfer.estimatedDelivery).toLocaleString()}`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Wise Integration Settings</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Connection</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Wise Account</div>
                          <div className="text-sm text-gray-500">{wiseAccount.email}</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Connected
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Profile Type</div>
                          <div className="text-sm text-gray-500 capitalize">{wiseAccount.type}</div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          Business
                        </span>
                      </div>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Disconnect Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Transfer Limits</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Daily Limit:</span>
                        <span className="font-medium">${wiseAccount.limits.daily.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Monthly Limit:</span>
                        <span className="font-medium">${wiseAccount.limits.monthly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Remaining Today:</span>
                        <span className="font-medium text-green-600">${wiseAccount.limits.remaining.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      {[
                        'Email notifications for transfers',
                        'SMS alerts for large transactions',
                        'Rate change notifications',
                        'Monthly account statements'
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={index < 3}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label className="text-sm text-gray-700">{setting}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-green-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Wise Security</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">
                      Your Wise integration is protected by bank-level security, including 2FA, 
                      device verification, and real-time fraud monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WiseIntegration;