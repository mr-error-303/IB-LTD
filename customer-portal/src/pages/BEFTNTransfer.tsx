import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface FormData {
  recipientAccount: string;
  recipientBank: string;
  routingNumber: string;
  amount: string;
  purpose: string;
  recipientName: string;
  recipientAddress: string;
}

interface Bank {
  code: string;
  name: string;
  routingNumber: string;
}

interface TransactionData {
  type: string;
  recipientAccount: string;
  recipientName: string;
  recipientAddress: string;
  recipientBank: string;
  bankCode: string;
  routingNumber: string;
  amount: number;
  purpose: string;
  fee: number;
  totalAmount: number;
}

const BEFTNTransfer: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    recipientAccount: '',
    recipientBank: '',
    routingNumber: '',
    amount: '',
    purpose: '',
    recipientName: '',
    recipientAddress: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // BEFTN participating banks with routing numbers
  const beftnBanks: Bank[] = [
    { code: 'SONALI', name: 'Sonali Bank Limited', routingNumber: '200' },
    { code: 'JANATA', name: 'Janata Bank Limited', routingNumber: '110' },
    { code: 'AGRANI', name: 'Agrani Bank Limited', routingNumber: '020' },
    { code: 'RUPALI', name: 'Rupali Bank Limited', routingNumber: '185' },
    { code: 'DBBL', name: 'Dutch-Bangla Bank Limited', routingNumber: '090' },
    { code: 'BRAC', name: 'BRAC Bank Limited', routingNumber: '060' },
    { code: 'EBL', name: 'Eastern Bank Limited', routingNumber: '095' },
    { code: 'CITY', name: 'City Bank Limited', routingNumber: '225' },
    { code: 'IFIC', name: 'IFIC Bank Limited', routingNumber: '100' },
    { code: 'MTB', name: 'Mutual Trust Bank Limited', routingNumber: '115' },
    { code: 'PRIME', name: 'Prime Bank Limited', routingNumber: '120' },
    { code: 'UCBL', name: 'United Commercial Bank Limited', routingNumber: '160' },
    { code: 'SIBL', name: 'Social Islami Bank Limited', routingNumber: '125' },
    { code: 'IBBL', name: 'Islami Bank Bangladesh Limited', routingNumber: '125' },
    { code: 'AB', name: 'AB Bank Limited', routingNumber: '015' },
    { code: 'NCCBL', name: 'NCC Bank Limited', routingNumber: '050' },
    { code: 'MERCANTILE', name: 'Mercantile Bank Limited', routingNumber: '065' },
    { code: 'STANDARD', name: 'Standard Bank Limited', routingNumber: '130' },
    { code: 'TRUST', name: 'Trust Bank Limited', routingNumber: '155' },
    { code: 'BASIC', name: 'BASIC Bank Limited', routingNumber: '030' },
    { code: 'BANGLADESH', name: 'Bangladesh Development Bank Limited', routingNumber: '040' }
  ];

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      setLoadingBalance(true);
      // Simulate API call
      setTimeout(() => {
        setCurrentBalance(25000);
        setLoadingBalance(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setLoadingBalance(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill routing number when bank is selected
    if (name === 'recipientBank') {
      const selectedBank = beftnBanks.find(bank => bank.code === value);
      if (selectedBank) {
        setFormData(prev => ({
          ...prev,
          routingNumber: selectedBank.routingNumber
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.recipientBank) {
      newErrors.recipientBank = 'Please select a bank';
    }

    if (!formData.recipientAccount.trim()) {
      newErrors.recipientAccount = 'Recipient account number is required';
    } else if (!/^\d{10,20}$/.test(formData.recipientAccount)) {
      newErrors.recipientAccount = 'Account number must be 10-20 digits';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.recipientAddress.trim()) {
      newErrors.recipientAddress = 'Recipient address is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    } else if (parseFloat(formData.amount) < 100) {
      newErrors.amount = 'Minimum transfer amount is ৳100';
    } else if (parseFloat(formData.amount) > 500000) {
      newErrors.amount = 'Maximum transfer amount is ৳5,00,000';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedBank = beftnBanks.find(bank => bank.code === formData.recipientBank);
      const transactionDetails: TransactionData = {
        type: 'BEFTN Transfer',
        recipientAccount: formData.recipientAccount,
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        recipientBank: selectedBank?.name || '',
        bankCode: selectedBank?.code || '',
        routingNumber: selectedBank?.routingNumber || '',
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        fee: calculateFee(parseFloat(formData.amount)),
        totalAmount: parseFloat(formData.amount) + calculateFee(parseFloat(formData.amount))
      };
      setTransactionData(transactionDetails);
      setShowConfirmation(true);
    }
  };

  const calculateFee = (amount: number): number => {
    // BEFTN fee structure
    if (amount <= 1000) return 10;
    if (amount <= 10000) return 15;
    if (amount <= 100000) return 25;
    return 50;
  };

  const handleConfirmTransaction = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setError('');
      setFormData({
        recipientAccount: '',
        recipientBank: '',
        routingNumber: '',
        amount: '',
        purpose: '',
        recipientName: '',
        recipientAddress: ''
      });
      
      // Update balance
      if (transactionData) {
        setCurrentBalance(prev => prev - transactionData.totalAmount);
      }
      
    } catch (error) {
      setError('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">BEFTN Transfer</h1>
            <p className="text-green-100 mt-1">Bangladesh Electronic Fund Transfer Network - Batch Processing</p>
          </div>

          <div className="p-6">
            {/* Account Info */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Account Holder</p>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">Account: {user?.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loadingBalance ? '...' : `৳${currentBalance.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      BEFTN transfer submitted successfully! It will be processed in the next batch.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Bank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Bank *
                </label>
                <select
                  name="recipientBank"
                  value={formData.recipientBank}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.recipientBank ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Bank</option>
                  {beftnBanks.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name} ({bank.routingNumber})
                    </option>
                  ))}
                </select>
                {errors.recipientBank && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientBank}</p>
                )}
              </div>

              {/* Routing Number (Auto-filled) */}
              {formData.routingNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}

              {/* Recipient Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Account Number *
                </label>
                <input
                  type="text"
                  name="recipientAccount"
                  value={formData.recipientAccount}
                  onChange={handleChange}
                  placeholder="Enter recipient's account number"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.recipientAccount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.recipientAccount && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientAccount}</p>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Enter recipient's full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.recipientName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
                )}
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address *
                </label>
                <textarea
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  placeholder="Enter recipient's address"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.recipientAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.recipientAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientAddress}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="100.00"
                  min="100"
                  max="500000"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-sm text-gray-600">
                  Minimum: ৳100 | Maximum: ৳5,00,000
                </p>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      ৳{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Enter transfer purpose"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.purpose ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {/* Fee Information */}
              {formData.amount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Transaction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Transfer Amount:</span>
                      <span className="font-medium">৳{parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">BEFTN Fee:</span>
                      <span className="font-medium">৳{calculateFee(parseFloat(formData.amount || '0'))}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-1 font-semibold">
                      <span className="text-green-900">Total Amount:</span>
                      <span>৳{(parseFloat(formData.amount || '0') + calculateFee(parseFloat(formData.amount || '0'))).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-green-600">
                    * BEFTN transfers are processed in batches. Your transfer will be completed within 2-4 hours.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Transfer'}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Please verify all recipient details carefully. BEFTN transfers are processed in batches and may take 2-4 hours to complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && transactionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm BEFTN Transfer</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">To Bank:</span>
                <span className="font-medium">{transactionData.recipientBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium">{transactionData.recipientAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{transactionData.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{transactionData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">৳{transactionData.fee}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total:</span>
                <span>৳{transactionData.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransaction}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BEFTNTransfer;