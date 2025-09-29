import React, { useState, useEffect } from 'react';
import { 
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  StarIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface MobileWallet {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isFavorite: boolean;
  lastUsed?: Date;
  isActive: boolean;
}

interface SavedContact {
  id: string;
  name: string;
  phoneNumber: string;
  walletType: string;
  lastUsed: Date;
}

const MobileWalletsTransfer = () => {
  const [selectedWallet, setSelectedWallet] = useState<MobileWallet | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountInfo, setAccountInfo] = useState<{ name: string; valid: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSavedContacts, setShowSavedContacts] = useState(false);

  // Mobile wallets data
  const [wallets, setWallets] = useState<MobileWallet[]>([
    {
      id: '1',
      name: 'bKash',
      shortName: 'bKash',
      logo: '💳',
      color: 'bg-pink-500',
      fee: 18.5,
      minAmount: 10,
      maxAmount: 25000,
      processingTime: 'Instant',
      isFavorite: true,
      lastUsed: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: '2',
      name: 'Nagad',
      shortName: 'Nagad',
      logo: '📱',
      color: 'bg-orange-500',
      fee: 14.9,
      minAmount: 10,
      maxAmount: 20000,
      processingTime: 'Instant',
      isFavorite: true,
      lastUsed: new Date('2024-01-12'),
      isActive: true
    },
    {
      id: '3',
      name: 'Rocket',
      shortName: 'Rocket',
      logo: '🚀',
      color: 'bg-purple-500',
      fee: 16.0,
      minAmount: 10,
      maxAmount: 15000,
      processingTime: 'Instant',
      isFavorite: false,
      lastUsed: new Date('2024-01-10'),
      isActive: true
    },
    {
      id: '4',
      name: 'Upay',
      shortName: 'Upay',
      logo: '💰',
      color: 'bg-blue-500',
      fee: 15.0,
      minAmount: 10,
      maxAmount: 10000,
      processingTime: 'Instant',
      isFavorite: false,
      isActive: true
    },
    {
      id: '5',
      name: 'SureCash',
      shortName: 'SureCash',
      logo: '💵',
      color: 'bg-green-500',
      fee: 12.0,
      minAmount: 10,
      maxAmount: 8000,
      processingTime: 'Instant',
      isFavorite: false,
      isActive: true
    },
    {
      id: '6',
      name: 'TeleCash',
      shortName: 'TeleCash',
      logo: '📞',
      color: 'bg-indigo-500',
      fee: 13.5,
      minAmount: 10,
      maxAmount: 12000,
      processingTime: 'Instant',
      isFavorite: false,
      isActive: true
    },
    {
      id: '7',
      name: 'MyCash',
      shortName: 'MyCash',
      logo: '💎',
      color: 'bg-teal-500',
      fee: 11.0,
      minAmount: 10,
      maxAmount: 7000,
      processingTime: 'Instant',
      isFavorite: false,
      isActive: true
    },
    {
      id: '8',
      name: 'OK Wallet',
      shortName: 'OK Wallet',
      logo: '✅',
      color: 'bg-cyan-500',
      fee: 10.5,
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instant',
      isFavorite: false,
      isActive: true
    }
  ]);

  // Mock saved contacts
  const [savedContacts] = useState<SavedContact[]>([
    {
      id: '1',
      name: 'John Doe',
      phoneNumber: '01712345678',
      walletType: 'bKash',
      lastUsed: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Jane Smith',
      phoneNumber: '01812345679',
      walletType: 'Nagad',
      lastUsed: new Date('2024-01-12')
    },
    {
      id: '3',
      name: 'Ahmed Rahman',
      phoneNumber: '01912345680',
      walletType: 'Rocket',
      lastUsed: new Date('2024-01-10')
    }
  ]);

  // Phone number validation effect
  useEffect(() => {
    const validatePhoneNumber = async () => {
      if (phoneNumber && phoneNumber.length >= 11 && selectedWallet) {
        setIsValidating(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation - Bangladeshi phone number format
          const phoneRegex = /^01[3-9]\d{8}$/;
          const isValid = phoneRegex.test(phoneNumber);
          
          if (isValid) {
            // Mock account names
            const mockNames = ['John Doe', 'Jane Smith', 'Ahmed Rahman', 'Sarah Wilson', 'Mike Johnson'];
            const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
            setAccountInfo({ name: randomName, valid: true });
          } else {
            setAccountInfo({ name: '', valid: false });
          }
        } catch (err) {
          setAccountInfo({ name: '', valid: false });
        } finally {
          setIsValidating(false);
        }
      } else {
        setAccountInfo(null);
      }
    };

    const timeoutId = setTimeout(validatePhoneNumber, 500);
    return () => clearTimeout(timeoutId);
  }, [phoneNumber, selectedWallet]);

  const toggleFavorite = (walletId: string) => {
    setWallets(prev =>
      prev.map(wallet => wallet.id === walletId ? { ...wallet, isFavorite: !wallet.isFavorite } : wallet)
    );
  };

  const selectContact = (contact: SavedContact) => {
    setPhoneNumber(contact.phoneNumber);
    const wallet = wallets.find(w => w.shortName === contact.walletType);
    if (wallet) {
      setSelectedWallet(wallet);
    }
    setShowSavedContacts(false);
  };

  const filteredContacts = savedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber.includes(searchTerm)
  );

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedWallet || !phoneNumber || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (!accountInfo?.valid) {
      setError('Please enter a valid phone number');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount < selectedWallet.minAmount) {
      setError(`Minimum transfer amount is ৳${selectedWallet.minAmount}`);
      return;
    }

    if (transferAmount > selectedWallet.maxAmount) {
      setError(`Maximum transfer amount is ৳${selectedWallet.maxAmount.toLocaleString()}`);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const totalAmount = transferAmount + selectedWallet.fee;
      setSuccess(`Successfully sent ৳${transferAmount.toLocaleString()} to ${phoneNumber} via ${selectedWallet.name}. Total charged: ৳${totalAmount.toLocaleString()}`);
      
      // Reset form
      setSelectedWallet(null);
      setPhoneNumber('');
      setAmount('');
      setDescription('');
      setAccountInfo(null);
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mobile Wallets</h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Wallet Selection */}
      {!selectedWallet ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Mobile Wallet</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.filter(wallet => wallet.isActive).map((wallet) => (
              <div
                key={wallet.id}
                className="relative p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group"
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${wallet.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {wallet.logo}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(wallet.id);
                      }}
                      className="text-white/40 hover:text-yellow-400 transition-colors"
                    >
                      {wallet.isFavorite ? (
                        <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-4 h-4" />
                      )}
                    </button>
                    {wallet.lastUsed && (
                      <ClockIcon className="w-3 h-3 text-blue-400" />
                    )}
                  </div>
                </div>
                
                <h4 className="font-semibold text-white mb-1">{wallet.name}</h4>
                <p className="text-sm text-white/60 mb-2">{wallet.processingTime}</p>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-white/50">
                    <span>Fee:</span>
                    <span className="text-orange-400">৳{wallet.fee}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Limit:</span>
                    <span>৳{wallet.minAmount} - ৳{wallet.maxAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-primary-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <div className="space-y-6">
          {/* Selected Wallet */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${selectedWallet.color} rounded-lg flex items-center justify-center text-2xl`}>
                {selectedWallet.logo}
              </div>
              <div>
                <p className="font-medium text-white">{selectedWallet.name}</p>
                <p className="text-sm text-white/60">
                  Fee: ৳{selectedWallet.fee} | Limit: ৳{selectedWallet.minAmount} - ৳{selectedWallet.maxAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedWallet(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/90 font-medium">Phone Number</label>
                <button
                  type="button"
                  onClick={() => setShowSavedContacts(!showSavedContacts)}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  {showSavedContacts ? 'Hide' : 'Show'} Saved Contacts
                </button>
              </div>
              
              {/* Saved Contacts */}
              {showSavedContacts && (
                <div className="mb-4 bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 text-sm"
                      placeholder="Search contacts..."
                    />
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => selectContact(contact)}
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{contact.name}</p>
                          <p className="text-white/60 text-xs">{contact.phoneNumber} • {contact.walletType}</p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-white/40" />
                      </div>
                    ))}
                    {filteredContacts.length === 0 && (
                      <p className="text-white/50 text-sm text-center py-2">No contacts found</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </div>
              
              {/* Phone validation feedback */}
              {accountInfo && (
                <div className={`mt-2 p-3 rounded-lg flex items-center space-x-2 ${
                  accountInfo.valid 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {accountInfo.valid ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${
                    accountInfo.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {accountInfo.valid 
                      ? `Valid Account: ${accountInfo.name}`
                      : 'Invalid phone number format'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Transfer Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Enter amount"
                  min={selectedWallet.minAmount}
                  max={selectedWallet.maxAmount}
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/50">
                  Min: ৳{selectedWallet.minAmount} | Max: ৳{selectedWallet.maxAmount.toLocaleString()}
                </span>
                <span className="text-orange-400">
                  Fee: ৳{selectedWallet.fee}
                </span>
              </div>
              {amount && (
                <p className="text-white/70 text-sm mt-1">
                  Total to be charged: ৳{(parseFloat(amount) + selectedWallet.fee).toLocaleString()}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                placeholder="Add a note for this transfer"
                rows={3}
                maxLength={100}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!phoneNumber || !amount || !accountInfo?.valid || isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-white/50 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>Send Money</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MobileWalletsTransfer;