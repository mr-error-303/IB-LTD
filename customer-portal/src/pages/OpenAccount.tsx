import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  TrendingUp,
  Award,
  Star,
  Globe,
  Check,
  Eye,
  Trash2,
  Camera,
  Edit,
  DollarSign,
  Info,
  RefreshCw
} from 'lucide-react';
import { persistentCache } from '../utils/cacheManager';

interface AccountType {
  id: string;
  name: string;
  type: 'savings' | 'current' | 'fixed' | 'salary' | 'student' | 'foreign' | 'joint';
  description: string;
  minimumBalance: number;
  interestRate: number;
  features: string[];
  benefits: string[];
  fees: {
    maintenance: number;
    atmWithdrawal: number;
    checkbook: number;
  };
  eligibility: string[];
  documents: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

interface ApplicationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  nidNumber: string;
  passportNumber: string;
  phone: string;
  email: string;
  occupation: string;
  monthlyIncome: string;
  sourceOfIncome: string;
}

interface AddressInfo {
  presentAddress: string;
  presentCity: string;
  presentPostalCode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentPostalCode: string;
  sameAsPermanent: boolean;
}

interface DocumentInfo {
  nidFront: File | null;
  nidBack: File | null;
  passport: File | null;
  photo: File | null;
  signature: File | null;
  incomeProof: File | null;
  addressProof: File | null;
}

const OpenAccount: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [currentUploadField, setCurrentUploadField] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedAccountNumber, setGeneratedAccountNumber] = useState('');

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: 'Bangladeshi',
    nidNumber: '',
    passportNumber: '',
    phone: '',
    email: '',
    occupation: '',
    monthlyIncome: '',
    sourceOfIncome: ''
  });
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    presentAddress: '',
    presentCity: '',
    presentPostalCode: '',
    permanentAddress: '',
    permanentCity: '',
    permanentPostalCode: '',
    sameAsPermanent: false
  });
  const [documents, setDocuments] = useState<DocumentInfo>({
    nidFront: null,
    nidBack: null,
    passport: null,
    photo: null,
    signature: null,
    incomeProof: null,
    addressProof: null
  });

  // Account types data
  const accountTypes: AccountType[] = [
    {
      id: 'savings',
      name: 'Savings Account',
      type: 'savings',
      description: 'Perfect for personal savings with competitive interest rates',
      minimumBalance: 1000,
      interestRate: 3.5,
      features: [
        'ATM/Debit Card',
        'Online Banking',
        'Mobile Banking',
        'SMS Banking',
        'Checkbook Facility'
      ],
      benefits: [
        'No monthly fees',
        'Free ATM withdrawals',
        'Quarterly interest payment',
        'Overdraft facility available'
      ],
      fees: {
        maintenance: 0,
        atmWithdrawal: 0,
        checkbook: 200
      },
      eligibility: [
        'Minimum age 18 years',
        'Valid NID/Passport',
        'Proof of income',
        'Address verification'
      ],
      documents: [
        'National ID (both sides)',
        'Recent photograph',
        'Signature specimen',
        'Address proof',
        'Income certificate'
      ],
      icon: <User className="w-8 h-8" />,
      color: 'from-green-600 to-emerald-600',
      popular: true
    },
    {
      id: 'current',
      name: 'Current Account',
      type: 'current',
      description: 'Ideal for business transactions and frequent banking',
      minimumBalance: 5000,
      interestRate: 0,
      features: [
        'Unlimited transactions',
        'Business debit card',
        'Online banking',
        'Bulk payment facility',
        'Trade finance services'
      ],
      benefits: [
        'No transaction limits',
        'Free checkbook',
        'Overdraft facility',
        'Business banking services'
      ],
      fees: {
        maintenance: 500,
        atmWithdrawal: 0,
        checkbook: 0
      },
      eligibility: [
        'Business registration',
        'Trade license',
        'Tax clearance',
        'Bank references'
      ],
      documents: [
        'Trade license',
        'Tax certificate',
        'Business registration',
        'Bank statement',
        'Authorized signatory list'
      ],
      icon: <Building className="w-8 h-8" />,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'fixed',
      name: 'Fixed Deposit Account',
      type: 'fixed',
      description: 'High interest rates for fixed-term deposits',
      minimumBalance: 50000,
      interestRate: 8.5,
      features: [
        'Fixed interest rate',
        'Flexible tenure',
        'Loan against FDR',
        'Auto-renewal option',
        'Premature withdrawal'
      ],
      benefits: [
        'Guaranteed returns',
        'Tax benefits',
        'Loan facility',
        'Flexible tenure options'
      ],
      fees: {
        maintenance: 0,
        atmWithdrawal: 0,
        checkbook: 0
      },
      eligibility: [
        'Minimum deposit ৳50,000',
        'Valid identification',
        'Minimum tenure 3 months',
        'Age 18+ years'
      ],
      documents: [
        'National ID',
        'Photograph',
        'Signature specimen',
        'Initial deposit',
        'Nominee details'
      ],
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'salary',
      name: 'Salary Account',
      type: 'salary',
      description: 'Exclusive benefits for salaried professionals',
      minimumBalance: 0,
      interestRate: 4.0,
      features: [
        'Zero balance account',
        'Free debit card',
        'Personal loan facility',
        'Insurance coverage',
        'Investment options'
      ],
      benefits: [
        'No minimum balance',
        'Free banking services',
        'Pre-approved loans',
        'Insurance benefits'
      ],
      fees: {
        maintenance: 0,
        atmWithdrawal: 0,
        checkbook: 0
      },
      eligibility: [
        'Salary certificate',
        'Employment letter',
        'Minimum salary ৳25,000',
        'Company tie-up required'
      ],
      documents: [
        'Salary certificate',
        'Employment letter',
        'Last 3 pay slips',
        'National ID',
        'Photograph'
      ],
      icon: <Award className="w-8 h-8" />,
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'student',
      name: 'Student Account',
      type: 'student',
      description: 'Special account for students with exclusive benefits',
      minimumBalance: 100,
      interestRate: 2.5,
      features: [
        'Low minimum balance',
        'Student debit card',
        'Online banking',
        'Educational loans',
        'Scholarship programs'
      ],
      benefits: [
        'Minimal fees',
        'Educational benefits',
        'Scholarship opportunities',
        'Career guidance'
      ],
      fees: {
        maintenance: 0,
        atmWithdrawal: 0,
        checkbook: 100
      },
      eligibility: [
        'Student ID card',
        'Age 16-25 years',
        'Educational institution certificate',
        'Guardian consent (if minor)'
      ],
      documents: [
        'Student ID card',
        'Educational certificate',
        'National ID/Birth certificate',
        'Guardian consent letter',
        'Photograph'
      ],
      icon: <Star className="w-8 h-8" />,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'foreign',
      name: 'Foreign Currency Account',
      type: 'foreign',
      description: 'Multi-currency account for international transactions',
      minimumBalance: 10000,
      interestRate: 2.0,
      features: [
        'Multi-currency support',
        'International wire transfers',
        'Foreign exchange services',
        'Travel card facility',
        'Online forex trading'
      ],
      benefits: [
        'Competitive exchange rates',
        'Global accessibility',
        'Reduced forex charges',
        'Investment opportunities'
      ],
      fees: {
        maintenance: 1000,
        atmWithdrawal: 100,
        checkbook: 300
      },
      eligibility: [
        'Minimum age 18 years',
        'Valid passport',
        'Proof of foreign income',
        'Tax clearance certificate'
      ],
      documents: [
        'Passport (valid)',
        'Visa/Work permit',
        'Foreign income proof',
        'Tax clearance',
        'Address verification'
      ],
      icon: <Globe className="w-8 h-8" />,
      color: 'from-teal-600 to-cyan-600'
    },
    {
      id: 'joint',
      name: 'Joint Account',
      type: 'joint',
      description: 'Shared account for couples, families, or business partners',
      minimumBalance: 2000,
      interestRate: 3.0,
      features: [
        'Multiple account holders',
        'Joint debit cards',
        'Shared online access',
        'Either or survivor mode',
        'Joint investment options'
      ],
      benefits: [
        'Shared financial management',
        'Emergency access',
        'Tax benefits',
        'Estate planning advantages'
      ],
      fees: {
        maintenance: 200,
        atmWithdrawal: 0,
        checkbook: 150
      },
      eligibility: [
        'All holders 18+ years',
        'Valid identification for all',
        'Relationship proof',
        'Joint application required'
      ],
      documents: [
        'National ID (all holders)',
        'Relationship certificate',
        'Joint photographs',
        'Address proof (all)',
        'Income proof (primary holder)'
      ],
      icon: <User className="w-8 h-8" />,
      color: 'from-rose-600 to-pink-600'
    }
  ];

  const applicationSteps: ApplicationStep[] = [
    {
      id: 1,
      title: 'Choose Account Type',
      description: 'Select the account type that suits your needs',
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 2,
      title: 'Personal Information',
      description: 'Provide your personal details',
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 3,
      title: 'Address Information',
      description: 'Enter your address details',
      completed: currentStep > 3,
      current: currentStep === 3
    },
    {
      id: 4,
      title: 'Document Upload',
      description: 'Upload required documents',
      completed: currentStep > 4,
      current: currentStep === 4
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Review your application and submit',
      completed: currentStep > 5,
      current: currentStep === 5
    }
  ];

  const handleFileUpload = (field: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUploadField) {
      handleFileUpload(currentUploadField, file);
      setCurrentUploadField('');
    }
  };

  const openFileDialog = (field: string) => {
    setCurrentUploadField(field);
    fileInputRef.current?.click();
  };

  const removeFile = (field: string) => {
    setDocuments(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedAccountType !== '';
      case 2:
        return personalInfo.firstName !== '' && personalInfo.lastName !== '' && personalInfo.phone !== '' && personalInfo.email !== '' && personalInfo.nidNumber !== '';
      case 3:
        return addressInfo.presentAddress !== '' && addressInfo.presentCity !== '' && addressInfo.permanentAddress !== '' && addressInfo.permanentCity !== '';
      case 4:
        return documents.nidFront !== null && documents.nidBack !== null && documents.photo !== null && documents.signature !== null;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      alert('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Generate unique account number
  const generateAccountNumber = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IB${timestamp.slice(-6)}${random}`;
  };

  // Store account application in localStorage using persistentCache
  const storeAccountApplication = (accountNumber: string) => {
    const application = {
      accountNumber,
      accountType: selectedAccountType,
      personalInfo,
      addressInfo,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      approvalDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };

    // Get existing applications from persistent cache
    const existingApplications = persistentCache.get<any[]>('accountApplications') || [];
    existingApplications.push(application);
    
    // Store updated applications with 30-day expiry
    persistentCache.set('accountApplications', existingApplications, 30 * 24 * 60 * 60 * 1000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Generate unique account number
    const accountNumber = generateAccountNumber();
    setGeneratedAccountNumber(accountNumber);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Store the application
      storeAccountApplication(accountNumber);
      
      // Show success modal
      setShowSuccessModal(true);
    }, 3000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  const selectedAccount = accountTypes.find(acc => acc.id === selectedAccountType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Open New Account</h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {applicationSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.completed ? 'bg-green-600' : step.current ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {step.completed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`font-medium ${step.current ? 'text-blue-400' : step.completed ? 'text-green-400' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
                {index < applicationSteps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${step.completed ? 'bg-green-600' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Choose Account Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">Choose Your Account Type</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accountTypes.map((account) => (
                  <div
                    key={account.id}
                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedAccountType === account.id
                        ? 'ring-2 ring-blue-400 bg-white/20'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={() => setSelectedAccountType(account.id)}
                  >
                    {account.popular && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Popular
                      </div>
                    )}
                    
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${account.color} text-white mb-4`}>
                      {account.icon}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{account.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{account.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Minimum Balance:</span>
                        <span className="font-medium">৳{account.minimumBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Interest Rate:</span>
                        <span className="font-medium text-green-400">{account.interestRate}% p.a.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Monthly Fee:</span>
                        <span className="font-medium">
                          {account.fees.maintenance === 0 ? 'Free' : `৳${account.fees.maintenance}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300">Key Features:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {account.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="w-3 h-3 mr-2 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Account Details */}
            {selectedAccount && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Account Details: {selectedAccount.name}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-green-400">Features & Benefits</h4>
                    <ul className="space-y-2">
                      {selectedAccount.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-blue-400">Required Documents</h4>
                    <ul className="space-y-2">
                      {selectedAccount.documents.map((doc, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <FileText className="w-4 h-4 mr-2 text-blue-400" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Gender</label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Marital Status</label>
                <select
                  value={personalInfo.maritalStatus}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nationality</label>
                <input
                  type="text"
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your nationality"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">National ID Number *</label>
                <input
                  type="text"
                  value={personalInfo.nidNumber}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, nidNumber: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your NID number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Passport Number</label>
                <input
                  type="text"
                  value={personalInfo.passportNumber}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, passportNumber: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your passport number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Occupation</label>
                <input
                  type="text"
                  value={personalInfo.occupation}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your occupation"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Monthly Income</label>
                <select
                  value={personalInfo.monthlyIncome}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Income Range</option>
                  <option value="below-25000">Below ৳25,000</option>
                  <option value="25000-50000">৳25,000 - ৳50,000</option>
                  <option value="50000-100000">৳50,000 - ৳1,00,000</option>
                  <option value="100000-200000">৳1,00,000 - ৳2,00,000</option>
                  <option value="above-200000">Above ৳2,00,000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Address Information */}
        {currentStep === 3 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Address Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 text-blue-400">Present Address</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
                    <textarea
                      value={addressInfo.presentAddress}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, presentAddress: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="Enter your present address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">City *</label>
                    <input
                      type="text"
                      value={addressInfo.presentCity}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, presentCity: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={addressInfo.presentPostalCode}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, presentPostalCode: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={addressInfo.sameAsPermanent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAddressInfo(prev => ({
                      ...prev,
                      sameAsPermanent: checked,
                      permanentAddress: checked ? prev.presentAddress : '',
                      permanentCity: checked ? prev.presentCity : '',
                      permanentPostalCode: checked ? prev.presentPostalCode : ''
                    }));
                  }}
                  className="mr-3 w-4 h-4 text-blue-600 bg-white/10 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sameAddress" className="text-sm text-gray-300">
                  Permanent address is same as present address
                </label>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-green-400">Permanent Address</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
                    <textarea
                      value={addressInfo.permanentAddress}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, permanentAddress: e.target.value }))}
                      disabled={addressInfo.sameAsPermanent}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      rows={3}
                      placeholder="Enter your permanent address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">City *</label>
                    <input
                      type="text"
                      value={addressInfo.permanentCity}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, permanentCity: e.target.value }))}
                      disabled={addressInfo.sameAsPermanent}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={addressInfo.permanentPostalCode}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, permanentPostalCode: e.target.value }))}
                      disabled={addressInfo.sameAsPermanent}
                      className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Document Upload */}
        {currentStep === 4 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Document Upload</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* National ID Front */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  National ID (Front) *
                </h3>
                {documents.nidFront ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.nidFront.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.nidFront!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('nidFront')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('nidFront')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>

              {/* National ID Back */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  National ID (Back) *
                </h3>
                {documents.nidBack ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.nidBack.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.nidBack!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('nidBack')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('nidBack')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>

              {/* Photograph */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-green-400" />
                  Recent Photograph *
                </h3>
                {documents.photo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.photo.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.photo!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('photo')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('photo')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>

              {/* Signature */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-purple-400" />
                  Signature Specimen *
                </h3>
                {documents.signature ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.signature.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.signature!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('signature')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('signature')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>

              {/* Income Proof */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                  Income Proof
                </h3>
                {documents.incomeProof ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.incomeProof.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.incomeProof!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('incomeProof')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('incomeProof')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>

              {/* Address Proof */}
              <div className="p-4 bg-white/10 rounded-xl">
                <h3 className="font-medium mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-400" />
                  Address Proof
                </h3>
                {documents.addressProof ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm">{documents.addressProof.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(documents.addressProof!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile('addressProof')}
                          className="p-1 hover:bg-white/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openFileDialog('addressProof')}
                    className="w-full p-6 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/20 rounded-xl">
              <div className="flex items-start">
                <Info className="w-5 h-5 mr-3 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-400 mb-2">Document Requirements:</p>
                  <ul className="space-y-1 text-gray-300">
                    <li>• All documents should be clear and readable</li>
                    <li>• Supported formats: JPG, PNG, PDF (max 5MB each)</li>
                    <li>• Documents marked with * are mandatory</li>
                    <li>• Ensure all information is visible and not cropped</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">Review Your Application</h2>
              
              {/* Account Type Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-blue-400">Selected Account Type</h3>
                {selectedAccount && (
                  <div className="p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${selectedAccount.color} text-white mr-3`}>
                        {selectedAccount.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedAccount.name}</h4>
                        <p className="text-sm text-gray-400">{selectedAccount.description}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Minimum Balance:</span>
                        <span className="ml-2 font-medium">৳{selectedAccount.minimumBalance.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Interest Rate:</span>
                        <span className="ml-2 font-medium text-green-400">{selectedAccount.interestRate}% p.a.</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Fee:</span>
                        <span className="ml-2 font-medium">
                          {selectedAccount.fees.maintenance === 0 ? 'Free' : `৳${selectedAccount.fees.maintenance}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-green-400">Personal Information</h3>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="ml-2 font-medium">{personalInfo.firstName} {personalInfo.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date of Birth:</span>
                      <span className="ml-2 font-medium">{personalInfo.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <span className="ml-2 font-medium">{personalInfo.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="ml-2 font-medium">{personalInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">NID Number:</span>
                      <span className="ml-2 font-medium">{personalInfo.nidNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Occupation:</span>
                      <span className="ml-2 font-medium">{personalInfo.occupation || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-purple-400">Address Information</h3>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Present Address</h4>
                      <p className="text-sm text-gray-300">{addressInfo.presentAddress}</p>
                      <p className="text-sm text-gray-300">{addressInfo.presentCity}, {addressInfo.presentPostalCode}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Permanent Address</h4>
                      <p className="text-sm text-gray-300">{addressInfo.permanentAddress}</p>
                      <p className="text-sm text-gray-300">{addressInfo.permanentCity}, {addressInfo.permanentPostalCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-yellow-400">Uploaded Documents</h3>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(documents).map(([key, file]) => (
                      file && (
                        <div key={key} className="flex items-center justify-between p-2 bg-green-500/20 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                          <span className="text-xs text-gray-400">{file.name}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="p-4 bg-yellow-500/20 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-400 mb-2">Terms and Conditions</p>
                    <div className="space-y-2 text-gray-300">
                      <label className="flex items-start">
                        <input type="checkbox" className="mr-3 mt-1 w-4 h-4 text-blue-600 bg-white/10 border-gray-600 rounded focus:ring-blue-500" />
                        <span>I agree to the bank's terms and conditions and privacy policy</span>
                      </label>
                      <label className="flex items-start">
                        <input type="checkbox" className="mr-3 mt-1 w-4 h-4 text-blue-600 bg-white/10 border-gray-600 rounded focus:ring-blue-500" />
                        <span>I confirm that all information provided is accurate and complete</span>
                      </label>
                      <label className="flex items-start">
                        <input type="checkbox" className="mr-3 mt-1 w-4 h-4 text-blue-600 bg-white/10 border-gray-600 rounded focus:ring-blue-500" />
                        <span>I authorize the bank to verify the information and documents provided</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-colors flex items-center"
            >
              Next
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Image Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Document Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <img
                src={previewImage}
                alt="Document preview"
                className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-green-400 mb-4">Application Submitted Successfully!</h3>
                
                <div className="bg-white/10 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-2">Your Account Number</p>
                  <p className="text-xl font-bold text-blue-400">{generatedAccountNumber}</p>
                </div>
                
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-400">Account Activation Timeline</p>
                      <p className="text-sm text-gray-300">Your account will be activated within 3 days once approved by the admin.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-orange-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-400">Account Status</p>
                      <p className="text-sm text-gray-300">Until approval, your account will remain inactive.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-400">Admin Control</p>
                      <p className="text-sm text-gray-300">The admin has full control over approvals and account management.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    <strong>Important:</strong> Please save your account number for future reference. 
                    You will receive email notifications about your application status.
                  </p>
                </div>
                
                <button
                  onClick={handleModalClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-colors font-medium"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAccount;