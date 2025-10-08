import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Building2, Smartphone, DollarSign, CheckCircle, AlertCircle, Loader2, Shield, Clock, Receipt, Banknote, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
}

interface Transaction {
  id: string;
  method: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  reference: string;
}

const AddMoney: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(selectedCurrency.code);

  const formatFee = (fee: string) => {
    if (fee === 'Free' || fee.includes('%')) {
      return fee;
    }
    return `${currencySymbol}${fee}`;
  };
  
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionResult, setTransactionResult] = useState<'success' | 'error' | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Transfer from your bank account',
      fee: 'Free',
      processingTime: '1-2 business days',
      minAmount: 100,
      maxAmount: 100000
    },
    {
      id: 'mobile-banking',
      name: 'Mobile Banking',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Add money via mobile banking',
      fee: '2',
      processingTime: 'Instant',
      minAmount: 50,
      maxAmount: 25000
    },
    {
      id: 'debit-credit-card',
      name: 'Debit/Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Add money using your debit or credit card',
      fee: '2.5% + 5',
      processingTime: 'Instant',
      minAmount: 10,
      maxAmount: 50000
    },
    {
      id: 'cash-deposit',
      name: 'Cash Deposit',
      icon: <Banknote className="w-6 h-6" />,
      description: 'Deposit cash at our branch locations',
      fee: 'Free',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 200000
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Use secure payment gateway services',
      fee: '1.8% + 3',
      processingTime: 'Instant',
      minAmount: 1,
      maxAmount: 100000
    }
  ];

  useEffect(() => {
    // Load recent transactions
    const mockTransactions: Transaction[] = [
      {
        id: 'TXN001',
        method: 'Debit Card',
        amount: 5000,
        status: 'completed',
        date: '2024-01-15',
        reference: 'REF123456789'
      },
      {
        id: 'TXN002',
        method: 'UPI',
        amount: 2500,
        status: 'pending',
        date: '2024-01-14',
        reference: 'REF987654321'
      }
    ];
    setRecentTransactions(mockTransactions);
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedMethod) {
      newErrors.method = 'Please select a payment method';
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else {
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
      if (selectedPaymentMethod) {
        const amountNum = parseFloat(amount);
        if (amountNum < selectedPaymentMethod.minAmount) {
          newErrors.amount = `Minimum amount is ${currencySymbol}${selectedPaymentMethod.minAmount}`;
        }
        if (amountNum > selectedPaymentMethod.maxAmount) {
          newErrors.amount = `Maximum amount is ${currencySymbol}${selectedPaymentMethod.maxAmount}`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmTransaction = async () => {
    setIsLoading(true);
    setShowConfirmation(false);
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      setTransactionResult(success ? 'success' : 'error');
      setIsLoading(false);
      
      if (success) {
        // Add new transaction to recent transactions
        const newTransaction: Transaction = {
          id: `TXN${Date.now()}`,
          method: paymentMethods.find(m => m.id === selectedMethod)?.name || '',
          amount: parseFloat(amount),
          status: 'completed',
          date: new Date().toISOString().split('T')[0],
          reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
        setRecentTransactions(prev => [newTransaction, ...prev]);
        
        // Reset form
        setAmount('');
        setSelectedMethod('');
      }
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Processing Transaction</h2>
          <p className="text-gray-300">Please wait while we process your payment...</p>
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
              <h2 className="text-2xl font-bold text-white mb-2">Transaction Successful!</h2>
              <p className="text-gray-300 mb-6">{currencySymbol}{amount} has been added to your account</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Transaction Failed</h2>
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
          <h1 className="text-2xl font-bold">Add Money</h1>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Transaction</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Method:</span>
                  <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="font-semibold">{currencySymbol}{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Fee:</span>
                  <span>{formatFee(paymentMethods.find(m => m.id === selectedMethod)?.fee || '')}</span>
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
                  onClick={handleConfirmTransaction}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Select Payment Method
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 mr-3">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fee:</span>
                        <span className="text-green-400">{formatFee(method.fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing:</span>
                        <span>{method.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Limit:</span>
                        <span>{currencySymbol}{method.minAmount} - {currencySymbol}{method.maxAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.method && (
                <p className="text-red-400 text-sm mt-2">{errors.method}</p>
              )}
            </div>

            {/* Amount Input */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">{currencySymbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-sm mt-2">{errors.amount}</p>
              )}
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[500, 1000, 2500, 5000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    {currencySymbol}{quickAmount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleProceed}
                disabled={!selectedMethod || !amount}
                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200"
              >
                Proceed to Payment
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Recent Transactions
            </h2>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 bg-white/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{transaction.method}</p>
                      <p className="text-sm text-gray-400">{currencySymbol}{transaction.amount.toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 text-xs capitalize">{transaction.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>{transaction.date}</p>
                    <p>Ref: {transaction.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;