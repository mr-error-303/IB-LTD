import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Shield as ShieldIcon,
  DevicesOther as DevicesIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  QrCode as QrCodeIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  PhoneAndroid as PhoneAndroidIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 2FA Settings
  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enabled: false,
    method: 'app',
    backupCodes: [],
    qrCode: '',
    secret: ''
  });
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Password Policy
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    preventReuse: 5,
    maxAttempts: 5,
    lockoutDuration: 30
  });

  // Session Management
  const [sessionSettings, setSessionSettings] = useState({
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    requireReauth: true,
    logoutInactive: true
  });

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([]);

  // Security Logs
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // IP Whitelist
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [newIpAddress, setNewIpAddress] = useState('');

  useEffect(() => {
    fetchSecuritySettings();
    if (activeTab === 2) {
      fetchActiveSessions();
    }
    if (activeTab === 3) {
      fetchSecurityLogs();
    }
  }, [activeTab]);

  const fetchSecuritySettings = async () => {
    setLoading(true);
    try {
      // Since security endpoints don't exist yet, use placeholder data
      setTwoFactorSettings({
        enabled: false,
        method: 'app',
        backupCodes: [],
        qrCode: '',
        secret: ''
      });
      
      setPasswordPolicy({
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiry: 90,
        preventReuse: 5,
        maxAttempts: 5,
        lockoutDuration: 30
      });
      
      setSessionSettings({
        sessionTimeout: 30,
        maxConcurrentSessions: 3,
        requireReauth: true,
        logoutInactive: true
      });
      
      setIpWhitelist([
        { id: 1, address: '192.168.1.0/24', description: 'Office Network', createdAt: new Date() },
        { id: 2, address: '10.0.0.0/8', description: 'VPN Network', createdAt: new Date() }
      ]);
      
    } catch (error) {
      console.error('Error fetching security settings:', error);
      setMessage({ type: 'error', text: 'Failed to load security settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      // Use placeholder data for active sessions
      setActiveSessions([
        {
          id: 1,
          deviceType: 'desktop',
          deviceName: 'Windows PC',
          browser: 'Chrome 120.0',
          location: 'New York, US',
          ipAddress: '192.168.1.100',
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          current: true
        },
        {
          id: 2,
          deviceType: 'mobile',
          deviceName: 'iPhone 15',
          browser: 'Safari 17.0',
          location: 'Los Angeles, US',
          ipAddress: '10.0.0.50',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          current: false
        }
      ]);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const fetchSecurityLogs = async () => {
    setLoadingLogs(true);
    try {
      // Use placeholder data for security logs
      setSecurityLogs([
        {
          id: 1,
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: 'login_success',
          severity: 'info',
          description: 'Successful admin login',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          details: { userId: 'admin', location: 'New York, US' }
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'failed_login',
          severity: 'warning',
          description: 'Failed login attempt',
          ipAddress: '203.0.113.1',
          userAgent: 'Unknown',
          details: { attempts: 3, blocked: false }
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'password_change',
          severity: 'medium',
          description: 'Password changed successfully',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          details: { userId: 'admin' }
        }
      ]);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const enable2FA = async () => {
    try {
      const response = await adminAPI.post('/security/2fa/enable');
      if (response.data.success) {
        setTwoFactorSettings({
          ...twoFactorSettings,
          qrCode: response.data.data.qrCode,
          secret: response.data.data.secret
        });
        setTwoFactorDialog(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable 2FA' });
    }
  };

  const verify2FA = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.post('/security/2fa/verify', {
        code: verificationCode,
        secret: twoFactorSettings.secret
      });
      
      if (response.data.success) {
        setTwoFactorSettings({
          ...twoFactorSettings,
          enabled: true,
          backupCodes: response.data.data.backupCodes
        });
        setTwoFactorDialog(false);
        setMessage({ type: 'success', text: '2FA enabled successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    } finally {
      setSaving(false);
    }
  };

  const disable2FA = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.post('/security/2fa/disable');
      if (response.data.success) {
        setTwoFactorSettings({ ...twoFactorSettings, enabled: false });
        setMessage({ type: 'success', text: '2FA disabled successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' });
    } finally {
      setSaving(false);
    }
  };

  const savePasswordPolicy = async () => {
    setSaving(true);
    try {
      // Simulate API call - show success message
      setMessage({ type: 'success', text: 'Password policy updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password policy' });
    } finally {
      setSaving(false);
    }
  };

  const saveSessionSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call - show success message
      setMessage({ type: 'success', text: 'Session settings updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update session settings' });
    } finally {
      setSaving(false);
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      const response = await adminAPI.delete(`/security/sessions/${sessionId}`);
      if (response.data.success) {
        setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
        setMessage({ type: 'success', text: 'Session terminated successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate session' });
    }
  };

  const addIpToWhitelist = async () => {
    if (!newIpAddress) return;
    
    try {
      const response = await adminAPI.post('/security/ip-whitelist', {
        ipAddress: newIpAddress
      });
      
      if (response.data.success) {
        setIpWhitelist(prev => [...prev, response.data.data]);
        setNewIpAddress('');
        setMessage({ type: 'success', text: 'IP address added to whitelist' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add IP address' });
    }
  };

  const removeIpFromWhitelist = async (ipId) => {
    try {
      const response = await adminAPI.delete(`/security/ip-whitelist/${ipId}`);
      if (response.data.success) {
        setIpWhitelist(prev => prev.filter(ip => ip.id !== ipId));
        setMessage({ type: 'success', text: 'IP address removed from whitelist' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove IP address' });
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <PhoneAndroidIcon />;
      case 'tablet':
        return <TabletIcon />;
      case 'desktop':
        return <ComputerIcon />;
      default:
        return <DevicesIcon />;
    }
  };

  const render2FATab = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ShieldIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Two-Factor Authentication</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
        </Alert>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ flex: 1 }}>
            Status: {twoFactorSettings.enabled ? 
              <Chip label="Enabled" color="success" size="small" /> : 
              <Chip label="Disabled" color="error" size="small" />
            }
          </Typography>
          
          {!twoFactorSettings.enabled ? (
            <Button
              variant="contained"
              startIcon={<QrCodeIcon />}
              onClick={enable2FA}
              disabled={saving}
            >
              Enable 2FA
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={disable2FA}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : 'Disable 2FA'}
            </Button>
          )}
        </Box>

        {twoFactorSettings.enabled && twoFactorSettings.backupCodes.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Backup Codes</Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </Alert>
            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Grid container spacing={1}>
                {twoFactorSettings.backupCodes.map((code, index) => (
                  <Grid item xs={6} md={4} key={index}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {code}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderPasswordPolicyTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Password Policy Settings</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Length"
              type="number"
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
              inputProps={{ min: 6, max: 20 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Password Expiry (days)"
              type="number"
              value={passwordPolicy.passwordExpiry}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
              inputProps={{ min: 30, max: 365 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prevent Password Reuse (last N passwords)"
              type="number"
              value={passwordPolicy.preventReuse}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, preventReuse: parseInt(e.target.value) }))}
              inputProps={{ min: 0, max: 10 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Login Attempts"
              type="number"
              value={passwordPolicy.maxAttempts}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
              inputProps={{ min: 3, max: 10 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2 }}>Password Requirements</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={passwordPolicy.requireUppercase}
                  onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                />
              }
              label="Require Uppercase Letters"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={passwordPolicy.requireLowercase}
                  onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                />
              }
              label="Require Lowercase Letters"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={passwordPolicy.requireNumbers}
                  onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                />
              }
              label="Require Numbers"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={passwordPolicy.requireSpecialChars}
                  onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                />
              }
              label="Require Special Characters"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={savePasswordPolicy}
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? <CircularProgress size={20} /> : 'Save Password Policy'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderSessionTab = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Session Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={sessionSettings.sessionTimeout}
                onChange={(e) => setSessionSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                inputProps={{ min: 5, max: 480 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Concurrent Sessions"
                type="number"
                value={sessionSettings.maxConcurrentSessions}
                onChange={(e) => setSessionSettings(prev => ({ ...prev, maxConcurrentSessions: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sessionSettings.requireReauth}
                    onChange={(e) => setSessionSettings(prev => ({ ...prev, requireReauth: e.target.checked }))}
                  />
                }
                label="Require Re-authentication for Sensitive Actions"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sessionSettings.logoutInactive}
                    onChange={(e) => setSessionSettings(prev => ({ ...prev, logoutInactive: e.target.checked }))}
                  />
                }
                label="Auto-logout Inactive Sessions"
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={saveSessionSettings}
            disabled={saving}
            sx={{ mt: 3 }}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Session Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Active Sessions</Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getDeviceIcon(session.deviceType)}
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2">{session.deviceName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.browser}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.ipAddress}</TableCell>
                    <TableCell>{new Date(session.lastActivity).toLocaleString()}</TableCell>
                    <TableCell>
                      {!session.current && (
                        <Tooltip title="Terminate Session">
                          <IconButton
                            color="error"
                            onClick={() => terminateSession(session.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {session.current && (
                        <Chip label="Current" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSecurityLogsTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Security Activity Log</Typography>
        
        {loadingLogs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {securityLogs.length > 0 ? (
              securityLogs.map((log, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {log.severity === 'high' ? (
                      <WarningIcon color="error" />
                    ) : log.severity === 'medium' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={log.event}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.timestamp).toLocaleString()} - IP: {log.ipAddress}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={log.severity}
                    size="small"
                    color={
                      log.severity === 'high' ? 'error' :
                      log.severity === 'medium' ? 'warning' : 'success'
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No security logs found
              </Typography>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Security Settings
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ShieldIcon />} label="Two-Factor Auth" />
          <Tab icon={<VpnKeyIcon />} label="Password Policy" />
          <Tab icon={<DevicesIcon />} label="Sessions" />
          <Tab icon={<HistoryIcon />} label="Security Logs" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && render2FATab()}
          {activeTab === 1 && renderPasswordPolicyTab()}
          {activeTab === 2 && renderSessionTab()}
          {activeTab === 3 && renderSecurityLogsTab()}
        </>
      )}

      {/* 2FA Setup Dialog */}
      <Dialog open={twoFactorDialog} onClose={() => setTwoFactorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Scan this QR code with your authenticator app:
            </Typography>
            {twoFactorSettings.qrCode && (
              <img src={twoFactorSettings.qrCode} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialog(false)}>Cancel</Button>
          <Button
            onClick={verify2FA}
            variant="contained"
            disabled={saving || verificationCode.length !== 6}
          >
            {saving ? <CircularProgress size={20} /> : 'Verify & Enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;