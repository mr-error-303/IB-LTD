import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/common/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import TransactionHistory from './TransactionHistory';
import { 
  User, 
  Search, 
  Filter, 
  Edit3, 
  Lock, 
  Unlock, 
  DollarSign, 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Settings, 
  Activity, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Clock, 
  FileText, 
  Download, 
  Upload,
  MoreVertical,
  Ban,
  UserCheck,
  UserX,
  Wallet,
  History
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  dateOfBirth?: string;
  occupation?: string;
  monthlyIncome?: number;
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended' | 'closed' | 'pending_approval' | 'under_review';
  accountType: 'savings' | 'current' | 'premium' | 'business';
  registrationDate: string;
  lastLoginDate?: string;
  lastTransactionDate?: string;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  creditScore?: number;
  riskScore?: number;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  twoFactorEnabled: boolean;
  cards: Array<{
    id: string;
    type: 'debit' | 'credit';
    number: string;
    status: 'active' | 'blocked' | 'expired';
    expiryDate: string;
  }>;
  accounts: Array<{
    id: string;
    type: string;
    accountNumber: string;
    balance: number;
    status: string;
    openedDate: string;
  }>;
  notes?: string;
  tags?: string[];
}

interface BalanceAdjustment {
  id: string;
  userId: string;
  adminId: string;
  adminName: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
  reference?: string;
}

const UserManagement: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotifications();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [balanceAdjustments, setBalanceAdjustments] = useState<BalanceAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccount['status']>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | UserAccount['accountType']>('all');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactionHistoryUser, setTransactionHistoryUser] = useState<UserAccount | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetReason, setPasswordResetReason] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [newStatus, setNewStatus] = useState<UserAccount['status']>('active');
  const [statusReason, setStatusReason] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'registrationDate' | 'lastLoginDate'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);

  // Check admin authentication
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  // Load users from localStorage
  useEffect(() => {
    const loadUsers = () => {
      try {
        // Load approved users
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        
        // Load pending users
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        
        // Combine and enhance users with additional fields
        const allUsers = [...approvedUsers, ...pendingUsers].map((user: any) => ({
          ...user,
          totalTransactions: user.totalTransactions || Math.floor(Math.random() * 100),
          totalDeposits: user.totalDeposits || Math.floor(Math.random() * 500000),
          totalWithdrawals: user.totalWithdrawals || Math.floor(Math.random() * 400000),
          creditScore: user.creditScore || Math.floor(Math.random() * 850) + 300,
          riskScore: user.riskScore || Math.floor(Math.random() * 100),
          kycStatus: user.kycStatus || (Math.random() > 0.7 ? 'verified' : 'pending'),
          twoFactorEnabled: user.twoFactorEnabled || Math.random() > 0.5,
          lastLoginDate: user.lastLoginDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastTransactionDate: user.lastTransactionDate || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          accountType: user.accountType || 'savings',
          cards: user.cards || [],
          accounts: user.accounts || [],
          tags: user.tags || [],
          dateOfBirth: user.dateOfBirth || '1990-01-01',
          occupation: user.occupation || 'Software Engineer',
          monthlyIncome: user.monthlyIncome || Math.floor(Math.random() * 100000) + 30000
        }));

        setUsers(allUsers);

        // Load balance adjustments
        const adjustments = JSON.parse(localStorage.getItem('balanceAdjustments') || '[]');
        setBalanceAdjustments(adjustments);

      } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [showError]);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.accountNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesAccountType = accountTypeFilter === 'all' || user.accountType === accountTypeFilter;
    const matchesActivity = showInactiveUsers || user.status !== 'inactive';
    
    return matchesSearch && matchesStatus && matchesAccountType && matchesActivity;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'balance':
        aValue = a.balance || 0;
        bValue = b.balance || 0;
        break;
      case 'registrationDate':
        aValue = new Date(a.registrationDate).getTime();
        bValue = new Date(b.registrationDate).getTime();
        break;
      case 'lastLoginDate':
        aValue = new Date(a.lastLoginDate || 0).getTime();
        bValue = new Date(b.lastLoginDate || 0).getTime();
        break;
      default:
        aValue = a.registrationDate;
        bValue = b.registrationDate;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const adjustBalance = async () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const amount = parseFloat(adjustmentAmount);
      if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount');
        return;
      }

      const previousBalance = selectedUser.balance;
      const newBalance = adjustmentType === 'credit' 
        ? previousBalance + amount 
        : previousBalance - amount;

      if (newBalance < 0) {
        showError('Insufficient balance for debit adjustment');
        return;
      }

      // Update user balance
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, balance: newBalance }
          : u
      );
      setUsers(updatedUsers);

      // Update localStorage
      const activeUsers = updatedUsers.filter(u => u.status === 'active');
      localStorage.setItem('approvedUsers', JSON.stringify(activeUsers));

      // Create balance adjustment record
      const adjustment: BalanceAdjustment = {
        id: `ADJ${Date.now()}`,
        userId: selectedUser.id,
        adminId: user?.id || adminUser?.id,
        adminName: user?.name || adminUser?.name || 'Admin User',
        type: adjustmentType,
        amount,
        reason: adjustmentReason,
        timestamp: new Date().toISOString(),
        previousBalance,
        newBalance,
        reference: `REF${Date.now()}`
      };

      const updatedAdjustments = [adjustment, ...balanceAdjustments];
      setBalanceAdjustments(updatedAdjustments);
      localStorage.setItem('balanceAdjustments', JSON.stringify(updatedAdjustments));

      // Log the adjustment
      log.transaction(
        `Balance ${adjustmentType} of ৳${amount} for user ${selectedUser.name}`,
        {
          userId: selectedUser.id,
          adminId: user?.id,
          amount,
          type: adjustmentType,
          reason: adjustmentReason,
          previousBalance,
          newBalance
        }
      );

      showSuccess(`Balance ${adjustmentType} of ৳${amount.toLocaleString()} completed successfully`);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      setShowBalanceModal(false);
      setSelectedUser({ ...selectedUser, balance: newBalance });

    } catch (error) {
      const appError = handleError(error, 'UserManagement');
      log.error('Error adjusting balance', appError, 'UserManagement');
      showError('Failed to adjust balance');
    }
  };

  const updateUserStatus = async () => {
    if (!selectedUser || !statusReason) {
      showError('Please provide a reason for status change');
      return;
    }

    try {
      // Update user status
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              status: newStatus,
              notes: `${u.notes || ''}\n[${new Date().toLocaleString()}] Status changed to ${newStatus}: ${statusReason}`.trim()
            }
          : u
      );
      setUsers(updatedUsers);

      // Update localStorage
      const activeUsers = updatedUsers.filter(u => u.status === 'active');
      const nonActiveUsers = updatedUsers.filter(u => u.status !== 'active');
      localStorage.setItem('approvedUsers', JSON.stringify(activeUsers));
      localStorage.setItem('pendingUsers', JSON.stringify(nonActiveUsers));

      // Log the status change
      log.auth(
        `User ${selectedUser.name} status changed to ${newStatus}`,
        {
          userId: selectedUser.id,
          adminId: user?.id,
          oldStatus: selectedUser.status,
          newStatus,
          reason: statusReason
        }
      );

      showSuccess(`User status updated to ${newStatus}`);
      setStatusReason('');
      setShowStatusModal(false);
      setSelectedUser({ ...selectedUser, status: newStatus });

    } catch (error) {
      const appError = handleError(error, 'UserManagement');
      log.error('Error updating user status', appError, 'UserManagement');
      showError('Failed to update user status');
    }
  };

  const updateUserProfile = async () => {
    if (!editingUser) {
      showError('No user selected for editing');
      return;
    }

    try {
      // Validate required fields
      if (!editingUser.name || !editingUser.email || !editingUser.phone) {
        showError('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingUser.email)) {
        showError('Please enter a valid email address');
        return;
      }

      // Check for duplicate email (excluding current user)
      const duplicateEmail = users.find(u => u.id !== editingUser.id && u.email === editingUser.email);
      if (duplicateEmail) {
        showError('Email address is already in use by another user');
        return;
      }

      // Update user in the users array
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? editingUser : u
      );
      setUsers(updatedUsers);

      // Update localStorage
      const activeUsers = updatedUsers.filter(u => u.status === 'active');
      const nonActiveUsers = updatedUsers.filter(u => u.status !== 'active');
      localStorage.setItem('approvedUsers', JSON.stringify(activeUsers));
      localStorage.setItem('pendingUsers', JSON.stringify(nonActiveUsers));

      // Log the profile update
      log.auth(
        `User profile updated for ${editingUser.name}`,
        {
          userId: editingUser.id,
          adminId: user?.id || adminUser?.id,
          updatedFields: ['name', 'email', 'phone', 'address', 'occupation', 'monthlyIncome']
        }
      );

      showSuccess('User profile updated successfully');
      setShowEditModal(false);
      setEditingUser(null);

      // Update selected user if it's the same user
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser(editingUser);
      }

    } catch (error) {
      const appError = handleError(error, 'UserManagement');
      log.error('Error updating user profile', appError, 'UserManagement');
      showError('Failed to update user profile');
    }
  };

  const resetUserPassword = async () => {
    if (!passwordResetUser) {
      showError('No user selected for password reset');
      return;
    }

    try {
      // Validate password requirements
      if (!newPassword || newPassword.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
      }

      if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }

      if (!passwordResetReason.trim()) {
        showError('Please provide a reason for password reset');
        return;
      }

      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        showError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return;
      }

      // In a real application, this would make an API call to reset the password
      // For now, we'll simulate the password reset and log the action

      // Log the password reset action
      log.auth(
        `Password reset initiated for user ${passwordResetUser.name}`,
        {
          userId: passwordResetUser.id,
          adminId: user?.id || adminUser?.id,
          adminName: user?.name || adminUser?.name,
          reason: passwordResetReason,
          timestamp: new Date().toISOString()
        }
      );

      // Store password reset record (in real app, this would be in database)
      const passwordResetRecord = {
        id: `PWD_RESET_${Date.now()}`,
        userId: passwordResetUser.id,
        userName: passwordResetUser.name,
        adminId: user?.id || adminUser?.id,
        adminName: user?.name || adminUser?.name,
        reason: passwordResetReason,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Get existing password reset records
      const existingResets = JSON.parse(localStorage.getItem('passwordResets') || '[]');
      existingResets.push(passwordResetRecord);
      localStorage.setItem('passwordResets', JSON.stringify(existingResets));

      showSuccess(`Password reset successfully for ${passwordResetUser.name}. User will be notified via email.`);
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      setPasswordResetReason('');
      setShowPasswordResetModal(false);
      setPasswordResetUser(null);

    } catch (error) {
      const appError = handleError(error, 'UserManagement');
      log.error('Error resetting user password', appError, 'UserManagement');
      showError('Failed to reset user password');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'inactive':
        return <UserX className="h-4 w-4" />;
      case 'suspended':
        return <Ban className="h-4 w-4" />;
      case 'closed':
        return <X className="h-4 w-4" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'savings':
        return 'bg-blue-100 text-blue-800';
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser || !isAdminAuthenticated || adminUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Comprehensive user account control and monitoring</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ৳{users.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending_approval">Pending</option>
            <option value="under_review">Under Review</option>
          </select>
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Account Types</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="registrationDate-desc">Newest First</option>
            <option value="registrationDate-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="balance-desc">Highest Balance</option>
            <option value="balance-asc">Lowest Balance</option>
            <option value="lastLoginDate-desc">Recent Login</option>
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactiveUsers}
              onChange={(e) => setShowInactiveUsers(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showInactive" className="text-sm text-gray-600">
              Show Inactive
            </label>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance & Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk & Security
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
              {paginatedUsers.map((userAccount) => (
                <tr key={userAccount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{userAccount.name}</div>
                        <div className="text-sm text-gray-500">{userAccount.email}</div>
                        <div className="text-xs text-gray-400">{userAccount.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{userAccount.accountNumber}</div>
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full ${getAccountTypeColor(userAccount.accountType)}`}>
                        {userAccount.accountType.charAt(0).toUpperCase() + userAccount.accountType.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(userAccount.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">৳{userAccount.balance?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-500">
                        {userAccount.totalTransactions} transactions
                      </div>
                      <div className="text-xs text-gray-400">
                        Last login: {userAccount.lastLoginDate ? formatTimeAgo(userAccount.lastLoginDate) : 'Never'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium ${getRiskColor(userAccount.riskScore || 0)}`}>
                        Risk: {userAccount.riskScore || 0}%
                      </div>
                      <div className="text-gray-500">
                        Credit: {userAccount.creditScore || 0}
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
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userAccount.status)}`}>
                      {getStatusIcon(userAccount.status)}
                      <span className="ml-1 capitalize">{userAccount.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(userAccount);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser({ ...userAccount });
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        <Edit3 className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(userAccount);
                          setShowBalanceModal(true);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <Wallet className="h-4 w-4 inline mr-1" />
                        Balance
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(userAccount);
                          setNewStatus(userAccount.status);
                          setShowStatusModal(true);
                        }}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 inline mr-1" />
                        Status
                      </button>
                      <button
                        onClick={() => {
                          setTransactionHistoryUser(userAccount);
                          setShowTransactionHistory(true);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                      >
                        <History className="h-4 w-4 inline mr-1" />
                        History
                      </button>
                      <button
                        onClick={() => {
                          setPasswordResetUser(userAccount);
                          setShowPasswordResetModal(true);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <Lock className="h-4 w-4 inline mr-1" />
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                User Profile - {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Full Name:</span> {selectedUser.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedUser.phone}</div>
                    <div><span className="font-medium">Nationality:</span> {selectedUser.nationality}</div>
                    <div><span className="font-medium">Date of Birth:</span> {selectedUser.dateOfBirth || 'Not provided'}</div>
                    <div><span className="font-medium">Occupation:</span> {selectedUser.occupation || 'Not provided'}</div>
                    <div className="col-span-2"><span className="font-medium">Address:</span> {selectedUser.address}</div>
                    <div><span className="font-medium">Monthly Income:</span> ৳{selectedUser.monthlyIncome?.toLocaleString() || 'Not provided'}</div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Account Number:</span> {selectedUser.accountNumber}</div>
                    <div><span className="font-medium">Account Type:</span> {selectedUser.accountType}</div>
                    <div><span className="font-medium">Current Balance:</span> ৳{selectedUser.balance?.toLocaleString() || '0'}</div>
                    <div><span className="font-medium">Registration Date:</span> {new Date(selectedUser.registrationDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Last Login:</span> {selectedUser.lastLoginDate ? new Date(selectedUser.lastLoginDate).toLocaleString() : 'Never'}</div>
                    <div><span className="font-medium">KYC Status:</span> {selectedUser.kycStatus}</div>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Transaction Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.totalTransactions}</div>
                      <div className="text-gray-500">Total Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">৳{selectedUser.totalDeposits?.toLocaleString() || '0'}</div>
                      <div className="text-gray-500">Total Deposits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">৳{selectedUser.totalWithdrawals?.toLocaleString() || '0'}</div>
                      <div className="text-gray-500">Total Withdrawals</div>
                    </div>
                  </div>
                </div>

                {/* Recent Balance Adjustments */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Recent Balance Adjustments
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {balanceAdjustments
                      .filter(adj => adj.userId === selectedUser.id)
                      .slice(0, 5)
                      .map((adjustment) => (
                        <div key={adjustment.id} className="text-xs bg-white p-2 rounded border">
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${adjustment.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {adjustment.type === 'credit' ? '+' : '-'}৳{adjustment.amount.toLocaleString()}
                            </span>
                            <span className="text-gray-500">{new Date(adjustment.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="text-gray-600 mt-1">{adjustment.reason}</div>
                          <div className="text-gray-500">By: {adjustment.adminName}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Status and Actions Panel */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Status</h4>
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-2 capitalize">{selectedUser.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                      <div className={`text-xl font-bold ${getRiskColor(selectedUser.riskScore || 0)}`}>
                        {selectedUser.riskScore || 0}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Credit Score</div>
                      <div className="text-xl font-bold text-blue-600">
                        {selectedUser.creditScore || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Security Settings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Two-Factor Authentication</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedUser.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>KYC Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedUser.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.kycStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowBalanceModal(true);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Adjust Balance
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setNewStatus(selectedUser.status);
                      setShowStatusModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Change Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Adjust Balance - {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <div className="text-2xl font-bold text-blue-600">
                  ৳{selectedUser.balance?.toLocaleString() || '0'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as 'credit' | 'debit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Deduct Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳)
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Enter reason for adjustment"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={adjustBalance}
                  disabled={!adjustmentAmount || !adjustmentReason}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adjustmentType === 'credit' ? 'Add Money' : 'Deduct Money'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Change Status - {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedUser.status)}`}>
                  {getStatusIcon(selectedUser.status)}
                  <span className="ml-1 capitalize">{selectedUser.status.replace('_', ' ')}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as UserAccount['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="closed">Closed</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for status change"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateUserStatus}
                  disabled={!statusReason || newStatus === selectedUser.status}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit User Profile - {editingUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editingUser.dateOfBirth || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editingUser.nationality}
                    onChange={(e) => setEditingUser({ ...editingUser, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter nationality"
                  />
                </div>
              </div>

              {/* Contact & Professional Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Contact & Professional</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={editingUser.occupation || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, occupation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter occupation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income (৳)
                  </label>
                  <input
                    type="number"
                    value={editingUser.monthlyIncome || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, monthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter monthly income"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={editingUser.accountType}
                    onChange={(e) => setEditingUser({ ...editingUser, accountType: e.target.value as UserAccount['accountType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="premium">Premium</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={editingUser.notes || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add admin notes..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateUserProfile}
                disabled={!editingUser.name || !editingUser.email || !editingUser.phone}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionHistory && transactionHistoryUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden">
            <TransactionHistory
              userId={transactionHistoryUser.id}
              userName={transactionHistoryUser.name}
              onClose={() => {
                setShowTransactionHistory(false);
                setTransactionHistoryUser(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && passwordResetUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setPasswordResetUser(null);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordResetReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Reset password for: {passwordResetUser.name}
                  </p>
                  <p className="text-xs text-yellow-700">
                    User will be notified via email and must change password on next login
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Reset *
                </label>
                <textarea
                  value={passwordResetReason}
                  onChange={(e) => setPasswordResetReason(e.target.value)}
                  rows={3}
                  placeholder="Provide reason for password reset..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setPasswordResetUser(null);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordResetReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetUserPassword}
                disabled={!newPassword || !confirmPassword || !passwordResetReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;