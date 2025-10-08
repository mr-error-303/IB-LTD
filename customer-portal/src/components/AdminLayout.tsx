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
      name: 'Dashboard Overview',
      path: '/admin',
      icon: '📊',
      exact: true
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: '👥',
      submenu: [
        { name: 'All Users', path: '/admin/users' },
        { name: 'User Approval', path: '/admin/approval' },
        { name: 'Role Management', path: '/admin/users/roles' },
        { name: 'Activity Logs', path: '/admin/activity-logs' },
        { name: 'User Analytics', path: '/admin/users/analytics' }
      ]
    },
    {
      name: 'Transaction Monitoring',
      path: '/admin/transactions',
      icon: '💳',
      submenu: [
        { name: 'All Transactions', path: '/admin/transactions' },
        { name: 'Transaction Dashboard', path: '/admin/transaction-dashboard' },
        { name: 'Transaction Approval System', path: '/admin/transaction-approval' },
        { name: 'Transaction Oversight', path: '/admin/oversight' },
        { name: 'Fund Transfer Monitoring', path: '/admin/fund-transfer-monitoring' },
        { name: 'Bill Payment Oversight', path: '/admin/bill-payment-oversight' },
        { name: 'Mobile Top-up Controls', path: '/admin/mobile-topup-controls' },
        { name: 'Cash Withdrawal Management', path: '/admin/cash-withdrawal-management' },
        { name: 'Pending Approvals', path: '/admin/transactions/pending' },
        { name: 'Failed Transactions', path: '/admin/transactions/failed' },
        { name: 'Transaction Analytics', path: '/admin/transactions/analytics' },
        { name: 'Fraud Detection', path: '/admin/transactions/fraud' }
      ]
    },
    {
      name: 'Loan Management',
      path: '/admin/loans',
      icon: '🏦',
      submenu: [
        { name: 'Loan Applications', path: '/admin/panel' },
        { name: 'Approved Loans', path: '/admin/loans/approved' },
        { name: 'Loan Disbursement', path: '/admin/loans/disbursement' },
        { name: 'EMI Management', path: '/admin/loans/emi' },
        { name: 'Loan Analytics', path: '/admin/loans/analytics' }
      ]
    },
    {
      name: 'Service Controls',
      path: '/admin/services',
      icon: '⚙️',
      submenu: [
        { name: 'Service Status', path: '/admin/services/status' },
        { name: 'API Management', path: '/admin/services/api' },
        { name: 'Maintenance Mode', path: '/admin/services/maintenance' },
        { name: 'Feature Toggles', path: '/admin/services/features' },
        { name: 'System Health', path: '/admin/services/health' }
      ]
    },
    {
      name: 'Reports & Analytics',
      path: '/admin/reports',
      icon: '📈',
      submenu: [
        { name: 'Financial Reports', path: '/admin/reports/financial' },
        { name: 'User Analytics', path: '/admin/analytics' },
        { name: 'Transaction Reports', path: '/admin/reports/transactions' },
        { name: 'Performance Metrics', path: '/admin/reports/performance' },
        { name: 'Custom Reports', path: '/admin/reports/custom' }
      ]
    },
    {
      name: 'Security Center',
      path: '/admin/security',
      icon: '🔒',
      submenu: [
        { name: 'Security Overview', path: '/admin/security/overview' },
        { name: 'Security Alerts', path: '/admin/security/alerts' },
        { name: 'Anomaly Detection', path: '/admin/security/anomaly-detection' },
        { name: 'IP Whitelist', path: '/admin/security/ip-whitelist' },
        { name: '2FA Management', path: '/admin/security/2fa' },
        { name: 'Audit Trail', path: '/admin/audit-trail' },
        { name: 'Audit Logs', path: '/admin/security/audit' }
      ]
    },
    {
      name: 'Monitoring System',
      path: '/admin/monitoring',
      icon: '📊',
      submenu: [
        { name: 'Real-Time Dashboard', path: '/admin/real-time-dashboard' },
        { name: 'Alert System', path: '/admin/alert-system' },
        { name: 'System Health', path: '/admin/system-health' },
        { name: 'Fraud Detection', path: '/admin/fraud-detection' },
        { name: 'Security Analysis', path: '/admin/security-analysis' }
      ]
    },
    {
      name: 'Reports & Analytics',
      path: '/admin/reports',
      icon: '📈',
      submenu: [
        { name: 'Reports Dashboard', path: '/admin/reports-dashboard' },
        { name: 'Financial Reports', path: '/admin/financial-reports' },
        { name: 'Operational Reports', path: '/admin/operational-reports' },
        { name: 'Export System', path: '/admin/report-export-system' }
      ]
    },
    {
      name: 'System Management',
      path: '/admin/system',
      icon: '🔧',
      submenu: [
        { name: 'Admin User Management', path: '/admin/user-management' },
        { name: 'Activity Logging', path: '/admin/activity-logging' },
        { name: 'Session Management', path: '/admin/session-management' },
        { name: 'System Configuration', path: '/admin/system-configuration' },
        { name: 'Database Management', path: '/admin/database-management' },
        { name: 'API Management', path: '/admin/api-management' },
        { name: 'Maintenance Mode', path: '/admin/maintenance-mode' }
      ]
    },
    {
      name: 'Service Management',
      path: '/admin/service-management',
      icon: '🏦',
      submenu: [
        { name: 'Add Money Service', path: '/admin/add-money-service' },
        { name: 'Ticket Booking Service', path: '/admin/ticket-booking-service' },
        { name: 'Insurance & Investment', path: '/admin/insurance-investment-service' },
        { name: 'Card Management', path: '/admin/card-management-service' }
      ]
    },
    {
      name: 'Advanced Admin',
      path: '/admin/advanced',
      icon: '🚀',
      submenu: [
        { name: 'Bulk Operations', path: '/admin/bulk-operations' },
        { name: 'Workflow Automation', path: '/admin/workflow-automation' },
        { name: 'Audit & Compliance', path: '/admin/audit-compliance' }
      ]
    },
    {
      name: 'System Settings',
      path: '/admin/settings',
      icon: '⚙️',
      submenu: [
        { name: 'General Settings', path: '/admin/settings/general' },
        { name: 'Profile Settings', path: '/admin/settings/profile' },
        { name: 'Security Settings', path: '/admin/settings/security' },
        { name: 'System Configuration', path: '/admin/settings/system' },
        { name: 'Service Configuration', path: '/admin/service-configuration' },
        { name: 'User Limits Management', path: '/admin/user-limits' },
        { name: 'Backup & Recovery', path: '/admin/settings/backup' },
        { name: 'Integration Settings', path: '/admin/settings/integrations' }
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
              {/* System Status Indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">System Online</span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v6m0 0l3-3m-3 3l-3-3" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-2">
                <button 
                  onClick={() => navigate('/admin/users/approval')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full hover:bg-yellow-200 transition-colors"
                >
                  12 Pending Approvals
                </button>
              </div>

              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="bn">🇧🇩 বাং</option>
              </select>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.name || 'Admin'}</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</div>
                    <div className="text-xs text-gray-500">{user?.email || 'admin@ibltd.com'}</div>
                  </div>
                  
                  <Link
                    to="/admin/settings/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  
                  <Link
                    to="/admin/settings/security"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security Settings
                  </Link>
                  
                  <Link
                    to="/admin/activity-logs"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Activity Logs
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
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