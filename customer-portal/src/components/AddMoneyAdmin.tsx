import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search,
  Clock,
  TrendingUp
} from 'lucide-react';

// Interfaces
interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gateway: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  requestDate: string;
  approvalRequired: boolean;
  riskScore: number;
  transactionId?: string;
}

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
  successRate: number;
  avgProcessingTime: number;
  dailyLimit: number;
  monthlyVolume: number;
  fees: {
    percentage: number;
    fixed: number;
  };
}

interface FailedTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  gateway: string;
  errorCode: string;
  errorMessage: string;
  failureDate: string;
  retryCount: number;
  canRetry: boolean;
  resolution: 'pending' | 'resolved' | 'escalated';
}

// Mock Data
const mockDepositRequests: DepositRequest[] = [
  {
    id: 'DEP001',
    userId: 'USR001',
    userName: 'John Smith',
    amount: 15000,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    gateway: 'Stripe',
    status: 'pending',
    requestDate: '2024-01-15T10:30:00Z',
    approvalRequired: true,
    riskScore: 75,
    transactionId: 'TXN_15000_001'
  },
  {
    id: 'DEP002',
    userId: 'USR002',
    userName: 'Sarah Johnson',
    amount: 5000,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    gateway: 'PayPal',
    status: 'approved',
    requestDate: '2024-01-15T09:15:00Z',
    approvalRequired: false,
    riskScore: 25,
    transactionId: 'TXN_5000_002'
  },
  {
    id: 'DEP003',
    userId: 'USR003',
    userName: 'Michael Brown',
    amount: 25000,
    currency: 'USD',
    paymentMethod: 'Wire Transfer',
    gateway: 'Bank Direct',
    status: 'processing',
    requestDate: '2024-01-15T08:45:00Z',
    approvalRequired: true,
    riskScore: 90,
    transactionId: 'TXN_25000_003'
  }
];

const mockPaymentGateways: PaymentGateway[] = [
  {
    id: 'GTW001',
    name: 'Stripe Gateway',
    provider: 'Stripe',
    status: 'active',
    successRate: 98.5,
    avgProcessingTime: 2.3,
    dailyLimit: 1000000,
    monthlyVolume: 15000000,
    fees: { percentage: 2.9, fixed: 0.30 }
  },
  {
    id: 'GTW002',
    name: 'PayPal Gateway',
    provider: 'PayPal',
    status: 'active',
    successRate: 97.2,
    avgProcessingTime: 3.1,
    dailyLimit: 500000,
    monthlyVolume: 8000000,
    fees: { percentage: 3.4, fixed: 0.49 }
  },
  {
    id: 'GTW003',
    name: 'Bank Direct',
    provider: 'Internal',
    status: 'maintenance',
    successRate: 99.1,
    avgProcessingTime: 24.0,
    dailyLimit: 2000000,
    monthlyVolume: 25000000,
    fees: { percentage: 1.5, fixed: 5.00 }
  }
];

const mockFailedTransactions: FailedTransaction[] = [
  {
    id: 'FAIL001',
    userId: 'USR004',
    userName: 'David Wilson',
    amount: 8000,
    gateway: 'Stripe',
    errorCode: 'CARD_DECLINED',
    errorMessage: 'Your card was declined by the issuing bank',
    failureDate: '2024-01-15T11:20:00Z',
    retryCount: 2,
    canRetry: true,
    resolution: 'pending'
  },
  {
    id: 'FAIL002',
    userId: 'USR005',
    userName: 'Lisa Anderson',
    amount: 12000,
    gateway: 'PayPal',
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'Insufficient funds in the source account',
    failureDate: '2024-01-15T10:45:00Z',
    retryCount: 1,
    canRetry: false,
    resolution: 'escalated'
  }
];

const AddMoneyAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [selectedFailure, setSelectedFailure] = useState<FailedTransaction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApproveDeposit = (depositId: string, action: 'approve' | 'reject') => {
    console.log(`${action} deposit:`, depositId);
    setShowApprovalModal(false);
    setSelectedDeposit(null);
  };

  const handleRetryTransaction = (transactionId: string) => {
    console.log('Retry transaction:', transactionId);
  };

  const handleResolveFailure = (failureId: string, resolution: string) => {
    console.log('Resolve failure:', failureId, resolution);
    setShowResolutionModal(false);
    setSelectedFailure(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'active': case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': case 'inactive': case 'escalated': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredDeposits = mockDepositRequests.filter(deposit => {
    const matchesStatus = filterStatus === 'all' || deposit.status === filterStatus;
    const matchesSearch = deposit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Money Service Administration</h1>
        <p className="text-gray-600">Monitor deposits, manage approvals, and configure payment gateways</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Deposits</p>
              <p className="text-2xl font-bold text-green-600">$485,230</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Transactions</p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">98.2%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'deposits', name: 'Deposit Requests', icon: DollarSign },
              { id: 'gateways', name: 'Payment Gateways', icon: CreditCard },
              { id: 'failures', name: 'Failed Transactions', icon: AlertTriangle },
              { id: 'settings', name: 'Configuration', icon: Settings }
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
          {/* Deposit Requests Tab */}
          {activeTab === 'deposits' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by user name or transaction ID..."
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Deposits Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{deposit.userName}</div>
                            <div className="text-sm text-gray-500">{deposit.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${deposit.amount.toLocaleString()} {deposit.currency}
                          </div>
                          {deposit.approvalRequired && (
                            <div className="text-xs text-orange-600">Approval Required</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deposit.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deposit.gateway}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(deposit.riskScore)}`}>
                            {deposit.riskScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deposit.status)}`}>
                            {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(deposit.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setShowApprovalModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {deposit.status === 'pending' && deposit.approvalRequired && (
                            <>
                              <button
                                onClick={() => handleApproveDeposit(deposit.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleApproveDeposit(deposit.id, 'reject')}
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

          {/* Payment Gateways Tab */}
          {activeTab === 'gateways' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Payment Gateway Configuration</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Gateway
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPaymentGateways.map((gateway) => (
                  <div key={gateway.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{gateway.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(gateway.status)}`}>
                        {gateway.status.charAt(0).toUpperCase() + gateway.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Provider:</span>
                        <span className="text-sm font-medium">{gateway.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate:</span>
                        <span className="text-sm font-medium text-green-600">{gateway.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Processing:</span>
                        <span className="text-sm font-medium">{gateway.avgProcessingTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily Limit:</span>
                        <span className="text-sm font-medium">${gateway.dailyLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Volume:</span>
                        <span className="text-sm font-medium">${gateway.monthlyVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fees:</span>
                        <span className="text-sm font-medium">{gateway.fees.percentage}% + ${gateway.fees.fixed}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGateway(gateway);
                          setShowGatewayModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Configure
                      </button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Transactions Tab */}
          {activeTab === 'failures' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Failed Transaction Resolution</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retry Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockFailedTransactions.map((failure) => (
                      <tr key={failure.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{failure.userName}</div>
                            <div className="text-sm text-gray-500">{failure.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${failure.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{failure.gateway}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-red-600">{failure.errorCode}</div>
                            <div className="text-sm text-gray-500">{failure.errorMessage}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{failure.retryCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(failure.resolution)}`}>
                            {failure.resolution.charAt(0).toUpperCase() + failure.resolution.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {failure.canRetry && (
                            <button
                              onClick={() => handleRetryTransaction(failure.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedFailure(failure);
                              setShowResolutionModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Add Money Service Configuration</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Approval Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manual Approval Amount (USD)</label>
                      <input type="number" defaultValue="10000" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">High Risk Score Threshold</label>
                      <input type="number" defaultValue="75" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Processing Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Daily Limit per User</label>
                      <input type="number" defaultValue="50000" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit per User</label>
                      <input type="number" defaultValue="500000" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Retry Attempts</label>
                      <input type="number" defaultValue="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Email notifications for large deposits</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">SMS alerts for failed transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Real-time dashboard notifications</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals would go here - simplified for brevity */}
      {showApprovalModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Deposit Approval</h3>
            <p className="text-gray-600 mb-4">
              Review deposit request for {selectedDeposit.userName} - ${selectedDeposit.amount.toLocaleString()}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleApproveDeposit(selectedDeposit.id, 'approve')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproveDeposit(selectedDeposit.id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
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

export default AddMoneyAdmin;