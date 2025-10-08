import { NOTIFICATION_CHANNELS, ALERT_CATEGORIES } from '../context/NotificationContext';

class NotificationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
  }

  // API helper method
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Get all notifications for current user/admin
  async getNotifications(page = 1, limit = 50) {
    return this.apiCall(`/notifications?page=${page}&limit=${limit}`);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return this.apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  // Mark all notifications as read
  async markAllAsRead() {
    return this.apiCall('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // Delete notification
  async deleteNotification(notificationId) {
    return this.apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  // Send notification to user(s)
  async sendNotification(notification) {
    return this.apiCall('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }

  // Send bulk notifications
  async sendBulkNotifications(notifications) {
    return this.apiCall('/notifications/bulk-send', {
      method: 'POST',
      body: JSON.stringify({ notifications })
    });
  }

  // Get notification templates
  async getTemplates() {
    return this.apiCall('/notifications/templates');
  }

  // Create notification template
  async createTemplate(template) {
    return this.apiCall('/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  }

  // Update notification template
  async updateTemplate(templateId, template) {
    return this.apiCall(`/notifications/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(template)
    });
  }

  // Delete notification template
  async deleteTemplate(templateId) {
    return this.apiCall(`/notifications/templates/${templateId}`, {
      method: 'DELETE'
    });
  }

  // Get notification settings
  async getSettings() {
    return this.apiCall('/notifications/settings');
  }

  // Update notification settings
  async updateSettings(settings) {
    return this.apiCall('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Admin alert methods
  async getAdminAlerts(page = 1, limit = 50) {
    return this.apiCall(`/admin/alerts?page=${page}&limit=${limit}`);
  }

  // Create admin alert
  async createAdminAlert(alert) {
    return this.apiCall('/admin/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  }

  // Get alert statistics
  async getAlertStats() {
    return this.apiCall('/admin/alerts/stats');
  }

  // Channel-specific methods
  
  // Send email notification
  async sendEmail(emailData) {
    return this.apiCall('/notifications/email', {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  // Send SMS notification
  async sendSMS(smsData) {
    return this.apiCall('/notifications/sms', {
      method: 'POST',
      body: JSON.stringify(smsData)
    });
  }

  // Send push notification
  async sendPushNotification(pushData) {
    return this.apiCall('/notifications/push', {
      method: 'POST',
      body: JSON.stringify(pushData)
    });
  }

  // Utility methods for creating different types of notifications

  // Create user registration alert
  createUserRegistrationAlert(userData) {
    return {
      category: ALERT_CATEGORIES.USER_REGISTRATION,
      type: 'info',
      title: 'New User Registration',
      message: `New user registered: ${userData.name} (${userData.email})`,
      data: userData,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
      priority: 'medium'
    };
  }

  // Create large transaction alert
  createLargeTransactionAlert(transactionData) {
    return {
      category: ALERT_CATEGORIES.LARGE_TRANSACTION,
      type: 'warning',
      title: 'Large Transaction Alert',
      message: `Large transaction detected: $${transactionData.amount} from ${transactionData.fromAccount}`,
      data: transactionData,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      priority: 'high'
    };
  }

  // Create failed transaction alert
  createFailedTransactionAlert(transactionData) {
    return {
      category: ALERT_CATEGORIES.FAILED_TRANSACTION,
      type: 'error',
      title: 'Transaction Failed',
      message: `Transaction failed: ${transactionData.reason}`,
      data: transactionData,
      channels: [NOTIFICATION_CHANNELS.IN_APP],
      priority: 'medium'
    };
  }

  // Create system error alert
  createSystemErrorAlert(errorData) {
    return {
      category: ALERT_CATEGORIES.SYSTEM_ERROR,
      type: 'error',
      title: 'System Error',
      message: `System error occurred: ${errorData.message}`,
      data: errorData,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
      priority: 'high'
    };
  }

  // Create security alert
  createSecurityAlert(securityData) {
    return {
      category: ALERT_CATEGORIES.SECURITY_ALERT,
      type: 'error',
      title: 'Security Alert',
      message: `Security incident detected: ${securityData.type}`,
      data: securityData,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      priority: 'critical'
    };
  }

  // Create transaction status update for users
  createTransactionStatusNotification(transactionData, status) {
    const statusMessages = {
      pending: 'Your transaction is being processed',
      completed: 'Your transaction has been completed successfully',
      failed: 'Your transaction has failed',
      cancelled: 'Your transaction has been cancelled'
    };

    return {
      type: status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'info',
      title: 'Transaction Update',
      message: statusMessages[status] || 'Transaction status updated',
      data: transactionData,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
      priority: 'medium'
    };
  }

  // Simulate real-time events (for demo purposes)
  simulateRealTimeEvents() {
    const events = [
      () => this.createUserRegistrationAlert({
        name: 'John Doe',
        email: 'john.doe@example.com',
        registrationTime: new Date().toISOString()
      }),
      () => this.createLargeTransactionAlert({
        amount: 15000,
        fromAccount: '****1234',
        toAccount: '****5678',
        transactionId: 'TXN' + Date.now()
      }),
      () => this.createFailedTransactionAlert({
        transactionId: 'TXN' + Date.now(),
        reason: 'Insufficient funds',
        amount: 500
      }),
      () => this.createSystemErrorAlert({
        message: 'Database connection timeout',
        service: 'Payment Service',
        timestamp: new Date().toISOString()
      })
    ];

    // Randomly trigger events every 10-30 seconds
    const scheduleNextEvent = () => {
      const delay = Math.random() * 20000 + 10000; // 10-30 seconds
      setTimeout(() => {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const notification = randomEvent();
        
        // Dispatch to notification context if available
        if (window.notificationDispatch) {
          window.notificationDispatch({
            type: 'ADD_ADMIN_ALERT',
            payload: notification
          });
        }
        
        scheduleNextEvent();
      }, delay);
    };

    scheduleNextEvent();
  }

  // Get user list for bulk messaging
  async getUserList(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.apiCall(`/users?${queryParams}`);
  }

  // Send notification to specific user groups
  async sendToUserGroup(groupCriteria, notification) {
    return this.apiCall('/notifications/send-to-group', {
      method: 'POST',
      body: JSON.stringify({
        groupCriteria,
        notification
      })
    });
  }

  // Get notification delivery status
  async getDeliveryStatus(notificationId) {
    return this.apiCall(`/notifications/${notificationId}/delivery-status`);
  }

  // Get notification analytics
  async getNotificationAnalytics(dateRange) {
    return this.apiCall(`/notifications/analytics?${new URLSearchParams(dateRange).toString()}`);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;