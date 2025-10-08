import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Save, Play, Trash2, Edit, Users, CreditCard, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  role: string;
  lastLogin: string;
  balance: number;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  description: string;
}

interface BulkTemplate {
  id: string;
  name: string;
  type: 'user_update' | 'transaction_process' | 'status_change';
  description: string;
  actions: any[];
  createdAt: string;
  usageCount: number;
}

interface BulkOperation {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt: string;
  completedAt?: string;
  errors: string[];
}

// Mock Data
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', role: 'customer', lastLogin: '2024-01-15', balance: 1500.00 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'customer', lastLogin: '2024-01-10', balance: 2300.50 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', role: 'premium', lastLogin: '2024-01-14', balance: 5000.00 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'suspended', role: 'customer', lastLogin: '2024-01-05', balance: 750.25 },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', status: 'active', role: 'vip', lastLogin: '2024-01-16', balance: 10000.00 }
];

const mockTransactions: Transaction[] = [
  { id: '1', userId: '1', userName: 'John Doe', type: 'deposit', amount: 500, status: 'pending', date: '2024-01-15', description: 'Bank transfer deposit' },
  { id: '2', userId: '2', userName: 'Jane Smith', type: 'withdrawal', amount: 200, status: 'pending', date: '2024-01-15', description: 'ATM withdrawal' },
  { id: '3', userId: '3', userName: 'Bob Johnson', type: 'transfer', amount: 1000, status: 'processing', date: '2024-01-14', description: 'Internal transfer' },
  { id: '4', userId: '4', userName: 'Alice Brown', type: 'payment', amount: 150, status: 'pending', date: '2024-01-13', description: 'Bill payment' },
  { id: '5', userId: '5', userName: 'Charlie Wilson', type: 'deposit', amount: 2000, status: 'failed', date: '2024-01-12', description: 'Credit card deposit' }
];

const mockTemplates: BulkTemplate[] = [
  { id: '1', name: 'Activate New Users', type: 'user_update', description: 'Activate all pending user accounts', actions: [{ field: 'status', value: 'active' }], createdAt: '2024-01-10', usageCount: 15 },
  { id: '2', name: 'Process Pending Deposits', type: 'transaction_process', description: 'Approve all pending deposit transactions', actions: [{ field: 'status', value: 'completed' }], createdAt: '2024-01-08', usageCount: 23 },
  { id: '3', name: 'Suspend Inactive Users', type: 'user_update', description: 'Suspend users inactive for 30+ days', actions: [{ field: 'status', value: 'suspended' }], createdAt: '2024-01-05', usageCount: 8 },
  { id: '4', name: 'Reject Failed Transactions', type: 'transaction_process', description: 'Mark failed transactions as rejected', actions: [{ field: 'status', value: 'failed' }], createdAt: '2024-01-03', usageCount: 12 }
];

const mockOperations: BulkOperation[] = [
  { id: '1', type: 'User Status Update', status: 'completed', totalItems: 150, processedItems: 150, failedItems: 0, startedAt: '2024-01-15 10:30', completedAt: '2024-01-15 10:35', errors: [] },
  { id: '2', type: 'Transaction Processing', status: 'processing', totalItems: 75, processedItems: 45, failedItems: 2, startedAt: '2024-01-15 11:00', errors: ['Invalid account ID: TXN-001', 'Insufficient funds: TXN-023'] },
  { id: '3', type: 'Template: Activate New Users', status: 'failed', totalItems: 25, processedItems: 10, failedItems: 15, startedAt: '2024-01-15 09:15', completedAt: '2024-01-15 09:20', errors: ['Database connection timeout', 'Validation error: Invalid email format'] }
];

const BulkOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mass-users');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BulkTemplate | null>(null);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  // Filter functions
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (type: 'users' | 'transactions') => {
    if (type === 'users') {
      const allIds = filteredUsers.map(user => user.id);
      setSelectedUsers(selectedUsers.length === allIds.length ? [] : allIds);
    } else {
      const allIds = filteredTransactions.map(transaction => transaction.id);
      setSelectedTransactions(selectedTransactions.length === allIds.length ? [] : allIds);
    }
  };

  const handleBulkAction = () => {
    if (activeTab === 'mass-users' && selectedUsers.length > 0) {
      console.log(`Applying ${bulkAction}: ${bulkValue} to ${selectedUsers.length} users`);
      setShowOperationModal(true);
    } else if (activeTab === 'batch-transactions' && selectedTransactions.length > 0) {
      console.log(`Processing ${selectedTransactions.length} transactions with action: ${bulkAction}`);
      setShowOperationModal(true);
    }
  };

  const handleTemplateExecution = (template: BulkTemplate) => {
    console.log(`Executing template: ${template.name}`);
    setSelectedTemplate(template);
    setShowOperationModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': case 'suspended': case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Manage mass updates, batch processing, and automated templates</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selected Users</p>
              <p className="text-2xl font-bold text-blue-600">{selectedUsers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selected Transactions</p>
              <p className="text-2xl font-bold text-green-600">{selectedTransactions.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Templates</p>
              <p className="text-2xl font-bold text-purple-600">{mockTemplates.length}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running Operations</p>
              <p className="text-2xl font-bold text-orange-600">{mockOperations.filter(op => op.status === 'processing').length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'mass-users', name: 'Mass User Updates', icon: Users },
              { id: 'batch-transactions', name: 'Batch Transactions', icon: CreditCard },
              { id: 'templates', name: 'Templates', icon: FileText },
              { id: 'operations', name: 'Operation History', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Mass User Updates Tab */}
          {activeTab === 'mass-users' && (
            <div>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedUsers.length} users selected
                      </span>
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-1 border border-blue-300 rounded-md text-sm"
                      >
                        <option value="">Select Action</option>
                        <option value="status">Update Status</option>
                        <option value="role">Change Role</option>
                        <option value="limit">Set Limit</option>
                      </select>
                      {bulkAction && (
                        <input
                          type="text"
                          placeholder="Enter value..."
                          value={bulkValue}
                          onChange={(e) => setBulkValue(e.target.value)}
                          className="px-3 py-1 border border-blue-300 rounded-md text-sm"
                        />
                      )}
                    </div>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction || !bulkValue}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-4 w-4" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={() => handleSelectAll('users')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.balance.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Batch Transactions Tab */}
          {activeTab === 'batch-transactions' && (
            <div>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedTransactions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-green-900">
                        {selectedTransactions.length} transactions selected
                      </span>
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-1 border border-green-300 rounded-md text-sm"
                      >
                        <option value="">Select Action</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="hold">Put on Hold</option>
                      </select>
                    </div>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-4 w-4" />
                      <span>Process</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                          onChange={() => handleSelectAll('transactions')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransactions([...selectedTransactions, transaction.id]);
                              } else {
                                setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                            <div className="text-sm text-gray-500">{transaction.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Saved Templates</h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Create Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium">{template.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Usage Count:</span>
                        <span className="font-medium">{template.usageCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium">{template.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTemplateExecution(template)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      <Play className="h-4 w-4" />
                      <span>Execute</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operations History Tab */}
          {activeTab === 'operations' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Operation History</h3>
              
              <div className="space-y-4">
                {mockOperations.map((operation) => (
                  <div key={operation.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          operation.status === 'completed' ? 'bg-green-100' :
                          operation.status === 'processing' ? 'bg-yellow-100' :
                          operation.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {operation.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {operation.status === 'processing' && <Clock className="h-5 w-5 text-yellow-600" />}
                          {operation.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{operation.type}</h4>
                          <p className="text-sm text-gray-500">Started: {operation.startedAt}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(operation.status)}`}>
                        {operation.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{operation.totalItems}</p>
                        <p className="text-sm text-gray-500">Total Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{operation.processedItems}</p>
                        <p className="text-sm text-gray-500">Processed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{operation.failedItems}</p>
                        <p className="text-sm text-gray-500">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round((operation.processedItems / operation.totalItems) * 100)}%
                        </p>
                        <p className="text-sm text-gray-500">Progress</p>
                      </div>
                    </div>

                    {operation.status === 'processing' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((operation.processedItems / operation.totalItems) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(operation.processedItems / operation.totalItems) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {operation.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-red-600 mb-2">Errors ({operation.errors.length})</h5>
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          {operation.errors.slice(0, 3).map((error, index) => (
                            <p key={index} className="text-sm text-red-700">{error}</p>
                          ))}
                          {operation.errors.length > 3 && (
                            <p className="text-sm text-red-600 mt-1">... and {operation.errors.length - 3} more errors</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Creation Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this template does..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="user_update">User Update</option>
                  <option value="transaction_process">Transaction Processing</option>
                  <option value="status_change">Status Change</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operation Confirmation Modal */}
      {showOperationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Bulk Operation</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                You are about to perform a bulk operation that will affect multiple records.
              </p>
              
              {selectedTemplate ? (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <p className="text-sm font-medium text-purple-900">Template: {selectedTemplate.name}</p>
                  <p className="text-sm text-purple-700">{selectedTemplate.description}</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Action: {bulkAction} - {bulkValue}
                  </p>
                  <p className="text-sm text-blue-700">
                    Affecting {activeTab === 'mass-users' ? selectedUsers.length : selectedTransactions.length} items
                  </p>
                </div>
              )}
              
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone. Please confirm to proceed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOperationModal(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOperationModal(false);
                  setSelectedTemplate(null);
                  // Here you would trigger the actual bulk operation
                  console.log('Bulk operation confirmed and executed');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;