import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType } from '../types';
import { authService } from '../services/authService';
import { log } from '../utils/logger';
import { handleAuthError } from '../utils/errorHandler';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('bankingUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        log.info('User restored from localStorage', { userId: parsedUser.id }, 'AuthContext');
      } catch (error) {
        log.error('Failed to parse saved user data', error, 'AuthContext');
        localStorage.removeItem('bankingUser');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      log.auth('Login attempt', { accountNumber: credentials.accountNumber });
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        localStorage.setItem('bankingUser', JSON.stringify(response.data));
        log.auth('Login successful', { userId: response.data.id });
        return true;
      }
      log.auth('Login failed - invalid credentials', { accountNumber: credentials.accountNumber });
      return false;
    } catch (error) {
      const appError = handleAuthError(error, 'AuthContext');
      log.error('Login error', appError, 'AuthContext');
      return false;
    }
  };

  const logout = () => {
    const userId = user?.id;
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bankingUser');
    log.auth('User logged out', { userId });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('bankingUser', JSON.stringify(updatedUser));
    log.info('User profile updated', { userId: updatedUser.id }, 'AuthContext');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};