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
  applicantName: string;
  email: string;
  phone: string;
  loanType: 'personal' | 'home' | 'car' | 'business' | 'education';
  amount: number;
  purpose: string;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  creditScore: number;
  monthlyIncome: number;
  employmentType: string;
  riskLevel: 'low' | 'medium' | 'high';
  documents: string[];
}

interface ActiveLoan {
  id: string;
  borrowerName: string;
  loanType: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenure: number;
  monthlyEMI: number;
  nextDueDate: Date;
  status: 'current' | 'overdue' | 'defaulted';
  paymentsCompleted: number;
  totalPayments: number;
}

interface EMIPayment {
  id: string;
  loanId: string;
  borrowerName: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  paymentMethod?: string;
  lateFee?: number;
}

const LoanManagementAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [emiPayments, setEMIPayments] = useState<EMIPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLoanType, setFilterLoanType] = useState('all');

  // Mock data initialization
  useEffect(() => {
    const mockApplications: LoanApplication[] = [
      {
        id: 'APP001',
        applicantName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        loanType: 'personal',
        amount: 50000,
        purpose: 'Home renovation',
        applicationDate: new Date('2024-01-10'),
        status: 'pending',
        creditScore: 750,
        monthlyIncome: 8000,
        employmentType: 'Full-time',
        riskLevel: 'low',
        documents: ['ID', 'Income Proof', 'Bank Statement']
      },
      {
        id: 'APP002',
        applicantName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0124',
        loanType: 'home',
        amount: 300000,
        purpose: 'Property purchase',
        applicationDate: new Date('2024-01-12'),
        status: 'under_review',
        creditScore: 720,
        monthlyIncome: 12000,
        employmentType: 'Full-time',
        riskLevel: 'medium',
        documents: ['ID', 'Income Proof', 'Property Documents']
      },
      {
        id: 'APP003',
        applicantName: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1-555-0125',
        loanType: 'car',
        amount: 25000,
        purpose: 'Vehicle purchase',
        applicationDate: new Date('2024-01-14'),
        status: 'approved',
        creditScore: 680,
        monthlyIncome: 6000,
        employmentType: 'Full-time',
        riskLevel: 'medium',
        documents: ['ID', 'Income Proof', 'Vehicle Quote']
      }
    ];

    const mockActiveLoans: ActiveLoan[] = [
      {
        id: 'LOAN001',
        borrowerName: 'Alice Brown',
        loanType: 'Personal',
        principalAmount: 40000,
        outstandingAmount: 32000,
        interestRate: 12.5,
        tenure: 36,
        monthlyEMI: 1350,
        nextDueDate: new Date('2024-02-01'),
        status: 'current',
        paymentsCompleted: 8,
        totalPayments: 36
      },
      {
        id: 'LOAN002',
        borrowerName: 'Robert Wilson',
        loanType: 'Home',
        principalAmount: 250000,
        outstandingAmount: 220000,
        interestRate: 8.5,
        tenure: 240,
        monthlyEMI: 2100,
        nextDueDate: new Date('2024-01-28'),
        status: 'overdue',
        paymentsCompleted: 24,
        totalPayments: 240
      },
      {
        id: 'LOAN003',
        borrowerName: 'Emma Taylor',
        loanType: 'Car',
        principalAmount: 20000,
        outstandingAmount: 15000,
        interestRate: 10.0,
        tenure: 60,
        monthlyEMI: 425,
        nextDueDate: new Date('2024-02-05'),
        status: 'current',
        paymentsCompleted: 12,
        totalPayments: 60
      }
    ];

    const mockEMIPayments: EMIPayment[] = [
      {
        id: 'EMI001',
        loanId: 'LOAN001',
        borrowerName: 'Alice Brown',
        amount: 1350,
        dueDate: new Date('2024-01-01'),
        paidDate: new Date('2024-01-01'),
        status: 'paid',
        paymentMethod: 'Auto Debit'
      },
      {
        id: 'EMI002',
        loanId: 'LOAN002',
        borrowerName: 'Robert Wilson',
        amount: 2100,
        dueDate: new Date('2024-01-28'),
        status: 'overdue',
        lateFee: 50
      },
      {
        id: 'EMI003',
        loanId: 'LOAN003',
        borrowerName: 'Emma Taylor',
        amount: 425,
        dueDate: new Date('2024-02-05'),
        status: 'pending'
      }
    ];

    setApplications(mockApplications);
    setActiveLoans(mockActiveLoans);
    setEMIPayments(mockEMIPayments);
  }, []);

  const handleApplicationAction = (applicationId: string, action: 'approve' | 'reject') => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
          : app
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
      case 'current':
        return 'text-green-600 bg-green-100';
      case 'rejected':
      case 'failed':
      case 'defaulted':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'under_review':
      case 'overdue':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesType = filterLoanType === 'all' || app.loanType === filterLoanType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredActiveLoans = activeLoans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredEMIPayments = emiPayments.filter(payment => {
    const matchesSearch = payment.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Management</h1>
          <p className="text-gray-600">Manage loan applications, active loans, and EMI tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+5</span>
              <span className="text-gray-500 ml-1">this week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{activeLoans.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue EMIs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emiPayments.filter(payment => payment.status === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">-1</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">$1.2M</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
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
                <FileText className="w-4 h-4 inline mr-2" />
                Loan Applications
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Active Loans
              </button>
              <button
                onClick={() => setActiveTab('emi')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'emi'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
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
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
                <option value="current">Current</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
              <select
                value={filterLoanType}
                onChange={(e) => setFilterLoanType(e.target.value)}
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
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'applications' && (
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
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
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
                          <div className="text-sm text-gray-900 font-medium">
                            {application.loanType.charAt(0).toUpperCase() + application.loanType.slice(1)} Loan
                          </div>
                          <div className="text-sm text-gray-500">${application.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{application.purpose}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {application.applicationDate.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Credit Score: {application.creditScore}</div>
                          <div className="text-sm text-gray-500">Income: ${application.monthlyIncome.toLocaleString()}/mo</div>
                          <div className="text-sm text-gray-500">{application.employmentType}</div>
                          <div className="text-sm text-gray-500">{application.documents.length} documents</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ')}
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(application.riskLevel)}`}>
                              {application.riskLevel} risk
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
                                  onClick={() => handleApplicationAction(application.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApplicationAction(application.id, 'reject')}
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
            )}

            {activeTab === 'active' && (
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
                        Payment Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActiveLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                              <div className="text-sm text-gray-500">ID: {loan.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{loan.loanType}</div>
                          <div className="text-sm text-gray-500">Principal: ${loan.principalAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Outstanding: ${loan.outstandingAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Rate: {loan.interestRate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">EMI: ${loan.monthlyEMI.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Tenure: {loan.tenure} months</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Next: {loan.nextDueDate.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {loan.paymentsCompleted}/{loan.totalPayments} payments
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(loan.paymentsCompleted / loan.totalPayments) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((loan.paymentsCompleted / loan.totalPayments) * 100)}% complete
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'emi' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
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
                    {filteredEMIPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{payment.borrowerName}</div>
                              <div className="text-sm text-gray-500">Loan: {payment.loanId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">${payment.amount.toLocaleString()}</div>
                          {payment.paymentMethod && (
                            <div className="text-sm text-gray-500">{payment.paymentMethod}</div>
                          )}
                          {payment.lateFee && (
                            <div className="text-sm text-red-600">Late Fee: ${payment.lateFee}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {payment.dueDate.toLocaleDateString()}
                          </div>
                          {payment.paidDate && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid: {payment.paidDate.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {payment.status === 'overdue' && (
                              <button className="text-orange-600 hover:text-orange-900">
                                <AlertTriangle className="w-4 h-4" />
                              </button>
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
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Portfolio Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Personal Loans</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Home Loans</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Car Loans</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Business Loans</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approval Rate</span>
                      <span className="text-sm font-medium text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Default Rate</span>
                      <span className="text-sm font-medium text-red-600">2.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Processing Time</span>
                      <span className="text-sm font-medium">3.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collection Efficiency</span>
                      <span className="text-sm font-medium text-green-600">96.8%</span>
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

export default LoanManagementAdmin;