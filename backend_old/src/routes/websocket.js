const express = require('express');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const websocketService = require('../services/websocketService');

const router = express.Router();

// WebSocket server setup function
const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({
    server,
    path: '/ws/admin',
    verifyClient: async (info) => {
      try {
        const url = new URL(info.req.url, `http://${info.req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (!token) {
          console.log('WebSocket connection rejected: No token provided');
          return false;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          console.log('WebSocket connection rejected: Invalid user or not admin');
          return false;
        }

        // Store user info for later use
        info.req.user = user;
        return true;
      } catch (error) {
        console.error('WebSocket verification error:', error);
        return false;
      }
    }
  });

  wss.on('connection', (ws, req) => {
    const user = req.user;
    if (!user) {
      console.log('WebSocket connection established but no user found');
      ws.close(1008, 'Authentication required');
      return;
    }
    console.log(`Admin WebSocket connected: ${user.username} (${user._id})`);
    
    // Initialize WebSocket service for this connection
    websocketService.handleConnection(ws, user);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to admin dashboard',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await handleWebSocketMessage(ws, user, data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', () => {
      console.log(`Admin WebSocket disconnected: ${user.username}`);
      websocketService.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
};

// Handle WebSocket messages
const handleWebSocketMessage = async (ws, user, data) => {
  const { type, room, filters, dataType, params } = data;

  switch (type) {
    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    case 'subscribe':
      try {
        websocketService.subscribe(ws, room, filters);
        ws.send(JSON.stringify({
          type: 'subscription_success',
          room,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'subscription_error',
          room,
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
      break;

    case 'unsubscribe':
      websocketService.unsubscribe(ws, room);
      ws.send(JSON.stringify({
        type: 'unsubscription_success',
        room,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'request_data':
      try {
        const responseData = await fetchRequestedData(dataType, params);
        ws.send(JSON.stringify({
          type: dataType,
          data: responseData,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'data_error',
          dataType,
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${type}`,
        timestamp: new Date().toISOString()
      }));
  }
};

// Fetch requested data based on type
const fetchRequestedData = async (dataType, params = {}) => {
  const { limit = 10, offset = 0, filters = {} } = params;

  switch (dataType) {
    case 'dashboard_stats':
      return await getDashboardStats();

    case 'recent_activities':
      return await getRecentActivities(limit, offset, filters);

    case 'system_health':
      return await getSystemHealth();

    case 'users':
      return await getUsers(limit, offset, filters);

    case 'transactions':
      return await getTransactions(limit, offset, filters);

    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
};

// Dashboard statistics
const getDashboardStats = async () => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalBalance,
      todayTransactions,
      pendingTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Transaction.countDocuments(),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
      Transaction.countDocuments({ 
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Transaction.countDocuments({ status: 'pending' })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalBalance: totalBalance[0]?.total || 0,
      todayTransactions,
      pendingTransactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Recent activities
const getRecentActivities = async (limit, offset, filters) => {
  try {
    const query = {};
    
    if (filters.type) {
      query.action = filters.type;
    }
    
    if (filters.userId) {
      query.userId = filters.userId;
    }

    const activities = await ActivityLog.find(query)
      .populate('userId', 'username email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return activities.map(activity => ({
      id: activity._id,
      action: activity.action,
      description: activity.description,
      user: activity.userId ? {
        id: activity.userId._id,
        username: activity.userId.username,
        email: activity.userId.email
      } : null,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      timestamp: activity.timestamp,
      metadata: activity.metadata
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// System health
const getSystemHealth = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [
      recentErrors,
      activeConnections,
      avgResponseTime,
      memoryUsage
    ] = await Promise.all([
      ActivityLog.countDocuments({
        action: 'error',
        timestamp: { $gte: oneHourAgo }
      }),
      websocketService.getConnectionCount(),
      getAverageResponseTime(),
      getMemoryUsage()
    ]);

    // Calculate health score
    let healthScore = 100;
    if (recentErrors > 10) healthScore -= 20;
    if (avgResponseTime > 1000) healthScore -= 15;
    if (memoryUsage > 80) healthScore -= 25;
    if (activeConnections > 100) healthScore -= 10;

    const status = healthScore >= 80 ? 'healthy' : 
                   healthScore >= 60 ? 'warning' : 'critical';

    return {
      status,
      healthScore: Math.max(0, healthScore),
      metrics: {
        recentErrors,
        activeConnections,
        avgResponseTime,
        memoryUsage,
        uptime: process.uptime(),
        lastChecked: now.toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching system health:', error);
    return {
      status: 'error',
      healthScore: 0,
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
};

// Helper functions
const getAverageResponseTime = async () => {
  // This would typically come from monitoring middleware
  // For now, return a simulated value
  return Math.floor(Math.random() * 500) + 100;
};

const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return Math.round((used.heapUsed / used.heapTotal) * 100);
};

const getUsers = async (limit, offset, filters) => {
  try {
    const query = {};
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.status) {
      query.isActive = filters.status === 'active';
    }
    
    if (filters.search) {
      query.$or = [
        { username: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await User.countDocuments(query);

    return {
      users,
      total,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const getTransactions = async (limit, offset, filters) => {
  try {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await Transaction.countDocuments(query);

    return {
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        user: tx.userId ? {
          id: tx.userId._id,
          username: tx.userId.username,
          email: tx.userId.email
        } : null,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        metadata: tx.metadata
      })),
      total,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Export setup function and router
module.exports = {
  setupWebSocketServer,
  router
};