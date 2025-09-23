import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    } else if (isAuthenticated && user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showTwoFactor && !formData.twoFactorCode) {
      newErrors.twoFactorCode = 'Two-factor authentication code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (!showTwoFactor) {
        // First step: email and password using the API service
        const data = await authAPI.adminLogin({
          email: formData.email,
          password: formData.password
        });

        if (data.success) {
          if (data.requiresTwoFactor) {
            setShowTwoFactor(true);
            setTempToken(data.tempToken);
            setMessage('Please enter your two-factor authentication code');
          } else {
            // Login successful without 2FA - store token and update auth context
            localStorage.setItem('token', data.token);
            
            // Update auth context with user data
            try {
              const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${data.token}`
                }
              });
              const userData = await userResponse.json();
            } catch (userError) {
              console.error('Error fetching user data:', userError);
            }
            
            // Redirect to admin dashboard
            navigate('/admin');
          }
        } else {
          setErrors({ general: data.message || 'Login failed' });
        }
      } else {
        // Second step: two-factor authentication
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/auth/verify-2fa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tempToken}`
          },
          body: JSON.stringify({
            twoFactorCode: formData.twoFactorCode
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 2FA verification successful - store token and update auth context
          localStorage.setItem('token', data.token);
          
          // Update auth context with user data
          const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          const userData = await userResponse.json();
          
          // Redirect to admin dashboard
          navigate('/admin');
        } else {
          setErrors({ twoFactorCode: data.message || '2FA verification failed' });
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setTempToken('');
    setFormData(prev => ({ ...prev, twoFactorCode: '' }));
    setErrors({});
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            {showTwoFactor ? 'Enter your authentication code' : 'Sign in to your admin account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-xl p-8">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.general}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                {message}
              </div>
            )}

            {!showTwoFactor ? (
              <>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your admin email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication Code
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  maxLength="6"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 border ${
                    errors.twoFactorCode ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest`}
                  placeholder="000000"
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                />
                {errors.twoFactorCode && <p className="mt-1 text-sm text-red-600">{errors.twoFactorCode}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {showTwoFactor ? 'Verifying...' : 'Signing in...'}
                  </div>
                ) : (
                  showTwoFactor ? 'Verify Code' : 'Sign In'
                )}
              </button>

              {showTwoFactor && (
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              ← Back to User Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;