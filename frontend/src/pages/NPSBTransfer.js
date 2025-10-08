import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TransactionConfirmation from '../components/TransactionConfirmation';

const NPSBTransfer = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipientAccount: '',
    recipientBank: '',
    amount: '',
    purpose: '',
    recipientName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Major Bangladeshi banks for NPSB
  const bangladeshiBanks = [
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
    { code: 'TRUST', name: 'Trust Bank Limited', routingNumber: '155' }
  ];

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch('/api/account/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientAccount.trim()) {
      newErrors.recipientAccount = 'Recipient account number is required';
    } else if (!/^\d{10,20}$/.test(formData.recipientAccount)) {
      newErrors.recipientAccount = 'Account number must be 10-20 digits';
    }

    if (!formData.recipientBank) {
      newErrors.recipientBank = 'Please select a bank';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    } else if (parseFloat(formData.amount) < 10) {
      newErrors.amount = 'Minimum transfer amount is ৳10';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedBank = bangladeshiBanks.find(bank => bank.code === formData.recipientBank);
      const transactionDetails = {
        type: 'NPSB Transfer',
        recipientAccount: formData.recipientAccount,
        recipientName: formData.recipientName,
        recipientBank: selectedBank?.name,
        bankCode: selectedBank?.code,
        routingNumber: selectedBank?.routingNumber,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        fee: calculateFee(parseFloat(formData.amount)),
        totalAmount: parseFloat(formData.amount) + calculateFee(parseFloat(formData.amount))
      };
      setTransactionData(transactionDetails);
      setShowConfirmation(true);
    }
  };

  const calculateFee = (amount) => {
    // NPSB fee structure
    if (amount <= 1000) return 5;
    if (amount <= 5000) return 10;
    if (amount <= 25000) return 15;
    return 25;
  };

  const handleConfirmTransaction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transfer/npsb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transactionData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setError('');
        setFormData({
          recipientAccount: '',
          recipientBank: '',
          amount: '',
          purpose: '',
          recipientName: ''
        });
        fetchCurrentBalance();
      } else {
        setError(data.message || 'Transfer failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">NPSB Transfer</h1>
            <p className="text-primary-100 mt-1">National Payment Switch Bangladesh - Instant Bank Transfer</p>
          </div>

          <div className="p-6">
            {/* Account Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-secondary-600">Account Holder</p>
                  <p className="font-semibold text-secondary-900">{user?.name}</p>
                  <p className="text-sm text-secondary-600">Account: {user?.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-600">Available Balance</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {loadingBalance ? '...' : `৳${currentBalance.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 font-medium">NPSB transfer completed successfully!</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Bank */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Recipient Bank *
                </label>
                <select
                  name="recipientBank"
                  value={formData.recipientBank}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.recipientBank ? 'border-red-300' : 'border-secondary-300'
                  }`}
                >
                  <option value="">Select Bank</option>
                  {bangladeshiBanks.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.recipientBank && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientBank}</p>
                )}
              </div>

              {/* Recipient Account */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Recipient Account Number *
                </label>
                <input
                  type="text"
                  name="recipientAccount"
                  value={formData.recipientAccount}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.recipientAccount ? 'border-red-300' : 'border-secondary-300'
                  }`}
                />
                {errors.recipientAccount && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientAccount}</p>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Enter recipient name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.recipientName ? 'border-red-300' : 'border-secondary-300'
                  }`}
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="10"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.amount ? 'border-red-300' : 'border-secondary-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition-colors"
                    >
                      ৳{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Purpose *
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Enter transfer purpose"
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.purpose ? 'border-red-300' : 'border-secondary-300'
                  }`}
                />
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {/* Fee Information */}
              {formData.amount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Transaction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Transfer Amount:</span>
                      <span className="font-medium">৳{parseFloat(formData.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">NPSB Fee:</span>
                      <span className="font-medium">৳{calculateFee(parseFloat(formData.amount || 0))}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1 font-semibold">
                      <span className="text-blue-900">Total Amount:</span>
                      <span>৳{(parseFloat(formData.amount || 0) + calculateFee(parseFloat(formData.amount || 0))).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Transfer Money'}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Always verify recipient details before confirming transfer. NPSB transfers are processed instantly and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Confirmation Modal */}
      {showConfirmation && (
        <TransactionConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmTransaction}
          transactionData={transactionData}
          loading={loading}
        />
      )}
    </div>
  );
};

export default NPSBTransfer;