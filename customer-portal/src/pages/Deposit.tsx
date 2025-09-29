import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface DepositFormData {
  amount: string;
  description: string;
}

const Deposit: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<DepositFormData>({
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('Please enter a valid amount greater than 0'));
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) > 50000) {
      setError(t('Maximum deposit amount is $50,000 per transaction'));
      setLoading(false);
      return;
    }

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const depositAmount = parseFloat(formData.amount);
      const newBalance = (user?.balance || 0) + depositAmount;
      
      setSuccess(t(`Successfully deposited $${formData.amount}. New balance: $${newBalance.toFixed(2)}`));
      setFormData({ amount: '', description: '' });
    } catch (error) {
      setError(t('Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Deposit Money')}</h1>
            <p className="text-gray-600">{t('Add funds to your account')}</p>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Account Information')}</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Account Holder')}:</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Account Number')}:</span>
                <span className="font-medium">{user?.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">{t('Current Balance')}:</span>
                <span className="font-bold text-lg text-green-600">
                  ${user?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Deposit Amount')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    max="50000"
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{t('Maximum: $50,000 per transaction')}</p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Quick Amounts')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Description')} ({t('Optional')})
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={100}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t('e.g., Salary deposit, Gift money')}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('Processing...')}
                  </div>
                ) : (
                  t('Deposit Money')
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">{t('Security Notice')}</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('All deposits are processed securely and will be reflected in your account immediately.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;