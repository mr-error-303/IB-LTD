import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionTimeoutIndicator = () => {
  const { user } = useAuth();
  const [remainingTime, setRemainingTime] = useState(null);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Only show for regular users, not admins
    if (!user || user.role === 'admin') {
      setShowIndicator(false);
      return;
    }

    const updateRemainingTime = () => {
      const sessionTimeout = localStorage.getItem(`sessionTimeout_${user.id}`) || 30;
      const lastActivity = localStorage.getItem(`lastActivity_${user.id}`);
      
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity);
        const remaining = (sessionTimeout * 60 * 1000) - elapsed;
        
        if (remaining > 0) {
          setRemainingTime(remaining);
          // Show indicator when less than 5 minutes remaining
          setShowIndicator(remaining < 5 * 60 * 1000);
        } else {
          setRemainingTime(0);
          setShowIndicator(false);
        }
      }
    };

    // Update immediately
    updateRemainingTime();

    // Update every 30 seconds
    const interval = setInterval(updateRemainingTime, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showIndicator || !remainingTime) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">
          Session expires in {formatTime(remainingTime)}
        </span>
      </div>
    </div>
  );
};

export default SessionTimeoutIndicator;