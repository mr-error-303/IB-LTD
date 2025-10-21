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
  LinearProgress
} from '@mui/material';
import {
  Security,
  Shield,
  Warning,
  CheckCircle,
  Refresh,
  Save,
  CloudUpload
} from '@mui/icons-material';

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({
    authentication: {
      enforceStrongPasswords: true,
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      passwordExpiryDays: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      enableTwoFactor: true,
      forceTwoFactor: false,
      allowedTwoFactorMethods: ['app', 'sms', 'email']
    },
    encryption: {
      dataEncryptionEnabled: true,
      encryptionAlgorithm: 'AES-256',
      keyRotationInterval: 30,
      encryptBackups: true,
      encryptLogs: true,
      sslTlsVersion: 'TLS 1.3',
      certificateAutoRenewal: true
    },
    firewall: {
      enabled: true,
      blockSuspiciousIPs: true,
      rateLimitEnabled: true,
      maxRequestsPerMinute: 100,
      ddosProtection: true,
      geoBlocking: false,
      blockedCountries: [],
      whitelistedIPs: []
    },
    monitoring: {
      realTimeMonitoring: true,
      logSecurityEvents: true,
      alertOnSuspiciousActivity: true,
      alertThreshold: 'medium',
      enableAuditLogs: true,
      logRetentionDays: 365,
      enableIntrusionDetection: true,
      enableBehaviorAnalysis: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      encryptBackups: true,
      offSiteBackup: true,
      backupVerification: true,
      backupLocation: 'cloud'
    },
    compliance: {
      gdprCompliance: true,
      hipaaCompliance: false,
      sox404Compliance: false,
      iso27001Compliance: true,
      dataRetentionPeriod: 2555, // 7 years in days
      rightToErasure: true,
      dataPortability: true,
      consentManagement: true
    }
  });
  
  const [securityScore, setSecurityScore] = useState(85);
  const [recentChanges, setRecentChanges] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [backupDialog, setBackupDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);

  useEffect(() => {
    fetchSecuritySettings();
    fetchSecurityScore();
    fetchRecentChanges();
  }, []);

  const fetchSecuritySettings = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings are already initialized above
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityScore = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSecurityScore(85);
    } catch (error) {
      console.error('Error fetching security score:', error);
    }
  };

  const fetchRecentChanges = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecentChanges([
        { id: 1, setting: 'Two-Factor Authentication', action: 'Enabled', user: 'Admin', timestamp: '2024-01-15 10:30:00' },
        { id: 2, setting: 'Password Policy', action: 'Updated', user: 'Admin', timestamp: '2024-01-15 09:15:00' },
        { id: 3, setting: 'Firewall Rules', action: 'Modified', user: 'Security Admin', timestamp: '2024-01-14 16:45:00' }
      ]);
    } catch (error) {
      console.error('Error fetching recent changes:', error);
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

  const handleTestSecurity = async () => {
    setTestDialog(true);
    try {
      // Mock security test
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error running security test:', error);
    }
  };

  const handleBackupSettings = async () => {
    try {
      // Mock backup creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackupDialog(false);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const renderAuthenticationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Password Policy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.enforceStrongPasswords}
                      onChange={(e) => handleSettingChange('authentication', 'enforceStrongPasswords', e.target.checked)}
                    />
                  }
                  label="Enforce Strong Passwords"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Password Length"
                  type="number"
                  value={settings.authentication.passwordMinLength}
                  onChange={(e) => handleSettingChange('authentication', 'passwordMinLength', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.passwordRequireSpecialChars}
                      onChange={(e) => handleSettingChange('authentication', 'passwordRequireSpecialChars', e.target.checked)}
                    />
                  }
                  label="Require Special Characters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.passwordRequireNumbers}
                      onChange={(e) => handleSettingChange('authentication', 'passwordRequireNumbers', e.target.checked)}
                    />
                  }
                  label="Require Numbers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.passwordRequireUppercase}
                      onChange={(e) => handleSettingChange('authentication', 'passwordRequireUppercase', e.target.checked)}
                    />
                  }
                  label="Require Uppercase Letters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password Expiry (Days)"
                  type="number"
                  value={settings.authentication.passwordExpiryDays}
                  onChange={(e) => handleSettingChange('authentication', 'passwordExpiryDays', parseInt(e.target.value))}
                  fullWidth
                  size="small"
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
              Login Security
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Login Attempts"
                  type="number"
                  value={settings.authentication.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('authentication', 'maxLoginAttempts', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lockout Duration (Minutes)"
                  type="number"
                  value={settings.authentication.lockoutDuration}
                  onChange={(e) => handleSettingChange('authentication', 'lockoutDuration', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Session Timeout (Minutes)"
                  type="number"
                  value={settings.authentication.sessionTimeout}
                  onChange={(e) => handleSettingChange('authentication', 'sessionTimeout', parseInt(e.target.value))}
                  fullWidth
                  size="small"
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
              Two-Factor Authentication
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.enableTwoFactor}
                      onChange={(e) => handleSettingChange('authentication', 'enableTwoFactor', e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authentication.forceTwoFactor}
                      onChange={(e) => handleSettingChange('authentication', 'forceTwoFactor', e.target.checked)}
                    />
                  }
                  label="Force 2FA for All Users"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEncryptionSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Encryption
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.encryption.dataEncryptionEnabled}
                      onChange={(e) => handleSettingChange('encryption', 'dataEncryptionEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Data Encryption"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Encryption Algorithm</InputLabel>
                  <Select
                    value={settings.encryption.encryptionAlgorithm}
                    onChange={(e) => handleSettingChange('encryption', 'encryptionAlgorithm', e.target.value)}
                    label="Encryption Algorithm"
                  >
                    <MenuItem value="AES-256">AES-256</MenuItem>
                    <MenuItem value="AES-192">AES-192</MenuItem>
                    <MenuItem value="AES-128">AES-128</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Key Rotation Interval (Days)"
                  type="number"
                  value={settings.encryption.keyRotationInterval}
                  onChange={(e) => handleSettingChange('encryption', 'keyRotationInterval', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.encryption.encryptBackups}
                      onChange={(e) => handleSettingChange('encryption', 'encryptBackups', e.target.checked)}
                    />
                  }
                  label="Encrypt Backups"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.encryption.encryptLogs}
                      onChange={(e) => handleSettingChange('encryption', 'encryptLogs', e.target.checked)}
                    />
                  }
                  label="Encrypt Logs"
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
              SSL/TLS Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>SSL/TLS Version</InputLabel>
                  <Select
                    value={settings.encryption.sslTlsVersion}
                    onChange={(e) => handleSettingChange('encryption', 'sslTlsVersion', e.target.value)}
                    label="SSL/TLS Version"
                  >
                    <MenuItem value="TLS 1.3">TLS 1.3</MenuItem>
                    <MenuItem value="TLS 1.2">TLS 1.2</MenuItem>
                    <MenuItem value="TLS 1.1">TLS 1.1 (Not Recommended)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.encryption.certificateAutoRenewal}
                      onChange={(e) => handleSettingChange('encryption', 'certificateAutoRenewal', e.target.checked)}
                    />
                  }
                  label="Auto-Renew Certificates"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFirewallSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Firewall Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.firewall.enabled}
                      onChange={(e) => handleSettingChange('firewall', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Firewall"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.firewall.blockSuspiciousIPs}
                      onChange={(e) => handleSettingChange('firewall', 'blockSuspiciousIPs', e.target.checked)}
                    />
                  }
                  label="Block Suspicious IPs"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.firewall.rateLimitEnabled}
                      onChange={(e) => handleSettingChange('firewall', 'rateLimitEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Rate Limiting"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Requests Per Minute"
                  type="number"
                  value={settings.firewall.maxRequestsPerMinute}
                  onChange={(e) => handleSettingChange('firewall', 'maxRequestsPerMinute', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.firewall.ddosProtection}
                      onChange={(e) => handleSettingChange('firewall', 'ddosProtection', e.target.checked)}
                    />
                  }
                  label="DDoS Protection"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.firewall.geoBlocking}
                      onChange={(e) => handleSettingChange('firewall', 'geoBlocking', e.target.checked)}
                    />
                  }
                  label="Geographic Blocking"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMonitoringSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Monitoring
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.realTimeMonitoring}
                      onChange={(e) => handleSettingChange('monitoring', 'realTimeMonitoring', e.target.checked)}
                    />
                  }
                  label="Real-time Monitoring"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.logSecurityEvents}
                      onChange={(e) => handleSettingChange('monitoring', 'logSecurityEvents', e.target.checked)}
                    />
                  }
                  label="Log Security Events"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.alertOnSuspiciousActivity}
                      onChange={(e) => handleSettingChange('monitoring', 'alertOnSuspiciousActivity', e.target.checked)}
                    />
                  }
                  label="Alert on Suspicious Activity"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Alert Threshold</InputLabel>
                  <Select
                    value={settings.monitoring.alertThreshold}
                    onChange={(e) => handleSettingChange('monitoring', 'alertThreshold', e.target.value)}
                    label="Alert Threshold"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableAuditLogs}
                      onChange={(e) => handleSettingChange('monitoring', 'enableAuditLogs', e.target.checked)}
                    />
                  }
                  label="Enable Audit Logs"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Log Retention (Days)"
                  type="number"
                  value={settings.monitoring.logRetentionDays}
                  onChange={(e) => handleSettingChange('monitoring', 'logRetentionDays', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableIntrusionDetection}
                      onChange={(e) => handleSettingChange('monitoring', 'enableIntrusionDetection', e.target.checked)}
                    />
                  }
                  label="Intrusion Detection"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableBehaviorAnalysis}
                      onChange={(e) => handleSettingChange('monitoring', 'enableBehaviorAnalysis', e.target.checked)}
                    />
                  }
                  label="Behavior Analysis"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBackupSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.autoBackup}
                      onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                    />
                  }
                  label="Enable Auto Backup"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backup.backupFrequency}
                    onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                    label="Backup Frequency"
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
                  value={settings.backup.backupRetention}
                  onChange={(e) => handleSettingChange('backup', 'backupRetention', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.encryptBackups}
                      onChange={(e) => handleSettingChange('backup', 'encryptBackups', e.target.checked)}
                    />
                  }
                  label="Encrypt Backups"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.offSiteBackup}
                      onChange={(e) => handleSettingChange('backup', 'offSiteBackup', e.target.checked)}
                    />
                  }
                  label="Off-site Backup"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.backupVerification}
                      onChange={(e) => handleSettingChange('backup', 'backupVerification', e.target.checked)}
                    />
                  }
                  label="Backup Verification"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderComplianceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance Standards
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.gdprCompliance}
                      onChange={(e) => handleSettingChange('compliance', 'gdprCompliance', e.target.checked)}
                    />
                  }
                  label="GDPR Compliance"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.hipaaCompliance}
                      onChange={(e) => handleSettingChange('compliance', 'hipaaCompliance', e.target.checked)}
                    />
                  }
                  label="HIPAA Compliance"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.sox404Compliance}
                      onChange={(e) => handleSettingChange('compliance', 'sox404Compliance', e.target.checked)}
                    />
                  }
                  label="SOX 404 Compliance"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.iso27001Compliance}
                      onChange={(e) => handleSettingChange('compliance', 'iso27001Compliance', e.target.checked)}
                    />
                  }
                  label="ISO 27001 Compliance"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data Retention Period (Days)"
                  type="number"
                  value={settings.compliance.dataRetentionPeriod}
                  onChange={(e) => handleSettingChange('compliance', 'dataRetentionPeriod', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.rightToErasure}
                      onChange={(e) => handleSettingChange('compliance', 'rightToErasure', e.target.checked)}
                    />
                  }
                  label="Right to Erasure"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.dataPortability}
                      onChange={(e) => handleSettingChange('compliance', 'dataPortability', e.target.checked)}
                    />
                  }
                  label="Data Portability"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compliance.consentManagement}
                      onChange={(e) => handleSettingChange('compliance', 'consentManagement', e.target.checked)}
                    />
                  }
                  label="Consent Management"
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
          Loading security settings...
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
            Security Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure system-wide security settings and policies
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSecuritySettings}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setBackupDialog(true)}
          >
            Backup
          </Button>
          <Button
            variant="outlined"
            startIcon={<Security />}
            onClick={handleTestSecurity}
          >
            Test Security
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

      {/* Security Score */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Shield color={getSecurityScoreColor(securityScore)} sx={{ mr: 1 }} />
                <Typography variant="h6">Security Score</Typography>
              </Box>
              <Typography variant="h3" color={`${getSecurityScoreColor(securityScore)}.main`}>
                {securityScore}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={securityScore}
                color={getSecurityScoreColor(securityScore)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Security Changes
              </Typography>
              <List dense>
                {recentChanges.map((change) => (
                  <ListItem key={change.id}>
                    <ListItemText
                      primary={`${change.setting} - ${change.action}`}
                      secondary={`By ${change.user} on ${change.timestamp}`}
                    />
                  </ListItem>
                ))}
              </List>
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
          <Tab label="Authentication" />
          <Tab label="Encryption" />
          <Tab label="Firewall" />
          <Tab label="Monitoring" />
          <Tab label="Backup" />
          <Tab label="Compliance" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderAuthenticationSettings()}
        {activeTab === 1 && renderEncryptionSettings()}
        {activeTab === 2 && renderFirewallSettings()}
        {activeTab === 3 && renderMonitoringSettings()}
        {activeTab === 4 && renderBackupSettings()}
        {activeTab === 5 && renderComplianceSettings()}
      </Box>

      {/* Backup Dialog */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Backup Security Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Create a backup of all current security settings. This backup can be used to restore settings later.
          </Typography>
          <Alert severity="info">
            The backup will include all security configurations but will exclude sensitive data like passwords and keys.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleBackupSettings} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Security Dialog */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Security Test Results</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Running comprehensive security tests...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <List dense>
            <ListItem>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <ListItemText primary="Password Policy - Passed" />
            </ListItem>
            <ListItem>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <ListItemText primary="Encryption Settings - Passed" />
            </ListItem>
            <ListItem>
              <Warning color="warning" sx={{ mr: 1 }} />
              <ListItemText primary="Firewall Configuration - Warning" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;