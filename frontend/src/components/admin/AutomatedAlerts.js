import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  MonetizationOn as MoneyIcon,
  Login as LoginIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AutomatedAlerts = () => {
  const [config, setConfig] = useState({
    enabled: true,
    suspiciousTransactions: {
      enabled: true,
      amountThreshold: 10000,
      frequencyThreshold: 5,
      timeWindow: 60
    },
    largeTransactions: {
      enabled: true,
      threshold: 50000
    },
    failedLogins: {
      enabled: true,
      threshold: 5,
      timeWindow: 15
    },
    notifications: {
      email: true,
      dashboard: true,
      emailRecipients: []
    }
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [historyDialog, setHistoryDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    criticalAlerts: 0
  });

  useEffect(() => {
    fetchConfig();
    fetchAlertHistory();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await adminAPI.get('/alerts/config');
      if (response.data.config) {
        setConfig(response.data.config);
      }
    } catch (err) {
      setError('Failed to fetch alert configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const response = await adminAPI.get('/alerts/history?limit=10');
      setAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.get('/alerts/history?stats=true');
      setStats(response.data.stats || stats);
    } catch (err) {
      console.error('Failed to fetch alert stats:', err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await adminAPI.put('/alerts/config', config);
      setSuccess('Alert configuration saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckSuspiciousTransactions = async () => {
    try {
      setChecking(true);
      const response = await adminAPI.post('/alerts/check/suspicious-transactions');
      setSuccess(`Found ${response.data.suspiciousCount || 0} suspicious transactions`);
      fetchAlertHistory();
    } catch (err) {
      setError('Failed to check suspicious transactions');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckFailedLogins = async () => {
    try {
      setChecking(true);
      const response = await adminAPI.post('/alerts/check/failed-logins');
      setSuccess(`Found ${response.data.failedLoginCount || 0} failed login attempts`);
      fetchAlertHistory();
    } catch (err) {
      setError('Failed to check failed logins');
    } finally {
      setChecking(false);
    }
  };

  const handleSendTestAlert = async () => {
    try {
      await adminAPI.post('/alerts/send', {
        type: 'test',
        message: 'This is a test alert from the admin dashboard',
        severity: 'info'
      });
      setSuccess('Test alert sent successfully');
      setTestDialog(false);
    } catch (err) {
      setError('Failed to send test alert');
    }
  };

  const handleResetConfig = async () => {
    if (window.confirm('Are you sure you want to reset the alert configuration to defaults?')) {
      try {
        await adminAPI.post('/alerts/config/reset');
        setSuccess('Alert configuration reset to defaults');
        fetchConfig();
      } catch (err) {
        setError('Failed to reset configuration');
      }
    }
  };

  const updateConfig = (path, value) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'suspicious_transaction':
        return <WarningIcon color="warning" />;
      case 'large_transaction':
        return <MoneyIcon color="info" />;
      case 'failed_login':
        return <LoginIcon color="error" />;
      case 'security':
        return <SecurityIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading alert configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" display="flex" alignItems="center">
          <NotificationsIcon sx={{ mr: 1 }} />
          Automated Alerts
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setHistoryDialog(true)}
            sx={{ mr: 1 }}
          >
            Alert History
          </Button>
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={() => setTestDialog(true)}
            sx={{ mr: 1 }}
          >
            Test Alert
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={handleSaveConfig}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Alerts
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalAlerts}
                  </Typography>
                </Box>
                <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.activeAlerts}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.criticalAlerts}
                  </Typography>
                </Box>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Resolved Alerts
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.resolvedAlerts}
                  </Typography>
                </Box>
                <CheckIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Alert Configuration
              </Typography>

              {/* Master Enable/Disable */}
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enabled}
                    onChange={(e) => updateConfig('enabled', e.target.checked)}
                  />
                }
                label="Enable Automated Alerts"
                sx={{ mb: 3 }}
              />

              {/* Suspicious Transactions */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography display="flex" alignItems="center">
                    <WarningIcon sx={{ mr: 1 }} />
                    Suspicious Transactions
                    <Chip
                      label={config.suspiciousTransactions.enabled ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={config.suspiciousTransactions.enabled ? 'success' : 'default'}
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.suspiciousTransactions.enabled}
                            onChange={(e) => updateConfig('suspiciousTransactions.enabled', e.target.checked)}
                          />
                        }
                        label="Enable suspicious transaction alerts"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Amount Threshold ($)"
                        value={config.suspiciousTransactions.amountThreshold}
                        onChange={(e) => updateConfig('suspiciousTransactions.amountThreshold', parseFloat(e.target.value))}
                        disabled={!config.suspiciousTransactions.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Frequency Threshold"
                        value={config.suspiciousTransactions.frequencyThreshold}
                        onChange={(e) => updateConfig('suspiciousTransactions.frequencyThreshold', parseInt(e.target.value))}
                        disabled={!config.suspiciousTransactions.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Time Window (minutes)"
                        value={config.suspiciousTransactions.timeWindow}
                        onChange={(e) => updateConfig('suspiciousTransactions.timeWindow', parseInt(e.target.value))}
                        disabled={!config.suspiciousTransactions.enabled}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleCheckSuspiciousTransactions}
                        disabled={checking || !config.suspiciousTransactions.enabled}
                      >
                        {checking ? 'Checking...' : 'Check Now'}
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Large Transactions */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography display="flex" alignItems="center">
                    <MoneyIcon sx={{ mr: 1 }} />
                    Large Transactions
                    <Chip
                      label={config.largeTransactions.enabled ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={config.largeTransactions.enabled ? 'success' : 'default'}
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.largeTransactions.enabled}
                            onChange={(e) => updateConfig('largeTransactions.enabled', e.target.checked)}
                          />
                        }
                        label="Enable large transaction alerts"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Threshold Amount ($)"
                        value={config.largeTransactions.threshold}
                        onChange={(e) => updateConfig('largeTransactions.threshold', parseFloat(e.target.value))}
                        disabled={!config.largeTransactions.enabled}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Failed Logins */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography display="flex" alignItems="center">
                    <LoginIcon sx={{ mr: 1 }} />
                    Failed Login Attempts
                    <Chip
                      label={config.failedLogins.enabled ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={config.failedLogins.enabled ? 'success' : 'default'}
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.failedLogins.enabled}
                            onChange={(e) => updateConfig('failedLogins.enabled', e.target.checked)}
                          />
                        }
                        label="Enable failed login alerts"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Failure Threshold"
                        value={config.failedLogins.threshold}
                        onChange={(e) => updateConfig('failedLogins.threshold', parseInt(e.target.value))}
                        disabled={!config.failedLogins.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Time Window (minutes)"
                        value={config.failedLogins.timeWindow}
                        onChange={(e) => updateConfig('failedLogins.timeWindow', parseInt(e.target.value))}
                        disabled={!config.failedLogins.enabled}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleCheckFailedLogins}
                        disabled={checking || !config.failedLogins.enabled}
                      >
                        {checking ? 'Checking...' : 'Check Now'}
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Notification Settings */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography display="flex" alignItems="center">
                    <NotificationsIcon sx={{ mr: 1 }} />
                    Notification Settings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.notifications.email}
                            onChange={(e) => updateConfig('notifications.email', e.target.checked)}
                          />
                        }
                        label="Email Notifications"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.notifications.dashboard}
                            onChange={(e) => updateConfig('notifications.dashboard', e.target.checked)}
                          />
                        }
                        label="Dashboard Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Recipients (comma-separated)"
                        value={config.notifications.emailRecipients.join(', ')}
                        onChange={(e) => updateConfig('notifications.emailRecipients', 
                          e.target.value.split(',').map(email => email.trim()).filter(email => email)
                        )}
                        disabled={!config.notifications.email}
                        helperText="Enter email addresses separated by commas"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveConfig}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleResetConfig}
                >
                  Reset to Defaults
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Alerts</Typography>
                <Badge badgeContent={alerts.length} color="primary">
                  <HistoryIcon />
                </Badge>
              </Box>

              <List>
                {alerts.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No recent alerts" />
                  </ListItem>
                ) : (
                  alerts.slice(0, 5).map((alert, index) => (
                    <React.Fragment key={alert._id || index}>
                      <ListItem>
                        <ListItemIcon>
                          {getAlertIcon(alert.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {formatDate(alert.timestamp)}
                              </Typography>
                              <Chip
                                label={alert.severity}
                                size="small"
                                color={getAlertSeverityColor(alert.severity)}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < alerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>

              {alerts.length > 5 && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setHistoryDialog(true)}
                  sx={{ mt: 2 }}
                >
                  View All Alerts
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert History Dialog */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Alert History</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert._id}>
                    <TableCell>{formatDate(alert.timestamp)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getAlertIcon(alert.type)}
                        <Typography sx={{ ml: 1 }}>
                          {alert.type.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={getAlertSeverityColor(alert.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status || 'Active'}
                        size="small"
                        color={alert.status === 'resolved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Alert Dialog */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Alert</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will send a test alert to verify your notification settings are working correctly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)}>Cancel</Button>
          <Button onClick={handleSendTestAlert} variant="contained">
            Send Test Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomatedAlerts;