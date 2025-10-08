import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Percent,
  BarChart3,
  PieChart,
  Settings,
  Clock,
  Target,
  Award
} from 'lucide-react';

// Interfaces
interface PolicyApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  policyType: 'life' | 'health' | 'auto' | 'home' | 'travel';
  productName: string;
  coverageAmount: number;
  premium: number;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  riskAssessment: {
    score: number;
    factors: string[];
  };
  documents: {
    name: string;
    status: 'uploaded' | 'verified' | 'missing';
  }[];
  agentId?: string;
  agentName?: string;
}

interface InvestmentTransaction {
  id: string;
  userId: string;
  userName: string;
  transactionType: 'buy' | 'sell' | 'dividend' | 'withdrawal';
  productType: 'mutual_fund' | 'stocks' | 'bonds' | 'etf' | 'fixed_deposit';
  productName: string;
  amount: number;
  units?: number;
  pricePerUnit?: number;
  transactionDate: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fees: number;
  commission: number;
  portfolioId: string;
}

interface Product {
  id: string;
  name: string;
  type: 'insurance' | 'investment';
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'discontinued';
  minAmount: number;
  maxAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn?: number;
  premiumRate?: number;
  commissionRate: number;
  totalSales: number;
  activeClients: number;
  launchDate: string;
}

interface CommissionPayout {
  id: string;
  agentId: string;
  agentName: string;
  period: string;
  totalSales: number;
  commissionEarned: number;
  bonusEarned: number;
  totalPayout: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  payoutDate?: string;
  transactions: {
    productName: string;
    salesAmount: number;
    commissionRate: number;
    commission: number;
  }[];
}

// Mock Data
const mockPolicyApplications: PolicyApplication[] = [
  {
    id: 'POL001',
    userId: 'USR001',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    policyType: 'life',
    productName: 'Term Life Insurance Plus',
    coverageAmount: 500000,
    premium: 2400,
    applicationDate: '2024-01-15T10:30:00Z',
    status: 'pending',
    riskAssessment: {
      score: 75,
      factors: ['Age: 35', 'Non-smoker', 'Good health history', 'Stable income']
    },
    documents: [
      { name: 'Medical Report', status: 'verified' },
      { name: 'Income Proof', status: 'verified' },
      { name: 'Identity Proof', status: 'uploaded' }
    ],
    agentId: 'AGT001',
    agentName: 'Sarah Johnson'
  },
  {
    id: 'POL002',
    userId: 'USR002',
    userName: 'Michael Brown',
    userEmail: 'michael.b@email.com',
    policyType: 'health',
    productName: 'Family Health Shield',
    coverageAmount: 100000,
    premium: 1800,
    applicationDate: '2024-01-14T15:45:00Z',
    status: 'under_review',
    riskAssessment: {
      score: 85,
      factors: ['Age: 42', 'Pre-existing condition', 'Family history', 'Regular checkups']
    },
    documents: [
      { name: 'Medical History', status: 'verified' },
      { name: 'Family Medical Records', status: 'missing' },
      { name: 'Identity Proof', status: 'verified' }
    ]
  }
];

const mockInvestmentTransactions: InvestmentTransaction[] = [
  {
    id: 'INV001',
    userId: 'USR003',
    userName: 'Lisa Anderson',
    transactionType: 'buy',
    productType: 'mutual_fund',
    productName: 'Growth Equity Fund',
    amount: 25000,
    units: 1250,
    pricePerUnit: 20,
    transactionDate: '2024-01-15T11:20:00Z',
    status: 'completed',
    fees: 125,
    commission: 250,
    portfolioId: 'PF001'
  },
  {
    id: 'INV002',
    userId: 'USR004',
    userName: 'David Wilson',
    transactionType: 'sell',
    productType: 'stocks',
    productName: 'Tech Growth Portfolio',
    amount: 15000,
    units: 500,
    pricePerUnit: 30,
    transactionDate: '2024-01-15T09:45:00Z',
    status: 'pending',
    fees: 75,
    commission: 150,
    portfolioId: 'PF002'
  }
];

const mockProducts: Product[] = [
  {
    id: 'PRD001',
    name: 'Term Life Insurance Plus',
    type: 'insurance',
    category: 'Life Insurance',
    description: 'Comprehensive term life insurance with flexible coverage options',
    status: 'active',
    minAmount: 100000,
    maxAmount: 2000000,
    riskLevel: 'low',
    premiumRate: 0.48,
    commissionRate: 15,
    totalSales: 5200000,
    activeClients: 1250,
    launchDate: '2023-06-01'
  },
  {
    id: 'PRD002',
    name: 'Growth Equity Fund',
    type: 'investment',
    category: 'Mutual Funds',
    description: 'High-growth equity fund targeting emerging markets',
    status: 'active',
    minAmount: 5000,
    maxAmount: 1000000,
    riskLevel: 'high',
    expectedReturn: 12.5,
    commissionRate: 1.0,
    totalSales: 15600000,
    activeClients: 890,
    launchDate: '2023-03-15'
  },
  {
    id: 'PRD003',
    name: 'Balanced Income Fund',
    type: 'investment',
    category: 'Mutual Funds',
    description: 'Conservative balanced fund with steady income generation',
    status: 'active',
    minAmount: 10000,
    maxAmount: 500000,
    riskLevel: 'medium',
    expectedReturn: 8.2,
    commissionRate: 0.75,
    totalSales: 8900000,
    activeClients: 650,
    launchDate: '2023-01-10'
  }
];

const mockCommissionPayouts: CommissionPayout[] = [
  {
    id: 'PAY001',
    agentId: 'AGT001',
    agentName: 'Sarah Johnson',
    period: '2024-01',
    totalSales: 125000,
    commissionEarned: 6250,
    bonusEarned: 500,
    totalPayout: 6750,
    status: 'pending',
    transactions: [
      { productName: 'Term Life Insurance Plus', salesAmount: 75000, commissionRate: 15, commission: 3750 },
      { productName: 'Growth Equity Fund', salesAmount: 50000, commissionRate: 1.0, commission: 2500 }
    ]
  },
  {
    id: 'PAY002',
    agentId: 'AGT002',
    agentName: 'Robert Chen',
    period: '2024-01',
    totalSales: 89000,
    commissionEarned: 4450,
    bonusEarned: 200,
    totalPayout: 4650,
    status: 'approved',
    payoutDate: '2024-02-01',
    transactions: [
      { productName: 'Balanced Income Fund', salesAmount: 60000, commissionRate: 0.75, commission: 2700 },
      { productName: 'Term Life Insurance Plus', salesAmount: 29000, commissionRate: 15, commission: 1750 }
    ]
  }
];

const InsuranceInvestmentAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyApplication | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<InvestmentTransaction | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<CommissionPayout | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePolicyAction = (policyId: string, action: 'approve' | 'reject') => {
    console.log(`${action} policy:`, policyId);
    setShowPolicyModal(false);
    setSelectedPolicy(null);
  };

  const handlePayoutAction = (payoutId: string, action: 'approve' | 'reject') => {
    console.log(`${action} payout:`, payoutId);
    setShowPayoutModal(false);
    setSelectedPayout(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': case 'active': case 'verified': case 'paid': 
        return 'text-green-600 bg-green-100';
      case 'rejected': case 'failed': case 'inactive': case 'discontinued': case 'disputed': 
        return 'text-red-600 bg-red-100';
      case 'pending': case 'uploaded': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': case 'cancelled': return 'text-blue-600 bg-blue-100';
      case 'missing': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'life': return <Shield className="h-4 w-4" />;
      case 'health': return <Shield className="h-4 w-4" />;
      case 'auto': return <Shield className="h-4 w-4" />;
      case 'home': return <Shield className="h-4 w-4" />;
      case 'travel': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sell': return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      case 'dividend': return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'withdrawal': return <DollarSign className="h-4 w-4 text-orange-600" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance & Investment Administration</h1>
        <p className="text-gray-600">Manage policy applications, investment transactions, products, and commission payouts</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Policies</p>
              <p className="text-2xl font-bold text-orange-600">24</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investment Volume</p>
              <p className="text-2xl font-bold text-green-600">$2.4M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-blue-600">18</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Due</p>
              <p className="text-2xl font-bold text-purple-600">$45,230</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'policies', name: 'Policy Applications', icon: Shield },
              { id: 'investments', name: 'Investment Transactions', icon: TrendingUp },
              { id: 'products', name: 'Product Management', icon: FileText },
              { id: 'payouts', name: 'Commission Payouts', icon: DollarSign }
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
          {/* Policy Applications Tab */}
          {activeTab === 'policies' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by customer name or policy..."
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
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="life">Life Insurance</option>
                  <option value="health">Health Insurance</option>
                  <option value="auto">Auto Insurance</option>
                  <option value="home">Home Insurance</option>
                  <option value="travel">Travel Insurance</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Policy Applications Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage & Premium</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Assessment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockPolicyApplications.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getPolicyTypeIcon(policy.policyType)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{policy.id}</div>
                              <div className="text-sm text-gray-500">{new Date(policy.applicationDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{policy.userName}</div>
                            <div className="text-sm text-gray-500">{policy.userEmail}</div>
                            {policy.agentName && (
                              <div className="text-xs text-blue-600">Agent: {policy.agentName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{policy.productName}</div>
                            <div className="text-sm text-gray-500 capitalize">{policy.policyType} Insurance</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Coverage: ${policy.coverageAmount.toLocaleString()}</div>
                            <div className="text-sm text-green-600">Premium: ${policy.premium.toLocaleString()}/year</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              policy.riskAssessment.score >= 80 ? 'text-red-600 bg-red-100' :
                              policy.riskAssessment.score >= 60 ? 'text-yellow-600 bg-yellow-100' :
                              'text-green-600 bg-green-100'
                            }`}>
                              Risk: {policy.riskAssessment.score}%
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {policy.riskAssessment.factors.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                            {policy.status.replace('_', ' ').charAt(0).toUpperCase() + policy.status.replace('_', ' ').slice(1)}
                          </span>
                          <div className="mt-1">
                            {policy.documents.map((doc, index) => (
                              <span key={index} className={`inline-flex px-1 py-0.5 text-xs rounded ${getStatusColor(doc.status)} mr-1`}>
                                {doc.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowPolicyModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {policy.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePolicyAction(policy.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handlePolicyAction(policy.id, 'reject')}
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

          {/* Investment Transactions Tab */}
          {activeTab === 'investments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Investment Transaction Monitoring</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Generate Report
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees & Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockInvestmentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getTransactionTypeIcon(transaction.transactionType)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                              <div className="text-sm text-gray-500">{new Date(transaction.transactionDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                            <div className="text-sm text-gray-500">{transaction.userId}</div>
                            <div className="text-xs text-blue-600">Portfolio: {transaction.portfolioId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.productName}</div>
                            <div className="text-sm text-gray-500 capitalize">{transaction.productType.replace('_', ' ')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}: ${transaction.amount.toLocaleString()}
                            </div>
                            {transaction.units && (
                              <div className="text-sm text-gray-500">
                                {transaction.units.toLocaleString()} units @ ${transaction.pricePerUnit}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-red-600">Fees: ${transaction.fees}</div>
                            <div className="text-sm text-green-600">Commission: ${transaction.commission}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Product Management Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Product Portfolio</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add New Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {product.type === 'insurance' ? <Shield className="h-5 w-5 text-blue-600" /> : <TrendingUp className="h-5 w-5 text-green-600" />}
                        <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risk Level:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getRiskColor(product.riskLevel)}`}>
                          {product.riskLevel.charAt(0).toUpperCase() + product.riskLevel.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Commission Rate:</span>
                        <span className="text-sm font-medium text-green-600">{product.commissionRate}%</span>
                      </div>
                      {product.expectedReturn && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expected Return:</span>
                          <span className="text-sm font-medium text-blue-600">{product.expectedReturn}%</span>
                        </div>
                      )}
                      {product.premiumRate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Premium Rate:</span>
                          <span className="text-sm font-medium text-purple-600">{product.premiumRate}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sales:</span>
                        <span className="text-sm font-medium">${product.totalSales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Clients:</span>
                        <span className="text-sm font-medium">{product.activeClients.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Launch Date:</span>
                        <span className="text-sm font-medium">{new Date(product.launchDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Manage
                      </button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commission Payouts Tab */}
          {activeTab === 'payouts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Commission & Payout Management</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Process Payouts
                </button>
              </div>

              <div className="space-y-6">
                {mockCommissionPayouts.map((payout) => (
                  <div key={payout.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{payout.agentName}</h4>
                        <p className="text-sm text-gray-500">Period: {payout.period} | Agent ID: {payout.agentId}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-lg font-bold text-blue-600">${payout.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Commission Earned</p>
                        <p className="text-lg font-bold text-green-600">${payout.commissionEarned.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Bonus Earned</p>
                        <p className="text-lg font-bold text-purple-600">${payout.bonusEarned.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Payout</p>
                        <p className="text-lg font-bold text-gray-900">${payout.totalPayout.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Transaction Breakdown</h5>
                      <div className="space-y-2">
                        {payout.transactions.map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{transaction.productName}</span>
                            <div className="flex space-x-4">
                              <span>Sales: ${transaction.salesAmount.toLocaleString()}</span>
                              <span>Rate: {transaction.commissionRate}%</span>
                              <span className="font-medium text-green-600">Commission: ${transaction.commission.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowPayoutModal(true);
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {payout.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePayoutAction(payout.id, 'approve')}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayoutAction(payout.id, 'reject')}
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
      {showPolicyModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Policy Application Review</h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Customer:</strong> {selectedPolicy.userName}</p>
                  <p><strong>Email:</strong> {selectedPolicy.userEmail}</p>
                  <p><strong>Product:</strong> {selectedPolicy.productName}</p>
                  <p><strong>Type:</strong> {selectedPolicy.policyType}</p>
                </div>
                <div>
                  <p><strong>Coverage:</strong> ${selectedPolicy.coverageAmount.toLocaleString()}</p>
                  <p><strong>Premium:</strong> ${selectedPolicy.premium.toLocaleString()}/year</p>
                  <p><strong>Risk Score:</strong> {selectedPolicy.riskAssessment.score}%</p>
                  <p><strong>Agent:</strong> {selectedPolicy.agentName || 'Direct'}</p>
                </div>
              </div>
              <div>
                <p><strong>Risk Factors:</strong></p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {selectedPolicy.riskAssessment.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p><strong>Documents:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPolicy.documents.map((doc, index) => (
                    <span key={index} className={`px-2 py-1 text-xs rounded ${getStatusColor(doc.status)}`}>
                      {doc.name}: {doc.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handlePolicyAction(selectedPolicy.id, 'approve')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve Policy
              </button>
              <button
                onClick={() => handlePolicyAction(selectedPolicy.id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject Policy
              </button>
              <button
                onClick={() => setShowPolicyModal(false)}
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

export default InsuranceInvestmentAdmin;