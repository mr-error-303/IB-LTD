import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCurrencyByNationality, getCurrencySymbol, formatCurrency, getUserPreferredCurrency } from '../utils/currencyUtils';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' }
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  getCurrencyByCode: (code: string) => Currency | undefined;
  supportedCurrencies: Currency[];
  updateCurrencyFromNationality: (nationality?: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Find BDT currency as default, fallback to USD if not found
  const defaultCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'BDT') || SUPPORTED_CURRENCIES[0];
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(defaultCurrency);

  // Load saved currency preference from localStorage on mount
  useEffect(() => {
    const savedCurrencyCode = localStorage.getItem('preferredCurrency');
    if (savedCurrencyCode) {
      const savedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrencyCode);
      if (savedCurrency) {
        setSelectedCurrencyState(savedCurrency);
      }
    }
  }, []);

  // Save currency preference to localStorage when it changes
  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('preferredCurrency', currency.code);
  };

  // Update currency based on user nationality
  const updateCurrencyFromNationality = (nationality?: string) => {
    const currencyCode = getCurrencyByNationality(nationality);
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (currency && currency.code !== selectedCurrency.code) {
      setSelectedCurrency(currency);
    }
  };

  // Format amount with the selected currency symbol
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, selectedCurrency.code);
  };

  // Get currency by code
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    formatAmount,
    getCurrencyByCode,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    updateCurrencyFromNationality
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};