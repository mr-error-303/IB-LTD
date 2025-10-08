import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Shield,
  Activity,
  Timer,
  Bell
} from 'lucide-react';

interface SessionTimeoutProps {
  timeoutDuration?: number; // in milliseconds
  warningDuration?: number; // warning before timeout in milliseconds
  onTimeout?: () => void;
  onExtend?: () => void;
  onWarning?: () => void;
  isActive?: boolean;
}

interface SessionInfo {
  startTime: Date;
  lastActivity: Date;
  remainingTime: number;
  isWarning: boolean;
  isExpired: boolean;
}

const SessionTimeout: React.FC<SessionTimeoutProps> = ({
  timeoutDuration = 30 * 60 * 1000, // 30 minutes default
  warningDuration = 5 * 60 * 1000, // 5 minutes warning default
  onTimeout,
  onExtend,
  onWarning,
  isActive = true
}) => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    startTime: new Date(),
    lastActivity: new Date(),
    remainingTime: timeoutDuration,
    isWarning: false,
    isExpired: false
  });
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Activity events to track
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  const resetSession = useCallback(() => {
    const now = new Date();
    lastActivityRef.current = now;
    
    setSessionInfo(prev => ({
      ...prev,
      lastActivity: now,
      remainingTime: timeoutDuration,
      isWarning: false,
      isExpired: false
    }));
    
    setShowWarningModal(false);
    setShowTimeoutModal(false);
    setWarningCountdown(0);
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    if (isActive) {
      // Set warning timer
      warningRef.current = setTimeout(() => {
        setSessionInfo(prev => ({ ...prev, isWarning: true }));
        setShowWarningModal(true);
        setWarningCountdown(warningDuration / 1000);
        
        if (onWarning) onWarning();
        
        // Start countdown
        countdownRef.current = setInterval(() => {
          setWarningCountdown(prev => {
            if (prev <= 1) {
              handleTimeout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      }, timeoutDuration - warningDuration);
      
      // Set timeout timer
      timeoutRef.current = setTimeout(() => {
        handleTimeout();
      }, timeoutDuration);
    }
  }, [timeoutDuration, warningDuration, isActive, onWarning]);

  const handleTimeout = useCallback(() => {
    setSessionInfo(prev => ({ ...prev, isExpired: true }));
    setShowWarningModal(false);
    setShowTimeoutModal(true);
    
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    if (onTimeout) {
      onTimeout();
    }
  }, [onTimeout]);

  const handleActivity = useCallback(() => {
    if (!isActive || sessionInfo.isExpired) return;
    
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
    
    // Only reset if there's been significant time since last activity (throttle)
    if (timeSinceLastActivity > 1000) { // 1 second throttle
      setActivityCount(prev => prev + 1);
      resetSession();
      
      if (onExtend) {
        onExtend();
      }
    }
  }, [isActive, sessionInfo.isExpired, resetSession, onExtend]);

  const extendSession = () => {
    resetSession();
    if (onExtend) {
      onExtend();
    }
  };

  const logout = () => {
    setShowWarningModal(false);
    setShowTimeoutModal(false);
    if (onTimeout) {
      onTimeout();
    }
  };

  // Initialize session on mount
  useEffect(() => {
    if (isActive) {
      resetSession();
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isActive, resetSession]);

  // Add activity listeners
  useEffect(() => {
    if (!isActive) return;

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleActivity, isActive]);

  // Update remaining time
  useEffect(() => {
    if (!isActive || sessionInfo.isExpired) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - lastActivityRef.current.getTime();
      const remaining = Math.max(0, timeoutDuration - elapsed);
      
      setSessionInfo(prev => ({
        ...prev,
        remainingTime: remaining
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, sessionInfo.isExpired, timeoutDuration]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!isActive) return null;

  return (
    <>
      {/* Session Status Indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          sessionInfo.isWarning 
            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            sessionInfo.isWarning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          }`} />
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {formatTime(sessionInfo.remainingTime)}
          </span>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Expiring Soon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your session will expire in {warningCountdown} seconds
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(warningCountdown / (warningDuration / 1000)) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <div className="font-medium mb-1">Security Notice:</div>
                  <p>
                    For your security, we automatically log you out after periods of inactivity. 
                    Click "Stay Logged In" to continue your session.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Stay Logged In</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Timer className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Session Expired
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your session has expired for security reasons. Please log in again to continue.
              </p>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <div className="font-medium mb-1">Security Information:</div>
                    <p>
                      This automatic logout helps protect your account from unauthorized access 
                      when you're away from your device.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Go to Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Information Panel (for development/admin) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-xs space-y-2 max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white">Session Debug Info</div>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>Timeout: {formatDuration(timeoutDuration)}</div>
            <div>Warning: {formatDuration(warningDuration)}</div>
            <div>Started: {sessionInfo.startTime.toLocaleTimeString()}</div>
            <div>Last Activity: {sessionInfo.lastActivity.toLocaleTimeString()}</div>
            <div>Activity Count: {activityCount}</div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Status: {sessionInfo.isExpired ? 'Expired' : sessionInfo.isWarning ? 'Warning' : 'Active'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimeout;