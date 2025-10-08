import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const useSessionTimeout = (timeoutMinutes = 30) => {
  const { logout, user } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Don't apply timeout if timeoutMinutes is null or user is admin
  const isActive = timeoutMinutes !== null && user && user.role !== 'admin';

  const resetTimeout = useCallback(() => {
    if (!isActive) return;
    
    lastActivityRef.current = Date.now();
    
    // Store last activity time for session indicator
    if (user) {
      localStorage.setItem(`lastActivity_${user.id}`, Date.now().toString());
    }
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (5 minutes before actual timeout)
    const warningTime = Math.max((timeoutMinutes - 5) * 60 * 1000, 0);
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        const remainingTime = 5 * 60; // 5 minutes in seconds
        showSessionWarning(remainingTime);
      }, warningTime);
    }

    // Set actual timeout
    timeoutRef.current = setTimeout(() => {
      logout(() => {
        // Navigation will be handled by the component using this hook
        // or by the AuthContext's routing logic
      });
      alert('Your session has expired due to inactivity. Please log in again.');
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, logout, isActive, user]);

  const showSessionWarning = useCallback((remainingSeconds) => {
    if (!isActive) return;
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    const result = window.confirm(
      `Your session will expire in ${minutes}:${seconds.toString().padStart(2, '0')}. ` +
      'Click OK to extend your session or Cancel to logout now.'
    );

    if (result) {
      resetTimeout();
    } else {
      logout();
    }
  }, [resetTimeout, logout, isActive]);

  const handleActivity = useCallback(() => {
    if (!isActive) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if it's been more than 1 minute since last reset
    if (timeSinceLastActivity > 60 * 1000) {
      resetTimeout();
      // Store last activity time for session indicator
      if (user) {
        localStorage.setItem(`lastActivity_${user.id}`, now.toString());
      }
    }
  }, [resetTimeout, isActive, user]);

  useEffect(() => {
    if (!isActive) return;
    
    // Initialize timeout
    resetTimeout();

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleActivity, resetTimeout, isActive]);

  return {
    resetTimeout,
    getRemainingTime: () => {
      if (!isActive) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, remaining);
    }
  };
};

export default useSessionTimeout;