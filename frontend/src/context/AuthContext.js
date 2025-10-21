import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    // Set base URL for axios
    axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
      ? '/.netlify/functions/api' 
      : '/api';
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Validate token format first
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }

          // Check if token is expired
          const payload = JSON.parse(atob(tokenParts[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          
          if (isExpired) {
            throw new Error('Token expired');
          }

          // Check if this is a mock admin token for testing
          if (token.includes('mock_signature_for_testing')) {
            // Use the payload data directly for mock admin token
            const mockUser = {
              id: payload.id || payload.userId,
              name: payload.name || 'Admin User',
              email: payload.email,
              role: payload.role,
              username: payload.username || 'admin',
              isAuthenticated: true,
              isActive: true
            };
            setUser(mockUser);
          } else {
            // Regular API validation for real tokens
            const response = await axios.get('/auth/me');
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // Clear invalid/expired token
          if (error.message === 'Invalid token format' || error.message === 'Token expired') {
            console.log('Clearing invalid/expired token');
          } else if (error.response?.status === 401) {
            console.log('Token authentication failed');
          } else {
            console.log('Network or server error during auth check');
          }
          
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, adminKey = null) => {
    try {
      let response;
      let isAdminLogin = false;
      
      // Check if this is likely an admin login (admin email or specific credentials)
      if (email.includes('admin') || email === 'admin@ibltd.com' || adminKey) {
        const adminPayload = {
          email,
          password
        };
        
        // Add adminKey if provided
        if (adminKey) {
          adminPayload.adminKey = adminKey;
        } else {
          // Default admin key for backward compatibility
          adminPayload.adminKey = 'admin123';
        }
        
        // Create admin API instance for login
        const adminApiInstance = axios.create({
          baseURL: process.env.NODE_ENV === 'production' 
            ? '/.netlify/functions/admin-api' 
            : 'http://localhost:5001/api'
        });
        
        response = await adminApiInstance.post('/admin/auth/login', adminPayload);
        isAdminLogin = true;
      } else {
        // Regular user login using main API
        const apiInstance = axios.create({
          baseURL: process.env.NODE_ENV === 'production' 
            ? '/.netlify/functions/api' 
            : 'http://localhost:5001/api'
        });
        
        response = await apiInstance.post('/auth/login', {
          email,
          password
        });
      }

      const { token: newToken, user: userData } = response.data;
      
      // Validate the received token
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Invalid token received from server');
      }

      // For admin tokens, skip JWT validation as they use simple string tokens
      if (isAdminLogin) {
        // Admin tokens are simple strings, no need for JWT validation
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        return { success: true, user: userData, isAdmin: isAdminLogin };
      }

      // Validate token format for regular JWT tokens
      const tokenParts = newToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format received');
      }

      // Check token expiration for JWT tokens
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          throw new Error('Received token is already expired');
        }
      } catch (tokenError) {
        if (tokenError.message.includes('expired')) {
          throw tokenError;
        }
        throw new Error('Invalid token payload received');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData, isAdmin: isAdminLogin };
    } catch (error) {
      let message = 'Login failed';
      
      // Provide more specific error messages
      if (error.message.includes('token')) {
        message = error.message;
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 403) {
        message = 'Account access denied. Please contact support.';
      } else if (error.response?.status === 429) {
        message = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (!error.response) {
        message = 'Network error. Please check your connection.';
      }
      
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Validate the received token
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Invalid token received from server');
      }

      // Validate token format
      const tokenParts = newToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format received');
      }

      // Check token expiration
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          throw new Error('Received token is already expired');
        }
      } catch (tokenError) {
        if (tokenError.message.includes('expired')) {
          throw tokenError;
        }
        throw new Error('Invalid token payload received');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      let message = 'Registration failed';
      
      // Provide more specific error messages
      if (error.message.includes('token')) {
        message = error.message;
      } else if (error.response?.status === 400) {
        message = error.response.data?.message || 'Invalid registration data';
      } else if (error.response?.status === 409) {
        message = 'Email already exists. Please use a different email.';
      } else if (error.response?.status === 429) {
        message = 'Too many registration attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (!error.response) {
        message = 'Network error. Please check your connection.';
      }
      
      return { success: false, error: message };
    }
  };

  const logout = (callback) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    
    // Execute callback after state cleanup if provided
    if (callback && typeof callback === 'function') {
      // Use setTimeout to ensure state updates are processed
      setTimeout(callback, 0);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};