import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ArrowUpDown, 
  CreditCard, 
  Building, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Banknote,
  Calculator,
  FileText,
  Download,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import CurrencyExchangeService from './CurrencyExchangeService';
import ForeignCurrencyDeposits from './ForeignCurrencyDeposits';
import IBANGenerator from './IBANGenerator';

// Types for multi-currency accounts
interface CurrencyAccount {
  id: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  balance: number;
  accountNumber: string;
  iban?: string;
  accountType: 'savings' | 'current' | 'fixed_deposit';
  status: 'active' | 'pending' | 'blocked';
  openedDate: string;
  lastTransaction?: string;
  interestRate?: number;
  minimumBalance: number;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

interface CurrencyExchange {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  fees: number;
}

const MultiCurrencyAccounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'exchange' | 'iban' | 'deposits' | 'statements'>('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  // Sample multi-currency accounts data
  const [accounts, setAccounts] = useState<CurrencyAccount[]>([
    {
      id: 'USD001',
      currency: 'US Dollar',
      currencyCode: 'USD',
      currencySymbol: '$',
      balance: 15750.50,
      accountNumber: '1234567890123456',
      iban: 'BD64IBBL1234567890123456',
      accountType: 'savings',
      status: 'active',
      openedDate: '2024-01-15',
      lastTransaction: '2024-01-20',
      interestRate: 2.5,
      minimumBalance: 100
    },
    {
      id: 'EUR001',
      currency: 'Euro',
      currencyCode: 'EUR',
      currencySymbol: '€',
      balance: 8920.75,
      accountNumber: '2345678901234567',
      iban: 'BD64IBBL2345678901234567',
      accountType: 'current',
      status: 'active',
      openedDate: '2024-02-01',
      lastTransaction: '2024-01-19',
      interestRate: 1.8,
      minimumBalance: 50
    },
    {
      id: 'GBP001',
      currency: 'British Pound',
      currencyCode: 'GBP',
      currencySymbol: '£',
      balance: 6540.25,
      accountNumber: '3456789012345678',
      iban: 'BD64IBBL3456789012345678',
      accountType: 'savings',
      status: 'active',
      openedDate: '2024-01-20',
      lastTransaction: '2024-01-18',
      interestRate: 2.2,
      minimumBalance: 75
    },
    {
      id: 'BDT001',
      currency: 'Bangladeshi Taka',
      currencyCode: 'BDT',
      currencySymbol: '৳',
      balance: 125000.00,
      accountNumber: '4567890123456789',
      iban: 'BD64IBBL4567890123456789',
      accountType: 'current',
      status: 'active',
      openedDate: '2023-12-01',
      lastTransaction: '2024-01-21',
      interestRate: 3.5,
      minimumBalance: 1000
    }
  ]);

  // Sample exchange rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { from: 'USD', to: 'BDT', rate: 110.25, change: 0.15, changePercent: 0.14, lastUpdated: '2024-01-21 10:30:00' },
    { from: 'EUR', to: 'BDT', rate: 119.80, change: -0.25, changePercent: -0.21, lastUpdated: '2024-01-21 10:30:00' },
    { from: 'GBP', to: 'BDT', rate: 139.45, change: 0.35, changePercent: 0.25, lastUpdated: '2024-01-21 10:30:00' },
    { from: 'USD', to: 'EUR', rate: 0.92, change: -0.002, changePercent: -0.22, lastUpdated: '2024-01-21 10:30:00' },
    { from: 'USD', to: 'GBP', rate: 0.79, change: 0.001, changePercent: 0.13, lastUpdated: '2024-01-21 10:30:00' },
    { from: 'EUR', to: 'GBP', rate: 0.86, change: 0.003, changePercent: 0.35, lastUpdated: '2024-01-21 10:30:00' }
  ]);

  const [exchangeForm, setExchangeForm] = useState<CurrencyExchange>({
    fromCurrency: 'USD',
    toCurrency: 'BDT',
    amount: 0,
    convertedAmount: 0,
    rate: 110.25,
    fees: 0
  });

  // Currency icons mapping
  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'USD': return <DollarSign className="w-5 h-5" />;
      case 'EUR': return <Euro className="w-5 h-5" />;
      case 'GBP': return <PoundSterling className="w-5 h-5" />;
      case 'BDT': return <Banknote className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  // Calculate total portfolio value in selected currency
  const calculateTotalValue = () => {
    return accounts.reduce((total, account) => {
      if (account.currencyCode === selectedCurrency) {
        return total + account.balance;
      }
      // Convert to selected currency using exchange rates
      const rate = exchangeRates.find(r => 
        r.from === account.currencyCode && r.to === selectedCurrency
      )?.rate || 1;
      return total + (account.balance * rate);
    }, 0);
  };

  // Refresh exchange rates
  const refreshRates = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setExchangeRates(prev => prev.map(rate => ({
        ...rate,
        rate: rate.rate + (Math.random() - 0.5) * 0.1,
        change: (Math.random() - 0.5) * 0.5,
        changePercent: (Math.random() - 0.5) * 1,
        lastUpdated: new Date().toLocaleString()
      })));
      setIsLoading(false);
    }, 1500);
  };

  // Handle currency exchange calculation
  const calculateExchange = (amount: number, fromCurrency: string, toCurrency: string) => {
    const rate = exchangeRates.find(r => 
      r.from === fromCurrency && r.to === toCurrency
    )?.rate || 1;
    const convertedAmount = amount * rate;
    const fees = convertedAmount * 0.002; // 0.2% exchange fee
    
    setExchangeForm(prev => ({
      ...prev,
      amount,
      convertedAmount,
      rate,
      fees
    }));
  };

  // Account Overview Component
  const AccountOverview = () => (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Multi-Currency Portfolio</h2>
              <p className="text-blue-100">Total value across all currencies</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold mb-1">
              {showBalances ? (
                `${accounts.find(a => a.currencyCode === selectedCurrency)?.currencySymbol || '$'}${calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              ) : (
                '••••••••'
              )}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm"
              >
                {accounts.map(account => (
                  <option key={account.currencyCode} value={account.currencyCode} className="text-gray-900">
                    {account.currencyCode}
                  </option>
                ))}
              </select>
              <span className="text-blue-100 text-sm">Portfolio Base Currency</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-300 text-sm font-medium">+2.4% Today</div>
            <div className="text-blue-100 text-xs">{accounts.length} Active Accounts</div>
          </div>
        </div>
      </div>

      {/* Currency Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${
                  account.currencyCode === 'USD' ? 'bg-green-100 text-green-600' :
                  account.currencyCode === 'EUR' ? 'bg-blue-100 text-blue-600' :
                  account.currencyCode === 'GBP' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {getCurrencyIcon(account.currencyCode)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.currency}</h3>
                  <p className="text-sm text-gray-500">{account.accountType.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                account.status === 'active' ? 'bg-green-100 text-green-800' :
                account.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {account.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {showBalances ? (
                    `${account.currencySymbol}${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  ) : (
                    '••••••••'
                  )}
                </div>
                <div className="text-sm text-gray-500">Available Balance</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Account Number</div>
                  <div className="font-mono text-gray-900">
                    {showBalances ? `****${account.accountNumber.slice(-4)}` : '••••••••'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Interest Rate</div>
                  <div className="font-medium text-gray-900">{account.interestRate}% p.a.</div>
                </div>
              </div>

              {account.iban && (
                <div className="text-sm">
                  <div className="text-gray-500">IBAN</div>
                  <div className="font-mono text-gray-900">
                    {showBalances ? account.iban : '••••••••••••••••••••••••'}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Transfer
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Account Card */}
        <div 
          onClick={() => setShowNewAccountModal(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-xl mx-auto mb-4 w-fit">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Open New Currency Account</h3>
            <p className="text-sm text-gray-500">Add USD, EUR, GBP or BDT account</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Currency Exchange Component
  const CurrencyExchange = () => (
    <div className="space-y-6">
      {/* Live Exchange Rates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Live Exchange Rates</h3>
          <button
            onClick={refreshRates}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchangeRates.map((rate, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{rate.from}</span>
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{rate.to}</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  rate.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rate.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">{rate.changePercent.toFixed(2)}%</span>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {rate.rate.toFixed(4)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {new Date(rate.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Exchange Calculator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Exchange Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
              <select
                value={exchangeForm.fromCurrency}
                onChange={(e) => {
                  setExchangeForm(prev => ({ ...prev, fromCurrency: e.target.value }));
                  calculateExchange(exchangeForm.amount, e.target.value, exchangeForm.toCurrency);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {accounts.map(account => (
                  <option key={account.currencyCode} value={account.currencyCode}>
                    {account.currencyCode} - {account.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={exchangeForm.amount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  calculateExchange(amount, exchangeForm.fromCurrency, exchangeForm.toCurrency);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Currency</label>
              <select
                value={exchangeForm.toCurrency}
                onChange={(e) => {
                  setExchangeForm(prev => ({ ...prev, toCurrency: e.target.value }));
                  calculateExchange(exchangeForm.amount, exchangeForm.fromCurrency, e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {accounts.map(account => (
                  <option key={account.currencyCode} value={account.currencyCode}>
                    {account.currencyCode} - {account.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Converted Amount</label>
              <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold text-gray-900">
                {exchangeForm.convertedAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Exchange Rate:</span>
              <span className="font-semibold text-gray-900 ml-2">{exchangeForm.rate.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-gray-600">Exchange Fee:</span>
              <span className="font-semibold text-gray-900 ml-2">{exchangeForm.fees.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">You'll Receive:</span>
              <span className="font-semibold text-green-600 ml-2">{(exchangeForm.convertedAmount - exchangeForm.fees).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowExchangeModal(true)}
          className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Execute Exchange
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Accounts</h1>
            <p className="text-gray-600">Manage your international banking needs</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewAccountModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Account Overview', icon: Eye },
              { id: 'exchange', label: 'Currency Exchange', icon: ArrowUpDown },
              { id: 'iban', label: 'IBAN & International', icon: Globe },
              { id: 'deposits', label: 'Fixed Deposits', icon: Building },
              { id: 'statements', label: 'Statements', icon: FileText }
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
          {activeTab === 'overview' && <AccountOverview />}
          {activeTab === 'exchange' && <CurrencyExchange />}
          {activeTab === 'iban' && <IBANGenerator />}
          {activeTab === 'deposits' && <ForeignCurrencyDeposits />}
          {activeTab === 'statements' && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Currency Statements</h3>
              <p className="text-gray-500">Download consolidated or individual currency statements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiCurrencyAccounts;