import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Calculator, 
  History, 
  Settings, 
  Info, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Banknote,
  Bell,
  Target,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

// Enhanced types for currency exchange
interface LiveExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  bid: number;
  ask: number;
  spread: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdated: string;
  source: string;
  trend: 'up' | 'down' | 'stable';
}

interface ExchangeTransaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fees: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  transactionId: string;
  estimatedCompletion?: string;
}

interface RateAlert {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface CurrencyPair {
  from: string;
  to: string;
  symbol: string;
  name: string;
  popular: boolean;
}

const CurrencyExchangeService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exchange' | 'rates' | 'history' | 'alerts'>('exchange');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Exchange form state
  const [exchangeForm, setExchangeForm] = useState({
    fromCurrency: 'USD',
    toCurrency: 'BDT',
    amount: '',
    exchangeType: 'market' as 'market' | 'limit',
    limitRate: '',
    validUntil: '',
    slippage: 0.1
  });

  // Live exchange rates with enhanced data
  const [liveRates, setLiveRates] = useState<LiveExchangeRate[]>([
    {
      id: 'USD-BDT',
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      rate: 110.25,
      bid: 110.20,
      ask: 110.30,
      spread: 0.10,
      change24h: 0.15,
      changePercent24h: 0.14,
      high24h: 110.45,
      low24h: 109.85,
      volume24h: 2500000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'up'
    },
    {
      id: 'EUR-BDT',
      fromCurrency: 'EUR',
      toCurrency: 'BDT',
      rate: 119.80,
      bid: 119.75,
      ask: 119.85,
      spread: 0.10,
      change24h: -0.25,
      changePercent24h: -0.21,
      high24h: 120.15,
      low24h: 119.60,
      volume24h: 1800000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'down'
    },
    {
      id: 'GBP-BDT',
      fromCurrency: 'GBP',
      toCurrency: 'BDT',
      rate: 139.45,
      bid: 139.35,
      ask: 139.55,
      spread: 0.20,
      change24h: 0.35,
      changePercent24h: 0.25,
      high24h: 139.80,
      low24h: 138.90,
      volume24h: 1200000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'up'
    },
    {
      id: 'USD-EUR',
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.9205,
      bid: 0.9200,
      ask: 0.9210,
      spread: 0.0010,
      change24h: -0.0025,
      changePercent24h: -0.27,
      high24h: 0.9235,
      low24h: 0.9185,
      volume24h: 5200000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'down'
    },
    {
      id: 'USD-GBP',
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      rate: 0.7890,
      bid: 0.7885,
      ask: 0.7895,
      spread: 0.0010,
      change24h: 0.0015,
      changePercent24h: 0.19,
      high24h: 0.7905,
      low24h: 0.7870,
      volume24h: 4100000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'up'
    },
    {
      id: 'EUR-GBP',
      fromCurrency: 'EUR',
      toCurrency: 'GBP',
      rate: 0.8575,
      bid: 0.8570,
      ask: 0.8580,
      spread: 0.0010,
      change24h: 0.0035,
      changePercent24h: 0.41,
      high24h: 0.8590,
      low24h: 0.8545,
      volume24h: 2800000,
      lastUpdated: new Date().toISOString(),
      source: 'Interbank',
      trend: 'up'
    }
  ]);

  // Exchange transaction history
  const [transactionHistory, setTransactionHistory] = useState<ExchangeTransaction[]>([
    {
      id: 'TXN001',
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      fromAmount: 1000,
      toAmount: 110250,
      rate: 110.25,
      fees: 220.50,
      netAmount: 110029.50,
      status: 'completed',
      timestamp: '2024-01-21T10:30:00Z',
      transactionId: 'FX2024012110001'
    },
    {
      id: 'TXN002',
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      fromAmount: 500,
      toAmount: 543.25,
      rate: 1.0865,
      fees: 1.09,
      netAmount: 542.16,
      status: 'completed',
      timestamp: '2024-01-20T14:15:00Z',
      transactionId: 'FX2024012014001'
    },
    {
      id: 'TXN003',
      fromCurrency: 'GBP',
      toCurrency: 'EUR',
      fromAmount: 750,
      toAmount: 874.13,
      rate: 1.1655,
      fees: 1.75,
      netAmount: 872.38,
      status: 'processing',
      timestamp: '2024-01-21T09:45:00Z',
      transactionId: 'FX2024012109001',
      estimatedCompletion: '2024-01-21T11:45:00Z'
    }
  ]);

  // Rate alerts
  const [rateAlerts, setRateAlerts] = useState<RateAlert[]>([
    {
      id: 'ALERT001',
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      targetRate: 111.00,
      condition: 'above',
      isActive: true,
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 'ALERT002',
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      targetRate: 1.09,
      condition: 'above',
      isActive: true,
      createdAt: '2024-01-19T15:30:00Z'
    }
  ]);

  // Popular currency pairs
  const popularPairs: CurrencyPair[] = [
    { from: 'USD', to: 'BDT', symbol: 'USD/BDT', name: 'US Dollar to Bangladeshi Taka', popular: true },
    { from: 'EUR', to: 'BDT', symbol: 'EUR/BDT', name: 'Euro to Bangladeshi Taka', popular: true },
    { from: 'GBP', to: 'BDT', symbol: 'GBP/BDT', name: 'British Pound to Bangladeshi Taka', popular: true },
    { from: 'USD', to: 'EUR', symbol: 'USD/EUR', name: 'US Dollar to Euro', popular: true },
    { from: 'USD', to: 'GBP', symbol: 'USD/GBP', name: 'US Dollar to British Pound', popular: true },
    { from: 'EUR', to: 'GBP', symbol: 'EUR/GBP', name: 'Euro to British Pound', popular: true }
  ];

  // Currency icons
  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'USD': return <DollarSign className="w-4 h-4" />;
      case 'EUR': return <Euro className="w-4 h-4" />;
      case 'GBP': return <PoundSterling className="w-4 h-4" />;
      case 'BDT': return <Banknote className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  // Get current rate for currency pair
  const getCurrentRate = (fromCurrency: string, toCurrency: string): LiveExchangeRate | null => {
    return liveRates.find(rate => 
      rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    ) || null;
  };

  // Calculate exchange with fees
  const calculateExchange = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    const rate = getCurrentRate(fromCurrency, toCurrency);
    if (!rate) return { convertedAmount: 0, fees: 0, netAmount: 0, rate: 0 };

    const convertedAmount = amount * rate.rate;
    const feeRate = fromCurrency === 'BDT' || toCurrency === 'BDT' ? 0.002 : 0.0015; // 0.2% for BDT, 0.15% for others
    const fees = convertedAmount * feeRate;
    const netAmount = convertedAmount - fees;

    return { convertedAmount, fees, netAmount, rate: rate.rate };
  }, [liveRates]);

  // Refresh rates
  const refreshRates = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call with realistic rate fluctuations
    setTimeout(() => {
      setLiveRates(prev => prev.map(rate => {
        const fluctuation = (Math.random() - 0.5) * 0.002; // ±0.2% fluctuation
        const newRate = rate.rate * (1 + fluctuation);
        const change = newRate - rate.rate;
        const changePercent = (change / rate.rate) * 100;
        
        return {
          ...rate,
          rate: newRate,
          bid: newRate - rate.spread / 2,
          ask: newRate + rate.spread / 2,
          change24h: change,
          changePercent24h: changePercent,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          lastUpdated: new Date().toISOString()
        };
      }));
      setIsLoading(false);
    }, 1000);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshRates, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshRates]);

  // Exchange form calculations
  const exchangeCalculation = exchangeForm.amount ? 
    calculateExchange(parseFloat(exchangeForm.amount), exchangeForm.fromCurrency, exchangeForm.toCurrency) : 
    { convertedAmount: 0, fees: 0, netAmount: 0, rate: 0 };

  // Exchange Component
  const ExchangeComponent = () => (
    <div className="space-y-6">
      {/* Quick Exchange Pairs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Currency Pairs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularPairs.map((pair) => {
            const rate = getCurrentRate(pair.from, pair.to);
            return (
              <div 
                key={`${pair.from}-${pair.to}`}
                onClick={() => setExchangeForm(prev => ({ ...prev, fromCurrency: pair.from, toCurrency: pair.to }))}
                className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCurrencyIcon(pair.from)}
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    {getCurrencyIcon(pair.to)}
                    <span className="font-medium text-gray-900">{pair.symbol}</span>
                  </div>
                  {rate && (
                    <div className={`flex items-center space-x-1 ${
                      rate.trend === 'up' ? 'text-green-600' : rate.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {rate.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                       rate.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                      <span className="text-xs font-medium">{rate.changePercent24h.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {rate ? rate.rate.toFixed(4) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">{pair.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exchange Calculator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Currency Exchange</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAdvanced ? 'Simple' : 'Advanced'} Mode
            </button>
            <button
              onClick={refreshRates}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exchange Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select
                  value={exchangeForm.fromCurrency}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, fromCurrency: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="BDT">BDT - Bangladeshi Taka</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select
                  value={exchangeForm.toCurrency}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, toCurrency: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="BDT">BDT - Bangladeshi Taka</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={exchangeForm.amount}
                onChange={(e) => setExchangeForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount to exchange"
              />
            </div>

            {showAdvanced && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExchangeForm(prev => ({ ...prev, exchangeType: 'market' }))}
                      className={`p-3 rounded-lg border font-medium text-sm transition-colors ${
                        exchangeForm.exchangeType === 'market'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Zap className="w-4 h-4 mx-auto mb-1" />
                      Market Order
                    </button>
                    <button
                      onClick={() => setExchangeForm(prev => ({ ...prev, exchangeType: 'limit' }))}
                      className={`p-3 rounded-lg border font-medium text-sm transition-colors ${
                        exchangeForm.exchangeType === 'limit'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Target className="w-4 h-4 mx-auto mb-1" />
                      Limit Order
                    </button>
                  </div>
                </div>

                {exchangeForm.exchangeType === 'limit' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Rate</label>
                      <input
                        type="number"
                        value={exchangeForm.limitRate}
                        onChange={(e) => setExchangeForm(prev => ({ ...prev, limitRate: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Target exchange rate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                      <input
                        type="datetime-local"
                        value={exchangeForm.validUntil}
                        onChange={(e) => setExchangeForm(prev => ({ ...prev, validUntil: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exchange Summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Exchange Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Exchange Rate:</span>
                  <span className="font-semibold text-gray-900">
                    {exchangeCalculation.rate.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount to Exchange:</span>
                  <span className="font-semibold text-gray-900">
                    {exchangeForm.amount || '0'} {exchangeForm.fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Converted Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {exchangeCalculation.convertedAmount.toFixed(2)} {exchangeForm.toCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exchange Fee:</span>
                  <span className="font-semibold text-red-600">
                    -{exchangeCalculation.fees.toFixed(2)} {exchangeForm.toCurrency}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">You'll Receive:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {exchangeCalculation.netAmount.toFixed(2)} {exchangeForm.toCurrency}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Processing Time:</p>
                    <p>Instant for major currencies, up to 2 hours for others</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={!exchangeForm.amount || parseFloat(exchangeForm.amount) <= 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Execute Exchange
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Auto-refresh Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Currency Exchange Service</h2>
          <p className="text-gray-600">Real-time rates and instant currency conversion</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Last updated: {new Date(liveRates[0]?.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'exchange', label: 'Exchange', icon: ArrowUpDown },
              { id: 'rates', label: 'Live Rates', icon: BarChart3 },
              { id: 'history', label: 'History', icon: History },
              { id: 'alerts', label: 'Rate Alerts', icon: Bell }
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
          {activeTab === 'exchange' && <ExchangeComponent />}
          {activeTab === 'rates' && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Exchange Rates</h3>
              <p className="text-gray-500">Detailed rate charts and market analysis coming soon</p>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Exchange History</h3>
              <p className="text-gray-500">View your past currency exchange transactions</p>
            </div>
          )}
          {activeTab === 'alerts' && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rate Alerts</h3>
              <p className="text-gray-500">Set up notifications for favorable exchange rates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangeService;