import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Settings,
  Storage,
  Email,
  Notifications,
  Language,
  Palette,
  Update,
  Backup,
  RestoreFromTrash,
  CloudSync,
  Speed,
  Memory,
  NetworkCheck,
  Schedule,
  ExpandMore,
  Save,
  Refresh,
  Download,
  Upload,
  Delete,
  Edit,
  Add,

  Info
} from '@mui/icons-material';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      systemName: 'IB LTD Admin System',
      systemDescription: 'Financial Management Platform',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      language: 'en',
      currency: 'USD',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info'
    },
    email: {
      smtpEnabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecurity: 'tls',
      smtpUsername: 'admin@ibltd.com',
      smtpPassword: '',
      fromEmail: 'noreply@ibltd.com',
      fromName: 'IB LTD System',
      testEmailEnabled: true,
      emailTemplatesEnabled: true,
      emailQueueEnabled: true,
      maxEmailsPerHour: 1000
    },
    notifications: {
      enableSystemNotifications: true,
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      enablePushNotifications: true,
      notificationRetention: 30,
      criticalAlertsOnly: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      notificationChannels: ['email', 'in-app']
    },
    performance: {
      cacheEnabled: true,
      cacheType: 'redis',
      cacheTtl: 3600,
      compressionEnabled: true,
      minifyAssets: true,
      cdnEnabled: false,
      cdnUrl: '',
      maxConcurrentUsers: 1000,
      sessionTimeout: 30,
      requestTimeout: 30,
      maxFileUploadSize: 10
    },
    database: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      compressionEnabled: true,
      encryptionEnabled: true,
      connectionPoolSize: 20,
      queryTimeout: 30,
      slowQueryLogging: true,
      slowQueryThreshold: 1000
    },
    storage: {
      defaultStorage: 'local',
      maxStorageSize: 100,
      storageCleanupEnabled: true,
      cleanupFrequency: 'weekly',
      tempFileRetention: 7,
      logFileRetention: 90,
      mediaFileRetention: 365,
      compressionEnabled: true,
      deduplicationEnabled: false
    },
    api: {
      rateLimitEnabled: true,
      maxRequestsPerMinute: 100,
      apiVersioning: true,
      defaultApiVersion: 'v1',
      corsEnabled: true,
      allowedOrigins: ['http://localhost:3000'],
      apiDocumentationEnabled: true,
      webhooksEnabled: true,
      maxWebhookRetries: 3
    },
    security: {
      forceHttps: true,
      hsts: true,
      contentSecurityPolicy: true,
      xssProtection: true,
      clickjackingProtection: true,
      ipWhitelistEnabled: false,
      geoBlockingEnabled: false,
      bruteForceProtection: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30
    }
  });

  const [systemInfo] = useState({
    version: '2.1.0',
    uptime: '15 days, 3 hours',
    lastUpdate: '2024-01-15 10:30:00',
    environment: 'production',
    nodeVersion: '18.17.0',
    databaseVersion: 'PostgreSQL 15.3',
    memoryUsage: 65,
    diskUsage: 42,
    cpuUsage: 23
  });

  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [backupDialog, setBackupDialog] = useState(false);
  const [testEmailDialog, setTestEmailDialog] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemInfo();
  }, []);

  const fetchSystemSettings = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings are already initialized above
    } catch (error) {
      console.error('Error fetching system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // System info is already initialized above
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving settings:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMaintenanceMode = async (enabled) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleSettingChange('general', 'maintenanceMode', enabled);
      setMaintenanceDialog(false);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const handleBackupSystem = async () => {
    try {
      // Mock backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBackupDialog(false);
    } catch (error) {
      console.error('Error creating system backup:', error);
    }
  };

  const handleTestEmail = async () => {
    try {
      // Mock email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestEmailDialog(false);
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="System Name"
                  value={settings.general.systemName}
                  onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="System Description"
                  value={settings.general.systemDescription}
                  onChange={(e) => handleSettingChange('general', 'systemDescription', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    label="Timezone"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settings.general.timeFormat}
                    onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
                    label="Time Format"
                  >
                    <MenuItem value="24h">24 Hour</MenuItem>
                    <MenuItem value="12h">12 Hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.general.currency}
                    onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                    <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                    <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={settings.general.logLevel}
                    onChange={(e) => handleSettingChange('general', 'logLevel', e.target.value)}
                    label="Log Level"
                  >
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                    <MenuItem value="trace">Trace</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Modes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => setMaintenanceDialog(true)}
                    />
                  }
                  label="Maintenance Mode"
                />
                {settings.general.maintenanceMode && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    System is currently in maintenance mode
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.debugMode}
                      onChange={(e) => handleSettingChange('general', 'debugMode', e.target.checked)}
                    />
                  }
                  label="Debug Mode"
                />
                {settings.general.debugMode && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Debug mode is enabled - performance may be affected
                  </Alert>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEmailSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SMTP Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.smtpEnabled}
                      onChange={(e) => handleSettingChange('email', 'smtpEnabled', e.target.checked)}
                    />
                  }
                  label="Enable SMTP"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Host"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Port"
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!settings.email.smtpEnabled}>
                  <InputLabel>Security</InputLabel>
                  <Select
                    value={settings.email.smtpSecurity}
                    onChange={(e) => handleSettingChange('email', 'smtpSecurity', e.target.value)}
                    label="Security"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="tls">TLS</MenuItem>
                    <MenuItem value="ssl">SSL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  value={settings.email.smtpUsername}
                  onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From Email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From Name"
                  value={settings.email.fromName}
                  onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Emails Per Hour"
                  type="number"
                  value={settings.email.maxEmailsPerHour}
                  onChange={(e) => handleSettingChange('email', 'maxEmailsPerHour', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.email.smtpEnabled}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setTestEmailDialog(true)}
                disabled={!settings.email.smtpEnabled}
              >
                Send Test Email
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Email Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.testEmailEnabled}
                      onChange={(e) => handleSettingChange('email', 'testEmailEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Test Emails"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.emailTemplatesEnabled}
                      onChange={(e) => handleSettingChange('email', 'emailTemplatesEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Email Templates"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.emailQueueEnabled}
                      onChange={(e) => handleSettingChange('email', 'emailQueueEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Email Queue"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Channels
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enableSystemNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'enableSystemNotifications', e.target.checked)}
                    />
                  }
                  label="System Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enableEmailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'enableEmailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enableSmsNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'enableSmsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enablePushNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'enablePushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Notification Retention (Days)"
                  type="number"
                  value={settings.notifications.notificationRetention}
                  onChange={(e) => handleSettingChange('notifications', 'notificationRetention', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.criticalAlertsOnly}
                      onChange={(e) => handleSettingChange('notifications', 'criticalAlertsOnly', e.target.checked)}
                    />
                  }
                  label="Critical Alerts Only"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.quietHoursEnabled}
                      onChange={(e) => handleSettingChange('notifications', 'quietHoursEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Quiet Hours"
                />
              </Grid>
              {settings.notifications.quietHoursEnabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quiet Hours Start"
                      type="time"
                      value={settings.notifications.quietHoursStart}
                      onChange={(e) => handleSettingChange('notifications', 'quietHoursStart', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quiet Hours End"
                      type="time"
                      value={settings.notifications.quietHoursEnd}
                      onChange={(e) => handleSettingChange('notifications', 'quietHoursEnd', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPerformanceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Performance
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {systemInfo.cpuUsage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CPU Usage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={systemInfo.cpuUsage}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {systemInfo.memoryUsage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Memory Usage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={systemInfo.memoryUsage}
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {systemInfo.diskUsage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disk Usage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={systemInfo.diskUsage}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cache Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.cacheEnabled}
                      onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Caching"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cache Type</InputLabel>
                  <Select
                    value={settings.performance.cacheType}
                    onChange={(e) => handleSettingChange('performance', 'cacheType', e.target.value)}
                    label="Cache Type"
                    disabled={!settings.performance.cacheEnabled}
                  >
                    <MenuItem value="memory">Memory</MenuItem>
                    <MenuItem value="redis">Redis</MenuItem>
                    <MenuItem value="memcached">Memcached</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cache TTL (seconds)"
                  type="number"
                  value={settings.performance.cacheTtl}
                  onChange={(e) => handleSettingChange('performance', 'cacheTtl', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.performance.cacheEnabled}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimization Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.compressionEnabled}
                      onChange={(e) => handleSettingChange('performance', 'compressionEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Compression"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.minifyAssets}
                      onChange={(e) => handleSettingChange('performance', 'minifyAssets', e.target.checked)}
                    />
                  }
                  label="Minify Assets"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.cdnEnabled}
                      onChange={(e) => handleSettingChange('performance', 'cdnEnabled', e.target.checked)}
                    />
                  }
                  label="Enable CDN"
                />
              </Grid>
              {settings.performance.cdnEnabled && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CDN URL"
                    value={settings.performance.cdnUrl}
                    onChange={(e) => handleSettingChange('performance', 'cdnUrl', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Concurrent Users"
                  type="number"
                  value={settings.performance.maxConcurrentUsers}
                  onChange={(e) => handleSettingChange('performance', 'maxConcurrentUsers', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.performance.sessionTimeout}
                  onChange={(e) => handleSettingChange('performance', 'sessionTimeout', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Request Timeout (seconds)"
                  type="number"
                  value={settings.performance.requestTimeout}
                  onChange={(e) => handleSettingChange('performance', 'requestTimeout', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max File Upload Size (MB)"
                  type="number"
                  value={settings.performance.maxFileUploadSize}
                  onChange={(e) => handleSettingChange('performance', 'maxFileUploadSize', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDatabaseSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Database Backup
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.database.autoBackup}
                      onChange={(e) => handleSettingChange('database', 'autoBackup', e.target.checked)}
                    />
                  }
                  label="Enable Auto Backup"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.database.backupFrequency}
                    onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
                    label="Backup Frequency"
                    disabled={!settings.database.autoBackup}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Backup Retention (Days)"
                  type="number"
                  value={settings.database.backupRetention}
                  onChange={(e) => handleSettingChange('database', 'backupRetention', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.database.autoBackup}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Backup Location</InputLabel>
                  <Select
                    value={settings.database.backupLocation}
                    onChange={(e) => handleSettingChange('database', 'backupLocation', e.target.value)}
                    label="Backup Location"
                    disabled={!settings.database.autoBackup}
                  >
                    <MenuItem value="local">Local Storage</MenuItem>
                    <MenuItem value="s3">Amazon S3</MenuItem>
                    <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                    <MenuItem value="azure">Azure Blob Storage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.database.compressionEnabled}
                      onChange={(e) => handleSettingChange('database', 'compressionEnabled', e.target.checked)}
                    />
                  }
                  label="Compress Backups"
                  disabled={!settings.database.autoBackup}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.database.encryptionEnabled}
                      onChange={(e) => handleSettingChange('database', 'encryptionEnabled', e.target.checked)}
                    />
                  }
                  label="Encrypt Backups"
                  disabled={!settings.database.autoBackup}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Backup />}
                onClick={() => setBackupDialog(true)}
              >
                Create Manual Backup
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Database Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Connection Pool Size"
                  type="number"
                  value={settings.database.connectionPoolSize}
                  onChange={(e) => handleSettingChange('database', 'connectionPoolSize', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Query Timeout (seconds)"
                  type="number"
                  value={settings.database.queryTimeout}
                  onChange={(e) => handleSettingChange('database', 'queryTimeout', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.database.slowQueryLogging}
                      onChange={(e) => handleSettingChange('database', 'slowQueryLogging', e.target.checked)}
                    />
                  }
                  label="Enable Slow Query Logging"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Slow Query Threshold (ms)"
                  type="number"
                  value={settings.database.slowQueryThreshold}
                  onChange={(e) => handleSettingChange('database', 'slowQueryThreshold', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.database.slowQueryLogging}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading system settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure general system settings and preferences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSystemSettings}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setBackupDialog(true)}
          >
            Export Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {/* System Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Version</Typography>
              </Box>
              <Typography variant="h4">{systemInfo.version}</Typography>
              <Typography variant="body2" color="text.secondary">
                Current Version
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Uptime</Typography>
              </Box>
              <Typography variant="h6">{systemInfo.uptime}</Typography>
              <Typography variant="body2" color="text.secondary">
                System Uptime
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Update color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Last Update</Typography>
              </Box>
              <Typography variant="body1">{systemInfo.lastUpdate}</Typography>
              <Typography variant="body2" color="text.secondary">
                Last System Update
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Settings color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Environment</Typography>
              </Box>
              <Chip
                label={systemInfo.environment}
                color={systemInfo.environment === 'production' ? 'success' : 'warning'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Current Environment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" />
          <Tab label="Email" />
          <Tab label="Notifications" />
          <Tab label="Performance" />
          <Tab label="Database" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderGeneralSettings()}
        {activeTab === 1 && renderEmailSettings()}
        {activeTab === 2 && renderNotificationSettings()}
        {activeTab === 3 && renderPerformanceSettings()}
        {activeTab === 4 && renderDatabaseSettings()}
      </Box>

      {/* Maintenance Mode Dialog */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {settings.general.maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {settings.general.maintenanceMode
              ? 'Disabling maintenance mode will make the system available to all users.'
              : 'Enabling maintenance mode will prevent users from accessing the system.'}
          </Alert>
          <Typography variant="body2">
            Are you sure you want to {settings.general.maintenanceMode ? 'disable' : 'enable'} maintenance mode?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleMaintenanceMode(!settings.general.maintenanceMode)}
            variant="contained"
            color={settings.general.maintenanceMode ? 'success' : 'warning'}
          >
            {settings.general.maintenanceMode ? 'Disable' : 'Enable'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will create a complete backup of the system including database, settings, and files.
          </Typography>
          <Alert severity="info">
            The backup process may take several minutes depending on the system size.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleBackupSystem} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A test email will be sent using the current SMTP configuration.
          </Typography>
          <TextField
            label="Test Email Address"
            type="email"
            fullWidth
            size="small"
            defaultValue="admin@ibltd.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
          <Button onClick={handleTestEmail} variant="contained">
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;