import React, { useState, useEffect } from 'react';
import { 
  Building, 
  TrendingUp, 
  Calculator, 
  PieChart, 
  Calendar, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Banknote,
  Plus,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  FileText,
  Download,
  Settings,
  Zap,
  Shield,
  Award,
  Globe
} from 'lucide-react';

// Types for foreign currency deposits
interface CurrencyDepositProduct {
  id: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  terms: number[]; // Available terms in months
  interestRates: { [term: number]: number }; // Interest rates by term
  compounding: 'monthly' | 'quarterly' | 'annually';
  earlyWithdrawal: boolean;
  earlyWithdrawalPenalty: number;
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
  popularity: number;
}

interface ActiveDeposit {
  id: string;
  productId: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  principalAmount: number;
  interestRate: number;
  term: number;
  startDate: string;
  maturityDate: string;
  currentValue: number;
  accruedInterest: number;
  status: 'active' | 'matured' | 'closed';
  autoRenewal: boolean;
  nextInterestPayment?: string;
}

interface DepositCalculation {
  principalAmount: number;
  interestRate: number;
  term: number;
  compounding: string;
  maturityAmount: number;
  totalInterest: number;
  monthlyBreakdown: Array<{
    month: number;
    principal: number;
    interest: number;
    total: number;
  }>;
}

const ForeignCurrencyDeposits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'calculator' | 'portfolio' | 'history'>('products');
  const [showBalances, setShowBalances] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showNewDepositModal, setShowNewDepositModal] = useState(false);

  // Deposit products
  const [depositProducts] = useState<CurrencyDepositProduct[]>([
    {
      id: 'USD_FD',
      currency: 'US Dollar',
      currencyCode: 'USD',
      currencySymbol: '$',
      name: 'USD Fixed Deposit',
      minAmount: 1000,
      maxAmount: 1000000,
      terms: [3, 6, 12, 24, 36, 60],
      interestRates: {
        3: 3.25,
        6: 3.50,
        12: 3.75,
        24: 4.00,
        36: 4.25,
        60: 4.50
      },
      compounding: 'quarterly',
      earlyWithdrawal: true,
      earlyWithdrawalPenalty: 1.0,
      features: ['Quarterly compounding', 'Early withdrawal option', 'Auto-renewal available', 'Competitive rates'],
      riskLevel: 'low',
      popularity: 95
    },
    {
      id: 'EUR_FD',
      currency: 'Euro',
      currencyCode: 'EUR',
      currencySymbol: '€',
      name: 'EUR Fixed Deposit',
      minAmount: 1000,
      maxAmount: 1000000,
      terms: [3, 6, 12, 24, 36],
      interestRates: {
        3: 2.75,
        6: 3.00,
        12: 3.25,
        24: 3.50,
        36: 3.75
      },
      compounding: 'quarterly',
      earlyWithdrawal: true,
      earlyWithdrawalPenalty: 1.0,
      features: ['Stable European currency', 'Quarterly compounding', 'Flexible terms', 'Premium rates'],
      riskLevel: 'low',
      popularity: 85
    },
    {
      id: 'GBP_FD',
      currency: 'British Pound',
      currencyCode: 'GBP',
      currencySymbol: '£',
      name: 'GBP Fixed Deposit',
      minAmount: 1000,
      maxAmount: 1000000,
      terms: [6, 12, 24, 36],
      interestRates: {
        6: 3.75,
        12: 4.00,
        24: 4.25,
        36: 4.50
      },
      compounding: 'quarterly',
      earlyWithdrawal: true,
      earlyWithdrawalPenalty: 1.5,
      features: ['Strong currency performance', 'Higher interest rates', 'Quarterly compounding', 'Premium investment'],
      riskLevel: 'medium',
      popularity: 75
    }
  ]);

  // Active deposits
  const [activeDeposits] = useState<ActiveDeposit[]>([
    {
      id: 'DEP001',
      productId: 'USD_FD',
      currency: 'US Dollar',
      currencyCode: 'USD',
      currencySymbol: '$',
      principalAmount: 50000,
      interestRate: 3.75,
      term: 12,
      startDate: '2024-01-15',
      maturityDate: '2025-01-15',
      currentValue: 51562.50,
      accruedInterest: 1562.50,
      status: 'active',
      autoRenewal: true,
      nextInterestPayment: '2024-04-15'
    },
    {
      id: 'DEP002',
      productId: 'EUR_FD',
      currency: 'Euro',
      currencyCode: 'EUR',
      currencySymbol: '€',
      principalAmount: 25000,
      interestRate: 3.25,
      term: 12,
      startDate: '2023-12-01',
      maturityDate: '2024-12-01',
      currentValue: 25675.00,
      accruedInterest: 675.00,
      status: 'active',
      autoRenewal: false,
      nextInterestPayment: '2024-03-01'
    },
    {
      id: 'DEP003',
      productId: 'GBP_FD',
      currency: 'British Pound',
      currencyCode: 'GBP',
      currencySymbol: '£',
      principalAmount: 15000,
      interestRate: 4.00,
      term: 24,
      startDate: '2023-06-01',
      maturityDate: '2025-06-01',
      currentValue: 15800.00,
      accruedInterest: 800.00,
      status: 'active',
      autoRenewal: true,
      nextInterestPayment: '2024-03-01'
    }
  ]);

  // Calculator state
  const [calculator, setCalculator] = useState({
    currency: 'USD',
    amount: '',
    term: 12,
    interestRate: 3.75,
    compounding: 'quarterly'
  });

  // Currency icons
  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'USD': return <DollarSign className="w-5 h-5" />;
      case 'EUR': return <Euro className="w-5 h-5" />;
      case 'GBP': return <PoundSterling className="w-5 h-5" />;
      case 'BDT': return <Banknote className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  // Calculate deposit returns
  const calculateReturns = (principal: number, rate: number, term: number, compounding: string): DepositCalculation => {
    const monthlyRate = rate / 100 / 12;
    const compoundingFreq = compounding === 'monthly' ? 12 : compounding === 'quarterly' ? 4 : 1;
    const periodicRate = rate / 100 / compoundingFreq;
    const periods = (term / 12) * compoundingFreq;
    
    const maturityAmount = principal * Math.pow(1 + periodicRate, periods);
    const totalInterest = maturityAmount - principal;
    
    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 1; month <= term; month++) {
      const monthlyPeriods = (month / 12) * compoundingFreq;
      const monthlyValue = principal * Math.pow(1 + periodicRate, monthlyPeriods);
      monthlyBreakdown.push({
        month,
        principal,
        interest: monthlyValue - principal,
        total: monthlyValue
      });
    }

    return {
      principalAmount: principal,
      interestRate: rate,
      term,
      compounding,
      maturityAmount,
      totalInterest,
      monthlyBreakdown
    };
  };

  // Get total portfolio value
  const getTotalPortfolioValue = () => {
    return activeDeposits.reduce((total, deposit) => total + deposit.currentValue, 0);
  };

  // Products Component
  const ProductsComponent = () => (
    <div className="space-y-6">
      {/* Featured Products */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Foreign Currency Fixed Deposits</h2>
              <p className="text-green-100">Secure your future with international currencies</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Up to 4.50%</div>
            <div className="text-green-100 text-sm">Annual Interest Rate</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Capital Protected</span>
            </div>
            <p className="text-green-100 text-sm">Your principal is fully guaranteed</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-5 h-5" />
              <span className="font-medium">Multi-Currency</span>
            </div>
            <p className="text-green-100 text-sm">USD, EUR, GBP options available</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-medium">Flexible Terms</span>
            </div>
            <p className="text-green-100 text-sm">3 months to 5 years duration</p>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {depositProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${
                  product.currencyCode === 'USD' ? 'bg-green-100 text-green-600' :
                  product.currencyCode === 'EUR' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {getCurrencyIcon(product.currencyCode)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.currency}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                product.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.riskLevel.toUpperCase()} RISK
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Interest Rate Range</span>
                  <span className="font-semibold text-green-600">
                    {Math.min(...Object.values(product.interestRates))}% - {Math.max(...Object.values(product.interestRates))}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Minimum Amount</span>
                  <span className="font-medium text-gray-900">
                    {product.currencySymbol}{product.minAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Terms</span>
                  <span className="font-medium text-gray-900">
                    {product.terms.join(', ')} months
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
                <div className="space-y-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button 
                  onClick={() => setShowNewDepositModal(true)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Invest Now
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interest Rate Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Interest Rate Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Currency</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">3 Months</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">6 Months</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">12 Months</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">24 Months</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">36 Months</th>
              </tr>
            </thead>
            <tbody>
              {depositProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getCurrencyIcon(product.currencyCode)}
                      <span className="font-medium text-gray-900">{product.currencyCode}</span>
                    </div>
                  </td>
                  {[3, 6, 12, 24, 36].map((term) => (
                    <td key={term} className="text-center py-3 px-4">
                      {product.interestRates[term] ? (
                        <span className="font-semibold text-green-600">
                          {product.interestRates[term]}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Calculator Component
  const CalculatorComponent = () => {
    const selectedProduct = depositProducts.find(p => p.currencyCode === calculator.currency);
    const calculation = calculator.amount ? 
      calculateReturns(
        parseFloat(calculator.amount), 
        calculator.interestRate, 
        calculator.term, 
        calculator.compounding
      ) : null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fixed Deposit Calculator</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={calculator.currency}
                  onChange={(e) => {
                    const product = depositProducts.find(p => p.currencyCode === e.target.value);
                    setCalculator(prev => ({
                      ...prev,
                      currency: e.target.value,
                      interestRate: product?.interestRates[prev.term] || prev.interestRate
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {depositProducts.map(product => (
                    <option key={product.currencyCode} value={product.currencyCode}>
                      {product.currencyCode} - {product.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount</label>
                <input
                  type="number"
                  value={calculator.amount}
                  onChange={(e) => setCalculator(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Minimum ${selectedProduct?.currencySymbol}${selectedProduct?.minAmount.toLocaleString()}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Term</label>
                <select
                  value={calculator.term}
                  onChange={(e) => {
                    const term = parseInt(e.target.value);
                    const product = depositProducts.find(p => p.currencyCode === calculator.currency);
                    setCalculator(prev => ({
                      ...prev,
                      term,
                      interestRate: product?.interestRates[term] || prev.interestRate
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {selectedProduct?.terms.map(term => (
                    <option key={term} value={term}>
                      {term} months ({(term / 12).toFixed(1)} years)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calculator.interestRate}
                    onChange={(e) => setCalculator(prev => ({ ...prev, interestRate: parseFloat(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">% p.a.</span>
                </div>
              </div>
            </div>

            {/* Calculation Results */}
            <div className="space-y-6">
              {calculation && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Investment Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Principal Amount:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedProduct?.currencySymbol}{calculation.principalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Earned:</span>
                        <span className="font-semibold text-green-600">
                          {selectedProduct?.currencySymbol}{calculation.totalInterest.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment Term:</span>
                        <span className="font-semibold text-gray-900">
                          {calculation.term} months
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Maturity Amount:</span>
                        <span className="font-bold text-blue-600 text-xl">
                          {selectedProduct?.currencySymbol}{calculation.maturityAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Investment Details</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Interest compounded {calculation.compounding}</p>
                      <p>• Early withdrawal penalty may apply</p>
                      <p>• Auto-renewal option available</p>
                      <p>• Interest payments as per schedule</p>
                    </div>
                  </div>
                </>
              )}

              <button
                disabled={!calculator.amount || parseFloat(calculator.amount) < (selectedProduct?.minAmount || 0)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Investment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Portfolio Component
  const PortfolioComponent = () => (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fixed Deposit Portfolio</h2>
              <p className="text-purple-100">Your foreign currency investments</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold mb-1">
              {showBalances ? `$${getTotalPortfolioValue().toLocaleString()}` : '••••••••'}
            </div>
            <div className="text-purple-100 text-sm">Total Portfolio Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-green-300">
              {activeDeposits.length}
            </div>
            <div className="text-purple-100 text-sm">Active Deposits</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-yellow-300">
              3.85%
            </div>
            <div className="text-purple-100 text-sm">Avg. Interest Rate</div>
          </div>
        </div>
      </div>

      {/* Active Deposits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeDeposits.map((deposit) => (
          <div key={deposit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${
                  deposit.currencyCode === 'USD' ? 'bg-green-100 text-green-600' :
                  deposit.currencyCode === 'EUR' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {getCurrencyIcon(deposit.currencyCode)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{deposit.currency} Fixed Deposit</h3>
                  <p className="text-sm text-gray-500">{deposit.term} months term</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                deposit.status === 'active' ? 'bg-green-100 text-green-800' :
                deposit.status === 'matured' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deposit.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Principal Amount</div>
                  <div className="font-semibold text-gray-900">
                    {showBalances ? 
                      `${deposit.currencySymbol}${deposit.principalAmount.toLocaleString()}` : 
                      '••••••••'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Current Value</div>
                  <div className="font-semibold text-green-600">
                    {showBalances ? 
                      `${deposit.currencySymbol}${deposit.currentValue.toLocaleString()}` : 
                      '••••••••'
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Interest Rate</div>
                  <div className="font-medium text-gray-900">{deposit.interestRate}% p.a.</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Accrued Interest</div>
                  <div className="font-medium text-green-600">
                    {showBalances ? 
                      `${deposit.currencySymbol}${deposit.accruedInterest.toLocaleString()}` : 
                      '••••••••'
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Maturity Date</div>
                  <div className="font-medium text-gray-900">
                    {new Date(deposit.maturityDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Auto Renewal</div>
                  <div className={`font-medium ${deposit.autoRenewal ? 'text-green-600' : 'text-gray-600'}`}>
                    {deposit.autoRenewal ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              {deposit.nextInterestPayment && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Next Interest Payment: {new Date(deposit.nextInterestPayment).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-xl">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foreign Currency Fixed Deposits</h1>
            <p className="text-gray-600">Secure investments in international currencies</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewDepositModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Deposit</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'products', label: 'Products', icon: Building },
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'portfolio', label: 'My Portfolio', icon: PieChart },
              { id: 'history', label: 'History', icon: FileText }
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
          {activeTab === 'products' && <ProductsComponent />}
          {activeTab === 'calculator' && <CalculatorComponent />}
          {activeTab === 'portfolio' && <PortfolioComponent />}
          {activeTab === 'history' && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Investment History</h3>
              <p className="text-gray-500">View your past fixed deposit investments and transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForeignCurrencyDeposits;