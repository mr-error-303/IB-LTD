import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  BuildingLibraryIcon 
} from '@heroicons/react/24/solid';

const ACCOUNT_TYPES = {
  current: {
    id: 'current',
    name: 'Current Account',
    nameBn: 'চলতি হিসাব',
    icon: CreditCardIcon,
    color: 'from-primary-500 to-primary-700',
    balance: 125000.50,
    accountNumber: '1234567890123456',
    interestRate: null
  },
  savings: {
    id: 'savings',
    name: 'Savings Account',
    nameBn: 'সঞ্চয় হিসাব',
    icon: BanknotesIcon,
    color: 'from-success-500 to-success-700',
    balance: 85000.75,
    accountNumber: '2345678901234567',
    interestRate: 4.5
  },
  fixed: {
    id: 'fixed',
    name: 'Fixed Deposit',
    nameBn: 'স্থায়ী আমানত',
    icon: BuildingLibraryIcon,
    color: 'from-accent-500 to-accent-700',
    balance: 500000.00,
    accountNumber: '3456789012345678',
    interestRate: 7.2,
    maturityDate: '2025-12-31'
  }
};

const AccountSelector = ({ selectedAccount, onAccountChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentAccount = ACCOUNT_TYPES[selectedAccount];

  const handleAccountSelect = (accountId) => {
    onAccountChange(accountId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Account Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card glass-card-hover p-4 flex items-center justify-between transition-all duration-300 group"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentAccount.color} shadow-glow`}>
            <currentAccount.icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white/90 text-lg">
              {currentAccount.nameBn}
            </h3>
            <p className="text-sm text-white/60">
              **** **** {currentAccount.accountNumber.slice(-4)}
            </p>
          </div>
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-white/70 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-white/20 rounded-2xl overflow-hidden z-50 animate-fade-in-up">
          {Object.values(ACCOUNT_TYPES).map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${account.color} shadow-glow`}>
                  <account.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-white/90">
                    {account.nameBn}
                  </h4>
                  <p className="text-sm text-white/60">
                    **** **** {account.accountNumber.slice(-4)}
                  </p>
                  {account.interestRate && (
                    <p className="text-xs text-success-400">
                      {account.interestRate}% সুদের হার
                    </p>
                  )}
                </div>
              </div>
              {selectedAccount === account.id && (
                <CheckIcon className="w-5 h-5 text-success-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export { ACCOUNT_TYPES };
export default AccountSelector;