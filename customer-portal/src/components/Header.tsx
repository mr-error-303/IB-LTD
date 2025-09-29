import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = (lang: 'bn' | 'en') => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">IB LTD</span>
            </Link>
          </div>

          {/* Right side - Notifications, Settings and User menu */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            <Link
              to="/security"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t('nav.account')}
                    </Link>
                    <Link
                      to="/beneficiaries"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t('nav.beneficiaries')}
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={toggleDarkMode}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleLanguageChange('bn')}
                              className={`px-2 py-1 text-xs rounded ${
                                language === 'bn'
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              বাং
                            </button>
                            <button
                              onClick={() => handleLanguageChange('en')}
                              className={`px-2 py-1 text-xs rounded ${
                                language === 'en'
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              EN
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;