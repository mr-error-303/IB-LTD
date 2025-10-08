import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Alert categories for admin notifications
export const ALERT_CATEGORIES = {
  USER_REGISTRATION: 'user_registration',
  LARGE_TRANSACTION: 'large_transaction',
  FAILED_TRANSACTION: 'failed_transaction',
  SYSTEM_ERROR: 'system_error',
  SECURITY_ALERT: 'security_alert',
  MAINTENANCE: 'maintenance'
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  adminAlerts: [],
  userMessages: [],
  templates: [],
  settings: {
    enableRealTime: true,
    enableEmail: true,
    enableSMS: false,
    enablePush: true,
    alertThresholds: {
      largeTransactionAmount: 10000,
      failedTransactionCount: 5,
      newUserRegistrations: 10
    }
  },
  isConnected: false,
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  ADD_ADMIN_ALERT: 'ADD_ADMIN_ALERT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_TEMPLATES: 'SET_TEMPLATES',
  ADD_TEMPLATE: 'ADD_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  BULK_ADD_NOTIFICATIONS: 'BULK_ADD_NOTIFICATIONS'
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case ACTIONS.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: removedNotification && !removedNotification.read 
          ? state.unreadCount - 1 
          : state.unreadCount
      };
    
    case ACTIONS.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const wasUnread = state.notifications.find(n => n.id === action.payload && !n.read);
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };
    
    case ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    
    case ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    case ACTIONS.ADD_ADMIN_ALERT:
      const alert = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      return {
        ...state,
        adminAlerts: [alert, ...state.adminAlerts]
      };
    
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case ACTIONS.SET_TEMPLATES:
      return {
        ...state,
        templates: action.payload
      };
    
    case ACTIONS.ADD_TEMPLATE:
      const template = {
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        ...action.payload
      };
      return {
        ...state,
        templates: [...state.templates, template]
      };
    
    case ACTIONS.UPDATE_TEMPLATE:
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        )
      };
    
    case ACTIONS.DELETE_TEMPLATE:
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload)
      };
    
    case ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload
      };
    
    case ACTIONS.BULK_ADD_NOTIFICATIONS:
      const bulkNotifications = action.payload.map(notification => ({
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      }));
      return {
        ...state,
        notifications: [...bulkNotifications, ...state.notifications],
        unreadCount: state.unreadCount + bulkNotifications.length
      };
    
    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext();

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!state.settings.enableRealTime) return;

    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      try {
        // In a real implementation, this would connect to your WebSocket server
        ws = new WebSocket('ws://localhost:3001/notifications');
        
        ws.onopen = () => {
          dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: true });
          console.log('Notification WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: data.payload });
            } else if (data.type === 'admin_alert') {
              dispatch({ type: ACTIONS.ADD_ADMIN_ALERT, payload: data.payload });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
          console.log('Notification WebSocket disconnected');
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [state.settings.enableRealTime]);

  // Context value
  const value = {
    ...state,
    dispatch,
    
    // Notification actions
    addNotification: (notification) => {
      dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
    },
    
    removeNotification: (id) => {
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
    },
    
    markAsRead: (id) => {
      dispatch({ type: ACTIONS.MARK_AS_READ, payload: id });
    },
    
    markAllAsRead: () => {
      dispatch({ type: ACTIONS.MARK_ALL_AS_READ });
    },
    
    clearNotifications: () => {
      dispatch({ type: ACTIONS.CLEAR_NOTIFICATIONS });
    },
    
    // Admin alert actions
    addAdminAlert: (alert) => {
      dispatch({ type: ACTIONS.ADD_ADMIN_ALERT, payload: alert });
    },
    
    // Settings actions
    updateSettings: (settings) => {
      dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
    },
    
    // Template actions
    addTemplate: (template) => {
      dispatch({ type: ACTIONS.ADD_TEMPLATE, payload: template });
    },
    
    updateTemplate: (template) => {
      dispatch({ type: ACTIONS.UPDATE_TEMPLATE, payload: template });
    },
    
    deleteTemplate: (id) => {
      dispatch({ type: ACTIONS.DELETE_TEMPLATE, payload: id });
    },
    
    // Utility functions
    showSuccess: (message, options = {}) => {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPES.SUCCESS,
          message,
          ...options
        }
      });
    },
    
    showError: (message, options = {}) => {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPES.ERROR,
          message,
          ...options
        }
      });
    },
    
    showWarning: (message, options = {}) => {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPES.WARNING,
          message,
          ...options
        }
      });
    },
    
    showInfo: (message, options = {}) => {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPES.INFO,
          message,
          ...options
        }
      });
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;