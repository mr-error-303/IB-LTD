import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SessionManager from './components/SessionManager';
import SessionTimeoutIndicator from './components/SessionTimeoutIndicator';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import BillPayment from './pages/BillPayment';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminSecurityProvider from './components/admin/AdminSecurityProvider';
import UserList from './components/admin/UserList';
import UserDetail from './components/admin/UserDetail';
import ProfileSettings from './pages/ProfileSettings';
import AdminProfileSettings from './components/admin/ProfileSettings';
import AdminSecuritySettings from './components/admin/SecuritySettings';
import TransactionManagement from './components/admin/TransactionManagement';
import SecurityAlerts from './components/admin/SecurityAlerts';
// New admin pages
import AllUsers from './pages/AllUsers';
import RoleManagement from './pages/RoleManagement';
import ActivityLogs from './pages/ActivityLogs';
import AdminTransactions from './pages/AdminTransactions';
import Analytics from './pages/Analytics';
import SecurityOverview from './pages/SecurityOverview';
import AnomalyDetection from './pages/AnomalyDetection';
import IPWhitelist from './pages/IPWhitelist';
import TwoFactorManagement from './pages/TwoFactorManagement';
import AdminProfileSettingsPage from './pages/AdminProfileSettings';
import SecuritySettings from './pages/SecuritySettings';
import SystemSettings from './pages/SystemSettings';
import Transactions from './pages/Transactions';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Account from './pages/Account';
import Profile from './pages/Profile';
import Beneficiaries from './pages/Beneficiaries';
import MobileRecharge from './pages/MobileRecharge';
import NPSBTransfer from './pages/NPSBTransfer';
import BEFTNTransfer from './pages/BEFTNTransfer';
import MobileWalletTransfer from './pages/MobileWalletTransfer';
import QRPayment from './pages/QRPayment';
import AddMoney from './pages/AddMoney';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Don't redirect if user is not authenticated
  if (!isAuthenticated) {
    return children;
  }

  // Redirect admin users to admin dashboard, regular users to dashboard
  const redirectPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  return <Navigate to={redirectPath} replace />;
};

function App() {
  // Dark mode state management
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('adminDarkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Dark mode toggle handler
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <Router>
        <SessionManager />
        <SessionTimeoutIndicator />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/bill-payment" element={<ProtectedRoute><BillPayment /></ProtectedRoute>} />
          <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
          <Route path="/mobile-recharge" element={<ProtectedRoute><MobileRecharge /></ProtectedRoute>} />
          <Route path="/npsb-transfer" element={<ProtectedRoute><NPSBTransfer /></ProtectedRoute>} />
          <Route path="/beftn-transfer" element={<ProtectedRoute><BEFTNTransfer /></ProtectedRoute>} />
          <Route path="/mobile-wallet-transfer" element={<ProtectedRoute><MobileWalletTransfer /></ProtectedRoute>} />
          <Route path="/qr-payment" element={<ProtectedRoute><QRPayment /></ProtectedRoute>} />
          <Route path="/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Admin Dashboard"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <AdminDashboard darkMode={darkMode} />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="All Users"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <AllUsers />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/roles" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Role Management"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <RoleManagement />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/activity" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Activity Logs"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <ActivityLogs />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/transactions" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Transactions"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <AdminTransactions />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Analytics"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <Analytics />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/security/alerts" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Security Alerts"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <SecurityAlerts />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/security/overview" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Security Overview"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <SecurityOverview />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/security/anomaly-detection" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Anomaly Detection"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <AnomalyDetection />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/security/ip-whitelist" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="IP Whitelist"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <IPWhitelist />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/security/2fa" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="2FA Management"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <TwoFactorManagement />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/profile" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Profile Settings"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <AdminProfileSettingsPage />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/security" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="Security Settings"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <SecuritySettings />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/system" element={
            <ProtectedRoute>
              <AdminSecurityProvider>
                <AdminLayout
                  title="System Settings"
                  notifications={[]}
                  onClearNotifications={() => {}}
                  onRemoveNotification={() => {}}
                  connectionStatus="Connected"
                  isConnected={true}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                >
                  <SystemSettings />
                </AdminLayout>
              </AdminSecurityProvider>
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;