import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/common/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import { realtimeService } from '../services/realtimeService';
import { 
  User, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileText,
  CreditCard,
  Building,
  Star,
  MessageCircle,
  Download,
  Send
} from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'under_review' | 'requires_documents';
  nationality: string;
  dateOfBirth?: string;
  occupation?: string;
  monthlyIncome?: number;
  documents?: {
    nid?: string;
    passport?: string;
    drivingLicense?: string;
    utilityBill?: string;
    salarySlip?: string;
  };
  riskScore?: number;
  creditScore?: number;
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    address: boolean;
    identity: boolean;
  };
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface ApprovalAction {
  id: string;
  userId: string;
  adminId: string;
  adminName: string;
  action: 'approved' | 'rejected' | 'under_review' | 'requested_documents' | 'note_added';
  timestamp: string;
  notes?: string;
  reason?: string;
}

const AdminApproval: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotifications();
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'under_review' | 'requires_documents'>('pending_approval');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sortBy, setSortBy] = useState<'registrationDate' | 'name' | 'riskScore'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'under_review'>('approve');
  const [bulkReason, setBulkReason] = useState('');

  // Check admin authentication
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  // API base URL
  const API_BASE_URL = 'http://localhost:3000';

  // Load pending users from API
  useEffect(() => {
    const loadPendingUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/users/pending?status=${statusFilter}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${currentPage}&limit=${itemsPerPage}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPendingUsers(data.data || []); // Changed from data.users to data.data
        
        // Load approval history
        const historyResponse = await fetch(`${API_BASE_URL}/api/admin/users/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setApprovalHistory(historyData.history || []);
        }
      } catch (error) {
        console.error('Error loading pending users:', error);
        showError('Failed to load pending users from server');
        
        // Fallback to localStorage if API fails
        try {
          const stored = localStorage.getItem('pendingUsers');
          if (stored) {
            const users = JSON.parse(stored);
            setPendingUsers(users);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPendingUsers();
  }, [showError, statusFilter, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadPendingUsers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  // Real-time WebSocket subscriptions
  useEffect(() => {
    const unsubscribeRegistrations = realtimeService.subscribeToUserRegistrations((data) => {
      console.log('New user registration:', data);
      showSuccess(`New user registration: ${data.name || 'Unknown'}`);
      // Refresh the pending users list
      loadPendingUsers();
    });

    const unsubscribeApprovals = realtimeService.subscribeToUserApprovals((data) => {
      console.log('User approved:', data);
      showSuccess(`User ${data.name || 'Unknown'} has been approved`);
      // Refresh the pending users list
      loadPendingUsers();
    });

    const unsubscribeRejections = realtimeService.subscribeToUserRejections((data) => {
      console.log('User rejected:', data);
      showWarning(`User ${data.name || 'Unknown'} has been rejected`);
      // Refresh the pending users list
      loadPendingUsers();
    });

    return () => {
      unsubscribeRegistrations();
      unsubscribeApprovals();
      unsubscribeRejections();
    };
  }, [showSuccess, showWarning]);

  const loadPendingUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/pending?status=${statusFilter}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${currentPage}&limit=${itemsPerPage}`);
      
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error refreshing pending users:', error);
    }
  };

  // Filter and sort users (now handled by API, but keeping for client-side filtering)
  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'registrationDate':
        aValue = new Date(a.registrationDate).getTime();
        bValue = new Date(b.registrationDate).getTime();
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'riskScore':
        aValue = a.riskScore || 0;
        bValue = b.riskScore || 0;
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

  const approveUser = async (userId: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user?.id || adminUser?.id,
          adminName: user?.name || adminUser?.name || 'Admin User',
          notes: notes || approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local state
      setPendingUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'approved' as const } : u
      ));

      // Emit real-time event
      const approvedUser = pendingUsers.find(u => u.id === userId);
      if (approvedUser) {
        realtimeService.emitUserApproval(userId, {
          name: approvedUser.name,
          email: approvedUser.email,
          accountNumber: data.accountNumber,
          approvedBy: user?.name || adminUser?.name || 'Admin User',
          notes: notes || approvalNotes
        });
      }

      // Refresh data from server
      await loadPendingUsers();

      showSuccess(`User has been approved successfully! Account number: ${data.accountNumber}`);
      setApprovalNotes('');
      setShowDetailModal(false);

      // Log the approval
      log.auth(
        `User approved by ${user?.name || 'Admin'}`,
        {
          userId,
          adminId: user?.id,
          accountNumber: data.accountNumber,
          notes: notes || approvalNotes
        }
      );

    } catch (error) {
      const appError = handleError(error, 'AdminApproval');
      log.error('Error approving user', appError, 'AdminApproval');
      showError('Failed to approve user');
    }
  };

  const rejectUser = async (userId: string, reason: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user?.id || adminUser?.id,
          adminName: user?.name || adminUser?.name || 'Admin User',
          reason,
          notes: notes || approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setPendingUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'rejected' as const, rejectionReason: reason } : u
      ));

      // Emit real-time event
      const rejectedUser = pendingUsers.find(u => u.id === userId);
      if (rejectedUser) {
        realtimeService.emitUserRejection(userId, {
          name: rejectedUser.name,
          email: rejectedUser.email,
          reason,
          rejectedBy: user?.name || adminUser?.name || 'Admin User',
          notes: notes || approvalNotes
        });
      }

      // Refresh data from server
      await loadPendingUsers();

      showSuccess('User has been rejected successfully');
      setRejectionReason('');
      setApprovalNotes('');
      setShowDetailModal(false);

      // Log the rejection
      log.auth(
        `User rejected by ${user?.name || 'Admin'}`,
        {
          userId,
          adminId: user?.id,
          reason,
          notes: notes || approvalNotes
        }
      );

    } catch (error) {
      const appError = handleError(error, 'AdminApproval');
      log.error('Error rejecting user', appError, 'AdminApproval');
      showError('Failed to reject user');
    }
  };

  // Bulk operations
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const currentPageUserIds = paginatedUsers.map(u => u.id);
    const allSelected = currentPageUserIds.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !currentPageUserIds.includes(id)));
    } else {
      setSelectedUsers(prev => Array.from(new Set([...prev, ...currentPageUserIds])));
    }
  };

  const executeBulkAction = async () => {
    try {
      // Execute bulk actions via API
      const promises = selectedUsers.map(async (userId) => {
        if (bulkAction === 'approve') {
          return approveUser(userId, bulkReason);
        } else if (bulkAction === 'reject') {
          return rejectUser(userId, bulkReason);
        } else {
          return updateUserStatus(userId, 'under_review', bulkReason);
        }
      });

      await Promise.all(promises);

      showSuccess(`${selectedUsers.length} users ${bulkAction === 'approve' ? 'approved' : bulkAction === 'reject' ? 'rejected' : 'marked under review'} successfully`);
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkReason('');
      
      // Refresh data from server
      await loadPendingUsers();
    } catch (error) {
      showError('Failed to execute bulk action');
    }
  };

  const updateUserStatus = async (userId: string, newStatus: PendingUser['status'], notes?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminId: user?.id || adminUser?.id,
          adminName: user?.name || adminUser?.name || 'Admin User',
          notes: notes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setPendingUsers(prev => prev.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: newStatus,
              reviewedBy: user?.id || adminUser?.id,
              reviewedAt: new Date().toISOString(),
              notes: notes || u.notes
            }
          : u
      ));

      // Refresh data from server
      await loadPendingUsers();

      showSuccess(`User status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Failed to update user status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'requires_documents':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      case 'requires_documents':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getVerificationProgress = (verificationStatus: any) => {
    if (!verificationStatus) return 0;
    const total = Object.keys(verificationStatus).length;
    const verified = Object.values(verificationStatus).filter(Boolean).length;
    return Math.round((verified / total) * 100);
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
            <h1 className="text-2xl font-bold text-gray-900">User Registration Approval</h1>
            <p className="text-gray-600">Review and approve new user registrations with comprehensive verification</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingUsers.filter(u => u.status === 'pending_approval').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pendingUsers.filter(u => u.status === 'under_review').length}
              </div>
              <div className="text-sm text-gray-500">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pendingUsers.filter(u => u.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <option value="pending_approval">Pending Approval</option>
            <option value="under_review">Under Review</option>
            <option value="requires_documents">Requires Documents</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
            <option value="riskScore-desc">Highest Risk</option>
            <option value="riskScore-asc">Lowest Risk</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            {filteredUsers.length} of {pendingUsers.length} users
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Bulk Actions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((pendingUser) => (
                <tr key={pendingUser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(pendingUser.id)}
                      onChange={() => handleSelectUser(pendingUser.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{pendingUser.name}</div>
                        <div className="text-sm text-gray-500">{pendingUser.email}</div>
                        <div className="text-xs text-gray-400">{pendingUser.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium ${getRiskColor(pendingUser.riskScore || 0)}`}>
                        Risk: {pendingUser.riskScore || 0}%
                      </div>
                      <div className="text-gray-500">
                        Credit: {pendingUser.creditScore || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {getVerificationProgress(pendingUser.verificationStatus)}% Complete
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${getVerificationProgress(pendingUser.verificationStatus)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(pendingUser.status)}`}>
                      {getStatusIcon(pendingUser.status)}
                      <span className="ml-1 capitalize">{pendingUser.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(pendingUser.registrationDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(pendingUser.registrationDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(pendingUser);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        Review
                      </button>
                      {pendingUser.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => approveUser(pendingUser.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4 inline mr-1" />
                            Quick Approve
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
                User Registration Review - {selectedUser.name}
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

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                      <div className={`text-2xl font-bold ${getRiskColor(selectedUser.riskScore || 0)}`}>
                        {selectedUser.riskScore || 0}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Credit Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.creditScore || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Verification Status
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.verificationStatus && Object.entries(selectedUser.verificationStatus).map(([key, verified]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {['nid', 'passport', 'drivingLicense', 'utilityBill', 'salarySlip'].map((doc) => (
                      <div key={doc} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedUser.documents?.[doc as keyof typeof selectedUser.documents] 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.documents?.[doc as keyof typeof selectedUser.documents] ? 'Uploaded' : 'Not Uploaded'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Status</h4>
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-2 capitalize">{selectedUser.status.replace('_', ' ')}</span>
                  </span>
                  <div className="mt-2 text-xs text-gray-600">
                    Registered: {formatTimeAgo(selectedUser.registrationDate)}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add notes about this user..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                {selectedUser.status === 'pending_approval' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => approveUser(selectedUser.id, approvalNotes)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve User
                    </button>
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'under_review', approvalNotes)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'requires_documents', approvalNotes)}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Request Documents
                    </button>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => rejectUser(selectedUser.id, rejectionReason, approvalNotes)}
                        disabled={!rejectionReason}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject User
                      </button>
                    </div>
                  </div>
                )}

                {/* Approval History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Action History</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {approvalHistory
                      .filter(action => action.userId === selectedUser.id)
                      .map((action) => (
                        <div key={action.id} className="text-xs bg-white p-2 rounded border">
                          <div className="font-medium">{action.adminName}</div>
                          <div className="text-gray-600">{action.action} - {new Date(action.timestamp).toLocaleString()}</div>
                          {action.notes && <div className="text-gray-500 mt-1">{action.notes}</div>}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Action - {selectedUsers.length} Users
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as typeof bulkAction)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approve">Approve Users</option>
                  <option value="reject">Reject Users</option>
                  <option value="under_review">Mark Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {bulkAction === 'reject' ? 'Rejection Reason' : 'Notes'}
                </label>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder={bulkAction === 'reject' ? 'Enter reason for rejection...' : 'Enter notes...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    This action will {bulkAction} {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}. 
                    This action cannot be undone.
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkAction}
                  disabled={bulkAction === 'reject' && !bulkReason}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    bulkAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {bulkAction === 'approve' ? 'Approve All' :
                   bulkAction === 'reject' ? 'Reject All' :
                   'Mark All Under Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;