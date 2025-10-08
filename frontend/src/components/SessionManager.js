import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';

const SessionManager = ({ children }) => {
  const { user } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState(30); // Default 30 minutes

  // Get session timeout from user preferences or localStorage
  useEffect(() => {
    if (user) {
      const savedTimeout = localStorage.getItem(`sessionTimeout_${user.id}`) || 
                          user.sessionTimeout || 
                          30;
      setSessionTimeout(parseInt(savedTimeout));
    }
  }, [user]);

  // Only apply session timeout for regular users (not admins)
  // Admins have their own session management through AdminSessionManager
  const shouldApplyTimeout = user && user.role !== 'admin';

  // Initialize session timeout hook only for regular users
  useSessionTimeout(shouldApplyTimeout ? sessionTimeout : null);

  return <>{children}</>;
};

export default SessionManager;