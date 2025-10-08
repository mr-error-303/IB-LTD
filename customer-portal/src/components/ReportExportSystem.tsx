import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, Mail, Settings, FileText, Table, FileSpreadsheet, Send, Plus, Edit, Trash2, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

// Interfaces for export system
interface ExportTemplate {
  id: string;
  name: string;
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    type: 'custom' | 'last7days' | 'last30days' | 'lastQuarter' | 'lastYear';
    startDate?: string;
    endDate?: string;
  };
  filters: Record<string, any>;
  createdAt: string;
  lastUsed: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'error';
}

interface ExportHistory {
  id: string;
  reportName: string;
  format: string;
  dateRange: string;
  exportedAt: string;
  exportedBy: string;
  fileSize: string;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

interface DeliveryChannel {
  id: string;
  name: string;
  type: 'email' | 'ftp' | 'sftp' | 'webhook';
  configuration: Record<string, any>;
  isActive: boolean;
  lastUsed?: string;
}

const ReportExportSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Export form state
  const [exportForm, setExportForm] = useState({
    reportType: 'financial',
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    dateRangeType: 'custom' as 'custom' | 'last7days' | 'last30days' | 'lastQuarter' | 'lastYear',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    includeCharts: true,
    includeRawData: false,
    templateName: ''
  });

  // Mock data for export templates
  const [exportTemplates] = useState<ExportTemplate[]>([
    {
      id: '1',
      name: 'Monthly Financial Summary',
      reportType: 'financial',
      format: 'pdf',
      dateRange: { type: 'last30days' },
      filters: { includeCharts: true },
      createdAt: '2024-01-10T10:00:00Z',
      lastUsed: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Weekly Transaction Report',
      reportType: 'operational',
      format: 'excel',
      dateRange: { type: 'last7days' },
      filters: { includeRawData: true },
      createdAt: '2024-01-08T09:00:00Z',
      lastUsed: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      name: 'Quarterly Compliance Report',
      reportType: 'compliance',
      format: 'pdf',
      dateRange: { type: 'lastQuarter' },
      filters: { includeCharts: true, includeRawData: true },
      createdAt: '2024-01-05T11:30:00Z',
      lastUsed: '2024-01-12T13:20:00Z'
    }
  ]);

  // Mock data for scheduled reports
  const [scheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Daily Transaction Summary',
      templateId: '2',
      frequency: 'daily',
      time: '08:00',
      recipients: ['admin@company.com', 'finance@company.com'],
      isActive: true,
      nextRun: '2024-01-16T08:00:00Z',
      lastRun: '2024-01-15T08:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Weekly Performance Report',
      templateId: '1',
      frequency: 'weekly',
      time: '09:00',
      recipients: ['management@company.com'],
      isActive: true,
      nextRun: '2024-01-22T09:00:00Z',
      lastRun: '2024-01-15T09:00:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Monthly Compliance Report',
      templateId: '3',
      frequency: 'monthly',
      time: '10:00',
      recipients: ['compliance@company.com', 'audit@company.com'],
      isActive: false,
      nextRun: '2024-02-01T10:00:00Z',
      status: 'paused'
    }
  ]);

  // Mock data for export history
  const [exportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      reportName: 'Financial Report - January 2024',
      format: 'PDF',
      dateRange: '2024-01-01 to 2024-01-31',
      exportedAt: '2024-01-15T14:30:00Z',
      exportedBy: 'John Smith',
      fileSize: '2.4 MB',
      status: 'completed',
      downloadUrl: '/downloads/financial-report-jan-2024.pdf'
    },
    {
      id: '2',
      reportName: 'Transaction Report - Weekly',
      format: 'Excel',
      dateRange: '2024-01-08 to 2024-01-14',
      exportedAt: '2024-01-15T10:15:00Z',
      exportedBy: 'Sarah Johnson',
      fileSize: '1.8 MB',
      status: 'completed',
      downloadUrl: '/downloads/transaction-report-weekly.xlsx'
    },
    {
      id: '3',
      reportName: 'System Performance Report',
      format: 'CSV',
      dateRange: '2024-01-01 to 2024-01-15',
      exportedAt: '2024-01-15T09:45:00Z',
      exportedBy: 'Mike Davis',
      fileSize: '856 KB',
      status: 'processing'
    }
  ]);

  // Mock data for delivery channels
  const [deliveryChannels] = useState<DeliveryChannel[]>([
    {
      id: '1',
      name: 'Primary Email Server',
      type: 'email',
      configuration: { smtp: 'smtp.company.com', port: 587 },
      isActive: true,
      lastUsed: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Secure FTP Server',
      type: 'sftp',
      configuration: { host: 'sftp.company.com', port: 22 },
      isActive: true,
      lastUsed: '2024-01-14T16:30:00Z'
    },
    {
      id: '3',
      name: 'Webhook Integration',
      type: 'webhook',
      configuration: { url: 'https://api.company.com/reports' },
      isActive: false
    }
  ]);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert(`Exporting ${exportForm.reportType} report as ${exportForm.format.toUpperCase()}...`);
    }, 3000);
  };

  const handleSaveTemplate = () => {
    if (!exportForm.templateName) {
      alert('Please enter a template name');
      return;
    }
    alert(`Template "${exportForm.templateName}" saved successfully!`);
    setShowTemplateModal(false);
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <Table className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'export', name: 'Export Reports', icon: Download },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'scheduled', name: 'Scheduled Reports', icon: Clock },
    { id: 'history', name: 'Export History', icon: CheckCircle },
    { id: 'delivery', name: 'Delivery Channels', icon: Send }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Export System</h1>
          <p className="text-gray-600">Comprehensive report generation, scheduling, and delivery management</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
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
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'export' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Reports</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Export Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={exportForm.reportType}
                      onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="financial">Financial Reports</option>
                      <option value="operational">Operational Reports</option>
                      <option value="compliance">Compliance Reports</option>
                      <option value="security">Security Reports</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['pdf', 'excel', 'csv'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setExportForm({ ...exportForm, format })}
                          className={`flex items-center justify-center space-x-2 p-3 border rounded-md ${
                            exportForm.format === format
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {getFormatIcon(format)}
                          <span className="text-sm font-medium">{format.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={exportForm.dateRangeType}
                      onChange={(e) => setExportForm({ ...exportForm, dateRangeType: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                    >
                      <option value="custom">Custom Range</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="lastQuarter">Last Quarter</option>
                      <option value="lastYear">Last Year</option>
                    </select>

                    {exportForm.dateRangeType === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={exportForm.startDate}
                            onChange={(e) => setExportForm({ ...exportForm, startDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End Date</label>
                          <input
                            type="date"
                            value={exportForm.endDate}
                            onChange={(e) => setExportForm({ ...exportForm, endDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportForm.includeCharts}
                          onChange={(e) => setExportForm({ ...exportForm, includeCharts: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include Charts and Visualizations</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportForm.includeRawData}
                          onChange={(e) => setExportForm({ ...exportForm, includeRawData: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include Raw Data Tables</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isExporting ? 'Exporting...' : 'Export Now'}</span>
                    </button>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Save as Template
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Export Templates</h3>
                    <div className="space-y-3">
                      {exportTemplates.slice(0, 3).map((template) => (
                        <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-500">
                                {template.reportType} • {template.format.toUpperCase()} • {template.dateRange.type}
                              </p>
                            </div>
                            <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                              <Download className="h-3 w-3" />
                              <span>Export</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Exports</h3>
                    <div className="space-y-3">
                      {exportHistory.slice(0, 3).map((export_) => (
                        <div key={export_.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getFormatIcon(export_.format)}
                              <div>
                                <h4 className="font-medium text-gray-900">{export_.reportName}</h4>
                                <p className="text-sm text-gray-500">{export_.fileSize} • {formatDateTime(export_.exportedAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(export_.status)}`}>
                                {export_.status.charAt(0).toUpperCase() + export_.status.slice(1)}
                              </span>
                              {export_.status === 'completed' && (
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Export Templates</h2>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Template</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exportTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {template.reportType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            {getFormatIcon(template.format)}
                            <span>{template.format.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {template.dateRange.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(template.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(template.lastUsed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
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
          )}

          {activeTab === 'scheduled' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Scheduled Reports</h2>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Schedule</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {report.recipients.join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(report.nextRun)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <button className="text-green-600 hover:text-green-800">
                              {report.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
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
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Export History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exported At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exportHistory.map((export_) => (
                      <tr key={export_.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {export_.reportName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            {getFormatIcon(export_.format)}
                            <span>{export_.format}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {export_.dateRange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(export_.exportedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {export_.exportedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {export_.fileSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(export_.status)}`}>
                            {export_.status.charAt(0).toUpperCase() + export_.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {export_.status === 'completed' && (
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Channels</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  <span>Add Channel</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryChannels.map((channel) => (
                  <div key={channel.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${channel.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {channel.type === 'email' && <Mail className={`h-5 w-5 ${channel.isActive ? 'text-green-600' : 'text-gray-600'}`} />}
                          {channel.type === 'ftp' && <Send className={`h-5 w-5 ${channel.isActive ? 'text-green-600' : 'text-gray-600'}`} />}
                          {channel.type === 'sftp' && <Send className={`h-5 w-5 ${channel.isActive ? 'text-green-600' : 'text-gray-600'}`} />}
                          {channel.type === 'webhook' && <Settings className={`h-5 w-5 ${channel.isActive ? 'text-green-600' : 'text-gray-600'}`} />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{channel.name}</h3>
                          <p className="text-sm text-gray-500">{channel.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          channel.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                          {channel.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      {Object.entries(channel.configuration).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-mono text-xs">{value}</span>
                        </div>
                      ))}
                    </div>
                    {channel.lastUsed && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Last used: {formatDateTime(channel.lastUsed)}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Save Export Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={exportForm.templateName}
                    onChange={(e) => setExportForm({ ...exportForm, templateName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter template name"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveTemplate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
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

export default ReportExportSystem;