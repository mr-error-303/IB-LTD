import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
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
  Users
} from 'lucide-react';

interface PayPalAccount {
  id: string;
  email: string;
  name: string;
  type: 'personal' | 'business' | 'premier';
  verified: boolean;
  country: string;
  currency: string;
  balance: number;
  limits: {
    daily: number;
    monthly: number;
    remaining: number;
  };
}

interface PayPalTransfer {
  id: string;
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency: string;
  purpose: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'refunded';
  reference: string;
  date: string;
  fees: number;
  exchangeRate?: number;
  paymentMethod: 'balance' | 'bank' | 'card';
  note?: string;
}

interface PayPalRate {
  from: string;
  to: string;
  rate: number;
  fee: number;
  feePercentage: number;
  lastUpdated: string;
}

const PayPalIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'request' | 'rates' | 'history' | 'settings'>('send');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank' | 'card'>('balance');
  const [isConnected, setIsConnected] = useState(true);

  // PayPal Account Info
  const [paypalAccount] = useState<PayPalAccount>({
    id: 'pp_acc_001',
    email: 'business@company.com',
    name: 'Your Business Account',
    type: 'business',
    verified: true,
    country: 'United States',
    currency: 'USD',
    balance: 15420.50,
    limits: {
      daily: 10000,
      monthly: 60000,
      remaining: 8750
    }
  });

  // Exchange Rates
  const [exchangeRates] = useState<PayPalRate[]>([
    { from: 'USD', to: 'EUR', rate: 0.85, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' },
    { from: 'USD', to: 'GBP', rate: 0.79, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' },
    { from: 'USD', to: 'CAD', rate: 1.35, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' },
    { from: 'USD', to: 'AUD', rate: 1.48, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' },
    { from: 'USD', to: 'JPY', rate: 148.50, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' },
    { from: 'EUR', to: 'USD', rate: 1.18, fee: 2.50, feePercentage: 2.9, lastUpdated: '2024-01-13T10:30:00Z' }
  ]);

  // Transfer History
  const [transferHistory] = useState<PayPalTransfer[]>([
    {
      id: 'pp_001',
      recipientEmail: 'supplier@globaltech.com',
      recipientName: 'Global Tech Solutions',
      amount: 2500,
      currency: 'USD',
      purpose: 'Invoice payment',
      status: 'completed',
      reference: 'PP2024001001',
      date: '2024-01-10',
      fees: 72.50,
      paymentMethod: 'balance',
      note: 'Payment for services rendered'
    },
    {
      id: 'pp_002',
      recipientEmail: 'freelancer@design.co.uk',
      recipientName: 'Sarah Johnson',
      amount: 800,
      currency: 'GBP',
      purpose: 'Freelance payment',
      status: 'completed',
      reference: 'PP2024001002',
      date: '2024-01-11',
      fees: 23.20,
      exchangeRate: 0.79,
      paymentMethod: 'bank',
      note: 'Design work completion'
    },
    {
      id: 'pp_003',
      recipientEmail: 'vendor@supplies.ca',
      recipientName: 'Northern Supplies Inc.',
      amount: 1200,
      currency: 'CAD',
      purpose: 'Equipment purchase',
      status: 'pending',
      reference: 'PP2024001003',
      date: '2024-01-12',
      fees: 34.80,
      exchangeRate: 1.35,
      paymentMethod: 'card'
    }
  ]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate PayPal fees
  const calculatePayPalFees = (amount: number, currency: string): number => {
    const rate = exchangeRates.find(r => r.from === 'USD' && r.to === currency);
    const feePercentage = rate?.feePercentage || 2.9;
    const fixedFee = rate?.fee || 2.50;
    
    return (amount * feePercentage / 100) + fixedFee;
  };

  // Get exchange rate
  const getExchangeRate = (from: string, to: string): PayPalRate | null => {
    return exchangeRates.find(rate => rate.from === from && rate.to === to) || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PayPal Integration</h1>
              <p className="text-gray-600">Send and receive international payments with PayPal</p>
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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Quick Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* PayPal Account Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">PayPal Business Account</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-blue-700 mb-1">Account Email</div>
                  <div className="font-medium text-blue-900">{paypalAccount.email}</div>
                </div>
                <div>
                  <div className="text-blue-700 mb-1">Available Balance</div>
                  <div className="font-medium text-blue-900">${paypalAccount.balance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-700 mb-1">Daily Limit Remaining</div>
                  <div className="font-medium text-blue-900">${paypalAccount.limits.remaining.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {paypalAccount.verified && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </span>
            )}
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs capitalize">
              {paypalAccount.type}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send Money', icon: CreditCard },
              { id: 'request', label: 'Request Payment', icon: Download },
              { id: 'rates', label: 'Exchange Rates', icon: TrendingUp },
              { id: 'history', label: 'Transaction History', icon: FileText },
              { id: 'settings', label: 'Settings', icon: User }
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
          {/* Send Money */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Send PayPal Payment</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Recipient Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recipient Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="recipient@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="Full name of recipient"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select 
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'balance', label: 'PayPal Balance', icon: Banknote },
                          { id: 'bank', label: 'Bank Account', icon: Building2 },
                          { id: 'card', label: 'Credit Card', icon: CreditCard }
                        ].map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setPaymentMethod(id as any)}
                            className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                              paymentMethod === id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="goods">Goods & Services</option>
                        <option value="friends">Friends & Family</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Add a note for the recipient"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Exchange Rate Info */}
                  {selectedCurrency !== 'USD' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-medium text-blue-900 mb-4">Currency Exchange</h4>
                      {(() => {
                        const rate = getExchangeRate('USD', selectedCurrency);
                        return rate ? (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Exchange Rate:</span>
                              <span className="font-medium text-blue-900">1 USD = {rate.rate} {selectedCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Last Updated:</span>
                              <span className="font-medium text-blue-900">
                                {new Date(rate.lastUpdated).toLocaleString()}
                              </span>
                            </div>
                            {transferAmount && (
                              <div className="flex justify-between pt-2 border-t border-blue-200">
                                <span className="font-medium text-blue-900">Recipient Gets:</span>
                                <span className="font-bold text-blue-900">
                                  {selectedCurrency} {(parseFloat(transferAmount) * rate.rate).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-blue-700">Exchange rate not available</div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Payment Summary */}
                  {transferAmount && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Payment Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Send Amount:</span>
                          <span className="font-medium text-gray-900">USD {parseFloat(transferAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">PayPal Fee:</span>
                          <span className="font-medium text-gray-900">
                            USD {calculatePayPalFees(parseFloat(transferAmount), selectedCurrency).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-900">Total Cost:</span>
                          <span className="font-bold text-gray-900">
                            USD {(parseFloat(transferAmount) + calculatePayPalFees(parseFloat(transferAmount), selectedCurrency)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Processing Time:</span>
                          <span className="font-medium text-gray-900">Instant</span>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 font-medium">
                        Send Payment
                      </button>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-yellow-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">PayPal Buyer Protection</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      Your payment is protected by PayPal's Buyer Protection policy. 
                      Eligible purchases are covered for the full purchase price plus shipping costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request Payment */}
          {activeTab === 'request' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Request Payment</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Payment Request Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Request From (Email)</label>
                        <input
                          type="email"
                          placeholder="payer@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="0.00"
                              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Request Note</label>
                        <textarea
                          rows={3}
                          placeholder="What is this payment for?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Send Payment Request
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-4">How Payment Requests Work</h4>
                    <div className="space-y-3 text-sm text-blue-800">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                        <div>Send a payment request to any email address</div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                        <div>Recipient receives an email with payment instructions</div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                        <div>Payment is processed and funds are transferred</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">No PayPal Account Required</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">
                      Recipients can pay with a credit card even if they don't have a PayPal account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Rates */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">PayPal Exchange Rates</h3>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>

              <div className="grid gap-4">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {rate.from} to {rate.to}
                          </div>
                          <div className="text-sm text-gray-500">
                            1 {rate.from} = {rate.rate} {rate.to}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{rate.rate}</div>
                        <div className="text-sm text-gray-500">
                          Fee: {rate.feePercentage}% + ${rate.fee}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-yellow-800">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Exchange Rate Information</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  PayPal exchange rates are updated regularly and include a currency conversion fee. 
                  Rates shown are for reference and may vary at the time of transaction.
                </p>
              </div>
            </div>
          )}

          {/* Transaction History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">PayPal Transaction History</h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipientName}</div>
                          <div className="text-sm text-gray-500">{transfer.recipientEmail}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">{transfer.currency} {transfer.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>
                        <div className="font-medium">{transfer.purpose}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <div className="font-medium font-mono">{transfer.reference}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{new Date(transfer.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {transfer.note && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Note:</span> {transfer.note}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">PayPal Integration Settings</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Connection</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">PayPal Account</div>
                          <div className="text-sm text-gray-500">{paypalAccount.email}</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Connected
                        </span>
                      </div>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Disconnect Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      {[
                        'Email notifications for payments received',
                        'SMS alerts for large transactions',
                        'Weekly transaction summaries',
                        'Currency rate change alerts'
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={index < 2}
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
                          <div className="text-sm text-gray-500">Extra security for your account</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Enabled
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Login Notifications</div>
                          <div className="text-sm text-gray-500">Get notified of account access</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">PayPal Security</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      Your PayPal integration uses industry-standard security protocols including 
                      SSL encryption and fraud monitoring to protect your transactions.
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

export default PayPalIntegration;