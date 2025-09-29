import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  PlusIcon, 
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  isFavorite: boolean;
  lastUsed: Date;
}

const SameBankTransfer = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountInfo, setAccountInfo] = useState<{ name: string; valid: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  // Mock beneficiaries data
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'John Doe',
      accountNumber: '1234567890',
      isFavorite: true,
      lastUsed: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Jane Smith',
      accountNumber: '0987654321',
      isFavorite: false,
      lastUsed: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Ahmed Rahman',
      accountNumber: '1122334455',
      isFavorite: true,
      lastUsed: new Date('2024-01-12')
    }
  ]);

  // Account validation effect
  useEffect(() => {
    const validateAccount = async () => {
      if (accountNumber && accountNumber.length >= 10) {
        setIsValidating(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          const mockAccounts: { [key: string]: { name: string; valid: boolean } } = {
            '1234567890': { name: 'John Doe', valid: true },
            '0987654321': { name: 'Jane Smith', valid: true },
            '1122334455': { name: 'Ahmed Rahman', valid: true },
            '5566778899': { name: 'Sarah Wilson', valid: true }
          };
          
          const account = mockAccounts[accountNumber];
          setAccountInfo(account || { name: '', valid: false });
        } catch (err) {
          setAccountInfo({ name: '', valid: false });
        } finally {
          setIsValidating(false);
        }
      } else {
        setAccountInfo(null);
      }
    };

    const timeoutId = setTimeout(validateAccount, 500);
    return () => clearTimeout(timeoutId);
  }, [accountNumber]);

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber.includes(searchTerm)
  );

  const favoriteBeneficiaries = filteredBeneficiaries.filter(b => b.isFavorite);
  const recentBeneficiaries = filteredBeneficiaries
    .filter(b => !b.isFavorite)
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());

  const toggleFavorite = (id: string) => {
    setBeneficiaries(prev =>
      prev.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b)
    );
  };

  const selectBeneficiary = (beneficiary: Beneficiary) => {
    setAccountNumber(beneficiary.accountNumber);
    setAccountInfo({ name: beneficiary.name, valid: true });
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!accountNumber || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (!accountInfo?.valid) {
      setError('Please enter a valid account number');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Successfully transferred ৳${transferAmount.toLocaleString()} to ${accountInfo.name}`);
      
      // Reset form
      setAccountNumber('');
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
        <h2 className="text-2xl font-bold text-white mb-4">Same Bank Transfer</h2>
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

      {/* Beneficiaries Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Quick Select</h3>
          <button
            onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">Add New</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            placeholder="Search beneficiaries..."
          />
        </div>

        {/* Favorites */}
        {favoriteBeneficiaries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <HeartSolidIcon className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-white/90">Favorites</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoriteBeneficiaries.map((beneficiary) => (
                <div
                  key={beneficiary.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => selectBeneficiary(beneficiary)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{beneficiary.name}</p>
                      <p className="text-sm text-white/60">{beneficiary.accountNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(beneficiary.id);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <HeartSolidIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recentBeneficiaries.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ClockIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white/90">Recent</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentBeneficiaries.slice(0, 4).map((beneficiary) => (
                <div
                  key={beneficiary.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => selectBeneficiary(beneficiary)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{beneficiary.name}</p>
                      <p className="text-sm text-white/60">{beneficiary.accountNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(beneficiary.id);
                    }}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="space-y-6">
        {/* Account Number */}
        <div>
          <label className="block text-white/90 font-medium mb-2">Recipient Account Number</label>
          <div className="relative">
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Enter account number"
              maxLength={20}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
          
          {/* Account validation feedback */}
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
                  : 'Invalid account number'
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
              min="1"
              step="0.01"
            />
          </div>
          <p className="text-white/50 text-sm mt-1">
            Daily limit: ৳1,00,000 | Instant transfer
          </p>
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
          disabled={!accountNumber || !amount || !accountInfo?.valid || isLoading}
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
              <span>Transfer Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SameBankTransfer;