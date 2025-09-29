import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-secondary-900 dark:text-secondary-100">IB LTD</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <span className="ml-2 text-secondary-700 dark:text-secondary-300 font-medium hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <svg className="ml-1 h-4 w-4 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 dark:ring-secondary-600 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 border-b border-secondary-100 dark:border-secondary-700">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-secondary-500 dark:text-secondary-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Account Details
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-secondary-200 dark:border-secondary-700">
          {isAdmin && (
            <Link
              to="/admin"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block px-3 py-2 rounded-md text-base font-medium"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;