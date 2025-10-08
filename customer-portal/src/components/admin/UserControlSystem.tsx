import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../common/NotificationSystem';
import { 
  Users, 
  Shield, 
  Lock, 
  Unlock, 
  Ban, 
  UserCheck, 
  UserX, 
  Settings, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Calendar, 
  X, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Globe, 
  Mail, 
  Phone, 
  Building, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react';

interface UserAccount {
  id: string;
  userName: string;
  userEmail: string;
  fullName: string;
  phone: string;
  accountType: 'savings' | 'current' | 'premium' | 'business';
  status: 'active' | 'suspended' | 'blocked' | 'pending' | 'closed';
  balance: number;
  creditLimit: number;
  riskScore: number;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'expired';
  twoFactorEnabled: boolean;
  lastLogin: string;
  registrationDate: string;
  restrictions: UserRestriction[];
  flags: string[];
  metadata: {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    failedLoginAttempts: number;
    deviceCount: number;
    locationCount: number;
  };
}

interface UserRestriction {
  id: string;
  type: 'transaction_limit' | 'login_block' | 'feature_disable' | 'withdrawal_limit' | 'transfer_limit' | 'account_freeze';
  description: string;
  value?: number;
  startDate: string;
  endDate?: string;
  reason: string;
  appliedBy: string;
  status: 'active' | 'expired' | 'removed';
}

interface AutomatedRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'contains' | 'in';
    value: any;
  }[];
  actions: {
    type: 'restrict' | 'flag' | 'notify' | 'block' | 'require_verification';
    parameters: Record<string, any>;
  }[];
  enabled: boolean;
  priority: number;
  triggerCount: number;
  lastTriggered?: string;
}

const UserControlSystem: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotifications();

  // State management
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [automatedRules, setAutomatedRules] = useState<AutomatedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'restrictions' | 'automation' | 'bulk'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    loadUserData();
    loadAutomatedRules();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Simulate comprehensive user data loading
      const mockUsers: UserAccount[] = [
        {
          id: 'USER001',
          userName: 'john.doe',
          userEmail: 'john.doe@email.com',
          fullName: 'John Doe',
          phone: '+8801712345678',
          accountType: 'savings',
          status: 'active',
          balance: 125000,
          creditLimit: 50000,
          riskScore: 15,
          kycStatus: 'verified',
          twoFactorEnabled: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          restrictions: [],
          flags: [],
          metadata: {
            totalTransactions: 245,
            totalDeposits: 850000,
            totalWithdrawals: 725000,
            failedLoginAttempts: 0,
            deviceCount: 2,
            locationCount: 1
          }
        },
        {
          id: 'USER002',
          userName: 'jane.smith',
          userEmail: 'jane.smith@email.com',
          fullName: 'Jane Smith',
          phone: '+8801798765432',
          accountType: 'premium',
          status: 'active',
          balance: 75000,
          creditLimit: 100000,
          riskScore: 35,
          kycStatus: 'verified',
          twoFactorEnabled: false,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          registrationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          restrictions: [
            {
              id: 'REST001',
              type: 'transaction_limit',
              description: 'Daily transaction limit reduced to ৳25,000',
              value: 25000,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              reason: 'Unusual transaction pattern detected',
              appliedBy: 'System',
              status: 'active'
            }
          ],
          flags: ['new_device', 'location_change'],
          metadata: {
            totalTransactions: 89,
            totalDeposits: 320000,
            totalWithdrawals: 245000,
            failedLoginAttempts: 2,
            deviceCount: 3,
            locationCount: 2
          }
        },
        {
          id: 'USER003',
          userName: 'bob.johnson',
          userEmail: 'bob.johnson@email.com',
          fullName: 'Bob Johnson',
          phone: '+8801656789012',
          accountType: 'current',
          status: 'suspended',
          balance: 5000,
          creditLimit: 25000,
          riskScore: 85,
          kycStatus: 'pending',
          twoFactorEnabled: false,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          restrictions: [
            {
              id: 'REST002',
              type: 'account_freeze',
              description: 'Account frozen due to suspicious activity',
              startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              reason: 'Multiple failed login attempts and unusual transaction patterns',
              appliedBy: 'Admin',
              status: 'active'
            },
            {
              id: 'REST003',
              type: 'login_block',
              description: 'Login temporarily blocked',
              startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              reason: 'Security concerns',
              appliedBy: 'System',
              status: 'active'
            }
          ],
          flags: ['suspicious_activity', 'multiple_failed_logins', 'kyc_pending', 'high_risk'],
          metadata: {
            totalTransactions: 156,
            totalDeposits: 180000,
            totalWithdrawals: 175000,
            failedLoginAttempts: 8,
            deviceCount: 5,
            locationCount: 4
          }
        }
      ];

      setUsers(mockUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      showError('Failed to load user data');
      setLoading(false);
    }
  };

  const loadAutomatedRules = async () => {
    try {
      const mockRules: AutomatedRule[] = [
        {
          id: 'RULE001',
          name: 'High Risk Score Alert',
          description: 'Flag users with risk score above 70',
          conditions: [
            { field: 'riskScore', operator: 'gt', value: 70 }
          ],
          actions: [
            { type: 'flag', parameters: { flag: 'high_risk' } },
            { type: 'notify', parameters: { message: 'High risk user detected' } }
          ],
          enabled: true,
          priority: 1,
          triggerCount: 12,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'RULE002',
          name: 'Multiple Failed Logins',
          description: 'Block users after 5 failed login attempts',
          conditions: [
            { field: 'metadata.failedLoginAttempts', operator: 'gt', value: 5 }
          ],
          actions: [
            { type: 'block', parameters: { duration: 3600000 } }, // 1 hour
            { type: 'notify', parameters: { message: 'User blocked due to failed logins' } }
          ],
          enabled: true,
          priority: 2,
          triggerCount: 5,
          lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'RULE003',
          name: 'Large Transaction Alert',
          description: 'Require verification for transactions above ৳100,000',
          conditions: [
            { field: 'transactionAmount', operator: 'gt', value: 100000 }
          ],
          actions: [
            { type: 'require_verification', parameters: { method: '2fa' } },
            { type: 'notify', parameters: { message: 'Large transaction requires verification' } }
          ],
          enabled: true,
          priority: 3,
          triggerCount: 28,
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      setAutomatedRules(mockRules);
    } catch (error) {
      console.error('Error loading automated rules:', error);
    }
  };

  // User control actions
  const handleUserAction = async (userId: string, action: string, parameters?: any) => {
    try {
      const userAccount = users.find(u => u.id === userId);
      if (!userAccount) return;

      switch (action) {
        case 'suspend':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'suspended' as const } : u
          ));
          showWarning(`User ${userAccount.userName} has been suspended`);
          break;

        case 'activate':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'active' as const } : u
          ));
          showSuccess(`User ${userAccount.userName} has been activated`);
          break;

        case 'block':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'blocked' as const } : u
          ));
          showError(`User ${userAccount.userName} has been blocked`);
          break;

        case 'enable_2fa':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, twoFactorEnabled: true } : u
          ));
          showSuccess(`2FA enabled for ${userAccount.userName}`);
          break;

        case 'disable_2fa':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, twoFactorEnabled: false } : u
          ));
          showWarning(`2FA disabled for ${userAccount.userName}`);
          break;

        case 'reset_password':
          showSuccess(`Password reset email sent to ${userAccount.userEmail}`);
          break;

        case 'add_restriction':
          setSelectedUser(userAccount);
          setShowRestrictionModal(true);
          break;

        default:
          showError('Unknown action');
      }
    } catch (error) {
      showError('Failed to perform action');
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !bulkAction) {
      showError('Please select users and an action');
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await handleUserAction(userId, bulkAction);
      }
      
      setSelectedUsers([]);
      setBulkAction('');
      showSuccess(`Bulk action "${bulkAction}" applied to ${selectedUsers.length} users`);
    } catch (error) {
      showError('Failed to perform bulk action');
    }
  };

  const addRestriction = async (restriction: Omit<UserRestriction, 'id'>) => {
    if (!selectedUser) return;

    try {
      const newRestriction: UserRestriction = {
        ...restriction,
        id: `REST${Date.now()}`,
        appliedBy: user?.name || 'Admin'
      };

      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, restrictions: [...u.restrictions, newRestriction] }
          : u
      ));

      setShowRestrictionModal(false);
      setSelectedUser(null);
      showSuccess('Restriction added successfully');
    } catch (error) {
      showError('Failed to add restriction');
    }
  };

  const removeRestriction = async (userId: string, restrictionId: string) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              restrictions: u.restrictions.map(r => 
                r.id === restrictionId ? { ...r, status: 'removed' as const } : r
              )
            }
          : u
      ));

      showSuccess('Restriction removed successfully');
    } catch (error) {
      showError('Failed to remove restriction');
    }
  };

  // Filtering and search
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    const matchesRisk = filterRisk === 'all' || 
                       (filterRisk === 'low' && user.riskScore < 30) ||
                       (filterRisk === 'medium' && user.riskScore >= 30 && user.riskScore < 70) ||
                       (filterRisk === 'high' && user.riskScore >= 70);

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              User Control System
            </h1>
            <p className="text-gray-600">Comprehensive user management and control</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
            <button
              onClick={loadUserData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Suspended</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Blocked</p>
                <p className="text-2xl font-bold text-red-900">
                  {users.filter(u => u.status === 'blocked').length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-900">
                  {users.filter(u => u.riskScore >= 70).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'restrictions', label: 'Restrictions', icon: Lock },
              { id: 'automation', label: 'Automated Rules', icon: Zap },
              { id: 'bulk', label: 'Bulk Actions', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk (&lt;30)</option>
                  <option value="medium">Medium Risk (30-70)</option>
                  <option value="high">High Risk (&gt;70)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Selection ({selectedUsers.length})
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Security & Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Restrictions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userAccount) => (
                  <tr key={userAccount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(userAccount.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, userAccount.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== userAccount.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {userAccount.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userAccount.fullName}</div>
                          <div className="text-sm text-gray-500">{userAccount.userEmail}</div>
                          <div className="text-xs text-gray-400">@{userAccount.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">৳{userAccount.balance.toLocaleString()}</div>
                        <div className="text-gray-500">Credit: ৳{userAccount.creditLimit.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 capitalize">{userAccount.accountType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${getRiskColor(userAccount.riskScore)}`}>
                          Risk: {userAccount.riskScore}%
                        </div>
                        <div className="flex items-center mt-1">
                          {userAccount.twoFactorEnabled ? (
                            <Shield className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                          )}
                          <span className="text-xs text-gray-500">
                            {userAccount.twoFactorEnabled ? '2FA On' : '2FA Off'}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKycStatusColor(userAccount.kycStatus)}`}>
                          KYC: {userAccount.kycStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userAccount.status)}`}>
                          {userAccount.status}
                        </span>
                        {userAccount.restrictions.filter(r => r.status === 'active').length > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {userAccount.restrictions.filter(r => r.status === 'active').length} restrictions
                          </span>
                        )}
                        {userAccount.flags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {userAccount.flags.slice(0, 2).map((flag, index) => (
                              <span key={index} className="inline-flex px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                                {flag}
                              </span>
                            ))}
                            {userAccount.flags.length > 2 && (
                              <span className="inline-flex px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                +{userAccount.flags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {userAccount.status === 'active' ? (
                          <button
                            onClick={() => handleUserAction(userAccount.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Suspend"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(userAccount.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(userAccount.id, 'block')}
                          className="text-red-600 hover:text-red-900"
                          title="Block"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(userAccount.id, 'add_restriction')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Add Restriction"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(userAccount.id, userAccount.twoFactorEnabled ? 'disable_2fa' : 'enable_2fa')}
                          className="text-blue-600 hover:text-blue-900"
                          title={userAccount.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        >
                          <Shield className="h-4 w-4" />
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

      {selectedTab === 'bulk' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h2>
          
          {selectedUsers.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-blue-900">
                      {selectedUsers.length} users selected
                    </h3>
                    <p className="text-sm text-blue-600">
                      Choose an action to apply to all selected users
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Action
                  </label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an action...</option>
                    <option value="suspend">Suspend Users</option>
                    <option value="activate">Activate Users</option>
                    <option value="block">Block Users</option>
                    <option value="enable_2fa">Enable 2FA</option>
                    <option value="disable_2fa">Disable 2FA</option>
                    <option value="reset_password">Reset Passwords</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply to {selectedUsers.length} users
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Users:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <span key={userId} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {user.userName}
                        <button
                          onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users selected</h3>
              <p className="text-gray-600">
                Go to the User Management tab and select users to perform bulk actions
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'automation' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Automated Rules</h2>
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
          </div>

          <div className="space-y-4">
            {automatedRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <h3 className="text-md font-medium text-gray-900">{rule.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Priority {rule.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Triggered {rule.triggerCount} times
                    </span>
                    <button
                      onClick={() => {
                        setAutomatedRules(prev => prev.map(r => 
                          r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                        ));
                        showSuccess(`Rule ${rule.enabled ? 'disabled' : 'enabled'}`);
                      }}
                      className={`px-3 py-1 text-xs rounded ${
                        rule.enabled 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Conditions:</div>
                    <ul className="space-y-1">
                      {rule.conditions.map((condition, index) => (
                        <li key={index} className="text-gray-600">
                          {condition.field} {condition.operator} {condition.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Actions:</div>
                    <ul className="space-y-1">
                      {rule.actions.map((action, index) => (
                        <li key={index} className="text-gray-600">
                          {action.type}: {JSON.stringify(action.parameters)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {rule.lastTriggered && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last triggered: {formatTimeAgo(rule.lastTriggered)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restriction Modal */}
      {showRestrictionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Restriction for {selectedUser.userName}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const restriction = {
                type: formData.get('type') as UserRestriction['type'],
                description: formData.get('description') as string,
                value: formData.get('value') ? Number(formData.get('value')) : undefined,
                startDate: new Date().toISOString(),
                endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string).toISOString() : undefined,
                reason: formData.get('reason') as string,
                appliedBy: 'admin', // In a real app, this would be the current admin user
                status: 'active' as const
              };
              addRestriction(restriction);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restriction Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transaction_limit">Transaction Limit</option>
                    <option value="withdrawal_limit">Withdrawal Limit</option>
                    <option value="transfer_limit">Transfer Limit</option>
                    <option value="login_block">Login Block</option>
                    <option value="feature_disable">Feature Disable</option>
                    <option value="account_freeze">Account Freeze</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="Brief description of the restriction"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Value (if applicable)
                  </label>
                  <input
                    type="number"
                    name="value"
                    placeholder="e.g., 25000 for transaction limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    required
                    rows={3}
                    placeholder="Reason for applying this restriction"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestrictionModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Add Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserControlSystem;