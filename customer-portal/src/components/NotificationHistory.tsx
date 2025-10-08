import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Phone } from 'lucide-react';
import { smsService, SMSNotification } from '../services/smsService';

interface NotificationHistoryProps {
  userId: string;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<SMSNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'transaction' | 'security' | 'general'>('all');

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = () => {
    setLoading(true);
    try {
      const history = smsService.getNotificationHistory(userId);
      setNotifications(history);
    } catch (error) {
      console.error('Failed to load notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'security':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'general':
        return <Phone className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'লেনদেন';
      case 'security':
        return 'নিরাপত্তা';
      case 'general':
        return 'সাধারণ';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'পাঠানো হয়েছে';
      case 'failed':
        return 'ব্যর্থ';
      case 'pending':
        return 'অপেক্ষমাণ';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">এসএমএস ইতিহাস</h3>
        </div>
        <button
          onClick={loadNotifications}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          রিফ্রেশ
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'সব' },
          { key: 'transaction', label: 'লেনদেন' },
          { key: 'security', label: 'নিরাপত্তা' },
          { key: 'general', label: 'সাধারণ' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">কোনো এসএমএস ইতিহাস পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {notification.phoneNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.timestamp)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(notification.status)}
                        <span className={`text-xs font-medium ${
                          notification.status === 'sent' ? 'text-green-600' :
                          notification.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {getStatusLabel(notification.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {notifications.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {notifications.filter(n => n.status === 'sent').length}
              </div>
              <div className="text-xs text-gray-500">সফল</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {notifications.filter(n => n.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-500">ব্যর্থ</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {notifications.filter(n => n.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-500">অপেক্ষমাণ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationHistory;