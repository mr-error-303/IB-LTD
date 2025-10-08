import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Wifi, Phone, Tv, Car, Home, CreditCard, Calendar, Clock, Receipt, Search, Filter, CheckCircle, AlertTriangle, Loader2, Bell, Star, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';

interface BillCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  providers: string[];
  color: string;
}

interface SavedBiller {
  id: string;
  category: string;
  provider: string;
  accountNumber: string;
  nickname: string;
  lastAmount: number;
  dueDate?: string;
  autoPayEnabled: boolean;
}

interface BillPayment {
  id: string;
  category: string;
  provider: string;
  accountNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference: string;
  dueDate?: string;
}

interface BillDetails {
  accountNumber: string;
  customerName: string;
  billAmount: number;
  dueDate: string;
  billDate: string;
  units?: string;
  previousReading?: string;
  currentReading?: string;
  lateFee?: number;
}

const BillPayment: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(selectedCurrency.code);
  const [activeTab, setActiveTab] = useState<'pay' | 'saved' | 'history' | 'autopay'>('pay');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [savedBillers, setSavedBillers] = useState<SavedBiller[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [saveAsBiller, setSaveAsBiller] = useState<boolean>(false);
  const [billerNickname, setBillerNickname] = useState<string>('');
  const [enableAutoPay, setEnableAutoPay] = useState<boolean>(false);

  const billCategories: BillCategory[] = [
    {
      id: 'electricity',
      name: 'Electricity Bill',
      icon: <Zap className="w-6 h-6" />,
      description: 'Power utility bills',
      providers: [
        'DESCO - Dhaka Electric Supply Company',
        'DPDC - Dhaka Power Distribution Company',
        'BPDB - Bangladesh Power Development Board',
        'WZPDCL - West Zone Power Distribution Company',
        'NESCO - Northern Electricity Supply Company'
      ],
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'gas',
      name: 'Gas Bill',
      icon: <Home className="w-6 h-6" />,
      description: 'Natural gas bills',
      providers: [
        'Titas Gas Transmission & Distribution Company',
        'Jalalabad Gas Transmission & Distribution System',
        'Bakhrabad Gas Distribution Company',
        'Karnaphuli Gas Distribution Company',
        'Paschimanchal Gas Company Limited'
      ],
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'water',
      name: 'Water Bill',
      icon: <Home className="w-6 h-6" />,
      description: 'Municipal water bills',
      providers: [
        'WASA Dhaka - Water Supply & Sewerage Authority',
        'CWASA - Chittagong Water Supply & Sewerage Authority',
        'KWASA - Khulna Water Supply & Sewerage Authority',
        'SWASA - Sylhet Water Supply & Sewerage Authority',
        'RWASA - Rajshahi Water Supply & Sewerage Authority'
      ],
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'internet',
      name: 'Internet Bill',
      icon: <Wifi className="w-6 h-6" />,
      description: 'Internet service providers',
      providers: [
        'Grameenphone Internet',
        'Robi Internet Services',
        'Banglalink Internet',
        'Teletalk Internet',
        'Link3 Technologies Limited',
        'BTCL - Bangladesh Telecommunications Company',
        'Carnival Internet & Online Limited'
      ],
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'tv',
      name: 'TV Subscription',
      icon: <Tv className="w-6 h-6" />,
      description: 'Television service providers',
      providers: [
        'Dish TV Bangladesh',
        'Akash DTH - Digital Satellite TV',
        'Cable TV Services',
        'Toffee - Live TV & Movies',
        'Bioscope - Streaming Service',
        'Chorki - OTT Platform'
      ],
      color: 'from-red-600 to-pink-600'
    }
  ];

  useEffect(() => {
    // Load saved billers and payment history
    const mockSavedBillers: SavedBiller[] = [
      {
        id: '1',
        category: 'electricity',
        provider: 'BSES Delhi',
        accountNumber: '1234567890',
        nickname: 'Home Electricity',
        lastAmount: 2500,
        dueDate: '2024-02-15',
        autoPayEnabled: true
      },
      {
        id: '2',
        category: 'mobile',
        provider: 'Airtel',
        accountNumber: '9876543210',
        nickname: 'My Mobile',
        lastAmount: 599,
        autoPayEnabled: false
      }
    ];

    const mockPaymentHistory: BillPayment[] = [
      {
        id: '1',
        category: 'electricity',
        provider: 'BSES Delhi',
        accountNumber: '1234567890',
        amount: 2500,
        status: 'completed',
        date: '2024-01-15',
        reference: 'BP123456789',
        dueDate: '2024-01-20'
      },
      {
        id: '2',
        category: 'mobile',
        provider: 'Airtel',
        accountNumber: '9876543210',
        amount: 599,
        status: 'completed',
        date: '2024-01-14',
        reference: 'BP987654321'
      }
    ];

    setSavedBillers(mockSavedBillers);
    setPaymentHistory(mockPaymentHistory);
  }, []);

  const fetchBillDetails = async () => {
    if (!selectedCategory || !selectedProvider || !accountNumber) {
      setErrors({ fetch: 'Please select category, provider and enter account number' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call to fetch bill details
    setTimeout(() => {
      const mockBillDetails: BillDetails = {
        accountNumber: accountNumber,
        customerName: 'John Doe',
        billAmount: selectedCategory === 'electricity' ? 2750 : selectedCategory === 'mobile' ? 699 : 1200,
        dueDate: '2024-02-20',
        billDate: '2024-01-20',
        units: selectedCategory === 'electricity' ? '450 kWh' : undefined,
        previousReading: selectedCategory === 'electricity' ? '12450' : undefined,
        currentReading: selectedCategory === 'electricity' ? '12900' : undefined,
        lateFee: Math.random() > 0.7 ? 50 : 0
      };

      setBillDetails(mockBillDetails);
      setAmount(mockBillDetails.billAmount.toString());
      setIsLoading(false);
    }, 2000);
  };

  const validatePayment = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedCategory) {
      newErrors.category = 'Please select a bill category';
    }
    
    if (!selectedProvider) {
      newErrors.provider = 'Please select a service provider';
    }
    
    if (!accountNumber) {
      newErrors.accountNumber = 'Please enter account number';
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (saveAsBiller && !billerNickname.trim()) {
      newErrors.nickname = 'Please enter a nickname for saved biller';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayBill = () => {
    if (validatePayment()) {
      setShowConfirmation(true);
    }
  };

  const confirmPayment = async () => {
    setIsLoading(true);
    setShowConfirmation(false);
    
    // Simulate payment API call
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      setPaymentResult(success ? 'success' : 'error');
      setIsLoading(false);
      
      if (success) {
        // Add to payment history
        const newPayment: BillPayment = {
          id: Date.now().toString(),
          category: selectedCategory,
          provider: selectedProvider,
          accountNumber: accountNumber,
          amount: parseFloat(amount),
          status: 'completed',
          date: new Date().toISOString().split('T')[0],
          reference: `BP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          dueDate: billDetails?.dueDate
        };
        setPaymentHistory(prev => [newPayment, ...prev]);
        
        // Save biller if requested
        if (saveAsBiller) {
          const newBiller: SavedBiller = {
            id: Date.now().toString(),
            category: selectedCategory,
            provider: selectedProvider,
            accountNumber: accountNumber,
            nickname: billerNickname,
            lastAmount: parseFloat(amount),
            autoPayEnabled: enableAutoPay
          };
          setSavedBillers(prev => [newBiller, ...prev]);
        }
        
        // Reset form
        setSelectedCategory('');
        setSelectedProvider('');
        setAccountNumber('');
        setAmount('');
        setBillDetails(null);
        setSaveAsBiller(false);
        setBillerNickname('');
        setEnableAutoPay(false);
      }
    }, 3000);
  };

  const payFromSavedBiller = (biller: SavedBiller) => {
    setSelectedCategory(biller.category);
    setSelectedProvider(biller.provider);
    setAccountNumber(biller.accountNumber);
    setAmount(biller.lastAmount.toString());
    setActiveTab('pay');
  };

  const deleteSavedBiller = (billerId: string) => {
    setSavedBillers(prev => prev.filter(b => b.id !== billerId));
  };

  const toggleAutoPay = (billerId: string) => {
    setSavedBillers(prev => prev.map(b => 
      b.id === billerId ? { ...b, autoPayEnabled: !b.autoPayEnabled } : b
    ));
  };

  const filteredHistory = paymentHistory.filter(payment => {
    const matchesSearch = payment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.accountNumber.includes(searchTerm);
    const matchesFilter = filterCategory === 'all' || payment.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {paymentResult ? 'Processing Payment' : billDetails ? 'Processing Payment' : 'Fetching Bill Details'}
          </h2>
          <p className="text-gray-300">Please wait...</p>
        </div>
      </div>
    );
  }

  if (paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          {paymentResult === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-300 mb-4">Your bill payment has been processed</p>
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-300 mb-2">Reference Number:</p>
                <p className="text-xl font-bold text-blue-400">{paymentHistory[0]?.reference}</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-gray-300 mb-6">Please try again or contact support</p>
            </>
          )}
          <button
            onClick={() => setPaymentResult(null)}
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
          <h1 className="text-2xl font-bold">Bill Payment</h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pay')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pay'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Pay Bills
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Saved Billers
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('autopay')}
            className={`px-6 py-3 rounded-r-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'autopay'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Auto Pay
          </button>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Category:</span>
                  <span>{billCategories.find(c => c.id === selectedCategory)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Provider:</span>
                  <span>{selectedProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Account:</span>
                  <span>{accountNumber}</span>
                </div>
                {billDetails && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Customer:</span>
                      <span>{billDetails.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Due Date:</span>
                      <span>{billDetails.dueDate}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">Amount:</span>
                  <span>{currencySymbol}{parseFloat(amount).toLocaleString()}</span>
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
                  onClick={confirmPayment}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="space-y-6">
            {/* Bill Categories */}
            {!selectedCategory && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Select Bill Category</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {billCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="p-4 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-200 border-2 border-transparent hover:border-blue-500"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} mb-3`}>
                          {category.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Selection & Bill Details */}
            {selectedCategory && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Bill Details</h2>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedProvider('');
                        setAccountNumber('');
                        setBillDetails(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Change Category
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Provider</label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full py-3 px-4 bg-slate-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#ffffff'
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Select Provider</option>
                        {billCategories.find(c => c.id === selectedCategory)?.providers.map(provider => (
                          <option key={provider} value={provider} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>{provider}</option>
                        ))}
                      </select>
                      {errors.provider && (
                        <p className="text-red-400 text-sm mt-1">{errors.provider}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account/consumer number"
                        className="w-full py-3 px-4 bg-slate-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#ffffff'
                        }}
                      />
                      {errors.accountNumber && (
                        <p className="text-red-400 text-sm mt-1">{errors.accountNumber}</p>
                      )}
                    </div>

                    {!billDetails && (
                      <button
                        onClick={fetchBillDetails}
                        disabled={!selectedProvider || !accountNumber}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Fetch Bill Details
                      </button>
                    )}

                    {errors.fetch && (
                      <p className="text-red-400 text-sm">{errors.fetch}</p>
                    )}
                  </div>
                </div>

                {/* Bill Information */}
                {billDetails && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Bill Information</h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Customer Name:</span>
                        <span>{billDetails.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Account Number:</span>
                        <span>{billDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Bill Date:</span>
                        <span>{billDetails.billDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Due Date:</span>
                        <span className={new Date(billDetails.dueDate) < new Date() ? 'text-red-400' : 'text-green-400'}>
                          {billDetails.dueDate}
                        </span>
                      </div>
                      {billDetails.units && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Units Consumed:</span>
                          <span>{billDetails.units}</span>
                        </div>
                      )}
                      {billDetails.lateFee && billDetails.lateFee > 0 && (
                        <div className="flex justify-between text-red-400">
                          <span>Late Fee:</span>
                          <span>{currencySymbol}{billDetails.lateFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-600 pt-3">
                        <span>Total Amount:</span>
                        <span className="text-blue-400">{currencySymbol}{billDetails.billAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Amount</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full py-3 px-4 bg-slate-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          style={{
                            backgroundColor: '#1e293b',
                            color: '#ffffff'
                          }}
                        />
                        {errors.amount && (
                          <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="saveAsBiller"
                            checked={saveAsBiller}
                            onChange={(e) => setSaveAsBiller(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="saveAsBiller" className="text-sm">Save as biller for future payments</label>
                        </div>

                        {saveAsBiller && (
                          <>
                            <input
                              type="text"
                              value={billerNickname}
                              onChange={(e) => setBillerNickname(e.target.value)}
                              placeholder="Enter nickname for this biller"
                              className="w-full py-2 px-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                              style={{
                                backgroundColor: '#1e293b',
                                color: '#ffffff'
                              }}
                            />
                            {errors.nickname && (
                              <p className="text-red-400 text-sm">{errors.nickname}</p>
                            )}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="enableAutoPay"
                                checked={enableAutoPay}
                                onChange={(e) => setEnableAutoPay(e.target.checked)}
                                className="mr-2"
                              />
                              <label htmlFor="enableAutoPay" className="text-sm">Enable auto-pay for this biller</label>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handlePayBill}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay {currencySymbol}{amount ? parseFloat(amount).toLocaleString() : '0'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Saved Billers</h2>
              <button
                onClick={() => setActiveTab('pay')}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Biller
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBillers.map((biller) => (
                <div key={biller.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{biller.nickname}</h3>
                      <p className="text-sm text-gray-400">{biller.provider}</p>
                      <p className="text-sm text-gray-500">{biller.accountNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAutoPay(biller.id)}
                        className={`p-1 rounded ${biller.autoPayEnabled ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSavedBiller(biller.id)}
                        className="p-1 rounded text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Last Payment:</p>
                    <p className="font-semibold">{currencySymbol}{biller.lastAmount.toLocaleString()}</p>
                    {biller.dueDate && (
                      <p className="text-sm text-yellow-400">Due: {biller.dueDate}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => payFromSavedBiller(biller)}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Pay Now
                    </button>
                    <button className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="py-2 px-3 bg-slate-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#ffffff'
                  }}
                >
                  <option value="all" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>All Categories</option>
                  {billCategories.map(category => (
                    <option key={category.id} value={category.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{payment.provider}</h3>
                      <p className="text-sm text-gray-400">{billCategories.find(c => c.id === payment.category)?.name}</p>
                      <p className="text-sm text-gray-500">Account: {payment.accountNumber}</p>
                      <p className="text-sm text-gray-500">Date: {payment.date}</p>
                      <p className="text-sm text-gray-500">Ref: {payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{currencySymbol}{payment.amount.toLocaleString()}</p>
                      <div className={`flex items-center text-sm ${
                        payment.status === 'completed' ? 'text-green-400' :
                        payment.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                      <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center">
                        <Receipt className="w-3 h-3 mr-1" />
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'autopay' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Auto Pay Settings</h2>
            
            <div className="space-y-4">
              {savedBillers.filter(b => b.autoPayEnabled).map((biller) => (
                <div key={biller.id} className="p-4 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{biller.nickname}</h3>
                      <p className="text-sm text-gray-400">{biller.provider}</p>
                      <p className="text-sm text-green-400">Auto-pay enabled</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{currencySymbol}{biller.lastAmount.toLocaleString()}</p>
                      <button
                        onClick={() => toggleAutoPay(biller.id)}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {savedBillers.filter(b => b.autoPayEnabled).length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Auto-Pay Setup</h3>
                  <p className="text-gray-400 mb-6">Enable auto-pay for your saved billers to never miss a payment</p>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Manage Billers
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPayment;




