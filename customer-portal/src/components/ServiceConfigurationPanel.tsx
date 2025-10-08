import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit3,
  Plus,
  Trash2
} from 'lucide-react';

interface TransferLimit {
  id: string;
  type: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  enabled: boolean;
}

interface TransactionFee {
  id: string;
  service: string;
  feeType: 'fixed' | 'percentage';
  amount: number;
  minimumFee?: number;
  maximumFee?: number;
  enabled: boolean;
}

interface ServiceAvailability {
  id: string;
  serviceName: string;
  enabled: boolean;
  maintenanceMode: boolean;
  description: string;
}

interface OperatingHours {
  id: string;
  service: string;
  startTime: string;
  endTime: string;
  days: string[];
  timezone: string;
  enabled: boolean;
}

const ServiceConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('limits');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Transfer Limits State
  const [transferLimits, setTransferLimits] = useState<TransferLimit[]>([
    {
      id: '1',
      type: 'Domestic Transfer',
      dailyLimit: 50000,
      monthlyLimit: 1000000,
      singleTransactionLimit: 25000,
      enabled: true
    },
    {
      id: '2',
      type: 'International Transfer',
      dailyLimit: 25000,
      monthlyLimit: 500000,
      singleTransactionLimit: 15000,
      enabled: true
    },
    {
      id: '3',
      type: 'Mobile Top-up',
      dailyLimit: 5000,
      monthlyLimit: 50000,
      singleTransactionLimit: 1000,
      enabled: true
    },
    {
      id: '4',
      type: 'Bill Payment',
      dailyLimit: 100000,
      monthlyLimit: 2000000,
      singleTransactionLimit: 50000,
      enabled: true
    }
  ]);

  // Transaction Fees State
  const [transactionFees, setTransactionFees] = useState<TransactionFee[]>([
    {
      id: '1',
      service: 'Domestic Transfer',
      feeType: 'fixed',
      amount: 25,
      enabled: true
    },
    {
      id: '2',
      service: 'International Transfer',
      feeType: 'percentage',
      amount: 2.5,
      minimumFee: 100,
      maximumFee: 5000,
      enabled: true
    },
    {
      id: '3',
      service: 'Mobile Top-up',
      feeType: 'fixed',
      amount: 5,
      enabled: true
    },
    {
      id: '4',
      service: 'Bill Payment',
      feeType: 'percentage',
      amount: 1.0,
      minimumFee: 10,
      maximumFee: 500,
      enabled: true
    }
  ]);

  // Service Availability State
  const [serviceAvailability, setServiceAvailability] = useState<ServiceAvailability[]>([
    {
      id: '1',
      serviceName: 'Fund Transfers',
      enabled: true,
      maintenanceMode: false,
      description: 'All domestic and international transfers'
    },
    {
      id: '2',
      serviceName: 'Bill Payments',
      enabled: true,
      maintenanceMode: false,
      description: 'Utility and service bill payments'
    },
    {
      id: '3',
      serviceName: 'Mobile Top-up',
      enabled: true,
      maintenanceMode: false,
      description: 'Mobile airtime and data top-up'
    },
    {
      id: '4',
      serviceName: 'Cash Withdrawals',
      enabled: true,
      maintenanceMode: true,
      description: 'ATM and branch cash withdrawals'
    },
    {
      id: '5',
      serviceName: 'Account Opening',
      enabled: false,
      maintenanceMode: false,
      description: 'New account registration service'
    }
  ]);

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([
    {
      id: '1',
      service: 'Fund Transfers',
      startTime: '06:00',
      endTime: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timezone: 'GMT+1',
      enabled: true
    },
    {
      id: '2',
      service: 'Bill Payments',
      startTime: '00:00',
      endTime: '23:59',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timezone: 'GMT+1',
      enabled: true
    },
    {
      id: '3',
      service: 'Mobile Top-up',
      startTime: '05:00',
      endTime: '23:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timezone: 'GMT+1',
      enabled: true
    },
    {
      id: '4',
      service: 'Cash Withdrawals',
      startTime: '08:00',
      endTime: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'GMT+1',
      enabled: true
    }
  ]);

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateTransferLimit = (id: string, field: keyof TransferLimit, value: any) => {
    setTransferLimits(prev => prev.map(limit => 
      limit.id === id ? { ...limit, [field]: value } : limit
    ));
  };

  const updateTransactionFee = (id: string, field: keyof TransactionFee, value: any) => {
    setTransactionFees(prev => prev.map(fee => 
      fee.id === id ? { ...fee, [field]: value } : fee
    ));
  };

  const updateServiceAvailability = (id: string, field: keyof ServiceAvailability, value: any) => {
    setServiceAvailability(prev => prev.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const updateOperatingHours = (id: string, field: keyof OperatingHours, value: any) => {
    setOperatingHours(prev => prev.map(hours => 
      hours.id === id ? { ...hours, [field]: value } : hours
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const renderTransferLimits = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transfer Limits Configuration</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add New Limit
        </button>
      </div>

      <div className="grid gap-6">
        {transferLimits.map((limit) => (
          <div key={limit.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{limit.type}</h4>
                <p className="text-sm text-gray-500">Configure limits for {limit.type.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTransferLimit(limit.id, 'enabled', !limit.enabled)}
                  className="flex items-center"
                >
                  {limit.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Single Transaction Limit
                </label>
                <input
                  type="number"
                  value={limit.singleTransactionLimit}
                  onChange={(e) => updateTransferLimit(limit.id, 'singleTransactionLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!limit.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(limit.singleTransactionLimit)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Limit
                </label>
                <input
                  type="number"
                  value={limit.dailyLimit}
                  onChange={(e) => updateTransferLimit(limit.id, 'dailyLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!limit.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(limit.dailyLimit)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  value={limit.monthlyLimit}
                  onChange={(e) => updateTransferLimit(limit.id, 'monthlyLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!limit.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(limit.monthlyLimit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactionFees = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transaction Fees Configuration</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add New Fee
        </button>
      </div>

      <div className="grid gap-6">
        {transactionFees.map((fee) => (
          <div key={fee.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{fee.service}</h4>
                <p className="text-sm text-gray-500">Configure fees for {fee.service.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTransactionFee(fee.id, 'enabled', !fee.enabled)}
                  className="flex items-center"
                >
                  {fee.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type
                </label>
                <select
                  value={fee.feeType}
                  onChange={(e) => updateTransactionFee(fee.id, 'feeType', e.target.value as 'fixed' | 'percentage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!fee.enabled}
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fee.feeType === 'fixed' ? 'Amount (₦)' : 'Percentage (%)'}
                </label>
                <input
                  type="number"
                  step={fee.feeType === 'percentage' ? '0.1' : '1'}
                  value={fee.amount}
                  onChange={(e) => updateTransactionFee(fee.id, 'amount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!fee.enabled}
                />
              </div>

              {fee.feeType === 'percentage' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Fee (₦)
                    </label>
                    <input
                      type="number"
                      value={fee.minimumFee || 0}
                      onChange={(e) => updateTransactionFee(fee.id, 'minimumFee', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!fee.enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Fee (₦)
                    </label>
                    <input
                      type="number"
                      value={fee.maximumFee || 0}
                      onChange={(e) => updateTransactionFee(fee.id, 'maximumFee', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!fee.enabled}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Current Fee Structure:</strong> {' '}
                {fee.feeType === 'fixed' 
                  ? formatCurrency(fee.amount)
                  : `${fee.amount}% (Min: ${formatCurrency(fee.minimumFee || 0)}, Max: ${formatCurrency(fee.maximumFee || 0)})`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServiceAvailability = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Service Availability</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="grid gap-4">
        {serviceAvailability.map((service) => (
          <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                  <div className="flex items-center gap-2">
                    {service.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Disabled
                      </span>
                    )}
                    {service.maintenanceMode && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Maintenance
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{service.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">Service</span>
                  <button
                    onClick={() => updateServiceAvailability(service.id, 'enabled', !service.enabled)}
                    className="flex items-center"
                  >
                    {service.enabled ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">Maintenance</span>
                  <button
                    onClick={() => updateServiceAvailability(service.id, 'maintenanceMode', !service.maintenanceMode)}
                    className="flex items-center"
                    disabled={!service.enabled}
                  >
                    {service.maintenanceMode ? (
                      <ToggleRight className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOperatingHours = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Operating Hours</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      <div className="grid gap-6">
        {operatingHours.map((hours) => (
          <div key={hours.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{hours.service}</h4>
                <p className="text-sm text-gray-500">Service operating schedule</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateOperatingHours(hours.id, 'enabled', !hours.enabled)}
                  className="flex items-center"
                >
                  {hours.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={hours.startTime}
                  onChange={(e) => updateOperatingHours(hours.id, 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!hours.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={hours.endTime}
                  onChange={(e) => updateOperatingHours(hours.id, 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!hours.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={hours.timezone}
                  onChange={(e) => updateOperatingHours(hours.id, 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!hours.enabled}
                >
                  <option value="GMT+1">GMT+1 (WAT)</option>
                  <option value="GMT">GMT (UTC)</option>
                  <option value="GMT+2">GMT+2 (CAT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                  {hours.startTime && hours.endTime ? (
                    `${Math.abs(
                      new Date(`2000-01-01T${hours.endTime}`).getTime() - 
                      new Date(`2000-01-01T${hours.startTime}`).getTime()
                    ) / (1000 * 60 * 60)} hours`
                  ) : (
                    'Set times'
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const newDays = hours.days.includes(day)
                        ? hours.days.filter(d => d !== day)
                        : [...hours.days, day];
                      updateOperatingHours(hours.id, 'days', newDays);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      hours.days.includes(day)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                    disabled={!hours.enabled}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                Service Configuration Panel
              </h1>
              <p className="text-gray-600 mt-2">
                Configure service settings, limits, fees, and availability
              </p>
            </div>

            <div className="flex items-center gap-4">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Configuration saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Save failed</span>
                </div>
              )}
              
              <button
                onClick={handleSaveConfiguration}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'limits', label: 'Transfer Limits', icon: DollarSign },
              { id: 'fees', label: 'Transaction Fees', icon: DollarSign },
              { id: 'availability', label: 'Service Availability', icon: ToggleRight },
              { id: 'hours', label: 'Operating Hours', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'limits' && renderTransferLimits()}
          {activeTab === 'fees' && renderTransactionFees()}
          {activeTab === 'availability' && renderServiceAvailability()}
          {activeTab === 'hours' && renderOperatingHours()}
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigurationPanel;