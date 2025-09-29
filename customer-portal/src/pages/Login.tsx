import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    accountNumber: '',
    pin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with credentials:', credentials);
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling login function...');
      const success = await login(credentials);
      console.log('Login result:', success);
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed');
        setError('ভুল অ্যাকাউন্ট নম্বর বা পিন। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            IB LTD Banking
          </h2>
          <p className="text-gray-600">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                অ্যাকাউন্ট নম্বর
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  required
                  value={credentials.accountNumber}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="আপনার অ্যাকাউন্ট নম্বর লিখুন"
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                পিন নম্বর
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="pin"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  required
                  value={credentials.pin}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="আপনার পিন নম্বর লিখুন"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">ডেমো অ্যাকাউন্ট:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>অ্যাকাউন্ট: 1001, 1002, 1003</p>
              <p>পিন: 1234</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          © 2024 IB LTD. সকল অধিকার সংরক্ষিত।
        </div>
      </div>
    </div>
  );
};

export default Login;




