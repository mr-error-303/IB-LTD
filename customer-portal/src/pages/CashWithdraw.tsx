import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, CreditCard, Smartphone, QrCode, Building2, Navigation, Clock, Shield, AlertTriangle, CheckCircle, Loader2, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';

interface ATM {
  id: string;
  name: string;
  address: string;
  distance: string;
  available24x7: boolean;
  cashAvailable: boolean;
  services: string[];
  coordinates: { lat: number; lng: number };
}

interface WithdrawalMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee: string;
  dailyLimit: number;
  minAmount: number;
  maxAmount: number;
}

interface Transaction {
  id: string;
  method: string;
  amount: number;
  location: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference: string;
}

const CashWithdraw: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(selectedCurrency.code);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'atm-locator' | 'history'>('withdraw');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedATM, setSelectedATM] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionResult, setTransactionResult] = useState<'success' | 'error' | null>(null);
  const [atmList, setAtmList] = useState<ATM[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [filterBy, setFilterBy] = useState<'all' | '24x7' | 'cash-available'>('all');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [dailyWithdrawn, setDailyWithdrawn] = useState<number>(15000);

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 'atm-withdraw',
      name: 'ATM Withdraw',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Withdraw cash using your ATM/Debit card at any ATM',
      fee: `Free at own ATMs, ${currencySymbol}20 at other ATMs`,
      dailyLimit: 50000,
      minAmount: 100,
      maxAmount: 10000
    },
    {
      id: 'agent-cash-out',
      name: 'Agent Cash Out',
      icon: <Navigation className="w-6 h-6" />,
      description: 'Cash out through authorized banking agents',
      fee: `${currencySymbol}15 per transaction`,
      dailyLimit: 30000,
      minAmount: 500,
      maxAmount: 15000
    },
    {
      id: 'bank-counter',
      name: 'Bank Counter',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Withdraw cash directly from bank branch counter',
      fee: 'Free',
      dailyLimit: 100000,
      minAmount: 1000,
      maxAmount: 50000
    },
    {
      id: 'cardless-withdrawal',
      name: 'Cardless Withdrawal',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Withdraw without card using mobile app and OTP',
      fee: 'Free',
      dailyLimit: 25000,
      minAmount: 500,
      maxAmount: 5000
    }
  ];

  useEffect(() => {
    // Load ATM locations and transaction history
    const mockATMs: ATM[] = [
      {
        id: '1',
        name: 'IB Bank ATM - Main Branch',
        address: '123 Main Street, City Center',
        distance: '0.5 km',
        available24x7: true,
        cashAvailable: true,
        services: ['Cash Withdrawal', 'Balance Inquiry', 'Mini Statement'],
        coordinates: { lat: 23.8103, lng: 90.4125 }
      },
      {
        id: '2',
        name: 'IB Bank ATM - Shopping Mall',
        address: '456 Mall Road, Shopping Complex',
        distance: '1.2 km',
        available24x7: true,
        cashAvailable: true,
        services: ['Cash Withdrawal', 'Balance Inquiry', 'PIN Change'],
        coordinates: { lat: 23.8203, lng: 90.4225 }
      },
      {
        id: '3',
        name: 'Partner ATM - City Bank',
        address: '789 Business District',
        distance: '2.1 km',
        available24x7: false,
        cashAvailable: false,
        services: ['Cash Withdrawal', 'Balance Inquiry'],
        coordinates: { lat: 23.8303, lng: 90.4325 }
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        method: 'ATM Card',
        amount: 5000,
        location: 'Main Branch ATM',
        status: 'completed',
        date: '2024-01-15',
        reference: 'ATM123456789'
      },
      {
        id: '2',
        method: 'Cardless Withdrawal',
        amount: 2000,
        location: 'Shopping Mall ATM',
        status: 'completed',
        date: '2024-01-14',
        reference: 'CWD987654321'
      }
    ];

    setAtmList(mockATMs);
    setTransactions(mockTransactions);
  }, []);

  const filteredATMs = atmList.filter(atm => {
    const matchesSearch = atm.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
                         atm.address.toLowerCase().includes(searchLocation.toLowerCase());
    
    if (filterBy === '24x7') return matchesSearch && atm.available24x7;
    if (filterBy === 'cash-available') return matchesSearch && atm.cashAvailable;
    return matchesSearch;
  });

  const validateWithdrawal = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedMethod) {
      newErrors.method = 'Please select a withdrawal method';
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else {
      const selectedMethodData = withdrawalMethods.find(m => m.id === selectedMethod);
      if (selectedMethodData) {
        const amountNum = parseFloat(amount);
        if (amountNum < selectedMethodData.minAmount) {
          newErrors.amount = `Minimum amount is ${currencySymbol}${selectedMethodData.minAmount}`;
        }
        if (amountNum > selectedMethodData.maxAmount) {
          newErrors.amount = `Maximum amount per transaction is ${currencySymbol}${selectedMethodData.maxAmount}`;
        }
        if (dailyWithdrawn + amountNum > selectedMethodData.dailyLimit) {
          newErrors.amount = `Daily limit exceeded. Remaining limit: ${currencySymbol}${selectedMethodData.dailyLimit - dailyWithdrawn}`;
        }
      }
    }
    
    if (selectedMethod === 'atm-withdraw' && !selectedATM) {
      newErrors.atm = 'Please select an ATM location';
    }
    
    if (!pin || pin.length !== 4) {
      newErrors.pin = 'Please enter a valid 4-digit PIN';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = () => {
    if (validateWithdrawal()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmWithdrawal = async () => {
    setIsLoading(true);
    setShowConfirmation(false);
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      setTransactionResult(success ? 'success' : 'error');
      setIsLoading(false);
      
      if (success) {
        // Update daily withdrawn amount
        setDailyWithdrawn(prev => prev + parseFloat(amount));
        
        // Add to transaction history
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          method: withdrawalMethods.find(m => m.id === selectedMethod)?.name || '',
          amount: parseFloat(amount),
          location: selectedATM ? atmList.find(a => a.id === selectedATM)?.name || 'Branch' : 'Mobile App',
          status: 'completed',
          date: new Date().toISOString().split('T')[0],
          reference: `${selectedMethod.toUpperCase()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Reset form
        setAmount('');
        setSelectedMethod('');
        setSelectedATM('');
        setPin('');
      }
    }, 3000);
  };

  const generateWithdrawalCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Processing Withdrawal</h2>
          <p className="text-gray-300">Please wait while we process your withdrawal request...</p>
        </div>
      </div>
    );
  }

  if (transactionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          {transactionResult === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Successful!</h2>
              <p className="text-gray-300 mb-4">{currencySymbol}{amount} withdrawal request processed</p>
              {(selectedMethod === 'cardless-withdrawal' || selectedMethod === 'qr-withdrawal') && (
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300 mb-2">Withdrawal Code:</p>
                  <p className="text-2xl font-bold text-blue-400">{generateWithdrawalCode()}</p>
                  <p className="text-xs text-gray-400 mt-2">Use this code at the ATM within 30 minutes</p>
                </div>
              )}
            </>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Failed</h2>
              <p className="text-gray-300 mb-6">Please try again or contact support</p>
            </>
          )}
          <button
            onClick={() => setTransactionResult(null)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Cash Withdrawal</h1>
        </div>

        {/* Daily Limit Info */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-400 mr-2" />
              <span className="font-medium">Daily Withdrawal Limit</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Used: {currencySymbol}{dailyWithdrawn.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Available: {currencySymbol}{(50000 - dailyWithdrawn).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Withdraw Cash
          </button>
          <button
            onClick={() => setActiveTab('atm-locator')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'atm-locator'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ATM Locator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-r-xl font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            History
          </button>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Withdrawal</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Method:</span>
                  <span>{withdrawalMethods.find(m => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="font-semibold">{currencySymbol}{amount}</span>
                </div>
                {selectedATM && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Location:</span>
                    <span className="text-sm">{atmList.find(a => a.id === selectedATM)?.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Fee:</span>
                  <span>{withdrawalMethods.find(m => m.id === selectedMethod)?.fee}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdrawal}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdrawal Methods */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Select Withdrawal Method</h2>
                <div className="space-y-3">
                  {withdrawalMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 mr-3">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{method.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{method.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Fee: {method.fee}</p>
                            <p>Daily Limit: {currencySymbol}{method.dailyLimit.toLocaleString()}</p>
                            <p>Per Transaction: {currencySymbol}{method.minAmount} - {currencySymbol}{method.maxAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.method && (
                  <p className="text-red-400 text-sm mt-2">{errors.method}</p>
                )}
              </div>

              {/* ATM Selection (for ATM card method) */}
              {selectedMethod === 'atm-card' && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Select ATM Location</h2>
                  <div className="space-y-3">
                    {atmList.filter(atm => atm.cashAvailable).map((atm) => (
                      <div
                        key={atm.id}
                        onClick={() => setSelectedATM(atm.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedATM === atm.id
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{atm.name}</h4>
                            <p className="text-sm text-gray-400">{atm.address}</p>
                            <p className="text-sm text-green-400">{atm.distance} away</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {atm.available24x7 && (
                              <span className="text-xs bg-green-600 px-2 py-1 rounded">24x7</span>
                            )}
                            {atm.cashAvailable && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.atm && (
                    <p className="text-red-400 text-sm mt-2">{errors.atm}</p>
                  )}
                </div>
              )}
            </div>

            {/* Withdrawal Details */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Withdrawal Details</h2>
              
              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">{currencySymbol}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-lg"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[500, 1000, 2000, 5000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    {currencySymbol}{quickAmount}
                  </button>
                ))}
              </div>

              {/* PIN */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Transaction PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="w-full py-3 px-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                {errors.pin && (
                  <p className="text-red-400 text-sm mt-1">{errors.pin}</p>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-400 mb-1">Security Notice</p>
                    <p className="text-gray-300">Never share your PIN or withdrawal codes with anyone. Complete your transaction within the specified time limit.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!selectedMethod || !amount || !pin || (selectedMethod === 'atm-card' && !selectedATM)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200"
              >
                Withdraw Cash
              </button>
            </div>
          </div>
        )}

        {activeTab === 'atm-locator' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">ATM Locator</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="py-2 px-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All ATMs</option>
                  <option value="24x7">24x7 Available</option>
                  <option value="cash-available">Cash Available</option>
                </select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredATMs.map((atm) => (
                <div key={atm.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{atm.name}</h3>
                      <p className="text-sm text-gray-400">{atm.address}</p>
                      <p className="text-sm text-green-400 flex items-center mt-1">
                        <Navigation className="w-3 h-3 mr-1" />
                        {atm.distance}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {atm.available24x7 && (
                        <span className="text-xs bg-green-600 px-2 py-1 rounded">24x7</span>
                      )}
                      {atm.cashAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    <p>Services: {atm.services.join(', ')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center justify-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Directions
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('withdraw');
                        setSelectedMethod('atm-card');
                        setSelectedATM(atm.id);
                      }}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                      disabled={!atm.cashAvailable}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Withdrawal History</h2>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{transaction.method}</h3>
                      <p className="text-sm text-gray-400">{transaction.location}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                      <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{currencySymbol}{transaction.amount.toLocaleString()}</p>
                      <div className={`flex items-center text-sm ${
                        transaction.status === 'completed' ? 'text-green-400' :
                        transaction.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {transaction.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {transaction.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                        {transaction.status === 'failed' && <AlertTriangle className="w-4 h-4 mr-1" />}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
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
  );
};

export default CashWithdraw;