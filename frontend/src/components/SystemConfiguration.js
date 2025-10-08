import React, { useState, useEffect } from 'react';

const SystemConfiguration = () => {
  const [activeTab, setActiveTab] = useState('service-settings');
  const [configurations, setConfigurations] = useState({
    serviceSettings: {
      moneyTransfer: { enabled: true, fee: 2.5, limit: 10000, operatingHours: { start: '08:00', end: '18:00' } },
      billPayment: { enabled: true, fee: 1.0, limit: 5000, operatingHours: { start: '00:00', end: '23:59' } },
      mobileRecharge: { enabled: true, fee: 0.5, limit: 1000, operatingHours: { start: '00:00', end: '23:59' } },
      loanServices: { enabled: true, fee: 5.0, limit: 50000, operatingHours: { start: '09:00', end: '17:00' } },
      currencyExchange: { enabled: false, fee: 3.0, limit: 25000, operatingHours: { start: '09:00', end: '16:00' } }
    },
    userTiers: {
      basic: {
        name: 'Basic',
        dailyLimit: 1000,
        monthlyLimit: 10000,
        transactionFee: 1.0,
        features: ['Money Transfer', 'Bill Payment', 'Mobile Recharge'],
        autoUpgrade: { enabled: false, threshold: 0 }
      },
      premium: {
        name: 'Premium',
        dailyLimit: 5000,
        monthlyLimit: 50000,
        transactionFee: 0.5,
        features: ['Money Transfer', 'Bill Payment', 'Mobile Recharge', 'Loan Services'],
        autoUpgrade: { enabled: true, threshold: 25000 }
      },
      enterprise: {
        name: 'Enterprise',
        dailyLimit: 25000,
        monthlyLimit: 250000,
        transactionFee: 0.25,
        features: ['All Services', 'Priority Support', 'Custom Limits'],
        autoUpgrade: { enabled: false, threshold: 0 }
      }
    },
    systemSecurity: {
      sessionTimeout: 30,
      twoFactorAuth: true,
      ipWhitelist: { enabled: false, addresses: [] },
      auditLog: { enabled: true, retention: 90, level: 'detailed' }
    },
    fraudPrevention: {
      suspiciousActivityThreshold: {
        dailyTransactionCount: 50,
        dailyTransactionAmount: 10000,
        velocityCheck: true
      },
      autoBlockRules: {
        multipleFailedLogins: { enabled: true, attempts: 5, duration: 30 },
        unusualLocation: { enabled: true, blockDuration: 60 },
        highRiskTransaction: { enabled: true, threshold: 5000 }
      },
      alertConfigurations: {
        email: { enabled: true, recipients: ['admin@ibltd.com'] },
        sms: { enabled: false, recipients: [] },
        dashboard: { enabled: true, realTime: true }
      }
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load configurations from API or localStorage
    const savedConfigs = localStorage.getItem('systemConfigurations');
    if (savedConfigs) {
      setConfigurations(JSON.parse(savedConfigs));
    }
  }, []);

  const handleConfigChange = (section, key, value) => {
    setConfigurations(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleNestedConfigChange = (section, parentKey, childKey, value) => {
    setConfigurations(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [childKey]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSaveConfigurations = async () => {
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('systemConfigurations', JSON.stringify(configurations));
      setUnsavedChanges(false);
      alert('Configurations saved successfully!');
    } catch (error) {
      alert('Error saving configurations: ' + error.message);
    }
  };

  const tabs = [
    { id: 'service-settings', label: 'Service Settings', icon: '⚙️' },
    { id: 'user-tiers', label: 'User Tiers', icon: '👥' },
    { id: 'system-security', label: 'System Security', icon: '🔒' },
    { id: 'fraud-prevention', label: 'Fraud Prevention', icon: '🛡️' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Configuration</h2>
        <button
          onClick={handleSaveConfigurations}
          disabled={!unsavedChanges}
          className={`px-4 py-2 rounded-lg font-medium ${
            unsavedChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'service-settings' && (
          <ServiceSettingsPanel 
            settings={configurations.serviceSettings}
            onChange={(key, value) => handleConfigChange('serviceSettings', key, value)}
            onNestedChange={(parentKey, childKey, value) => 
              handleNestedConfigChange('serviceSettings', parentKey, childKey, value)
            }
          />
        )}

        {activeTab === 'user-tiers' && (
          <UserTiersPanel 
            tiers={configurations.userTiers}
            onChange={(key, value) => handleConfigChange('userTiers', key, value)}
            onNestedChange={(parentKey, childKey, value) => 
              handleNestedConfigChange('userTiers', parentKey, childKey, value)
            }
          />
        )}

        {activeTab === 'system-security' && (
          <SystemSecurityPanel 
            settings={configurations.systemSecurity}
            onChange={(key, value) => handleConfigChange('systemSecurity', key, value)}
            onNestedChange={(parentKey, childKey, value) => 
              handleNestedConfigChange('systemSecurity', parentKey, childKey, value)
            }
          />
        )}

        {activeTab === 'fraud-prevention' && (
          <FraudPreventionPanel 
            settings={configurations.fraudPrevention}
            onChange={(key, value) => handleConfigChange('fraudPrevention', key, value)}
            onNestedChange={(parentKey, childKey, value) => 
              handleNestedConfigChange('fraudPrevention', parentKey, childKey, value)
            }
          />
        )}
      </div>
    </div>
  );
};

// Service Settings Panel Component
const ServiceSettingsPanel = ({ settings, onChange, onNestedChange }) => {
  const services = [
    { key: 'moneyTransfer', name: 'Money Transfer', icon: '💸' },
    { key: 'billPayment', name: 'Bill Payment', icon: '🧾' },
    { key: 'mobileRecharge', name: 'Mobile Recharge', icon: '📱' },
    { key: 'loanServices', name: 'Loan Services', icon: '🏦' },
    { key: 'currencyExchange', name: 'Currency Exchange', icon: '💱' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Configuration</h3>
      
      {services.map((service) => {
        const serviceConfig = settings[service.key];
        return (
          <div key={service.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{service.icon}</span>
                <h4 className="text-lg font-medium text-gray-800">{service.name}</h4>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={serviceConfig.enabled}
                  onChange={(e) => onNestedChange(service.key, 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className={serviceConfig.enabled ? 'text-green-600' : 'text-red-600'}>
                  {serviceConfig.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {serviceConfig.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={serviceConfig.fee}
                    onChange={(e) => onNestedChange(service.key, 'fee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Limit ($)
                  </label>
                  <input
                    type="number"
                    value={serviceConfig.limit}
                    onChange={(e) => onNestedChange(service.key, 'limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={serviceConfig.operatingHours.start}
                      onChange={(e) => onNestedChange(service.key, 'operatingHours', {
                        ...serviceConfig.operatingHours,
                        start: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="self-center">to</span>
                    <input
                      type="time"
                      value={serviceConfig.operatingHours.end}
                      onChange={(e) => onNestedChange(service.key, 'operatingHours', {
                        ...serviceConfig.operatingHours,
                        end: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// User Tiers Panel Component
const UserTiersPanel = ({ tiers, onChange, onNestedChange }) => {
  const tierKeys = ['basic', 'premium', 'enterprise'];
  const tierColors = {
    basic: 'bg-gray-100 border-gray-300',
    premium: 'bg-blue-100 border-blue-300',
    enterprise: 'bg-purple-100 border-purple-300'
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">User Tier Management</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tierKeys.map((tierKey) => {
          const tier = tiers[tierKey];
          return (
            <div key={tierKey} className={`rounded-lg border-2 p-4 ${tierColors[tierKey]}`}>
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-gray-800">{tier.name}</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Limit ($)
                  </label>
                  <input
                    type="number"
                    value={tier.dailyLimit}
                    onChange={(e) => onNestedChange(tierKey, 'dailyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Limit ($)
                  </label>
                  <input
                    type="number"
                    value={tier.monthlyLimit}
                    onChange={(e) => onNestedChange(tierKey, 'monthlyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.transactionFee}
                    onChange={(e) => onNestedChange(tierKey, 'transactionFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Features
                  </label>
                  <div className="space-y-1">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {tierKey !== 'enterprise' && (
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={tier.autoUpgrade.enabled}
                        onChange={(e) => onNestedChange(tierKey, 'autoUpgrade', {
                          ...tier.autoUpgrade,
                          enabled: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Auto Upgrade</span>
                    </label>
                    {tier.autoUpgrade.enabled && (
                      <input
                        type="number"
                        placeholder="Threshold amount ($)"
                        value={tier.autoUpgrade.threshold}
                        onChange={(e) => onNestedChange(tierKey, 'autoUpgrade', {
                          ...tier.autoUpgrade,
                          threshold: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// System Security Panel Component
const SystemSecurityPanel = ({ settings, onChange, onNestedChange }) => {
  const [newIpAddress, setNewIpAddress] = useState('');

  const addIpAddress = () => {
    if (newIpAddress && !settings.ipWhitelist.addresses.includes(newIpAddress)) {
      onNestedChange('ipWhitelist', 'addresses', [...settings.ipWhitelist.addresses, newIpAddress]);
      setNewIpAddress('');
    }
  };

  const removeIpAddress = (ip) => {
    onNestedChange('ipWhitelist', 'addresses', 
      settings.ipWhitelist.addresses.filter(address => address !== ip)
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">System Security Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-800 mb-4">🔐 Session Management</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => onChange('twoFactorAuth', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Two-Factor Authentication
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-800 mb-4">🌐 IP Whitelisting</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.ipWhitelist.enabled}
                  onChange={(e) => onNestedChange('ipWhitelist', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable IP Whitelisting
                </span>
              </label>
            </div>

            {settings.ipWhitelist.enabled && (
              <div>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter IP address"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addIpAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {settings.ipWhitelist.addresses.map((ip, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded border">
                      <span className="text-sm">{ip}</span>
                      <button
                        onClick={() => removeIpAddress(ip)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
          <h4 className="text-lg font-medium text-gray-800 mb-4">📋 Audit Log Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.auditLog.enabled}
                  onChange={(e) => onNestedChange('auditLog', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Audit Logging
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retention Period (days)
              </label>
              <input
                type="number"
                value={settings.auditLog.retention}
                onChange={(e) => onNestedChange('auditLog', 'retention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Log Level
              </label>
              <select
                value={settings.auditLog.level}
                onChange={(e) => onNestedChange('auditLog', 'level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="verbose">Verbose</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fraud Prevention Panel Component
const FraudPreventionPanel = ({ settings, onChange, onNestedChange }) => {
  const [newEmailRecipient, setNewEmailRecipient] = useState('');
  const [newSmsRecipient, setNewSmsRecipient] = useState('');

  const addEmailRecipient = () => {
    if (newEmailRecipient && !settings.alertConfigurations.email.recipients.includes(newEmailRecipient)) {
      onNestedChange('alertConfigurations', 'email', {
        ...settings.alertConfigurations.email,
        recipients: [...settings.alertConfigurations.email.recipients, newEmailRecipient]
      });
      setNewEmailRecipient('');
    }
  };

  const removeEmailRecipient = (email) => {
    onNestedChange('alertConfigurations', 'email', {
      ...settings.alertConfigurations.email,
      recipients: settings.alertConfigurations.email.recipients.filter(recipient => recipient !== email)
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Fraud Prevention Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-800 mb-4">🚨 Suspicious Activity Thresholds</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Transaction Count Limit
              </label>
              <input
                type="number"
                value={settings.suspiciousActivityThreshold.dailyTransactionCount}
                onChange={(e) => onNestedChange('suspiciousActivityThreshold', 'dailyTransactionCount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Transaction Amount Limit ($)
              </label>
              <input
                type="number"
                value={settings.suspiciousActivityThreshold.dailyTransactionAmount}
                onChange={(e) => onNestedChange('suspiciousActivityThreshold', 'dailyTransactionAmount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.suspiciousActivityThreshold.velocityCheck}
                  onChange={(e) => onNestedChange('suspiciousActivityThreshold', 'velocityCheck', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Velocity Checking
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-800 mb-4">🔒 Auto-Block Rules</h4>
          
          <div className="space-y-4">
            <div className="border-b pb-3">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.autoBlockRules.multipleFailedLogins.enabled}
                  onChange={(e) => onNestedChange('autoBlockRules', 'multipleFailedLogins', {
                    ...settings.autoBlockRules.multipleFailedLogins,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Multiple Failed Logins</span>
              </label>
              {settings.autoBlockRules.multipleFailedLogins.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Max attempts"
                    value={settings.autoBlockRules.multipleFailedLogins.attempts}
                    onChange={(e) => onNestedChange('autoBlockRules', 'multipleFailedLogins', {
                      ...settings.autoBlockRules.multipleFailedLogins,
                      attempts: parseInt(e.target.value)
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Block duration (min)"
                    value={settings.autoBlockRules.multipleFailedLogins.duration}
                    onChange={(e) => onNestedChange('autoBlockRules', 'multipleFailedLogins', {
                      ...settings.autoBlockRules.multipleFailedLogins,
                      duration: parseInt(e.target.value)
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="border-b pb-3">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.autoBlockRules.unusualLocation.enabled}
                  onChange={(e) => onNestedChange('autoBlockRules', 'unusualLocation', {
                    ...settings.autoBlockRules.unusualLocation,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Unusual Location</span>
              </label>
              {settings.autoBlockRules.unusualLocation.enabled && (
                <input
                  type="number"
                  placeholder="Block duration (min)"
                  value={settings.autoBlockRules.unusualLocation.blockDuration}
                  onChange={(e) => onNestedChange('autoBlockRules', 'unusualLocation', {
                    ...settings.autoBlockRules.unusualLocation,
                    blockDuration: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.autoBlockRules.highRiskTransaction.enabled}
                  onChange={(e) => onNestedChange('autoBlockRules', 'highRiskTransaction', {
                    ...settings.autoBlockRules.highRiskTransaction,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">High Risk Transaction</span>
              </label>
              {settings.autoBlockRules.highRiskTransaction.enabled && (
                <input
                  type="number"
                  placeholder="Risk threshold ($)"
                  value={settings.autoBlockRules.highRiskTransaction.threshold}
                  onChange={(e) => onNestedChange('autoBlockRules', 'highRiskTransaction', {
                    ...settings.autoBlockRules.highRiskTransaction,
                    threshold: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
          <h4 className="text-lg font-medium text-gray-800 mb-4">📧 Alert Configurations</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={settings.alertConfigurations.email.enabled}
                  onChange={(e) => onNestedChange('alertConfigurations', 'email', {
                    ...settings.alertConfigurations.email,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Email Alerts</span>
              </label>
              
              {settings.alertConfigurations.email.enabled && (
                <div>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={newEmailRecipient}
                      onChange={(e) => setNewEmailRecipient(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addEmailRecipient}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {settings.alertConfigurations.email.recipients.map((email, index) => (
                      <div key={index} className="flex justify-between items-center bg-white px-2 py-1 rounded border">
                        <span className="text-xs">{email}</span>
                        <button
                          onClick={() => removeEmailRecipient(email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={settings.alertConfigurations.sms.enabled}
                  onChange={(e) => onNestedChange('alertConfigurations', 'sms', {
                    ...settings.alertConfigurations.sms,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">SMS Alerts</span>
              </label>
              
              {settings.alertConfigurations.sms.enabled && (
                <div>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={newSmsRecipient}
                    onChange={(e) => setNewSmsRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <button
                    onClick={() => {
                      if (newSmsRecipient) {
                        onNestedChange('alertConfigurations', 'sms', {
                          ...settings.alertConfigurations.sms,
                          recipients: [...settings.alertConfigurations.sms.recipients, newSmsRecipient]
                        });
                        setNewSmsRecipient('');
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add SMS Recipient
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={settings.alertConfigurations.dashboard.enabled}
                  onChange={(e) => onNestedChange('alertConfigurations', 'dashboard', {
                    ...settings.alertConfigurations.dashboard,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Dashboard Alerts</span>
              </label>
              
              {settings.alertConfigurations.dashboard.enabled && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alertConfigurations.dashboard.realTime}
                    onChange={(e) => onNestedChange('alertConfigurations', 'dashboard', {
                      ...settings.alertConfigurations.dashboard,
                      realTime: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Real-time notifications</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;