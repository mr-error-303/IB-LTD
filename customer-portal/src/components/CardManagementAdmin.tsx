import React, { useState } from 'react';
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Settings,
  Clock,
  Ban,
  Unlock,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap
} from 'lucide-react';

// Interfaces
interface CardApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  cardType: 'debit' | 'credit' | 'prepaid' | 'business';
  cardTier: 'basic' | 'premium' | 'platinum' | 'black';
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'documents_required';
  requestedLimit: number;
  approvedLimit?: number;
  annualFee: number;
  documents: {
    name: string;
    status: 'uploaded' | 'verified' | 'missing' | 'rejected';
  }[];
  creditScore?: number;
  monthlyIncome?: number;
  employmentStatus: string;
  address: string;
}

interface CardIssue {
  id: string;
  cardId: string;
  cardNumber: string;
  userId: string;
  userName: string;
  issueType: 'lost' | 'stolen' | 'damaged' | 'fraud' | 'pin_blocked' | 'expired';
  reportDate: string;
  status: 'reported' | 'investigating' | 'resolved' | 'card_blocked' | 'replacement_issued';
  description: string;
  location?: string;
  policeReport?: string;
  replacementCardId?: string;
  resolutionDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TransactionDispute {
  id: string;
  transactionId: string;
  cardId: string;
  cardNumber: string;
  userId: string;
  userName: string;
  disputeType: 'unauthorized' | 'duplicate' | 'amount_error' | 'service_not_received' | 'fraud' | 'billing_error';
  transactionAmount: number;
  transactionDate: string;
  disputeDate: string;
  status: 'submitted' | 'investigating' | 'merchant_contacted' | 'resolved' | 'rejected' | 'chargeback_initiated';
  description: string;
  merchantName: string;
  evidence: {
    type: string;
    description: string;
    uploadDate: string;
  }[];
  resolution?: string;
  refundAmount?: number;
  resolutionDate?: string;
}

interface CardLimitRequest {
  id: string;
  cardId: string;
  cardNumber: string;
  userId: string;
  userName: string;
  currentLimit: number;
  requestedLimit: number;
  requestType: 'increase' | 'decrease' | 'temporary_increase';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  reason: string;
  temporaryDuration?: number; // days
  justification: string;
  creditScore?: number;
  incomeVerification?: boolean;
  approvedLimit?: number;
  approvalDate?: string;
}

interface CardStats {
  totalCards: number;
  activeCards: number;
  blockedCards: number;
  pendingApplications: number;
  monthlyIssuance: number;
  disputesThisMonth: number;
  fraudCases: number;
  replacementRequests: number;
}

// Mock Data
const mockCardApplications: CardApplication[] = [
  {
    id: 'APP001',
    userId: 'USR001',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    userPhone: '+1-555-0123',
    cardType: 'credit',
    cardTier: 'premium',
    applicationDate: '2024-01-15T10:30:00Z',
    status: 'pending',
    requestedLimit: 50000,
    annualFee: 150,
    documents: [
      { name: 'Identity Proof', status: 'verified' },
      { name: 'Income Certificate', status: 'uploaded' },
      { name: 'Address Proof', status: 'missing' }
    ],
    creditScore: 750,
    monthlyIncome: 8500,
    employmentStatus: 'Full-time Employee',
    address: '123 Main St, New York, NY 10001'
  },
  {
    id: 'APP002',
    userId: 'USR002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@email.com',
    userPhone: '+1-555-0124',
    cardType: 'debit',
    cardTier: 'basic',
    applicationDate: '2024-01-14T15:45:00Z',
    status: 'approved',
    requestedLimit: 10000,
    approvedLimit: 10000,
    annualFee: 0,
    documents: [
      { name: 'Identity Proof', status: 'verified' },
      { name: 'Address Proof', status: 'verified' }
    ],
    employmentStatus: 'Self-employed',
    address: '456 Oak Ave, Los Angeles, CA 90210'
  }
];

const mockCardIssues: CardIssue[] = [
  {
    id: 'ISS001',
    cardId: 'CARD001',
    cardNumber: '**** **** **** 1234',
    userId: 'USR003',
    userName: 'Michael Brown',
    issueType: 'stolen',
    reportDate: '2024-01-15T08:30:00Z',
    status: 'card_blocked',
    description: 'Card was stolen from wallet during travel',
    location: 'Downtown Mall, Chicago',
    policeReport: 'PR-2024-001234',
    priority: 'high'
  },
  {
    id: 'ISS002',
    cardId: 'CARD002',
    cardNumber: '**** **** **** 5678',
    userId: 'USR004',
    userName: 'Lisa Anderson',
    issueType: 'lost',
    reportDate: '2024-01-14T20:15:00Z',
    status: 'replacement_issued',
    description: 'Lost card during shopping trip',
    location: 'Shopping Center, Miami',
    replacementCardId: 'CARD002-R1',
    resolutionDate: '2024-01-15T10:00:00Z',
    priority: 'medium'
  }
];

const mockTransactionDisputes: TransactionDispute[] = [
  {
    id: 'DIS001',
    transactionId: 'TXN001',
    cardId: 'CARD003',
    cardNumber: '**** **** **** 9012',
    userId: 'USR005',
    userName: 'David Wilson',
    disputeType: 'unauthorized',
    transactionAmount: 299.99,
    transactionDate: '2024-01-10T14:30:00Z',
    disputeDate: '2024-01-12T09:15:00Z',
    status: 'investigating',
    description: 'Transaction not authorized by cardholder',
    merchantName: 'Online Electronics Store',
    evidence: [
      { type: 'Statement', description: 'Bank statement showing transaction', uploadDate: '2024-01-12T09:20:00Z' },
      { type: 'Affidavit', description: 'Signed dispute affidavit', uploadDate: '2024-01-12T09:25:00Z' }
    ]
  },
  {
    id: 'DIS002',
    transactionId: 'TXN002',
    cardId: 'CARD004',
    cardNumber: '**** **** **** 3456',
    userId: 'USR006',
    userName: 'Emma Davis',
    disputeType: 'service_not_received',
    transactionAmount: 150.00,
    transactionDate: '2024-01-08T16:45:00Z',
    disputeDate: '2024-01-13T11:30:00Z',
    status: 'resolved',
    description: 'Paid for service but never received it',
    merchantName: 'Home Cleaning Service',
    evidence: [
      { type: 'Email', description: 'Email correspondence with merchant', uploadDate: '2024-01-13T11:35:00Z' }
    ],
    resolution: 'Full refund processed',
    refundAmount: 150.00,
    resolutionDate: '2024-01-14T15:00:00Z'
  }
];

const mockCardLimitRequests: CardLimitRequest[] = [
  {
    id: 'LIM001',
    cardId: 'CARD005',
    cardNumber: '**** **** **** 7890',
    userId: 'USR007',
    userName: 'Robert Chen',
    currentLimit: 25000,
    requestedLimit: 50000,
    requestType: 'increase',
    requestDate: '2024-01-15T12:00:00Z',
    status: 'pending',
    reason: 'Salary increase and business expenses',
    justification: 'Recent promotion with 40% salary increase, need higher limit for business travel expenses',
    creditScore: 780,
    incomeVerification: true
  },
  {
    id: 'LIM002',
    cardId: 'CARD006',
    cardNumber: '**** **** **** 2468',
    userId: 'USR008',
    userName: 'Jennifer Lee',
    currentLimit: 15000,
    requestedLimit: 30000,
    requestType: 'temporary_increase',
    requestDate: '2024-01-14T16:30:00Z',
    status: 'approved',
    reason: 'Wedding expenses',
    justification: 'Need temporary increase for wedding-related expenses over next 3 months',
    temporaryDuration: 90,
    approvedLimit: 25000,
    approvalDate: '2024-01-15T09:00:00Z'
  }
];

const mockCardStats: CardStats = {
  totalCards: 15420,
  activeCards: 14250,
  blockedCards: 180,
  pendingApplications: 45,
  monthlyIssuance: 320,
  disputesThisMonth: 28,
  fraudCases: 12,
  replacementRequests: 35
};

const CardManagementAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<CardApplication | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CardIssue | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<TransactionDispute | null>(null);
  const [selectedLimitRequest, setSelectedLimitRequest] = useState<CardLimitRequest | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApplicationAction = (applicationId: string, action: 'approve' | 'reject', approvedLimit?: number) => {
    console.log(`${action} application:`, applicationId, approvedLimit);
    setShowApplicationModal(false);
    setSelectedApplication(null);
  };

  const handleIssueAction = (issueId: string, action: 'block_card' | 'issue_replacement' | 'resolve') => {
    console.log(`${action} issue:`, issueId);
    setShowIssueModal(false);
    setSelectedIssue(null);
  };

  const handleDisputeAction = (disputeId: string, action: 'approve' | 'reject' | 'investigate') => {
    console.log(`${action} dispute:`, disputeId);
    setShowDisputeModal(false);
    setSelectedDispute(null);
  };

  const handleLimitAction = (limitId: string, action: 'approve' | 'reject', approvedLimit?: number) => {
    console.log(`${action} limit request:`, limitId, approvedLimit);
    setShowLimitModal(false);
    setSelectedLimitRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': case 'verified': case 'replacement_issued': case 'active':
        return 'text-green-600 bg-green-100';
      case 'rejected': case 'blocked': case 'fraud': case 'stolen':
        return 'text-red-600 bg-red-100';
      case 'pending': case 'uploaded': case 'reported': case 'submitted':
        return 'text-yellow-600 bg-yellow-100';
      case 'under_review': case 'investigating': case 'card_blocked':
        return 'text-blue-600 bg-blue-100';
      case 'missing': case 'documents_required':
        return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'debit': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'prepaid': return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'business': return <CreditCard className="h-4 w-4 text-orange-600" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'stolen': case 'fraud': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'lost': return <Search className="h-4 w-4 text-yellow-600" />;
      case 'damaged': return <Settings className="h-4 w-4 text-orange-600" />;
      case 'pin_blocked': return <Ban className="h-4 w-4 text-red-600" />;
      case 'expired': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Card Management Administration</h1>
        <p className="text-gray-600">Manage card applications, issues, disputes, and limit requests</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-blue-600">{mockCardStats.totalCards.toLocaleString()}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+{mockCardStats.monthlyIssuance} this month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cards</p>
              <p className="text-2xl font-bold text-green-600">{mockCardStats.activeCards.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((mockCardStats.activeCards / mockCardStats.totalCards) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-orange-600">{mockCardStats.pendingApplications}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2 text-sm text-orange-600">
            Requires review
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disputes</p>
              <p className="text-2xl font-bold text-red-600">{mockCardStats.disputesThisMonth}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2 text-sm text-red-600">
            {mockCardStats.fraudCases} fraud cases
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'applications', name: 'Card Applications', icon: FileText },
              { id: 'issues', name: 'Card Issues', icon: AlertTriangle },
              { id: 'disputes', name: 'Transaction Disputes', icon: Shield },
              { id: 'limits', name: 'Limit Requests', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Card Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by customer name or application ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="documents_required">Documents Required</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="prepaid">Prepaid Card</option>
                  <option value="business">Business Card</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Applications Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCardApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getCardTypeIcon(application.cardType)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{application.id}</div>
                              <div className="text-sm text-gray-500">{new Date(application.applicationDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.userName}</div>
                            <div className="text-sm text-gray-500">{application.userEmail}</div>
                            <div className="text-sm text-gray-500">{application.userPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">{application.cardType} Card</div>
                            <div className="text-sm text-gray-500 capitalize">{application.cardTier} Tier</div>
                            <div className="text-sm text-blue-600">Fee: ${application.annualFee}/year</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Limit: ${application.requestedLimit.toLocaleString()}</div>
                            {application.creditScore && (
                              <div className="text-sm text-green-600">Credit: {application.creditScore}</div>
                            )}
                            {application.monthlyIncome && (
                              <div className="text-sm text-gray-500">Income: ${application.monthlyIncome.toLocaleString()}/mo</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {application.documents.map((doc, index) => (
                              <span key={index} className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(doc.status)} mr-1`}>
                                {doc.name.split(' ')[0]}: {doc.status}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ').charAt(0).toUpperCase() + application.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowApplicationModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'approve', application.requestedLimit)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card Issues Tab */}
          {activeTab === 'issues' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Card Issues & Lost/Stolen Reports</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Generate Report
                </button>
              </div>

              <div className="space-y-6">
                {mockCardIssues.map((issue) => (
                  <div key={issue.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getIssueTypeIcon(issue.issueType)}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{issue.userName}</h4>
                          <p className="text-sm text-gray-500">Card: {issue.cardNumber} | Issue ID: {issue.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').charAt(0).toUpperCase() + issue.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600"><strong>Issue Type:</strong> {issue.issueType.replace('_', ' ').charAt(0).toUpperCase() + issue.issueType.replace('_', ' ').slice(1)}</p>
                        <p className="text-sm text-gray-600"><strong>Report Date:</strong> {new Date(issue.reportDate).toLocaleString()}</p>
                        {issue.location && (
                          <p className="text-sm text-gray-600"><strong>Location:</strong> {issue.location}</p>
                        )}
                        {issue.policeReport && (
                          <p className="text-sm text-gray-600"><strong>Police Report:</strong> {issue.policeReport}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Description:</strong></p>
                        <p className="text-sm text-gray-800">{issue.description}</p>
                        {issue.replacementCardId && (
                          <p className="text-sm text-green-600 mt-2"><strong>Replacement Card:</strong> {issue.replacementCardId}</p>
                        )}
                        {issue.resolutionDate && (
                          <p className="text-sm text-green-600"><strong>Resolved:</strong> {new Date(issue.resolutionDate).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowIssueModal(true);
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {issue.status === 'reported' && (
                        <>
                          <button
                            onClick={() => handleIssueAction(issue.id, 'block_card')}
                            className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Block Card
                          </button>
                          <button
                            onClick={() => handleIssueAction(issue.id, 'issue_replacement')}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Issue Replacement
                          </button>
                        </>
                      )}
                      {issue.status === 'card_blocked' && (
                        <button
                          onClick={() => handleIssueAction(issue.id, 'issue_replacement')}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Issue Replacement
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Disputes Tab */}
          {activeTab === 'disputes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Transaction Dispute Resolution</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Export Disputes
                </button>
              </div>

              <div className="space-y-6">
                {mockTransactionDisputes.map((dispute) => (
                  <div key={dispute.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{dispute.userName}</h4>
                        <p className="text-sm text-gray-500">
                          Dispute ID: {dispute.id} | Transaction: {dispute.transactionId} | Card: {dispute.cardNumber}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600"><strong>Dispute Type:</strong> {dispute.disputeType.replace('_', ' ').charAt(0).toUpperCase() + dispute.disputeType.replace('_', ' ').slice(1)}</p>
                        <p className="text-sm text-gray-600"><strong>Transaction Amount:</strong> ${dispute.transactionAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600"><strong>Transaction Date:</strong> {new Date(dispute.transactionDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600"><strong>Dispute Date:</strong> {new Date(dispute.disputeDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600"><strong>Merchant:</strong> {dispute.merchantName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Description:</strong></p>
                        <p className="text-sm text-gray-800 mb-2">{dispute.description}</p>
                        {dispute.resolution && (
                          <>
                            <p className="text-sm text-green-600"><strong>Resolution:</strong> {dispute.resolution}</p>
                            {dispute.refundAmount && (
                              <p className="text-sm text-green-600"><strong>Refund Amount:</strong> ${dispute.refundAmount.toLocaleString()}</p>
                            )}
                            {dispute.resolutionDate && (
                              <p className="text-sm text-green-600"><strong>Resolved:</strong> {new Date(dispute.resolutionDate).toLocaleDateString()}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence Submitted</h5>
                      <div className="space-y-1">
                        {dispute.evidence.map((evidence, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{evidence.type}: {evidence.description}</span>
                            <span className="text-gray-500">{new Date(evidence.uploadDate).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowDisputeModal(true);
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {dispute.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleDisputeAction(dispute.id, 'investigate')}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Start Investigation
                          </button>
                          <button
                            onClick={() => handleDisputeAction(dispute.id, 'reject')}
                            className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject Dispute
                          </button>
                        </>
                      )}
                      {dispute.status === 'investigating' && (
                        <button
                          onClick={() => handleDisputeAction(dispute.id, 'approve')}
                          className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve Refund
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limit Requests Tab */}
          {activeTab === 'limits' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Card Limit Management</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Bulk Process
                </button>
              </div>

              <div className="space-y-6">
                {mockCardLimitRequests.map((request) => (
                  <div key={request.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{request.userName}</h4>
                        <p className="text-sm text-gray-500">
                          Request ID: {request.id} | Card: {request.cardNumber}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600"><strong>Request Type:</strong> {request.requestType.replace('_', ' ').charAt(0).toUpperCase() + request.requestType.replace('_', ' ').slice(1)}</p>
                        <p className="text-sm text-gray-600"><strong>Current Limit:</strong> ${request.currentLimit.toLocaleString()}</p>
                        <p className="text-sm text-gray-600"><strong>Requested Limit:</strong> ${request.requestedLimit.toLocaleString()}</p>
                        {request.approvedLimit && (
                          <p className="text-sm text-green-600"><strong>Approved Limit:</strong> ${request.approvedLimit.toLocaleString()}</p>
                        )}
                        {request.temporaryDuration && (
                          <p className="text-sm text-blue-600"><strong>Duration:</strong> {request.temporaryDuration} days</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Request Date:</strong> {new Date(request.requestDate).toLocaleDateString()}</p>
                        {request.approvalDate && (
                          <p className="text-sm text-green-600"><strong>Approval Date:</strong> {new Date(request.approvalDate).toLocaleDateString()}</p>
                        )}
                        <p className="text-sm text-gray-600"><strong>Reason:</strong> {request.reason}</p>
                        {request.creditScore && (
                          <p className="text-sm text-green-600"><strong>Credit Score:</strong> {request.creditScore}</p>
                        )}
                        {request.incomeVerification && (
                          <p className="text-sm text-green-600"><strong>Income Verified:</strong> Yes</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm text-gray-600"><strong>Justification:</strong></p>
                      <p className="text-sm text-gray-800">{request.justification}</p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLimitRequest(request);
                          setShowLimitModal(true);
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleLimitAction(request.id, 'approve', request.requestedLimit)}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLimitAction(request.id, 'reject')}
                            className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals would go here - simplified for brevity */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Card Application Review</h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Customer:</strong> {selectedApplication.userName}</p>
                  <p><strong>Email:</strong> {selectedApplication.userEmail}</p>
                  <p><strong>Phone:</strong> {selectedApplication.userPhone}</p>
                  <p><strong>Employment:</strong> {selectedApplication.employmentStatus}</p>
                </div>
                <div>
                  <p><strong>Card Type:</strong> {selectedApplication.cardType}</p>
                  <p><strong>Tier:</strong> {selectedApplication.cardTier}</p>
                  <p><strong>Requested Limit:</strong> ${selectedApplication.requestedLimit.toLocaleString()}</p>
                  <p><strong>Annual Fee:</strong> ${selectedApplication.annualFee}</p>
                </div>
              </div>
              {selectedApplication.creditScore && (
                <div>
                  <p><strong>Credit Score:</strong> {selectedApplication.creditScore}</p>
                  <p><strong>Monthly Income:</strong> ${selectedApplication.monthlyIncome?.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p><strong>Address:</strong> {selectedApplication.address}</p>
              </div>
              <div>
                <p><strong>Documents:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApplication.documents.map((doc, index) => (
                    <span key={index} className={`px-2 py-1 text-xs rounded ${getStatusColor(doc.status)}`}>
                      {doc.name}: {doc.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleApplicationAction(selectedApplication.id, 'approve', selectedApplication.requestedLimit)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve Application
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication.id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject Application
              </button>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManagementAdmin;