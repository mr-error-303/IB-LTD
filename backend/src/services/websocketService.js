const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const AdminRole = require('../models/AdminRole');
const AnomalyDetection = require('../models/AnomalyDetection');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map to store client connections with metadata
    this.rooms = new Map(); // Map to store room-based subscriptions
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/admin',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('WebSocket service initialized for admin dashboard');
  }

  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        return false;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user has admin role
      if (!decoded.role || decoded.role !== 'admin') {
        return false;
      }

      // Store user info for later use
      info.req.user = decoded;
      return true;
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      return false;
    }
  }

  handleConnection(ws, req) {
    // Check if user data exists
    if (!req.user) {
      console.error('WebSocket connection rejected: No user data found');
      ws.close(1008, 'Authentication required');
      return;
    }

    const userId = req.user.userId;
    const role = req.user.role;

    // Store client metadata
    const clientInfo = {
      ws,
      userId,
      role,
      subscriptions: new Set(),
      lastActivity: new Date(),
      ipAddress: req.connection.remoteAddress
    };

    this.clients.set(ws, clientInfo);

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connection',
      status: 'connected',
      message: 'WebSocket connection established',
      timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnect(ws);
    });

    // Set up ping/pong for connection health
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    console.log(`Admin WebSocket connected: User ${userId}, Role ${role}`);
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const clientInfo = this.clients.get(ws);

      if (!clientInfo) {
        return;
      }

      clientInfo.lastActivity = new Date();

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(ws, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(ws, message);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        case 'request_data':
          this.handleDataRequest(ws, message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      });
    }
  }

  handleSubscription(ws, message) {
    const clientInfo = this.clients.get(ws);
    const { room, filters } = message;

    // Check permissions for room access
    if (!this.hasRoomPermission(clientInfo.adminRole, room)) {
      this.sendToClient(ws, {
        type: 'subscription_error',
        room,
        message: 'Insufficient permissions for this data stream',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Add client to room
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(ws);
    clientInfo.subscriptions.add(room);

    this.sendToClient(ws, {
      type: 'subscription_success',
      room,
      message: `Subscribed to ${room}`,
      timestamp: new Date().toISOString()
    });

    console.log(`Client subscribed to room: ${room}`);
  }

  handleUnsubscription(ws, message) {
    const clientInfo = this.clients.get(ws);
    const { room } = message;

    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws);
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }

    clientInfo.subscriptions.delete(room);

    this.sendToClient(ws, {
      type: 'unsubscription_success',
      room,
      message: `Unsubscribed from ${room}`,
      timestamp: new Date().toISOString()
    });
  }

  handleDataRequest(ws, message) {
    const clientInfo = this.clients.get(ws);
    const { dataType, params } = message;

    // Handle specific data requests
    switch (dataType) {
      case 'dashboard_stats':
        this.sendDashboardStats(ws);
        break;
      case 'recent_activities':
        this.sendRecentActivities(ws, params);
        break;
      case 'system_health':
        this.sendSystemHealth(ws);
        break;
      default:
        this.sendToClient(ws, {
          type: 'data_error',
          message: 'Unknown data type requested',
          timestamp: new Date().toISOString()
        });
    }
  }

  handleDisconnect(ws) {
    const clientInfo = this.clients.get(ws);
    
    if (clientInfo) {
      // Remove from all rooms
      clientInfo.subscriptions.forEach(room => {
        if (this.rooms.has(room)) {
          this.rooms.get(room).delete(ws);
          if (this.rooms.get(room).size === 0) {
            this.rooms.delete(room);
          }
        }
      });

      console.log(`Admin WebSocket disconnected: User ${clientInfo.userId}`);
      this.clients.delete(ws);
    }
  }

  hasRoomPermission(adminRole, room) {
    const permissions = adminRole.permissions;

    switch (room) {
      case 'user_updates':
        return permissions.userManagement?.view;
      case 'transaction_updates':
        return permissions.transactionManagement?.view;
      case 'balance_updates':
        return permissions.balanceManagement?.view;
      case 'security_alerts':
        return permissions.systemManagement?.view;
      case 'activity_logs':
        return permissions.activityLogs?.view;
      case 'system_health':
        return permissions.systemManagement?.view;
      default:
        return false;
    }
  }

  // Broadcasting methods
  broadcastToRoom(room, data) {
    if (!this.rooms.has(room)) {
      return;
    }

    const clients = this.rooms.get(room);
    const message = {
      ...data,
      timestamp: new Date().toISOString()
    };

    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
      }
    });
  }

  broadcastToAll(data) {
    const message = {
      ...data,
      timestamp: new Date().toISOString()
    };

    this.clients.forEach((clientInfo, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
      }
    });
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Specific data broadcasting methods
  broadcastUserUpdate(userData) {
    this.broadcastToRoom('user_updates', {
      type: 'user_update',
      data: userData
    });
  }

  broadcastTransactionUpdate(transactionData) {
    this.broadcastToRoom('transaction_updates', {
      type: 'transaction_update',
      data: transactionData
    });
  }

  broadcastBalanceUpdate(balanceData) {
    this.broadcastToRoom('balance_updates', {
      type: 'balance_update',
      data: balanceData
    });
  }

  broadcastSecurityAlert(alertData) {
    this.broadcastToRoom('security_alerts', {
      type: 'security_alert',
      data: alertData,
      priority: 'high'
    });
  }

  broadcastActivityLog(activityData) {
    this.broadcastToRoom('activity_logs', {
      type: 'activity_log',
      data: activityData
    });
  }

  broadcastSystemHealth(healthData) {
    this.broadcastToRoom('system_health', {
      type: 'system_health',
      data: healthData
    });
  }

  // Data sending methods
  async sendDashboardStats(ws) {
    try {
      // This would typically fetch from your database
      const stats = {
        totalUsers: await this.getTotalUsers(),
        activeUsers: await this.getActiveUsers(),
        totalBalance: await this.getTotalBalance(),
        todayTransactions: await this.getTodayTransactions(),
        pendingTransactions: await this.getPendingTransactions(),
        securityAlerts: await this.getSecurityAlerts()
      };

      this.sendToClient(ws, {
        type: 'dashboard_stats',
        data: stats
      });
    } catch (error) {
      console.error('Error sending dashboard stats:', error);
      this.sendToClient(ws, {
        type: 'data_error',
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  async sendRecentActivities(ws, params = {}) {
    try {
      const limit = params.limit || 10;
      const activities = await this.getRecentActivities(limit);

      this.sendToClient(ws, {
        type: 'recent_activities',
        data: activities
      });
    } catch (error) {
      console.error('Error sending recent activities:', error);
      this.sendToClient(ws, {
        type: 'data_error',
        message: 'Failed to fetch recent activities'
      });
    }
  }

  async sendSystemHealth(ws) {
    try {
      const health = await this.getSystemHealth();

      this.sendToClient(ws, {
        type: 'system_health',
        data: health
      });
    } catch (error) {
      console.error('Error sending system health:', error);
      this.sendToClient(ws, {
        type: 'data_error',
        message: 'Failed to fetch system health'
      });
    }
  }

  // Helper methods (these would typically interact with your database)
  async getTotalUsers() {
    // Implement actual database query
    return 15420;
  }

  async getActiveUsers() {
    // Implement actual database query
    return 8932;
  }

  async getTotalBalance() {
    // Implement actual database query
    return 2847392.50;
  }

  async getTodayTransactions() {
    // Implement actual database query
    return 1247;
  }

  async getPendingTransactions() {
    // Implement actual database query
    return 23;
  }

  async getSecurityAlerts() {
    try {
      const alerts = await AnomalyDetection.find({ 
        status: 'open',
        severity: { $in: ['high', 'critical'] }
      }).countDocuments();
      return alerts;
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return 0;
    }
  }

  async getRecentActivities(limit = 10) {
    try {
      const activities = await AnomalyDetection.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('type description severity createdAt')
        .lean();
      
      return activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        description: activity.description,
        severity: activity.severity,
        timestamp: activity.createdAt
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getSystemHealth() {
    // Implement actual system health checks
    return {
      systemStatus: 'healthy',
      databaseStatus: 'good',
      securityStatus: 'warning',
      apiStatus: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Connection health monitoring
  startHealthCheck() {
    setInterval(() => {
      this.clients.forEach((clientInfo, ws) => {
        if (!ws.isAlive) {
          console.log('Terminating inactive WebSocket connection');
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  // Get connection statistics
  getConnectionStats() {
    const stats = {
      totalConnections: this.clients.size,
      activeRooms: this.rooms.size,
      roomSubscriptions: {}
    };

    this.rooms.forEach((clients, room) => {
      stats.roomSubscriptions[room] = clients.size;
    });

    return stats;
  }
}

module.exports = new WebSocketService();