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
  const [user, setUser] = useState<any>(null);
  // const { login } = useAuth();
  // const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setError('');

    try {
      // Use the correct admin API endpoint based on environment
      const adminApiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://international-bank-limited.netlify.app/.netlify/functions/admin-api'
        : 'http://localhost:5001/api';
      
      const loginEndpoint = `${adminApiUrl}/admin/auth/login`;

      let lastError = '';
      let loginSuccessful = false;

      try {
          
          const response = await fetch(loginEndpoint, {
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

          if (response.status === 404) {
            lastError = `404 Not Found: ${loginEndpoint}`;
            setError(lastError);
            return;
          }

          const responseText = await response.text();
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            lastError = `JSON Parse Error from ${loginEndpoint}: ${parseError}`;
            setError(lastError);
            return;
          }

          if (response.ok && data.success) {
            // Store admin user data and token
            const adminUser = {
              id: data.admin?.id || 'admin-1',
              username: data.admin?.username || credentials.username,
              email: data.admin?.email || credentials.username,
              role: 'admin',
              permissions: data.admin?.permissions || ['all']
            };

            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            localStorage.setItem('adminToken', data.token || 'admin-token-' + Date.now());
            localStorage.setItem('isAdminAuthenticated', 'true');

            setUser(adminUser);
            loginSuccessful = true;
            
            setTimeout(() => {
              navigate('/admin/dashboard');
            }, 100);
            return;
          } else if (response.status === 401) {
            lastError = `401 Unauthorized: ${data.message}`;
            setError(lastError);
            return;
          } else {
            lastError = `Login failed: ${data.message}`;
          }
        } catch (fetchError: any) {
          lastError = `Network error: ${fetchError.message}`;
        }

        if (!loginSuccessful) {
          setError(lastError || 'Login failed. Please check your credentials.');
        }
    } catch (error: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginClick = () => {
    // Simple click handler without debug logs
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

          <form onSubmit={handleSubmit} className="space-y-6" method="post" action="">
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