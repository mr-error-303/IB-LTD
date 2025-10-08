import React, { useState, useMemo } from 'react';
import { LoanApplication } from '../types';
import { 
  Calendar, 
  DollarSign, 
  Filter, 
  Download, 
  Search, 
  TrendingUp, 
  TrendingDown,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowUpDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle
} from 'lucide-react';

interface RepaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  type: 'regular' | 'prepayment' | 'penalty' | 'late_fee' | 'partial';
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  transactionId: string;
  paymentMethod: 'bank_transfer' | 'upi' | 'card' | 'cash' | 'cheque';
  principalAmount: number;
  interestAmount: number;
  penaltyAmount?: number;
  outstandingAfterPayment: number;
  receiptUrl?: string;
  notes?: string;
}

interface RepaymentHistoryProps {
  loans: LoanApplication[];
  onDownloadReceipt: (recordId: string) => void;
  onDownloadStatement: (loanId: string, fromDate: string, toDate: string) => void;
}

interface FilterOptions {
  loanId: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  status: string;
  paymentMethod: string;
  amountMin: string;
  amountMax: string;
}

const RepaymentHistory: React.FC<RepaymentHistoryProps> = ({
  loans,
  onDownloadReceipt,
  onDownloadStatement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RepaymentRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const [filters, setFilters] = useState<FilterOptions>({
    loanId: '',
    dateFrom: '',
    dateTo: '',
    type: '',
    status: '',
    paymentMethod: '',
    amountMin: '',
    amountMax: ''
  });

  // Sample repayment history data
  const [repaymentRecords] = useState<RepaymentRecord[]>([
    {
      id: 'REP001',
      loanId: 'LOAN001',
      amount: 5000,
      date: '2024-01-15',
      type: 'regular',
      status: 'completed',
      transactionId: 'TXN001',
      paymentMethod: 'upi',
      principalAmount: 3500,
      interestAmount: 1500,
      outstandingAfterPayment: 95000,
      receiptUrl: '/receipts/REP001.pdf'
    },
    {
      id: 'REP002',
      loanId: 'LOAN001',
      amount: 5000,
      date: '2024-02-15',
      type: 'regular',
      status: 'completed',
      transactionId: 'TXN002',
      paymentMethod: 'bank_transfer',
      principalAmount: 3600,
      interestAmount: 1400,
      outstandingAfterPayment: 91400,
      receiptUrl: '/receipts/REP002.pdf'
    },
    {
      id: 'REP003',
      loanId: 'LOAN002',
      amount: 15000,
      date: '2024-01-20',
      type: 'prepayment',
      status: 'completed',
      transactionId: 'TXN003',
      paymentMethod: 'bank_transfer',
      principalAmount: 15000,
      interestAmount: 0,
      outstandingAfterPayment: 185000,
      receiptUrl: '/receipts/REP003.pdf',
      notes: 'Partial prepayment to reduce tenure'
    },
    {
      id: 'REP004',
      loanId: 'LOAN001',
      amount: 5200,
      date: '2024-03-18',
      type: 'regular',
      status: 'completed',
      transactionId: 'TXN004',
      paymentMethod: 'card',
      principalAmount: 3600,
      interestAmount: 1400,
      penaltyAmount: 200,
      outstandingAfterPayment: 87800,
      receiptUrl: '/receipts/REP004.pdf',
      notes: 'Late payment penalty applied'
    },
    {
      id: 'REP005',
      loanId: 'LOAN003',
      amount: 2500,
      date: '2024-03-20',
      type: 'partial',
      status: 'pending',
      transactionId: 'TXN005',
      paymentMethod: 'upi',
      principalAmount: 2000,
      interestAmount: 500,
      outstandingAfterPayment: 47500
    }
  ]);

  // Filter and search records
  const filteredRecords = useMemo(() => {
    let filtered = repaymentRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLoanId = filters.loanId === '' || record.loanId === filters.loanId;
      const matchesType = filters.type === '' || record.type === filters.type;
      const matchesStatus = filters.status === '' || record.status === filters.status;
      const matchesPaymentMethod = filters.paymentMethod === '' || record.paymentMethod === filters.paymentMethod;

      const recordDate = new Date(record.date);
      const matchesDateFrom = filters.dateFrom === '' || recordDate >= new Date(filters.dateFrom);
      const matchesDateTo = filters.dateTo === '' || recordDate <= new Date(filters.dateTo);

      const matchesAmountMin = filters.amountMin === '' || record.amount >= parseFloat(filters.amountMin);
      const matchesAmountMax = filters.amountMax === '' || record.amount <= parseFloat(filters.amountMax);

      return matchesSearch && matchesLoanId && matchesType && matchesStatus && 
             matchesPaymentMethod && matchesDateFrom && matchesDateTo && 
             matchesAmountMin && matchesAmountMax;
    });

    // Sort records
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [repaymentRecords, searchTerm, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalPaid = repaymentRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalPrincipal = repaymentRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.principalAmount, 0);

    const totalInterest = repaymentRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.interestAmount, 0);

    const totalPenalties = repaymentRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);

    const completedPayments = repaymentRecords.filter(r => r.status === 'completed').length;
    const pendingPayments = repaymentRecords.filter(r => r.status === 'pending').length;
    const failedPayments = repaymentRecords.filter(r => r.status === 'failed').length;

    // Enhanced analytics
    const averagePaymentAmount = completedPayments > 0 ? totalPaid / completedPayments : 0;
    const onTimePayments = repaymentRecords.filter(r => r.status === 'completed' && !r.penaltyAmount).length;
    const latePayments = repaymentRecords.filter(r => r.status === 'completed' && r.penaltyAmount).length;
    const onTimeRate = completedPayments > 0 ? (onTimePayments / completedPayments) * 100 : 0;
    
    // Payment method distribution
    const paymentMethods = repaymentRecords.reduce((acc, record) => {
      if (record.status === 'completed') {
        acc[record.paymentMethod] = (acc[record.paymentMethod] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthPayments = repaymentRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getFullYear() === date.getFullYear() && 
               recordDate.getMonth() === date.getMonth() &&
               r.status === 'completed';
      });

      monthlyTrends.push({
        month: monthKey,
        totalAmount: monthPayments.reduce((sum, r) => sum + r.amount, 0),
        paymentCount: monthPayments.length,
        principalPaid: monthPayments.reduce((sum, r) => sum + r.principalAmount, 0),
        interestPaid: monthPayments.reduce((sum, r) => sum + r.interestAmount, 0)
      });
    }

    return {
      totalPaid,
      totalPrincipal,
      totalInterest,
      totalPenalties,
      completedPayments,
      pendingPayments,
      failedPayments,
      averagePaymentAmount,
      onTimePayments,
      latePayments,
      onTimeRate,
      paymentMethods,
      monthlyTrends
    };
  }, [repaymentRecords]);

  // Get status display
  const getStatusDisplay = (status: RepaymentRecord['status']) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
      case 'failed':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
      case 'reversed':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: TrendingDown };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText };
    }
  };

  // Get payment type display
  const getTypeDisplay = (type: RepaymentRecord['type']) => {
    const displays = {
      regular: { label: 'Regular EMI', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      prepayment: { label: 'Prepayment', color: 'text-green-600', bgColor: 'bg-green-100' },
      penalty: { label: 'Penalty', color: 'text-red-600', bgColor: 'bg-red-100' },
      late_fee: { label: 'Late Fee', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      partial: { label: 'Partial Payment', color: 'text-purple-600', bgColor: 'bg-purple-100' }
    };
    return displays[type] || displays.regular;
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      loanId: '',
      dateFrom: '',
      dateTo: '',
      type: '',
      status: '',
      paymentMethod: '',
      amountMin: '',
      amountMax: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Repayment History</h2>
            <p className="text-gray-600">Track all your loan payments and transactions</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => onDownloadStatement('', '', '')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Paid</p>
                <p className="text-lg font-bold text-green-900">₹{analytics.totalPaid.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Principal Paid</p>
                <p className="text-lg font-bold text-blue-900">₹{analytics.totalPrincipal.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Interest Paid</p>
                <p className="text-lg font-bold text-orange-900">₹{analytics.totalInterest.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed Payments</p>
                <p className="text-lg font-bold text-purple-900">{analytics.completedPayments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Performance */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Payment Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On-time Rate</span>
                <span className="text-sm font-semibold text-green-600">{analytics.onTimeRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Payment</span>
                <span className="text-sm font-semibold text-gray-900">₹{analytics.averagePaymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Late Payments</span>
                <span className="text-sm font-semibold text-red-600">{analytics.latePayments}</span>
              </div>
              {analytics.totalPenalties > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Penalties</span>
                  <span className="text-sm font-semibold text-red-600">₹{analytics.totalPenalties.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-600" />
              Payment Methods
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.paymentMethods).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Trends
            </h3>
            <div className="space-y-3">
              {analytics.monthlyTrends.slice(-3).map((trend) => (
                <div key={trend.month} className="border-b border-gray-100 pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{trend.month}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{trend.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {trend.paymentCount} payments
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by loan ID, transaction ID, or payment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan ID</label>
                <select
                  value={filters.loanId}
                  onChange={(e) => setFilters(prev => ({ ...prev, loanId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Loans</option>
                  {loans.map(loan => (
                    <option key={loan.id} value={loan.id}>{loan.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="regular">Regular EMI</option>
                  <option value="prepayment">Prepayment</option>
                  <option value="penalty">Penalty</option>
                  <option value="late_fee">Late Fee</option>
                  <option value="partial">Partial Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Methods</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={filters.amountMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="₹∞"
                  value={filters.amountMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Breakdown
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRecords.map((record) => {
                const statusDisplay = getStatusDisplay(record.status);
                const typeDisplay = getTypeDisplay(record.type);
                const StatusIcon = statusDisplay.icon;

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{record.transactionId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.loanId}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeDisplay.bgColor} ${typeDisplay.color}`}>
                          {typeDisplay.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">₹{record.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          P: ₹{record.principalAmount.toLocaleString()} | 
                          I: ₹{record.interestAmount.toLocaleString()}
                          {record.penaltyAmount && ` | Penalty: ₹${record.penaltyAmount.toLocaleString()}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.paymentMethod.replace('_', ' ').toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {record.receiptUrl && (
                          <button
                            onClick={() => onDownloadReceipt(record.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * recordsPerPage, filteredRecords.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRecords.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {filteredRecords.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No repayment records found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900">{selectedRecord.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan ID</label>
                  <p className="text-sm text-gray-900">{selectedRecord.loanId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">
                    {selectedRecord.paymentMethod.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-lg font-bold text-gray-900">₹{selectedRecord.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Principal Amount</label>
                  <p className="text-sm text-gray-900">₹{selectedRecord.principalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Amount</label>
                  <p className="text-sm text-gray-900">₹{selectedRecord.interestAmount.toLocaleString()}</p>
                </div>
                {selectedRecord.penaltyAmount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penalty Amount</label>
                    <p className="text-sm text-red-600">₹{selectedRecord.penaltyAmount.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outstanding After Payment</label>
                  <p className="text-sm text-gray-900">₹{selectedRecord.outstandingAfterPayment.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {selectedRecord.notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedRecord.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              {selectedRecord.receiptUrl && (
                <button
                  onClick={() => onDownloadReceipt(selectedRecord.id)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Receipt</span>
                </button>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
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

export default RepaymentHistory;