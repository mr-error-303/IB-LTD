import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BillPayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [formData, setFormData] = useState({
    accountNumber: '',
    customerName: '',
    billAmount: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [error, setError] = useState('');
  const [billInfo, setBillInfo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const billerCategories = {
    electricity: {
      name: 'Electricity',
      icon: '⚡',
      billers: [
        { id: 'desco', name: 'DESCO', code: 'DESCO' },
        { id: 'dpdc', name: 'DPDC', code: 'DPDC' },
        { id: 'bpdb', name: 'BPDB', code: 'BPDB' },
        { id: 'wzpdcl', name: 'WZPDCL', code: 'WZPDCL' },
        { id: 'nesco', name: 'NESCO', code: 'NESCO' }
      ]
    },
    gas: {
      name: 'Gas',
      icon: '🔥',
      billers: [
        { id: 'jgtdsl', name: 'Jalalabad Gas (JGTDSL)', code: 'JGTDSL' },
        { id: 'bgdcl', name: 'Bakhrabad Gas (BGDCL)', code: 'BGDCL' },
        { id: 'kgdcl', name: 'Karnaphuli Gas (KGDCL)', code: 'KGDCL' },
        { id: 'pgcb', name: 'Petrobangla (PGCB)', code: 'PGCB' }
      ]
    },
    water: {
      name: 'Water',
      icon: '💧',
      billers: [
        { id: 'dwasa', name: 'DWASA', code: 'DWASA' },
        { id: 'cwasa', name: 'CWASA', code: 'CWASA' },
        { id: 'kwasa', name: 'KWASA', code: 'KWASA' }
      ]
    },
    internet: {
      name: 'Internet & Cable',
      icon: '🌐',
      billers: [
        { id: 'btcl', name: 'BTCL Broadband', code: 'BTCL' },
        { id: 'link3', name: 'Link3 Technologies', code: 'LINK3' },
        { id: 'carnival', name: 'Carnival Internet', code: 'CARNIVAL' },
        { id: 'amber_it', name: 'Amber IT', code: 'AMBER' },
        { id: 'akash_dt', name: 'Akash DTH', code: 'AKASH' }
      ]
    },
    insurance: {
      name: 'Insurance',
      icon: '🛡️',
      billers: [
        { id: 'sadharan_bima', name: 'Sadharan Bima Corporation', code: 'SBC' },
        { id: 'jiban_bima', name: 'Jiban Bima Corporation', code: 'JBC' },
        { id: 'pragati_life', name: 'Pragati Life Insurance', code: 'PRAGATI' },
        { id: 'delta_life', name: 'Delta Life Insurance', code: 'DELTA' }
      ]
    },
    education: {
      name: 'Education',
      icon: '🎓',
      billers: [
        { id: 'du', name: 'University of Dhaka', code: 'DU' },
        { id: 'buet', name: 'BUET', code: 'BUET' },
        { id: 'nsu', name: 'North South University', code: 'NSU' },
        { id: 'brac_u', name: 'BRAC University', code: 'BRACU' }
      ]
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBiller('');
    setBillInfo(null);
    setFormData({
      accountNumber: '',
      customerName: '',
      billAmount: '',
      dueDate: ''
    });
    setError('');
  };

  const handleBillerSelect = (billerId) => {
    setSelectedBiller(billerId);
    setBillInfo(null);
    setFormData({
      accountNumber: '',
      customerName: '',
      billAmount: '',
      dueDate: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const fetchBillInfo = async () => {
    if (!formData.accountNumber || !selectedBiller) return;

    try {
      setBillLoading(true);
      setError('');
      
      const response = await axios.post('/api/bills/info', {
        biller: selectedBiller,
        accountNumber: formData.accountNumber
      });

      if (response.data.success) {
        setBillInfo(response.data.data);
        setFormData(prev => ({
          ...prev,
          customerName: response.data.data.customerName || '',
          billAmount: response.data.data.billAmount?.toString() || '',
          dueDate: response.data.data.dueDate || ''
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Bill not found. Please check your account number.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch bill information.');
      }
    } finally {
      setBillLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedCategory) {
      setError('Please select a bill category');
      return false;
    }
    if (!selectedBiller) {
      setError('Please select a biller');
      return false;
    }
    if (!formData.accountNumber) {
      setError('Please enter your account number');
      return false;
    }
    if (!formData.billAmount || parseFloat(formData.billAmount) <= 0) {
      setError('Please enter a valid bill amount');
      return false;
    }
    if (parseFloat(formData.billAmount) > 100000) {
      setError('Bill payment limit is BDT 100,000 per transaction');
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

  const confirmPayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/bills/pay', {
        category: selectedCategory,
        biller: selectedBiller,
        ...formData,
        billAmount: parseFloat(formData.billAmount)
      });
      
      if (response.data.success) {
        navigate('/dashboard', { 
          state: { 
            message: `Bill payment successful! BDT ${formData.billAmount} paid to ${billerCategories[selectedCategory].billers.find(b => b.id === selectedBiller)?.name}. Transaction ID: ${response.data.data.transactionId}` 
          }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-BD');
  };

  const selectedBillerInfo = selectedCategory && selectedBiller 
    ? billerCategories[selectedCategory].billers.find(b => b.id === selectedBiller)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Bill Payment</h1>
            <p className="text-gray-600 mt-2">Pay your utility bills and other services</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Category</h2>
                <div className="space-y-2">
                  {Object.entries(billerCategories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleCategorySelect(key)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedCategory === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Biller Selection and Form */}
            <div className="lg:col-span-2">
              {selectedCategory && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Select {billerCategories[selectedCategory].name} Provider
                  </h2>
                  
                  {/* Biller Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {billerCategories[selectedCategory].billers.map((biller) => (
                      <button
                        key={biller.id}
                        onClick={() => handleBillerSelect(biller.id)}
                        className={`p-3 text-left rounded-lg border transition-colors ${
                          selectedBiller === biller.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{biller.name}</div>
                        <div className="text-sm text-gray-500">{biller.code}</div>
                      </button>
                    ))}
                  </div>

                  {/* Bill Payment Form */}
                  {selectedBiller && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-4">
                        Pay {selectedBillerInfo?.name} Bill
                      </h3>

                      {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                          <p className="text-red-600">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account/Customer Number *
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                              placeholder="Enter your account number"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={fetchBillInfo}
                              disabled={!formData.accountNumber || billLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {billLoading ? 'Checking...' : 'Check Bill'}
                            </button>
                          </div>
                        </div>

                        {/* Bill Information Display */}
                        {billInfo && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <h4 className="font-medium text-green-900 mb-2">Bill Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-green-800">Customer Name:</span>
                                <span className="font-medium">{billInfo.customerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-800">Bill Amount:</span>
                                <span className="font-medium">{formatCurrency(billInfo.billAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-800">Due Date:</span>
                                <span className="font-medium">{formatDate(billInfo.dueDate)}</span>
                              </div>
                              {billInfo.status && (
                                <div className="flex justify-between">
                                  <span className="text-green-800">Status:</span>
                                  <span className={`font-medium ${
                                    billInfo.status === 'overdue' ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {billInfo.status.charAt(0).toUpperCase() + billInfo.status.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Customer Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            placeholder="Customer name (auto-filled after bill check)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={!!billInfo}
                          />
                        </div>

                        {/* Bill Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bill Amount (BDT) *
                          </label>
                          <input
                            type="number"
                            name="billAmount"
                            value={formData.billAmount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="1"
                            max="100000"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            readOnly={!!billInfo}
                          />
                          <p className="text-sm text-gray-500 mt-1">Maximum limit: BDT 100,000 per transaction</p>
                        </div>

                        {/* Due Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={!!billInfo}
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Pay Bill'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Information Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Bill Payment Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Processing time: Instant for most billers</li>
              <li>• Maximum amount: BDT 100,000 per transaction</li>
              <li>• Available 24/7</li>
              <li>• No additional charges for bill payments</li>
              <li>• Payment confirmation will be sent via SMS and email</li>
              <li>• Keep transaction ID for future reference</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Bill Payment</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{billerCategories[selectedCategory]?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biller:</span>
                <span className="font-medium">{selectedBillerInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium">{formData.accountNumber}</span>
              </div>
              {formData.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{formData.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-lg">{formatCurrency(parseFloat(formData.billAmount))}</span>
              </div>
              {formData.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{formatDate(formData.dueDate)}</span>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>✓ Instant Payment:</strong> Your bill will be paid immediately after confirmation.
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
                onClick={confirmPayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPayment;