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
    e.stopPropagation();
    
    console.log('🔥 Admin login form submitted');
    
    setLoading(true);
    setError('');

    try {
      // Use environment variable for API URL
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://international-bank-limited.netlify.app/api';
      const loginEndpoint = `${API_BASE_URL}/admin/auth/login`;
      
      console.log('API Endpoint:', loginEndpoint);
      console.log('Admin login attempt:', {
        email: credentials.username,
        password: credentials.password ? '[PROVIDED]' : '[MISSING]',
        adminKey: credentials.adminKey ? '[PROVIDED]' : '[MISSING]'
      });

      // Make API call to backend
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
          adminKey: credentials.adminKey
        })
      });

      console.log('API Response Status:', response.status);
      const data = await response.json();
      console.log('API Response Data:', data);

      if (response.ok && data.success) {
        console.log('✅ Admin login successful');
        
        // Create admin user object from API response
        const adminUser = {
          id: data.user.id,
          name: data.user.name,
          firstName: data.user.name.split(' ')[0] || 'Admin',
          lastName: data.user.name.split(' ')[1] || 'User',
          email: data.user.email,
          accountNumber: 'ADMIN001',
          balance: 0,
          phone: '01700000000',
          address: 'Admin Office',
          isAdmin: true,
          token: data.token,
          notificationPreferences: {
            smsEnabled: true,
            emailEnabled: true,
            transactionAlerts: true,
            securityAlerts: true,
            billPaymentAlerts: true,
            mobileRechargeAlerts: true
          }
        };

        // Store admin user and token
        localStorage.setItem('bankingUser', JSON.stringify(adminUser));
        localStorage.setItem('adminToken', data.token);
        console.log('✅ Admin user and token stored in localStorage');
        
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        console.error('❌ Admin login failed:', data.message);
        setError(data.message || 'Invalid admin credentials. Please check username, password, and admin key.');
      }
    } catch (error) {
      console.error('🚨 Admin login error:', error);
      
      // Fallback to client-side authentication if API is not accessible
      console.log('🔄 Falling back to client-side authentication...');
      
      const validCredentials = [
        { email: 'admin@example.com', password: 'admin123', adminKey: 'admin123' },
        { email: 'admin@ibltd.com', password: 'admin123', adminKey: 'admin123' },
        { email: 'admin', password: 'admin123', adminKey: 'admin123' }
      ];

      const normalizedEmail = credentials.username ? credentials.username.toLowerCase().trim() : '';
      const normalizedPassword = credentials.password ? credentials.password.trim() : '';
      const normalizedAdminKey = credentials.adminKey ? credentials.adminKey.trim() : '';

      const isValid = validCredentials.some(cred => 
        cred.email === normalizedEmail && 
        cred.password === normalizedPassword && 
        cred.adminKey === normalizedAdminKey
      );

      if (isValid) {
        const adminUser = {
          id: 1,
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          email: normalizedEmail,
          accountNumber: 'ADMIN001',
          balance: 0,
          phone: '01700000000',
          address: 'Admin Office',
          isAdmin: true,
          token: 'fallback-token-' + Date.now(),
          notificationPreferences: {
            smsEnabled: true,
            emailEnabled: true,
            transactionAlerts: true,
            securityAlerts: true,
            billPaymentAlerts: true,
            mobileRechargeAlerts: true
          }
        };

        localStorage.setItem('bankingUser', JSON.stringify(adminUser));
        localStorage.setItem('adminToken', adminUser.token);
        
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add button click handler as backup
  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥 Admin login button clicked');
    
    // Trigger form submission
    const form = document.querySelector('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
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
              onClick={handleButtonClick}
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