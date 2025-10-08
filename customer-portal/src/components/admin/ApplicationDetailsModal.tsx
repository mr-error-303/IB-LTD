import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BanknotesIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { CreditScoringEngine, CreditFactors, CreditScoreResult } from '../../utils/creditScoring';

interface LoanApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  amount: number;
  purpose: string;
  repaymentPeriod: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  applicationDate: string;
  creditScore: number;
  monthlyIncome: number;
  employmentType: string;
  employmentDuration: number;
  existingLoans: number;
  documents: {
    idProof: boolean;
    incomeProof: boolean;
    addressProof: boolean;
    bankStatement: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high';
  adminComments?: string;
  lastUpdated: string;
  assignedTo?: string;
  // Additional detailed information
  personalInfo?: {
    dateOfBirth: string;
    address: string;
    maritalStatus: string;
    dependents: number;
    education: string;
  };
  employmentInfo?: {
    companyName: string;
    designation: string;
    workAddress: string;
    supervisorContact: string;
  };
  financialInfo?: {
    bankName: string;
    accountNumber: string;
    otherIncome: number;
    monthlyExpenses: number;
    assets: number;
    liabilities: number;
  };
  loanHistory?: {
    previousLoans: number;
    defaultHistory: boolean;
    creditUtilization: number;
    paymentHistory: string;
  };
}

interface ApplicationDetailsModalProps {
  application: LoanApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (applicationId: string, comments: string) => void;
  onReject: (applicationId: string, comments: string) => void;
  onUpdateCreditScore: (applicationId: string, newScore: number) => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onUpdateCreditScore
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminComments, setAdminComments] = useState('');
  // Credit scoring state
  const [creditScore, setCreditScore] = useState<CreditScoreResult | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [manualCreditScore, setManualCreditScore] = useState<number>(application?.creditScore || 0);
  const [useManualScore, setUseManualScore] = useState(false);
  const [showCreditScoreEdit, setShowCreditScoreEdit] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  
  // Approval form state
  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    interestRate: 8.5,
    loanTerm: 36,
    comments: ''
  });

  // Rejection form state
  const [rejectionData, setRejectionData] = useState({
    reason: '',
    comments: '',
    sendNotification: true
  });

  // Calculate automated credit score
  const calculateAutomatedScore = async () => {
    if (!application) return;
    
    setIsCalculatingScore(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const factors: CreditFactors = {
      monthlyIncome: application.monthlyIncome,
      existingDebt: (application as any).existingDebt || 0,
      creditHistory: (application as any).creditHistory || 12,
      employmentType: application.employmentType as any || 'permanent',
      age: (application as any).age || 35,
      loanAmount: application.amount,
      collateral: (application as any).collateral || false,
      bankRelationship: (application as any).bankRelationship || 24,
      previousDefaults: (application as any).previousDefaults || 0,
      educationLevel: (application as any).educationLevel as any || 'bachelor'
    };
    
    const result = CreditScoringEngine.calculateCreditScore(factors);
    setCreditScore(result);
    setIsCalculatingScore(false);
  };

  // Initialize approval amount with requested amount
  useEffect(() => {
    if (application) {
      setApprovalData(prev => ({
        ...prev,
        approvedAmount: application.amount
      }));
    }
  }, [application]);

  useEffect(() => {
    if (application && !creditScore) {
      calculateAutomatedScore();
    }
  }, [application, creditScore]);

  if (!isOpen || !application) return null;

  // Enhanced mock data for detailed view
  const enhancedApplication: LoanApplication = {
    ...application,
    personalInfo: {
      dateOfBirth: '1985-03-15',
      address: '123 Main Street, Dhaka-1000, Bangladesh',
      maritalStatus: 'Married',
      dependents: 2,
      education: 'Bachelor\'s Degree'
    },
    employmentInfo: {
      companyName: 'Tech Solutions Ltd.',
      designation: 'Senior Software Engineer',
      workAddress: '456 Business District, Dhaka-1205',
      supervisorContact: '+880-1987-654321'
    },
    financialInfo: {
      bankName: 'Standard Bank',
      accountNumber: '****-****-1234',
      otherIncome: 15000,
      monthlyExpenses: 45000,
      assets: 2500000,
      liabilities: 800000
    },
    loanHistory: {
      previousLoans: 2,
      defaultHistory: false,
      creditUtilization: 35,
      paymentHistory: 'Excellent'
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  const getDocumentStatus = (hasDocument: boolean) => {
    return hasDocument ? (
      <div className="flex items-center text-green-600">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        <span className="text-sm">Verified</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600">
        <XCircleIcon className="w-4 h-4 mr-1" />
        <span className="text-sm">Missing</span>
      </div>
    );
  };

  const getRiskAssessment = () => {
    const factors = [];
    
    if (enhancedApplication.creditScore >= 750) factors.push({ factor: 'Excellent Credit Score', impact: 'positive' });
    else if (enhancedApplication.creditScore >= 650) factors.push({ factor: 'Good Credit Score', impact: 'neutral' });
    else factors.push({ factor: 'Poor Credit Score', impact: 'negative' });
    
    if (enhancedApplication.monthlyIncome >= 60000) factors.push({ factor: 'High Income', impact: 'positive' });
    else if (enhancedApplication.monthlyIncome >= 40000) factors.push({ factor: 'Moderate Income', impact: 'neutral' });
    else factors.push({ factor: 'Low Income', impact: 'negative' });
    
    if (enhancedApplication.employmentDuration >= 24) factors.push({ factor: 'Stable Employment', impact: 'positive' });
    else factors.push({ factor: 'Short Employment History', impact: 'negative' });
    
    if (enhancedApplication.existingLoans === 0) factors.push({ factor: 'No Existing Loans', impact: 'positive' });
    else if (enhancedApplication.existingLoans <= 2) factors.push({ factor: 'Manageable Debt Load', impact: 'neutral' });
    else factors.push({ factor: 'High Debt Load', impact: 'negative' });

    return factors;
  };

  // Enhanced approval handler with real-time processing
  const handleApprovalSubmit = async () => {
    try {
      // Validate approval data
      if (!approvalData.approvedAmount || approvalData.approvedAmount <= 0) {
        alert('Please enter a valid approved amount');
        return;
      }
      
      if (!approvalData.interestRate || approvalData.interestRate <= 0) {
        alert('Please enter a valid interest rate');
        return;
      }

      // Show processing state
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = 'Processing approval...';
      document.body.appendChild(processingToast);

      // Simulate real-time API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate EMI for approval
      const monthlyEMI = calculateEMI(approvalData.approvedAmount, approvalData.interestRate, approvalData.loanTerm);
      
      const approvalComment = `Approved: ${formatCurrency(approvalData.approvedAmount)} at ${approvalData.interestRate}% for ${approvalData.loanTerm} months. Monthly EMI: ${formatCurrency(monthlyEMI)}. ${approvalData.comments}`;
      
      // Process approval
      onApprove(application.id, approvalComment);
      
      // Remove processing toast
      document.body.removeChild(processingToast);
      
      // Show success notification
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successToast.textContent = 'Application approved successfully!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      // Log approval action
      console.log(`Loan application ${application.id} approved by admin`, {
        approvedAmount: approvalData.approvedAmount,
        interestRate: approvalData.interestRate,
        loanTerm: approvalData.loanTerm,
        monthlyEMI: monthlyEMI,
        timestamp: new Date().toISOString()
      });

      setShowApprovalForm(false);
      onClose();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    }
  };

  const handleRejectionSubmit = async () => {
    try {
      // Validate rejection data
      if (!rejectionData.reason) {
        alert('Please select a rejection reason');
        return;
      }
      
      if (!rejectionData.comments.trim()) {
        alert('Please provide detailed comments for rejection');
        return;
      }

      // Show processing state
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = 'Processing rejection...';
      document.body.appendChild(processingToast);

      // Simulate real-time API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const rejectionComment = `Rejected - ${rejectionData.reason}: ${rejectionData.comments}`;
      
      // Process rejection
      onReject(application.id, rejectionComment);
      
      // Remove processing toast
      document.body.removeChild(processingToast);
      
      // Show success notification
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successToast.textContent = rejectionData.sendNotification ? 
        'Application rejected and notification sent!' : 
        'Application rejected successfully!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      // Log rejection action
      console.log(`Loan application ${application.id} rejected by admin`, {
        reason: rejectionData.reason,
        comments: rejectionData.comments,
        notificationSent: rejectionData.sendNotification,
        timestamp: new Date().toISOString()
      });

      setShowRejectionForm(false);
      onClose();
    } catch (error) {
      console.error('Error processing rejection:', error);
      alert('Failed to process rejection. Please try again.');
    }
  };

  const handleApprove = async () => {
    try {
      if (!adminComments.trim()) {
        alert('Please provide comments for approval');
        return;
      }

      // Show processing notification
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = 'Processing quick approval...';
      document.body.appendChild(processingToast);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onApprove(enhancedApplication.id, adminComments);
      
      // Remove processing toast
      document.body.removeChild(processingToast);
      
      // Show success notification
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successToast.textContent = 'Quick approval processed!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      onClose();
    } catch (error) {
      console.error('Error processing quick approval:', error);
      alert('Failed to process approval. Please try again.');
    }
  };

  const handleReject = async () => {
    try {
      if (!adminComments.trim()) {
        alert('Please provide comments for rejection');
        return;
      }

      // Show processing notification
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = 'Processing quick rejection...';
      document.body.appendChild(processingToast);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onReject(enhancedApplication.id, adminComments);
      
      // Remove processing toast
      document.body.removeChild(processingToast);
      
      // Show success notification
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successToast.textContent = 'Quick rejection processed!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      onClose();
    } catch (error) {
      console.error('Error processing quick rejection:', error);
      alert('Failed to process rejection. Please try again.');
    }
  };

  const handleManualScoreToggle = () => {
    setUseManualScore(!useManualScore);
    if (!useManualScore) {
      setManualCreditScore(creditScore?.score || application?.creditScore || 0);
    }
  };

  const handleCreditScoreUpdate = () => {
    onUpdateCreditScore(enhancedApplication.id, manualCreditScore);
    setShowCreditScoreEdit(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'financial', name: 'Financial', icon: BanknotesIcon },
    { id: 'credit', name: 'Credit Assessment', icon: ChartBarIcon },
    { id: 'decision', name: 'Decision', icon: CheckCircleIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t('applicationDetails') || 'Application Details'} - {enhancedApplication.id}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {enhancedApplication.applicantName} • {formatCurrency(enhancedApplication.amount)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.applicantName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.personalInfo?.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {enhancedApplication.applicantEmail}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {enhancedApplication.applicantPhone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {enhancedApplication.personalInfo?.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.personalInfo?.maritalStatus}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dependents</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.personalInfo?.dependents}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Employment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.employmentInfo?.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.employmentInfo?.designation}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.employmentType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.employmentDuration} months</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold text-green-600">
                        {formatCurrency(enhancedApplication.monthlyIncome)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Other Income</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency(enhancedApplication.financialInfo?.otherIncome || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BanknotesIcon className="w-5 h-5 mr-2" />
                    Loan Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                      <p className="mt-1 text-lg font-bold text-blue-600">
                        {formatCurrency(enhancedApplication.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purpose</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.purpose}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Repayment Period</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.repaymentPeriod} months</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated EMI</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold">
                        {formatCurrency(calculateEMI(enhancedApplication.amount, 12, enhancedApplication.repaymentPeriod))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Document Verification</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enhancedApplication.documents).map(([docType, hasDoc]) => (
                    <div key={docType} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 capitalize">
                          {docType.replace(/([A-Z])/g, ' $1').trim()}
                        </h5>
                        {getDocumentStatus(hasDoc)}
                      </div>
                      
                      {hasDoc && (
                        <div className="flex space-x-2 mt-3">
                          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm">
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      {Object.values(enhancedApplication.documents).filter(Boolean).length} of {Object.keys(enhancedApplication.documents).length} documents verified
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income & Expenses */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Income & Expenses</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Income</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(enhancedApplication.monthlyIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Other Income</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(enhancedApplication.financialInfo?.otherIncome || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Expenses</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(enhancedApplication.financialInfo?.monthlyExpenses || 0)}
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Income</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency((enhancedApplication.monthlyIncome + (enhancedApplication.financialInfo?.otherIncome || 0)) - (enhancedApplication.financialInfo?.monthlyExpenses || 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assets & Liabilities */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Assets & Liabilities</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Assets</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(enhancedApplication.financialInfo?.assets || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Liabilities</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(enhancedApplication.financialInfo?.liabilities || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Existing Loans</span>
                        <span className="text-sm font-medium">{enhancedApplication.existingLoans}</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Worth</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency((enhancedApplication.financialInfo?.assets || 0) - (enhancedApplication.financialInfo?.liabilities || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.financialInfo?.bankName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.financialInfo?.accountNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'credit' && (
              <div className="space-y-6">
                {/* Automated Credit Assessment */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CalculatorIcon className="w-6 h-6 text-blue-600" />
                      <h4 className="text-lg font-medium text-gray-900">Automated Credit Assessment</h4>
                    </div>
                    <button
                      onClick={calculateAutomatedScore}
                      disabled={isCalculatingScore}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isCalculatingScore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Calculating...</span>
                        </>
                      ) : (
                        <>
                          <CalculatorIcon className="w-4 h-4" />
                          <span>Recalculate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {creditScore && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Credit Score Display */}
                      <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{creditScore.score}</div>
                        <div className="text-lg font-medium text-gray-900 mb-1">Grade: {creditScore.grade}</div>
                        <div className={`text-sm px-3 py-1 rounded-full ${
                          creditScore.riskLevel === 'Very Low' ? 'bg-green-100 text-green-800' :
                          creditScore.riskLevel === 'Low' ? 'bg-blue-100 text-blue-800' :
                          creditScore.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          creditScore.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {creditScore.riskLevel} Risk
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                        <div className={`text-2xl font-bold mb-2 ${
                          creditScore.recommendation === 'Approve' ? 'text-green-600' :
                          creditScore.recommendation === 'Review' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {creditScore.recommendation}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Max Loan Amount</div>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(creditScore.maxLoanAmount)}
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-3xl font-bold text-indigo-600 mb-2">
                          {creditScore.recommendedInterestRate}%
                        </div>
                        <div className="text-sm text-gray-600">Recommended Rate</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Based on risk assessment
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Factor Breakdown */}
                  {creditScore && (
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="text-md font-medium text-gray-900 mb-4">Score Breakdown</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{creditScore.factors.incomeScore}</div>
                          <div className="text-xs text-gray-600">Income</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{creditScore.factors.debtToIncomeRatio}</div>
                          <div className="text-xs text-gray-600">Debt Ratio</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{creditScore.factors.creditHistoryScore}</div>
                          <div className="text-xs text-gray-600">History</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{creditScore.factors.employmentScore}</div>
                          <div className="text-xs text-gray-600">Employment</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{creditScore.factors.defaultScore}</div>
                          <div className="text-xs text-gray-600">Defaults</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Override Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Manual Credit Score Override</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useManualScore"
                        checked={useManualScore}
                        onChange={handleManualScoreToggle}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="useManualScore" className="text-sm text-gray-700">
                        Use Manual Score
                      </label>
                    </div>
                  </div>
                  
                  {useManualScore && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Manual Score:</label>
                        <input
                          type="number"
                          value={manualCreditScore}
                          onChange={(e) => setManualCreditScore(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="300"
                          max="850"
                        />
                      </div>
                      <button
                        onClick={handleCreditScoreUpdate}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Update Score
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      Final Score: {useManualScore ? manualCreditScore : (creditScore?.score || enhancedApplication.creditScore)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {useManualScore ? 'Manual Override Active' : 'Automated Assessment'}
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h4>
                  <div className="space-y-3">
                    {getRiskAssessment().map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm text-gray-900">{factor.factor}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                          factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {factor.impact.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credit History */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Credit History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Loans</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.loanHistory?.previousLoans}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment History</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.loanHistory?.paymentHistory}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credit Utilization</label>
                      <p className="mt-1 text-sm text-gray-900">{enhancedApplication.loanHistory?.creditUtilization}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Default History</label>
                      <p className={`mt-1 text-sm ${enhancedApplication.loanHistory?.defaultHistory ? 'text-red-600' : 'text-green-600'}`}>
                        {enhancedApplication.loanHistory?.defaultHistory ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'decision' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Application Decision</h4>
                  
                  {enhancedApplication.status === 'pending' && (
                    <div className="space-y-4">
                      {/* Decision Buttons */}
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setShowApprovalForm(true)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Approve Application</span>
                        </button>
                        <button
                          onClick={() => setShowRejectionForm(true)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <XCircleIcon className="w-5 h-5" />
                          <span>Reject Application</span>
                        </button>
                      </div>

                      {/* Approval Form */}
                      {showApprovalForm && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-800 mb-3">Approve Application</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Approved Amount
                              </label>
                              <input
                                type="number"
                                value={approvalData.approvedAmount}
                                onChange={(e) => setApprovalData({...approvalData, approvedAmount: Number(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter approved amount"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest Rate (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={approvalData.interestRate}
                                onChange={(e) => setApprovalData({...approvalData, interestRate: Number(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter interest rate"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Term (months)
                              </label>
                              <select
                                value={approvalData.loanTerm}
                                onChange={(e) => setApprovalData({...approvalData, loanTerm: Number(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value={12}>12 months</option>
                                <option value={24}>24 months</option>
                                <option value={36}>36 months</option>
                                <option value={48}>48 months</option>
                                <option value={60}>60 months</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Approval Comments
                              </label>
                              <textarea
                                value={approvalData.comments}
                                onChange={(e) => setApprovalData({...approvalData, comments: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter approval comments and conditions..."
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleApprovalSubmit}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                              >
                                Confirm Approval
                              </button>
                              <button
                                onClick={() => setShowApprovalForm(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rejection Form */}
                      {showRejectionForm && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h5 className="font-medium text-red-800 mb-3">Reject Application</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rejection Reason
                              </label>
                              <select
                                value={rejectionData.reason}
                                onChange={(e) => setRejectionData({...rejectionData, reason: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <option value="">Select rejection reason</option>
                                <option value="insufficient_income">Insufficient Income</option>
                                <option value="poor_credit_history">Poor Credit History</option>
                                <option value="incomplete_documentation">Incomplete Documentation</option>
                                <option value="high_debt_ratio">High Debt-to-Income Ratio</option>
                                <option value="employment_verification_failed">Employment Verification Failed</option>
                                <option value="policy_violation">Policy Violation</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Detailed Comments
                              </label>
                              <textarea
                                value={rejectionData.comments}
                                onChange={(e) => setRejectionData({...rejectionData, comments: e.target.value})}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Provide detailed explanation for rejection..."
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="sendNotification"
                                checked={rejectionData.sendNotification}
                                onChange={(e) => setRejectionData({...rejectionData, sendNotification: e.target.checked})}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor="sendNotification" className="text-sm text-gray-700">
                                Send rejection notification to applicant
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleRejectionSubmit}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                              >
                                Confirm Rejection
                              </button>
                              <button
                                onClick={() => setShowRejectionForm(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Decision Section */}
                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Quick Decision (Legacy)</h5>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Comments / Reason
                          </label>
                          <textarea
                            value={adminComments}
                            onChange={(e) => setAdminComments(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your comments or reason for approval/rejection..."
                          />
                        </div>
                        
                        <div className="flex space-x-4 mt-3">
                          <button
                            onClick={handleApprove}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Quick Approve</span>
                          </button>
                          
                          <button
                            onClick={handleReject}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center space-x-2"
                          >
                            <XCircleIcon className="w-5 h-5" />
                            <span>Quick Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Decision Display */}
                  {enhancedApplication.status !== 'pending' && (
                    <div className={`p-4 rounded-lg ${
                      enhancedApplication.status === 'approved' ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {enhancedApplication.status === 'approved' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          enhancedApplication.status === 'approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Application {enhancedApplication.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      {enhancedApplication.adminComments && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Comments:</strong> {enhancedApplication.adminComments}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Decision made on {enhancedApplication.lastUpdated}
                      </p>
                    </div>
                  )}
                </div>

                {/* Application Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Application Submitted</p>
                        <p className="text-xs text-gray-500">{enhancedApplication.applicationDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Under Review</p>
                        <p className="text-xs text-gray-500">{enhancedApplication.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Pending Decision</p>
                        <p className="text-xs text-gray-400">Awaiting admin action</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;