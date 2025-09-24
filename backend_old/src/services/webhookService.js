const axios = require('axios');
const crypto = require('crypto');
const EventEmitter = require('events');

class WebhookService extends EventEmitter {
  constructor() {
    super();
    this.webhooks = new Map();
    this.retryQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.isProcessingQueue = false;
    
    // Start processing retry queue
    this.processRetryQueue();
  }

  /**
   * Register a webhook endpoint
   */
  registerWebhook(id, config) {
    const webhook = {
      id,
      url: config.url,
      secret: config.secret || this.generateSecret(),
      events: config.events || ['*'], // Array of event types or '*' for all
      active: config.active !== false,
      headers: config.headers || {},
      timeout: config.timeout || 10000,
      retries: 0,
      lastSuccess: null,
      lastFailure: null,
      createdAt: new Date()
    };

    this.webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Remove a webhook endpoint
   */
  removeWebhook(id) {
    return this.webhooks.delete(id);
  }

  /**
   * Get all registered webhooks
   */
  getWebhooks() {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhook by ID
   */
  getWebhook(id) {
    return this.webhooks.get(id);
  }

  /**
   * Update webhook configuration
   */
  updateWebhook(id, updates) {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    Object.assign(webhook, updates);
    this.webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(eventType, data, options = {}) {
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: data,
      id: this.generateEventId()
    };

    const relevantWebhooks = this.getRelevantWebhooks(eventType);
    
    const promises = relevantWebhooks.map(webhook => 
      this.deliverWebhook(webhook, payload, options)
    );

    const results = await Promise.allSettled(promises);
    
    // Emit event for monitoring
    this.emit('webhooks_sent', {
      eventType,
      webhookCount: relevantWebhooks.length,
      results: results.map((result, index) => ({
        webhookId: relevantWebhooks[index].id,
        status: result.status,
        error: result.reason
      }))
    });

    return results;
  }

  /**
   * Deliver webhook to specific endpoint
   */
  async deliverWebhook(webhook, payload, options = {}) {
    if (!webhook.active) {
      throw new Error('Webhook is inactive');
    }

    const signature = this.generateSignature(payload, webhook.secret);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': payload.event,
      'X-Webhook-ID': payload.id,
      'X-Webhook-Timestamp': payload.timestamp,
      'User-Agent': 'IB-LTD-Webhook/1.0',
      ...webhook.headers
    };

    try {
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: webhook.timeout,
        validateStatus: (status) => status >= 200 && status < 300
      });

      // Update success metrics
      webhook.lastSuccess = new Date();
      webhook.retries = 0;

      this.emit('webhook_success', {
        webhookId: webhook.id,
        event: payload.event,
        response: {
          status: response.status,
          headers: response.headers
        }
      });

      return {
        success: true,
        webhookId: webhook.id,
        status: response.status
      };

    } catch (error) {
      webhook.lastFailure = new Date();
      
      // Add to retry queue if retries available
      if (webhook.retries < this.maxRetries) {
        webhook.retries++;
        this.addToRetryQueue(webhook, payload, options);
      }

      this.emit('webhook_failure', {
        webhookId: webhook.id,
        event: payload.event,
        error: error.message,
        retries: webhook.retries
      });

      throw error;
    }
  }

  /**
   * Get webhooks that should receive this event type
   */
  getRelevantWebhooks(eventType) {
    return Array.from(this.webhooks.values()).filter(webhook => {
      if (!webhook.active) return false;
      return webhook.events.includes('*') || webhook.events.includes(eventType);
    });
  }

  /**
   * Generate webhook signature for security
   */
  generateSignature(payload, secret) {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate random secret for webhook
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Add failed webhook to retry queue
   */
  addToRetryQueue(webhook, payload, options) {
    const retryItem = {
      webhook: { ...webhook },
      payload,
      options,
      retryAt: new Date(Date.now() + (this.retryDelay * webhook.retries)),
      attempts: webhook.retries
    };

    this.retryQueue.push(retryItem);
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;

    while (this.retryQueue.length > 0) {
      const now = new Date();
      const readyItems = this.retryQueue.filter(item => item.retryAt <= now);
      
      if (readyItems.length === 0) {
        await this.sleep(1000); // Wait 1 second before checking again
        continue;
      }

      // Remove ready items from queue
      this.retryQueue = this.retryQueue.filter(item => item.retryAt > now);

      // Process ready items
      for (const item of readyItems) {
        try {
          await this.deliverWebhook(item.webhook, item.payload, item.options);
        } catch (error) {
          // If still failing after max retries, emit final failure event
          if (item.attempts >= this.maxRetries) {
            this.emit('webhook_final_failure', {
              webhookId: item.webhook.id,
              event: item.payload.event,
              error: error.message,
              totalAttempts: item.attempts
            });
          }
        }
      }
    }

    this.isProcessingQueue = false;
    
    // Schedule next processing cycle
    setTimeout(() => this.processRetryQueue(), 5000);
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // PREDEFINED ADMIN EVENT METHODS
  // ============================================================================

  /**
   * Send user-related webhook notifications
   */
  async notifyUserEvent(eventType, userData, adminUser) {
    const eventData = {
      user: {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status
      },
      admin: {
        id: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      },
      timestamp: new Date().toISOString()
    };

    return this.sendWebhook(`user.${eventType}`, eventData);
  }

  /**
   * Send transaction-related webhook notifications
   */
  async notifyTransactionEvent(eventType, transactionData, adminUser) {
    const eventData = {
      transaction: {
        id: transactionData._id || transactionData.id,
        type: transactionData.type,
        amount: transactionData.amount,
        status: transactionData.status,
        userId: transactionData.userId,
        reference: transactionData.transactionRef
      },
      admin: adminUser ? {
        id: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      } : null,
      timestamp: new Date().toISOString()
    };

    return this.sendWebhook(`transaction.${eventType}`, eventData);
  }

  /**
   * Send system alert webhook notifications
   */
  async notifySystemAlert(alertType, alertData) {
    const eventData = {
      alert: {
        type: alertType,
        severity: alertData.severity || 'medium',
        message: alertData.message,
        details: alertData.details || {}
      },
      system: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };

    return this.sendWebhook(`system.${alertType}`, eventData);
  }

  /**
   * Send bulk operation webhook notifications
   */
  async notifyBulkOperation(operationType, operationData, adminUser) {
    const eventData = {
      operation: {
        type: operationType,
        itemCount: operationData.itemCount || 0,
        successCount: operationData.successCount || 0,
        failureCount: operationData.failureCount || 0,
        details: operationData.details || {}
      },
      admin: {
        id: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      },
      timestamp: new Date().toISOString()
    };

    return this.sendWebhook(`bulk.${operationType}`, eventData);
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats() {
    const webhooks = Array.from(this.webhooks.values());
    
    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.active).length,
      inactiveWebhooks: webhooks.filter(w => !w.active).length,
      retryQueueSize: this.retryQueue.length,
      webhooks: webhooks.map(w => ({
        id: w.id,
        url: w.url,
        active: w.active,
        events: w.events,
        lastSuccess: w.lastSuccess,
        lastFailure: w.lastFailure,
        retries: w.retries
      }))
    };
  }
}

// Create singleton instance
const webhookService = new WebhookService();

// Register default admin webhook if configured
if (process.env.ADMIN_WEBHOOK_URL) {
  webhookService.registerWebhook('admin_default', {
    url: process.env.ADMIN_WEBHOOK_URL,
    secret: process.env.ADMIN_WEBHOOK_SECRET,
    events: ['*'], // Listen to all events
    active: true
  });
}

module.exports = webhookService;