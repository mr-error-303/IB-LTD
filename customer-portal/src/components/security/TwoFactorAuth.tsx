import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Copy,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onVerify: (code: string) => Promise<boolean>;
}

interface BackupCode {
  code: string;
  used: boolean;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isEnabled, onToggle, onVerify }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [showSecret, setShowSecret] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'setup' && method === 'app') {
      generateQRCode();
    }
  }, [step, method]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate QR code
      await new Promise(resolve => setTimeout(resolve, 1000));
      const secret = 'JBSWY3DPEHPK3PXP';
      setSecretKey(secret);
      setQrCode(`otpauth://totp/BankApp:user@example.com?secret=${secret}&issuer=BankApp`);
    } catch (err) {
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = () => {
    const codes: BackupCode[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push({
        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        used: false
      });
    }
    setBackupCodes(codes);
  };

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await onVerify(verificationCode);
      if (isValid) {
        generateBackupCodes();
        setStep('backup');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = verificationCode.split('');
    newCode[index] = value;
    setVerificationCode(newCode.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.map(code => code.code).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resendCode = async () => {
    setTimeLeft(30);
    setLoading(true);
    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h3>
          </div>
          <button
            onClick={() => {
              onToggle(true);
              setStep('setup');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable 2FA
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h3>
        </div>
        {step === 'complete' && (
          <button
            onClick={() => onToggle(false)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disable 2FA
          </button>
        )}
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Choose Authentication Method
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setMethod('app')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  method === 'app'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900 dark:text-white">Authenticator App</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Use Google Authenticator or similar app
                </div>
              </button>

              <button
                onClick={() => setMethod('sms')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  method === 'sms'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900 dark:text-white">SMS</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Receive codes via text message
                </div>
              </button>

              <button
                onClick={() => setMethod('email')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  method === 'email'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900 dark:text-white">Email</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Receive codes via email
                </div>
              </button>
            </div>
          </div>

          {method === 'app' && (
            <div className="space-y-4">
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-600">QR Code</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manual Entry Key
                  </span>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                    {showSecret ? secretKey : '••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secretKey)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {method === 'sms' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {method === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <button
            onClick={() => setStep('verify')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Enter Verification Code
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {method === 'app' && 'Enter the 6-digit code from your authenticator app'}
              {method === 'sms' && `Enter the code sent to ${phoneNumber}`}
              {method === 'email' && `Enter the code sent to ${email}`}
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={verificationCode[index] || ''}
                onChange={(e) => handleCodeInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Code expires in {timeLeft}s</span>
            </div>
            <button
              onClick={resendCode}
              disabled={timeLeft > 0 || loading}
              className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>

          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6 || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>Verify Code</span>
          </button>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Save Your Backup Codes
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Store these codes in a safe place. You can use them to access your account if you lose your device.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-900 dark:text-white">Backup Codes</span>
              <button
                onClick={downloadBackupCodes}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((backup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border"
                >
                  <code className="text-sm">{backup.code}</code>
                  <button
                    onClick={() => copyToClipboard(backup.code)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <div className="font-medium mb-1">Important:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Each backup code can only be used once</li>
                  <li>Store these codes in a secure location</li>
                  <li>Don't share these codes with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('complete')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Two-Factor Authentication Enabled
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Your account is now protected with two-factor authentication.
          </p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;