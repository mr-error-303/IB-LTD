import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CreditCard, 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  X,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  Shield,
  Award,
  Target,
  History,
  Settings,
  BarChart3,
  PiggyBank,
  Gift,
  SlidersHorizontal
} from 'lucide-react';
import LoanManagementDashboard from '../components/LoanManagementDashboard';
import PrepaymentOptions from '../components/PrepaymentOptions';
import LoanStatusTracker from '../components/LoanStatusTracker';
import RepaymentHistory from '../components/RepaymentHistory';
import EarlyRepaymentOptions from '../components/loan/EarlyRepaymentOptions';
import LoanRestructuringOptions from '../components/loan/LoanRestructuringOptions';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';
import { realtimeService } from '../services/realtimeService';

import { LoanApplication as GlobalLoanApplication } from '../types';

interface ApplicationData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  
  // Identity Documents
  nidCardNumber: string;
  passportNumber: string;
  drivingLicenseNumber: string;
  
  // Nominee Information
  nomineeName: string;
  nomineeRelationship: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeAddress: string;
  nomineeNidNumber: string;
  nomineePassportNumber: string;
  
  // Employment Information
  employmentType: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  hrContact: string;
  jobTitle: string;
  workExperience: string;
  monthlyIncome: string;
  annualIncome: string;
  
  // Business Information (if applicable)
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessEstablishedYear: string;
  monthlyBusinessIncome: string;
  
  // Loan Details
  amount: string;
  repaymentPeriod: string;
  purpose: string;
  monthlyEMI: string;
  
  // Additional Information
  existingLoansDetails: string;
  existingLoans: string;
  creditScore: string;
  monthlyExpenses: string;
  additionalComments: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  accountType: string;
  branchName: string;
  
  // Document Upload Status
  profilePhotoUploaded: boolean;
  nidCardPhotoUploaded: boolean;
  passportPhotoUploaded: boolean;
  nomineePhotoUploaded: boolean;
  nomineeNidPhotoUploaded: boolean;
  employmentCertificateUploaded: boolean;
  cancelledChequeUploaded: boolean;
  bankStatementUploaded: boolean;
  salarySlipUploaded: boolean;
  businessDocumentsUploaded: boolean;
}

interface CalculatorData {
  amount: string;
  rate: string;
  tenure: string;
}

interface CalculationResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
}

interface LocalLoanApplication {
  id: string;
  amount: string;
  interestRate: string;
  tenure: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface ExistingLoan {
  id: string;
  type: string;
  loanType: string;
  amount: string;
  remainingAmount: string;
  emi: string;
  nextDueDate: string;
  status: 'active' | 'closed';
}

const Loan: React.FC = () => {
  const { selectedCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(selectedCurrency.code);
  const [activeTab, setActiveTab] = useState<string>('apply');
  const [loanType, setLoanType] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    
    // Identity Documents
    nidCardNumber: '',
    passportNumber: '',
    drivingLicenseNumber: '',
    
    // Nominee Information
    nomineeName: '',
    nomineeRelationship: '',
    nomineePhone: '',
    nomineeEmail: '',
    nomineeAddress: '',
    nomineeNidNumber: '',
    nomineePassportNumber: '',
    
    // Employment Information
    employmentType: '',
    companyName: '',
      companyAddress: '',
      companyPhone: '',
      hrContact: '',
      jobTitle: '',
    workExperience: '',
    monthlyIncome: '',
    annualIncome: '',
    
    // Business Information (if applicable)
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessRegistrationNumber: '',
    businessEstablishedYear: '',
    monthlyBusinessIncome: '',
    
    // Loan Details
    amount: '',
    repaymentPeriod: '',
    purpose: '',
    monthlyEMI: '',
    
    // Additional Information
    existingLoansDetails: '',
    existingLoans: '',
    creditScore: '',
    monthlyExpenses: '',
    additionalComments: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    accountType: '',
    branchName: '',
    
    // Document Upload Status
    profilePhotoUploaded: false,
      nidCardPhotoUploaded: false,
      passportPhotoUploaded: false,
      nomineePhotoUploaded: false,
      nomineeNidPhotoUploaded: false,
      employmentCertificateUploaded: false,
      cancelledChequeUploaded: false,
      bankStatementUploaded: false,
      salarySlipUploaded: false,
    businessDocumentsUploaded: false
  });

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    amount: '',
    rate: '',
    tenure: ''
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [submittedApplications, setSubmittedApplications] = useState<LocalLoanApplication[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Mock data for global loan applications (for components that expect GlobalLoanApplication)
  const mockGlobalLoans: GlobalLoanApplication[] = [
    {
      id: 'LOAN001',
      userId: 'user123',
      loanType: 'personal',
      amount: 50000,
      status: 'active',
      applicationDate: new Date('2023-12-01'),
      repaymentPeriod: 24,
      interestRate: 12.5,
      monthlyEMI: 2347,
      paidAmount: 9388,
      remainingAmount: 40612,
      totalAmount: 56328,
      nextPaymentDate: new Date('2024-02-01'),
      documents: []
    },
    {
      id: 'LOAN002',
      userId: 'user123',
      loanType: 'home',
      amount: 500000,
      status: 'pending',
      applicationDate: new Date('2024-01-15'),
      repaymentPeriod: 240,
      interestRate: 8.5,
      documents: []
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedApplications = localStorage.getItem('loanApplications');
    if (savedApplications) {
      setSubmittedApplications(JSON.parse(savedApplications));
    }

    const savedDocuments = localStorage.getItem('uploadedDocuments');
    if (savedDocuments) {
      setUploadedDocuments(JSON.parse(savedDocuments));
    }

    const savedLoans = localStorage.getItem('existingLoans');
    if (savedLoans) {
      setExistingLoans(JSON.parse(savedLoans));
    }
  }, []);

  // Real-time event listeners for loan updates
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    // Subscribe to loan-specific events using the correct method
    const unsubscribeLoan = realtimeService.subscribeToLoanUpdates(userEmail, (data: any) => {
      switch (data.action) {
        case 'loan_approved':
          setNotifications(prev => [...prev, `🎉 Your loan application #${data.loanId} has been approved! Amount: ${data.data?.approvedAmount || 'N/A'}`]);
          // Update loan status in local state
          setSubmittedApplications(prev => 
            prev.map(app => 
              app.id === data.loanId 
                ? { ...app, status: 'approved' as const }
                : app
            )
          );
          break;
        case 'loan_rejected':
          setNotifications(prev => [...prev, `❌ Your loan application #${data.loanId} has been rejected. Reason: ${data.data?.reason || 'Not specified'}`]);
          // Update loan status in local state
          setSubmittedApplications(prev => 
            prev.map(app => 
              app.id === data.loanId 
                ? { ...app, status: 'rejected' as const }
                : app
            )
          );
          break;
        case 'loan_disbursed':
          setNotifications(prev => [...prev, `💰 Your loan #${data.loanId} has been disbursed! Amount: ${data.data?.disbursedAmount || 'N/A'} transferred to your account.`]);
          break;
        case 'credit_score_updated':
          setNotifications(prev => [...prev, `📊 Your credit score has been updated to ${data.data?.creditScore || 'N/A'}`]);
          break;
        default:
          break;
      }
    });

    // Auto-clear notifications after 10 seconds
    const clearNotifications = setTimeout(() => {
      setNotifications([]);
    }, 10000);

    return () => {
      if (unsubscribeLoan) {
        unsubscribeLoan();
      }
      clearTimeout(clearNotifications);
    };
  }, []);

  // Clear individual notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const loanTypes = [
    {
      id: 'personal',
      name: 'Personal Loan',
      description: 'Quick approval for personal expenses',
      rate: '10.5% - 24%',
      amount: `${currencySymbol}50K - ${currencySymbol}40L`,
      tenure: '12 - 60 months',
      icon: <User className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      id: 'home',
      name: 'Home Loan',
      description: 'Finance your dream home',
      rate: '8.5% - 12%',
      amount: `${currencySymbol}5L - ${currencySymbol}10Cr`,
      tenure: '5 - 30 years',
      icon: <Building className="w-8 h-8" />,
      color: 'bg-green-500'
    },
    {
      id: 'business',
      name: 'Business Loan',
      description: 'Grow your business with flexible funding',
      rate: '12% - 20%',
      amount: `${currencySymbol}1L - ${currencySymbol}5Cr`,
      tenure: '12 - 84 months',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'bg-purple-500'
    },
    {
      id: 'education',
      name: 'Education Loan',
      description: 'Invest in your future education',
      rate: '9% - 15%',
      amount: `${currencySymbol}50K - ${currencySymbol}1.5Cr`,
      tenure: '5 - 15 years',
      icon: <Award className="w-8 h-8" />,
      color: 'bg-orange-500'
    }
  ];

  const handleLoanTypeSelect = (type: string) => {
    setLoanType(type);
    setCurrentStep(2);
  };

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: keyof ApplicationData, file: File) => {
    // In a real application, you would upload the file to a server
    // For now, we'll just mark it as uploaded
    setApplicationData(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Store file info in localStorage for demo purposes
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    };
    
    localStorage.setItem(`uploaded_${field}`, JSON.stringify(fileInfo));
    alert(`${file.name} uploaded successfully!`);
  };

  const calculateEMI = () => {
    const principal = parseFloat(calculatorData.amount);
    const rate = parseFloat(calculatorData.rate) / 100 / 12;
    const tenure = parseFloat(calculatorData.tenure);

    if (principal && rate && tenure) {
      const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - principal;

      setCalculationResult({
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest)
      });
    }
  };

  const handleSubmitApplication = () => {
    const newApplication: LocalLoanApplication = {
      id: Date.now().toString(),
      amount: applicationData.amount,
      interestRate: '12.5%',
      tenure: applicationData.repaymentPeriod,
      appliedDate: new Date().toLocaleDateString(),
      status: 'pending',
      type: loanType
    };

    const updatedApplications = [...submittedApplications, newApplication];
    setSubmittedApplications(updatedApplications);
    localStorage.setItem('loanApplications', JSON.stringify(updatedApplications));

    // Reset form
    setApplicationData({
      // Personal Information
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      nationality: '',
      maritalStatus: '',
      
      // Identity Documents
      nidCardNumber: '',
      passportNumber: '',
      drivingLicenseNumber: '',
      
      // Nominee Information
      nomineeName: '',
      nomineeRelationship: '',
      nomineePhone: '',
      nomineeEmail: '',
      nomineeAddress: '',
      nomineeNidNumber: '',
      nomineePassportNumber: '',
      
      // Employment Information
      employmentType: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      hrContact: '',
      jobTitle: '',
      workExperience: '',
      monthlyIncome: '',
      annualIncome: '',
      
      // Business Information (if applicable)
      businessName: '',
      businessType: '',
      businessAddress: '',
      businessRegistrationNumber: '',
      businessEstablishedYear: '',
      monthlyBusinessIncome: '',
      
      // Loan Details
      amount: '',
      repaymentPeriod: '',
      purpose: '',
      monthlyEMI: '',
      
      // Additional Information
      existingLoansDetails: '',
      existingLoans: '',
      creditScore: '',
      monthlyExpenses: '',
      additionalComments: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      accountType: '',
      branchName: '',
      
      // Document Upload Status
      profilePhotoUploaded: false,
      nidCardPhotoUploaded: false,
      passportPhotoUploaded: false,
      nomineePhotoUploaded: false,
      nomineeNidPhotoUploaded: false,
      employmentCertificateUploaded: false,
      cancelledChequeUploaded: false,
      bankStatementUploaded: false,
      salarySlipUploaded: false,
      businessDocumentsUploaded: false
    });
    setLoanType('');
    setCurrentStep(1);
    setActiveTab('status');

    alert('Application submitted successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{notification}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Services</h1>
            <p className="text-gray-600">Apply for loans, manage existing loans, and calculate EMI</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'apply', name: 'Apply for Loan', icon: <FileText className="w-5 h-5" /> },
                { id: 'status', name: 'Application Status', icon: <Clock className="w-5 h-5" /> },
                { id: 'existing', name: 'My Loans', icon: <CreditCard className="w-5 h-5" /> },
                { id: 'calculator', name: 'EMI Calculator', icon: <Calculator className="w-5 h-5" /> },
                { id: 'management', name: 'Loan Management', icon: <Settings className="w-5 h-5" /> },
                { id: 'prepayment', name: 'Prepayment Options', icon: <PiggyBank className="w-5 h-5" /> },
                { id: 'history', name: 'Payment History', icon: <History className="w-5 h-5" /> },
                { id: 'analytics', name: 'Loan Analytics', icon: <BarChart3 className="w-5 h-5" /> },
                 { id: 'early-repayment', name: 'Early Repayment', icon: <Gift className="w-5 h-5" /> },
                 { id: 'restructuring', name: 'Loan Restructuring', icon: <SlidersHorizontal className="w-5 h-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Apply for Loan Tab */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      loanType ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {loanType ? '✓' : '1'}
                    </div>
                    <span className={`text-sm font-medium ${loanType ? 'text-green-600' : 'text-blue-600'}`}>
                      Choose Loan Type
                    </span>
                  </div>
                  <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                    <div className={`h-full rounded transition-all duration-300 ${
                      loanType ? 'bg-green-500 w-full' : 'bg-blue-500 w-0'
                    }`}></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      loanType ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                      2
                    </div>
                    <span className={`text-sm font-medium ${loanType ? 'text-blue-600' : 'text-gray-500'}`}>
                      Application Form
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Types */}
              {!loanType && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loanTypes.map((loan) => (
                    <div
                      key={loan.id}
                      onClick={() => handleLoanTypeSelect(loan.id)}
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
                    >
                      <div className={`${loan.color} text-white p-3 rounded-lg w-fit mb-4`}>
                        {loan.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{loan.name}</h3>
                      <p className="text-gray-600 mb-4">{loan.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Interest Rate:</span>
                          <span className="font-medium">{loan.rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Loan Amount:</span>
                          <span className="font-medium">{loan.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tenure:</span>
                          <span className="font-medium">{loan.tenure}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Application Form */}
              {loanType && (
                <form className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {loanTypes.find(l => l.id === loanType)?.name} Application - International Category
                    </h2>
                    <button
                      type="button"
                      onClick={() => setLoanType('')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            value={applicationData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={applicationData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={applicationData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nationality *
                          </label>
                          <select
                            value={applicationData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select nationality</option>
                            <option value="bangladeshi">Bangladeshi</option>
                            <option value="indian">Indian</option>
                            <option value="pakistani">Pakistani</option>
                            <option value="sri-lankan">Sri Lankan</option>
                            <option value="nepali">Nepali</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marital Status *
                          </label>
                          <select
                            value={applicationData.maritalStatus}
                            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select marital status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <textarea
                            value={applicationData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter your complete address"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Photo *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('profilePhotoUploaded', file);
                              }}
                              className="hidden"
                              id="profilePhoto"
                            />
                            <label
                              htmlFor="profilePhoto"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Photo
                            </label>
                            {applicationData.profilePhotoUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Identity Documents Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Identity Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NID Card Number *
                          </label>
                          <input
                            type="text"
                            value={applicationData.nidCardNumber}
                            onChange={(e) => handleInputChange('nidCardNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter NID card number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NID Card Photo *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('nidCardPhotoUploaded', file);
                              }}
                              className="hidden"
                              id="nidCardPhoto"
                            />
                            <label
                              htmlFor="nidCardPhoto"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload NID
                            </label>
                            {applicationData.nidCardPhotoUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={applicationData.passportNumber}
                            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter passport number (if available)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Photo
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('passportPhotoUploaded', file);
                              }}
                              className="hidden"
                              id="passportPhoto"
                            />
                            <label
                              htmlFor="passportPhoto"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Passport
                            </label>
                            {applicationData.passportPhotoUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Driving License Number
                          </label>
                          <input
                            type="text"
                            value={applicationData.drivingLicenseNumber}
                            onChange={(e) => handleInputChange('drivingLicenseNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter driving license number (if available)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nominee Information Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Nominee Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.nomineeName}
                            onChange={(e) => handleInputChange('nomineeName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nominee's full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship *
                          </label>
                          <select
                            value={applicationData.nomineeRelationship}
                            onChange={(e) => handleInputChange('nomineeRelationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="son">Son</option>
                            <option value="daughter">Daughter</option>
                            <option value="brother">Brother</option>
                            <option value="sister">Sister</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Phone *
                          </label>
                          <input
                            type="tel"
                            value={applicationData.nomineePhone}
                            onChange={(e) => handleInputChange('nomineePhone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nominee's phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Email
                          </label>
                          <input
                            type="email"
                            value={applicationData.nomineeEmail}
                            onChange={(e) => handleInputChange('nomineeEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nominee's email"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Address *
                          </label>
                          <textarea
                            value={applicationData.nomineeAddress}
                            onChange={(e) => handleInputChange('nomineeAddress', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter nominee's complete address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee NID Number *
                          </label>
                          <input
                            type="text"
                            value={applicationData.nomineeNidNumber}
                            onChange={(e) => handleInputChange('nomineeNidNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nominee's NID number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Passport Number
                          </label>
                          <input
                            type="text"
                            value={applicationData.nomineePassportNumber}
                            onChange={(e) => handleInputChange('nomineePassportNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nominee's passport number (if available)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee Photo *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('nomineePhotoUploaded', file);
                              }}
                              className="hidden"
                              id="nomineePhoto"
                            />
                            <label
                              htmlFor="nomineePhoto"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Photo
                            </label>
                            {applicationData.nomineePhotoUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nominee NID Photo *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('nomineeNidPhotoUploaded', file);
                              }}
                              className="hidden"
                              id="nomineeNidPhoto"
                            />
                            <label
                              htmlFor="nomineeNidPhoto"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload NID
                            </label>
                            {applicationData.nomineeNidPhotoUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employment/Business Information Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Employment & Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employment Type *
                          </label>
                          <select
                            value={applicationData.employmentType}
                            onChange={(e) => handleInputChange('employmentType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select employment type</option>
                            <option value="salaried">Salaried Employee</option>
                            <option value="self-employed">Self Employed</option>
                            <option value="business">Business Owner</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="retired">Retired</option>
                            <option value="unemployed">Unemployed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company/Business Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter company or business name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title/Position *
                          </label>
                          <input
                            type="text"
                            value={applicationData.jobTitle}
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your job title or position"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Work Experience (Years) *
                          </label>
                          <select
                            value={applicationData.workExperience}
                            onChange={(e) => handleInputChange('workExperience', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select experience</option>
                            <option value="0-1">0-1 years</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Income ({currencySymbol}) *
                          </label>
                          <input
                            type="number"
                            value={applicationData.monthlyIncome}
                            onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter monthly income"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Annual Income ({currencySymbol}) *
                          </label>
                          <input
                            type="number"
                            value={applicationData.annualIncome}
                            onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter annual income"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Address *
                          </label>
                          <textarea
                            value={applicationData.companyAddress}
                            onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter complete company/business address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Phone *
                          </label>
                          <input
                            type="tel"
                            value={applicationData.companyPhone}
                            onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter company phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            HR/Manager Contact
                          </label>
                          <input
                            type="tel"
                            value={applicationData.hrContact}
                            onChange={(e) => handleInputChange('hrContact', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter HR or manager contact"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employment Certificate *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('employmentCertificateUploaded', file);
                              }}
                              className="hidden"
                              id="employmentCertificate"
                            />
                            <label
                              htmlFor="employmentCertificate"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Certificate
                            </label>
                            {applicationData.employmentCertificateUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary Slip/Income Proof *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('salarySlipUploaded', file);
                              }}
                              className="hidden"
                              id="salarySlip"
                            />
                            <label
                              htmlFor="salarySlip"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Salary Slip
                            </label>
                            {applicationData.salarySlipUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Information Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Bank Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bank name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            value={applicationData.accountNumber}
                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter account number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            value={applicationData.ifscCode}
                            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter IFSC code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type *
                          </label>
                          <select
                            value={applicationData.accountType}
                            onChange={(e) => handleInputChange('accountType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select account type</option>
                            <option value="savings">Savings Account</option>
                            <option value="current">Current Account</option>
                            <option value="salary">Salary Account</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Holder Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.accountHolderName}
                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter account holder name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Name *
                          </label>
                          <input
                            type="text"
                            value={applicationData.branchName}
                            onChange={(e) => handleInputChange('branchName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter branch name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Statement (Last 6 Months) *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('bankStatementUploaded', file);
                              }}
                              className="hidden"
                              id="bankStatement"
                            />
                            <label
                              htmlFor="bankStatement"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Statement
                            </label>
                            {applicationData.bankStatementUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cancelled Cheque *
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('cancelledChequeUploaded', file);
                              }}
                              className="hidden"
                              id="cancelledCheque"
                            />
                            <label
                              htmlFor="cancelledCheque"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                            >
                              Upload Cheque
                            </label>
                            {applicationData.cancelledChequeUploaded && (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Loan Details Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Loan Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Loan Amount ({currencySymbol}) *
                           </label>
                           <input
                             type="number"
                             value={applicationData.amount}
                             onChange={(e) => handleInputChange('amount', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Enter loan amount"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Repayment Period (months) *
                           </label>
                           <select
                             value={applicationData.repaymentPeriod}
                             onChange={(e) => handleInputChange('repaymentPeriod', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="">Select tenure</option>
                             <option value="12">12 months</option>
                             <option value="24">24 months</option>
                             <option value="36">36 months</option>
                             <option value="48">48 months</option>
                             <option value="60">60 months</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Purpose of Loan *
                           </label>
                           <select
                             value={applicationData.purpose}
                             onChange={(e) => handleInputChange('purpose', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="">Select purpose</option>
                             <option value="debt-consolidation">Debt Consolidation</option>
                             <option value="home-improvement">Home Improvement</option>
                             <option value="medical">Medical Expenses</option>
                             <option value="education">Education</option>
                             <option value="wedding">Wedding</option>
                             <option value="travel">Travel</option>
                             <option value="business">Business</option>
                             <option value="other">Other</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Total Monthly EMI ({currencySymbol})
                           </label>
                           <input
                             type="number"
                             value={applicationData.monthlyEMI}
                             onChange={(e) => handleInputChange('monthlyEMI', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Total monthly EMI amount"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Existing Loans/EMIs ({currencySymbol})
                           </label>
                           <input
                             type="number"
                             value={applicationData.existingLoans}
                             onChange={(e) => handleInputChange('existingLoans', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Total existing loan EMIs"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Credit Score
                           </label>
                           <select
                             value={applicationData.creditScore}
                             onChange={(e) => handleInputChange('creditScore', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="">Select credit score range</option>
                             <option value="300-549">300-549 (Poor)</option>
                             <option value="550-649">550-649 (Fair)</option>
                             <option value="650-749">650-749 (Good)</option>
                             <option value="750-850">750-850 (Excellent)</option>
                             <option value="unknown">Don't know</option>
                           </select>
                         </div>

                         <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Additional Comments
                           </label>
                           <textarea
                             value={applicationData.additionalComments}
                             onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             rows={3}
                             placeholder="Any additional information or comments"
                           />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Submit Button */}
                   <div className="flex justify-center pt-6 border-t mt-6">
                    <button
                      type="button"
                      onClick={handleSubmitApplication}
                      disabled={!loanType || !applicationData.amount || !applicationData.repaymentPeriod || !applicationData.purpose || !applicationData.monthlyIncome || !applicationData.fullName || !applicationData.email || !applicationData.phone || !applicationData.employmentType || !applicationData.companyName}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        loanType && applicationData.amount && applicationData.repaymentPeriod && applicationData.purpose && applicationData.monthlyIncome && applicationData.fullName && applicationData.email && applicationData.phone && applicationData.employmentType && applicationData.companyName
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Status</h2>
              
              {submittedApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600 mb-6">You haven't submitted any loan applications yet.</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply for Loan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </div>
                          <span className="text-sm text-gray-500">Applied on {application.appliedDate}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{currencySymbol}{parseInt(application.amount).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{application.type} loan</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Interest Rate:</span>
                          <span className="ml-2 font-medium">{application.interestRate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tenure:</span>
                          <span className="ml-2 font-medium">{application.tenure} months</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Application ID:</span>
                          <span className="ml-2 font-medium">#{application.id}</span>
                        </div>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            Your application is under review. We'll notify you via email and SMS once processed.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">EMI Calculator</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Form */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        value={calculatorData.amount}
                        onChange={(e) => setCalculatorData({...calculatorData, amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter loan amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate (% per annum)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={calculatorData.rate}
                        onChange={(e) => setCalculatorData({...calculatorData, rate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter interest rate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Tenure (months)
                      </label>
                      <input
                        type="number"
                        value={calculatorData.tenure}
                        onChange={(e) => setCalculatorData({...calculatorData, tenure: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter loan tenure"
                      />
                    </div>
                    <button
                      onClick={calculateEMI}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Calculate EMI
                    </button>
                  </div>
                </div>

                {/* Calculation Results */}
                <div>
                  {calculationResult && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Calculation Results</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-700">Monthly EMI</span>
                          <span className="text-xl font-bold text-blue-600">{currencySymbol}{calculationResult.emi.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Total Amount Payable</span>
                          <span className="text-lg font-semibold text-gray-900">{currencySymbol}{calculationResult.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Total Interest</span>
                          <span className="text-lg font-semibold text-gray-900">{currencySymbol}{calculationResult.totalInterest.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Existing Loans Tab */}
          {activeTab === 'existing' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Loans</h2>
              
              {existingLoans.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Loans</h3>
                  <p className="text-gray-600 mb-6">You don't have any active loans at the moment.</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply for Loan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingLoans.map((loan) => (
                    <div key={loan.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{loan.loanType}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{currencySymbol}{parseInt(loan.remainingAmount).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Remaining</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Original Amount:</span>
                          <span className="ml-2 font-medium">{currencySymbol}{parseInt(loan.amount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Monthly EMI:</span>
                          <span className="ml-2 font-medium">{currencySymbol}{parseInt(loan.emi).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Due Date:</span>
                          <span className="ml-2 font-medium">{loan.nextDueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loan Management Tab */}
          {activeTab === 'management' && (
            <div className="bg-white rounded-lg shadow-md">
              <LoanManagementDashboard
                loans={mockGlobalLoans}
                onMakePayment={(loanId: string, amount: number) => {
                  console.log('Making payment:', loanId, amount);
                  // Handle payment logic
                }}
                onPrepayment={(loanId: string, amount: number) => {
                  console.log('Making prepayment:', loanId, amount);
                  // Handle prepayment logic
                }}
                onDownloadStatement={(loanId: string, period: string) => {
                  console.log('Downloading statement:', loanId, period);
                  // Handle statement download
                }}
              />
            </div>
          )}

          {/* Prepayment Options Tab */}
          {activeTab === 'prepayment' && (
            <div className="bg-white rounded-lg shadow-md">
              <PrepaymentOptions
                loans={mockGlobalLoans}
                onInitiatePrepayment={(loanId: string, amount: number, type: 'partial' | 'full') => {
                  console.log('Initiating prepayment:', loanId, amount, type);
                  // Handle prepayment initiation
                }}
                onDownloadCalculation={(calculation: any) => {
                  console.log('Downloading calculation:', calculation);
                  // Handle calculation download
                }}
              />
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-md">
              <RepaymentHistory
                loans={mockGlobalLoans}
                onDownloadReceipt={(recordId: string) => {
                  console.log('Downloading receipt:', recordId);
                  // Handle receipt download
                }}
                onDownloadStatement={(loanId: string, fromDate: string, toDate: string) => {
                  console.log('Downloading statement:', loanId, fromDate, toDate);
                  // Handle statement download
                }}
              />
            </div>
          )}

          {/* Early Repayment Options Tab */}
           {activeTab === 'early-repayment' && (
             <div className="bg-white rounded-lg shadow-md">
               <EarlyRepaymentOptions 
                loans={mockGlobalLoans}
              />
             </div>
           )}
 
           {/* Loan Restructuring Tab */}
           {activeTab === 'restructuring' && (
             <div className="bg-white rounded-lg shadow-md">
               <LoanRestructuringOptions 
                loans={mockGlobalLoans}
              />
             </div>
           )}

          {/* Loan Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Loan Portfolio Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Portfolio Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Loans</p>
                        <p className="text-2xl font-bold">{submittedApplications.length}</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Active Loans</p>
                        <p className="text-2xl font-bold">{submittedApplications.filter(loan => loan.status === 'approved').length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Pending Applications</p>
                        <p className="text-2xl font-bold">{submittedApplications.filter(loan => loan.status === 'pending').length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Amount</p>
                        <p className="text-2xl font-bold">
                          {currencySymbol}{submittedApplications.reduce((sum, loan) => sum + parseFloat(loan.amount || '0'), 0).toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Loan Status Tracker for each loan */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Status Overview</h3>
                  {mockGlobalLoans.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No loan data available for analytics</p>
                  </div>
                ) : (
                  mockGlobalLoans.map((loan) => (
                    <LoanStatusTracker
                      key={loan.id}
                      loan={loan}
                      showDetails={true}
                      onAction={(actionType: string, loanId: string, data?: any) => {
                        console.log('Loan action:', actionType, loanId, data);
                        // Handle loan actions
                      }}
                    />
                  ))
                )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loan;