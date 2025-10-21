import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TransactionConfirmation from '../components/TransactionConfirmation';

const Transfer = () => {
  const { user } = useAuth();
  const [transferType, setTransferType] = useState('internal'); // internal, npsb, beftn, mobile_wallet, qr_payment
  const [formData, setFormData] = useState({
    recipientAccount: '',
    amount: '',
    description: '',
    // NPSB/BEFTN specific fields
    recipientBank: '',
    routingNumber: '',
    recipientName: '',
    recipientAddress: '',
    purpose: '',
    // Mobile Wallet specific fields
    walletProvider: '',
    mobileNumber: '',
    // QR Payment specific fields
    qrData: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  // Bank and wallet provider data
  const bangladeshiBanks = [
    { name: 'Sonali Bank Limited', routing: '010' },
    { name: 'Janata Bank Limited', routing: '020' },
    { name: 'Agrani Bank Limited', routing: '030' },
    { name: 'Rupali Bank Limited', routing: '040' },
    { name: 'BASIC Bank Limited', routing: '050' },
    { name: 'AB Bank Limited', routing: '060' },
    { name: 'City Bank Limited', routing: '070' },
    { name: 'Eastern Bank Limited', routing: '080' },
    { name: 'IFIC Bank Limited', routing: '090' },
    { name: 'Mercantile Bank Limited', routing: '100' },
    { name: 'National Bank Limited', routing: '110' },
    { name: 'Prime Bank Limited', routing: '120' },
    { name: 'Southeast Bank Limited', routing: '130' },
    { name: 'United Commercial Bank Limited', routing: '140' },
    { name: 'Dutch-Bangla Bank Limited', routing: '150' },
    { name: 'BRAC Bank Limited', routing: '160' },
    { name: 'Standard Chartered Bank', routing: '170' },
    { name: 'HSBC Bangladesh', routing: '180' }
  ];

  const walletProviders = [
    { 
      name: 'bKash', 
      logo: '💳', 
      fee: { min: 5, rate: 0.015, max: 25 },
      minAmount: 10,
      maxAmount: 25000
    },
    { 
      name: 'Nagad', 
      logo: '📱', 
      fee: { min: 5, rate: 0.012, max: 20 },
      minAmount: 10,
      maxAmount: 25000
    },
    { 
      name: 'Rocket', 
      logo: '🚀', 
      fee: { min: 5, rate: 0.018, max: 30 },
      minAmount: 10,
      maxAmount: 20000
    },
    { 
      name: 'Upay', 
      logo: '💰', 
      fee: { min: 3, rate: 0.01, max: 15 },
      minAmount: 10,
      maxAmount: 15000
    },
    { 
      name: 'SureCash', 
      logo: '💵', 
      fee: { min: 5, rate: 0.015, max: 25 },
      minAmount: 10,
      maxAmount: 25000
    }
  ];

  const transferTypes = [
    { value: 'internal', label: 'Internal Transfer', icon: '🏦', description: 'Transfer within our bank' },
    { value: 'npsb', label: 'NPSB Transfer', icon: '🏛️', description: 'Real-time interbank transfer' },
    { value: 'beftn', label: 'BEFTN Transfer', icon: '📋', description: 'Batch electronic fund transfer' },
    { value: 'mobile_wallet', label: 'Mobile Wallet', icon: '📱', description: 'Send to mobile wallets' },
    { value: 'qr_payment', label: 'QR Payment', icon: '📷', description: 'Scan QR code to pay' }
  ];

  // Fetch current balance
  const fetchBalance = async () => {
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
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);

  // Fetch current balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/accounts/balance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentBalance(data.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  // Verify recipient account when account number changes
  useEffect(() => {
    const verifyRecipient = async () => {
      if (formData.recipientAccountNumber && formData.recipientAccountNumber.length >= 10) {
        setVerifyingRecipient(true);
        try {
          const response = await fetch(`/api/accounts/verify/${formData.recipientAccountNumber}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setRecipientInfo(data);
            setError('');
          } else {
            setRecipientInfo(null);
            if (response.status === 404) {
              setError('Account number not found');
            }
          }
        } catch (error) {
          setRecipientInfo(null);
          setError('Error verifying account');
        } finally {
          setVerifyingRecipient(false);
        }
      } else {
        setRecipientInfo(null);
      }
    };

    const timeoutId = setTimeout(verifyRecipient, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.recipientAccountNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle bank selection for BEFTN (auto-populate routing number)
    if (name === 'recipientBank' && transferType === 'beftn') {
      const selectedBank = bangladeshiBanks.find(bank => bank.name === value);
      setFormData({
        ...formData,
        [name]: value,
        routingNumber: selectedBank ? selectedBank.routing : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (error && e.target.name !== 'recipientAccountNumber') setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations for all transfer types
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    } else if (parseFloat(formData.amount) > 25000) {
      newErrors.amount = 'Maximum transfer limit is $25,000';
    }

    // Transfer type specific validations
    if (transferType === 'internal') {
      if (!formData.recipientAccount) {
        newErrors.recipientAccount = 'Recipient account number is required';
      } else if (formData.recipientAccount === user.accountNumber) {
        newErrors.recipientAccount = 'Cannot transfer to your own account';
      }
      // Description is optional for internal transfers
    } else if (transferType === 'npsb') {
      if (!formData.recipientAccount) {
        newErrors.recipientAccount = 'Recipient account number is required';
      }
      if (!formData.recipientBank) {
        newErrors.recipientBank = 'Please select recipient bank';
      }
      if (!formData.purpose) {
        newErrors.purpose = 'Purpose of transfer is required';
      }
      if (!formData.description) {
        newErrors.description = 'Description is required for NPSB transfers';
      }
    } else if (transferType === 'beftn') {
      if (!formData.recipientAccount) {
        newErrors.recipientAccount = 'Recipient account number is required';
      }
      if (!formData.recipientBank) {
        newErrors.recipientBank = 'Please select recipient bank';
      }
      if (!formData.recipientName) {
        newErrors.recipientName = 'Recipient name is required';
      }
      if (!formData.recipientAddress) {
        newErrors.recipientAddress = 'Recipient address is required';
      }
      if (!formData.purpose) {
        newErrors.purpose = 'Purpose of transfer is required';
      }
      if (!formData.description) {
        newErrors.description = 'Description is required for BEFTN transfers';
      }
    } else if (transferType === 'mobile_wallet') {
      if (!formData.walletProvider) {
        newErrors.walletProvider = 'Please select wallet provider';
      }
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^01[3-9][0-9]{8}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid Bangladeshi mobile number';
      }
      if (!formData.description) {
        newErrors.description = 'Description is required for mobile wallet transfers';
      }
    } else if (transferType === 'qr_payment') {
      // QR payments will have amount and description from scanned QR code
      if (!formData.description) {
        newErrors.description = 'Please scan a valid QR code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare transaction data for confirmation
    const transaction = {
      type: 'transfer',
      amount: parseFloat(formData.amount),
      recipientAccount: formData.recipientAccount,
      description: formData.description || 'Money transfer',
      fromAccount: user.accountNumber,
      fromBalance: currentBalance
    };
    
    setTransactionData(transaction);
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async (confirmationCode) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          confirmationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Transfer completed successfully!');
        setFormData({ recipientAccount: '', amount: '', description: '' });
        setErrors({});
        setShowConfirmation(false);
        // Refresh balance
        fetchBalance();
      } else {
        throw new Error(data.message || 'Transfer failed');
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Money</h1>
            <p className="text-gray-600">Send money to another account</p>
          </div>

          {/* Account Info & Balance */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Holder:</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{user?.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Available Balance:</span>
                {loadingBalance ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                ) : (
                  <span className="font-bold text-lg text-green-600">
                    ${currentBalance.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Transfer Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transferTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTransferType(type.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    transferType === type.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <h3 className="font-medium">{type.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Conditional Fields Based on Transfer Type */}
              
              {/* Internal Transfer Fields */}
              {transferType === 'internal' && (
                <>
                  {/* Recipient Account Number */}
                  <div>
                    <label htmlFor="recipientAccount" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Account Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="recipientAccount"
                        name="recipientAccount"
                        value={formData.recipientAccount}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                          errors.recipientAccount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter recipient's account number"
                        required
                      />
                      {errors.recipientAccount && (
                        <p className="mt-1 text-sm text-red-600">{errors.recipientAccount}</p>
                      )}
                      {verifyingRecipient && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Recipient Info */}
                    {recipientInfo && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {recipientInfo.firstName} {recipientInfo.lastName}
                            </p>
                            <p className="text-xs text-green-600">Account verified</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* NPSB Transfer Fields */}
              {transferType === 'npsb' && (
                <>
                  <div>
                    <label htmlFor="recipientAccount" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Account Number *
                    </label>
                    <input
                      type="text"
                      id="recipientAccount"
                      name="recipientAccount"
                      value={formData.recipientAccount}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter recipient's account number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="recipientBank" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Bank *
                    </label>
                    <select
                      id="recipientBank"
                      name="recipientBank"
                      value={formData.recipientBank}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select Bank</option>
                      {bangladeshiBanks.map((bank) => (
                        <option key={bank.name} value={bank.name}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose of Transfer *
                    </label>
                    <input
                      type="text"
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Personal transfer, Business payment"
                      required
                    />
                  </div>
                </>
              )}

              {/* BEFTN Transfer Fields */}
              {transferType === 'beftn' && (
                <>
                  <div>
                    <label htmlFor="recipientAccount" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Account Number *
                    </label>
                    <input
                      type="text"
                      id="recipientAccount"
                      name="recipientAccount"
                      value={formData.recipientAccount}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter recipient's account number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="recipientBank" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Bank *
                    </label>
                    <select
                      id="recipientBank"
                      name="recipientBank"
                      value={formData.recipientBank}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select Bank</option>
                      {bangladeshiBanks.map((bank) => (
                        <option key={bank.name} value={bank.name}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      id="routingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                      placeholder="Auto-filled when bank is selected"
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter recipient's full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address *
                    </label>
                    <textarea
                      id="recipientAddress"
                      name="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter recipient's address"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose of Transfer *
                    </label>
                    <input
                      type="text"
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Personal transfer, Business payment"
                      required
                    />
                  </div>
                </>
              )}

              {/* Mobile Wallet Transfer Fields */}
              {transferType === 'mobile_wallet' && (
                <>
                  <div>
                    <label htmlFor="walletProvider" className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Provider *
                    </label>
                    <select
                      id="walletProvider"
                      name="walletProvider"
                      value={formData.walletProvider}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select Wallet Provider</option>
                      {walletProviders.map((provider) => (
                        <option key={provider.name} value={provider.name}>
                          {provider.logo} {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="01XXXXXXXXX"
                      pattern="01[3-9][0-9]{8}"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter recipient's name (optional)"
                    />
                  </div>

                  {/* Fee Information */}
                  {formData.walletProvider && formData.amount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Transaction Fee Information</h4>
                      {(() => {
                        const provider = walletProviders.find(p => p.name === formData.walletProvider);
                        const amount = parseFloat(formData.amount) || 0;
                        const feeAmount = Math.min(Math.max(amount * provider.fee.rate, provider.fee.min), provider.fee.max);
                        const total = amount + feeAmount;
                        
                        return (
                          <div className="text-sm text-blue-800">
                            <p>Transfer Amount: ${amount.toFixed(2)}</p>
                            <p>Transaction Fee: ${feeAmount.toFixed(2)}</p>
                            <p className="font-medium">Total Debit: ${total.toFixed(2)}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}

              {/* QR Payment Fields */}
              {transferType === 'qr_payment' && (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-32 h-32 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📷</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Scanner</h3>
                  <p className="text-gray-600 mb-4">Click the button below to scan a QR code for payment</p>
                  <button
                    type="button"
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Open QR Scanner
                  </button>
                </div>
              )}

              {/* Amount Input - Common for all transfer types except QR (which gets amount from QR) */}
              {transferType !== 'qr_payment' && (
                <>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Amount *
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
                        min="0.01"
                        max={Math.min(currentBalance, 25000)}
                        className={`block w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        required
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Maximum: $25,000 per transaction</span>
                      <span>Available: ${currentBalance.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Amounts
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 2500].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                          disabled={amount > currentBalance}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Description Input - Common for all transfer types */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description {transferType === 'internal' ? '(Optional)' : ''}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={transferType === 'internal' ? 'Optional description' : 'Enter description'}
                  rows="3"
                  required={transferType !== 'internal'}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Error Messages */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.submit}</p>
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

              {/* Transaction Confirmation Modal */}
              {showConfirmation && transactionData && (
                <TransactionConfirmation
                  isOpen={showConfirmation}
                  onClose={() => setShowConfirmation(false)}
                  onConfirm={handleConfirmTransaction}
                  transactionData={transactionData}
                  loading={loading}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !recipientInfo || currentBalance === 0}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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
                  'Transfer Money'
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Transfers are processed immediately and cannot be reversed. Please verify recipient details before confirming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;