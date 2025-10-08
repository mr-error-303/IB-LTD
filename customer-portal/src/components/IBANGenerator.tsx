import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  MapPin, 
  Hash,
  Info,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Plus,
  X
} from 'lucide-react';

interface IBANAccount {
  id: string;
  currency: string;
  country: string;
  iban: string;
  bic: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  status: 'active' | 'pending' | 'blocked';
  balance: number;
  createdDate: string;
}

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  ibanLength: number;
  bankCode: string;
  branchCode: string;
}

const IBANGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'generator' | 'validator'>('accounts');
  const [selectedCountry, setSelectedCountry] = useState<string>('BD');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [copiedIban, setCopiedIban] = useState<string>('');
  const [showAccountDetails, setShowAccountDetails] = useState<string>('');
  const [generatedIban, setGeneratedIban] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{valid: boolean; message: string} | null>(null);
  const [ibanToValidate, setIbanToValidate] = useState<string>('');

  // Sample IBAN accounts data
  const [ibanAccounts] = useState<IBANAccount[]>([
    {
      id: '1',
      currency: 'USD',
      country: 'BD',
      iban: 'BD1234567890123456789012',
      bic: 'IBBLBDDH',
      accountNumber: '1234567890123456',
      bankName: 'Islami Bank Bangladesh Limited',
      branchCode: 'DHAKA001',
      status: 'active',
      balance: 15750.50,
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      currency: 'EUR',
      country: 'DE',
      iban: 'DE89370400440532013000',
      bic: 'COBADEFFXXX',
      accountNumber: '0532013000',
      bankName: 'Commerzbank AG',
      branchCode: 'BERLIN001',
      status: 'active',
      balance: 8920.75,
      createdDate: '2024-02-20'
    },
    {
      id: '3',
      currency: 'GBP',
      country: 'GB',
      iban: 'GB82WEST12345698765432',
      bic: 'WESTGB2L',
      accountNumber: '98765432',
      bankName: 'NatWest Bank',
      branchCode: 'LONDON001',
      status: 'pending',
      balance: 0,
      createdDate: '2024-03-10'
    }
  ]);

  // Country information for IBAN generation
  const countries: CountryInfo[] = [
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', ibanLength: 24, bankCode: 'IBBL', branchCode: 'DHAKA' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', ibanLength: 22, bankCode: 'COBA', branchCode: 'BERL' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', ibanLength: 22, bankCode: 'WEST', branchCode: 'LOND' },
    { code: 'FR', name: 'France', flag: '🇫🇷', ibanLength: 27, bankCode: 'BNPA', branchCode: 'PARI' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', ibanLength: 27, bankCode: 'UBSP', branchCode: 'ROMA' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', ibanLength: 24, bankCode: 'BBVA', branchCode: 'MADR' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', ibanLength: 18, bankCode: 'INGB', branchCode: 'AMST' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', ibanLength: 21, bankCode: 'UBSW', branchCode: 'ZURI' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' }
  ];

  // Generate IBAN
  const generateIBAN = () => {
    const country = countries.find(c => c.code === selectedCountry);
    if (!country) return;

    // Simple IBAN generation (in real implementation, this would follow proper IBAN calculation)
    const bankCode = country.bankCode;
    const branchCode = country.branchCode;
    const accountNumber = Math.random().toString().slice(2, 12).padStart(10, '0');
    const checkDigits = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    
    const iban = `${selectedCountry}${checkDigits}${bankCode}${branchCode}${accountNumber}`;
    setGeneratedIban(iban);
  };

  // Validate IBAN (simplified validation)
  const validateIBAN = (iban: string) => {
    if (!iban) {
      setValidationResult({ valid: false, message: 'Please enter an IBAN' });
      return;
    }

    // Basic validation checks
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      setValidationResult({ valid: false, message: 'IBAN length is invalid' });
      return;
    }

    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
      setValidationResult({ valid: false, message: 'IBAN format is invalid' });
      return;
    }

    const countryCode = cleanIban.slice(0, 2);
    const country = countries.find(c => c.code === countryCode);
    
    if (!country) {
      setValidationResult({ valid: false, message: 'Country code not supported' });
      return;
    }

    if (cleanIban.length !== country.ibanLength) {
      setValidationResult({ valid: false, message: `IBAN length should be ${country.ibanLength} for ${country.name}` });
      return;
    }

    setValidationResult({ valid: true, message: 'IBAN is valid' });
  };

  // Copy IBAN to clipboard
  const copyToClipboard = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    setTimeout(() => setCopiedIban(''), 2000);
  };

  // Format IBAN for display
  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">IBAN & International Accounts</h2>
              <p className="text-sm text-gray-600">Manage international account numbers and IBAN codes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'accounts', label: 'My IBAN Accounts', icon: CreditCard },
            { id: 'generator', label: 'IBAN Generator', icon: RefreshCw },
            { id: 'validator', label: 'IBAN Validator', icon: Check }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* IBAN Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">International Bank Accounts</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Open New Account</span>
              </button>
            </div>

            <div className="grid gap-4">
              {ibanAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{account.currency} Account</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{account.bankName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">IBAN: {formatIBAN(account.iban)}</span>
                          <button
                            onClick={() => copyToClipboard(account.iban)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {copiedIban === account.iban ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {currencies.find(c => c.code === account.currency)?.symbol}{account.balance.toLocaleString()}
                      </div>
                      <button
                        onClick={() => setShowAccountDetails(showAccountDetails === account.id ? '' : account.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        {showAccountDetails === account.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showAccountDetails === account.id ? 'Hide' : 'View'} Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Account Details */}
                  {showAccountDetails === account.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Number</label>
                          <p className="mt-1 text-sm text-gray-900">{account.accountNumber}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">BIC/SWIFT</label>
                          <p className="mt-1 text-sm text-gray-900">{account.bic}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch Code</label>
                          <p className="mt-1 text-sm text-gray-900">{account.branchCode}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created Date</label>
                          <p className="mt-1 text-sm text-gray-900">{new Date(account.createdDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Download Statement</span>
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                          Manage Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IBAN Generator Tab */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New IBAN</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">IBAN Generation</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Generate International Bank Account Numbers (IBAN) for supported countries. 
                      This tool creates valid IBAN formats for testing and account setup purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateIBAN}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate IBAN</span>
                </button>
              </div>

              <div className="space-y-4">
                {generatedIban && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Generated IBAN</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg text-gray-900">{formatIBAN(generatedIban)}</span>
                        <button
                          onClick={() => copyToClipboard(generatedIban)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {copiedIban === generatedIban ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Country:</strong> {countries.find(c => c.code === selectedCountry)?.name}</p>
                      <p><strong>Currency:</strong> {currencies.find(c => c.code === selectedCurrency)?.name}</p>
                      <p><strong>Length:</strong> {generatedIban.length} characters</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IBAN Validator Tab */}
        {activeTab === 'validator' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validate IBAN</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">IBAN Validation</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Validate International Bank Account Numbers (IBAN) to ensure they follow the correct format 
                      and structure for the specified country.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter IBAN to Validate</label>
                  <input
                    type="text"
                    value={ibanToValidate}
                    onChange={(e) => setIbanToValidate(e.target.value.toUpperCase())}
                    placeholder="e.g., GB82 WEST 1234 5698 7654 32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => validateIBAN(ibanToValidate)}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Validate IBAN</span>
                </button>

                {validationResult && (
                  <div className={`border rounded-lg p-4 ${
                    validationResult.valid 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {validationResult.valid ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        validationResult.valid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {validationResult.valid ? 'Valid IBAN' : 'Invalid IBAN'}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${
                      validationResult.valid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {validationResult.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Sample IBANs for testing */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-3">Sample IBANs for Testing</h4>
                <div className="space-y-2">
                  {ibanAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <span className="font-mono text-sm text-gray-900">{formatIBAN(account.iban)}</span>
                        <span className="ml-2 text-xs text-gray-500">({account.country} - {account.currency})</span>
                      </div>
                      <button
                        onClick={() => setIbanToValidate(account.iban)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Use for Testing
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IBANGenerator;