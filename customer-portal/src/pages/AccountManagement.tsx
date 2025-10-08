import React, { useState } from 'react';
import { ArrowLeft, Download, Settings, Users, Eye, EyeOff, Copy, Check, Plus, Edit, Trash2, User, Building, CreditCard, Calendar, DollarSign, FileText, Shield, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  // Mock data
  const accountData = {
    accountNumber: '1234567890123456',
    accountType: 'Savings Account',
    balance: 125750.50,
    availableBalance: 123250.50,
    branch: 'Main Branch',
    ifscCode: 'IBLT0001234',
    openingDate: '2020-03-15',
    status: 'Active'
  };

  const beneficiaries = [
    { id: 1, name: 'John Smith', accountNumber: '9876543210', bank: 'ABC Bank', ifsc: 'ABCD0001234' },
    { id: 2, name: 'Sarah Johnson', accountNumber: '5432109876', bank: 'XYZ Bank', ifsc: 'XYZB0005678' },
    { id: 3, name: 'Michael Brown', accountNumber: '1357924680', bank: 'PQR Bank', ifsc: 'PQRB0009012' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadStatement = (period: string) => {
    // Mock download functionality
    alert(`Downloading ${period} statement...`);
  };

  const renderAccountDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Account Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Available Balance</p>
            <p className="text-2xl font-bold">${accountData.availableBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Balance</p>
            <p className="text-xl font-semibold">${accountData.balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Account Number</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-gray-800">
                  {showAccountNumber ? accountData.accountNumber : '••••••••••••' + accountData.accountNumber.slice(-4)}
                </span>
                <button
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(accountData.accountNumber)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Account Type</label>
              <p className="text-gray-800 font-medium">{accountData.accountType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Branch</label>
              <p className="text-gray-800 font-medium">{accountData.branch}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">IFSC Code</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-gray-800">{accountData.ifscCode}</span>
                <button
                  onClick={() => copyToClipboard(accountData.ifscCode)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Opening Date</label>
              <p className="text-gray-800 font-medium">{new Date(accountData.openingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {accountData.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatementDownload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">Download Account Statements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { period: 'Last 30 Days', icon: Calendar, color: 'blue' },
            { period: 'Last 3 Months', icon: Calendar, color: 'green' },
            { period: 'Last 6 Months', icon: Calendar, color: 'purple' },
            { period: 'Last Year', icon: Calendar, color: 'orange' },
            { period: 'Custom Range', icon: Calendar, color: 'red' },
            { period: 'Tax Statement', icon: FileText, color: 'indigo' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => downloadStatement(item.period)}
              className={`p-4 rounded-xl border-2 border-${item.color}-200 hover:border-${item.color}-400 hover:bg-${item.color}-50 transition-all duration-200 group`}
            >
              <div className="text-center">
                <div className={`bg-${item.color}-100 p-3 rounded-lg mx-auto mb-3 group-hover:bg-${item.color}-200 transition-colors`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <h5 className="font-medium text-gray-800 mb-1">{item.period}</h5>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">Account Settings</h4>
        <div className="space-y-4">
          {[
            { icon: Bell, title: 'Notification Preferences', description: 'Manage email and SMS notifications', action: 'Configure' },
            { icon: Lock, title: 'Security Settings', description: 'Update password and security questions', action: 'Manage' },
            { icon: CreditCard, title: 'Debit Card Settings', description: 'Manage card limits and preferences', action: 'Update' },
            { icon: DollarSign, title: 'Transaction Limits', description: 'Set daily and monthly limits', action: 'Modify' },
            { icon: Shield, title: 'Two-Factor Authentication', description: 'Enable additional security layer', action: 'Setup' },
            { icon: FileText, title: 'Statement Preferences', description: 'Choose delivery method and frequency', action: 'Edit' }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <setting.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">{setting.title}</h5>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {setting.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBeneficiaryManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">Beneficiary Management</h4>
          <button
            onClick={() => setShowAddBeneficiary(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Beneficiary</span>
          </button>
        </div>

        <div className="space-y-4">
          {beneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">{beneficiary.name}</h5>
                  <p className="text-sm text-gray-500">
                    {beneficiary.bank} • {beneficiary.accountNumber} • {beneficiary.ifsc}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddBeneficiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Beneficiary</h4>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter beneficiary name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBeneficiary(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-800">Account Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Account Details', icon: Building },
              { id: 'statements', label: 'Statement Download', icon: Download },
              { id: 'settings', label: 'Account Settings', icon: Settings },
              { id: 'beneficiaries', label: 'Beneficiary Management', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'details' && renderAccountDetails()}
        {activeTab === 'statements' && renderStatementDownload()}
        {activeTab === 'settings' && renderAccountSettings()}
        {activeTab === 'beneficiaries' && renderBeneficiaryManagement()}
      </div>
    </div>
  );
};

export default AccountManagement;