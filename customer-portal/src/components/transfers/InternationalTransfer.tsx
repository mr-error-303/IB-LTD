import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  flag: string;
  exchangeRate: number;
  transferMethods: ('SWIFT' | 'Wire')[];
  processingTime: {
    SWIFT: string;
    Wire: string;
  };
  fees: {
    SWIFT: number;
    Wire: number;
  };
}

interface TransferMethod {
  type: 'SWIFT' | 'Wire';
  name: string;
  description: string;
  icon: string;
}

const InternationalTransfer = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'SWIFT' | 'Wire' | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Countries data
  const countries: Country[] = [
    {
      id: '1',
      name: 'United States',
      code: 'US',
      currency: 'USD',
      flag: '🇺🇸',
      exchangeRate: 110.50,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '1-3 business days', Wire: '1-2 business days' },
      fees: { SWIFT: 2500, Wire: 3000 }
    },
    {
      id: '2',
      name: 'United Kingdom',
      code: 'GB',
      currency: 'GBP',
      flag: '🇬🇧',
      exchangeRate: 140.25,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '1-2 business days', Wire: '1 business day' },
      fees: { SWIFT: 2200, Wire: 2800 }
    },
    {
      id: '3',
      name: 'Canada',
      code: 'CA',
      currency: 'CAD',
      flag: '🇨🇦',
      exchangeRate: 82.75,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '1-3 business days', Wire: '1-2 business days' },
      fees: { SWIFT: 2300, Wire: 2900 }
    },
    {
      id: '4',
      name: 'Australia',
      code: 'AU',
      currency: 'AUD',
      flag: '🇦🇺',
      exchangeRate: 73.20,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '2-4 business days', Wire: '1-3 business days' },
      fees: { SWIFT: 2400, Wire: 3100 }
    },
    {
      id: '5',
      name: 'Germany',
      code: 'DE',
      currency: 'EUR',
      flag: '🇩🇪',
      exchangeRate: 118.90,
      transferMethods: ['SWIFT'],
      processingTime: { SWIFT: '1-2 business days', Wire: 'N/A' },
      fees: { SWIFT: 2100, Wire: 0 }
    },
    {
      id: '6',
      name: 'Singapore',
      code: 'SG',
      currency: 'SGD',
      flag: '🇸🇬',
      exchangeRate: 81.45,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '1-2 business days', Wire: '1 business day' },
      fees: { SWIFT: 2000, Wire: 2600 }
    },
    {
      id: '7',
      name: 'India',
      code: 'IN',
      currency: 'INR',
      flag: '🇮🇳',
      exchangeRate: 1.32,
      transferMethods: ['SWIFT'],
      processingTime: { SWIFT: '2-3 business days', Wire: 'N/A' },
      fees: { SWIFT: 1800, Wire: 0 }
    },
    {
      id: '8',
      name: 'Malaysia',
      code: 'MY',
      currency: 'MYR',
      flag: '🇲🇾',
      exchangeRate: 24.80,
      transferMethods: ['SWIFT', 'Wire'],
      processingTime: { SWIFT: '1-2 business days', Wire: '1 business day' },
      fees: { SWIFT: 1900, Wire: 2400 }
    }
  ];

  const transferMethods: TransferMethod[] = [
    {
      type: 'SWIFT',
      name: 'SWIFT Transfer',
      description: 'Secure international wire transfer through SWIFT network',
      icon: '🌐'
    },
    {
      type: 'Wire',
      name: 'Wire Transfer',
      description: 'Direct bank-to-bank electronic transfer',
      icon: '⚡'
    }
  ];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    if (!amount || !selectedCountry || !selectedMethod) return { foreign: 0, fee: 0, total: 0 };
    
    const amountNum = parseFloat(amount);
    const foreignAmount = amountNum / selectedCountry.exchangeRate;
    const fee = selectedCountry.fees[selectedMethod];
    const total = amountNum + fee;
    
    return { foreign: foreignAmount, fee, total };
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedCountry || !selectedMethod || !recipientName || !bankName || !accountNumber || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedMethod === 'SWIFT' && !swiftCode) {
      setError('SWIFT code is required for SWIFT transfers');
      return;
    }

    if (selectedMethod === 'Wire' && selectedCountry.code === 'US' && !routingNumber) {
      setError('Routing number is required for US wire transfers');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount < 1000) {
      setError('Minimum international transfer amount is ৳1,000');
      return;
    }

    if (transferAmount > 500000) {
      setError('Maximum international transfer amount is ৳500,000');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { foreign, fee, total } = calculateTotal();
      setSuccess(
        `International transfer initiated successfully! ` +
        `Sending ${foreign.toFixed(2)} ${selectedCountry.currency} to ${recipientName}. ` +
        `Total charged: ৳${total.toLocaleString()}. ` +
        `Processing time: ${selectedCountry.processingTime[selectedMethod]}`
      );
      
      // Reset form
      setSelectedCountry(null);
      setSelectedMethod(null);
      setRecipientName('');
      setRecipientAddress('');
      setBankName('');
      setBankAddress('');
      setSwiftCode('');
      setAccountNumber('');
      setRoutingNumber('');
      setAmount('');
      setPurpose('');
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">International Transfers</h2>
        <p className="text-white/70">Send money worldwide through SWIFT and Wire transfers</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Country Selection */}
      {!selectedCountry ? (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Select Destination Country</h3>
          
          {/* Search */}
          <div className="relative mb-6">
            <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Search countries..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCountries.map((country) => (
              <div
                key={country.id}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                onClick={() => setSelectedCountry(country)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <h4 className="font-semibold text-white">{country.name}</h4>
                    <p className="text-sm text-white/60">{country.currency}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/50">
                    <span>Exchange Rate:</span>
                    <span className="text-green-400">1 {country.currency} = ৳{country.exchangeRate}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Methods:</span>
                    <span>{country.transferMethods.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>From:</span>
                    <span className="text-orange-400">৳{Math.min(...Object.values(country.fees)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCountries.length === 0 && (
            <div className="text-center py-8">
              <GlobeAltIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No countries found matching your search</p>
            </div>
          )}
        </div>
      ) : !selectedMethod ? (
        /* Transfer Method Selection */
        <div className="space-y-6">
          {/* Selected Country */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <div>
                <p className="font-medium text-white">{selectedCountry.name}</p>
                <p className="text-sm text-white/60">1 {selectedCountry.currency} = ৳{selectedCountry.exchangeRate}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          {/* Transfer Methods */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Select Transfer Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {transferMethods
                .filter(method => selectedCountry.transferMethods.includes(method.type))
                .map((method) => (
                <div
                  key={method.type}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => setSelectedMethod(method.type)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{method.name}</h4>
                      <p className="text-sm text-white/60">{method.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-white/50">
                      <span>Processing Time:</span>
                      <span className="text-blue-400">{selectedCountry.processingTime[method.type]}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Transfer Fee:</span>
                      <span className="text-orange-400">৳{selectedCountry.fees[method.type].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <div className="space-y-6">
          {/* Selected Country and Method */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div>
                  <p className="font-medium text-white">{selectedCountry.name} • {selectedMethod}</p>
                  <p className="text-sm text-white/60">
                    Fee: ৳{selectedCountry.fees[selectedMethod].toLocaleString()} | 
                    Time: {selectedCountry.processingTime[selectedMethod]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                Change
              </button>
            </div>
            
            {/* Exchange Rate Info */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 flex items-center space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-blue-400 text-sm">
                Current exchange rate: 1 {selectedCountry.currency} = ৳{selectedCountry.exchangeRate}
              </span>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Recipient Information */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Recipient Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Enter recipient's full name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Enter recipient's address"
                  />
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Bank Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 font-medium mb-2">Bank Address</label>
                  <input
                    type="text"
                    value={bankAddress}
                    onChange={(e) => setBankAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Enter bank address"
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 font-medium mb-2">Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Enter account number"
                  />
                </div>
                
                {selectedMethod === 'SWIFT' && (
                  <div>
                    <label className="block text-white/90 font-medium mb-2">SWIFT Code *</label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Enter SWIFT/BIC code"
                      maxLength={11}
                    />
                  </div>
                )}
                
                {selectedMethod === 'Wire' && selectedCountry.code === 'US' && (
                  <div>
                    <label className="block text-white/90 font-medium mb-2">Routing Number *</label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Enter routing number"
                      maxLength={9}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Details */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Transfer Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Amount (BDT) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">৳</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Enter amount"
                      min="1000"
                      max="500000"
                      step="0.01"
                    />
                  </div>
                  <p className="text-white/50 text-sm mt-1">Min: ৳1,000 | Max: ৳500,000</p>
                </div>
                
                <div>
                  <label className="block text-white/90 font-medium mb-2">Purpose of Transfer *</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select purpose</option>
                    <option value="family_support">Family Support</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical Treatment</option>
                    <option value="business">Business</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Transfer Summary */}
              {amount && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-2">Transfer Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Amount to send:</span>
                      <span>৳{parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Transfer fee:</span>
                      <span>৳{selectedCountry.fees[selectedMethod].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Recipient will receive:</span>
                      <span className="text-green-400">
                        {calculateTotal().foreign.toFixed(2)} {selectedCountry.currency}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-medium text-white">
                      <span>Total to be charged:</span>
                      <span>৳{calculateTotal().total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!recipientName || !bankName || !accountNumber || !amount || !purpose || isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-white/50 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing International Transfer...</span>
                </>
              ) : (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>Send International Transfer</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InternationalTransfer;