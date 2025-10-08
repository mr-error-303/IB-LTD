import React from 'react';
import { useCurrencySync } from '../hooks/useCurrencySync';

/**
 * CurrencySync component that automatically syncs currency based on user nationality
 * This component should be placed inside the providers but doesn't render anything
 */
const CurrencySync: React.FC = () => {
  useCurrencySync();
  return null;
};

export default CurrencySync;