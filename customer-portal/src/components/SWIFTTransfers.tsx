import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Banknote, 
  FileText, 
  Calendar, 
  User, 
  CreditCard,
  Network,
  Lock,
  Zap,
  DollarSign
} from 'lucide-react';

interface SWIFTBank {
  id: string;
  name: string;
  swiftCode: string;
  country: string;
  city: string;
  address: string;
  correspondent: boolean;
  intermediary?: string;
  fees: {
    incoming: number;
    outgoing: number;
    currency: string;
  };
  processingTime: string;
  rating: number;
}

interface SWIFTTransfer {
  id: string;
  recipientBank: string;
  swiftCode: string;
  amount: number;
  currency: string;
  purpose: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  date: string;
  estimatedArrival: string;
  fees: number;
  intermediaryBank?: string;
}

interface TransferPurpose {
  code: string;
  description: string;
  category: string;
  requiresDocuments: boolean;
}

const SWIFTTransfers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'search' | 'history' | 'tracking'>('send');
  const [selectedBank, setSelectedBank] = useState<SWIFTBank | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');

  // SWIFT Banks Database
  const [swiftBanks] = useState<SWIFTBank[]>([
    {
      id: 'chase-us',
      name: 'JPMorgan Chase Bank N.A.',
      swiftCode: 'CHASUS33',
      country: 'United States',
      city: 'New York',
      address: '270 Park Avenue, New York, NY 10017',
      correspondent: true,
      fees: { incoming: 15, outgoing: 25, currency: 'USD' },
      processingTime: '1-2 business days',
      rating: 4.8
    },
    {
      id: 'hsbc-uk',
      name: 'HSBC Bank PLC',
      swiftCode: 'HBUKGB4B',
      country: 'United Kingdom',
      city: 'London',
      address: '8 Canada Square, London E14 5HQ',
      correspondent: true,
      fees: { incoming: 12, outgoing: 20, currency: 'GBP' },
      processingTime: '1-3 business days',
      rating: 4.6
    },
    {
      id: 'deutsche-de',
      name: 'Deutsche Bank AG',
      swiftCode: 'DEUTDEFF',
      country: 'Germany',
      city: 'Frankfurt',
      address: 'Taunusanlage 12, 60325 Frankfurt am Main',
      correspondent: true,
      intermediary: 'CHASUS33',
      fees: { incoming: 10, outgoing: 18, currency: 'EUR' },
      processingTime: '2-4 business days',
      rating: 4.4
    },
    {
      id: 'bnp-fr',
      name: 'BNP Paribas',
      swiftCode: 'BNPAFRPP',
      country: 'France',
      city: 'Paris',
      address: '16 Boulevard des Italiens, 75009 Paris',
      correspondent: false,
      intermediary: 'HBUKGB4B',
      fees: { incoming: 8, outgoing: 15, currency: 'EUR' },
      processingTime: '2-5 business days',
      rating: 4.3
    },
    {
      id: 'mizuho-jp',
      name: 'Mizuho Bank Ltd.',
      swiftCode: 'MHCBJPJT',
      country: 'Japan',
      city: 'Tokyo',
      address: '1-5-5 Otemachi, Chiyoda-ku, Tokyo 100-8176',
      correspondent: true,
      fees: { incoming: 20, outgoing: 30, currency: 'JPY' },
      processingTime: '1-3 business days',
      rating: 4.5
    },
    {
      id: 'dbs-sg',
      name: 'DBS Bank Ltd.',
      swiftCode: 'DBSSSGSG',
      country: 'Singapore',
      city: 'Singapore',
      address: '12 Marina Boulevard, Marina Bay Financial Centre Tower 3',
      correspondent: true,
      fees: { incoming: 15, outgoing: 25, currency: 'SGD' },
      processingTime: '1-2 business days',
      rating: 4.7
    }
  ]);

  // Transfer Purposes
  const [transferPurposes] = useState<TransferPurpose[]>([
    { code: 'P0101', description: 'Payment for goods', category: 'Trade', requiresDocuments: true },
    { code: 'P0102', description: 'Payment for services', category: 'Trade', requiresDocuments: true },
    { code: 'P0201', description: 'Salary payment', category: 'Employment', requiresDocuments: false },
    { code: 'P0301', description: 'Family maintenance', category: 'Personal', requiresDocuments: false },
    { code: 'P0302', description: 'Education expenses', category: 'Personal', requiresDocuments: true },
    { code: 'P0401', description: 'Investment in securities', category: 'Investment', requiresDocuments: true },
    { code: 'P0501', description: 'Loan repayment', category: 'Financial', requiresDocuments: true },
    { code: 'P0601', description: 'Property purchase', category: 'Real Estate', requiresDocuments: true }
  ]);

  // Transfer History
  const [transferHistory] = useState<SWIFTTransfer[]>([
    {
      id: 'SW001',
      recipientBank: 'JPMorgan Chase Bank N.A.',
      swiftCode: 'CHASUS33',
      amount: 50000,
      currency: 'USD',
      purpose: 'Investment in securities',
      status: 'completed',
      reference: 'FT2024001234',
      date: '2024-01-10',
      estimatedArrival: '2024-01-12',
      fees: 25
    },
    {
      id: 'SW002',
      recipientBank: 'HSBC Bank PLC',
      swiftCode: 'HBUKGB4B',
      amount: 25000,
      currency: 'GBP',
      purpose: 'Property purchase',
      status: 'processing',
      reference: 'FT2024001235',
      date: '2024-01-12',
      estimatedArrival: '2024-01-15',
      fees: 20
    },
    {
      id: 'SW003',
      recipientBank: 'Deutsche Bank AG',
      swiftCode: 'DEUTDEFF',
      amount: 75000,
      currency: 'EUR',
      purpose: 'Payment for services',
      status: 'pending',
      reference: 'FT2024001236',
      date: '2024-01-13',
      estimatedArrival: '2024-01-17',
      fees: 18,
      intermediaryBank: 'CHASUS33'
    }
  ]);

  // Filter banks based on search
  const filteredBanks = swiftBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.swiftCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate total fees
  const calculateTotalFees = (amount: number, bank: SWIFTBank): number => {
    const baseAmount = amount;
    const swiftFee = bank.fees.outgoing;
    const intermediaryFee = bank.intermediary ? 15 : 0;
    const correspondentFee = bank.correspondent ? 0 : 10;
    
    return swiftFee + intermediaryFee + correspondentFee;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SWIFT Network Transfers</h1>
              <p className="text-gray-600">Secure bank-to-bank transfers via the global SWIFT network</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Network Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>New Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* SWIFT Network Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">SWIFT Network Security</h3>
            <p className="text-blue-700 text-sm mb-3">
              All transfers are processed through the secure SWIFT (Society for Worldwide Interbank Financial Telecommunication) 
              network, ensuring the highest level of security and compliance with international banking standards.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">Global network coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">Regulatory compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send Transfer', icon: Building2 },
              { id: 'search', label: 'Bank Directory', icon: Search },
              { id: 'history', label: 'Transfer History', icon: FileText },
              { id: 'tracking', label: 'Track Transfer', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Send Transfer */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Initiate SWIFT Transfer</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Bank Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Recipient Bank</label>
                    {selectedBank ? (
                      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-blue-900">{selectedBank.name}</div>
                              <div className="text-sm text-blue-700">{selectedBank.swiftCode}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedBank(null)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Change
                          </button>
                        </div>
                        <div className="text-sm text-blue-700">
                          <div>{selectedBank.city}, {selectedBank.country}</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span>Fee: {selectedBank.fees.currency} {selectedBank.fees.outgoing}</span>
                            <span>Processing: {selectedBank.processingTime}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="text-center text-gray-500">
                          <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No bank selected</p>
                          <button
                            onClick={() => setActiveTab('search')}
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                          >
                            Search Banks
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Purpose</label>
                      <select
                        value={selectedPurpose}
                        onChange={(e) => setSelectedPurpose(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select purpose</option>
                        {transferPurposes.map((purpose) => (
                          <option key={purpose.code} value={purpose.code}>
                            {purpose.code} - {purpose.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Reference</label>
                      <input
                        type="text"
                        placeholder="Optional reference for your records"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Recipient Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recipient Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          placeholder="Full name as per bank records"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number / IBAN</label>
                        <input
                          type="text"
                          placeholder="Account number or IBAN"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                        <textarea
                          rows={3}
                          placeholder="Complete address of the account holder"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  {transferAmount && selectedBank && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-medium text-blue-900 mb-4">Transfer Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Transfer Amount:</span>
                          <span className="font-medium text-blue-900">USD {parseFloat(transferAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">SWIFT Fee:</span>
                          <span className="font-medium text-blue-900">USD {selectedBank.fees.outgoing}</span>
                        </div>
                        {selectedBank.intermediary && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Intermediary Fee:</span>
                            <span className="font-medium text-blue-900">USD 15</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-blue-200">
                          <span className="font-medium text-blue-900">Total Cost:</span>
                          <span className="font-bold text-blue-900">
                            USD {(parseFloat(transferAmount) + calculateTotalFees(parseFloat(transferAmount), selectedBank)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Processing Time:</span>
                          <span className="font-medium text-blue-900">{selectedBank.processingTime}</span>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 font-medium">
                        Initiate SWIFT Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Directory */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">SWIFT Bank Directory</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by bank name, SWIFT code, or location"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredBanks.map((bank) => (
                  <div key={bank.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{bank.name}</h4>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                              {bank.swiftCode}
                            </span>
                            {bank.correspondent && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                Correspondent
                              </span>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>{bank.city}, {bank.country}</span>
                              </div>
                              <div className="text-sm text-gray-500">{bank.address}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Outgoing Fee: </span>
                                <span className="font-medium">{bank.fees.currency} {bank.fees.outgoing}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Processing: </span>
                                <span className="font-medium">{bank.processingTime}</span>
                              </div>
                              {bank.intermediary && (
                                <div className="text-sm">
                                  <span className="text-gray-500">Via: </span>
                                  <span className="font-medium font-mono">{bank.intermediary}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => {
                            setSelectedBank(bank);
                            setActiveTab('send');
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Select Bank
                        </button>
                        <button 
                          onClick={() => setShowBankDetails(!showBankDetails)}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfer History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">SWIFT Transfer History</h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Network className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipientBank}</div>
                          <div className="text-sm text-gray-500 font-mono">{transfer.swiftCode}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">{transfer.currency} {transfer.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>
                        <div className="font-medium">{transfer.purpose}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <div className="font-medium font-mono">{transfer.reference}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{new Date(transfer.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {transfer.intermediaryBank && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm text-yellow-800">
                          <Info className="w-4 h-4" />
                          <span>Routed via intermediary bank: {transfer.intermediaryBank}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track Transfer */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Track SWIFT Transfer</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter transfer reference number (e.g., FT2024001234)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Track
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Enter your transfer reference number to track the status and progress of your SWIFT transfer.
                </p>
              </div>

              {/* Sample tracking result */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900">Transfer Reference: FT2024001235</h4>
                    <p className="text-sm text-gray-500">To HSBC Bank PLC (HBUKGB4B)</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Processing
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Transfer Initiated</div>
                      <div className="text-sm text-gray-500">Jan 12, 2024 at 10:30 AM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Compliance Check Completed</div>
                      <div className="text-sm text-gray-500">Jan 12, 2024 at 11:15 AM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Processing via SWIFT Network</div>
                      <div className="text-sm text-gray-500">In progress...</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">Credited to Recipient Account</div>
                      <div className="text-sm text-gray-400">Estimated: Jan 15, 2024</div>
                    </div>
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

export default SWIFTTransfers;