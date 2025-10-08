import React, { useState, useEffect } from 'react';
import { useNotifications, ALERT_CATEGORIES } from '../../context/NotificationContext';
import notificationService from '../../services/notificationService';

const AdminAlerts = () => {
  const { adminAlerts, addAdminAlert, settings } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Simulate real-time alerts for demo
  useEffect(() => {
    const simulateAlerts = () => {
      const alertTypes = [
        {
          category: ALERT_CATEGORIES.USER_REGISTRATION,
          type: 'info',
          title: 'New User Registration',
          message: `New user registered: User${Math.floor(Math.random() * 1000)}@example.com`,
          priority: 'medium'
        },
        {
          category: ALERT_CATEGORIES.LARGE_TRANSACTION,
          type: 'warning',
          title: 'Large Transaction Alert',
          message: `Large transaction: $${(Math.random() * 50000 + 10000).toFixed(2)}`,
          priority: 'high'
        },
        {
          category: ALERT_CATEGORIES.FAILED_TRANSACTION,
          type: 'error',
          title: 'Transaction Failed',
          message: 'Transaction failed due to insufficient funds',
          priority: 'medium'
        },
        {
          category: ALERT_CATEGORIES.SYSTEM_ERROR,
          type: 'error',
          title: 'System Error',
          message: 'Database connection timeout in payment service',
          priority: 'high'
        },
        {
          category: ALERT_CATEGORIES.SECURITY_ALERT,
          type: 'error',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected',
          priority: 'critical'
        }
      ];

      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      addAdminAlert({
        ...randomAlert,
        data: {
          timestamp: new Date().toISOString(),
          source: 'System Monitor',
          details: `Alert generated at ${new Date().toLocaleString()}`
        }
      });
    };

    // Simulate alerts every 15-45 seconds
    const interval = setInterval(simulateAlerts, Math.random() * 30000 + 15000);
    
    // Add initial alerts
    setTimeout(simulateAlerts, 2000);
    setTimeout(simulateAlerts, 5000);
    setTimeout(simulateAlerts, 8000);

    return () => clearInterval(interval);
  }, [addAdminAlert]);

  // Filter and sort alerts
  const filteredAlerts = adminAlerts
    .filter(alert => filter === 'all' || alert.category === filter)
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case ALERT_CATEGORIES.USER_REGISTRATION: return 'User Registration';
      case ALERT_CATEGORIES.LARGE_TRANSACTION: return 'Large Transaction';
      case ALERT_CATEGORIES.FAILED_TRANSACTION: return 'Failed Transaction';
      case ALERT_CATEGORIES.SYSTEM_ERROR: return 'System Error';
      case ALERT_CATEGORIES.SECURITY_ALERT: return 'Security Alert';
      case ALERT_CATEGORIES.MAINTENANCE: return 'Maintenance';
      default: return 'General';
    }
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const AlertModal = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{getTypeIcon(alert.type)}</span>
              <h3 className="text-lg font-semibold">{alert.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium">Message:</span>
              <p className="text-gray-700">{alert.message}</p>
            </div>
            
            <div className="flex space-x-4">
              <div>
                <span className="font-medium">Category:</span>
                <span className="ml-2 text-blue-600">{getCategoryLabel(alert.category)}</span>
              </div>
              <div>
                <span className="font-medium">Priority:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(alert.priority)}`}>
                  {alert.priority?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div>
              <span className="font-medium">Timestamp:</span>
              <span className="ml-2 text-gray-600">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            
            {alert.data && (
              <div>
                <span className="font-medium">Details:</span>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(alert.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Alerts</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              <option value={ALERT_CATEGORIES.USER_REGISTRATION}>User Registration</option>
              <option value={ALERT_CATEGORIES.LARGE_TRANSACTION}>Large Transaction</option>
              <option value={ALERT_CATEGORIES.FAILED_TRANSACTION}>Failed Transaction</option>
              <option value={ALERT_CATEGORIES.SYSTEM_ERROR}>System Error</option>
              <option value={ALERT_CATEGORIES.SECURITY_ALERT}>Security Alert</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="timestamp-desc">Newest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="priority-desc">High Priority First</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚨</span>
            <div>
              <p className="text-sm text-red-600">Critical Alerts</p>
              <p className="text-xl font-bold text-red-800">
                {adminAlerts.filter(a => a.priority === 'critical').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            <div>
              <p className="text-sm text-orange-600">High Priority</p>
              <p className="text-xl font-bold text-orange-800">
                {adminAlerts.filter(a => a.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📊</span>
            <div>
              <p className="text-sm text-yellow-600">Medium Priority</p>
              <p className="text-xl font-bold text-yellow-800">
                {adminAlerts.filter(a => a.priority === 'medium').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📈</span>
            <div>
              <p className="text-sm text-blue-600">Total Alerts</p>
              <p className="text-xl font-bold text-blue-800">{adminAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl mb-4 block">📭</span>
              <p>No alerts found</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getTypeIcon(alert.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(alert.priority)}`}>
                          {alert.priority?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{getCategoryLabel(alert.category)}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {showModal && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => {
            setShowModal(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAlerts;