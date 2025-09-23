import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Beneficiaries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    bank: '',
    routingNumber: '',
    nickname: '',
    category: 'family',
    transferType: 'bank',
    mobileNumber: '',
    walletProvider: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Friends', icon: '👥' },
    { value: 'merchants', label: 'Merchants', icon: '🏪' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'others', label: 'Others', icon: '📝' }
  ];

  const transferTypes = [
    { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
    { value: 'mobile_wallet', label: 'Mobile Wallet', icon: '📱' }
  ];

  const bangladeshiBanks = [
    'Islami Bank Bangladesh Limited',
    'Dutch-Bangla Bank Limited',
    'BRAC Bank Limited',
    'Eastern Bank Limited',
    'City Bank Limited',
    'Prime Bank Limited',
    'Southeast Bank Limited',
    'Mutual Trust Bank Limited',
    'Standard Chartered Bank',
    'HSBC Bangladesh',
    'Mercantile Bank Limited',
    'National Bank Limited',
    'United Commercial Bank Limited',
    'AB Bank Limited',
    'Bank Asia Limited',
    'Dhaka Bank Limited',
    'Jamuna Bank Limited',
    'One Bank Limited',
    'Pubali Bank Limited',
    'Trust Bank Limited'
  ];

  const walletProviders = [
    'bKash',
    'Nagad',
    'Rocket',
    'Upay',
    'SureCash',
    'MyCash'
  ];

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/beneficiaries');
      if (response.data.success) {
        setBeneficiaries(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setError('Failed to fetch beneficiaries');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Beneficiary name is required');
      return false;
    }
    if (!formData.nickname.trim()) {
      setError('Nickname is required');
      return false;
    }

    if (formData.transferType === 'bank') {
      if (!formData.accountNumber.trim()) {
        setError('Account number is required');
        return false;
      }
      if (formData.accountNumber.length < 10) {
        setError('Account number must be at least 10 digits');
        return false;
      }
      if (!formData.bank) {
        setError('Bank selection is required');
        return false;
      }
    } else if (formData.transferType === 'mobile_wallet') {
      if (!formData.mobileNumber.trim()) {
        setError('Mobile number is required');
        return false;
      }
      if (!/^(\+88)?01[3-9]\d{8}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid Bangladeshi mobile number');
        return false;
      }
      if (!formData.walletProvider) {
        setError('Wallet provider selection is required');
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      accountNumber: '',
      bank: '',
      routingNumber: '',
      nickname: '',
      category: 'family',
      transferType: 'bank',
      mobileNumber: '',
      walletProvider: ''
    });
    setError('');
    setMessage('');
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/beneficiaries', formData);
      
      if (response.data.success) {
        setBeneficiaries(prev => [...prev, response.data.data]);
        setMessage('Beneficiary added successfully!');
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBeneficiary = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.put(`/api/beneficiaries/${selectedBeneficiary._id}`, formData);
      
      if (response.data.success) {
        setBeneficiaries(prev => 
          prev.map(b => b._id === selectedBeneficiary._id ? response.data.data : b)
        );
        setMessage('Beneficiary updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedBeneficiary(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBeneficiary = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/beneficiaries/${selectedBeneficiary._id}`);
      
      if (response.data.success) {
        setBeneficiaries(prev => prev.filter(b => b._id !== selectedBeneficiary._id));
        setMessage('Beneficiary deleted successfully!');
        setShowDeleteModal(false);
        setSelectedBeneficiary(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setFormData({
      name: beneficiary.name,
      accountNumber: beneficiary.accountNumber || '',
      bank: beneficiary.bank || '',
      routingNumber: beneficiary.routingNumber || '',
      nickname: beneficiary.nickname,
      category: beneficiary.category,
      transferType: beneficiary.transferType,
      mobileNumber: beneficiary.mobileNumber || '',
      walletProvider: beneficiary.walletProvider || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDeleteModal(true);
  };

  const filteredBeneficiaries = Array.isArray(beneficiaries) ? beneficiaries.filter(beneficiary => {
    const matchesSearch = beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficiary.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (beneficiary.accountNumber && beneficiary.accountNumber.includes(searchTerm)) ||
                         (beneficiary.mobileNumber && beneficiary.mobileNumber.includes(searchTerm));
    
    const matchesCategory = selectedCategory === 'all' || beneficiary.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  const getBeneficiaryIcon = (transferType) => {
    return transferType === 'mobile_wallet' ? '📱' : '🏦';
  };

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Beneficiary Management</h1>
                <p className="text-gray-600 mt-2">Manage your saved beneficiaries for quick transfers</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Beneficiary
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search beneficiaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Beneficiaries List */}
          <div className="bg-white rounded-lg shadow-md">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading beneficiaries...</p>
              </div>
            ) : filteredBeneficiaries.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No beneficiaries found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Add your first beneficiary to get started'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Beneficiary
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBeneficiaries.map((beneficiary) => (
                  <div key={beneficiary._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">{getBeneficiaryIcon(beneficiary.transferType)}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{beneficiary.name}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {categories.find(c => c.value === beneficiary.category)?.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Nickname:</strong> {beneficiary.nickname}
                          </p>
                          {beneficiary.transferType === 'bank' ? (
                            <div className="text-sm text-gray-600 mt-1">
                              <p><strong>Account:</strong> {formatAccountNumber(beneficiary.accountNumber)}</p>
                              <p><strong>Bank:</strong> {beneficiary.bank}</p>
                              {beneficiary.routingNumber && (
                                <p><strong>Routing:</strong> {beneficiary.routingNumber}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 mt-1">
                              <p><strong>Mobile:</strong> {beneficiary.mobileNumber}</p>
                              <p><strong>Wallet:</strong> {beneficiary.walletProvider}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(beneficiary)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit beneficiary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(beneficiary)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete beneficiary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Beneficiary</h3>
            
            <form onSubmit={handleAddBeneficiary} className="space-y-4">
              {/* Transfer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {transferTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, transferType: type.value }))}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        formData.transferType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname *
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="e.g., Mom, John, Grocery Store"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bank Transfer Fields */}
              {formData.transferType === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank *
                    </label>
                    <select
                      name="bank"
                      value={formData.bank}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Bank</option>
                      {bangladeshiBanks.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Mobile Wallet Fields */}
              {formData.transferType === 'mobile_wallet' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Provider *
                    </label>
                    <select
                      name="walletProvider"
                      value={formData.walletProvider}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Wallet Provider</option>
                      {walletProviders.map((provider) => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Beneficiary Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Beneficiary</h3>
            
            <form onSubmit={handleEditBeneficiary} className="space-y-4">
              {/* Transfer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {transferTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, transferType: type.value }))}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        formData.transferType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname *
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="e.g., Mom, John, Grocery Store"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bank Transfer Fields */}
              {formData.transferType === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank *
                    </label>
                    <select
                      name="bank"
                      value={formData.bank}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Bank</option>
                      {bangladeshiBanks.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Mobile Wallet Fields */}
              {formData.transferType === 'mobile_wallet' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Provider *
                    </label>
                    <select
                      name="walletProvider"
                      value={formData.walletProvider}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Wallet Provider</option>
                      {walletProviders.map((provider) => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedBeneficiary(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBeneficiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Beneficiary</h3>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedBeneficiary.name}</strong> ({selectedBeneficiary.nickname})? 
              This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBeneficiary(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBeneficiary}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;