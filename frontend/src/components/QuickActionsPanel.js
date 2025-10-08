import React, { useState } from 'react';

const QuickActionsPanel = ({ onQuickSearch, onNavigate }) => {
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search function - in real app, this would call an API
  const handleQuickSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          type: 'user',
          title: 'John Smith',
          subtitle: 'john.smith@email.com',
          action: () => onNavigate && onNavigate('/admin/users/1')
        },
        {
          id: 2,
          type: 'transaction',
          title: 'Transaction #TXN-2024-001',
          subtitle: '$5,000.00 - Transfer',
          action: () => onNavigate && onNavigate('/admin/transactions/1')
        },
        {
          id: 3,
          type: 'loan',
          title: 'Loan Application #LA-2024-001',
          subtitle: 'Pending Approval - $50,000',
          action: () => onNavigate && onNavigate('/admin/loan-applications/1')
        }
      ].filter(item => 
        item.title.toLowerCase().includes(term.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(term.toLowerCase())
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const quickActions = [
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      description: 'Review pending loan applications',
      icon: '📋',
      count: 12,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      action: () => onNavigate && onNavigate('/admin/loan-approval')
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts',
      icon: '👥',
      count: 1247,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      action: () => onNavigate && onNavigate('/admin/users')
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: '⚙️',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      action: () => onNavigate && onNavigate('/admin/settings')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create financial reports',
      icon: '📊',
      color: 'bg-green-100 text-green-800 border-green-200',
      action: () => onNavigate && onNavigate('/admin/reports')
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      description: 'View security notifications',
      icon: '🛡️',
      count: 3,
      color: 'bg-red-100 text-red-800 border-red-200',
      action: () => onNavigate && onNavigate('/admin/security')
    },
    {
      id: 'backup-system',
      title: 'Backup System',
      description: 'Perform system backup',
      icon: '💾',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      action: () => alert('System backup initiated...')
    }
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuickSearchTerm(value);
    handleQuickSearch(value);
  };

  const clearSearch = () => {
    setQuickSearchTerm('');
    setSearchResults([]);
  };

  const getResultIcon = (type) => {
    const icons = {
      user: '👤',
      transaction: '💳',
      loan: '🏦',
      report: '📊'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users, transactions, loans..."
            value={quickSearchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {quickSearchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results */}
        {quickSearchTerm && (
          <div className="mt-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Search Results:</p>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={result.action}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <span className="text-lg mr-3">{getResultIcon(result.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{result.title}</p>
                      <p className="text-xs text-gray-600">{result.subtitle}</p>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={action.action}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${action.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{action.icon}</span>
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                  </div>
                  <p className="text-xs opacity-75 mb-2">{action.description}</p>
                  {action.count !== undefined && (
                    <div className="flex items-center">
                      <span className="text-lg font-bold">{action.count.toLocaleString()}</span>
                      <span className="text-xs ml-1 opacity-75">
                        {action.id === 'pending-approvals' ? 'pending' : 
                         action.id === 'user-management' ? 'users' :
                         action.id === 'security-alerts' ? 'alerts' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Server Status</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Database</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Last Backup</span>
            </div>
            <span className="text-sm text-gray-600">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">API Status</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;