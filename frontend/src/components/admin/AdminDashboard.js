import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  useTheme,
  ThemeProvider,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAdminWebSocket } from '../../hooks/useWebSocket';
import DashboardCards, { SystemHealthCards } from './DashboardCards';
import DataTable from './DataTable';
import { adminTheme, adminDarkTheme } from '../../styles/AdminTheme';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import AdminSessionManager from './AdminSessionManager';
import BalanceControl from './BalanceControl';
import BalanceHistory from './BalanceHistory';
import TransactionVerification from './TransactionVerification';
import DepositRequestManagement from './DepositRequestManagement';
import WithdrawalRequestManagement from './WithdrawalRequestManagement';
import TransactionComments from './TransactionComments';
import RoleManagement from './RoleManagement';
import ActivityLogs from './ActivityLogs';
import AutomatedAlerts from './AutomatedAlerts';
import BulkActions from './BulkActions';
import AdvancedSearch from './AdvancedSearch';
import './AdminDashboard.css';

const AdminDashboard = ({ darkMode = false }) => {
  const { user, logout } = useAuth();
  const { performSecureOperation, getSecurityStatus, sessionLocked } = useAdminSecurity();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    pendingRequests: 0,
    systemHealth: 'good',
    recentActivity: []
  });
  // WebSocket for real-time updates
  const {
    isConnected,
    connectionStatus,
    dashboardStats: wsStats,
    recentActivities: wsActivities,
    systemHealth: wsSystemHealth,
    notifications,
    clearNotifications,
    removeNotification,
    refreshDashboardStats,
    refreshActivities,
    refreshSystemHealth
  } = useAdminWebSocket();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();

  // Enhanced navigation with loading state
  const handleNavigateWithLoading = async (path, buttonId) => {
    setButtonLoading(prev => ({ ...prev, [buttonId]: true }));
    
    // Immediate visual feedback
    setTimeout(() => {
      navigate(path);
      setButtonLoading(prev => ({ ...prev, [buttonId]: false }));
    }, 100); // Minimal delay for visual feedback
  };

  // Enhanced fetch with immediate feedback
  const handleRefreshWithLoading = async () => {
    setButtonLoading(prev => ({ ...prev, refresh: true }));
    await fetchDashboardData();
    setButtonLoading(prev => ({ ...prev, refresh: false }));
  };

  // Sample data for demonstration
  const sampleStats = {
    totalUsers: 15420,
    activeUsers: 8932,
    totalBalance: 2847392.50,
    todayTransactions: 1247,
    pendingTransactions: 23,
    securityAlerts: 2,
    userGrowth: 12.5,
    activeUserGrowth: 8.3,
    balanceChange: 5.2,
    transactionGrowth: -2.1,
    pendingChange: 15.7,
    alertChange: -50.0,
  };

  const sampleHealthData = {
    systemStatus: 'healthy',
    databaseStatus: 'good',
    securityStatus: 'warning',
    apiStatus: 'healthy',
  };

  const userColumns = [
    {
      field: 'avatar',
      headerName: '',
      type: 'avatar',
      width: 60,
      sortable: false,
    },
    {
      field: 'username',
      headerName: 'Username',
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 200,
    },
    {
      field: 'balance',
      headerName: 'Balance',
      type: 'currency',
      align: 'right',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      width: 100,
      chipColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'active': return 'success';
          case 'suspended': return 'error';
          case 'pending': return 'warning';
          default: return 'default';
        }
      },
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      type: 'datetime',
      width: 180,
    },
  ];

  const transactionColumns = [
    {
      field: 'id',
      headerName: 'Transaction ID',
      width: 120,
    },
    {
      field: 'type',
      headerName: 'Type',
      type: 'chip',
      width: 100,
      chipColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'deposit': return 'success';
          case 'withdrawal': return 'warning';
          case 'transfer': return 'info';
          default: return 'default';
        }
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'currency',
      align: 'right',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      width: 100,
      chipColor: (value) => {
        switch (value?.toLowerCase()) {
          case 'completed': return 'success';
          case 'pending': return 'warning';
          case 'failed': return 'error';
          default: return 'default';
        }
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      type: 'datetime',
      width: 180,
    },
  ];

  // Update state when WebSocket data changes
  useEffect(() => {
    if (wsStats) {
      setStats(wsStats);
    }
  }, [wsStats]);

  useEffect(() => {
    if (wsActivities && wsActivities.length > 0) {
      setRecentActivities(wsActivities);
    }
  }, [wsActivities]);

  useEffect(() => {
    if (wsSystemHealth) {
      setSystemHealth(wsSystemHealth);
    }
  }, [wsSystemHealth]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch real dashboard stats from backend
      try {
        const [dashboardRes, usersRes, transactionsRes] = await Promise.all([
          fetch('/api/admin/stats/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          if (dashboardData.success) {
            // Map backend response to frontend expected format
            const mappedStats = {
              totalUsers: dashboardData.data.users?.total || 0,
              activeUsers: dashboardData.data.users?.active || 0,
              totalBalance: dashboardData.data.financial?.deposits?.total || 0,
              pendingRequests: dashboardData.data.users?.newUsers || 0,
              systemHealth: 'good'
            };
            setStats(mappedStats);
            setDashboardData(prev => ({
              ...prev,
              ...mappedStats
            }));
          }
        } else {
          console.error('Dashboard API error:', dashboardRes.status, dashboardRes.statusText);
          // Use WebSocket data or fallback to sample data
          setStats(wsStats || sampleStats);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success) {
            setRecentUsers(usersData.data?.users?.slice(0, 5) || []);
          }
        } else {
          // Fallback to sample data
          setRecentUsers([
            { id: 1, username: 'john_doe', email: 'john@example.com', balance: 1250.00, status: 'active', lastLogin: '2024-01-15 10:30' },
            { id: 2, username: 'jane_smith', email: 'jane@example.com', balance: 890.50, status: 'active', lastLogin: '2024-01-15 09:15' },
            { id: 3, username: 'bob_wilson', email: 'bob@example.com', balance: 2100.75, status: 'inactive', lastLogin: '2024-01-14 16:45' },
          ]);
        }

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          if (transactionsData.success) {
            setRecentTransactions(transactionsData.data?.transactions?.slice(0, 5) || []);
          }
        } else {
          // Fallback to sample data
          setRecentTransactions([
            { id: 1, user: 'john_doe', type: 'deposit', amount: 500.00, status: 'completed', date: '2024-01-15 11:00' },
            { id: 2, user: 'jane_smith', type: 'withdrawal', amount: -200.00, status: 'pending', date: '2024-01-15 10:45' },
            { id: 3, user: 'bob_wilson', type: 'transfer', amount: -150.00, status: 'completed', date: '2024-01-15 09:30' },
          ]);
        }

        // Set system health and activities
        setRecentActivities(wsActivities || []);
        setSystemHealth(wsSystemHealth || sampleHealthData);
        
      } catch (apiError) {
        console.error('Dashboard data fetch error:', apiError);
        console.log('API not available, using WebSocket data or sample data');
        setStats(wsStats || sampleStats);
        setRecentActivities(wsActivities || []);
        setSystemHealth(wsSystemHealth || sampleHealthData);
        
        // Set fallback data
        setRecentUsers([
          { id: 1, username: 'john_doe', email: 'john@example.com', balance: 1250.00, status: 'active', lastLogin: '2024-01-15 10:30' },
          { id: 2, username: 'jane_smith', email: 'jane@example.com', balance: 890.50, status: 'active', lastLogin: '2024-01-15 09:15' },
          { id: 3, username: 'bob_wilson', email: 'bob@example.com', balance: 2100.75, status: 'inactive', lastLogin: '2024-01-14 16:45' },
        ]);
        
        setRecentTransactions([
          { id: 1, user: 'john_doe', type: 'deposit', amount: 500.00, status: 'completed', date: '2024-01-15 11:00' },
          { id: 2, user: 'jane_smith', type: 'withdrawal', amount: -200.00, status: 'pending', date: '2024-01-15 10:45' },
          { id: 3, user: 'bob_wilson', type: 'transfer', amount: -150.00, status: 'completed', date: '2024-01-15 09:30' },
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use sample data as fallback
      setStats(sampleStats);
      setSystemHealth(sampleHealthData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle card clicks
  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'Total Users':
        navigate('/admin/users');
        break;
      case 'Active Users':
        navigate('/admin/users?filter=active');
        break;
      case 'Total Balance':
        navigate('/admin/transactions');
        break;
      case 'Transactions Today':
        navigate('/admin/transactions?filter=today');
        break;
      case 'Pending Transactions':
        navigate('/admin/transactions?filter=pending');
        break;
      case 'Security Alerts':
        navigate('/admin/security/alerts');
        break;
      default:
        console.log('Card clicked:', cardType);
    }
  };

  // Handle user operations
  const handleUserOperation = async (operation, userId, data = {}) => {
    try {
      await performSecureOperation(operation, async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}/${operation}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('Operation failed');
        }
        
        // Refresh data
        fetchUsers();
        fetchDashboardData();
        
        return await response.json();
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Export users data
  const exportUsers = async () => {
    try {
      await performSecureOperation('user_export', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users/export', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
      fetchUsers();
    }
  }, [user]);

  if (sessionLocked) {
    return (
      <div className="admin-locked">
        <div className="lock-message">
          <h2>🔒 Session Locked</h2>
          <p>Your admin session has been locked due to security reasons.</p>
          <p>Please wait or contact system administrator.</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{dashboardData.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{dashboardData.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${dashboardData.totalBalance?.toLocaleString()}</h3>
            <p>Total Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{dashboardData.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      <div className="system-health">
        <h3>System Health</h3>
        <div className={`health-indicator ${dashboardData.systemHealth}`}>
          <span className="health-dot"></span>
          {dashboardData.systemHealth.toUpperCase()}
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {dashboardData.recentActivity?.map((activity, index) => (
            <div key={`${activity.timestamp}-${index}`} className="activity-item">
              <span className="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
              <span className="activity-description">{activity.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <div className="users-header">
        <h3>User Management</h3>
        <div className="users-actions">
          <button onClick={exportUsers} className="btn btn-secondary">
            📊 Export Users
          </button>
          <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
            ➕ Add User
          </button>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user._id.slice(-6)}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>${user.balance?.toLocaleString() || '0'}</td>
                <td>
                  <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="user-actions">
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleUserOperation('toggle_status', user._id)}
                      className="btn btn-sm btn-warning"
                    >
                      {user.isActive ? '⏸️ Suspend' : '▶️ Activate'}
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this user?')) {
                          handleUserOperation('user_delete', user._id);
                        }
                      }}
                      className="btn btn-sm btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <h3>System Settings</h3>
      <div className="settings-grid">
        <div className="setting-group">
          <h4>Security Settings</h4>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input type="number" defaultValue="30" />
          </div>
          <div className="setting-item">
            <label>Max Login Attempts</label>
            <input type="number" defaultValue="3" />
          </div>
          <div className="setting-item">
            <label>Require 2FA for Admin</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>

        <div className="setting-group">
          <h4>System Configuration</h4>
          <div className="setting-item">
            <label>Maintenance Mode</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Registration Enabled</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => handleUserOperation('system_settings', 'update')}
        className="btn btn-primary"
      >
        💾 Save Settings
      </button>
    </div>
  );

  const renderModernOverview = () => (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={buttonLoading.refresh ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefreshWithLoading}
          disabled={loading || buttonLoading.refresh}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 2
            }
          }}
        >
          {buttonLoading.refresh ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <DashboardCards 
        stats={stats} 
        loading={loading} 
        onCardClick={handleCardClick}
      />

      {/* System Health */}
      <SystemHealthCards healthData={systemHealth} loading={loading} />

      {/* Recent Data Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <DataTable
            title="Recent Users"
            data={recentUsers}
            columns={userColumns}
            loading={loading}
            serverSide={false}
            page={0}
            rowsPerPage={5}
            totalCount={recentUsers.length}
            actions={[
              {
                label: buttonLoading[`user-view`] ? 'Loading...' : 'View',
                icon: buttonLoading[`user-view`] ? <CircularProgress size={16} /> : <SecurityIcon fontSize="small" />,
                onClick: (user) => handleNavigateWithLoading(`/admin/users/${user.id}`, `user-view-${user.id}`),
                disabled: buttonLoading[`user-view`]
              },
              {
                label: buttonLoading[`user-edit`] ? 'Loading...' : 'Edit',
                icon: buttonLoading[`user-edit`] ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />,
                onClick: (user) => handleNavigateWithLoading(`/admin/users/${user.id}/edit`, `user-edit-${user.id}`),
                disabled: buttonLoading[`user-edit`]
              }
            ]}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <DataTable
            title="Recent Transactions"
            data={recentTransactions}
            columns={transactionColumns}
            loading={loading}
            serverSide={false}
            page={0}
            rowsPerPage={5}
            totalCount={recentTransactions.length}
            actions={[
              {
                label: buttonLoading[`transaction-view`] ? 'Loading...' : 'View Details',
                icon: buttonLoading[`transaction-view`] ? <CircularProgress size={16} /> : <AssessmentIcon fontSize="small" />,
                onClick: (transaction) => handleNavigateWithLoading(`/admin/transactions/${transaction.id}`, `transaction-view-${transaction.id}`),
                disabled: buttonLoading[`transaction-view`]
              }
            ]}
          />
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Activities
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.200' }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ width: '40%', height: 12, bgcolor: 'grey.100', borderRadius: 1 }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : recentActivities.length > 0 ? (
          <List>
            {recentActivities.map((activity, index) => (
              <ListItem key={index} divider={index < recentActivities.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {activity.type === 'user' ? <PeopleIcon /> : 
                     activity.type === 'security' ? <SecurityIcon /> : 
                     <AssessmentIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.description}
                  secondary={new Date(activity.timestamp).toLocaleString()}
                />
                <Chip
                  label={activity.severity || 'info'}
                  size="small"
                  color={
                    activity.severity === 'high' ? 'error' :
                    activity.severity === 'medium' ? 'warning' : 'info'
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No recent activities
          </Typography>
        )}
      </Paper>
    </Box>
  );

  return (
    <ThemeProvider theme={darkMode ? adminDarkTheme : adminTheme}>
      <AdminSessionManager>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {renderModernOverview()}
        </Container>
      </AdminSessionManager>
    </ThemeProvider>
  );
};
  
  export default AdminDashboard;