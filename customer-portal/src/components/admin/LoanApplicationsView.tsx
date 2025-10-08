import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';

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
}

interface LoanApplicationsViewProps {
  onViewApplication: (application: LoanApplication) => void;
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string) => void;
}

const LoanApplicationsView: React.FC<LoanApplicationsViewProps> = ({
  onViewApplication,
  onApproveApplication,
  onRejectApplication
}) => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [amountRangeFilter, setAmountRangeFilter] = useState('all');
  const [creditScoreFilter, setCreditScoreFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data for loan applications
  useEffect(() => {
    const mockApplications: LoanApplication[] = [
      {
        id: 'LA001',
        applicantName: 'John Smith',
        applicantEmail: 'john.smith@email.com',
        applicantPhone: '+880-1234-567890',
        amount: 500000,
        purpose: 'Home Purchase',
        repaymentPeriod: 240,
        status: 'pending',
        applicationDate: '2024-01-15',
        creditScore: 750,
        monthlyIncome: 80000,
        employmentType: 'Salaried',
        employmentDuration: 36,
        existingLoans: 1,
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: true,
          bankStatement: true
        },
        riskLevel: 'low',
        lastUpdated: '2024-01-15',
        assignedTo: 'Admin User'
      },
      {
        id: 'LA002',
        applicantName: 'Sarah Johnson',
        applicantEmail: 'sarah.johnson@email.com',
        applicantPhone: '+880-1234-567891',
        amount: 200000,
        purpose: 'Business Expansion',
        repaymentPeriod: 60,
        status: 'pending',
        applicationDate: '2024-01-16',
        creditScore: 680,
        monthlyIncome: 60000,
        employmentType: 'Self-Employed',
        employmentDuration: 24,
        existingLoans: 0,
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: false,
          bankStatement: true
        },
        riskLevel: 'medium',
        lastUpdated: '2024-01-16'
      },
      {
        id: 'LA003',
        applicantName: 'Michael Brown',
        applicantEmail: 'michael.brown@email.com',
        applicantPhone: '+880-1234-567892',
        amount: 100000,
        purpose: 'Education',
        repaymentPeriod: 84,
        status: 'pending',
        applicationDate: '2024-01-17',
        creditScore: 720,
        monthlyIncome: 45000,
        employmentType: 'Salaried',
        employmentDuration: 18,
        existingLoans: 0,
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: true,
          bankStatement: true
        },
        riskLevel: 'low',
        lastUpdated: '2024-01-17'
      },
      {
        id: 'LA004',
        applicantName: 'Emily Davis',
        applicantEmail: 'emily.davis@email.com',
        applicantPhone: '+880-1234-567893',
        amount: 300000,
        purpose: 'Debt Consolidation',
        repaymentPeriod: 120,
        status: 'pending',
        applicationDate: '2024-01-18',
        creditScore: 580,
        monthlyIncome: 35000,
        employmentType: 'Contract',
        employmentDuration: 12,
        existingLoans: 3,
        documents: {
          idProof: true,
          incomeProof: false,
          addressProof: true,
          bankStatement: false
        },
        riskLevel: 'high',
        lastUpdated: '2024-01-18'
      },
      {
        id: 'LA005',
        applicantName: 'David Wilson',
        applicantEmail: 'david.wilson@email.com',
        applicantPhone: '+880-1234-567894',
        amount: 150000,
        purpose: 'Vehicle Purchase',
        repaymentPeriod: 48,
        status: 'approved',
        applicationDate: '2024-01-19',
        creditScore: 650,
        monthlyIncome: 55000,
        employmentType: 'Salaried',
        employmentDuration: 30,
        existingLoans: 1,
        documents: {
          idProof: true,
          incomeProof: true,
          addressProof: true,
          bankStatement: true
        },
        riskLevel: 'medium',
        lastUpdated: '2024-01-19'
      },
      {
        id: 'LA006',
        applicantName: 'Lisa Anderson',
        applicantEmail: 'lisa.anderson@email.com',
        applicantPhone: '+880-1234-567895',
        amount: 750000,
        purpose: 'Property Investment',
        repaymentPeriod: 180,
        status: 'rejected',
        applicationDate: '2024-01-20',
        creditScore: 520,
        monthlyIncome: 90000,
        employmentType: 'Self-Employed',
        employmentDuration: 60,
        existingLoans: 2,
        documents: {
          idProof: true,
          incomeProof: false,
          addressProof: true,
          bankStatement: false
        },
        riskLevel: 'high',
        lastUpdated: '2024-01-20'
      }
    ];

    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
  }, []);

  // Enhanced filter and search applications
  useEffect(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = 
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || app.riskLevel === riskFilter;
      const matchesEmployment = employmentFilter === 'all' || app.employmentType === employmentFilter;
      
      // Amount range filter
      let matchesAmount = true;
      if (amountRangeFilter !== 'all') {
        switch (amountRangeFilter) {
          case 'under-100k':
            matchesAmount = app.amount < 100000;
            break;
          case '100k-300k':
            matchesAmount = app.amount >= 100000 && app.amount <= 300000;
            break;
          case '300k-500k':
            matchesAmount = app.amount > 300000 && app.amount <= 500000;
            break;
          case 'over-500k':
            matchesAmount = app.amount > 500000;
            break;
        }
      }
      
      // Credit score filter
      let matchesCreditScore = true;
      if (creditScoreFilter !== 'all') {
        switch (creditScoreFilter) {
          case 'excellent':
            matchesCreditScore = app.creditScore >= 750;
            break;
          case 'good':
            matchesCreditScore = app.creditScore >= 650 && app.creditScore < 750;
            break;
          case 'fair':
            matchesCreditScore = app.creditScore >= 550 && app.creditScore < 650;
            break;
          case 'poor':
            matchesCreditScore = app.creditScore < 550;
            break;
        }
      }
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== 'all') {
        const appDate = new Date(app.applicationDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateRangeFilter) {
          case 'today':
            matchesDateRange = daysDiff === 0;
            break;
          case 'week':
            matchesDateRange = daysDiff <= 7;
            break;
          case 'month':
            matchesDateRange = daysDiff <= 30;
            break;
          case 'quarter':
            matchesDateRange = daysDiff <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesRisk && matchesEmployment && 
             matchesAmount && matchesCreditScore && matchesDateRange;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof LoanApplication];
      let bValue: any = b[sortBy as keyof LoanApplication];
      
      if (sortBy === 'applicationDate' || sortBy === 'lastUpdated') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applications, searchTerm, statusFilter, riskFilter, employmentFilter, 
      amountRangeFilter, creditScoreFilter, dateRangeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

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
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDocumentCompleteness = (documents: LoanApplication['documents']) => {
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const calculateDaysAgo = (date: string) => {
    const today = new Date();
    const applicationDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - applicationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === paginatedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(paginatedApplications.map(app => app.id));
    }
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    selectedApplications.forEach(id => {
      if (action === 'approve') {
        onApproveApplication(id);
      } else {
        onRejectApplication(id);
      }
    });
    setSelectedApplications([]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRiskFilter('all');
    setEmploymentFilter('all');
    setAmountRangeFilter('all');
    setCreditScoreFilter('all');
    setDateRangeFilter('all');
    setSelectedApplications([]);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
      <ArrowDownIcon className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('loanApplications') || 'Loan Applications'}
            </h2>
            <p className="text-gray-600 mt-1">
              {t('manageAndReviewApplications') || 'Manage and review pending loan applications'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchApplications') || 'Search applications...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-l-lg ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-r-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Advanced Filters
              <ChevronDownIcon className={`w-4 h-4 ml-2 transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Basic Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('allStatuses') || 'All Statuses'}</option>
            <option value="pending">{t('pending') || 'Pending'}</option>
            <option value="approved">{t('approved') || 'Approved'}</option>
            <option value="rejected">{t('rejected') || 'Rejected'}</option>
            <option value="disbursed">{t('disbursed') || 'Disbursed'}</option>
          </select>
          
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('allRiskLevels') || 'All Risk Levels'}</option>
            <option value="low">{t('lowRisk') || 'Low Risk'}</option>
            <option value="medium">{t('mediumRisk') || 'Medium Risk'}</option>
            <option value="high">{t('highRisk') || 'High Risk'}</option>
          </select>

          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || riskFilter !== 'all' || employmentFilter !== 'all' || 
            amountRangeFilter !== 'all' || creditScoreFilter !== 'all' || dateRangeFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Employment Types</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Contract">Contract</option>
              </select>

              <select
                value={amountRangeFilter}
                onChange={(e) => setAmountRangeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Amounts</option>
                <option value="under-100k">Under ৳1,00,000</option>
                <option value="100k-300k">৳1,00,000 - ৳3,00,000</option>
                <option value="300k-500k">৳3,00,000 - ৳5,00,000</option>
                <option value="over-500k">Over ৳5,00,000</option>
              </select>

              <select
                value={creditScoreFilter}
                onChange={(e) => setCreditScoreFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Credit Scores</option>
                <option value="excellent">Excellent (750+)</option>
                <option value="good">Good (650-749)</option>
                <option value="fair">Fair (550-649)</option>
                <option value="poor">Poor (&lt;550)</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div 
            className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setStatusFilter('all');
              setRiskFilter('all');
              setSearchTerm('');
            }}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-yellow-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setStatusFilter('pending');
              setRiskFilter('all');
              setSearchTerm('');
            }}
          >
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-red-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setStatusFilter('all');
              setRiskFilter('high');
              setSearchTerm('');
            }}
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">High Risk</p>
                <p className="text-2xl font-bold text-red-900">
                  {applications.filter(app => app.riskLevel === 'high').length}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-green-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setStatusFilter('approved');
              setRiskFilter('all');
              setSearchTerm('');
            }}
          >
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setStatusFilter('all');
              setRiskFilter('all');
              setSearchTerm('');
            }}
          >
            <div className="flex items-center">
              <BanknotesIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Amount</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(applications.reduce((sum, app) => sum + app.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedApplications.length} application(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setSelectedApplications([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applications Table/Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('applicantName')}
                  >
                    <div className="flex items-center">
                      {t('applicant') || 'Applicant'}
                      <SortIcon field="applicantName" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      {t('loanDetails') || 'Loan Details'}
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('creditScore')}
                  >
                    <div className="flex items-center">
                      {t('creditInfo') || 'Credit Info'}
                      <SortIcon field="creditScore" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('documents') || 'Documents'}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      {t('status') || 'Status'}
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedApplications.map((application) => {
                  const docStats = getDocumentCompleteness(application.documents);
                  const daysAgo = calculateDaysAgo(application.applicationDate);
                  
                  return (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application.id)}
                          onChange={() => handleSelectApplication(application.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.applicantName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.id}
                            </div>
                            <div className="text-xs text-gray-400">
                              {daysAgo} days ago
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{formatCurrency(application.amount)}</div>
                          <div className="text-gray-500">{application.purpose}</div>
                          <div className="text-xs text-gray-400">
                            {application.repaymentPeriod} months
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">Score: {application.creditScore}</div>
                          <div className="text-gray-500">
                            Income: {formatCurrency(application.monthlyIncome)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {application.employmentType}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {docStats.completed}/{docStats.total}
                          </div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                docStats.percentage === 100 ? 'bg-green-500' : 
                                docStats.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${docStats.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.toUpperCase()}
                          </span>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(application.riskLevel)}`}>
                              {application.riskLevel.toUpperCase()} RISK
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onViewApplication(application)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        
                        {application.status === 'pending' && (
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => onApproveApplication(application.id)}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => onRejectApplication(application.id)}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedApplications.map((application) => {
            const docStats = getDocumentCompleteness(application.documents);
            const daysAgo = calculateDaysAgo(application.applicationDate);
            
            return (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleSelectApplication(application.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(application.riskLevel)}`}>
                      {application.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{application.applicantName}</h3>
                  <p className="text-sm text-gray-500">{application.id} • {daysAgo} days ago</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium">{formatCurrency(application.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Purpose:</span>
                    <span className="text-sm">{application.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Credit Score:</span>
                    <span className="text-sm font-medium">{application.creditScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documents:</span>
                    <div className="flex items-center">
                      <span className="text-sm">{docStats.completed}/{docStats.total}</span>
                      <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            docStats.percentage === 100 ? 'bg-green-500' : 
                            docStats.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${docStats.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewApplication(application)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onApproveApplication(application.id)}
                        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onRejectApplication(application.id)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-1"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">
                of {filteredApplications.length} applications
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
      {filteredApplications.length === 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('noApplicationsFound') || 'No applications found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('tryAdjustingFilters') || 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationsView;