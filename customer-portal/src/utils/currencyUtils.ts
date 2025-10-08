// Currency utility functions for nationality-based currency detection

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

// Mapping of nationalities to their respective currencies
export const NATIONALITY_CURRENCY_MAP: Record<string, string> = {
  'Bangladeshi': 'BDT',
  'Bangladesh': 'BDT',
  'Indian': 'INR',
  'India': 'INR',
  'American': 'USD',
  'USA': 'USD',
  'United States': 'USD',
  'British': 'GBP',
  'UK': 'GBP',
  'United Kingdom': 'GBP',
  'Canadian': 'CAD',
  'Canada': 'CAD',
  'Australian': 'AUD',
  'Australia': 'AUD',
  'Pakistani': 'PKR',
  'Pakistan': 'PKR',
  'Sri Lankan': 'LKR',
  'Sri Lanka': 'LKR',
  'Nepalese': 'NPR',
  'Nepal': 'NPR',
  'Malaysian': 'MYR',
  'Malaysia': 'MYR',
  'Thai': 'THB',
  'Thailand': 'THB',
  'Indonesian': 'IDR',
  'Indonesia': 'IDR',
  'Filipino': 'PHP',
  'Philippines': 'PHP',
  'Vietnamese': 'VND',
  'Vietnam': 'VND',
  'Chinese': 'CNY',
  'China': 'CNY',
  'Japanese': 'JPY',
  'Japan': 'JPY',
  'Korean': 'KRW',
  'South Korea': 'KRW',
  'European': 'EUR',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
};

// Default currency (Bangladeshi Taka)
export const DEFAULT_CURRENCY = 'BDT';

/**
 * Get currency code based on user nationality
 * @param nationality - User's nationality
 * @returns Currency code (defaults to BDT if nationality not found)
 */
export const getCurrencyByNationality = (nationality?: string): string => {
  if (!nationality) return DEFAULT_CURRENCY;
  
  // Normalize nationality string (remove extra spaces, convert to proper case)
  const normalizedNationality = nationality.trim();
  
  // Check for exact match first
  if (NATIONALITY_CURRENCY_MAP[normalizedNationality]) {
    return NATIONALITY_CURRENCY_MAP[normalizedNationality];
  }
  
  // Check for partial matches (case-insensitive)
  const lowerNationality = normalizedNationality.toLowerCase();
  for (const [key, currency] of Object.entries(NATIONALITY_CURRENCY_MAP)) {
    if (key.toLowerCase().includes(lowerNationality) || lowerNationality.includes(key.toLowerCase())) {
      return currency;
    }
  }
  
  // Default to BDT (Bangladeshi Taka)
  return DEFAULT_CURRENCY;
};

/**
 * Get currency symbol based on currency code
 * @param currencyCode - Currency code (e.g., 'BDT', 'USD')
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'BDT': '৳',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CNY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'PKR': '₨',
    'LKR': '₨',
    'NPR': '₨',
    'MYR': 'RM',
    'THB': '฿',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
    'KRW': '₩',
  };
  
  return symbols[currencyCode] || currencyCode;
};

/**
 * Format currency amount with appropriate symbol
 * @param amount - Amount to format
 * @param currencyCode - Currency code
 * @param locale - Locale for number formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currencyCode: string = DEFAULT_CURRENCY, 
  locale: string = 'en-US'
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return `${symbol}${formatter.format(amount)}`;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Get user's preferred currency based on their nationality
 * @param user - User object with nationality information
 * @returns Currency code
 */
export const getUserPreferredCurrency = (user: { nationality?: string } | null): string => {
  if (!user?.nationality) return DEFAULT_CURRENCY;
  return getCurrencyByNationality(user.nationality);
};