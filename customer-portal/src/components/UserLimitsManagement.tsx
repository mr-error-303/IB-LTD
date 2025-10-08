import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  X, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Globe,
  User,
  Crown,
  Star,
  Zap
} from 'lucide-react';

interface UserLimit {
  id: string;
  userId: string;
  userName: string;
  email: string;
  userTier: 'basic' | 'premium' | 'vip' | 'corporate';
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  customLimits: {
    transfers: number;
    billPayments: number;
    mobileTopup: number;
    cashWithdrawal: number;
  };
  status: 'active' | 'restricted' | 'suspended';
  lastUpdated: string;
}

interface CategoryLimit {
  id: string;
  category: 'basic' | 'premium' | 'vip' | 'corporate';
  displayName: string;
  description: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  serviceLimits: {
    transfers: number;
    billPayments: number;
    mobileTopup: number;
    cashWithdrawal: number;
  };
  userCount: number;
  enabled: boolean;
}

interface TemporaryRestriction {
  id: string;
  userId: string;
  userName: string;
  restrictionType: 'partial' | 'full' | 'service-specific';
  services: string[];
  reason: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  status: 'active' | 'expired' | 'cancelled';
}

interface GeographicRestriction {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city';
  location: string;
  restrictionLevel: 'blocked' | 'limited' | 'monitored';
  affectedServices: string[];
  reason: string;
  userCount: number;
  enabled: boolean;
}

const UserLimitsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showAddRestriction, setShowAddRestriction] = useState(false);

  // Individual User Limits State
  const [userLimits, setUserLimits] = useState<UserLimit[]>([
    {
      id: '1',
      userId: 'USR001',
      userName: 'John Doe',
      email: 'john.doe@email.com',
      userTier: 'premium',
      dailyLimit: 100000,
      monthlyLimit: 2000000,
      singleTransactionLimit: 50000,
      customLimits: {
        transfers: 75000,
        billPayments: 150000,
        mobileTopup: 10000,
        cashWithdrawal: 25000
      },
      status: 'active',
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'USR002',
      userName: 'Jane Smith',
      email: 'jane.smith@email.com',
      userTier: 'vip',
      dailyLimit: 500000,
      monthlyLimit: 10000000,
      singleTransactionLimit: 250000,
      customLimits: {
        transfers: 400000,
        billPayments: 500000,
        mobileTopup: 50000,
        cashWithdrawal: 100000
      },
      status: 'active',
      lastUpdated: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      userId: 'USR003',
      userName: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      userTier: 'basic',
      dailyLimit: 25000,
      monthlyLimit: 500000,
      singleTransactionLimit: 15000,
      customLimits: {
        transfers: 20000,
        billPayments: 30000,
        mobileTopup: 5000,
        cashWithdrawal: 10000
      },
      status: 'restricted',
      lastUpdated: '2024-01-13T09:20:00Z'
    }
  ]);

  // Category Limits State
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>([
    {
      id: '1',
      category: 'basic',
      displayName: 'Basic Tier',
      description: 'Standard banking services with basic limits',
      dailyLimit: 50000,
      monthlyLimit: 1000000,
      singleTransactionLimit: 25000,
      serviceLimits: {
        transfers: 30000,
        billPayments: 50000,
        mobileTopup: 5000,
        cashWithdrawal: 15000
      },
      userCount: 1250,
      enabled: true
    },
    {
      id: '2',
      category: 'premium',
      displayName: 'Premium Tier',
      description: 'Enhanced services with increased limits',
      dailyLimit: 200000,
      monthlyLimit: 4000000,
      singleTransactionLimit: 100000,
      serviceLimits: {
        transfers: 150000,
        billPayments: 200000,
        mobileTopup: 20000,
        cashWithdrawal: 50000
      },
      userCount: 850,
      enabled: true
    },
    {
      id: '3',
      category: 'vip',
      displayName: 'VIP Tier',
      description: 'Premium services with high limits',
      dailyLimit: 1000000,
      monthlyLimit: 20000000,
      singleTransactionLimit: 500000,
      serviceLimits: {
        transfers: 750000,
        billPayments: 1000000,
        mobileTopup: 100000,
        cashWithdrawal: 200000
      },
      userCount: 125,
      enabled: true
    },
    {
      id: '4',
      category: 'corporate',
      displayName: 'Corporate Tier',
      description: 'Business accounts with enterprise limits',
      dailyLimit: 5000000,
      monthlyLimit: 100000000,
      singleTransactionLimit: 2000000,
      serviceLimits: {
        transfers: 3000000,
        billPayments: 5000000,
        mobileTopup: 500000,
        cashWithdrawal: 1000000
      },
      userCount: 75,
      enabled: true
    }
  ]);

  // Temporary Restrictions State
  const [temporaryRestrictions, setTemporaryRestrictions] = useState<TemporaryRestriction[]>([
    {
      id: '1',
      userId: 'USR003',
      userName: 'Mike Johnson',
      restrictionType: 'partial',
      services: ['transfers', 'cashWithdrawal'],
      reason: 'Suspicious activity detected',
      startDate: '2024-01-10T00:00:00Z',
      endDate: '2024-01-20T23:59:59Z',
      createdBy: 'admin@bank.com',
      status: 'active'
    },
    {
      id: '2',
      userId: 'USR004',
      userName: 'Sarah Wilson',
      restrictionType: 'service-specific',
      services: ['mobileTopup'],
      reason: 'Account verification pending',
      startDate: '2024-01-12T00:00:00Z',
      endDate: '2024-01-25T23:59:59Z',
      createdBy: 'admin@bank.com',
      status: 'active'
    },
    {
      id: '3',
      userId: 'USR005',
      userName: 'David Brown',
      restrictionType: 'full',
      services: ['all'],
      reason: 'Compliance review',
      startDate: '2024-01-05T00:00:00Z',
      endDate: '2024-01-15T23:59:59Z',
      createdBy: 'compliance@bank.com',
      status: 'expired'
    }
  ]);

  // Geographic Restrictions State
  const [geographicRestrictions, setGeographicRestrictions] = useState<GeographicRestriction[]>([
    {
      id: '1',
      name: 'High-Risk Countries',
      type: 'country',
      location: 'Multiple Countries',
      restrictionLevel: 'blocked',
      affectedServices: ['transfers', 'billPayments'],
      reason: 'Regulatory compliance',
      userCount: 0,
      enabled: true
    },
    {
      id: '2',
      name: 'Border Regions',
      type: 'region',
      location: 'Northern Border States',
      restrictionLevel: 'limited',
      affectedServices: ['cashWithdrawal'],
      reason: 'Security concerns',
      userCount: 45,
      enabled: true
    },
    {
      id: '3',
      name: 'Lagos Island',
      type: 'city',
      location: 'Lagos Island, Lagos',
      restrictionLevel: 'monitored',
      affectedServices: ['transfers', 'mobileTopup'],
      reason: 'Enhanced monitoring',
      userCount: 230,
      enabled: true
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <User className="w-4 h-4" />;
      case 'premium': return <Star className="w-4 h-4" />;
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'corporate': return <Zap className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'corporate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUserLimits = userLimits.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.userTier === filterTier;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const renderIndividualLimits = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Tiers</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
          <option value="corporate">Corporate</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* User Limits Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
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
              {filteredUserLimits.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.userTier)}`}>
                      {getTierIcon(user.userTier)}
                      {user.userTier.charAt(0).toUpperCase() + user.userTier.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.dailyLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.monthlyLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'restricted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategoryLimits = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {categoryLimits.map((category) => (
          <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTierColor(category.category)}`}>
                  {getTierIcon(category.category)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.displayName}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{category.userCount} users in this tier</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  category.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.enabled ? 'Active' : 'Disabled'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Daily Limit</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(category.dailyLimit)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Monthly Limit</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(category.monthlyLimit)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Single Transaction</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(category.singleTransactionLimit)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Service-Specific Limits</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-600">Transfers</div>
                  <div className="font-semibold text-blue-900">{formatCurrency(category.serviceLimits.transfers)}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xs text-gray-600">Bill Payments</div>
                  <div className="font-semibold text-green-900">{formatCurrency(category.serviceLimits.billPayments)}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xs text-gray-600">Mobile Top-up</div>
                  <div className="font-semibold text-purple-900">{formatCurrency(category.serviceLimits.mobileTopup)}</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xs text-gray-600">Cash Withdrawal</div>
                  <div className="font-semibold text-orange-900">{formatCurrency(category.serviceLimits.cashWithdrawal)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemporaryRestrictions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Temporary Restrictions</h3>
        <button
          onClick={() => setShowAddRestriction(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Add Restriction
        </button>
      </div>

      <div className="grid gap-4">
        {temporaryRestrictions.map((restriction) => (
          <div key={restriction.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{restriction.userName}</h4>
                <p className="text-sm text-gray-500">User ID: {restriction.userId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  restriction.status === 'active' ? 'bg-red-100 text-red-800' :
                  restriction.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {restriction.status}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Restriction Type</div>
                <div className="text-sm text-gray-900 capitalize">{restriction.restrictionType.replace('-', ' ')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Affected Services</div>
                <div className="text-sm text-gray-900">
                  {restriction.services.length === 1 && restriction.services[0] === 'all' 
                    ? 'All Services' 
                    : restriction.services.join(', ')
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Start Date</div>
                <div className="text-sm text-gray-900">
                  {new Date(restriction.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">End Date</div>
                <div className="text-sm text-gray-900">
                  {new Date(restriction.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Reason</div>
              <div className="text-sm text-gray-900">{restriction.reason}</div>
              <div className="text-xs text-gray-500 mt-2">Created by: {restriction.createdBy}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGeographicRestrictions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Geographic Restrictions</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Geographic Rule
        </button>
      </div>

      <div className="grid gap-6">
        {geographicRestrictions.map((restriction) => (
          <div key={restriction.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  restriction.restrictionLevel === 'blocked' ? 'bg-red-100 text-red-600' :
                  restriction.restrictionLevel === 'limited' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{restriction.name}</h4>
                  <p className="text-sm text-gray-500">{restriction.location}</p>
                  <p className="text-xs text-gray-400 capitalize">{restriction.type} restriction</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  restriction.restrictionLevel === 'blocked' ? 'bg-red-100 text-red-800' :
                  restriction.restrictionLevel === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {restriction.restrictionLevel}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  restriction.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {restriction.enabled ? 'Active' : 'Disabled'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Affected Services</div>
                <div className="text-sm text-gray-900">{restriction.affectedServices.join(', ')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Affected Users</div>
                <div className="text-sm text-gray-900">{restriction.userCount} users</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Restriction Level</div>
                <div className="text-sm text-gray-900 capitalize">{restriction.restrictionLevel}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Reason</div>
              <div className="text-sm text-gray-900">{restriction.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            User Limits Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage individual user limits, category settings, and restrictions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'individual', label: 'Individual Limits', icon: User },
              { id: 'category', label: 'Category Limits', icon: Users },
              { id: 'restrictions', label: 'Temporary Restrictions', icon: Clock },
              { id: 'geographic', label: 'Geographic Controls', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'individual' && renderIndividualLimits()}
          {activeTab === 'category' && renderCategoryLimits()}
          {activeTab === 'restrictions' && renderTemporaryRestrictions()}
          {activeTab === 'geographic' && renderGeographicRestrictions()}
        </div>
      </div>
    </div>
  );
};

export default UserLimitsManagement;