import React, { useState, useMemo } from 'react';
import { LoanApplication } from '../types';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  Eye, 
  Mail, 
  Share2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Printer,
  Archive,
  Search,
  RefreshCw,
  FileDown,
  PieChart,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface StatementRequest {
  id: string;
  loanId: string;
  type: StatementType;
  fromDate: string;
  toDate: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'processing' | 'ready' | 'failed';
  requestedAt: string;
  downloadUrl?: string;
  expiresAt?: string;
}

type StatementType = 
  | 'monthly' 
  | 'annual' 
  | 'repayment_schedule' 
  | 'interest_certificate' 
  | 'noc' 
  | 'loan_summary' 
  | 'tax_statement'
  | 'custom_range';

interface LoanStatementDownloadProps {
  loans: LoanApplication[];
  onRequestStatement: (request: Omit<StatementRequest, 'id' | 'status' | 'requestedAt'>) => void;
  onDownloadStatement: (statementId: string) => void;
  onEmailStatement: (statementId: string, email: string) => void;
}

interface StatementTypeInfo {
  id: StatementType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  availableFormats: ('pdf' | 'excel' | 'csv')[];
  requiresDateRange: boolean;
}

const LoanStatementDownload: React.FC<LoanStatementDownloadProps> = ({
  loans,
  onRequestStatement,
  onDownloadStatement,
  onEmailStatement
}) => {
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [selectedType, setSelectedType] = useState<StatementType>('monthly');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // Sample statement history
  const [statementHistory] = useState<StatementRequest[]>([
    {
      id: 'STMT001',
      loanId: 'LOAN001',
      type: 'monthly',
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
      format: 'pdf',
      status: 'ready',
      requestedAt: '2024-02-01T10:00:00Z',
      downloadUrl: '/statements/STMT001.pdf',
      expiresAt: '2024-02-08T10:00:00Z'
    },
    {
      id: 'STMT002',
      loanId: 'LOAN001',
      type: 'repayment_schedule',
      fromDate: '2024-01-01',
      toDate: '2024-12-31',
      format: 'excel',
      status: 'ready',
      requestedAt: '2024-01-15T14:30:00Z',
      downloadUrl: '/statements/STMT002.xlsx',
      expiresAt: '2024-01-22T14:30:00Z'
    },
    {
      id: 'STMT003',
      loanId: 'LOAN002',
      type: 'interest_certificate',
      fromDate: '2023-04-01',
      toDate: '2024-03-31',
      format: 'pdf',
      status: 'processing',
      requestedAt: '2024-03-20T09:15:00Z'
    }
  ]);

  // Statement type definitions
  const statementTypes: StatementTypeInfo[] = [
    {
      id: 'monthly',
      name: 'Monthly Statement',
      description: 'Detailed monthly transaction summary',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      availableFormats: ['pdf', 'excel'],
      requiresDateRange: true
    },
    {
      id: 'annual',
      name: 'Annual Statement',
      description: 'Yearly loan activity summary',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      availableFormats: ['pdf', 'excel'],
      requiresDateRange: true
    },
    {
      id: 'repayment_schedule',
      name: 'Repayment Schedule',
      description: 'Complete EMI schedule with breakup',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      availableFormats: ['pdf', 'excel', 'csv'],
      requiresDateRange: false
    },
    {
      id: 'interest_certificate',
      name: 'Interest Certificate',
      description: 'Tax certificate for interest paid',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      availableFormats: ['pdf'],
      requiresDateRange: true
    },
    {
      id: 'noc',
      name: 'No Objection Certificate',
      description: 'NOC for closed loans',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      availableFormats: ['pdf'],
      requiresDateRange: false
    },
    {
      id: 'loan_summary',
      name: 'Loan Summary',
      description: 'Complete loan overview and status',
      icon: PieChart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      availableFormats: ['pdf', 'excel'],
      requiresDateRange: false
    },
    {
      id: 'tax_statement',
      name: 'Tax Statement',
      description: 'Statement for tax filing purposes',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      availableFormats: ['pdf'],
      requiresDateRange: true
    },
    {
      id: 'custom_range',
      name: 'Custom Range',
      description: 'Statement for custom date range',
      icon: Filter,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      availableFormats: ['pdf', 'excel', 'csv'],
      requiresDateRange: true
    }
  ];

  // Get current statement type info
  const currentTypeInfo = statementTypes.find(type => type.id === selectedType);

  // Validate form
  const isFormValid = useMemo(() => {
    if (!selectedLoan || !selectedType) return false;
    
    if (currentTypeInfo?.requiresDateRange) {
      return fromDate && toDate && new Date(fromDate) <= new Date(toDate);
    }
    
    return true;
  }, [selectedLoan, selectedType, fromDate, toDate, currentTypeInfo]);

  // Handle statement request
  const handleRequestStatement = () => {
    if (!isFormValid) return;

    const request: Omit<StatementRequest, 'id' | 'status' | 'requestedAt'> = {
      loanId: selectedLoan,
      type: selectedType,
      fromDate: fromDate || '',
      toDate: toDate || '',
      format
    };

    onRequestStatement(request);
    
    // Reset form
    setFromDate('');
    setToDate('');
  };

  // Get status display
  const getStatusDisplay = (status: StatementRequest['status']) => {
    switch (status) {
      case 'ready':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Ready' };
      case 'processing':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: RefreshCw, label: 'Processing' };
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock, label: 'Pending' };
      case 'failed':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle, label: 'Failed' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText, label: 'Unknown' };
    }
  };

  // Handle email statement
  const handleEmailStatement = (statementId: string) => {
    if (!emailAddress) return;
    onEmailStatement(statementId, emailAddress);
    setShowEmailModal(null);
    setEmailAddress('');
  };

  // Set quick date ranges
  const setQuickDateRange = (range: 'current_month' | 'last_month' | 'current_year' | 'last_year') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (range) {
      case 'current_month':
        setFromDate(new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]);
        setToDate(new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]);
        break;
      case 'last_month':
        setFromDate(new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]);
        setToDate(new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]);
        break;
      case 'current_year':
        setFromDate(new Date(currentYear, 0, 1).toISOString().split('T')[0]);
        setToDate(new Date(currentYear, 11, 31).toISOString().split('T')[0]);
        break;
      case 'last_year':
        setFromDate(new Date(currentYear - 1, 0, 1).toISOString().split('T')[0]);
        setToDate(new Date(currentYear - 1, 11, 31).toISOString().split('T')[0]);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loan Statements</h2>
            <p className="text-gray-600">Download and manage your loan statements</p>
          </div>
          <div className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Statements expire after 7 days</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'generate', label: 'Generate Statement', icon: FileDown },
              { id: 'history', label: 'Download History', icon: Archive }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Generate Statement Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statement Types */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Statement Type</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {statementTypes.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <Icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {type.availableFormats.map(fmt => (
                            <span
                              key={fmt}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {fmt.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Loan</label>
                <select
                  value={selectedLoan}
                  onChange={(e) => setSelectedLoan(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a loan</option>
                  {loans.map(loan => (
                    <option key={loan.id} value={loan.id}>
                      {loan.id} - ₹{loan.amount.toLocaleString()} ({loan.loanType})
                    </option>
                  ))}
                </select>
              </div>

              {currentTypeInfo?.requiresDateRange && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Date Range</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setQuickDateRange('current_month')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Current Month
                      </button>
                      <button
                        onClick={() => setQuickDateRange('last_month')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Last Month
                      </button>
                      <button
                        onClick={() => setQuickDateRange('current_year')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Current Year
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <div className="flex space-x-4">
                  {currentTypeInfo?.availableFormats.map(fmt => (
                    <label key={fmt} className="flex items-center">
                      <input
                        type="radio"
                        value={fmt}
                        checked={format === fmt}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">{fmt.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statement Preview</h3>
            
            {currentTypeInfo && selectedLoan ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${currentTypeInfo.bgColor}`}>
                  <div className="flex items-center space-x-3">
                    <currentTypeInfo.icon className={`h-6 w-6 ${currentTypeInfo.color}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{currentTypeInfo.name}</h4>
                      <p className="text-sm text-gray-600">Loan: {selectedLoan}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{format.toUpperCase()}</span>
                  </div>
                  {currentTypeInfo.requiresDateRange && fromDate && toDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium">
                        {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">2-5 minutes</span>
                  </div>
                </div>

                <button
                  onClick={handleRequestStatement}
                  disabled={!isFormValid}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Statement
                </button>

                <div className="text-xs text-gray-500 text-center">
                  Statement will be available for download for 7 days
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select statement type and loan to preview</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Statement History</h3>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search statements..."
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statement Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statementHistory.map((statement) => {
                  const statusDisplay = getStatusDisplay(statement.status);
                  const StatusIcon = statusDisplay.icon;
                  const typeInfo = statementTypes.find(t => t.id === statement.type);

                  return (
                    <tr key={statement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {typeInfo && (
                            <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                              <typeInfo.icon className={`h-4 w-4 ${typeInfo.color}`} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {typeInfo?.name || statement.type}
                            </div>
                            <div className="text-sm text-gray-500">
                              {statement.loanId} • {statement.format.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {statement.fromDate && statement.toDate ? (
                          <div>
                            <div>{new Date(statement.fromDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">to {new Date(statement.toDate).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(statement.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {statement.status === 'ready' && statement.downloadUrl && (
                            <>
                              <button
                                onClick={() => onDownloadStatement(statement.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowEmailModal(statement.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Email"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-900"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {statement.status === 'processing' && (
                            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {statementHistory.length === 0 && (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No statement history found.</p>
            </div>
          )}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Statement</h3>
              <button
                onClick={() => setShowEmailModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleEmailStatement(showEmailModal)}
                  disabled={!emailAddress}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowEmailModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanStatementDownload;