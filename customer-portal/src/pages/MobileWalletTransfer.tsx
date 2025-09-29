import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface FormData {
  walletProvider: string;
  recipientMobile: string;
  amount: string;
  purpose: string;
  recipientName: string;
}

interface WalletProvider {
  id: string;
  name: string;
  logo: string;
}

interface TransactionData {
  type: string;
  walletProvider: string;
  recipientMobile: string;
  recipientName: string;
  amount: number;
  purpose: string;
  fee: number;
  total: number;
}

const MobileWalletTransfer: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    walletProvider: '',
    recipientMobile: '',
    amount: '',
    purpose: '',
    recipientName: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const walletProviders: WalletProvider[] = [
    { id: 'bkash', name: 'bKash', logo: '📱' },
    { id: 'nagad', name: 'Nagad', logo: '💳' },
    { id: 'rocket', name: 'Rocket', logo: '🚀' },
    { id: 'upay', name: 'Upay', logo: '💰' }
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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.walletProvider) {
      newErrors.walletProvider = 'Please select a wallet provider';
    }

    if (!formData.recipientMobile) {
      newErrors.recipientMobile = 'Mobile number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.recipientMobile)) {
      newErrors.recipientMobile = 'Please enter a valid mobile number';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const transaction: TransactionData = {
      type: 'Mobile Wallet Transfer',
      walletProvider: walletProviders.find(p => p.id === formData.walletProvider)?.name || '',
      recipientMobile: formData.recipientMobile,
      recipientName: formData.recipientName,
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      fee: parseFloat(formData.amount) * 0.01, // 1% fee
      total: parseFloat(formData.amount) + (parseFloat(formData.amount) * 0.01)
    };

    setTransactionData(transaction);
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setError('');
      setFormData({
        walletProvider: '',
        recipientMobile: '',
        amount: '',
        purpose: '',
        recipientName: ''
      });
      
      // Update balance
      if (transactionData) {
        setCurrentBalance(prev => prev - transactionData.total);
      }
      
    } catch (error) {
      setError('Transaction failed. Please try again.');
      console.error('Transaction error:', error);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mobile Wallet Transfer</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-blue-600">
                {loadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `৳${currentBalance.toLocaleString()}`
                )}
              </p>
            </div>
          </div>

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
                    Transfer completed successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Wallet Provider *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {walletProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`relative cursor-pointer rounded-lg border p-4 text-center transition-colors ${
                      formData.walletProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleInputChange({ target: { name: 'walletProvider', value: provider.id } })}
                  >
                    <div className="text-2xl mb-2">{provider.logo}</div>
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                    {formData.walletProvider === provider.id && (
                      <div className="absolute top-2 right-2">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.walletProvider && (
                <p className="mt-1 text-sm text-red-600">{errors.walletProvider}</p>
              )}
            </div>

            {/* Recipient Mobile */}
            <div>
              <label htmlFor="recipientMobile" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Mobile Number *
              </label>
              <input
                type="tel"
                id="recipientMobile"
                name="recipientMobile"
                value={formData.recipientMobile}
                onChange={handleInputChange}
                placeholder="01XXXXXXXXX"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.recipientMobile ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.recipientMobile && (
                <p className="mt-1 text-sm text-red-600">{errors.recipientMobile}</p>
              )}
            </div>

            {/* Recipient Name */}
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name (Optional)
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Enter recipient name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (৳) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="1"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              {formData.amount && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Transfer Fee (1%): ৳{(parseFloat(formData.amount || '0') * 0.01).toFixed(2)}</p>
                  <p className="font-medium">Total: ৳{(parseFloat(formData.amount || '0') + (parseFloat(formData.amount || '0') * 0.01)).toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.purpose ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select purpose</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="family">Family Support</option>
                <option value="education">Education</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Transfer Money'}
              </button>
            </div>
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
                  Please verify the recipient's mobile number carefully. Mobile wallet transfers are processed instantly and cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && transactionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Mobile Wallet Transfer</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Wallet Provider:</span>
                <span className="font-medium">{transactionData.walletProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile Number:</span>
                <span className="font-medium">{transactionData.recipientMobile}</span>
              </div>
              {transactionData.recipientName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{transactionData.recipientName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{transactionData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee (1%):</span>
                <span className="font-medium">৳{transactionData.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total:</span>
                <span>৳{transactionData.total.toFixed(2)}</span>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

export default MobileWalletTransfer;