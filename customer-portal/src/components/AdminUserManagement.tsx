import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit, Trash2, Plus, Search, Filter, Eye, Lock, Unlock, UserCheck, AlertTriangle, CheckCircle, Clock, Settings, Key, Mail, Phone } from 'lucide-react';

// Interfaces for admin user management
interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'super_admin' | 'financial_admin' | 'support_admin' | 'compliance_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  department: string;
  avatar?: string;
}

interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AdminRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

const AdminUserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Mock data for admin users
  const [adminUsers] = useState<AdminUser[]>([
    {
      id: '1',
      username: 'superadmin',
      email: 'admin@iblimited.com',
      phone: '+1234567890',
      fullName: 'John Smith',
      role: 'super_admin',
      status: 'active',
      lastLogin: '2024-01-15T14:30:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      permissions: ['all'],
      department: 'IT Administration'
    },
    {
      id: '2',
      username: 'financialadmin',
      email: 'finance@iblimited.com',
      phone: '+1234567891',
      fullName: 'Sarah Johnson',
      role: 'financial_admin',
      status: 'active',
      lastLogin: '2024-01-15T13:45:00Z',
      createdAt: '2023-02-15T00:00:00Z',
      permissions: ['transactions', 'loans', 'financial_reports'],
      department: 'Finance'
    },
    {
      id: '3',
      username: 'supportadmin',
      email: 'support@iblimited.com',
      phone: '+1234567892',
      fullName: 'Mike Davis',
      role: 'support_admin',
      status: 'active',
      lastLogin: '2024-01-15T12:20:00Z',
      createdAt: '2023-03-10T00:00:00Z',
      permissions: ['user_management', 'customer_support'],
      department: 'Customer Support'
    },
    {
      id: '4',
      username: 'complianceadmin',
      email: 'compliance@iblimited.com',
      phone: '+1234567893',
      fullName: 'Lisa Wilson',
      role: 'compliance_admin',
      status: 'active',
      lastLogin: '2024-01-15T11:15:00Z',
      createdAt: '2023-04-20T00:00:00Z',
      permissions: ['reports', 'monitoring', 'compliance'],
      department: 'Compliance'
    },
    {
      id: '5',
      username: 'tempuser',
      email: 'temp@iblimited.com',
      phone: '+1234567894',
      fullName: 'Alex Brown',
      role: 'support_admin',
      status: 'suspended',
      lastLogin: '2024-01-10T09:30:00Z',
      createdAt: '2024-01-05T00:00:00Z',
      permissions: ['user_management'],
      department: 'Customer Support'
    }
  ]);

  // Mock data for admin roles
  const [adminRoles] = useState<AdminRole[]>([
    {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      color: 'red',
      icon: '👑'
    },
    {
      id: 'financial_admin',
      name: 'financial_admin',
      displayName: 'Financial Admin',
      description: 'Access to transactions, loans, and financial reports',
      permissions: ['transactions', 'loans', 'financial_reports', 'payment_processing'],
      color: 'green',
      icon: '💰'
    },
    {
      id: 'support_admin',
      name: 'support_admin',
      displayName: 'Support Admin',
      description: 'User management and customer support functions',
      permissions: ['user_management', 'customer_support', 'ticket_management'],
      color: 'blue',
      icon: '🎧'
    },
    {
      id: 'compliance_admin',
      name: 'compliance_admin',
      displayName: 'Compliance Admin',
      description: 'Reports, monitoring, and compliance oversight',
      permissions: ['reports', 'monitoring', 'compliance', 'audit_trail'],
      color: 'purple',
      icon: '📋'
    }
  ]);

  // Mock data for permissions
  const [permissions] = useState<RolePermission[]>([
    { id: 'all', name: 'All Permissions', description: 'Complete system access', category: 'System' },
    { id: 'transactions', name: 'Transaction Management', description: 'View and manage transactions', category: 'Financial' },
    { id: 'loans', name: 'Loan Management', description: 'Manage loan applications and approvals', category: 'Financial' },
    { id: 'financial_reports', name: 'Financial Reports', description: 'Access financial reporting', category: 'Financial' },
    { id: 'payment_processing', name: 'Payment Processing', description: 'Process payments and transfers', category: 'Financial' },
    { id: 'user_management', name: 'User Management', description: 'Manage customer accounts', category: 'Support' },
    { id: 'customer_support', name: 'Customer Support', description: 'Handle customer inquiries', category: 'Support' },
    { id: 'ticket_management', name: 'Ticket Management', description: 'Manage support tickets', category: 'Support' },
    { id: 'reports', name: 'Report Access', description: 'View system reports', category: 'Compliance' },
    { id: 'monitoring', name: 'System Monitoring', description: 'Monitor system health', category: 'Compliance' },
    { id: 'compliance', name: 'Compliance Management', description: 'Manage compliance requirements', category: 'Compliance' },
    { id: 'audit_trail', name: 'Audit Trail', description: 'Access audit logs', category: 'Compliance' }
  ]);

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    const roleData = adminRoles.find(r => r.name === role);
    switch (roleData?.color) {
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleIcon = (role: string) => {
    const roleData = adminRoles.find(r => r.name === role);
    return roleData?.icon || '👤';
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowAddModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      // Handle delete logic here
      console.log('Deleting user:', userId);
    }
  };

  const handleSuspendUser = (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this admin user?')) {
      // Handle suspend logic here
      console.log('Suspending user:', userId);
    }
  };

  const handleActivateUser = (userId: string) => {
    // Handle activate logic here
    console.log('Activating user:', userId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin User Management</h1>
              <p className="text-gray-600">Manage admin users, roles, and permissions</p>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Admin User</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Admin Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Roles & Permissions</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  {adminRoles.map(role => (
                    <option key={role.id} value={role.name}>{role.displayName}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.fullName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getRoleIcon(user.role)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {adminRoles.find(r => r.name === user.role)?.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Suspend User"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Activate User"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            {/* Roles Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminRoles.map((role) => (
                <div key={role.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg ${getRoleColor(role.name)}`}>
                      <span className="text-2xl">{role.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.displayName}</h3>
                      <p className="text-sm text-gray-600">{adminUsers.filter(u => u.role === role.name).length} users</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {permissions.find(p => p.id === permission)?.name || permission}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Manage Role
                  </button>
                </div>
              ))}
            </div>

            {/* Permissions Matrix */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions Matrix</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 font-medium text-gray-900">Permission</th>
                      {adminRoles.map(role => (
                        <th key={role.id} className="text-center py-2 px-4 font-medium text-gray-900">
                          <div className="flex flex-col items-center">
                            <span className="text-lg mb-1">{role.icon}</span>
                            <span className="text-xs">{role.displayName}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map(permission => (
                      <tr key={permission.id} className="border-t border-gray-200">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{permission.name}</div>
                            <div className="text-sm text-gray-500">{permission.description}</div>
                          </div>
                        </td>
                        {adminRoles.map(role => (
                          <td key={role.id} className="py-3 px-4 text-center">
                            {role.permissions.includes(permission.id) || role.permissions.includes('all') ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-gray-200 mx-auto"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;