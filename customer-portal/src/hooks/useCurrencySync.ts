import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

/**
 * Custom hook to automatically sync currency based on user nationality
 * This hook monitors user changes and updates the currency accordingly
 */
export const useCurrencySync = () => {
  const { user } = useAuth();
  const { updateCurrencyFromNationality } = useCurrency();

  useEffect(() => {
    // Update currency when user nationality changes
    if (user?.nationality) {
      updateCurrencyFromNationality(user.nationality);
    }
  }, [user?.nationality, updateCurrencyFromNationality]);

  // Return user nationality for debugging purposes
  return {
    userNationality: user?.nationality,
    isNationalitySet: !!user?.nationality
  };
};