import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAdminSecurity } from '../context/AdminSecurityContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';

interface TwoFactorSettings {
  enabled: boolean;
  method: 'app' | 'sms' | 'email';
  backupCodes: string[];
  qrCode: string;
  secret: string;
  requireForLogin: boolean;
  requireForSensitiveActions: boolean;
}

interface BiometricSettings {
  fingerprintEnabled: boolean;
  faceIdEnabled: boolean;
  supportedMethods: string[];
  lastUsed: Date | null;
}

interface TransactionLimits {
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  internationalEnabled: boolean;
  requireApprovalAbove: number;
}

interface SecurityAlerts {
  pushNotifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  loginAlerts: boolean;
  transactionAlerts: boolean;
  suspiciousActivityAlerts: boolean;
}

interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  location: string;
  lastUsed: Date;
  trusted: boolean;
  current: boolean;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiry: number;
  preventReuse: number;
  maxAttempts: number;
  lockoutDuration: number;
}

interface SessionSettings {
  sessionTimeout: number;
  maxConcurrentSessions: number;
  requireReauth: boolean;
  logoutInactive: boolean;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActivity: Date;
  current: boolean;
}

interface SecurityLog {
  id: string;
  event: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { logSecurityEvent, performSecureOperation } = useAdminSecurity();
  const { showError, showSuccess, showInfo } = useNotifications();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 2FA Settings
  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorSettings>({
    enabled: false,
    method: 'app',
    backupCodes: [],
    qrCode: '',
    secret: '',
    requireForLogin: false,
    requireForSensitiveActions: false
  });
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Password Policy
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
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
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    requireReauth: true,
    logoutInactive: true
  });

  // Biometric Settings
  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings>({
    fingerprintEnabled: false,
    faceIdEnabled: false,
    supportedMethods: [],
    lastUsed: null
  });

  // Transaction Limits
  const [transactionLimits, setTransactionLimits] = useState<TransactionLimits>({
    dailyLimit: 50000,
    monthlyLimit: 500000,
    singleTransactionLimit: 25000,
    internationalEnabled: false,
    requireApprovalAbove: 100000
  });

  // Security Alerts
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlerts>({
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    loginAlerts: true,
    transactionAlerts: true,
    suspiciousActivityAlerts: true
  });

  // Device Management
  const [devices, setDevices] = useState<DeviceInfo[]>([]);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  // Security Logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchSecuritySettings();
    if (activeTab === 0) {
      checkBiometricSupport();
    }
    if (activeTab === 4) {
      fetchDevices();
    }
    if (activeTab === 5) {
      fetchActiveSessions();
    }
    if (activeTab === 6) {
      fetchSecurityLogs();
    }
  }, [activeTab]);

  const fetchSecuritySettings = async () => {
    setLoading(true);
    try {
      // Simulate API calls with placeholder data
      setTwoFactorSettings({
        enabled: false,
        method: 'app',
        backupCodes: [],
        qrCode: '',
        secret: '',
        requireForLogin: false,
        requireForSensitiveActions: false
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

      setBiometricSettings({
        fingerprintEnabled: false,
        faceIdEnabled: false,
        supportedMethods: ['fingerprint', 'face'],
        lastUsed: null
      });

      setTransactionLimits({
        dailyLimit: 50000,
        monthlyLimit: 500000,
        singleTransactionLimit: 25000,
        internationalEnabled: false,
        requireApprovalAbove: 100000
      });

      setSecurityAlerts({
        pushNotifications: true,
        emailAlerts: true,
        smsAlerts: false,
        loginAlerts: true,
        transactionAlerts: true,
        suspiciousActivityAlerts: true
      });
      
    } catch (error) {
      const appError = handleError(error, 'SecuritySettings');
      log.error('Error fetching security settings', appError, 'SecuritySettings');
      showError('Failed to load security settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      // Check if biometric authentication is supported
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        setBiometricSettings(prev => ({
          ...prev,
          supportedMethods: ['fingerprint', 'face']
        }));
      }
    } catch (error) {
      const appError = handleError(error, 'SecuritySettings');
      log.error('Error checking biometric support', appError, 'SecuritySettings');
    }
  };

  const fetchDevices = async () => {
    try {
      // Simulate device data
      setDevices([
        {
          id: '1',
          name: 'Windows PC - Chrome',
          type: 'desktop',
          os: 'Windows 11',
          browser: 'Chrome 120',
          location: 'Dhaka, Bangladesh',
          lastUsed: new Date(),
          trusted: true,
          current: true
        },
        {
          id: '2',
          name: 'iPhone 15',
          type: 'mobile',
          os: 'iOS 17',
          browser: 'Safari',
          location: 'Chittagong, Bangladesh',
          lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
          trusted: true,
          current: false
        },
        {
          id: '3',
          name: 'Samsung Galaxy Tab',
          type: 'tablet',
          os: 'Android 14',
          browser: 'Chrome Mobile',
          location: 'Sylhet, Bangladesh',
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          trusted: false,
          current: false
        }
      ]);
    } catch (error) {
      const appError = handleError(error, 'SecuritySettings');
      log.error('Error fetching devices', appError, 'SecuritySettings');
      showError('Failed to load device information. Please try again.');
    }
  };

  const fetchActiveSessions = async () => {
    try {
      // Simulate active sessions data
      setActiveSessions([
        {
          id: '1',
          device: 'Chrome on Windows',
          location: 'Dhaka, Bangladesh',
          lastActivity: new Date(),
          current: true
        },
        {
          id: '2',
          device: 'Mobile Safari',
          location: 'Chittagong, Bangladesh',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          current: false
        }
      ]);
    } catch (error) {
      const appError = handleError(error, 'SecuritySettings');
      log.error('Error fetching active sessions', appError, 'SecuritySettings');
      showError('Failed to load active sessions. Please try again.');
    }
  };

  const fetchSecurityLogs = async () => {
    setLoadingLogs(true);
    try {
      // Get security logs from localStorage
      const logs = JSON.parse(localStorage.getItem('adminSecurityLogs') || '[]');
      const formattedLogs = logs.map((log: any, index: number) => ({
        id: index.toString(),
        event: log.event,
        timestamp: new Date(log.timestamp),
        details: JSON.stringify(log.details),
        severity: log.event.includes('failed') || log.event.includes('locked') ? 'high' : 'medium'
      }));
      setSecurityLogs(formattedLogs.reverse().slice(0, 50)); // Show latest 50 logs
    } catch (error) {
      const appError = handleError(error, 'SecuritySettings');
      log.error('Error fetching security logs', appError, 'SecuritySettings');
      showError('Failed to load security logs. Please try again.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const enableBiometric = async (type: 'fingerprint' | 'face') => {
    setSaving(true);
    try {
      await performSecureOperation('enable_biometric', async () => {
        setBiometricSettings(prev => ({
          ...prev,
          [type === 'fingerprint' ? 'fingerprintEnabled' : 'faceIdEnabled']: true,
          lastUsed: new Date()
        }));
        setMessage({ type: 'success', text: `${type === 'fingerprint' ? 'Fingerprint' : 'Face ID'} authentication enabled successfully` });
        logSecurityEvent(`biometric_${type}_enabled`);
      });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to enable ${type} authentication` });
    } finally {
      setSaving(false);
    }
  };

  const disableBiometric = async (type: 'fingerprint' | 'face') => {
    setSaving(true);
    try {
      await performSecureOperation('disable_biometric', async () => {
        setBiometricSettings(prev => ({
          ...prev,
          [type === 'fingerprint' ? 'fingerprintEnabled' : 'faceIdEnabled']: false
        }));
        setMessage({ type: 'success', text: `${type === 'fingerprint' ? 'Fingerprint' : 'Face ID'} authentication disabled successfully` });
        logSecurityEvent(`biometric_${type}_disabled`);
      });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to disable ${type} authentication` });
    } finally {
      setSaving(false);
    }
  };

  const updateTransactionLimits = async () => {
    setSaving(true);
    try {
      await performSecureOperation('update_transaction_limits', async () => {
        setMessage({ type: 'success', text: 'Transaction limits updated successfully' });
        logSecurityEvent('transaction_limits_updated', transactionLimits);
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update transaction limits' });
    } finally {
      setSaving(false);
    }
  };

  const updateSecurityAlerts = async () => {
    setSaving(true);
    try {
      await performSecureOperation('update_security_alerts', async () => {
        setMessage({ type: 'success', text: 'Security alerts updated successfully' });
        logSecurityEvent('security_alerts_updated', securityAlerts);
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update security alerts' });
    } finally {
      setSaving(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      await performSecureOperation('remove_device', async () => {
        setDevices(devices => devices.filter(d => d.id !== deviceId));
        setMessage({ type: 'success', text: 'Device removed successfully' });
        logSecurityEvent('device_removed', { deviceId });
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove device' });
    }
  };

  const trustDevice = async (deviceId: string) => {
    try {
      await performSecureOperation('trust_device', async () => {
        setDevices(devices => devices.map(d => 
          d.id === deviceId ? { ...d, trusted: true } : d
        ));
        setMessage({ type: 'success', text: 'Device marked as trusted' });
        logSecurityEvent('device_trusted', { deviceId });
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to trust device' });
    }
  };

  const enable2FA = async () => {
    try {
      await performSecureOperation('enable_2fa', async () => {
        // Simulate 2FA setup
        setTwoFactorSettings({
          ...twoFactorSettings,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          secret: 'JBSWY3DPEHPK3PXP'
        });
        setTwoFactorDialog(true);
        logSecurityEvent('2fa_setup_initiated');
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable 2FA' });
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
      return;
    }

    setSaving(true);
    try {
      await performSecureOperation('verify_2fa', async () => {
        // Simulate verification
        setTwoFactorSettings({ ...twoFactorSettings, enabled: true });
        setTwoFactorDialog(false);
        setVerificationCode('');
        setMessage({ type: 'success', text: '2FA enabled successfully' });
        logSecurityEvent('2fa_enabled');
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    } finally {
      setSaving(false);
    }
  };

  const disable2FA = async () => {
    setSaving(true);
    try {
      await performSecureOperation('disable_2fa', async () => {
        setTwoFactorSettings({ ...twoFactorSettings, enabled: false });
        setMessage({ type: 'success', text: '2FA disabled successfully' });
        logSecurityEvent('2fa_disabled');
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' });
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordPolicy = async () => {
    setSaving(true);
    try {
      await performSecureOperation('update_password_policy', async () => {
        // Simulate API call
        setMessage({ type: 'success', text: 'Password policy updated successfully' });
        logSecurityEvent('password_policy_updated', passwordPolicy);
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password policy' });
    } finally {
      setSaving(false);
    }
  };

  const updateSessionSettings = async () => {
    setSaving(true);
    try {
      await performSecureOperation('update_session_settings', async () => {
        // Simulate API call
        setMessage({ type: 'success', text: 'Session settings updated successfully' });
        logSecurityEvent('session_settings_updated', sessionSettings);
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update session settings' });
    } finally {
      setSaving(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await performSecureOperation('terminate_session', async () => {
        setActiveSessions(sessions => sessions.filter(s => s.id !== sessionId));
        setMessage({ type: 'success', text: 'Session terminated successfully' });
        logSecurityEvent('session_terminated', { sessionId });
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate session' });
    }
  };

  // Additional 2FA functions
  const save2FASettings = async () => {
    setSaving(true);
    try {
      await performSecureOperation('save_2fa_settings', async () => {
        localStorage.setItem('twoFactorSettings', JSON.stringify(twoFactorSettings));
        setMessage({ type: 'success', text: '2FA settings saved successfully' });
        logSecurityEvent('2fa_settings_updated', twoFactorSettings);
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save 2FA settings' });
    } finally {
      setSaving(false);
    }
  };

  const generateBackupCodes = async () => {
    setSaving(true);
    try {
      await performSecureOperation('generate_backup_codes', async () => {
        const newCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setTwoFactorSettings({
          ...twoFactorSettings,
          backupCodes: newCodes
        });
        setMessage({ type: 'success', text: 'New backup codes generated successfully' });
        logSecurityEvent('backup_codes_generated');
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate backup codes' });
    } finally {
      setSaving(false);
    }
  };

  const renderBiometricTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Biometric Authentication</h2>
        <p className="mt-1 text-sm text-gray-600">
          Use your fingerprint or face to securely access your account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Fingerprint Authentication */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👆</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Fingerprint Authentication</h3>
              <p className="text-sm text-gray-600">
                Use your fingerprint to unlock your account
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {biometricSettings.fingerprintEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div>
            {biometricSettings.fingerprintEnabled ? (
              <button
                onClick={() => disableBiometric('fingerprint')}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Disabling...' : 'Disable'}
              </button>
            ) : (
              <button
                onClick={() => enableBiometric('fingerprint')}
                disabled={saving || !biometricSettings.supportedMethods.includes('fingerprint')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Enabling...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {/* Face ID Authentication */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Face ID Authentication</h3>
              <p className="text-sm text-gray-600">
                Use your face to unlock your account
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {biometricSettings.faceIdEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div>
            {biometricSettings.faceIdEnabled ? (
              <button
                onClick={() => disableBiometric('face')}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Disabling...' : 'Disable'}
              </button>
            ) : (
              <button
                onClick={() => enableBiometric('face')}
                disabled={saving || !biometricSettings.supportedMethods.includes('face')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Enabling...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {biometricSettings.lastUsed && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Last used: {biometricSettings.lastUsed.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTransactionLimitsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Transaction Limits</h2>
        <p className="mt-1 text-sm text-gray-600">
          Set customizable limits for your transactions to enhance security.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Limit (BDT)
            </label>
            <input
              type="number"
              min="1000"
              max="1000000"
              value={transactionLimits.dailyLimit}
              onChange={(e) => setTransactionLimits({
                ...transactionLimits,
                dailyLimit: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Limit (BDT)
            </label>
            <input
              type="number"
              min="10000"
              max="10000000"
              value={transactionLimits.monthlyLimit}
              onChange={(e) => setTransactionLimits({
                ...transactionLimits,
                monthlyLimit: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Single Transaction Limit (BDT)
            </label>
            <input
              type="number"
              min="100"
              max="500000"
              value={transactionLimits.singleTransactionLimit}
              onChange={(e) => setTransactionLimits({
                ...transactionLimits,
                singleTransactionLimit: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Require Approval Above (BDT)
            </label>
            <input
              type="number"
              min="10000"
              max="1000000"
              value={transactionLimits.requireApprovalAbove}
              onChange={(e) => setTransactionLimits({
                ...transactionLimits,
                requireApprovalAbove: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="internationalEnabled"
            checked={transactionLimits.internationalEnabled}
            onChange={(e) => setTransactionLimits({
              ...transactionLimits,
              internationalEnabled: e.target.checked
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="internationalEnabled" className="ml-2 text-sm text-gray-700">
            Enable international transactions
          </label>
        </div>

        <div className="pt-4">
          <button
            onClick={updateTransactionLimits}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Transaction Limits'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityAlertsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Security Alerts</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure how you want to be notified about security events.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Notification Methods</h3>
          
          {[
            { key: 'pushNotifications', label: 'Push Notifications', icon: '🔔' },
            { key: 'emailAlerts', label: 'Email Alerts', icon: '📧' },
            { key: 'smsAlerts', label: 'SMS Alerts', icon: '📱' }
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-600">
                    Receive notifications via {label.toLowerCase()}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts[key as keyof SecurityAlerts] as boolean}
                onChange={(e) => setSecurityAlerts({
                  ...securityAlerts,
                  [key]: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Alert Types</h3>
          
          {[
            { key: 'loginAlerts', label: 'Login Alerts', description: 'New device or location logins' },
            { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'All transaction notifications' },
            { key: 'suspiciousActivityAlerts', label: 'Suspicious Activity', description: 'Unusual account activity' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts[key as keyof SecurityAlerts] as boolean}
                onChange={(e) => setSecurityAlerts({
                  ...securityAlerts,
                  [key]: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={updateSecurityAlerts}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Alert Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDeviceManagementTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Device Management</h2>
        <p className="mt-1 text-sm text-gray-600">
          View and manage devices that have access to your account.
        </p>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">
                  {device.type === 'mobile' ? '📱' : device.type === 'tablet' ? '📱' : '💻'}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  {device.current && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Current
                    </span>
                  )}
                  {device.trusted && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Trusted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{device.os} • {device.browser}</p>
                <p className="text-sm text-gray-500">{device.location}</p>
                <p className="text-sm text-gray-500">
                  Last used: {device.lastUsed.toLocaleString()}
                </p>
              </div>
            </div>
            {!device.current && (
              <div className="flex space-x-2">
                {!device.trusted && (
                  <button
                    onClick={() => trustDevice(device.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Trust
                  </button>
                )}
                <button
                  onClick={() => removeDevice(device.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const render2FATab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add an extra layer of security to your account with app-based 2FA.
        </p>
      </div>

      <div className="space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              twoFactorSettings.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">{twoFactorSettings.enabled ? '🔐' : '🔓'}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600">
                {twoFactorSettings.enabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Enable 2FA to secure your account'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {twoFactorSettings.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div>
            {twoFactorSettings.enabled ? (
              <button
                onClick={disable2FA}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Disabling...' : 'Disable 2FA'}
              </button>
            ) : (
              <button
                onClick={enable2FA}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>

        {/* Authenticator Apps */}
        {!twoFactorSettings.enabled && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recommended Authenticator Apps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Google Authenticator', icon: '🔵', description: 'Free app by Google' },
                { name: 'Microsoft Authenticator', icon: '🟦', description: 'Free app by Microsoft' },
                { name: 'Authy', icon: '🔴', description: 'Multi-device support' }
              ].map((app) => (
                <div key={app.name} className="p-4 border rounded-lg text-center">
                  <div className="text-3xl mb-2">{app.icon}</div>
                  <h4 className="font-medium text-gray-900">{app.name}</h4>
                  <p className="text-sm text-gray-600">{app.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2FA Settings */}
         {twoFactorSettings.enabled && (
           <div className="space-y-4">
             <h3 className="font-medium text-gray-900">2FA Settings</h3>
             
             <div className="flex items-center justify-between p-4 border rounded-lg">
               <div>
                 <h4 className="font-medium text-gray-900">Require for Login</h4>
                 <p className="text-sm text-gray-600">Always require 2FA when signing in</p>
               </div>
               <input
                 type="checkbox"
                 checked={twoFactorSettings.requireForLogin}
                 onChange={(e) => setTwoFactorSettings({
                   ...twoFactorSettings,
                   requireForLogin: e.target.checked
                 })}
                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
               />
             </div>

             <div className="flex items-center justify-between p-4 border rounded-lg">
               <div>
                 <h4 className="font-medium text-gray-900">Require for Sensitive Actions</h4>
                 <p className="text-sm text-gray-600">Require 2FA for transfers and settings changes</p>
               </div>
               <input
                 type="checkbox"
                 checked={twoFactorSettings.requireForSensitiveActions}
                 onChange={(e) => setTwoFactorSettings({
                   ...twoFactorSettings,
                   requireForSensitiveActions: e.target.checked
                 })}
                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
               />
             </div>

             <div className="pt-4">
               <button
                 onClick={() => performSecureOperation('save_2fa_settings', save2FASettings)}
                 disabled={saving}
                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
               >
                 {saving ? 'Saving...' : 'Save 2FA Settings'}
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   );

  const renderPasswordPolicyTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Password Policy</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure password requirements and security settings.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                minLength: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              min="30"
              max="365"
              value={passwordPolicy.passwordExpiry}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                passwordExpiry: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={passwordPolicy.maxAttempts}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                maxAttempts: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lockout Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={passwordPolicy.lockoutDuration}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                lockoutDuration: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Password Requirements</h3>
          
          {[
            { key: 'requireUppercase', label: 'Require uppercase letters' },
            { key: 'requireLowercase', label: 'Require lowercase letters' },
            { key: 'requireNumbers', label: 'Require numbers' },
            { key: 'requireSpecialChars', label: 'Require special characters' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={passwordPolicy[key as keyof PasswordPolicy] as boolean}
                onChange={(e) => setPasswordPolicy({
                  ...passwordPolicy,
                  [key]: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={updatePasswordPolicy}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Password Policy'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSessionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Session Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure session timeout and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={sessionSettings.sessionTimeout}
              onChange={(e) => setSessionSettings({
                ...sessionSettings,
                sessionTimeout: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Sessions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={sessionSettings.maxConcurrentSessions}
              onChange={(e) => setSessionSettings({
                ...sessionSettings,
                maxConcurrentSessions: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {[
            { key: 'requireReauth', label: 'Require re-authentication for sensitive operations' },
            { key: 'logoutInactive', label: 'Automatically logout inactive users' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={sessionSettings[key as keyof SessionSettings] as boolean}
                onChange={(e) => setSessionSettings({
                  ...sessionSettings,
                  [key]: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={updateSessionSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Session Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Active Sessions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your active login sessions across different devices.
          </p>
        </div>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{session.device}</h3>
                  {session.current && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{session.location}</p>
                <p className="text-sm text-gray-500">
                  Last activity: {session.lastActivity.toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityLogsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Security Logs</h2>
        <p className="mt-1 text-sm text-gray-600">
          View recent security events and activities.
        </p>
      </div>

      {loadingLogs ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {securityLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No security logs available</p>
          ) : (
            securityLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  log.severity === 'high' ? 'bg-red-500' :
                  log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {log.event.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account security and privacy settings.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {[
                { name: '👆 Biometric', index: 0 },
                { name: '💰 Transaction Limits', index: 1 },
                { name: '🔔 Security Alerts', index: 2 },
                { name: '📱 Device Management', index: 3 },
                { name: '🔐 Two-Factor Auth', index: 4 },
                { name: '🔑 Password Policy', index: 5 },
                { name: '⏰ Sessions', index: 6 },
                { name: '📋 Security Logs', index: 7 }
              ].map((tab) => (
                <button
                  key={tab.index}
                  onClick={() => setActiveTab(tab.index)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div>
          {activeTab === 0 && renderBiometricTab()}
          {activeTab === 1 && renderTransactionLimitsTab()}
          {activeTab === 2 && renderSecurityAlertsTab()}
          {activeTab === 3 && renderDeviceManagementTab()}
          {activeTab === 4 && render2FATab()}
          {activeTab === 5 && renderPasswordPolicyTab()}
          {activeTab === 6 && renderSessionTab()}
          {activeTab === 7 && renderSecurityLogsTab()}
        </div>

        {/* 2FA Setup Modal */}
        {twoFactorDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Setup Two-Factor Authentication
              </h3>
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                {twoFactorSettings.qrCode && (
                  <img 
                    src={twoFactorSettings.qrCode} 
                    alt="2FA QR Code" 
                    className="mx-auto mb-4 w-48 h-48 border"
                  />
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setTwoFactorDialog(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={verify2FA}
                  disabled={saving || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;