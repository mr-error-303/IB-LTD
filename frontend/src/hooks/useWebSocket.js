import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const [error, setError] = useState(null);
  
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef([]);
  const subscriptionsRef = useRef(new Set());
  
  const {
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onMessage,
    onError,
    shouldReconnect = true,
    protocols = [],
  } = options;

  const getWebSocketUrl = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const wsUrl = new URL(url);
    wsUrl.searchParams.set('token', token);
    return wsUrl.toString();
  }, [url]);

  const connect = useCallback(() => {
    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl, protocols);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setReadyState(WebSocket.OPEN);
        setConnectionStatus('Connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          ws.send(JSON.stringify(message));
        }
        
        // Resubscribe to previous subscriptions
        subscriptionsRef.current.forEach(subscription => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            room: subscription
          }));
        });
        
        if (onOpen) onOpen(event);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setReadyState(WebSocket.CLOSED);
        setConnectionStatus('Disconnected');
        
        if (shouldReconnect && reconnectAttemptsRef.current < reconnectAttempts) {
          const timeout = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current);
          setConnectionStatus(`Reconnecting in ${Math.ceil(timeout / 1000)}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        }
        
        if (onClose) onClose(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError(err);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
        setConnectionStatus('Error');
        
        if (onError) onError(event);
      };
      
      setSocket(ws);
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError(err);
      setConnectionStatus('Error');
    }
  }, [getWebSocketUrl, protocols, onOpen, onClose, onMessage, onError, shouldReconnect, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Manual disconnect');
    }
    
    setSocket(null);
    setReadyState(WebSocket.CLOSED);
    setConnectionStatus('Disconnected');
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      messageQueueRef.current.push(message);
    }
  }, [socket]);

  const subscribe = useCallback((room, filters = {}) => {
    subscriptionsRef.current.add(room);
    sendMessage({
      type: 'subscribe',
      room,
      filters
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((room) => {
    subscriptionsRef.current.delete(room);
    sendMessage({
      type: 'unsubscribe',
      room
    });
  }, [sendMessage]);

  const requestData = useCallback((dataType, params = {}) => {
    sendMessage({
      type: 'request_data',
      dataType,
      params
    });
  }, [sendMessage]);

  // Initialize connection
  useEffect(() => {
    if (url) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const heartbeat = setInterval(() => {
        sendMessage({ type: 'ping' });
      }, heartbeatInterval);
      
      return () => clearInterval(heartbeat);
    }
  }, [socket, sendMessage, heartbeatInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    lastMessage,
    readyState,
    connectionStatus,
    error,
    sendMessage,
    subscribe,
    unsubscribe,
    requestData,
    connect,
    disconnect,
    isConnected: readyState === WebSocket.OPEN,
    isConnecting: readyState === WebSocket.CONNECTING,
    isDisconnected: readyState === WebSocket.CLOSED,
  };
};

// Hook for admin dashboard real-time data
export const useAdminWebSocket = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [shouldConnect, setShouldConnect] = useState(false);

  // Check if user is authenticated before connecting
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Basic token validation (check if it's not expired)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          
          if (!isExpired) {
            setShouldConnect(true);
          } else {
            console.warn('Token expired, WebSocket connection disabled');
            setShouldConnect(false);
          }
        } catch (error) {
          console.error('Invalid token format:', error);
          setShouldConnect(false);
        }
      } else {
        setShouldConnect(false);
      }
    };

    // Check immediately
    checkAuth();

    // Check periodically for token changes
    const interval = setInterval(checkAuth, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'dashboard_stats':
        setDashboardStats(data.data);
        break;
      case 'recent_activities':
        setRecentActivities(data.data);
        break;
      case 'system_health':
        setSystemHealth(data.data);
        break;
      case 'user_update':
      case 'transaction_update':
      case 'balance_update':
        // Trigger dashboard stats refresh
        requestData('dashboard_stats');
        break;
      case 'security_alert':
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'security',
            message: data.data.description || 'Security alert detected',
            severity: data.priority || 'medium',
            timestamp: data.timestamp
          },
          ...prev.slice(0, 9) // Keep only last 10 notifications
        ]);
        break;
      case 'activity_log':
        setRecentActivities(prev => [data.data, ...prev.slice(0, 9)]);
        break;
      case 'connection':
        console.log('WebSocket connection established:', data.message);
        break;
      case 'subscription_success':
        console.log('Subscribed to:', data.room);
        break;
      case 'subscription_error':
        console.error('Subscription error:', data.message);
        break;
      case 'error':
      case 'data_error':
        console.error('WebSocket error:', data.message);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:5000/ws/admin`;
  
  const {
    isConnected,
    connectionStatus,
    error,
    subscribe,
    unsubscribe,
    requestData,
    sendMessage
  } = useWebSocket(shouldConnect ? wsUrl : null, {
    onMessage: handleMessage,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeatInterval: 30000,
    shouldReconnect: shouldConnect
  });

  // Subscribe to admin data streams
  useEffect(() => {
    if (isConnected && shouldConnect) {
      // Subscribe to relevant data streams
      subscribe('user_updates');
      subscribe('transaction_updates');
      subscribe('balance_updates');
      subscribe('security_alerts');
      subscribe('activity_logs');
      subscribe('system_health');
      
      // Request initial data
      requestData('dashboard_stats');
      requestData('recent_activities', { limit: 10 });
      requestData('system_health');
    }
  }, [isConnected, shouldConnect, subscribe, requestData]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return {
    // Connection status
    isConnected,
    connectionStatus,
    error,
    
    // Data
    dashboardStats,
    recentActivities,
    systemHealth,
    notifications,
    
    // Actions
    subscribe,
    unsubscribe,
    requestData,
    sendMessage,
    clearNotifications,
    removeNotification,
    
    // Refresh functions
    refreshDashboardStats: () => requestData('dashboard_stats'),
    refreshActivities: () => requestData('recent_activities', { limit: 10 }),
    refreshSystemHealth: () => requestData('system_health'),
  };
};

export default useWebSocket;