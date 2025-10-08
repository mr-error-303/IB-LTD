import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  User, 
  Clock, 
  Shield,
  Filter,
  Search,
  Download,
  Eye,
  Settings,
  Ban,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

interface FundTransfer {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromAccount: string;
  toUserId: string;
  toUserName: string;
  toAccount: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  requiresApproval: boolean;
  riskScore: number;
  ipAddress: string;
  location: string;
  adminComments?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

interface UserLimit {
  userId: string;
  userName: string;
  email: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  status: 'active' | 'suspended' | 'restricted';
  lastUpdated: Date;
}

interface BlockedAccount {
  accountNumber: string;
  accountName: string;
  reason: string;
  blockedBy: string;
  blockedAt: Date;
  status: 'active' | 'temporary' | 'permanent';
}

const FundTransferMonitoring: React.FC = () => {
  const [transfers, setTransfers] = useState<FundTransfer[]>([]);
  const [userLimits, setUserLimits] = useState<UserLimit[]>([]);
  const [blockedAccounts, setBlockedAccounts] = useState<BlockedAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'transfers' | 'limits' | 'blocked' | 'analytics'>('transfers');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<FundTransfer | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminComments, setAdminComments] = useState('');

  // Mock data for fund transfers
  useEffect(() => {
    const mockTransfers: FundTransfer[] = [
      {
        id: 'ft_001',
        fromUserId: 'user_001',
        fromUserName: 'John Doe',
        fromAccount: '1234567890',
        toUserId: 'user_002',
        toUserName: 'Jane Smith',
        toAccount: '0987654321',
        amount: 75000,
        currency: 'BDT',
        status: 'pending',
        priority: 'high',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        description: 'Business payment for services',
        requiresApproval: true,
        riskScore: 7,
        ipAddress: '192.168.1.100',
        location: 'Dhaka, Bangladesh'
      },
      {
        id: 'ft_002',
        fromUserId: 'user_003',
        fromUserName: 'Bob Johnson',
        fromAccount: '1122334455',
        toUserId: 'user_004',
        toUserName: 'Alice Brown',
        toAccount: '5544332211',
        amount: 25000,
        currency: 'BDT',
        status: 'completed',
        priority: 'medium',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        description: 'Family support',
        requiresApproval: false,
        riskScore: 3,
        ipAddress: '10.0.0.50',
        location: 'Chittagong, Bangladesh'
      },
      {
        id: 'ft_003',
        fromUserId: 'user_005',
        fromUserName: 'Charlie Wilson',
        fromAccount: '9988776655',
        toUserId: 'user_006',
        toUserName: 'Diana Prince',
        toAccount: '5566778899',
        amount: 150000,
        currency: 'BDT',
        status: 'pending',
        priority: 'critical',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        description: 'Property purchase payment',
        requiresApproval: true,
        riskScore: 9,
        ipAddress: '203.112.45.67',
        location: 'Sylhet, Bangladesh'
      }
    ];

    const mockUserLimits: UserLimit[] = [
      {
        userId: 'user_001',
        userName: 'John Doe',
        email: 'john.doe@email.com',
        dailyLimit: 100000,
        monthlyLimit: 2000000,
        dailyUsed: 75000,
        monthlyUsed: 450000,
        status: 'active',
        lastUpdated: new Date()
      },
      {
        userId: 'user_003',
        userName: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        dailyLimit: 50000,
        monthlyLimit: 1000000,
        dailyUsed: 25000,
        monthlyUsed: 125000,
        status: 'active',
        lastUpdated: new Date()
      },
      {
        userId: 'user_005',
        userName: 'Charlie Wilson',
        email: 'charlie.wilson@email.com',
        dailyLimit: 200000,
        monthlyLimit: 5000000,
        dailyUsed: 150000,
        monthlyUsed: 890000,
        status: 'restricted',
        lastUpdated: new Date()
      }
    ];

    const mockBlockedAccounts: BlockedAccount[] = [
      {
        accountNumber: '1111222233',
        accountName: 'Suspicious Account 1',
        reason: 'Multiple fraud reports',
        blockedBy: 'Admin User',
        blockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'permanent'
      },
      {
        accountNumber: '4444555566',
        accountName: 'Temporary Block Account',
        reason: 'Unusual transaction pattern',
        blockedBy: 'System Auto',
        blockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'temporary'
      }
    ];

    setTransfers(mockTransfers);
    setUserLimits(mockUserLimits);
    setBlockedAccounts(mockBlockedAccounts);
  }, []);

  const handleApproval = (transfer: FundTransfer, action: 'approve' | 'reject') => {
    setSelectedTransfer(transfer);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    if (selectedTransfer) {
      const updatedTransfers = transfers.map(transfer => 
        transfer.id === selectedTransfer.id 
          ? { 
              ...transfer, 
              status: approvalAction === 'approve' ? 'approved' : 'rejected',
              adminComments,
              approvedBy: 'Current Admin',
              approvedAt: new Date()
            }
          : transfer
      );
      setTransfers(updatedTransfers);
      setShowApprovalModal(false);
      setAdminComments('');
      setSelectedTransfer(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || transfer.priority === filterPriority;
    const matchesSearch = transfer.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromAccount.includes(searchTerm) ||
                         transfer.toAccount.includes(searchTerm);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fund Transfer Monitoring</h1>
          <p className="text-gray-600">Monitor and manage fund transfers with approval controls</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transfers Today</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">৳45.2M</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk Transfers</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('transfers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transfers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transfer Requests
              </button>
              <button
                onClick={() => setActiveTab('limits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'limits'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Limits
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blocked'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Blocked Accounts
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

          {/* Transfer Requests Tab */}
          {activeTab === 'transfers' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or account..."
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Transfers Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transfer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk & Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time & Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className={transfer.priority === 'critical' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ArrowRightLeft className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transfer.fromUserName} → {transfer.toUserName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transfer.fromAccount} → {transfer.toAccount}
                              </div>
                              <div className="text-xs text-gray-400">{transfer.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ৳{transfer.amount.toLocaleString()}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                            {transfer.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${
                            transfer.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                            transfer.riskScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Risk: {transfer.riskScore}/10
                          </div>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(transfer.priority)}`}>
                            {transfer.priority.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transfer.timestamp.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {transfer.location}
                          </div>
                          <div className="text-xs text-gray-400">{transfer.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {transfer.status === 'pending' && transfer.requiresApproval && (
                              <>
                                <button 
                                  onClick={() => handleApproval(transfer, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleApproval(transfer, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
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

          {/* User Limits Tab */}
          {activeTab === 'limits' && (
            <div className="p-6">
              <div className="mb-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Set Global Limits
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Daily Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Limit
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
                    {userLimits.map((limit) => (
                      <tr key={limit.userId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{limit.userName}</div>
                              <div className="text-sm text-gray-500">{limit.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">৳{limit.dailyLimit.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Used: ৳{limit.dailyUsed.toLocaleString()}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(limit.dailyUsed / limit.dailyLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">৳{limit.monthlyLimit.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Used: ৳{limit.monthlyUsed.toLocaleString()}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(limit.monthlyUsed / limit.monthlyLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            limit.status === 'active' ? 'bg-green-100 text-green-800' :
                            limit.status === 'restricted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {limit.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Ban className="w-4 h-4" />
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

          {/* Blocked Accounts Tab */}
          {activeTab === 'blocked' && (
            <div className="p-6">
              <div className="space-y-4">
                {blockedAccounts.map((account) => (
                  <div key={account.accountNumber} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Ban className="w-5 h-5 text-red-500" />
                          <h3 className="text-lg font-medium text-gray-900">{account.accountName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            account.status === 'permanent' ? 'bg-red-100 text-red-800' :
                            account.status === 'temporary' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {account.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Account: {account.accountNumber}</p>
                        <p className="text-gray-600 mb-2">Reason: {account.reason}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Blocked by: {account.blockedBy}</span>
                          <span>Date: {account.blockedAt.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Unblock
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Transfer:</span>
                      <span className="font-medium">৳25,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium text-green-600">97.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hours:</span>
                      <span className="font-medium">10 AM - 2 PM</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk Transfers:</span>
                      <span className="font-medium text-red-600">2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blocked Accounts:</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fraud Prevention:</span>
                      <span className="font-medium text-green-600">৳2.3M Saved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedTransfer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Transfer
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Transfer from {selectedTransfer.fromUserName} to {selectedTransfer.toUserName}
                  </p>
                  <p className="text-lg font-medium">Amount: ৳{selectedTransfer.amount.toLocaleString()}</p>
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
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApproval}
                    className={`px-4 py-2 rounded-md text-white ${
                      approvalAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approvalAction === 'approve' ? 'Approve' : 'Reject'}
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

export default FundTransferMonitoring;