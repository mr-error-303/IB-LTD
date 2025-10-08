import React, { useState } from 'react';
import { ArrowLeft, Zap, User, Clock, Search, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  lastUsed: string;
  avatar?: string;
}

const QuickPay: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock saved beneficiaries data
  const savedBeneficiaries: Beneficiary[] = [
    {
      id: '1',
      name: 'John Smith',
      accountNumber: '1234567890',
      bankName: 'IB LTD',
      lastUsed: '2024-01-15',
      avatar: 'JS'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      accountNumber: '9876543210',
      bankName: 'Standard Bank',
      lastUsed: '2024-01-14',
      avatar: 'SJ'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      accountNumber: '5555666677',
      bankName: 'City Bank',
      lastUsed: '2024-01-12',
      avatar: 'MW'
    },
    {
      id: '4',
      name: 'Emily Davis',
      accountNumber: '1111222233',
      bankName: 'IB LTD',
      lastUsed: '2024-01-10',
      avatar: 'ED'
    },
    {
      id: '5',
      name: 'Robert Brown',
      accountNumber: '7777888899',
      bankName: 'Metro Bank',
      lastUsed: '2024-01-08',
      avatar: 'RB'
    }
  ];

  const filteredBeneficiaries = savedBeneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber.includes(searchTerm)
  );

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
  };

  const handleQuickAmountSelect = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handlePayment = async () => {
    if (!selectedBeneficiary || !amount) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedBeneficiary(null);
        setAmount('');
        setNote('');
      }, 3000);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              {formatCurrency(parseFloat(amount))} sent to {selectedBeneficiary?.name}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-mono text-lg text-gray-900">TXN{Date.now()}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-white">Quick Pay</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {!selectedBeneficiary ? (
          // Beneficiary Selection
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Select Beneficiary</h2>
              <p className="text-white/70">Choose from your saved beneficiaries for quick payment</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search beneficiaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Recently Used */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recently Used
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBeneficiaries.slice(0, 3).map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    onClick={() => handleBeneficiarySelect(beneficiary)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {beneficiary.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                          {beneficiary.name}
                        </h4>
                        <p className="text-sm text-white/70">{beneficiary.bankName}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/50 font-mono">
                      ****{beneficiary.accountNumber.slice(-4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Beneficiaries */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                All Beneficiaries
              </h3>
              <div className="space-y-3">
                {filteredBeneficiaries.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    onClick={() => handleBeneficiarySelect(beneficiary)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {beneficiary.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                        {beneficiary.name}
                      </h4>
                      <p className="text-sm text-white/70">{beneficiary.bankName}</p>
                      <p className="text-xs text-white/50 font-mono">
                        ****{beneficiary.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50">Last used</p>
                      <p className="text-sm text-white/70">{beneficiary.lastUsed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Payment Form
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Quick Payment</h2>
              <p className="text-white/70">Send money to {selectedBeneficiary.name}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              {/* Selected Beneficiary */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedBeneficiary.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{selectedBeneficiary.name}</h3>
                  <p className="text-white/70">{selectedBeneficiary.bankName}</p>
                  <p className="text-sm text-white/50 font-mono">
                    Account: ****{selectedBeneficiary.accountNumber.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBeneficiary(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Quick Amounts</label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => handleQuickAmountSelect(quickAmount)}
                      className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                    >
                      ${quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedBeneficiary(null)}
                  className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send {amount ? formatCurrency(parseFloat(amount)) : 'Payment'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPay;