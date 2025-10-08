import { log } from '../utils/logger';

export interface RealtimeEvent {
  type: 'loan_approved' | 'loan_rejected' | 'loan_disbursed' | 'credit_score_updated' | 'account_status_changed' | 'user_registered' | 'user_approved' | 'user_rejected';
  userId: string;
  data: any;
  timestamp: string;
  adminId?: string;
}

export interface UserUpdate {
  userId: string;
  updateType: 'loan_status' | 'credit_score' | 'account_balance' | 'account_status';
  data: any;
  timestamp: string;
}

class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5001/ws/realtime`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        log.info('RealtimeService: Connected to WebSocket');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Authenticate with token if available
        const token = localStorage.getItem('token');
        if (token) {
          this.send({
            type: 'authenticate',
            token
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('RealtimeService: Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        log.info('RealtimeService: WebSocket connection closed');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('RealtimeService: WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('RealtimeService: Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        log.info(`RealtimeService: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private handleMessage(data: any) {
    const { type, ...payload } = data;
    
    // Notify all listeners for this event type
    const eventListeners = this.listeners.get(type);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`RealtimeService: Error in listener for ${type}:`, error);
        }
      });
    }

    // Also notify general listeners
    const generalListeners = this.listeners.get('*');
    if (generalListeners) {
      generalListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('RealtimeService: Error in general listener:', error);
        }
      });
    }
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('RealtimeService: Cannot send message, WebSocket not connected');
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  public unsubscribe(eventType: string, callback?: (data: any) => void) {
    if (callback) {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    } else {
      this.listeners.delete(eventType);
    }
  }

  // Admin-specific methods
  public emitLoanApproval(userId: string, loanId: string, approvalData: any) {
    this.send({
      type: 'admin_action',
      action: 'loan_approved',
      userId,
      loanId,
      data: approvalData,
      timestamp: new Date().toISOString()
    });
  }

  public emitLoanRejection(userId: string, loanId: string, rejectionData: any) {
    this.send({
      type: 'admin_action',
      action: 'loan_rejected',
      userId,
      loanId,
      data: rejectionData,
      timestamp: new Date().toISOString()
    });
  }

  public emitLoanDisbursement(userId: string, loanId: string, disbursementData: any) {
    this.send({
      type: 'admin_action',
      action: 'loan_disbursed',
      userId,
      loanId,
      data: disbursementData,
      timestamp: new Date().toISOString()
    });
  }

  public emitCreditScoreUpdate(userId: string, newCreditScore: number) {
    this.send({
      type: 'admin_action',
      action: 'credit_score_updated',
      userId,
      data: { creditScore: newCreditScore },
      timestamp: new Date().toISOString()
    });
  }

  public emitAccountStatusChange(userId: string, newStatus: string, reason?: string) {
    this.send({
      type: 'admin_action',
      action: 'account_status_changed',
      userId,
      data: { status: newStatus, reason },
      timestamp: new Date().toISOString()
    });
  }

  // User registration methods
  public emitUserRegistration(userId: string, userData: any) {
    this.send({
      type: 'admin_action',
      action: 'user_registered',
      userId,
      data: userData,
      timestamp: new Date().toISOString()
    });
  }

  public emitUserApproval(userId: string, approvalData: any) {
    this.send({
      type: 'admin_action',
      action: 'user_approved',
      userId,
      data: approvalData,
      timestamp: new Date().toISOString()
    });
  }

  public emitUserRejection(userId: string, rejectionData: any) {
    this.send({
      type: 'admin_action',
      action: 'user_rejected',
      userId,
      data: rejectionData,
      timestamp: new Date().toISOString()
    });
  }

  // User-specific methods
  public subscribeToUserUpdates(userId: string, callback: (data: any) => void) {
    return this.subscribe(`user_update_${userId}`, callback);
  }

  public subscribeToLoanUpdates(userId: string, callback: (data: any) => void) {
    return this.subscribe(`loan_update_${userId}`, callback);
  }

  public subscribeToUserRegistrations(callback: (data: any) => void) {
    return this.subscribe('user_registered', callback);
  }

  public subscribeToUserApprovals(callback: (data: any) => void) {
    return this.subscribe('user_approved', callback);
  }

  public subscribeToUserRejections(callback: (data: any) => void) {
    return this.subscribe('user_rejected', callback);
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

export default realtimeService;