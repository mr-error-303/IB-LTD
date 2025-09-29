// Currency utility functions for IB LTD international banking

export const CURRENCIES = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    flag: '🇧🇩',
    decimals: 2,
    primary: true
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    decimals: 2,
    primary: false
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    decimals: 2,
    primary: false
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    decimals: 2,
    primary: false
  }
};

// Mock exchange rates (in a real app, these would come from an API)
export const EXCHANGE_RATES = {
  BDT: 1,
  USD: 0.0091,
  EUR: 0.0084,
  GBP: 0.0072
};

/**
 * Format currency amount with proper symbol and formatting
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (BDT, USD, EUR, GBP)
 * @param {boolean} showCode - Whether to show currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'BDT', showCode = false) => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return amount.toString();

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);

  const result = `${currency.symbol}${formattedAmount}`;
  return showCode ? `${result} ${currency.code}` : result;
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to BDT first (base currency)
  const bdtAmount = amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from BDT to target currency
  return bdtAmount * EXCHANGE_RATES[toCurrency];
};

/**
 * Get currency display info
 * @param {string} currencyCode - Currency code
 * @returns {object} Currency display information
 */
export const getCurrencyInfo = (currencyCode) => {
  return CURRENCIES[currencyCode] || CURRENCIES.BDT;
};

/**
 * Get all available currencies
 * @returns {array} Array of currency objects
 */
export const getAllCurrencies = () => {
  return Object.values(CURRENCIES);
};

/**
 * Get primary currency (BDT)
 * @returns {object} Primary currency object
 */
export const getPrimaryCurrency = () => {
  return Object.values(CURRENCIES).find(currency => currency.primary) || CURRENCIES.BDT;
};

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted amount with suffix
 */
export const formatLargeAmount = (amount, currencyCode = 'BDT') => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return amount.toString();

  let formattedAmount;
  let suffix = '';

  if (amount >= 1000000000) {
    formattedAmount = (amount / 1000000000).toFixed(1);
    suffix = 'B';
  } else if (amount >= 1000000) {
    formattedAmount = (amount / 1000000).toFixed(1);
    suffix = 'M';
  } else if (amount >= 1000) {
    formattedAmount = (amount / 1000).toFixed(1);
    suffix = 'K';
  } else {
    formattedAmount = amount.toFixed(currency.decimals);
  }

  return `${currency.symbol}${formattedAmount}${suffix}`;
};

/**
 * Get currency color theme for UI
 * @param {string} currencyCode - Currency code
 * @returns {string} Tailwind color class
 */
export const getCurrencyColor = (currencyCode) => {
  const colorMap = {
    BDT: 'text-green-400',
    USD: 'text-blue-400',
    EUR: 'text-purple-400',
    GBP: 'text-yellow-400'
  };
  return colorMap[currencyCode] || 'text-white';
};

/**
 * Get currency gradient for backgrounds
 * @param {string} currencyCode - Currency code
 * @returns {string} Tailwind gradient class
 */
export const getCurrencyGradient = (currencyCode) => {
  const gradientMap = {
    BDT: 'from-green-500 to-emerald-600',
    USD: 'from-blue-500 to-indigo-600',
    EUR: 'from-purple-500 to-violet-600',
    GBP: 'from-yellow-500 to-orange-600'
  };
  return gradientMap[currencyCode] || 'from-primary-500 to-primary-600';
};