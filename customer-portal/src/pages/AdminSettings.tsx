import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { useNotifications } from '../components/common/NotificationSystem';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  transactionLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    singleTransactionLimit: number;
  };
  fees: {
    transferFee: number;
    billPaymentFee: number;
    withdrawalFee: number;
  };
  currencies: string[];
  supportedLanguages: string[];
}

const AdminSettings: React.FC = () => {
  const { t } = useLanguage();
  const { showError, showSuccess, showInfo } = useNotifications();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'IB Bank',
    siteDescription: 'Your trusted banking partner',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    transactionLimits: {
      dailyLimit: 100000,
      monthlyLimit: 1000000,
      singleTransactionLimit: 50000
    },
    fees: {
      transferFee: 10,
      billPaymentFee: 5,
      withdrawalFee: 15
    },
    currencies: ['BDT', 'USD', 'EUR'],
    supportedLanguages: ['en', 'bn']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'limits' | 'fees' | 'notifications'>('general');

  useEffect(() => {
    // Simulate API call to fetch settings
    const fetchSettings = async () => {
      try {
        // Mock data - replace with actual API call
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        const appError = handleError(error, 'AdminSettings');
        log.error('Error fetching settings', appError, 'AdminSettings');
        showError('Failed to load settings. Please try again.');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      const appError = handleError(error, 'AdminSettings');
      log.error('Error saving settings', appError, 'AdminSettings');
      showError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'general', label: 'General Settings' },
              { id: 'limits', label: 'Transaction Limits' },
              { id: 'fees', label: 'Fees & Charges' },
              { id: 'notifications', label: 'Notifications' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <input
                    type="text"
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                    <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Registration</label>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.registrationEnabled}
                    onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Currencies
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.currencies.map((currency, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.supportedLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                    >
                      {lang === 'en' ? 'English' : 'বাংলা'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Limits Tab */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Transaction Limits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Limit (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.transactionLimits.dailyLimit}
                    onChange={(e) => handleSettingChange('transactionLimits.dailyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Limit (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.transactionLimits.monthlyLimit}
                    onChange={(e) => handleSettingChange('transactionLimits.monthlyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Transaction Limit (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.transactionLimits.singleTransactionLimit}
                    onChange={(e) => handleSettingChange('transactionLimits.singleTransactionLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Important Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Changes to transaction limits will affect all users immediately. Please ensure compliance with regulatory requirements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fees & Charges Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Fees & Charges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.transferFee}
                    onChange={(e) => handleSettingChange('fees.transferFee', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill Payment Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.billPaymentFee}
                    onChange={(e) => handleSettingChange('fees.billPaymentFee', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.withdrawalFee}
                    onChange={(e) => handleSettingChange('fees.withdrawalFee', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Fee Structure Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Fee changes will be applied to new transactions. Existing scheduled transactions will use the previous fee structure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Send email notifications for transactions and alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-sm text-gray-500">Send SMS notifications for critical transactions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaction Confirmations</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Alerts</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Updates</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Maintenance</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;