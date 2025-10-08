import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import LoanApplicationsView from '../components/admin/LoanApplicationsView';
import ApplicationDetailsModal from '../components/admin/ApplicationDetailsModal';
import DisbursementModal from '../components/admin/DisbursementModal';
import EMIScheduleModal from '../components/admin/EMIScheduleModal';
import LoanMonitoringDashboard from '../components/admin/LoanMonitoringDashboard';
import { LoanSchedule, EMICalculator } from '../utils/emiCalculator';
import { realtimeService } from '../services/realtimeService';

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
  interestRate?: number;
  lastUpdated: string;
  assignedTo?: string;
  documents: {
    idProof: boolean;
    incomeProof: boolean;
    addressProof: boolean;
    bankStatement: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high';
  adminComments?: string;
}

interface AdminStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalDisbursed: number;
  averageProcessingTime: number;
}

const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [disbursementApplication, setDisbursementApplication] = useState<LoanApplication | null>(null);
  const [isEMIScheduleModalOpen, setIsEMIScheduleModalOpen] = useState(false);
  const [selectedLoanSchedule, setSelectedLoanSchedule] = useState<LoanSchedule | null>(null);
  const [loanSchedules, setLoanSchedules] = useState<LoanSchedule[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedLoans: 0,
    totalDisbursed: 0,
    rejectedApplications: 0,
    highRiskApplications: 0
  });

  // Mock data for loan applications
  useEffect(() => {
    const mockApplications: LoanApplication[] = [
      {
        id: 'LA001',
        applicantName: 'John Smith',
        applicantEmail: 'john.smith@email.com',
        applicantPhone: '+1-555-0123',
        amount: 500000,
        purpose: 'Home Purchase',
        repaymentPeriod: 240,
        status: 'pending',
        applicationDate: '2024-01-15',
        creditScore: 750,
        monthlyIncome: 80000,
        employmentType: 'Salaried',
        employmentDuration: 60,
        existingLoans: 1,
        lastUpdated: '2024-01-15T10:30:00Z',
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: true,
          bankStatement: true
        },
        riskLevel: 'low'
      },
      {
        id: 'LA002',
        applicantName: 'Sarah Johnson',
        applicantEmail: 'sarah.johnson@email.com',
        applicantPhone: '+1-555-0456',
        amount: 200000,
        purpose: 'Business Expansion',
        repaymentPeriod: 60,
        status: 'approved',
        applicationDate: '2024-01-10',
        creditScore: 680,
        monthlyIncome: 60000,
        employmentType: 'Self-Employed',
        employmentDuration: 36,
        existingLoans: 0,
        lastUpdated: '2024-01-10T14:20:00Z',
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: false,
          bankStatement: true
        },
        riskLevel: 'medium'
      },
      {
        id: 'LA003',
        applicantName: 'Michael Brown',
        applicantEmail: 'michael.brown@email.com',
        applicantPhone: '+1-555-0789',
        amount: 100000,
        purpose: 'Education',
        repaymentPeriod: 84,
        status: 'rejected',
        applicationDate: '2024-01-08',
        creditScore: 520,
        monthlyIncome: 25000,
        employmentType: 'Contract',
        employmentDuration: 12,
        existingLoans: 2,
        lastUpdated: '2024-01-08T09:15:00Z',
        documents: {
          idProof: true,
          incomeProof: false,
          addressProof: true,
          bankStatement: false
        },
        riskLevel: 'high'
      }
    ];

    setApplications(mockApplications);

    // Calculate stats
    const newStats = {
      totalApplications: mockApplications.length,
      pendingApplications: mockApplications.filter(app => app.status === 'pending').length,
      approvedLoans: mockApplications.filter(app => app.status === 'approved').length,
      rejectedApplications: mockApplications.filter(app => app.status === 'rejected').length,
      totalDisbursed: mockApplications
        .filter(app => app.status === 'approved')
        .reduce((sum, app) => sum + app.amount, 0),
      highRiskApplications: mockApplications.filter(app => app.riskLevel === 'high').length
    };

    setStats(newStats);
  }, []);

  const handleViewApplication = (application: LoanApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleApproveApplication = async (applicationId: string, comments?: string, approvalData?: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const interestRate = approvalData?.interestRate || 12;
      const approvedAmount = approvalData?.approvedAmount || applications.find(app => app.id === applicationId)?.amount || 0;
      
      // Find the application to get user information
      const application = applications.find(app => app.id === applicationId);
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'approved' as const, 
              adminComments: comments,
              interestRate,
              approvedAmount,
              lastUpdated: new Date().toISOString().split('T')[0] 
            }
          : app
      ));
      
      // Update stats
      const updatedApps = applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'approved' as const, adminComments: comments }
          : app
      );
      const newStats = {
        ...stats,
        pendingApplications: updatedApps.filter(app => app.status === 'pending').length,
        approvedLoans: updatedApps.filter(app => app.status === 'approved').length,
        totalDisbursed: updatedApps
          .filter(app => app.status === 'approved')
          .reduce((sum, app) => sum + app.amount, 0)
      };
      setStats(newStats);
      
      // Emit real-time event for user notification
      if (application) {
        realtimeService.emitLoanApproval(
          application.applicantEmail, // Using email as userId for now
          applicationId,
          {
            amount: approvedAmount,
            interestRate,
            comments,
            approvalDate: new Date().toISOString()
          }
        );
      }
      
      // Show success notification
      alert(`Loan application ${applicationId} has been approved successfully!`);
      
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const handleRejectApplication = async (applicationId: string, comments?: string, rejectionData?: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the application to get user information
      const application = applications.find(app => app.id === applicationId);
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'rejected' as const, 
              adminComments: comments,
              rejectionReason: rejectionData?.reason,
              lastUpdated: new Date().toISOString().split('T')[0] 
            }
          : app
      ));
      
      // Update stats
      const updatedApps = applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' as const, adminComments: comments }
          : app
      );
      const newStats = {
        ...stats,
        pendingApplications: updatedApps.filter(app => app.status === 'pending').length,
        rejectedApplications: updatedApps.filter(app => app.status === 'rejected').length
      };
      setStats(newStats);
      
      // Emit real-time event for user notification
      if (application) {
        realtimeService.emitLoanRejection(
          application.applicantEmail, // Using email as userId for now
          applicationId,
          {
            reason: rejectionData?.reason || 'Application did not meet requirements',
            comments,
            rejectionDate: new Date().toISOString()
          }
        );
      }
      
      // Send notification if requested
      if (rejectionData?.sendNotification) {
        // Simulate sending notification
        console.log(`Notification sent to applicant for rejection of ${applicationId}`);
      }
      
      // Show success notification
      alert(`Loan application ${applicationId} has been rejected.`);
      
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const handleUpdateCreditScore = (applicationId: string, newCreditScore: number) => {
    const application = applications.find(app => app.id === applicationId);
    
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, creditScore: newCreditScore, lastUpdated: new Date().toISOString().split('T')[0] }
        : app
    ));

    // Emit real-time event for credit score update
    if (application) {
      realtimeService.emitCreditScoreUpdate(application.applicantEmail, newCreditScore);
    }
  };

  const handleDisburse = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (application && application.status === 'approved') {
        setDisbursementApplication(application);
        setIsDisbursementModalOpen(true);
      } else {
        alert('Application must be approved before disbursement.');
      }
    } catch (error) {
      console.error('Error initiating disbursement:', error);
      alert('Failed to initiate disbursement. Please try again.');
    }
  };

  const handleDisbursementComplete = async (applicationId: string, disbursementData: any) => {
    try {
      // Simulate API call for disbursement processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const application = applications.find(app => app.id === applicationId);
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'disbursed' as any,
              disbursementData,
              disbursementDate: new Date().toLocaleDateString(),
              lastUpdated: new Date().toLocaleDateString()
            }
          : app
      ));
      
      // Create EMI schedule for disbursed loan
      if (application) {
        const loanSchedule = EMICalculator.createLoanSchedule(
          applicationId,
          application.applicantName,
          disbursementData.amount,
          disbursementData.interestRate || application.interestRate || 12,
          application.repaymentPeriod,
          new Date()
        );
        
        setLoanSchedules(prev => [...prev, loanSchedule]);
        
        // Emit real-time event for loan disbursement
        realtimeService.emitLoanDisbursement(
          application.applicantEmail,
          applicationId,
          {
            disbursedAmount: disbursementData.amount,
            interestRate: disbursementData.interestRate || application.interestRate || 12,
            repaymentPeriod: application.repaymentPeriod,
            transactionId: disbursementData.transactionId,
            disbursementDate: new Date().toISOString(),
            bankDetails: disbursementData.bankDetails
          }
        );
        
        // Log disbursement activity
        console.log(`Loan disbursed: ${applicationId} - Amount: ${disbursementData.amount} - Transaction ID: ${disbursementData.transactionId}`);
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalDisbursed: prev.totalDisbursed + disbursementData.amount,
        approvedLoans: prev.approvedLoans - 1
      }));
      
      setIsDisbursementModalOpen(false);
      setDisbursementApplication(null);
      
      // Show success notification
      alert(`Loan disbursement completed successfully! Transaction ID: ${disbursementData.transactionId}`);
      
    } catch (error) {
      console.error('Error completing disbursement:', error);
      alert('Failed to complete disbursement. Please try again.');
    }
  };

  const handleViewEMISchedule = (applicationId: string) => {
    const schedule = loanSchedules.find(schedule => schedule.loanId === applicationId);
    if (schedule) {
      setSelectedLoanSchedule(schedule);
      setIsEMIScheduleModalOpen(true);
    }
  };

  const handleUpdatePayment = async (installmentNumber: number, paidAmount: number) => {
    if (!selectedLoanSchedule) return;
    
    try {
      // Simulate API call for payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSchedule = EMICalculator.updatePaymentStatus(
        selectedLoanSchedule,
        installmentNumber,
        paidAmount
      );
      
      setLoanSchedules(prev => prev.map(schedule => 
        schedule.loanId === selectedLoanSchedule.loanId ? updatedSchedule : schedule
      ));
      
      setSelectedLoanSchedule(updatedSchedule);
      
      // Log payment activity
      console.log(`Payment updated: Loan ${selectedLoanSchedule.loanId} - Installment ${installmentNumber} - Amount: ${paidAmount}`);
      
      // Show success notification
      alert(`Payment of ৳${paidAmount.toLocaleString()} recorded successfully for installment ${installmentNumber}!`);
      
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment. Please try again.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string;
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('adminPanel') || 'Admin Panel'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('loanManagementSystem') || 'Loan Management System'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <span>{t('settings') || 'Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: t('dashboard') || 'Dashboard', icon: ChartBarIcon },
              { id: 'applications', name: t('loanApplications') || 'Loan Applications', icon: DocumentTextIcon },
              { id: 'approved', name: t('approvedLoans') || 'Approved Loans', icon: CheckCircleIcon },
              { id: 'disbursement', name: t('disbursement') || 'Disbursement', icon: CurrencyDollarIcon },
              { id: 'emi', name: t('emiManagement') || 'EMI Management', icon: CalendarIcon },
              { id: 'monitoring', name: t('loanMonitoring') || 'Loan Monitoring', icon: MagnifyingGlassIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={t('totalApplications') || 'Total Applications'}
                value={stats.totalApplications}
                icon={DocumentTextIcon}
                color="text-blue-600"
                onClick={() => setActiveTab('applications')}
              />
              <StatCard
                title={t('pendingReview') || 'Pending Review'}
                value={stats.pendingApplications}
                icon={ClockIcon}
                color="text-yellow-600"
                onClick={() => setActiveTab('applications')}
              />
              <StatCard
                title={t('approvedLoans') || 'Approved Loans'}
                value={stats.approvedLoans}
                icon={CheckCircleIcon}
                color="text-green-600"
                onClick={() => setActiveTab('approved')}
              />
              <StatCard
                title={t('totalDisbursed') || 'Total Disbursed'}
                value={formatCurrency(stats.totalDisbursed)}
                icon={CurrencyDollarIcon}
                color="text-purple-600"
              />
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('recentApplications') || 'Recent Applications'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('applicant') || 'Applicant'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('amount') || 'Amount'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('purpose') || 'Purpose'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('creditScore') || 'Credit Score'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risk') || 'Risk'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.slice(0, 5).map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.applicantName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(application.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.creditScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getRiskColor(application.riskLevel)}`}>
                            {application.riskLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <LoanApplicationsView
            onViewApplication={handleViewApplication}
            onApproveApplication={(id) => handleApproveApplication(id, '')}
            onRejectApplication={(id) => handleRejectApplication(id, '')}
          />
        )}

        {activeTab === 'approved' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('approvedLoansManagement') || 'Approved Loans Management'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Term
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.filter(app => app.status === 'approved' || app.status === 'disbursed').map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {application.applicantName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.applicantName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(application.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.repaymentPeriod} months
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {application.status === 'disbursed' && (
                          <button
                            onClick={() => handleViewEMISchedule(application.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View EMI Schedule
                          </button>
                        )}
                        {application.status === 'approved' && (
                          <button
                            onClick={() => handleDisburse(application.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {applications.filter(app => app.status === 'approved' || app.status === 'disbursed').length === 0 && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No approved loans found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'disbursement' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('disbursementManagement') || 'Disbursement Management'}
            </h3>
            
            {/* Approved Loans Ready for Disbursement */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Ready for Disbursement</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approval Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.filter(app => app.status === 'approved').map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {application.applicantName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.applicantName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(application.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.interestRate || 12}% APR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.lastUpdated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDisburse(application.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                          >
                            <BanknotesIcon className="w-4 h-4" />
                            <span>Disburse Now</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {applications.filter(app => app.status === 'approved').length === 0 && (
                  <div className="text-center py-8">
                    <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No approved loans ready for disbursement</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emi' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('emiManagement') || 'EMI Management'}
            </h3>
            
            <div className="space-y-6">
              {/* EMI Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Active Loans</p>
                      <p className="text-2xl font-bold text-blue-900">{loanSchedules.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-600">On-time Payments</p>
                      <p className="text-2xl font-bold text-green-900">
                        {loanSchedules.reduce((sum, schedule) => 
                          sum + schedule.installments.filter(inst => inst.status === 'paid').length, 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Overdue</p>
                      <p className="text-2xl font-bold text-red-900">
                        {loanSchedules.reduce((sum, schedule) => 
                          sum + schedule.installments.filter(inst => inst.status === 'overdue').length, 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Total Collected</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(loanSchedules.reduce((sum, schedule) => sum + schedule.totalPaid, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Loan Schedules */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Active Loan Schedules</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Borrower
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loan Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly EMI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loanSchedules.map((schedule) => {
                        const paymentSummary = EMICalculator.getPaymentSummary(schedule);
                        return (
                          <tr key={schedule.loanId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {schedule.borrowerName.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {schedule.borrowerName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {schedule.loanId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(schedule.loanAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {formatCurrency(schedule.emiDetails.monthlyEMI)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {schedule.nextDueDate || 'Completed'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>{paymentSummary.paidInstallments}/{paymentSummary.totalInstallments}</span>
                                    <span>{Math.round(paymentSummary.paymentProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${paymentSummary.paymentProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedLoanSchedule(schedule);
                                  setIsEMIScheduleModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Schedule
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {loanSchedules.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active loan schedules found</p>
                      <p className="text-sm text-gray-400 mt-1">EMI schedules will appear here after loans are disbursed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <LoanMonitoringDashboard />
        )}
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
        onUpdateCreditScore={handleUpdateCreditScore}
      />

      {/* Disbursement Modal */}
      <DisbursementModal
        application={disbursementApplication}
        isOpen={isDisbursementModalOpen}
        onClose={() => setIsDisbursementModalOpen(false)}
        onDisburse={handleDisbursementComplete}
      />

      {/* EMI Schedule Modal */}
      <EMIScheduleModal
        loanSchedule={selectedLoanSchedule}
        isOpen={isEMIScheduleModalOpen}
        onClose={() => {
          setIsEMIScheduleModalOpen(false);
          setSelectedLoanSchedule(null);
        }}
        onUpdatePayment={handleUpdatePayment}
      />
    </div>
  );
};

export default AdminPanel;