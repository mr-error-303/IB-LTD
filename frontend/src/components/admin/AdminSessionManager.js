import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSessionManager = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessionTimeout, setSessionTimeout] = useState(15); // Admin sessions: 15 minutes
  const [warningShown, setWarningShown] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [warningTimeoutId, setWarningTimeoutId] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Enhanced security for admin sessions
  const adminSecurityConfig = {
    sessionTimeout: 15, // 15 minutes for admin
    warningTime: 2, // Show warning 2 minutes before expiry
    maxInactivity: 5, // Force logout after 5 minutes of complete inactivity
    requireReauth: true, // Require re-authentication for sensitive operations
    logActivity: true // Log admin activities
  };

  const logAdminActivity = useCallback((activity) => {
    if (user?.role === 'admin' && adminSecurityConfig.logActivity) {
      const logEntry = {
        userId: user.id,
        activity,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client-side' // Would be populated server-side
      };
      
      // Store in localStorage for now (in production, send to server)
      const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));
    }
  }, [user]);

  const resetTimeout = useCallback(() => {
    if (!user || user.role !== 'admin') return;

    setLastActivity(Date.now());
    setWarningShown(false);

    // Clear existing timeouts
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);

    // Set warning timeout
    const warningTime = (adminSecurityConfig.sessionTimeout - adminSecurityConfig.warningTime) * 60 * 1000;
    const newWarningTimeoutId = setTimeout(() => {
      showSessionWarning();
    }, warningTime);

    // Set session timeout
    const sessionTime = adminSecurityConfig.sessionTimeout * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
      handleSessionExpiry();
    }, sessionTime);

    setWarningTimeoutId(newWarningTimeoutId);
    setTimeoutId(newTimeoutId);

    logAdminActivity('session_reset');
  }, [user, timeoutId, warningTimeoutId]);

  const showSessionWarning = useCallback(() => {
    if (warningShown) return;
    
    setWarningShown(true);
    logAdminActivity('session_warning_shown');

    const remainingTime = adminSecurityConfig.warningTime;
    const result = window.confirm(
      `⚠️ Admin Session Warning\n\n` +
      `Your admin session will expire in ${remainingTime} minutes due to security policies.\n\n` +
      `Click OK to extend your session or Cancel to logout now.`
    );

    if (result) {
      resetTimeout();
      logAdminActivity('session_extended');
    } else {
      handleSessionExpiry();
    }
  }, [warningShown, resetTimeout]);

  const handleSessionExpiry = useCallback(() => {
    logAdminActivity('session_expired');
    
    // Clear sensitive data
    localStorage.removeItem('adminPreferences');
    sessionStorage.clear();
    
    logout(() => {
      navigate('/admin/login', { replace: true });
      alert('🔒 Admin session expired for security reasons. Please log in again.');
    });
  }, [logout, navigate]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    
    // Reset timeout if it's been more than 30 seconds since last reset
    if (timeSinceLastActivity > 30 * 1000) {
      resetTimeout();
    }
  }, [lastActivity, resetTimeout]);

  // Enhanced security checks
  const performSecurityChecks = useCallback(() => {
    if (!user || user.role !== 'admin') return;

    // Check for suspicious activity patterns
    const now = Date.now();
    const inactivityTime = now - lastActivity;
    
    // Force logout after max inactivity
    if (inactivityTime > adminSecurityConfig.maxInactivity * 60 * 1000) {
      logAdminActivity('forced_logout_inactivity');
      handleSessionExpiry();
      return;
    }

    // Check for tab visibility (admin should be actively using the system)
    if (document.hidden && inactivityTime > 2 * 60 * 1000) {
      logAdminActivity('tab_hidden_extended');
      showSessionWarning();
    }
  }, [user, lastActivity, handleSessionExpiry, showSessionWarning]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Initialize admin session
    resetTimeout();
    logAdminActivity('admin_session_started');

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Add visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logAdminActivity('tab_hidden');
      } else {
        logAdminActivity('tab_visible');
        handleActivity();
      }
    });

    // Security check interval
    const securityCheckInterval = setInterval(performSecurityChecks, 30 * 1000);

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      clearInterval(securityCheckInterval);
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      document.removeEventListener('visibilitychange', () => {});
      
      logAdminActivity('admin_session_cleanup');
    };
  }, [user, handleActivity, resetTimeout, performSecurityChecks]);

  // Prevent right-click and certain key combinations for admin security
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      logAdminActivity('context_menu_blocked');
    };

    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logAdminActivity('dev_tools_blocked');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user]);

  // Only render for admin users
  if (!user || user.role !== 'admin') {
    return <>{children}</>;
  }

  return (
    <div className="admin-session-wrapper">
      {/* Security indicator */}
      <div className="admin-security-indicator" style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: '#dc3545',
        color: 'white',
        padding: '4px 8px',
        fontSize: '12px',
        zIndex: 9999,
        borderBottomLeftRadius: '4px'
      }}>
        🔒 Admin Session Active
      </div>
      
      {children}
    </div>
  );
};

export default AdminSessionManager;