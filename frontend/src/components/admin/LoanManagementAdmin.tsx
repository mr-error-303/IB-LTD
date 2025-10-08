import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  User, 
  Clock, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';

interface LoanApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  email: string;
  phone: string;
  loanType: 'personal' | 'business' | 'home' | 'car' | 'education';
  requestedAmount: number;
  tenure: number; // in months
  purpose: string;
  monthlyIncome: number;
  creditScore: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComments?: string;
  documents: string[];
  employmentType: string;
  address: string;
  riskAssessment: number;
}

interface ActiveLoan {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  loanType: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenure: number;
  monthlyEMI: number;
  nextEMIDate: Date;
  paidEMIs: number;
  totalEMIs: number;
  status: 'active' | 'overdue' | 'defaulted' | 'closed';
  lastPaymentDate?: Date;
  overdueAmount: number;
  penaltyAmount: number;
  disbursedAt: Date;
}

interface EMIPayment {
  id: string;
  loanId: string;
  borrowerName: string;
  emiAmount: number;
  paidAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
  penaltyAmount: number;
}

const LoanManagementAdmin: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [emiPayments, setEmiPayments] = useState<EMIPayment[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'active_loans' | 'emi_tracking' | 'analytics'>('applications');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminComments, setAdminComments] = useState('');

  // Mock data for loan applications
  useEffect(() => {
    const mockApplications: LoanApplication[] = [
      {
        id: 'loan_app_001',
        applicantId: 'user_001',
        applicantName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+880123456789',
        loanType: 'personal',
        requestedAmount: 500000,
        tenure: 36,
        purpose: 'Home renovation',
        monthlyIncome: 80000,
        creditScore: 750,
        status: 'pending',
        priority: 'high',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        documents: ['salary_certificate.pdf', 'bank_statement.pdf', 'nid_copy.pdf'],
        employmentType: 'Permanent',
        address: 'Dhaka, Bangladesh',
        riskAssessment: 3
      },
      {
        id: 'loan_app_002',
        applicantId: 'user_002',
        applicantName: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+880987654321',
        loanType: 'business',
        requestedAmount: 2000000,
        tenure: 60,
        purpose: 'Business expansion',
        monthlyIncome: 150000,
        creditScore: 680,
        status: 'under_review',
        priority: 'urgent',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        documents: ['business_license.pdf', 'financial_statements.pdf', 'tax_returns.pdf'],
        employmentType: 'Self-employed',
        address: 'Chittagong, Bangladesh',
        riskAssessment: 5
      },
      {
        id: 'loan_app_003',
        applicantId: 'user_003',
        applicantName: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        phone: '+880555666777',
        loanType: 'car',
        requestedAmount: 800000,
        tenure: 48,
        purpose: 'Vehicle purchase',
        monthlyIncome: 60000,
        creditScore: 720,
        status: 'approved',
        priority: 'medium',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewedBy: 'Admin User',
        reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        adminComments: 'Good credit history, approved for requested amount',
        documents: ['salary_slip.pdf', 'vehicle_quotation.pdf'],
        employmentType: 'Permanent',
        address: 'Sylhet, Bangladesh',
        riskAssessment: 2
      }
    ];

    const mockActiveLoans: ActiveLoan[] = [
      {
        id: 'active_loan_001',
        loanId: 'LOAN001',
        borrowerId: 'user_004',
        borrowerName: 'Alice Brown',
        loanType: 'personal',
        principalAmount: 300000,
        outstandingAmount: 180000,
        interestRate: 12.5,
        tenure: 36,
        monthlyEMI: 10500,
        nextEMIDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        paidEMIs: 12,
        totalEMIs: 36,
        status: 'active',
        lastPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        overdueAmount: 0,
        penaltyAmount: 0,
        disbursedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'active_loan_002',
        loanId: 'LOAN002',
        borrowerId: 'user_005',
        borrowerName: 'Charlie Wilson',
        loanType: 'business',
        principalAmount: 1500000,
        outstandingAmount: 1200000,
        interestRate: 14.0,
        tenure: 60,
        monthlyEMI: 35000,
        nextEMIDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidEMIs: 8,
        totalEMIs: 60,
        status: 'overdue',
        lastPaymentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        overdueAmount: 70000,
        penaltyAmount: 5000,
        disbursedAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockEMIPayments: EMIPayment[] = [
      {
        id: 'emi_001',
        loanId: 'LOAN001',
        borrowerName: 'Alice Brown',
        emiAmount: 10500,
        paidAmount: 10500,
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        status: 'paid',
        paymentMethod: 'Bank Transfer',
        transactionId: 'TXN123456',
        penaltyAmount: 0
      },
      {
        id: 'emi_002',
        loanId: 'LOAN002',
        borrowerName: 'Charlie Wilson',
        emiAmount: 35000,
        paidAmount: 0,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        penaltyAmount: 5000
      },
      {
        id: 'emi_003',
        loanId: 'LOAN001',
        borrowerName: 'Alice Brown',
        emiAmount: 10500,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        penaltyAmount: 0
      }
    ];

    setApplications(mockApplications);
    setActiveLoans(mockActiveLoans);
    setEmiPayments(mockEMIPayments);
  }, []);

  const handleReview = (application: LoanApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (selectedApplication) {
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              status: reviewAction === 'approve' ? 'approved' : 'rejected',
              adminComments,
              reviewedBy: 'Current Admin',
              reviewedAt: new Date()
            }
          : app
      );
      setApplications(updatedApplications);
      setShowReviewModal(false);
      setAdminComments('');
      setSelectedApplication(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'defaulted': return 'bg-red-200 text-red-900';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'bg-green-100 text-green-800';
    if (risk <= 6) return 'bg-yellow-100 text-yellow-800';
    if (risk <= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesType = filterType === 'all' || app.loanType === filterType;
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Management</h1>
          <p className="text-gray-600">Manage loan applications, active loans, and EMI tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue EMIs</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">৳125.4M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Loan Applications
              </button>
              <button
                onClick={() => setActiveTab('active_loans')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active_loans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Loans
              </button>
              <button
                onClick={() => setActiveTab('emi_tracking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'emi_tracking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                EMI Tracking
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Loan Applications Tab */}
          {activeTab === 'applications' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="home">Home</option>
                  <option value="car">Car</option>
                  <option value="education">Education</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Applications Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Financial Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className={application.priority === 'urgent' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {application.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {application.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {application.loanType} Loan
                          </div>
                          <div className="text-sm text-gray-500">
                            ৳{application.requestedAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.tenure} months
                          </div>
                          <div className="text-xs text-gray-400">{application.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Income: ৳{application.monthlyIncome.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Credit Score: {application.creditScore}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {application.employmentType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                              {application.priority.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(application.riskAssessment)}`}>
                              Risk: {application.riskAssessment}/10
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {application.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleReview(application, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleReview(application, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="text-gray-600 hover:text-gray-900">
                              <MessageSquare className="w-4 h-4" />
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

          {/* Active Loans Tab */}
          {activeTab === 'active_loans' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan & Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Overdue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeLoans.map((loan) => (
                      <tr key={loan.id} className={loan.status === 'overdue' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{loan.loanId}</div>
                              <div className="text-sm text-gray-500">{loan.borrowerName}</div>
                              <div className="text-xs text-gray-400 capitalize">{loan.loanType} Loan</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Principal: ৳{loan.principalAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Outstanding: ৳{loan.outstandingAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rate: {loan.interestRate}% | EMI: ৳{loan.monthlyEMI.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {loan.paidEMIs}/{loan.totalEMIs} EMIs paid
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(loan.paidEMIs / loan.totalEMIs) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Next EMI: {loan.nextEMIDate.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                              {loan.status.toUpperCase()}
                            </span>
                          </div>
                          {loan.overdueAmount > 0 && (
                            <div className="text-sm text-red-600">
                              Overdue: ৳{loan.overdueAmount.toLocaleString()}
                            </div>
                          )}
                          {loan.penaltyAmount > 0 && (
                            <div className="text-sm text-red-600">
                              Penalty: ৳{loan.penaltyAmount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="text-orange-600 hover:text-orange-900">
                              <MessageSquare className="w-4 h-4" />
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

          {/* EMI Tracking Tab */}
          {activeTab === 'emi_tracking' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan & Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emiPayments.map((emi) => (
                      <tr key={emi.id} className={emi.status === 'overdue' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{emi.loanId}</div>
                              <div className="text-sm text-gray-500">{emi.borrowerName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ৳{emi.emiAmount.toLocaleString()}
                          </div>
                          {emi.paidAmount > 0 && (
                            <div className="text-sm text-green-600">
                              Paid: ৳{emi.paidAmount.toLocaleString()}
                            </div>
                          )}
                          {emi.penaltyAmount > 0 && (
                            <div className="text-sm text-red-600">
                              Penalty: ৳{emi.penaltyAmount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {emi.dueDate.toLocaleDateString()}
                          </div>
                          {emi.paidDate && (
                            <div className="text-sm text-green-600">
                              Paid: {emi.paidDate.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emi.status)}`}>
                            {emi.status.toUpperCase()}
                          </span>
                          {emi.paymentMethod && (
                            <div className="text-xs text-gray-500 mt-1">
                              via {emi.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {emi.status === 'overdue' && (
                              <button className="text-red-600 hover:text-red-900">
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Portfolio</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Active Loans:</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Portfolio Value:</span>
                      <span className="font-medium">৳125.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Loan Size:</span>
                      <span className="font-medium">৳101,620</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approval Rate:</span>
                      <span className="font-medium text-green-600">78.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Default Rate:</span>
                      <span className="font-medium text-red-600">2.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collection Efficiency:</span>
                      <span className="font-medium text-green-600">94.7%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk Loans:</span>
                      <span className="font-medium text-red-600">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overdue Amount:</span>
                      <span className="font-medium text-orange-600">৳4.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recovery Rate:</span>
                      <span className="font-medium text-green-600">89.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedApplication && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'} Loan Application
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Applicant: {selectedApplication.applicantName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Loan Type: {selectedApplication.loanType}
                  </p>
                  <p className="text-lg font-medium">
                    Amount: ৳{selectedApplication.requestedAmount.toLocaleString()}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Comments
                  </label>
                  <textarea
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter comments..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    className={`px-4 py-2 rounded-md text-white ${
                      reviewAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanManagementAdmin;