import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Smartphone, 
  Globe, 
  CreditCard, 
  FileText, 
  QrCode, 
  History, 
  Users, 
  Star, 
  Calendar, 
  Shield, 
  Plus, 
  Search, 
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  type: 'own' | 'other' | 'international';
  isVerified: boolean;
}

interface TransferOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  fee: string;
  processingTime: string;
  description: string;
}

interface TransferCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  color: string;
}

const FundTransfer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'categories' | 'details' | 'confirm' | 'success'>('categories');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState<'success' | 'failed' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'IB Bank Limited',
      ifscCode: 'IBBL0001',
      type: 'own',
      isVerified: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      accountNumber: '9876543210',
      bankName: 'Sonali Bank Limited',
      ifscCode: 'SONB0001',
      type: 'other',
      isVerified: true
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    recipientName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    mobileNumber: '',
    amount: '',
    purpose: '',
    remarks: '',
    transferMethod: '', // For EFT/NPSB selection
    mobileWallet: '', // For mobile wallet selection
    country: '', // For international transfers
    swiftCode: ''
  });
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [showAddBeneficiaryForm, setShowAddBeneficiaryForm] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [addBeneficiaryFormData, setAddBeneficiaryFormData] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    type: 'other' as 'own' | 'other' | 'international'
  });

  const transferCategories: TransferCategory[] = [
    {
      id: 'own-bank',
      title: 'Own Bank',
      description: 'Transfer to IB Bank accounts',
      icon: <Building2 className="w-6 h-6" />,
      bgColor: 'bg-blue-100',
      color: 'text-blue-600'
    },
    {
      id: 'other-bank',
      title: 'Other Bank',
      description: 'Transfer to other banks',
      icon: <ArrowRight className="w-6 h-6" />,
      bgColor: 'bg-green-100',
      color: 'text-green-600'
    },
    {
      id: 'mobile-wallets',
      title: 'Mobile Wallets',
      description: 'bKash, Nagad, Rocket',
      icon: <Smartphone className="w-6 h-6" />,
      bgColor: 'bg-purple-100',
      color: 'text-purple-600'
    },
    {
      id: 'international',
      title: 'International',
      description: 'Send money abroad',
      icon: <Globe className="w-6 h-6" />,
      bgColor: 'bg-orange-100',
      color: 'text-orange-600'
    },
    {
      id: 'utility',
      title: 'Utility Payments',
      description: 'Pay bills and utilities',
      icon: <CreditCard className="w-6 h-6" />,
      bgColor: 'bg-red-100',
      color: 'text-red-600'
    },
    {
      id: 'statement',
      title: 'St. Instruction',
      description: 'Standing instructions',
      icon: <FileText className="w-6 h-6" />,
      bgColor: 'bg-indigo-100',
      color: 'text-indigo-600'
    },
    {
      id: 'qr-code',
      title: 'QR Code',
      description: 'Scan and pay',
      icon: <QrCode className="w-6 h-6" />,
      bgColor: 'bg-teal-100',
      color: 'text-teal-600'
    },
    {
      id: 'history',
      title: 'Fund Transfer History',
      description: 'View past transfers',
      icon: <History className="w-6 h-6" />,
      bgColor: 'bg-gray-100',
      color: 'text-gray-600'
    }
  ];

  // Comprehensive list of Bangladesh banks for EFT/NPSB transfers
  const bangladeshBanks = [
    'AB Bank Limited',
    'Agrani Bank Limited',
    'Al-Arafah Islami Bank Limited',
    'Bangladesh Commerce Bank Limited',
    'Bangladesh Development Bank Limited',
    'Bangladesh Krishi Bank',
    'Bank Asia Limited',
    'BASIC Bank Limited',
    'BRAC Bank Limited',
    'City Bank Limited',
    'Community Bank Bangladesh Limited',
    'Dhaka Bank Limited',
    'Dutch-Bangla Bank Limited',
    'Eastern Bank Limited',
    'Export Import Bank of Bangladesh Limited',
    'First Security Islami Bank Limited',
    'Global Islami Bank Limited',
    'Grameen Bank',
    'ICB Islamic Bank Limited',
    'IFIC Bank Limited',
    'Islami Bank Bangladesh Limited',
    'Jamuna Bank Limited',
    'Janata Bank Limited',
    'Meghna Bank Limited',
    'Mercantile Bank Limited',
    'Midland Bank Limited',
    'Modhumoti Bank Limited',
    'Mutual Trust Bank Limited',
    'National Bank Limited',
    'National Credit & Commerce Bank Limited',
    'NRB Bank Limited',
    'NRB Commercial Bank Limited',
    'NRB Global Bank Limited',
    'One Bank Limited',
    'Padma Bank Limited',
    'Premier Bank Limited',
    'Prime Bank Limited',
    'Pubali Bank Limited',
    'Rajshahi Krishi Unnayan Bank',
    'Rupali Bank Limited',
    'Shahjalal Islami Bank Limited',
    'Social Islami Bank Limited',
    'Sonali Bank Limited',
    'Southeast Bank Limited',
    'Standard Bank Limited',
    'State Bank of India',
    'The City Bank Limited',
    'Trust Bank Limited',
    'Union Bank Limited',
    'United Commercial Bank Limited',
    'Uttara Bank Limited'
  ];

  // Comprehensive list of mobile wallets in Bangladesh
  const mobileWallets = [
    { name: 'bKash', code: 'bkash', description: 'Most popular mobile wallet' },
    { name: 'Nagad', code: 'nagad', description: 'Digital financial service' },
    { name: 'Rocket', code: 'rocket', description: 'Dutch-Bangla Bank mobile wallet' },
    { name: 'Upay', code: 'upay', description: 'UCB Fintech mobile wallet' },
    { name: 'SureCash', code: 'surecash', description: 'BRAC Bank mobile wallet' },
    { name: 'MyCash', code: 'mycash', description: 'Mercantile Bank mobile wallet' },
    { name: 'OK Wallet', code: 'okwallet', description: 'One Bank mobile wallet' },
    { name: 'TeleCash', code: 'telecash', description: 'Trust Bank mobile wallet' },
    { name: 'iPay', code: 'ipay', description: 'IFIC Bank mobile wallet' },
    { name: 'Tap', code: 'tap', description: 'AB Bank mobile wallet' }
  ];

  // International banks by country
  const internationalBanks: { [key: string]: string[] } = {
    'United States': [
      'JPMorgan Chase Bank',
      'Bank of America',
      'Wells Fargo Bank',
      'Citibank',
      'U.S. Bank',
      'PNC Bank',
      'Goldman Sachs Bank',
      'TD Bank',
      'Capital One Bank',
      'HSBC Bank USA'
    ],
    'United Kingdom': [
      'Barclays Bank',
      'HSBC UK Bank',
      'Lloyds Bank',
      'NatWest Bank',
      'Santander UK',
      'Standard Chartered Bank',
      'Royal Bank of Scotland',
      'TSB Bank',
      'Metro Bank',
      'Monzo Bank'
    ],
    'Canada': [
      'Royal Bank of Canada',
      'Toronto-Dominion Bank',
      'Bank of Nova Scotia',
      'Bank of Montreal',
      'Canadian Imperial Bank',
      'National Bank of Canada',
      'HSBC Bank Canada',
      'Desjardins Bank',
      'Laurentian Bank',
      'Canadian Western Bank'
    ],
    'Australia': [
      'Commonwealth Bank',
      'Westpac Banking Corporation',
      'Australia and New Zealand Banking Group',
      'National Australia Bank',
      'Macquarie Bank',
      'Bendigo Bank',
      'Bank of Queensland',
      'Suncorp Bank',
      'ING Bank Australia',
      'HSBC Bank Australia'
    ],
    'Germany': [
      'Deutsche Bank',
      'Commerzbank',
      'DZ Bank',
      'KfW Bank',
      'Landesbank Baden-Württemberg',
      'Bayerische Landesbank',
      'NRW.Bank',
      'LBBW Bank',
      'Helaba Bank',
      'HSH Nordbank'
    ],
    'France': [
      'BNP Paribas',
      'Crédit Agricole',
      'Société Générale',
      'Groupe BPCE',
      'Crédit Mutuel',
      'La Banque Postale',
      'HSBC France',
      'Crédit du Nord',
      'Banque Populaire',
      'Caisse d\'Épargne'
    ],
    'Japan': [
      'Mitsubishi UFJ Financial Group',
      'Sumitomo Mitsui Banking Corporation',
      'Mizuho Bank',
      'Japan Post Bank',
      'Resona Bank',
      'Sumitomo Mitsui Trust Bank',
      'Norinchukin Bank',
      'Shinsei Bank',
      'Aozora Bank',
      'Seven Bank'
    ],
    'Singapore': [
      'DBS Bank',
      'Oversea-Chinese Banking Corporation',
      'United Overseas Bank',
      'Standard Chartered Singapore',
      'HSBC Singapore',
      'Citibank Singapore',
      'Maybank Singapore',
      'Bank of China Singapore',
      'ANZ Singapore',
      'RHB Bank Singapore'
    ],
    'India': [
      'State Bank of India',
      'HDFC Bank',
      'ICICI Bank',
      'Punjab National Bank',
      'Bank of Baroda',
      'Canara Bank',
      'Union Bank of India',
      'Bank of India',
      'Indian Bank',
      'Central Bank of India'
    ],
    'Malaysia': [
      'Maybank',
      'CIMB Bank',
      'Public Bank',
      'RHB Bank',
      'Hong Leong Bank',
      'AmBank',
      'Alliance Bank',
      'HSBC Malaysia',
      'Standard Chartered Malaysia',
      'Citibank Malaysia'
    ]
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    switch (categoryId) {
      case 'own-bank':
      case 'other-bank':
      case 'mobile-wallets':
      case 'international':
      case 'utility':
        setShowTransferForm(true);
        setCurrentStep('details');
        break;
      case 'history':
        window.location.href = '/statement';
        break;
      case 'qr-code':
        window.location.href = '/qr-payment';
        break;
      case 'statement':
        console.log('Opening standing instructions');
        break;
      default:
        console.log('Category not implemented:', categoryId);
    }
  };

  const handleBackToCategories = () => {
    setShowTransferForm(false);
    setCurrentStep('categories');
    setSelectedCategory('');
    setTransferFormData({
      recipientName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      mobileNumber: '',
      amount: '',
      purpose: '',
      remarks: '',
      transferMethod: '',
      mobileWallet: '',
      country: '',
      swiftCode: ''
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('confirm');
  };

  const handleConfirmTransfer = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTransactionResult('success');
      setShowStatusPopup(true);
    }, 2000);
  };

  const handleQuickActionClick = (action: string) => {
    switch (action) {
      case 'beneficiaries':
        setShowBeneficiaryModal(true);
        break;
      case 'favorites':
        console.log('Showing favorites');
        break;
      case 'scheduled':
        console.log('Showing scheduled transfers');
        break;
      case 'secure-pay':
        console.log('Showing secure pay');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setTransferFormData({
      ...transferFormData,
      recipientName: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bankName: beneficiary.bankName,
      ifscCode: beneficiary.ifscCode
    });
    setShowBeneficiaryModal(false);
    setShowTransferForm(true);
    setCurrentStep('details');
    
    if (beneficiary.type === 'own') {
      setSelectedCategory('own-bank');
    } else {
      setSelectedCategory('other-bank');
    }
  };

  const handleAddBeneficiary = (newBeneficiary: Omit<Beneficiary, 'id' | 'isVerified'>) => {
    const beneficiary: Beneficiary = {
      ...newBeneficiary,
      id: Date.now().toString(),
      isVerified: false
    };
    setBeneficiaries([...beneficiaries, beneficiary]);
    setShowAddBeneficiaryForm(false);
  };

  const renderBeneficiaryModal = () => {
    const filteredBeneficiaries = beneficiaries.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.accountNumber.includes(searchTerm)
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Select Beneficiary</h2>
              <button
                onClick={() => setShowBeneficiaryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search beneficiaries..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {filteredBeneficiaries.length > 0 ? (
              <div className="p-4 space-y-3">
                {filteredBeneficiaries.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    onClick={() => handleSelectBeneficiary(beneficiary)}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{beneficiary.name}</h3>
                        <p className="text-sm text-gray-600">{beneficiary.bankName}</p>
                        <p className="text-sm text-gray-500">****{beneficiary.accountNumber.slice(-4)}</p>
                      </div>
                      <div className="flex items-center">
                        {beneficiary.isVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        )}
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No beneficiaries found</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowBeneficiaryModal(false);
                setShowAddBeneficiaryForm(true);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Beneficiary
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddBeneficiaryForm = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddBeneficiary(addBeneficiaryFormData);
      setAddBeneficiaryFormData({
        name: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        type: 'other'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add Beneficiary</h2>
              <button
                onClick={() => setShowAddBeneficiaryForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={addBeneficiaryFormData.name}
                  onChange={(e) => setAddBeneficiaryFormData({...addBeneficiaryFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter beneficiary name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={addBeneficiaryFormData.accountNumber}
                  onChange={(e) => setAddBeneficiaryFormData({...addBeneficiaryFormData, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={addBeneficiaryFormData.bankName}
                  onChange={(e) => setAddBeneficiaryFormData({...addBeneficiaryFormData, bankName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={addBeneficiaryFormData.ifscCode}
                  onChange={(e) => setAddBeneficiaryFormData({...addBeneficiaryFormData, ifscCode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={addBeneficiaryFormData.type}
                  onChange={(e) => setAddBeneficiaryFormData({...addBeneficiaryFormData, type: e.target.value as 'own' | 'other' | 'international'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="own">Own Bank</option>
                  <option value="other">Other Bank</option>
                  <option value="international">International</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Beneficiary
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusPopup = () => {
    const handleTrackingClick = () => {
      setShowStatusPopup(false);
      // Navigate to tracking page
      window.location.href = '/fund-transfer-tracking';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Transfer Submitted
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">In Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference ID:</span>
                <span className="font-medium">TXN{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{transferFormData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{transferFormData.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-medium">1-2 business days</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your transfer request has been submitted and is currently under review. 
              You will be notified once the transfer is processed.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTrackingClick}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Fund Transfer Status Tracking
              </button>
              
              <button
                onClick={() => setShowStatusPopup(false)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransferForm = () => {
    const categoryInfo = transferCategories.find(cat => cat.id === selectedCategory);
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToCategories}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className={`${categoryInfo?.bgColor} ${categoryInfo?.color} p-3 rounded-full mr-3`}>
              {categoryInfo?.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{categoryInfo?.title}</h2>
              <p className="text-gray-500 text-sm">{categoryInfo?.description}</p>
            </div>
          </div>
        </div>

        {currentStep === 'details' && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Recipient Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={transferFormData.recipientName}
                  onChange={(e) => setTransferFormData({...transferFormData, recipientName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recipient name"
                  required
                />
              </div>

              {selectedCategory === 'mobile-wallets' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Wallet Service
                    </label>
                    <select
                      value={transferFormData.mobileWallet}
                      onChange={(e) => setTransferFormData({...transferFormData, mobileWallet: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select mobile wallet</option>
                      {mobileWallets.map((wallet) => (
                        <option key={wallet.code} value={wallet.code}>
                          {wallet.name} - {wallet.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={transferFormData.mobileNumber}
                      onChange={(e) => setTransferFormData({...transferFormData, mobileNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={transferFormData.accountNumber}
                      onChange={(e) => setTransferFormData({...transferFormData, accountNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter account number"
                      required
                    />
                  </div>

                  {selectedCategory === 'other-bank' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transfer Method
                        </label>
                        <select
                          value={transferFormData.transferMethod}
                          onChange={(e) => setTransferFormData({...transferFormData, transferMethod: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select transfer method</option>
                          <option value="EFT">EFT (Electronic Fund Transfer)</option>
                          <option value="NPSB">NPSB (National Payment Switch Bangladesh)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <select
                          value={transferFormData.bankName}
                          onChange={(e) => setTransferFormData({...transferFormData, bankName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select bank</option>
                          {bangladeshBanks.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={transferFormData.ifscCode}
                          onChange={(e) => setTransferFormData({...transferFormData, ifscCode: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter routing number"
                          required
                        />
                      </div>
                    </>
                  )}

                  {selectedCategory === 'international' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          value={transferFormData.country}
                          onChange={(e) => setTransferFormData({...transferFormData, country: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select country</option>
                          {Object.keys(internationalBanks).map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>

                      {transferFormData.country && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <select
                            value={transferFormData.bankName}
                            onChange={(e) => setTransferFormData({...transferFormData, bankName: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select bank</option>
                            {internationalBanks[transferFormData.country]?.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SWIFT Code
                        </label>
                        <input
                          type="text"
                          value={transferFormData.swiftCode}
                          onChange={(e) => setTransferFormData({...transferFormData, swiftCode: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter SWIFT code"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Transfer Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={transferFormData.amount}
                  onChange={(e) => setTransferFormData({...transferFormData, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  value={transferFormData.purpose}
                  onChange={(e) => setTransferFormData({...transferFormData, purpose: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select purpose</option>
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="family">Family Support</option>
                  <option value="education">Education</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={transferFormData.remarks}
                  onChange={(e) => setTransferFormData({...transferFormData, remarks: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter remarks"
                  rows={3}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Confirm Transfer</h3>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{transferFormData.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{transferFormData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose:</span>
                <span className="font-medium">{transferFormData.purpose}</span>
              </div>
              {transferFormData.remarks && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Remarks:</span>
                  <span className="font-medium">{transferFormData.remarks}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep('details')}
                className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transfer Successful!</h3>
              <p className="text-gray-600">Your transfer of ৳{transferFormData.amount} has been processed successfully.</p>
            </div>
            <button
              onClick={handleBackToCategories}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Make Another Transfer
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {transactionResult === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Transfer Successful</h3>
                <p className="text-sm text-green-600">Your fund transfer has been completed successfully.</p>
              </div>
            </div>
          </div>
        )}

        {transactionResult === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-600 rounded-full mr-3"></div>
              <div>
                <h3 className="font-medium text-red-800">Transfer Failed</h3>
                <p className="text-sm text-red-600">There was an issue processing your transfer. Please try again.</p>
              </div>
            </div>
          </div>
        )}

        {showTransferForm ? (
          renderTransferForm()
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Fund Transfer</h1>
              <p className="text-gray-600">Send money quickly and securely</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {transferCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className={`${category.bgColor} ${category.color} p-4 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleQuickActionClick('beneficiaries')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-800">Manage Beneficiaries</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => handleQuickActionClick('favorites')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-800">Favorite Recipients</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => handleQuickActionClick('scheduled')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-800">Scheduled Transfers</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => handleQuickActionClick('secure-pay')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-800">Secure Pay</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transfers</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">John Doe</p>
                        <p className="text-sm text-gray-600">IB Bank Limited</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">৳5,000</p>
                      <p className="text-sm text-gray-600">Today</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Smartphone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">bKash Transfer</p>
                        <p className="text-sm text-gray-600">01712345678</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">৳2,500</p>
                      <p className="text-sm text-gray-600">Yesterday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Jane Smith</p>
                        <p className="text-sm text-gray-600">Sonali Bank</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">৳10,000</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showBeneficiaryModal && renderBeneficiaryModal()}
        {showAddBeneficiaryForm && renderAddBeneficiaryForm()}
        {showStatusPopup && renderStatusPopup()}
      </div>
    </div>
  );
};

export default FundTransfer;