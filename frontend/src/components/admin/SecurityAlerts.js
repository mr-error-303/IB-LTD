import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Badge,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  NotificationsActive as AlertIcon,
  Shield as ShieldIcon,
  VpnLock as VpnIcon,
  Computer as DeviceIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Fingerprint as FingerprintIcon,
  PhoneAndroid as MobileIcon,
  Email as EmailIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const SecurityAlerts = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter states
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    status: '',
    dateFrom: null,
    dateTo: null
  });

  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAlert, setMenuAlert] = useState(null);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    loginAttempts: true,
    suspiciousActivity: true,
    newDeviceLogin: true,
    passwordChanges: true,
    accountLockouts: true,
    privilegeEscalation: true,
    dataAccess: true,
    systemChanges: true,
    emailNotifications: true,
    smsNotifications: false,
    realTimeMonitoring: true
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    pending: 0,
    todayAlerts: 0,
    weeklyTrend: 0
  });

  // Real-time monitoring
  const [monitoringData, setMonitoringData] = useState({
    activeThreats: 0,
    blockedIPs: 0,
    suspiciousLogins: 0,
    failedAttempts: 0,
    systemHealth: 'good'
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
    fetchMonitoringData();
    fetchSecuritySettings();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [page, rowsPerPage, filters, activeTab]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Use placeholder data for security alerts
      const sampleAlerts = [
        {
          id: 'ALT001',
          type: 'login_attempt',
          severity: 'high',
          status: 'active',
          title: 'Multiple Failed Login Attempts',
          description: 'User account john_doe has 5 failed login attempts from IP 192.168.1.100',
          userId: 'user123',
          username: 'john_doe',
          ipAddress: '192.168.1.100',
          location: 'New York, US',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:35:00Z',
          metadata: {
            attemptCount: 5,
            timeWindow: '5 minutes',
            lastAttempt: '2024-01-15T10:35:00Z'
          }
        },
        {
          id: 'ALT002',
          type: 'suspicious_activity',
          severity: 'medium',
          status: 'investigating',
          title: 'Unusual Transaction Pattern',
          description: 'Large transaction volume detected for user account',
          userId: 'user456',
          username: 'jane_smith',
          ipAddress: '203.0.113.1',
          location: 'London, UK',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          createdAt: '2024-01-15T09:15:00Z',
          updatedAt: '2024-01-15T09:20:00Z',
          metadata: {
            transactionCount: 15,
            totalAmount: 50000,
            timeWindow: '1 hour'
          }
        },
        {
          id: 'ALT003',
          type: 'new_device',
          severity: 'low',
          status: 'resolved',
          title: 'New Device Login',
          description: 'Login from new device detected',
          userId: 'user789',
          username: 'bob_wilson',
          ipAddress: '198.51.100.1',
          location: 'Toronto, CA',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          createdAt: '2024-01-15T08:45:00Z',
          updatedAt: '2024-01-15T08:50:00Z',
          metadata: {
            deviceType: 'mobile',
            deviceName: 'iPhone 15',
            verified: true
          }
        }
      ];
      
      setAlerts(sampleAlerts);
      setTotalCount(sampleAlerts.length);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      setMessage({ type: 'error', text: 'Failed to load security alerts' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use placeholder stats data
      setStats({
        total: 247,
        critical: 12,
        high: 35,
        medium: 89,
        low: 111,
        resolved: 198,
        pending: 49,
        todayAlerts: 23,
        weeklyTrend: 15.2
      });
    } catch (error) {
      console.error('Error fetching security stats:', error);
    }
  };

  const fetchMonitoringData = async () => {
    try {
      // Use placeholder monitoring data
      setMonitoringData({
        activeThreats: 3,
        blockedIPs: 127,
        suspiciousLogins: 8,
        failedAttempts: 45,
        systemHealth: 'good'
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      // Use placeholder data for security settings
      setSecuritySettings({
        loginAttempts: true,
        suspiciousActivity: true,
        newDeviceLogin: true,
        passwordChanges: true,
        accountLockouts: true,
        privilegeEscalation: true,
        dataAccess: true,
        systemChanges: true,
        emailNotifications: true,
        smsNotifications: false,
        realTimeMonitoring: true
      });
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const getTabFilter = () => {
    switch (activeTab) {
      case 1: return 'critical';
      case 2: return 'high';
      case 3: return 'medium';
      case 4: return 'resolved';
      default: return 'all';
    }
  };

  const handleMenuOpen = (event, alert) => {
    setAnchorEl(event.currentTarget);
    setMenuAlert(alert);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAlert(null);
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      // Simulate API call - show success message
      setMessage({ type: 'success', text: `Alert ${action}d successfully` });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to ${action} alert` });
    }
    handleMenuClose();
  };

  const handleSettingsUpdate = async () => {
    try {
      // Simulate API call - show success message
      setMessage({ type: 'success', text: 'Security settings updated successfully' });
      setSettingsDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update security settings' });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <WarningIcon />;
      case 'medium': return <InfoIcon />;
      case 'low': return <CheckCircleIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'login_attempt': return <LockIcon />;
      case 'suspicious_activity': return <ShieldIcon />;
      case 'new_device': return <DeviceIcon />;
      case 'privilege_escalation': return <KeyIcon />;
      case 'data_access': return <FingerprintIcon />;
      case 'system_change': return <SettingsIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.total.toLocaleString()}</Typography>
                <Typography color="text.secondary">Total Alerts</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ErrorIcon color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.critical.toLocaleString()}</Typography>
                <Typography color="text.secondary">Critical</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertIcon color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.pending.toLocaleString()}</Typography>
                <Typography color="text.secondary">Pending</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.resolved.toLocaleString()}</Typography>
                <Typography color="text.secondary">Resolved</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMonitoringDashboard = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Real-time Security Monitoring</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error">{monitoringData.activeThreats}</Typography>
                  <Typography variant="body2">Active Threats</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning">{monitoringData.blockedIPs}</Typography>
                  <Typography variant="body2">Blocked IPs</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info">{monitoringData.suspiciousLogins}</Typography>
                  <Typography variant="body2">Suspicious Logins</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">{monitoringData.failedAttempts}</Typography>
                  <Typography variant="body2">Failed Attempts</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>System Health</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShieldIcon color={getHealthColor(monitoringData.systemHealth)} sx={{ mr: 1 }} />
              <Typography variant="h6" color={getHealthColor(monitoringData.systemHealth)}>
                {monitoringData.systemHealth.toUpperCase()}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={monitoringData.systemHealth === 'good' ? 85 : 60} 
              color={getHealthColor(monitoringData.systemHealth)}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Security Score: {monitoringData.systemHealth === 'good' ? '85/100' : '60/100'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAlertsTable = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Security Alerts</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsDialog(true)}
              sx={{ mr: 1 }}
            >
              Settings
            </Button>
            <IconButton onClick={fetchAlerts}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Severity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No security alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(alert.type)}
                        <Typography sx={{ ml: 1 }}>
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>{alert.username}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        {alert.location}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status}
                        color={alert.status === 'resolved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, alert)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Security Alerts & Monitoring
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {renderStatsCards()}
      {renderMonitoringDashboard()}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Alerts" />
          <Tab 
            label={
              <Badge badgeContent={stats.critical} color="error">
                Critical
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.high} color="warning">
                High
              </Badge>
            } 
          />
          <Tab label="Medium" />
          <Tab label="Resolved" />
        </Tabs>
      </Paper>

      {renderAlertsTable()}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewAlert(menuAlert)}>
          <ViewIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {menuAlert?.status !== 'resolved' && (
          <MenuItem onClick={() => handleAlertAction(menuAlert.id, 'resolve')}>
            <CheckCircleIcon sx={{ mr: 1 }} /> Mark Resolved
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAlertAction(menuAlert.id, 'block')}>
          <BlockIcon sx={{ mr: 1 }} /> Block User/IP
        </MenuItem>
        <MenuItem onClick={() => handleAlertAction(menuAlert.id, 'delete')}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Alert
        </MenuItem>
      </Menu>

      {/* View Alert Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Security Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={getSeverityIcon(selectedAlert.severity)}
                    label={selectedAlert.severity}
                    color={getSeverityColor(selectedAlert.severity)}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6">{selectedAlert.title}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAlert.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Alert ID</Typography>
                <Typography>{selectedAlert.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Type</Typography>
                <Typography>{selectedAlert.type.replace('_', ' ').toUpperCase()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">User</Typography>
                <Typography>{selectedAlert.username}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">IP Address</Typography>
                <Typography>{selectedAlert.ipAddress}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Location</Typography>
                <Typography>{selectedAlert.location}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedAlert.status}
                  color={selectedAlert.status === 'resolved' ? 'success' : 'warning'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">User Agent</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {selectedAlert.userAgent}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Created At</Typography>
                <Typography>{new Date(selectedAlert.createdAt).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Updated At</Typography>
                <Typography>{new Date(selectedAlert.updatedAt).toLocaleString()}</Typography>
              </Grid>
              {selectedAlert.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Additional Information</Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(selectedAlert.metadata).map(([key, value]) => (
                      <Typography key={key} variant="body2">
                        <strong>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {value}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          {selectedAlert?.status !== 'resolved' && (
            <Button 
              onClick={() => {
                handleAlertAction(selectedAlert.id, 'resolve');
                setViewDialog(false);
              }}
              variant="contained"
            >
              Mark Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Security Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Security Alert Settings</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Alert Types</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: e.target.checked }))}
                  />
                }
                label="Failed Login Attempts"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.suspiciousActivity}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, suspiciousActivity: e.target.checked }))}
                  />
                }
                label="Suspicious Activity"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.newDeviceLogin}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, newDeviceLogin: e.target.checked }))}
                  />
                }
                label="New Device Logins"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.passwordChanges}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordChanges: e.target.checked }))}
                  />
                }
                label="Password Changes"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.accountLockouts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, accountLockouts: e.target.checked }))}
                  />
                }
                label="Account Lockouts"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.privilegeEscalation}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, privilegeEscalation: e.target.checked }))}
                  />
                }
                label="Privilege Escalation"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>Notifications</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.smsNotifications}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.realTimeMonitoring}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, realTimeMonitoring: e.target.checked }))}
                  />
                }
                label="Real-time Monitoring"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleSettingsUpdate} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityAlerts;