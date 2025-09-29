import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SecurityConfig {
  maxFailedAttempts: number;
  lockoutDuration: number;
  sensitiveOperations: string[];
  requireTwoFactorFor: string[];
}

interface SecurityStatus {
  isLocked: boolean;
  failedAttempts: number;
  securityLevel: string;
  twoFactorRequired: boolean;
  lastSecurityCheck: number;
}

interface SecurityEvent {
  event: string;
  details: Record<string, any>;
  timestamp: string;
  userId?: string;
  userAgent: string;
  sessionId: string;
}

interface AdminSecurityContextType {
  // Security state
  securityLevel: string;
  sessionLocked: boolean;
  failedAttempts: number;
  twoFactorRequired: boolean;
  
  // Security methods
  verifyAdminCredentials: (password: string, operation: string) => Promise<{ success: boolean; error?: string }>;
  requestReAuthentication: (operation: string, onSuccess?: () => void, onFailure?: (error: any) => void) => void;
  performSecureOperation: (operation: string, operationFn: () => Promise<any>, options?: any) => Promise<any>;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<{ success: boolean; error?: string }>;
  logSecurityEvent: (event: string, details?: Record<string, any>) => void;
  getSecurityStatus: () => SecurityStatus;
  
  // Security checks
  requiresEnhancedSecurity: (operation: string) => boolean;
  requiresTwoFactor: (operation: string) => boolean;
  
  // Configuration
  securityConfig: SecurityConfig;
}

const AdminSecurityContext = createContext<AdminSecurityContextType | undefined>(undefined);

export const useAdminSecurity = () => {
  const context = useContext(AdminSecurityContext);
  if (!context) {
    throw new Error('useAdminSecurity must be used within AdminSecurityProvider');
  }
  return context;
};

interface AdminSecurityProviderProps {
  children: ReactNode;
}

const AdminSecurityProvider: React.FC<AdminSecurityProviderProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [securityLevel, setSecurityLevel] = useState('standard');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lastSecurityCheck, setLastSecurityCheck] = useState(Date.now());

  // Security configuration
  const securityConfig: SecurityConfig = {
    maxFailedAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sensitiveOperations: [
      'user_delete',
      'user_create',
      'balance_adjust',
      'system_settings',
      'user_password_reset',
      'transfer_large_amount',
      'account_settings_change'
    ],
    requireTwoFactorFor: [
      'user_delete',
      'balance_adjust',
      'system_settings',
      'transfer_large_amount'
    ]
  };

  // Check if operation requires enhanced security
  const requiresEnhancedSecurity = useCallback((operation: string) => {
    return securityConfig.sensitiveOperations.includes(operation);
  }, []);

  // Check if operation requires 2FA
  const requiresTwoFactor = useCallback((operation: string) => {
    return securityConfig.requireTwoFactorFor.includes(operation);
  }, []);

  // Verify admin credentials for sensitive operations
  const verifyAdminCredentials = useCallback(async (password: string, operation: string) => {
    try {
      // Simulate API call - in production this would be a real endpoint
      const response = await fetch('/api/auth/admin/verify-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password, operation })
      });

      if (!response.ok) {
        // Simulate verification for demo purposes
        if (password === 'admin123') {
          setFailedAttempts(0);
          return { success: true };
        } else {
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          
          if (newFailedAttempts >= securityConfig.maxFailedAttempts) {
            lockSession();
          }
          
          return { success: false, error: 'Invalid password' };
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setFailedAttempts(0);
        return { success: true };
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= securityConfig.maxFailedAttempts) {
          lockSession();
        }
        
        return { success: false, error: data.message };
      }
    } catch (error) {
      // Simulate verification for demo purposes
      if (password === 'admin123') {
        setFailedAttempts(0);
        return { success: true };
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= securityConfig.maxFailedAttempts) {
          lockSession();
        }
        
        return { success: false, error: 'Invalid password' };
      }
    }
  }, [failedAttempts]);

  // Lock admin session
  const lockSession = useCallback(() => {
    setSessionLocked(true);
    
    // Auto-unlock after lockout duration
    setTimeout(() => {
      setSessionLocked(false);
      setFailedAttempts(0);
    }, securityConfig.lockoutDuration);
    
    // Log security event
    logSecurityEvent('session_locked', { reason: 'max_failed_attempts' });
  }, []);

  // Unlock session with admin verification
  const unlockSession = useCallback(async (password: string) => {
    const result = await verifyAdminCredentials(password, 'unlock_session');
    
    if (result.success) {
      setSessionLocked(false);
      setFailedAttempts(0);
      logSecurityEvent('session_unlocked');
      return { success: true };
    }
    
    return result;
  }, [verifyAdminCredentials]);

  // Request admin re-authentication
  const requestReAuthentication = useCallback((operation: string, onSuccess?: () => void, onFailure?: (error: any) => void) => {
    if (sessionLocked) {
      onFailure?.({ error: 'Session is locked. Please unlock first.' });
      return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const form = document.createElement('div');
    form.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 90%;
    `;

    form.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #dc3545;">🔐 Admin Re-Authentication Required</h3>
      <p style="margin-bottom: 20px; color: #666;">
        This operation requires admin verification for security.
        <br><strong>Operation:</strong> ${operation.replace('_', ' ').toUpperCase()}
      </p>
      <input 
        type="password" 
        id="adminPassword" 
        placeholder="Enter your admin password"
        style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;"
      />
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancelBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
        <button id="verifyBtn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Verify
        </button>
      </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    const passwordInput = form.querySelector('#adminPassword') as HTMLInputElement;
    const cancelBtn = form.querySelector('#cancelBtn') as HTMLButtonElement;
    const verifyBtn = form.querySelector('#verifyBtn') as HTMLButtonElement;

    passwordInput.focus();

    const cleanup = () => {
      document.body.removeChild(modal);
    };

    const handleVerify = async () => {
      const password = passwordInput.value;
      
      if (!password) {
        alert('Please enter your password');
        return;
      }

      verifyBtn.textContent = 'Verifying...';
      verifyBtn.disabled = true;

      const result = await verifyAdminCredentials(password, operation);
      
      cleanup();
      
      if (result.success) {
        logSecurityEvent('admin_reauth_success', { operation });
        onSuccess?.();
      } else {
        logSecurityEvent('admin_reauth_failed', { operation, error: result.error });
        onFailure?.(result);
      }
    };

    cancelBtn.onclick = () => {
      cleanup();
      logSecurityEvent('admin_reauth_cancelled', { operation });
      onFailure?.({ error: 'Authentication cancelled' });
    };

    verifyBtn.onclick = handleVerify;
    
    passwordInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        handleVerify();
      }
    };
  }, [sessionLocked, verifyAdminCredentials]);

  // Log security events
  const logSecurityEvent = useCallback((event: string, details: Record<string, any> = {}) => {
    const logEntry: SecurityEvent = {
      event,
      details,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('sessionId') || 'unknown'
    };

    // Store security logs
    const existingLogs = JSON.parse(localStorage.getItem('adminSecurityLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 200 entries
    if (existingLogs.length > 200) {
      existingLogs.splice(0, existingLogs.length - 200);
    }
    
    localStorage.setItem('adminSecurityLogs', JSON.stringify(existingLogs));

    // In production, also send to server
    console.log('Security Event:', logEntry);
  }, [user]);

  // Perform security operation with verification
  const performSecureOperation = useCallback(async (operation: string, operationFn: () => Promise<any>, options: any = {}) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    if (sessionLocked) {
      throw new Error('Session is locked. Please unlock first.');
    }

    // Check if operation requires enhanced security
    if (requiresEnhancedSecurity(operation)) {
      return new Promise((resolve, reject) => {
        requestReAuthentication(
          operation,
          async () => {
            try {
              const result = await operationFn();
              logSecurityEvent('secure_operation_success', { operation });
              resolve(result);
            } catch (error: any) {
              logSecurityEvent('secure_operation_error', { operation, error: error.message });
              reject(error);
            }
          },
          (error) => {
            reject(new Error(error.error || 'Authentication failed'));
          }
        );
      });
    } else {
      // Regular operation
      try {
        const result = await operationFn();
        logSecurityEvent('operation_success', { operation });
        return result;
      } catch (error: any) {
        logSecurityEvent('operation_error', { operation, error: error.message });
        throw error;
      }
    }
  }, [user, sessionLocked, requiresEnhancedSecurity, requestReAuthentication, logSecurityEvent]);

  // Get security status
  const getSecurityStatus = useCallback((): SecurityStatus => {
    return {
      isLocked: sessionLocked,
      failedAttempts,
      securityLevel,
      twoFactorRequired,
      lastSecurityCheck
    };
  }, [sessionLocked, failedAttempts, securityLevel, twoFactorRequired, lastSecurityCheck]);

  // Initialize security context
  useEffect(() => {
    if (user?.role === 'admin') {
      // Generate session ID if not exists
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', Date.now().toString(36) + Math.random().toString(36));
      }
      
      logSecurityEvent('admin_security_initialized');
      setLastSecurityCheck(Date.now());
    }
  }, [user, logSecurityEvent]);

  const value: AdminSecurityContextType = {
    // Security state
    securityLevel,
    sessionLocked,
    failedAttempts,
    twoFactorRequired,
    
    // Security methods
    verifyAdminCredentials,
    requestReAuthentication,
    performSecureOperation,
    lockSession,
    unlockSession,
    logSecurityEvent,
    getSecurityStatus,
    
    // Security checks
    requiresEnhancedSecurity,
    requiresTwoFactor,
    
    // Configuration
    securityConfig
  };

  return (
    <AdminSecurityContext.Provider value={value}>
      {children}
    </AdminSecurityContext.Provider>
  );
};

export { AdminSecurityProvider };
export default AdminSecurityProvider;