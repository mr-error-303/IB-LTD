import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  BellIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { RiskMonitoringEngine, RiskAlert, LoanRiskProfile } from '../../utils/riskMonitoring';
import { PaymentReminderSystem, PaymentReminder, NotificationPreferences } from '../../utils/paymentReminders';
import RestructuringModal from './RestructuringModal';
import EarlyRepaymentModal from './EarlyRepaymentModal';
import ForeclosureModal from './ForeclosureModal';
import LoanExtensionModal from './LoanExtensionModal';

interface MonitoringStats {
  totalLoans: number;
  highRiskLoans: number;
  overduePayments: number;
  pendingReminders: number;
  totalAlerts: number;
  collectionCases: number;
  totalPortfolioValue: number;
  averageRiskScore: number;
  collectionRate: number;
  monthlyRecovery: number;
}

interface LoanMonitoringData {
  loanId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  loanAmount: number;
  outstandingBalance: number;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  daysOverdue: number;
  alerts: RiskAlert[];
  reminders: PaymentReminder[];
  status: 'current' | 'overdue' | 'default' | 'restructured';
  // Enhanced fields for portfolio management
  interestRate: number;
  loanTerm: number;
  remainingTerm: number;
  monthlyPayment: number;
  totalPaid: number;
  lastPaymentDate: Date | null;
  paymentHistory: PaymentRecord[];
  collateralValue?: number;
  loanToValue?: number;
  debtToIncome?: number;
  restructureHistory: RestructureRecord[];
}

interface PaymentRecord {
  paymentId: string;
  paymentDate: Date;
  amount: number;
  principal: number;
  interest: number;
  fees: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  lateDays: number;
}

interface RestructureRecord {
  restructureId: string;
  restructureDate: Date;
  reason: string;
  oldTerms: {
    interestRate: number;
    monthlyPayment: number;
    remainingTerm: number;
  };
  newTerms: {
    interestRate: number;
    monthlyPayment: number;
    remainingTerm: number;
  };
  approvedBy: string;
}

const LoanMonitoringDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'alerts' | 'reminders' | 'analytics'>('overview');
  const [monitoringData, setMonitoringData] = useState<LoanMonitoringData[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    totalLoans: 0,
    highRiskLoans: 0,
    overduePayments: 0,
    pendingReminders: 0,
    totalAlerts: 0,
    collectionCases: 0,
    totalPortfolioValue: 0,
    averageRiskScore: 0,
    collectionRate: 0,
    monthlyRecovery: 0
  });
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30days');
  const [sortBy, setSortBy] = useState<string>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isRestructuringModalOpen, setIsRestructuringModalOpen] = useState(false);
  const [isEarlyRepaymentModalOpen, setIsEarlyRepaymentModalOpen] = useState(false);
  const [isForeclosureModalOpen, setIsForeclosureModalOpen] = useState(false);
  const [isLoanExtensionModalOpen, setIsLoanExtensionModalOpen] = useState(false);
  const [selectedLoanForAction, setSelectedLoanForAction] = useState<LoanMonitoringData | null>(null);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with portfolio management features
      const mockData: LoanMonitoringData[] = [
        {
          loanId: 'LOAN001',
          borrowerName: 'John Smith',
          borrowerEmail: 'john.smith@email.com',
          borrowerPhone: '+1234567890',
          loanAmount: 50000,
          outstandingBalance: 35000,
          nextPaymentDate: new Date('2024-01-15'),
          nextPaymentAmount: 2500,
          riskScore: 85,
          riskLevel: 'high',
          daysOverdue: 5,
          alerts: [],
          reminders: [],
          status: 'overdue',
          interestRate: 8.5,
          loanTerm: 24,
          remainingTerm: 14,
          monthlyPayment: 2500,
          totalPaid: 15000,
          lastPaymentDate: new Date('2023-12-10'),
          paymentHistory: [
            {
              paymentId: 'PAY001',
              paymentDate: new Date('2023-12-10'),
              amount: 2500,
              principal: 2100,
              interest: 400,
              fees: 0,
              paymentMethod: 'Bank Transfer',
              status: 'completed',
              lateDays: 0
            }
          ],
          collateralValue: 60000,
          loanToValue: 83.3,
          debtToIncome: 35.7,
          restructureHistory: []
        },
        {
          loanId: 'LOAN002',
          borrowerName: 'Sarah Johnson',
          borrowerEmail: 'sarah.j@email.com',
          borrowerPhone: '+1234567891',
          loanAmount: 75000,
          outstandingBalance: 60000,
          nextPaymentDate: new Date('2024-01-20'),
          nextPaymentAmount: 3200,
          riskScore: 45,
          riskLevel: 'medium',
          daysOverdue: 0,
          alerts: [],
          reminders: [],
          status: 'current',
          interestRate: 7.2,
          loanTerm: 36,
          remainingTerm: 25,
          monthlyPayment: 3200,
          totalPaid: 35200,
          lastPaymentDate: new Date('2023-12-20'),
          paymentHistory: [
            {
              paymentId: 'PAY002',
              paymentDate: new Date('2023-12-20'),
              amount: 3200,
              principal: 2650,
              interest: 550,
              fees: 0,
              paymentMethod: 'Auto Debit',
              status: 'completed',
              lateDays: 0
            }
          ],
          collateralValue: 90000,
          loanToValue: 66.7,
          debtToIncome: 28.4,
          restructureHistory: []
        },
        {
          loanId: 'LOAN003',
          borrowerName: 'Michael Brown',
          borrowerEmail: 'mike.brown@email.com',
          borrowerPhone: '+1234567892',
          loanAmount: 100000,
          outstandingBalance: 85000,
          nextPaymentDate: new Date('2024-01-10'),
          nextPaymentAmount: 4500,
          riskScore: 95,
          riskLevel: 'critical',
          daysOverdue: 15,
          alerts: [],
          reminders: [],
          status: 'default',
          interestRate: 12.5,
          loanTerm: 30,
          remainingTerm: 22,
          monthlyPayment: 4500,
          totalPaid: 36000,
          lastPaymentDate: new Date('2023-11-25'),
          paymentHistory: [
            {
              paymentId: 'PAY003',
              paymentDate: new Date('2023-11-25'),
              amount: 4500,
              principal: 3200,
              interest: 1050,
              fees: 250,
              paymentMethod: 'Cash',
              status: 'completed',
              lateDays: 10
            }
          ],
          collateralValue: 80000,
          loanToValue: 106.3,
          debtToIncome: 52.9,
          restructureHistory: [
            {
              restructureId: 'REST001',
              restructureDate: new Date('2023-10-15'),
              reason: 'Financial hardship',
              oldTerms: {
                interestRate: 10.5,
                monthlyPayment: 5200,
                remainingTerm: 24
              },
              newTerms: {
                interestRate: 12.5,
                monthlyPayment: 4500,
                remainingTerm: 30
              },
              approvedBy: 'Admin User'
            }
          ]
        }
      ];

      // Generate alerts and reminders for each loan
      const enrichedData = mockData.map(loan => {
        const riskProfile: LoanRiskProfile = {
          loanId: loan.loanId,
          borrowerId: loan.borrowerName,
          currentRiskScore: 650,
          previousRiskScore: 600,
          riskTrend: loan.daysOverdue > 0 ? 'deteriorating' : 'stable',
          paymentHistory: [],
          consecutiveLatePayments: loan.daysOverdue > 0 ? 1 : 0,
          totalOverdueAmount: loan.daysOverdue > 0 ? loan.nextPaymentAmount : 0,
          lastPaymentDate: loan.lastPaymentDate || new Date('2023-12-10'),
          nextDueDate: new Date(loan.nextPaymentDate),
          probabilityOfDefault: 0.15
        };

        const alerts = RiskMonitoringEngine.generateRiskAlerts(riskProfile);
        
        const preferences: NotificationPreferences = {
          borrowerId: loan.borrowerName,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: false,
          callEnabled: true,
          preferredChannel: 'email',
          reminderFrequency: 'daily',
          optOut: false
        };

        const reminders = PaymentReminderSystem.generateReminders(
          loan.loanId,
          loan.borrowerName,
          loan.borrowerName,
          loan.borrowerEmail,
          loan.borrowerPhone,
          loan.nextPaymentDate,
          loan.nextPaymentAmount,
          preferences
        );

        return {
          ...loan,
          alerts,
          reminders
        };
      });

      setMonitoringData(enrichedData);

      // Calculate enhanced stats
      const totalPortfolioValue = enrichedData.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
      const totalPaid = enrichedData.reduce((sum, loan) => sum + loan.totalPaid, 0);
      const averageRiskScore = enrichedData.reduce((sum, loan) => sum + loan.riskScore, 0) / enrichedData.length;
      const collectionRate = totalPaid / (totalPaid + totalPortfolioValue) * 100;
      const monthlyRecovery = enrichedData.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

      const newStats: MonitoringStats = {
        totalLoans: enrichedData.length,
        highRiskLoans: enrichedData.filter(loan => loan.riskLevel === 'high' || loan.riskLevel === 'critical').length,
        overduePayments: enrichedData.filter(loan => loan.daysOverdue > 0).length,
        pendingReminders: enrichedData.reduce((sum, loan) => sum + loan.reminders.filter(r => r.status === 'pending').length, 0),
        totalAlerts: enrichedData.reduce((sum, loan) => sum + loan.alerts.length, 0),
        collectionCases: enrichedData.filter(loan => loan.status === 'default').length,
        totalPortfolioValue,
        averageRiskScore,
        collectionRate,
        monthlyRecovery
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = monitoringData.filter(loan => {
    const riskMatch = selectedRiskLevel === 'all' || loan.riskLevel === selectedRiskLevel;
    const statusMatch = selectedStatus === 'all' || loan.status === selectedStatus;
    return riskMatch && statusMatch;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-yellow-600 bg-yellow-100';
      case 'default': return 'text-red-600 bg-red-100';
      case 'restructured': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Modal handlers
  const handleRestructuring = (loan: LoanMonitoringData) => {
    setSelectedLoanForAction(loan);
    setIsRestructuringModalOpen(true);
  };

  const handleEarlyRepayment = (loan: LoanMonitoringData) => {
    setSelectedLoanForAction(loan);
    setIsEarlyRepaymentModalOpen(true);
  };

  const handleForeclosure = (loan: LoanMonitoringData) => {
    setSelectedLoanForAction(loan);
    setIsForeclosureModalOpen(true);
  };

  const handleLoanExtension = (loan: LoanMonitoringData) => {
    setSelectedLoanForAction(loan);
    setIsLoanExtensionModalOpen(true);
  };

  const handleRestructuringSubmit = (solution: any) => {
    console.log('Restructuring solution submitted:', solution);
    // Handle restructuring submission
    setIsRestructuringModalOpen(false);
    setSelectedLoanForAction(null);
    // Refresh data
    loadMonitoringData();
  };

  const handleEarlyRepaymentConfirm = (option: any) => {
    console.log('Early repayment confirmed:', option);
    // Handle early repayment confirmation
    setIsEarlyRepaymentModalOpen(false);
    setSelectedLoanForAction(null);
    // Refresh data
    loadMonitoringData();
  };

  const handleForeclosureSubmit = (foreclosureData: any) => {
    console.log('Foreclosure initiated:', foreclosureData);
    // Handle foreclosure submission
    setIsForeclosureModalOpen(false);
    setSelectedLoanForAction(null);
    // Refresh data
    loadMonitoringData();
  };

  const handleLoanExtensionSubmit = (extensionData: any) => {
    console.log('Loan extension submitted:', extensionData);
    // Handle loan extension submission
    setIsLoanExtensionModalOpen(false);
    setSelectedLoanForAction(null);
    // Refresh data
    loadMonitoringData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Monitoring Dashboard</h1>
          <p className="text-gray-600">Monitor loan performance, risk alerts, and payment reminders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(stats.totalPortfolioValue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskLoans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.overduePayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.collectionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRiskScore.toFixed(0)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats.averageRiskScore < 50 ? 'bg-green-100 text-green-800' :
                stats.averageRiskScore < 75 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stats.averageRiskScore < 50 ? 'Low' : stats.averageRiskScore < 75 ? 'Medium' : 'High'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recovery</p>
                <p className="text-2xl font-bold text-gray-900">${(stats.monthlyRecovery / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <BellIcon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.collectionCases}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'portfolio', name: 'Portfolio', icon: '💼' },
                { id: 'alerts', name: 'Risk Alerts', icon: '⚠️' },
                { id: 'reminders', name: 'Payment Reminders', icon: '📧' },
                { id: 'analytics', name: 'Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <select
                    value={selectedRiskLevel}
                    onChange={(e) => setSelectedRiskLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="current">Current</option>
                    <option value="overdue">Overdue</option>
                    <option value="default">Default</option>
                    <option value="restructured">Restructured</option>
                  </select>

                  <button
                    onClick={loadMonitoringData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Refresh Data
                  </button>
                </div>

                {/* Loans Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Borrower
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loan Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Financial Metrics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment History
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Risk Assessment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monitoringData.map((loan) => (
                        <tr key={loan.loanId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                              <div className="text-sm text-gray-500">{loan.loanId}</div>
                              <div className="text-sm text-gray-500">{loan.borrowerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                ${loan.outstandingBalance.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Original: ${loan.loanAmount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {loan.interestRate}% APR • {loan.remainingTerm}m remaining
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {loan.loanToValue && (
                                <div className="text-sm">
                                  <span className="text-gray-500">LTV:</span>
                                  <span className={`ml-1 font-medium ${
                                    loan.loanToValue > 90 ? 'text-red-600' : 
                                    loan.loanToValue > 80 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {loan.loanToValue.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {loan.debtToIncome && (
                                <div className="text-sm">
                                  <span className="text-gray-500">DTI:</span>
                                  <span className={`ml-1 font-medium ${
                                    loan.debtToIncome > 40 ? 'text-red-600' : 
                                    loan.debtToIncome > 30 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {loan.debtToIncome.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="text-gray-500">Paid:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  ${loan.totalPaid.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                ${loan.monthlyPayment.toLocaleString()}/mo
                              </div>
                              {loan.lastPaymentDate && (
                                <div className="text-sm text-gray-500">
                                  Last: {loan.lastPaymentDate.toLocaleDateString()}
                                </div>
                              )}
                              <div className="text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                                  {loan.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(loan.riskLevel)}`}>
                                  {loan.riskLevel.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Score: {loan.riskScore}
                              </div>
                              {loan.daysOverdue > 0 && (
                                <div className="text-xs text-red-500 mt-1">
                                  {loan.daysOverdue} days overdue
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRestructuring(loan)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Restructure
                              </button>
                              <button
                                onClick={() => handleEarlyRepayment(loan)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Early Pay
                              </button>
                              <button
                                onClick={() => handleLoanExtension(loan)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Extend
                              </button>
                              <button
                                onClick={() => handleForeclosure(loan)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Foreclose
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Portfolio Management</h3>
                  <div className="flex space-x-4">
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="balance">Outstanding Balance</option>
                      <option value="risk">Risk Score</option>
                      <option value="ltv">Loan-to-Value</option>
                      <option value="dti">Debt-to-Income</option>
                    </select>
                  </div>
                </div>

                {/* Portfolio Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h4 className="text-lg font-semibold mb-2">Total Portfolio</h4>
                    <p className="text-3xl font-bold">${(stats.totalPortfolioValue / 1000000).toFixed(1)}M</p>
                    <p className="text-blue-100 text-sm mt-2">Across {stats.totalLoans} active loans</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h4 className="text-lg font-semibold mb-2">Monthly Recovery</h4>
                    <p className="text-3xl font-bold">${(stats.monthlyRecovery / 1000).toFixed(0)}K</p>
                    <p className="text-green-100 text-sm mt-2">{stats.collectionRate.toFixed(1)}% collection rate</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <h4 className="text-lg font-semibold mb-2">Risk Distribution</h4>
                    <p className="text-3xl font-bold">{stats.averageRiskScore.toFixed(0)}</p>
                    <p className="text-purple-100 text-sm mt-2">Average risk score</p>
                  </div>
                </div>

                {/* Payment History Analysis */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment History Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Recent Payments</h5>
                      <div className="space-y-3">
                        {monitoringData.flatMap(loan => 
                          loan.paymentHistory.map(payment => ({
                            ...payment,
                            borrowerName: loan.borrowerName,
                            loanId: loan.loanId
                          }))
                        ).slice(0, 5).map((payment) => (
                          <div key={payment.paymentId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.borrowerName} - {payment.loanId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.paymentDate.toLocaleDateString()} • {payment.paymentMethod}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                ${payment.amount.toLocaleString()}
                              </div>
                              <div className={`text-xs ${
                                payment.status === 'completed' ? 'text-green-600' :
                                payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {payment.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Restructure History</h5>
                      <div className="space-y-3">
                        {monitoringData.filter(loan => loan.restructureHistory.length > 0).map((loan) => 
                          loan.restructureHistory.map((restructure) => (
                            <div key={restructure.restructureId} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                              <div className="text-sm font-medium text-gray-900">
                                {loan.borrowerName} - {loan.loanId}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {restructure.reason}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {restructure.restructureDate.toLocaleDateString()} • By {restructure.approvedBy}
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Rate: {restructure.oldTerms.interestRate}% → {restructure.newTerms.interestRate}% • 
                                Payment: ${restructure.oldTerms.monthlyPayment} → ${restructure.newTerms.monthlyPayment}
                              </div>
                            </div>
                          ))
                        )}
                        {monitoringData.every(loan => loan.restructureHistory.length === 0) && (
                          <div className="text-sm text-gray-500 italic">No restructures in selected period</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Loan Portfolio Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Loan Portfolio Details</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Borrower
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loan Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Financial Metrics
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment History
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Assessment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monitoringData.map((loan) => (
                          <tr key={loan.loanId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                                <div className="text-sm text-gray-500">{loan.loanId}</div>
                                <div className="text-xs text-gray-400">{loan.borrowerEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  ${loan.loanAmount.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Outstanding: ${loan.outstandingBalance.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {loan.interestRate}% • {loan.remainingTerm}mo remaining
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">
                                  LTV: {loan.loanToValue ? `${loan.loanToValue.toFixed(1)}%` : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  DTI: {loan.debtToIncome ? `${loan.debtToIncome.toFixed(1)}%` : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Monthly: ${loan.monthlyPayment.toLocaleString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">
                                  Paid: ${loan.totalPaid.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Last: {loan.lastPaymentDate ? loan.lastPaymentDate.toLocaleDateString() : 'Never'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {loan.paymentHistory.length} payments
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(loan.riskLevel)}`}>
                                  {loan.riskLevel.toUpperCase()}
                                </span>
                                <div className="text-sm text-gray-500 mt-1">
                                  Score: {loan.riskScore}
                                </div>
                                {loan.daysOverdue > 0 && (
                                  <div className="text-xs text-red-600">
                                    {loan.daysOverdue} days overdue
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleRestructuring(loan)}
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                                >
                                  Restructure
                                </button>
                                <button
                                  onClick={() => handleEarlyRepayment(loan)}
                                  className="text-green-600 hover:text-green-900 px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                                >
                                  Early Pay
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Alerts</h3>
                <div className="space-y-4">
                  {monitoringData.flatMap(loan => 
                    loan.alerts.map(alert => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{alert.alertType.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Loan: {loan.loanId} - {loan.borrowerName}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Reminders</h3>
                <div className="space-y-4">
                  {monitoringData.flatMap(loan => 
                    loan.reminders.map(reminder => (
                      <div key={reminder.id} className="p-4 bg-white border rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {reminder.reminderType.replace('_', ' ').toUpperCase()} - {loan.borrowerName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{reminder.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Loan: {reminder.loanId}</span>
                              <span>Channel: {reminder.channel.toUpperCase()}</span>
                              <span>Amount: ${reminder.amountDue.toLocaleString()}</span>
                              <span>Due: {reminder.dueDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              reminder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reminder.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              reminder.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {reminder.status.toUpperCase()}
                            </span>
                            {reminder.isUrgent && (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                                URGENT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Risk Assessment & Analytics</h3>
                
                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Portfolio Health Score</p>
                        <p className="text-3xl font-bold">
                          {Math.round(monitoringData.reduce((sum, loan) => sum + loan.riskScore, 0) / monitoringData.length || 0)}
                        </p>
                        <p className="text-blue-100 text-xs mt-1">
                          {monitoringData.filter(l => l.riskScore >= 70).length > monitoringData.length / 2 ? '↗️ Improving' : '↘️ Declining'}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">📊</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Collection Efficiency</p>
                        <p className="text-3xl font-bold">
                          {Math.round((monitoringData.filter(l => l.status === 'current').length / monitoringData.length) * 100 || 0)}%
                        </p>
                        <p className="text-green-100 text-xs mt-1">On-time payments</p>
                      </div>
                      <div className="text-4xl opacity-80">💰</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Default Probability</p>
                        <p className="text-3xl font-bold">
                          {(monitoringData.reduce((sum, loan) => sum + (loan.riskLevel === 'critical' ? 0.25 : loan.riskLevel === 'high' ? 0.15 : loan.riskLevel === 'medium' ? 0.08 : 0.03), 0) / monitoringData.length * 100).toFixed(1)}%
                        </p>
                        <p className="text-orange-100 text-xs mt-1">Next 12 months</p>
                      </div>
                      <div className="text-4xl opacity-80">⚠️</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Recovery Rate</p>
                        <p className="text-3xl font-bold">
                          {Math.round(85 + Math.random() * 10)}%
                        </p>
                        <p className="text-purple-100 text-xs mt-1">Historical average</p>
                      </div>
                      <div className="text-4xl opacity-80">🔄</div>
                    </div>
                  </div>
                </div>

                {/* Advanced Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Risk Trend Analysis */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      📈 Risk Trend Analysis
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Live</span>
                    </h4>
                    <div className="space-y-4">
                      {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map((period, index) => {
                        const riskChange = ['+2.3%', '-1.8%', '+0.5%'][index];
                        const isPositive = riskChange.startsWith('+');
                        return (
                          <div key={period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{period}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${isPositive ? 'bg-red-400' : 'bg-green-400'}`}
                                  style={{ width: `${Math.abs(parseFloat(riskChange)) * 10}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-semibold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                                {riskChange}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Predictive Risk Modeling */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      🔮 Predictive Risk Modeling
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">AI-Powered</span>
                    </h4>
                    <div className="space-y-4">
                      {[
                        { metric: 'Expected Defaults (30d)', value: '2-3 loans', confidence: '87%', color: 'red' },
                        { metric: 'Recovery Potential', value: '$125K', confidence: '92%', color: 'green' },
                        { metric: 'Risk Migration', value: '5 loans ↑', confidence: '78%', color: 'orange' }
                      ].map((prediction) => (
                        <div key={prediction.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{prediction.metric}</p>
                            <p className="text-xs text-gray-500">Confidence: {prediction.confidence}</p>
                          </div>
                          <span className={`text-sm font-bold text-${prediction.color}-600`}>
                            {prediction.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Risk Distribution & Payment Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      🎯 Risk Distribution & Concentration
                    </h4>
                    <div className="space-y-3">
                      {['low', 'medium', 'high', 'critical'].map(level => {
                        const count = monitoringData.filter(loan => loan.riskLevel === level).length;
                        const percentage = monitoringData.length > 0 ? (count / monitoringData.length * 100).toFixed(1) : '0';
                        const totalExposure = monitoringData
                          .filter(loan => loan.riskLevel === level)
                          .reduce((sum, loan) => sum + loan.outstandingBalance, 0);
                        
                        return (
                          <div key={level} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 capitalize">{level} Risk</span>
                              <span className="text-sm font-bold text-gray-900">{count} loans ({percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    level === 'low' ? 'bg-green-400' :
                                    level === 'medium' ? 'bg-yellow-400' :
                                    level === 'high' ? 'bg-orange-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">
                                Exposure: ${totalExposure.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      📊 Payment Performance Analytics
                    </h4>
                    <div className="space-y-3">
                      {['current', 'overdue', 'default', 'restructured'].map(status => {
                        const count = monitoringData.filter(loan => loan.status === status).length;
                        const percentage = monitoringData.length > 0 ? (count / monitoringData.length * 100).toFixed(1) : '0';
                        const avgDaysOverdue = status === 'overdue' ? 
                          Math.round(monitoringData.filter(l => l.status === status).reduce((sum, l) => sum + l.daysOverdue, 0) / count || 0) : 0;
                        
                        return (
                          <div key={status} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                              <span className="text-sm font-bold text-gray-900">{count} loans ({percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    status === 'current' ? 'bg-green-400' :
                                    status === 'overdue' ? 'bg-yellow-400' :
                                    status === 'default' ? 'bg-red-400' : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              {status === 'overdue' && avgDaysOverdue > 0 && (
                                <span className="text-xs text-gray-600">
                                  Avg: {avgDaysOverdue} days
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Advanced Risk Metrics */}
                <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    🔍 Advanced Risk Metrics & Early Warning Indicators
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-800">Credit Risk Indicators</h5>
                      {[
                        { label: 'Debt-to-Income Ratio', value: '34.2%', status: 'good' },
                        { label: 'Payment Velocity', value: '0.95x', status: 'warning' },
                        { label: 'Credit Utilization', value: '67%', status: 'critical' }
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">{metric.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{metric.value}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              metric.status === 'good' ? 'bg-green-400' :
                              metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-800">Behavioral Patterns</h5>
                      {[
                        { label: 'Late Payment Frequency', value: '12%', status: 'warning' },
                        { label: 'Contact Responsiveness', value: '78%', status: 'good' },
                        { label: 'Payment Channel Changes', value: '3x', status: 'critical' }
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">{metric.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{metric.value}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              metric.status === 'good' ? 'bg-green-400' :
                              metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-800">Market Indicators</h5>
                      {[
                        { label: 'Economic Stress Index', value: '2.1', status: 'good' },
                        { label: 'Industry Default Rate', value: '4.8%', status: 'warning' },
                        { label: 'Regional Risk Factor', value: '1.3x', status: 'good' }
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">{metric.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{metric.value}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              metric.status === 'good' ? 'bg-green-400' :
                              metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Monitoring Alerts */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    🚨 Real-time Monitoring & Automated Alerts
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                      {monitoringData.filter(l => l.riskLevel === 'critical').length} Critical
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        type: 'Payment Anomaly',
                        message: 'Unusual payment pattern detected for LOAN001',
                        severity: 'high',
                        time: '2 minutes ago',
                        action: 'Review Required'
                      },
                      {
                        type: 'Risk Score Change',
                        message: 'LOAN003 risk score increased by 15 points',
                        severity: 'critical',
                        time: '5 minutes ago',
                        action: 'Immediate Review'
                      },
                      {
                        type: 'Collection Opportunity',
                        message: 'LOAN002 borrower logged in - contact window open',
                        severity: 'medium',
                        time: '8 minutes ago',
                        action: 'Contact Now'
                      },
                      {
                        type: 'Regulatory Alert',
                        message: 'Portfolio concentration limit approaching',
                        severity: 'high',
                        time: '12 minutes ago',
                        action: 'Review Portfolio'
                      }
                    ].map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        'border-yellow-500 bg-yellow-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{alert.type}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                          </div>
                          <button className={`px-3 py-1 text-xs font-medium rounded ${
                            alert.severity === 'critical' ? 'bg-red-600 text-white' :
                            alert.severity === 'high' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {alert.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Alerts</h3>
                <p className="text-gray-600">Risk alerts functionality will be implemented here.</p>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Reminders</h3>
                <p className="text-gray-600">Payment reminders functionality will be implemented here.</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                <p className="text-gray-600">Analytics functionality will be implemented here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isRestructuringModalOpen && selectedLoanForAction && (
          <RestructuringModal
            isOpen={isRestructuringModalOpen}
            onClose={() => setIsRestructuringModalOpen(false)}
            loanId={selectedLoanForAction.loanId}
            borrowerName={selectedLoanForAction.borrowerName}
            currentAmount={selectedLoanForAction.outstandingBalance}
            currentEMI={selectedLoanForAction.monthlyPayment}
            remainingTerm={selectedLoanForAction.remainingTerm}
            onSubmit={handleRestructuringSubmit}
          />
        )}

        {isEarlyRepaymentModalOpen && selectedLoanForAction && (
          <EarlyRepaymentModal
            isOpen={isEarlyRepaymentModalOpen}
            onClose={() => setIsEarlyRepaymentModalOpen(false)}
            loanId={selectedLoanForAction.loanId}
            borrowerName={selectedLoanForAction.borrowerName}
            outstandingAmount={selectedLoanForAction.outstandingBalance}
            remainingTerm={selectedLoanForAction.remainingTerm}
            monthlyEMI={selectedLoanForAction.monthlyPayment}
            interestRate={selectedLoanForAction.interestRate}
            onConfirm={handleEarlyRepaymentConfirm}
          />
        )}

        {isForeclosureModalOpen && selectedLoanForAction && (
          <ForeclosureModal
            isOpen={isForeclosureModalOpen}
            onClose={() => setIsForeclosureModalOpen(false)}
            loan={selectedLoanForAction}
            onSubmit={handleForeclosureSubmit}
          />
        )}

        {isLoanExtensionModalOpen && selectedLoanForAction && (
          <LoanExtensionModal
            isOpen={isLoanExtensionModalOpen}
            onClose={() => setIsLoanExtensionModalOpen(false)}
            loan={selectedLoanForAction}
            onSubmit={handleLoanExtensionSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default LoanMonitoringDashboard;