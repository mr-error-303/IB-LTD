import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  BuildingLibraryIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Bank {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: 'BD' | 'INTL';
  transferTime: string;
  fee: number;
  isFavorite: boolean;
  lastUsed?: Date;
}

const LocalBanksTransfer = () => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountInfo, setAccountInfo] = useState<{ name: string; valid: boolean } | null>(null);

  // Mock banks data - Bangladeshi banks first
  const [banks, setBanks] = useState<Bank[]>([
    // Bangladeshi Banks
    {
      id: '1',
      name: 'Dutch-Bangla Bank Limited',
      shortName: 'DBBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 10,
      isFavorite: true,
      lastUsed: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Brac Bank Limited',
      shortName: 'BRAC',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 15,
      isFavorite: false,
      lastUsed: new Date('2024-01-12')
    },
    {
      id: '3',
      name: 'Eastern Bank Limited',
      shortName: 'EBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 12,
      isFavorite: true,
      lastUsed: new Date('2024-01-10')
    },
    {
      id: '4',
      name: 'City Bank Limited',
      shortName: 'CITY',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 20,
      isFavorite: false
    },
    {
      id: '5',
      name: 'Islami Bank Bangladesh Limited',
      shortName: 'IBBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 8,
      isFavorite: false
    },
    {
      id: '6',
      name: 'Prime Bank Limited',
      shortName: 'PBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 15,
      isFavorite: false
    },
    {
      id: '7',
      name: 'Standard Chartered Bank',
      shortName: 'SCB',
      logo: '🏦',
      country: 'BD',
      transferTime: '2-4 hours',
      fee: 25,
      isFavorite: false
    },
    {
      id: '8',
      name: 'HSBC Bangladesh',
      shortName: 'HSBC',
      logo: '🏦',
      country: 'BD',
      transferTime: '2-4 hours',
      fee: 30,
      isFavorite: false
    },
    {
      id: '9',
      name: 'Mutual Trust Bank Limited',
      shortName: 'MTB',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 18,
      isFavorite: false
    },
    {
      id: '10',
      name: 'Southeast Bank Limited',
      shortName: 'SEBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 16,
      isFavorite: false
    },
    {
      id: '11',
      name: 'United Commercial Bank Limited',
      shortName: 'UCBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 14,
      isFavorite: false
    },
    {
      id: '12',
      name: 'AB Bank Limited',
      shortName: 'AB',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 17,
      isFavorite: false
    },
    {
      id: '13',
      name: 'Bank Asia Limited',
      shortName: 'BANK ASIA',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 13,
      isFavorite: false
    },
    {
      id: '14',
      name: 'Mercantile Bank Limited',
      shortName: 'MBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 19,
      isFavorite: false
    },
    {
      id: '15',
      name: 'National Bank Limited',
      shortName: 'NBL',
      logo: '🏦',
      country: 'BD',
      transferTime: 'Instant',
      fee: 11,
      isFavorite: false
    },
    // International Banks
    {
      id: '16',
      name: 'State Bank of India',
      shortName: 'SBI',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 50,
      isFavorite: false
    },
    {
      id: '17',
      name: 'Citibank N.A.',
      shortName: 'CITI',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 75,
      isFavorite: false
    },
    {
      id: '18',
      name: 'JPMorgan Chase Bank',
      shortName: 'JPMC',
      logo: '🏦',
      country: 'INTL',
      transferTime: '2-3 days',
      fee: 85,
      isFavorite: false
    },
    {
      id: '19',
      name: 'Bank of America',
      shortName: 'BOA',
      logo: '🏦',
      country: 'INTL',
      transferTime: '2-3 days',
      fee: 80,
      isFavorite: false
    },
    {
      id: '20',
      name: 'Wells Fargo Bank',
      shortName: 'WF',
      logo: '🏦',
      country: 'INTL',
      transferTime: '2-3 days',
      fee: 78,
      isFavorite: false
    },
    {
      id: '21',
      name: 'Deutsche Bank AG',
      shortName: 'DB',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 90,
      isFavorite: false
    },
    {
      id: '22',
      name: 'Barclays Bank PLC',
      shortName: 'BARCLAYS',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 88,
      isFavorite: false
    },
    {
      id: '23',
      name: 'ICICI Bank Limited',
      shortName: 'ICICI',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 55,
      isFavorite: false
    },
    {
      id: '24',
      name: 'HDFC Bank Limited',
      shortName: 'HDFC',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 52,
      isFavorite: false
    },
    {
      id: '25',
      name: 'Axis Bank Limited',
      shortName: 'AXIS',
      logo: '🏦',
      country: 'INTL',
      transferTime: '1-2 days',
      fee: 58,
      isFavorite: false
    }
  ]);

  // Account validation effect
  useEffect(() => {
    const validateAccount = async () => {
      if (accountNumber && accountNumber.length >= 10 && selectedBank) {
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
  }, [accountNumber, selectedBank]);

  // Filter banks
  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'favorites') return matchesSearch && bank.isFavorite;
    if (filterType === 'recent') return matchesSearch && bank.lastUsed;
    return matchesSearch;
  });

  // Separate Bangladeshi and International banks
  const bangladeshiBanks = filteredBanks.filter(bank => bank.country === 'BD');
  const internationalBanks = filteredBanks.filter(bank => bank.country === 'INTL');

  const toggleFavorite = (bankId: string) => {
    setBanks(prev =>
      prev.map(bank => bank.id === bankId ? { ...bank, isFavorite: !bank.isFavorite } : bank)
    );
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedBank || !accountNumber || !amount) {
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
      setSuccess(`Successfully initiated transfer of ৳${transferAmount.toLocaleString()} to ${selectedBank.name}. Transfer time: ${selectedBank.transferTime}`);
      
      // Reset form
      setSelectedBank(null);
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
        <h2 className="text-2xl font-bold text-white mb-2">Other Local Banks</h2>
        <p className="text-white/70">Transfer to other banks in Bangladesh and internationally</p>
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

      {/* Bank Selection */}
      {!selectedBank ? (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Select Bank</h3>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Search banks..."
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'favorites' | 'recent')}
                className="bg-white/5 border border-white/20 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 appearance-none"
              >
                <option value="all">All Banks</option>
                <option value="favorites">Favorites</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>

          {/* Bangladeshi Banks */}
          {bangladeshiBanks.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-white/90 mb-3 flex items-center space-x-2">
                <span className="w-6 h-4 bg-green-500 rounded-sm flex items-center justify-center text-xs text-white font-bold">BD</span>
                <span>Bangladeshi Banks</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bangladeshiBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedBank(bank)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-2xl">
                        {bank.logo}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{bank.shortName}</p>
                        <p className="text-xs text-white/60">{bank.transferTime}</p>
                        <p className="text-xs text-green-600">Fee: ৳{bank.fee}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(bank.id);
                        }}
                        className="text-white/40 hover:text-yellow-400 transition-colors"
                      >
                        {bank.isFavorite ? (
                          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4" />
                        )}
                      </button>
                      {bank.lastUsed && (
                        <ClockIcon className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* International Banks */}
          {internationalBanks.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white/90 mb-3 flex items-center space-x-2">
                <span className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-xs text-white font-bold">INTL</span>
                <span>International Banks</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {internationalBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedBank(bank)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
                        {bank.logo}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{bank.shortName}</p>
                        <p className="text-xs text-white/60">{bank.transferTime}</p>
                        <p className="text-xs text-orange-400">Fee: ৳{bank.fee}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(bank.id);
                        }}
                        className="text-white/40 hover:text-yellow-400 transition-colors"
                      >
                        {bank.isFavorite ? (
                          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4" />
                        )}
                      </button>
                      {bank.lastUsed && (
                        <ClockIcon className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredBanks.length === 0 && (
            <div className="text-center py-8">
              <BuildingLibraryIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No banks found matching your search</p>
            </div>
          )}
        </div>
      ) : (
        /* Transfer Form */
        <div className="space-y-6">
          {/* Selected Bank */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-2xl">
                {selectedBank.logo}
              </div>
              <div>
                <p className="font-medium text-white">{selectedBank.name}</p>
                <p className="text-sm text-white/60">Transfer time: {selectedBank.transferTime} | Fee: ৳{selectedBank.fee}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBank(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

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
                Transfer fee: ৳{selectedBank.fee} | Processing time: {selectedBank.transferTime}
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
      )}
    </div>
  );
};

export default LocalBanksTransfer;