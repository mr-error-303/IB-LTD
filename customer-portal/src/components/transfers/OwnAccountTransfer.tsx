import React, { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const OwnAccountTransfer = () => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock user accounts
  const userAccounts = [
    { id: '1', number: '1234567890', type: 'Savings', balance: 50000, name: 'Primary Savings' },
    { id: '2', number: '0987654321', type: 'Current', balance: 25000, name: 'Business Current' },
    { id: '3', number: '1122334455', type: 'Fixed Deposit', balance: 100000, name: 'Fixed Deposit' }
  ];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!fromAccount || !toAccount || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }

    const transferAmount = parseFloat(amount);
    const sourceAccount = userAccounts.find(acc => acc.id === fromAccount);
    
    if (sourceAccount && transferAmount > sourceAccount.balance) {
      setError('Insufficient balance in source account');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Successfully transferred ৳${transferAmount.toLocaleString()} between your accounts`);
      
      // Reset form
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setDescription('');
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">Own Account Transfer</h2>
        <p className="text-gray-600 text-base sm:text-lg px-4">Transfer money between your accounts instantly and securely</p>
      </div>

      {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
            <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium text-sm sm:text-base">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
            <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm sm:text-base">{error}</span>
          </div>
        )}

      <form onSubmit={handleTransfer} className="space-y-6 sm:space-y-8">
        {/* From Account */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <ArrowRightIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white rotate-180" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900">From Account</h3>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {userAccounts.map((account) => (
              <label
                key={account.id}
                className={`relative flex items-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  fromAccount === account.id
                    ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 bg-white/70 hover:border-blue-300 hover:bg-white shadow-md'
                }`}
              >
                <input
                  type="radio"
                  name="fromAccount"
                  value={account.id}
                  checked={fromAccount === account.id}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <p className="font-bold text-lg sm:text-xl text-gray-900">{account.name}</p>
                      <p className="text-gray-600 font-medium text-sm sm:text-base">{account.number}</p>
                      <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full inline-block">{account.type}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-xl sm:text-2xl text-gray-900">৳{account.balance.toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Available Balance</p>
                    </div>
                  </div>
                </div>
                {fromAccount === account.id && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Transfer Direction Indicator */}
        {fromAccount && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 sm:p-4 rounded-full shadow-lg">
              <ArrowRightIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        )}

        {/* To Account */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <ArrowRightIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900">To Account</h3>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {userAccounts
              .filter(account => account.id !== fromAccount)
              .map((account) => (
                <label
                  key={account.id}
                  className={`relative flex items-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    toAccount === account.id
                      ? 'border-green-500 bg-white shadow-lg shadow-green-500/20'
                      : 'border-gray-200 bg-white/70 hover:border-green-300 hover:bg-white shadow-md'
                  }`}
                >
                  <input
                    type="radio"
                    name="toAccount"
                    value={account.id}
                    checked={toAccount === account.id}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="space-y-1">
                        <p className="font-bold text-lg sm:text-xl text-gray-900">{account.name}</p>
                        <p className="text-gray-600 font-medium text-sm sm:text-base">{account.number}</p>
                        <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full inline-block">{account.type}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-xl sm:text-2xl text-gray-900">৳{account.balance.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Available Balance</p>
                      </div>
                    </div>
                  </div>
                  {toAccount === account.id && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Transfer Amount</h3>
          <div className="relative">
            <span className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg sm:text-xl font-bold">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-6 py-4 sm:py-6 text-gray-900 text-lg sm:text-xl font-bold placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 shadow-lg"
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>
          {fromAccount && (
            <p className="text-gray-600 text-sm sm:text-lg mt-3 sm:mt-4 font-medium">
              Available: ৳{userAccounts.find(acc => acc.id === fromAccount)?.balance.toLocaleString()}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Description (Optional)</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-4 focus:ring-gray-500/20 resize-none shadow-lg text-sm sm:text-base"
            placeholder="Add a note for this transfer"
            rows={3}
            maxLength={100}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!fromAccount || !toAccount || !amount || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
              <span className="text-lg sm:text-xl">Processing Transfer...</span>
            </>
          ) : (
            <>
              <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl">Transfer Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OwnAccountTransfer;