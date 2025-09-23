import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MobileRecharge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    operator: '',
    phoneNumber: '',
    amount: '',
    connectionType: 'prepaid'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const operators = [
    { 
      id: 'grameenphone', 
      name: 'Grameenphone', 
      logo: '🟢',
      prefixes: ['017', '013', '019', '014'],
      quickAmounts: [20, 50, 100, 200, 500, 1000]
    },
    { 
      id: 'robi', 
      name: 'Robi', 
      logo: '🔴',
      prefixes: ['018', '019'],
      quickAmounts: [19, 49, 99, 199, 499, 999]
    },
    { 
      id: 'banglalink', 
      name: 'Banglalink', 
      logo: '🟡',
      prefixes: ['019', '014'],
      quickAmounts: [20, 50, 100, 200, 500, 1000]
    },
    { 
      id: 'teletalk', 
      name: 'Teletalk', 
      logo: '🔵',
      prefixes: ['015'],
      quickAmounts: [20, 50, 100, 200, 500, 1000]
    },
    { 
      id: 'airtel', 
      name: 'Airtel', 
      logo: '🔴',
      prefixes: ['016'],
      quickAmounts: [20, 50, 100, 200, 500, 1000]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Remove any non-digit characters
      const cleanValue = value.replace(/\D/g, '');
      
      // Auto-detect operator based on prefix
      if (cleanValue.length >= 3) {
        const prefix = cleanValue.substring(0, 3);
        const detectedOperator = operators.find(op => 
          op.prefixes.includes(prefix)
        );
        
        if (detectedOperator && !formData.operator) {
          setFormData(prev => ({
            ...prev,
            operator: detectedOperator.id,
            [name]: cleanValue
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: cleanValue
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: cleanValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.operator) {
      setError('Please select a mobile operator');
      return false;
    }
    
    if (!formData.phoneNumber) {
      setError('Please enter a phone number');
      return false;
    }
    
    if (formData.phoneNumber.length !== 11) {
      setError('Phone number must be 11 digits');
      return false;
    }
    
    const selectedOperator = operators.find(op => op.id === formData.operator);
    const prefix = formData.phoneNumber.substring(0, 3);
    
    if (!selectedOperator.prefixes.includes(prefix)) {
      setError(`This number doesn't match ${selectedOperator.name} prefix`);
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid recharge amount');
      return false;
    }
    
    if (parseFloat(formData.amount) < 10) {
      setError('Minimum recharge amount is BDT 10');
      return false;
    }
    
    if (parseFloat(formData.amount) > 5000) {
      setError('Maximum recharge amount is BDT 5,000');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmRecharge = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/recharge/mobile', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      if (response.data.success) {
        navigate('/dashboard', { 
          state: { 
            message: `Mobile recharge successful! BDT ${formData.amount} recharged to ${formData.phoneNumber}. Transaction ID: ${response.data.data.transactionId}` 
          }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Recharge failed. Please try again.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const formatPhoneNumber = (number) => {
    if (number.length === 11) {
      return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return number;
  };

  const selectedOperator = operators.find(op => op.id === formData.operator);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Mobile Recharge</h1>
            <p className="text-gray-600 mt-2">Recharge your mobile phone instantly</p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Operator Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Mobile Operator *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {operators.map((operator) => (
                    <button
                      key={operator.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, operator: operator.id }))}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.operator === operator.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{operator.logo}</div>
                      <div className="font-medium text-sm">{operator.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {operator.prefixes.join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Connection Type *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="connectionType"
                      value="prepaid"
                      checked={formData.connectionType === 'prepaid'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Prepaid</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="connectionType"
                      value="postpaid"
                      checked={formData.connectionType === 'postpaid'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Postpaid</span>
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    +880
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="17XXXXXXXX"
                    maxLength="11"
                    className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {formData.phoneNumber && (
                  <p className="text-sm text-gray-500 mt-1">
                    Formatted: +880 {formatPhoneNumber(formData.phoneNumber)}
                  </p>
                )}
              </div>

              {/* Quick Amount Selection */}
              {selectedOperator && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Amount Selection
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {selectedOperator.quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleQuickAmount(amount)}
                        className={`py-2 px-3 text-sm border rounded-md transition-colors ${
                          formData.amount === amount.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        ৳{amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recharge Amount (BDT) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="10"
                  max="5000"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: BDT 10 | Maximum: BDT 5,000
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Recharge Now'}
              </button>
            </form>
          </div>

          {/* Information Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Recharge Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Processing time: Instant</li>
              <li>• Minimum amount: BDT 10</li>
              <li>• Maximum amount: BDT 5,000 per transaction</li>
              <li>• Available 24/7</li>
              <li>• No additional charges</li>
              <li>• Balance will be added immediately after successful payment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Mobile Recharge</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Operator:</span>
                <span className="font-medium flex items-center">
                  {selectedOperator?.logo} {selectedOperator?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number:</span>
                <span className="font-medium">+880 {formatPhoneNumber(formData.phoneNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{formData.connectionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-lg">{formatCurrency(parseFloat(formData.amount))}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>✓ Instant Recharge:</strong> Balance will be added immediately after payment.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRecharge}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Recharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileRecharge;