import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Panel' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: '📊',
      exact: true
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      submenu: [
        { name: 'All Users', path: '/admin/users' },
        { name: 'Role Management', path: '/admin/users/roles' },
        { name: 'Activity Logs', path: '/admin/users/activity' }
      ]
    },
    {
      name: 'Transactions',
      path: '/admin/transactions',
      icon: '💳'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: '📈'
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: '🔒',
      submenu: [
        { name: 'Security Alerts', path: '/admin/security/alerts' },
        { name: 'Security Overview', path: '/admin/security/overview' },
        { name: 'Anomaly Detection', path: '/admin/security/anomaly-detection' },
        { name: 'IP Whitelist', path: '/admin/security/ip-whitelist' },
        { name: '2FA Management', path: '/admin/security/2fa' }
      ]
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      submenu: [
        { name: 'Profile Settings', path: '/admin/settings/profile' },
        { name: 'Security Settings', path: '/admin/settings/security' },
        { name: 'System Settings', path: '/admin/settings/system' }
      ]
    }
  ];

  const isActiveRoute = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <div key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute(item.path, item.exact) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
              {item.submenu && isActiveRoute(item.path) && (
                <div className="bg-gray-50">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-12 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors ${
                        location.pathname === subItem.path ? 'text-blue-600 font-medium' : ''
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden md:block">{user?.name || 'Admin'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/admin/settings/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;