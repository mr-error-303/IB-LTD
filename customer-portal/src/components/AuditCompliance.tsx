import React, { useState, useEffect } from 'react';
import { Shield, Download, FileText, Search, Filter, Calendar, Clock, User, Activity, AlertCircle, CheckCircle, Eye, ExternalLink, Database } from 'lucide-react';

// Interfaces
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  outcome: 'success' | 'failure' | 'warning';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  metadata: Record<string, any>;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  regulation: string;
  category: 'data_protection' | 'financial_reporting' | 'access_control' | 'transaction_monitoring' | 'record_keeping';
  status: 'compliant' | 'non_compliant' | 'warning' | 'pending';
  lastChecked: string;
  nextCheck: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  remediation?: {
    required: boolean;
    deadline?: string;
    assignedTo?: string;
    status: 'pending' | 'in_progress' | 'completed';
  };
}

interface DataExportRequest {
  id: string;
  requestedBy: string;
  requestedAt: string;
  purpose: string;
  dataType: 'audit_logs' | 'compliance_reports' | 'user_activities' | 'transaction_records' | 'system_logs';
  dateRange: {
    from: string;
    to: string;
  };
  filters: Record<string, any>;
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: string;
  recordCount?: number;
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'regulatory' | 'internal' | 'audit' | 'risk_assessment';
  regulation: string;
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  status: 'draft' | 'review' | 'approved' | 'submitted';
  findings: {
    compliant: number;
    nonCompliant: number;
    warnings: number;
  };
  reviewer?: string;
  submittedTo?: string;
  dueDate?: string;
}

// Mock Data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    userId: 'admin001',
    userName: 'John Smith',
    userRole: 'System Administrator',
    action: 'USER_LOGIN',
    resource: 'Authentication System',
    resourceId: 'auth-001',
    details: 'Successful admin login from new device',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_abc123',
    outcome: 'success',
    riskLevel: 'low',
    complianceFlags: ['SOX', 'GDPR'],
    metadata: { deviceFingerprint: 'fp_xyz789', location: 'New York, US' }
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:25:10',
    userId: 'user456',
    userName: 'Jane Doe',
    userRole: 'Customer',
    action: 'TRANSACTION_CREATE',
    resource: 'Payment System',
    resourceId: 'txn-789456',
    details: 'Wire transfer of $25,000 to external account',
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    sessionId: 'sess_def456',
    outcome: 'success',
    riskLevel: 'high',
    complianceFlags: ['AML', 'KYC', 'BSA'],
    metadata: { amount: 25000, currency: 'USD', beneficiary: 'External Bank' }
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:20:45',
    userId: 'analyst002',
    userName: 'Mike Johnson',
    userRole: 'Risk Analyst',
    action: 'COMPLIANCE_CHECK',
    resource: 'Risk Management System',
    resourceId: 'risk-check-001',
    details: 'Manual review of high-risk transaction flagged by system',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    sessionId: 'sess_ghi789',
    outcome: 'success',
    riskLevel: 'medium',
    complianceFlags: ['AML', 'OFAC'],
    metadata: { reviewDuration: '15 minutes', decision: 'approved' }
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:15:30',
    userId: 'system',
    userName: 'System Process',
    userRole: 'System',
    action: 'DATA_BACKUP',
    resource: 'Database System',
    resourceId: 'db-backup-001',
    details: 'Automated daily database backup completed',
    ipAddress: '127.0.0.1',
    userAgent: 'System/1.0',
    sessionId: 'sys_backup',
    outcome: 'success',
    riskLevel: 'low',
    complianceFlags: ['SOX', 'Data Retention'],
    metadata: { backupSize: '2.5GB', duration: '45 minutes' }
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:10:15',
    userId: 'user789',
    userName: 'Bob Wilson',
    userRole: 'Customer',
    action: 'LOGIN_FAILED',
    resource: 'Authentication System',
    resourceId: 'auth-002',
    details: 'Failed login attempt - incorrect password (3rd attempt)',
    ipAddress: '45.67.89.123',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionId: 'sess_failed',
    outcome: 'failure',
    riskLevel: 'high',
    complianceFlags: ['Security Policy', 'Account Protection'],
    metadata: { attemptCount: 3, accountLocked: true }
  }
];

const mockComplianceChecks: ComplianceCheck[] = [
  {
    id: '1',
    name: 'GDPR Data Protection Assessment',
    description: 'Verify compliance with EU General Data Protection Regulation',
    regulation: 'GDPR',
    category: 'data_protection',
    status: 'compliant',
    lastChecked: '2024-01-15 08:00:00',
    nextCheck: '2024-01-16 08:00:00',
    frequency: 'daily',
    findings: { total: 25, critical: 0, high: 0, medium: 2, low: 23 }
  },
  {
    id: '2',
    name: 'SOX Financial Controls Review',
    description: 'Sarbanes-Oxley Act compliance for financial reporting controls',
    regulation: 'SOX',
    category: 'financial_reporting',
    status: 'warning',
    lastChecked: '2024-01-14 18:00:00',
    nextCheck: '2024-01-21 18:00:00',
    frequency: 'weekly',
    findings: { total: 15, critical: 0, high: 1, medium: 3, low: 11 },
    remediation: {
      required: true,
      deadline: '2024-01-20',
      assignedTo: 'Finance Team',
      status: 'in_progress'
    }
  },
  {
    id: '3',
    name: 'AML Transaction Monitoring',
    description: 'Anti-Money Laundering compliance monitoring',
    regulation: 'BSA/AML',
    category: 'transaction_monitoring',
    status: 'compliant',
    lastChecked: '2024-01-15 12:00:00',
    nextCheck: '2024-01-15 16:00:00',
    frequency: 'daily',
    findings: { total: 50, critical: 0, high: 2, medium: 5, low: 43 }
  },
  {
    id: '4',
    name: 'PCI DSS Security Standards',
    description: 'Payment Card Industry Data Security Standard compliance',
    regulation: 'PCI DSS',
    category: 'data_protection',
    status: 'non_compliant',
    lastChecked: '2024-01-14 20:00:00',
    nextCheck: '2024-01-17 20:00:00',
    frequency: 'weekly',
    findings: { total: 30, critical: 2, high: 5, medium: 8, low: 15 },
    remediation: {
      required: true,
      deadline: '2024-01-18',
      assignedTo: 'Security Team',
      status: 'pending'
    }
  },
  {
    id: '5',
    name: 'FFIEC Cybersecurity Assessment',
    description: 'Federal Financial Institutions Examination Council guidelines',
    regulation: 'FFIEC',
    category: 'access_control',
    status: 'pending',
    lastChecked: '2024-01-10 10:00:00',
    nextCheck: '2024-01-17 10:00:00',
    frequency: 'weekly',
    findings: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
  }
];

const mockExportRequests: DataExportRequest[] = [
  {
    id: '1',
    requestedBy: 'External Auditor',
    requestedAt: '2024-01-15 10:30:00',
    purpose: 'Annual compliance audit - Q4 2023 review',
    dataType: 'audit_logs',
    dateRange: { from: '2023-10-01', to: '2023-12-31' },
    filters: { riskLevel: ['high', 'critical'], complianceFlags: ['SOX', 'AML'] },
    format: 'xlsx',
    status: 'completed',
    downloadUrl: '/exports/audit-logs-q4-2023.xlsx',
    expiresAt: '2024-01-22 10:30:00',
    fileSize: '15.2 MB',
    recordCount: 12547
  },
  {
    id: '2',
    requestedBy: 'Compliance Officer',
    requestedAt: '2024-01-15 14:15:00',
    purpose: 'Monthly regulatory report preparation',
    dataType: 'compliance_reports',
    dateRange: { from: '2024-01-01', to: '2024-01-15' },
    filters: { status: ['non_compliant', 'warning'] },
    format: 'pdf',
    status: 'processing',
    recordCount: 245
  },
  {
    id: '3',
    requestedBy: 'Risk Manager',
    requestedAt: '2024-01-15 09:45:00',
    purpose: 'High-risk transaction analysis',
    dataType: 'transaction_records',
    dateRange: { from: '2024-01-01', to: '2024-01-15' },
    filters: { riskLevel: ['high', 'critical'], amount: { min: 10000 } },
    format: 'csv',
    status: 'completed',
    downloadUrl: '/exports/high-risk-transactions-jan2024.csv',
    expiresAt: '2024-01-20 09:45:00',
    fileSize: '8.7 MB',
    recordCount: 1834
  },
  {
    id: '4',
    requestedBy: 'IT Security Team',
    requestedAt: '2024-01-15 16:20:00',
    purpose: 'Security incident investigation',
    dataType: 'system_logs',
    dateRange: { from: '2024-01-14', to: '2024-01-15' },
    filters: { outcome: ['failure'], riskLevel: ['high', 'critical'] },
    format: 'json',
    status: 'failed',
    recordCount: 0
  }
];

const mockComplianceReports: ComplianceReport[] = [
  {
    id: '1',
    name: 'Q4 2023 SOX Compliance Report',
    type: 'regulatory',
    regulation: 'SOX',
    generatedAt: '2024-01-10 15:30:00',
    period: { from: '2023-10-01', to: '2023-12-31' },
    status: 'approved',
    findings: { compliant: 45, nonCompliant: 3, warnings: 7 },
    reviewer: 'Chief Compliance Officer',
    submittedTo: 'SEC',
    dueDate: '2024-01-31'
  },
  {
    id: '2',
    name: 'Monthly AML Monitoring Report',
    type: 'regulatory',
    regulation: 'BSA/AML',
    generatedAt: '2024-01-15 12:00:00',
    period: { from: '2024-01-01', to: '2024-01-15' },
    status: 'review',
    findings: { compliant: 28, nonCompliant: 2, warnings: 5 },
    reviewer: 'AML Officer'
  },
  {
    id: '3',
    name: 'GDPR Data Protection Impact Assessment',
    type: 'internal',
    regulation: 'GDPR',
    generatedAt: '2024-01-12 09:15:00',
    period: { from: '2024-01-01', to: '2024-01-12' },
    status: 'draft',
    findings: { compliant: 22, nonCompliant: 1, warnings: 3 }
  }
];

const AuditCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('audit-trail');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'success': case 'completed': case 'approved': return 'text-green-600 bg-green-100';
      case 'warning': case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'non_compliant': case 'failure': case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': case 'processing': case 'draft': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportData = (type: string, format: string) => {
    console.log(`Exporting ${type} data in ${format} format`);
    setShowExportModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit & Compliance</h1>
        <p className="text-gray-600">Complete audit trail, regulatory compliance monitoring, and data export capabilities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audit Logs</p>
              <p className="text-2xl font-bold text-blue-600">{mockAuditLogs.length.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Checks</p>
              <p className="text-2xl font-bold text-green-600">{mockComplianceChecks.filter(c => c.status === 'compliant').length}/{mockComplianceChecks.length}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Findings</p>
              <p className="text-2xl font-bold text-red-600">{mockComplianceChecks.reduce((sum, c) => sum + c.findings.critical, 0)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Export Requests</p>
              <p className="text-2xl font-bold text-purple-600">{mockExportRequests.length}</p>
            </div>
            <Download className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'audit-trail', name: 'Audit Trail', icon: Activity },
              { id: 'compliance-checks', name: 'Compliance Checks', icon: Shield },
              { id: 'data-export', name: 'Data Export', icon: Download },
              { id: 'reports', name: 'Compliance Reports', icon: FileText }
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
          {/* Audit Trail Tab */}
          {activeTab === 'audit-trail' && (
            <div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filterOutcome}
                    onChange={(e) => setFilterOutcome(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Outcomes</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.outcome)}`}>
                            {log.outcome}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(log.riskLevel)}`}>
                            {log.riskLevel} risk
                          </span>
                          <span className="text-sm text-gray-500">{log.timestamp}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{log.action}</h3>
                            <p className="text-sm text-gray-600">{log.details}</p>
                          </div>
                          <div>
                            <div className="text-sm">
                              <div className="font-medium text-gray-700">User: {log.userName}</div>
                              <div className="text-gray-600">Role: {log.userRole}</div>
                              <div className="text-gray-600">IP: {log.ipAddress}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm">
                              <div className="font-medium text-gray-700">Resource: {log.resource}</div>
                              <div className="text-gray-600">ID: {log.resourceId}</div>
                              <div className="text-gray-600">Session: {log.sessionId}</div>
                            </div>
                          </div>
                        </div>
                        
                        {log.complianceFlags.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">Compliance Flags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {log.complianceFlags.map((flag) => (
                                <span key={flag} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Checks Tab */}
          {activeTab === 'compliance-checks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Regulatory Compliance Monitoring</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Shield className="h-4 w-4" />
                  <span>Run All Checks</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockComplianceChecks.map((check) => (
                  <div key={check.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{check.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                            {check.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{check.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Regulation: {check.regulation}</div>
                            <div className="text-gray-600">Category: {check.category.replace('_', ' ')}</div>
                            <div className="text-gray-600">Frequency: {check.frequency}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Last Checked: {check.lastChecked}</div>
                            <div className="text-gray-600">Next Check: {check.nextCheck}</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Findings Summary</h4>
                          <div className="grid grid-cols-5 gap-2 text-center">
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-lg font-bold text-gray-900">{check.findings.total}</div>
                              <div className="text-xs text-gray-600">Total</div>
                            </div>
                            <div className="bg-red-50 rounded p-2">
                              <div className="text-lg font-bold text-red-600">{check.findings.critical}</div>
                              <div className="text-xs text-red-600">Critical</div>
                            </div>
                            <div className="bg-orange-50 rounded p-2">
                              <div className="text-lg font-bold text-orange-600">{check.findings.high}</div>
                              <div className="text-xs text-orange-600">High</div>
                            </div>
                            <div className="bg-yellow-50 rounded p-2">
                              <div className="text-lg font-bold text-yellow-600">{check.findings.medium}</div>
                              <div className="text-xs text-yellow-600">Medium</div>
                            </div>
                            <div className="bg-green-50 rounded p-2">
                              <div className="text-lg font-bold text-green-600">{check.findings.low}</div>
                              <div className="text-xs text-green-600">Low</div>
                            </div>
                          </div>
                        </div>
                        
                        {check.remediation && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <h5 className="text-sm font-medium text-yellow-800 mb-1">Remediation Required</h5>
                            <div className="text-sm text-yellow-700">
                              <div>Deadline: {check.remediation.deadline}</div>
                              <div>Assigned to: {check.remediation.assignedTo}</div>
                              <div>Status: {check.remediation.status.replace('_', ' ')}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Export Tab */}
          {activeTab === 'data-export' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Data Export Requests</h3>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  <span>New Export Request</span>
                </button>
              </div>

              <div className="space-y-4">
                {mockExportRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{request.purpose}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Requested by: {request.requestedBy}</div>
                            <div className="text-gray-600">Date: {request.requestedAt}</div>
                            <div className="text-gray-600">Data Type: {request.dataType.replace('_', ' ')}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Date Range:</div>
                            <div className="text-gray-600">{request.dateRange.from} to {request.dateRange.to}</div>
                            <div className="text-gray-600">Format: {request.format.toUpperCase()}</div>
                          </div>
                          <div className="text-sm">
                            {request.recordCount && (
                              <div className="font-medium text-gray-700">Records: {request.recordCount.toLocaleString()}</div>
                            )}
                            {request.fileSize && (
                              <div className="text-gray-600">Size: {request.fileSize}</div>
                            )}
                            {request.expiresAt && (
                              <div className="text-gray-600">Expires: {request.expiresAt}</div>
                            )}
                          </div>
                        </div>
                        
                        {Object.keys(request.filters).length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Applied Filters:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(request.filters).map(([key, value]) => (
                                <span key={key} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                  {key}: {Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {request.status === 'completed' && request.downloadUrl && (
                          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        )}
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                          <Eye className="h-4 w-4" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockComplianceReports.map((report) => (
                  <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Type: {report.type.replace('_', ' ')}</div>
                            <div className="text-gray-600">Regulation: {report.regulation}</div>
                            <div className="text-gray-600">Generated: {report.generatedAt}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">Period:</div>
                            <div className="text-gray-600">{report.period.from} to {report.period.to}</div>
                            {report.dueDate && (
                              <div className="text-gray-600">Due: {report.dueDate}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Findings Summary</h4>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-green-50 rounded p-2">
                              <div className="text-lg font-bold text-green-600">{report.findings.compliant}</div>
                              <div className="text-xs text-green-600">Compliant</div>
                            </div>
                            <div className="bg-red-50 rounded p-2">
                              <div className="text-lg font-bold text-red-600">{report.findings.nonCompliant}</div>
                              <div className="text-xs text-red-600">Non-Compliant</div>
                            </div>
                            <div className="bg-yellow-50 rounded p-2">
                              <div className="text-lg font-bold text-yellow-600">{report.findings.warnings}</div>
                              <div className="text-xs text-yellow-600">Warnings</div>
                            </div>
                          </div>
                        </div>
                        
                        {report.reviewer && (
                          <div className="text-sm text-gray-600 mb-2">
                            Reviewer: {report.reviewer}
                          </div>
                        )}
                        
                        {report.submittedTo && (
                          <div className="text-sm text-gray-600">
                            Submitted to: {report.submittedTo}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md">
                          <Download className="h-4 w-4" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Data Export Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the purpose of this export..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="audit_logs">Audit Logs</option>
                    <option value="compliance_reports">Compliance Reports</option>
                    <option value="user_activities">User Activities</option>
                    <option value="transaction_records">Transaction Records</option>
                    <option value="system_logs">System Logs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filters (Optional)</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                      <option>Risk Level</option>
                      <option>Outcome</option>
                      <option>User Role</option>
                      <option>Compliance Flag</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md">
                      <option>equals</option>
                      <option>contains</option>
                      <option>in</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Value..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => exportData('audit_logs', 'csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Export Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 rounded-md p-3 space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedLog.id}</div>
                    <div><span className="font-medium">Timestamp:</span> {selectedLog.timestamp}</div>
                    <div><span className="font-medium">Action:</span> {selectedLog.action}</div>
                    <div><span className="font-medium">Resource:</span> {selectedLog.resource}</div>
                    <div><span className="font-medium">Resource ID:</span> {selectedLog.resourceId}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                  <div className="bg-gray-50 rounded-md p-3 space-y-2 text-sm">
                    <div><span className="font-medium">User ID:</span> {selectedLog.userId}</div>
                    <div><span className="font-medium">Name:</span> {selectedLog.userName}</div>
                    <div><span className="font-medium">Role:</span> {selectedLog.userRole}</div>
                    <div><span className="font-medium">IP Address:</span> {selectedLog.ipAddress}</div>
                    <div><span className="font-medium">Session ID:</span> {selectedLog.sessionId}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  {selectedLog.details}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">User Agent</h4>
                <div className="bg-gray-50 rounded-md p-3 text-sm break-all">
                  {selectedLog.userAgent}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditCompliance;