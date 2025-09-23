import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const AddMoney = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    // Bank Transfer fields
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    // Mobile Banking fields
    mobileProvider: '',
    mobileNumber: '',
    // Card Payment fields
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // Online Banking fields
    onlineBankProvider: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Transfer from another bank account',
      processingTime: '1-3 business days',
      fee: 'Free'
    },
    {
      id: 'mobile_banking',
      name: 'Mobile Banking',
      icon: '📱',
      description: 'bKash, Nagad, Rocket, Upay',
      processingTime: 'Instant',
      fee: '1.5% + $0.50'
    },
    {
      id: 'card_payment',
      name: 'Debit/Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      processingTime: 'Instant',
      fee: '2.9% + $0.30'
    },
    {
      id: 'online_banking',
      name: 'Online Banking',
      icon: '🌐',
      description: 'Direct bank login',
      processingTime: 'Instant',
      fee: '1% + $0.25'
    }
  ];

  const mobileProviders = [
    { id: 'bkash', name: 'bKash', icon: '💰' },
    { id: 'nagad', name: 'Nagad', icon: '📲' },
    { id: 'rocket', name: 'Rocket', icon: '🚀' },
    { id: 'upay', name: 'Upay', icon: '💸' }
  ];

  const onlineBankProviders = [
    { id: 'dutch_bangla', name: 'Dutch-Bangla Bank' },
    { id: 'brac_bank', name: 'BRAC Bank' },
    { id: 'city_bank', name: 'City Bank' },
    { id: 'eastern_bank', name: 'Eastern Bank' },
    { id: 'islami_bank', name: 'Islami Bank Bangladesh' },
    { id: 'standard_chartered', name: 'Standard Chartered' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }

    if (parseFloat(formData.amount) < 10) {
      setError('Minimum add money amount is $10');
      return false;
    }

    if (parseFloat(formData.amount) > 10000) {
      setError('Maximum add money amount is $10,000 per transaction');
      return false;
    }

    if (!selectedMethod) {
      setError('Please select a payment method');
      return false;
    }

    // Method-specific validations
    switch (selectedMethod) {
      case 'bank_transfer':
        if (!formData.bankName || !formData.accountNumber || !formData.routingNumber) {
          setError('Please fill in all bank transfer details');
          return false;
        }
        break;
      case 'mobile_banking':
        if (!formData.mobileProvider || !formData.mobileNumber) {
          setError('Please select mobile provider and enter mobile number');
          return false;
        }
        if (!/^01[3-9]\d{8}$/.test(formData.mobileNumber)) {
          setError('Please enter a valid Bangladeshi mobile number');
          return false;
        }
        break;
      case 'card_payment':
        if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
          setError('Please fill in all card details');
          return false;
        }
        if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
          setError('Please enter a valid 16-digit card number');
          return false;
        }
        if (!/^\d{3,4}$/.test(formData.cvv)) {
          setError('Please enter a valid CVV');
          return false;
        }
        break;
      case 'online_banking':
        if (!formData.onlineBankProvider) {
          setError('Please select your bank');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/transactions/add-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethod: selectedMethod,
          description: formData.description || 'Add Money',
          paymentDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            mobileProvider: formData.mobileProvider,
            mobileNumber: formData.mobileNumber,
            cardNumber: formData.cardNumber ? formData.cardNumber.replace(/\s/g, '') : '',
            expiryDate: formData.expiryDate,
            cardholderName: formData.cardholderName,
            onlineBankProvider: formData.onlineBankProvider
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully initiated add money request for $${formData.amount}. ${data.message || 'Processing time varies by payment method.'}`);
        setFormData({
          amount: '',
          description: '',
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          mobileProvider: '',
          mobileNumber: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          onlineBankProvider: ''
        });
        setSelectedMethod('');
      } else {
        setError(data.message || 'Add money request failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Money</h1>
            <p className="text-gray-600">Add balance to your account using multiple payment methods</p>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Holder:</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{user?.accountNumber}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Processing: {method.processingTime}</span>
                          <span>Fee: {method.fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Add *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="10"
                      max="10000"
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Min: $10, Max: $10,000 per transaction</p>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Amounts
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 500, 1000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method-specific fields */}
                {selectedMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Bank Transfer Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Chase Bank"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Account number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number *</label>
                      <input
                        type="text"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="9-digit routing number"
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'mobile_banking' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Mobile Banking Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Provider *</label>
                      <select
                        name="mobileProvider"
                        value={formData.mobileProvider}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select Provider</option>
                        {mobileProviders.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.icon} {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="01XXXXXXXXX"
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'card_payment' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Card Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Name on card"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                        <input
                          type="password"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'online_banking' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Online Banking</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Bank *</label>
                      <select
                        name="onlineBankProvider"
                        value={formData.onlineBankProvider}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select Bank</option>
                        {onlineBankProviders.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        You will be redirected to your bank's secure login page to complete the transaction.
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength="100"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Monthly savings, Emergency fund"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedMethod}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Add Money to Account'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security & Privacy</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All transactions are encrypted and processed securely</li>
                  <li>• We never store your complete card or banking information</li>
                  <li>• Processing times vary by payment method</li>
                  <li>• You will receive email confirmation for all transactions</li>
                  <li>• Contact support if you have any issues with your transaction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;