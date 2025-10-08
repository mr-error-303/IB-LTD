import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface TabType {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const Investment: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('fixed-deposits');

  const tabs: TabType[] = [
    {
      id: 'fixed-deposits',
      name: 'Fixed Deposits',
      icon: <BanknotesIcon className="w-5 h-5" />,
      component: <FixedDeposits />
    },
    {
      id: 'mutual-funds',
      name: 'Mutual Funds',
      icon: <ChartBarIcon className="w-5 h-5" />,
      component: <MutualFunds />
    },
    {
      id: 'savings-goals',
      name: 'Savings Goals',
      icon: <TrophyIcon className="w-5 h-5" />,
      component: <SavingsGoals />
    },
    {
      id: 'currency-exchange',
      name: 'Currency Exchange',
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      component: <CurrencyExchange />
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment & Savings</h1>
            <p className="text-gray-600">Grow your wealth with our investment and savings solutions</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Component */}
          <div className="bg-white rounded-lg shadow-md">
            {ActiveComponent}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed Deposits Component
const FixedDeposits: React.FC = () => {
  const [fdrs, setFdrs] = useState([
    {
      id: 1,
      amount: 100000,
      interestRate: 8.5,
      tenure: 12,
      maturityDate: '2025-01-15',
      status: 'Active'
    },
    {
      id: 2,
      amount: 250000,
      interestRate: 9.0,
      tenure: 24,
      maturityDate: '2026-01-15',
      status: 'Active'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFdr, setNewFdr] = useState({
    amount: '',
    tenure: '12'
  });

  const interestRates = {
    '6': 7.5,
    '12': 8.5,
    '24': 9.0,
    '36': 9.5,
    '60': 10.0
  };

  const handleCreateFdr = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newFdr.amount);
    const tenure = parseInt(newFdr.tenure);
    const interestRate = interestRates[newFdr.tenure as keyof typeof interestRates];
    
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    const fdr = {
      id: fdrs.length + 1,
      amount,
      interestRate,
      tenure,
      maturityDate: maturityDate.toISOString().split('T')[0],
      status: 'Active'
    };

    setFdrs([...fdrs, fdr]);
    setNewFdr({ amount: '', tenure: '12' });
    setShowCreateForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Fixed Deposits</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create FDR
        </button>
      </div>

      {/* Interest Rates Table */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Interest Rates</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(interestRates).map(([tenure, rate]) => (
            <div key={tenure} className="text-center">
              <div className="text-sm text-gray-600">{tenure} months</div>
              <div className="text-lg font-bold text-blue-600">{rate}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create FDR Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Fixed Deposit</h3>
          <form onSubmit={handleCreateFdr} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (৳)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={newFdr.amount}
                  onChange={(e) => setNewFdr({ ...newFdr, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum ৳10,000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure
                </label>
                <select
                  value={newFdr.tenure}
                  onChange={(e) => setNewFdr({ ...newFdr, tenure: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="6">6 months - 7.5%</option>
                  <option value="12">12 months - 8.5%</option>
                  <option value="24">24 months - 9.0%</option>
                  <option value="36">36 months - 9.5%</option>
                  <option value="60">60 months - 10.0%</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create FDR
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FDR List */}
      <div className="space-y-4">
        {fdrs.map((fdr) => (
          <div key={fdr.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-lg">৳{fdr.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-semibold text-green-600">{fdr.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tenure</p>
                  <p className="font-semibold">{fdr.tenure} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maturity Date</p>
                  <p className="font-semibold">{fdr.maturityDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {fdr.status}
                </span>
                <button className="text-blue-600 hover:text-blue-700">
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mutual Funds Component
const MutualFunds: React.FC = () => {
  const funds = [
    {
      id: 1,
      name: 'Equity Growth Fund',
      category: 'Equity',
      nav: 125.50,
      returns1Y: 15.2,
      returns3Y: 12.8,
      riskLevel: 'High',
      minInvestment: 5000
    },
    {
      id: 2,
      name: 'Balanced Fund',
      category: 'Hybrid',
      nav: 98.75,
      returns1Y: 10.5,
      returns3Y: 9.2,
      riskLevel: 'Medium',
      minInvestment: 3000
    },
    {
      id: 3,
      name: 'Bond Fund',
      category: 'Debt',
      nav: 110.25,
      returns1Y: 7.8,
      returns3Y: 8.1,
      riskLevel: 'Low',
      minInvestment: 2000
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mutual Funds</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start SIP
        </button>
      </div>

      <div className="grid gap-6">
        {funds.map((fund) => (
          <div key={fund.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{fund.name}</h3>
                <p className="text-sm text-gray-500">{fund.category} Fund</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">NAV</p>
                <p className="text-lg font-bold">৳{fund.nav}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">1 Year Return</p>
                <p className="font-semibold text-green-600">+{fund.returns1Y}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">3 Year Return</p>
                <p className="font-semibold text-green-600">+{fund.returns3Y}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Risk Level</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  fund.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  fund.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {fund.riskLevel}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Min Investment</p>
                <p className="font-semibold">৳{fund.minInvestment.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Invest Now
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Savings Goals Component
const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Emergency Fund',
      targetAmount: 500000,
      currentAmount: 325000,
      targetDate: '2024-12-31',
      monthlyContribution: 25000
    },
    {
      id: 2,
      name: 'Vacation Fund',
      targetAmount: 150000,
      currentAmount: 75000,
      targetDate: '2024-06-30',
      monthlyContribution: 15000
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Savings Goal</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (৳)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution (৳)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500">Target: {goal.targetDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-lg font-bold text-blue-600">{progress.toFixed(1)}%</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>৳{goal.currentAmount.toLocaleString()}</span>
                  <span>৳{goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="font-semibold">৳{remaining.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Contribution</p>
                  <p className="font-semibold">৳{goal.monthlyContribution.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Months to Goal</p>
                  <p className="font-semibold">{Math.ceil(remaining / goal.monthlyContribution)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Add Money
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit Goal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Currency Exchange Component
const CurrencyExchange: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('BDT');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');

  // Define proper types for exchange rates
  type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';
  type ExchangeRates = Record<CurrencyCode, Record<CurrencyCode, number>>;

  const exchangeRates: ExchangeRates = {
    'BDT': { 'BDT': 1, 'USD': 0.0094, 'EUR': 0.0085, 'GBP': 0.0074, 'JPY': 1.38, 'INR': 0.78 },
    'USD': { 'BDT': 106.50, 'USD': 1, 'EUR': 0.90, 'GBP': 0.79, 'JPY': 147.25, 'INR': 83.15 },
    'EUR': { 'BDT': 118.20, 'USD': 1.11, 'EUR': 1, 'GBP': 0.87, 'JPY': 163.45, 'INR': 92.30 },
    'GBP': { 'BDT': 135.80, 'USD': 1.27, 'EUR': 1.15, 'GBP': 1, 'JPY': 187.90, 'INR': 106.05 },
    'JPY': { 'BDT': 0.72, 'USD': 0.0068, 'EUR': 0.0061, 'GBP': 0.0053, 'JPY': 1, 'INR': 0.56 },
    'INR': { 'BDT': 1.28, 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0094, 'JPY': 1.77, 'INR': 1 }
  };

  const currencies = [
    { code: 'BDT' as CurrencyCode, name: 'Bangladeshi Taka', flag: '🇧🇩' },
    { code: 'USD' as CurrencyCode, name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR' as CurrencyCode, name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP' as CurrencyCode, name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY' as CurrencyCode, name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'INR' as CurrencyCode, name: 'Indian Rupee', flag: '🇮🇳' }
  ];

  const handleConvert = () => {
    if (amount && fromCurrency && toCurrency) {
      const rate = exchangeRates[fromCurrency as CurrencyCode]?.[toCurrency as CurrencyCode] || 1;
      const result = parseFloat(amount) * rate;
      setConvertedAmount(result.toFixed(2));
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(convertedAmount);
    setConvertedAmount(amount);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Currency Exchange</h2>

      {/* Exchange Calculator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="space-y-2">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <ArrowTrendingUpIcon className="w-5 h-5 transform rotate-90" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="space-y-2">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={convertedAmount}
                readOnly
                placeholder="Converted amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleConvert}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Convert
          </button>
        </div>

        {convertedAmount && (
          <div className="mt-4 text-center">
            <p className="text-lg">
              <span className="font-semibold">{amount} {fromCurrency}</span> = 
              <span className="font-bold text-blue-600 ml-2">{convertedAmount} {toCurrency}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Rate: 1 {fromCurrency} = {exchangeRates[fromCurrency as keyof typeof exchangeRates]?.[toCurrency as keyof typeof exchangeRates['BDT']]?.toFixed(4)} {toCurrency}
            </p>
          </div>
        )}
      </div>

      {/* Exchange Rates Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Exchange Rates</h3>
          <p className="text-sm text-gray-500">Base Currency: BDT</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.filter(c => c.code !== 'BDT').map((currency) => {
                const rate = exchangeRates['BDT'][currency.code as keyof typeof exchangeRates['BDT']];
                const buyRate = rate * 0.98; // Slightly lower for buy
                const sellRate = rate * 1.02; // Slightly higher for sell
                const change = Math.random() > 0.5 ? '+' : '-';
                const changeValue = (Math.random() * 2).toFixed(2);
                
                return (
                  <tr key={currency.code}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{currency.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                          <div className="text-sm text-gray-500">{currency.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {buyRate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sellRate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${change === '+' ? 'text-green-600' : 'text-red-600'}`}>
                        {change}{changeValue}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Investment;