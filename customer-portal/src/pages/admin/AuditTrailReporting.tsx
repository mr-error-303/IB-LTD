import React, { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'transaction' | 'user' | 'system' | 'security' | 'approval';
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  transactionId?: string;
  amount?: number;
  status: 'success' | 'failed' | 'pending';
}

interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  category: string;
  severity: string;
  userId: string;
  action: string;
  status: string;
}

interface ReportSummary {
  totalLogs: number;
  criticalEvents: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  timeDistribution: { hour: number; count: number }[];
}

const AuditTrailReporting: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const [filters, setFilters] = useState<ReportFilter>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    category: '',
    severity: '',
    userId: '',
    action: '',
    status: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, searchTerm]);

  const loadAuditLogs = async () => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          userId: 'admin001',
          userName: 'John Admin',
          action: 'APPROVE_TRANSACTION',
          category: 'approval',
          details: 'Approved fund transfer of $50,000 for user ID: user123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'high',
          transactionId: 'TXN001',
          amount: 50000,
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:25:00Z',
          userId: 'system',
          userName: 'System',
          action: 'BLOCK_ACCOUNT',
          category: 'security',
          details: 'Account blocked due to suspicious activity pattern',
          ipAddress: '127.0.0.1',
          userAgent: 'System Process',
          severity: 'critical',
          status: 'success'
        },
        {
          id: '3',
          timestamp: '2024-01-15T10:20:00Z',
          userId: 'user456',
          userName: 'Jane Doe',
          action: 'FAILED_LOGIN',
          category: 'security',
          details: 'Failed login attempt - incorrect password',
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          severity: 'medium',
          status: 'failed'
        },
        {
          id: '4',
          timestamp: '2024-01-15T10:15:00Z',
          userId: 'admin002',
          userName: 'Sarah Admin',
          action: 'UPDATE_TRANSACTION_LIMIT',
          category: 'transaction',
          details: 'Updated daily transaction limit from $10,000 to $15,000',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          severity: 'medium',
          status: 'success'
        },
        {
          id: '5',
          timestamp: '2024-01-15T10:10:00Z',
          userId: 'user789',
          userName: 'Bob Smith',
          action: 'INITIATE_TRANSFER',
          category: 'transaction',
          details: 'Initiated fund transfer of $25,000',
          ipAddress: '198.51.100.23',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          severity: 'high',
          transactionId: 'TXN002',
          amount: 25000,
          status: 'pending'
        },
        {
          id: '6',
          timestamp: '2024-01-15T10:05:00Z',
          userId: 'system',
          userName: 'System',
          action: 'FRAUD_DETECTION',
          category: 'security',
          details: 'Potential fraud pattern detected in mobile top-up transactions',
          ipAddress: '127.0.0.1',
          userAgent: 'Fraud Detection Service',
          severity: 'critical',
          status: 'success'
        },
        {
          id: '7',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'admin001',
          userName: 'John Admin',
          action: 'GENERATE_REPORT',
          category: 'system',
          details: 'Generated monthly transaction report',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          severity: 'low',
          status: 'success'
        },
        {
          id: '8',
          timestamp: '2024-01-15T09:55:00Z',
          userId: 'user321',
          userName: 'Alice Johnson',
          action: 'CASH_WITHDRAWAL',
          category: 'transaction',
          details: 'Cash withdrawal of $500 from ATM',
          ipAddress: '203.0.113.67',
          userAgent: 'ATM Terminal',
          severity: 'low',
          transactionId: 'TXN003',
          amount: 500,
          status: 'success'
        }
      ];

      setAuditLogs(mockLogs);
      
      // Generate report summary
      const summary: ReportSummary = {
        totalLogs: mockLogs.length,
        criticalEvents: mockLogs.filter(log => log.severity === 'critical').length,
        failedActions: mockLogs.filter(log => log.status === 'failed').length,
        uniqueUsers: new Set(mockLogs.map(log => log.userId)).size,
        topActions: [
          { action: 'APPROVE_TRANSACTION', count: 15 },
          { action: 'INITIATE_TRANSFER', count: 12 },
          { action: 'FAILED_LOGIN', count: 8 },
          { action: 'BLOCK_ACCOUNT', count: 5 },
          { action: 'UPDATE_TRANSACTION_LIMIT', count: 3 }
        ],
        timeDistribution: [
          { hour: 9, count: 5 },
          { hour: 10, count: 12 },
          { hour: 11, count: 8 },
          { hour: 12, count: 15 },
          { hour: 13, count: 10 },
          { hour: 14, count: 7 },
          { hour: 15, count: 9 }
        ]
      };
      
      setReportSummary(summary);
      setLoading(false);
    }, 1000);
  };

  const applyFilters = () => {
    let filtered = auditLogs;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Apply severity filter
    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Apply user filter
    if (filters.userId) {
      filtered = filtered.filter(log => log.userId.includes(filters.userId));
    }

    // Apply action filter
    if (filters.action) {
      filtered = filtered.filter(log => log.action.includes(filters.action));
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      category: '',
      severity: '',
      userId: '',
      action: '',
      status: ''
    });
    setSearchTerm('');
  };

  const exportData = () => {
    const dataToExport = filteredLogs;
    
    if (exportFormat === 'csv') {
      const csvContent = [
        'Timestamp,User,Action,Category,Details,IP Address,Severity,Status,Transaction ID,Amount',
        ...dataToExport.map(log => 
          `"${log.timestamp}","${log.userName}","${log.action}","${log.category}","${log.details}","${log.ipAddress}","${log.severity}","${log.status}","${log.transactionId || ''}","${log.amount || ''}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (exportFormat === 'json') {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail & Reporting</h1>
          <p className="text-gray-600 mt-1">Comprehensive activity logging and analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="csv">Export as CSV</option>
            <option value="json">Export as JSON</option>
            <option value="pdf">Export as PDF</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{reportSummary.totalLogs}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{reportSummary.criticalEvents}</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-orange-600">{reportSummary.failedActions}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-blue-600">{reportSummary.uniqueUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Filters & Search</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="transaction">Transaction</option>
                <option value="user">User</option>
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="approval">Approval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by user, action, details, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No audit logs found matching your criteria
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm ${
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userId})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className="mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {selectedLog.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                {selectedLog.transactionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.transactionId}</p>
                  </div>
                )}
                {selectedLog.amount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedLog.amount)}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">User Agent</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg break-all">{selectedLog.userAgent}</p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailReporting;