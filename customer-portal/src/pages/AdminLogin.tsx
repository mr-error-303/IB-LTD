import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useLanguage } from '../context/LanguageContext';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    adminKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const { login } = useAuth();
  // const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if we're in development or production
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        // Development - use hardcoded credentials
        if (
          (credentials.username === 'admin@example.com' || credentials.username === 'admin') &&
          credentials.password === 'admin123' &&
          credentials.adminKey === 'admin123'
        ) {
          // Create admin user object
          const adminUser = {
            id: 1,
            name: 'Admin User',
            firstName: 'Admin',
            lastName: 'User',
            email: credentials.username,
            accountNumber: 'ADMIN001',
            balance: 0,
            phone: '01700000000',
            address: 'Admin Office',
            isAdmin: true,
            notificationPreferences: {
              smsEnabled: true,
              emailEnabled: true,
              transactionAlerts: true,
              securityAlerts: true,
              billPaymentAlerts: true,
              mobileRechargeAlerts: true
            }
          };

          // Store admin user in localStorage
          localStorage.setItem('bankingUser', JSON.stringify(adminUser));
          navigate('/admin');
        } else {
          setError('Invalid admin credentials. Please check username, password, and admin key.');
        }
      } else {
        // Production - use API endpoint
        const apiUrl = 'https://international-bank-limited.netlify.app/api/admin/auth/login';
        
        console.log('Attempting admin login with:', {
          email: credentials.username,
          password: credentials.password,
          adminKey: credentials.adminKey
        });

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
              adminKey: credentials.adminKey
            }),
          });

          console.log('API Response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API Response data:', data);

          if (data.success) {
          // Create admin user object from API response
          const adminUser = {
            id: data.user.id,
            name: data.user.name,
            firstName: 'Admin',
            lastName: 'User',
            email: data.user.email,
            accountNumber: 'ADMIN001',
            balance: 0,
            phone: '01700000000',
            address: 'Admin Office',
            isAdmin: true,
            notificationPreferences: {
              smsEnabled: true,
              emailEnabled: true,
              transactionAlerts: true,
              securityAlerts: true,
              billPaymentAlerts: true,
              mobileRechargeAlerts: true
            }
          };

          // Store admin user and token in localStorage
          localStorage.setItem('bankingUser', JSON.stringify(adminUser));
          localStorage.setItem('adminToken', data.token);
          console.log('Admin login successful, navigating to /admin');
          navigate('/admin');
        } else {
          console.error('Login failed:', data.message);
          setError(data.message || 'Invalid admin credentials');
        }
      } catch (fetchError) {
        console.error('Network error during API call:', fetchError);
        setError('Network error. Please check your connection and try again.');
      }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-600 mb-8">Secure administrative access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                id="adminKey"
                name="adminKey"
                type="password"
                required
                value={credentials.adminKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin key"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Back to User Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;