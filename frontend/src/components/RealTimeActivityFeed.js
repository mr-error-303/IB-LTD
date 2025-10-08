import React, { useState, useEffect } from 'react';

const RealTimeActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate real-time activity data
  const generateActivity = () => {
    const activityTypes = [
      {
        type: 'user_registration',
        icon: '👤',
        color: 'bg-green-100 text-green-800',
        messages: [
          'New user registered: John Smith',
          'New user registered: Sarah Johnson',
          'New user registered: Michael Brown',
          'New user registered: Emily Davis'
        ]
      },
      {
        type: 'large_transaction',
        icon: '💰',
        color: 'bg-yellow-100 text-yellow-800',
        messages: [
          'Large transaction alert: $50,000 transfer',
          'Large transaction alert: $75,000 deposit',
          'Large transaction alert: $100,000 withdrawal',
          'Large transaction alert: $25,000 international transfer'
        ]
      },
      {
        type: 'system_notification',
        icon: '🔔',
        color: 'bg-blue-100 text-blue-800',
        messages: [
          'System backup completed successfully',
          'Security scan completed - no threats detected',
          'Database optimization completed',
          'Server maintenance scheduled for tonight'
        ]
      },
      {
        type: 'admin_activity',
        icon: '⚙️',
        color: 'bg-purple-100 text-purple-800',
        messages: [
          'Admin approved loan application #LA-2024-001',
          'Admin updated user permissions',
          'Admin generated monthly report',
          'Admin modified system settings'
        ]
      },
      {
        type: 'security_alert',
        icon: '🛡️',
        color: 'bg-red-100 text-red-800',
        messages: [
          'Failed login attempt detected',
          'Suspicious activity blocked',
          'Password reset requested',
          'Account locked due to multiple failed attempts'
        ]
      }
    ];

    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

    return {
      id: Date.now() + Math.random(),
      type: randomType.type,
      icon: randomType.icon,
      color: randomType.color,
      message: randomMessage,
      timestamp: new Date(),
      isNew: true
    };
  };

  // Simulate real-time connection
  useEffect(() => {
    setIsConnected(true);
    
    // Add initial activities
    const initialActivities = Array.from({ length: 5 }, () => ({
      ...generateActivity(),
      isNew: false,
      timestamp: new Date(Date.now() - Math.random() * 3600000) // Random time within last hour
    }));
    
    setActivities(initialActivities.sort((a, b) => b.timestamp - a.timestamp));

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 19)]; // Keep only latest 20 activities
        return updated;
      });

      // Remove "new" flag after 3 seconds
      setTimeout(() => {
        setActivities(prev => 
          prev.map(activity => 
            activity.id === newActivity.id 
              ? { ...activity, isNew: false }
              : activity
          )
        );
      }, 3000);
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActivityPriority = (type) => {
    const priorities = {
      'security_alert': 'high',
      'large_transaction': 'high',
      'system_notification': 'medium',
      'admin_activity': 'medium',
      'user_registration': 'low'
    };
    return priorities[type] || 'low';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <p>Waiting for activity...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 transition-all duration-300 ${
                  activity.isNew ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activity.color}`}>
                      {activity.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getActivityPriority(activity.type) === 'high' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            High Priority
                          </span>
                        )}
                        {activity.isNew && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                        {activity.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {activities.length} recent activities</span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeActivityFeed;