import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';

interface AccountInfo {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  openDate: string;
  branchName: string;
  ifscCode: string;
}

const Account: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    // Mock account data - replace with actual API call
    setAccountInfo({
      accountNumber: user?.accountNumber || '1234567890',
      accountType: 'Savings Account',
      balance: 50000,
      currency: 'BDT',
      status: 'Active',
      openDate: '2023-01-15',
      branchName: 'Dhaka Main Branch',
      ifscCode: 'IBLT0001234'
    });
  }, [user]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!accountInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('account') || 'Account Details'}
        </h1>
        <p className="text-gray-600">
          {t('accountSubtitle') || 'View your account information and details'}
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">{accountInfo.accountType}</h2>
              <p className="text-blue-100">{accountInfo.branchName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">{t('accountNumber') || 'Account Number'}</p>
            <div className="flex items-center">
              <span className="text-lg font-mono">{accountInfo.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(accountInfo.accountNumber, 'account')}
                className="ml-2 p-1 hover:bg-blue-500 rounded"
              >
                {copied === 'account' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">{t('availableBalance') || 'Available Balance'}</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {showBalance ? formatBalance(accountInfo.balance) : '••••••••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="ml-3 p-1 hover:bg-blue-500 rounded"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              accountInfo.status === 'Active' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {accountInfo.status}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('accountInformation') || 'Account Information'}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accountType') || 'Account Type'}:</span>
              <span className="font-medium">{accountInfo.accountType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('currency') || 'Currency'}:</span>
              <span className="font-medium">{accountInfo.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('openDate') || 'Account Opened'}:</span>
              <span className="font-medium">
                {new Date(accountInfo.openDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('status') || 'Status'}:</span>
              <span className={`font-medium ${
                accountInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {accountInfo.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('branchDetails') || 'Branch Details'}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('branchName') || 'Branch Name'}:</span>
              <span className="font-medium">{accountInfo.branchName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('ifscCode') || 'IFSC Code'}:</span>
              <div className="flex items-center">
                <span className="font-medium font-mono">{accountInfo.ifscCode}</span>
                <button
                  onClick={() => copyToClipboard(accountInfo.ifscCode, 'ifsc')}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {copied === 'ifsc' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('quickActions') || 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 font-medium">{t('downloadStatement') || 'Download Statement'}</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 font-medium">{t('requestCheckbook') || 'Request Checkbook'}</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 font-medium">{t('updateKyc') || 'Update KYC'}</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 font-medium">{t('blockCard') || 'Block/Unblock Card'}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
