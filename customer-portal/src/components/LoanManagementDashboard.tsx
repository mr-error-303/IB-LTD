import React, { useState, useEffect } from 'react';
import { LoanApplication } from '../types';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calculator,
  FileText,
  ArrowRight,
  Eye,
  Filter,
  X
} from 'lucide-react';
import { realtimeService } from '../services/realtimeService';

interface LoanManagementDashboardProps {
  loans: LoanApplication[];
  onMakePayment: (loanId: string, amount: number) => void;
  onPrepayment: (loanId: string, amount: number) => void;
  onDownloadStatement: (loanId: string, period: string) => void;
}

interface RepaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  type: 'regular' | 'prepayment' | 'penalty';
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
}

interface PrepaymentCalculation {
  currentOutstanding: number;
  prepaymentAmount: number;
  newOutstanding: number;
  interestSaved: number;
  newEMI: number;
  tenureReduction: number;
}

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const LoanManagementDashboard: React.FC<LoanManagementDashboardProps> = ({
  loans,
  onMakePayment,
  onPrepayment,
  onDownloadStatement
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'prepayment' | 'statements'>('overview');
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0);
  const [prepaymentCalc, setPrepaymentCalc] = useState<PrepaymentCalculation | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sample repayment history data
  const [repaymentHistory] = useState<RepaymentRecord[]>([
    {
      id: 'REP001',
      loanId: 'LOAN001',
      amount: 5000,
      date: '2024-01-15',
      type: 'regular',
      status: 'completed',
      transactionId: 'TXN001'
    },
    {
      id: 'REP002',
      loanId: 'LOAN001',
      amount: 5000,
      date: '2024-02-15',
      type: 'regular',
      status: 'completed',
      transactionId: 'TXN002'
    },
    {
      id: 'REP003',
      loanId: 'LOAN002',
      amount: 15000,
      date: '2024-01-20',
      type: 'prepayment',
      status: 'completed',
      transactionId: 'TXN003'
    }
  ]);

  // Filter active loans
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const completedLoans = loans.filter(loan => loan.status === 'completed');

  // Get filtered loans based on status
  const getFilteredLoans = () => {
    switch (filterStatus) {
      case 'active':
        return activeLoans;
      case 'completed':
        return completedLoans;
      default:
        return [...activeLoans, ...completedLoans];
    }
  };

  // Calculate next EMI due
  const getNextEMIDue = () => {
    const nextDue = activeLoans
      .filter(loan => loan.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())[0];
    
    return nextDue;
  };

  // Calculate prepayment impact
  const calculatePrepayment = (loan: LoanApplication, amount: number): PrepaymentCalculation => {
    const currentOutstanding = loan.remainingAmount || 0;
    const newOutstanding = Math.max(0, currentOutstanding - amount);
    const interestRate = loan.interestRate / 100 / 12;
    const remainingTenure = Math.ceil(currentOutstanding / (loan.monthlyEMI || 1));
    
    // Simplified calculation
    const interestSaved = amount * (loan.interestRate / 100) * (remainingTenure / 12);
    const newTenure = newOutstanding > 0 ? Math.ceil(newOutstanding / (loan.monthlyEMI || 1)) : 0;
    const tenureReduction = remainingTenure - newTenure;
    
    return {
      currentOutstanding,
      prepaymentAmount: amount,
      newOutstanding,
      interestSaved,
      newEMI: loan.monthlyEMI || 0,
      tenureReduction
    };
  };

  // Handle prepayment calculation
  useEffect(() => {
    if (selectedLoan && prepaymentAmount > 0) {
      const loan = loans.find(l => l.id === selectedLoan);
      if (loan) {
        setPrepaymentCalc(calculatePrepayment(loan, prepaymentAmount));
      }
    } else {
      setPrepaymentCalc(null);
    }
  }, [selectedLoan, prepaymentAmount, loans]);

  // Real-time event listeners for loan management updates
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    // Subscribe to loan management events
    const unsubscribe = realtimeService.subscribe(`user_${userEmail}`, (data: any) => {
      const generateId = () => Math.random().toString(36).substr(2, 9);

      switch (data.type) {
        case 'loanApproval':
          setNotifications(prev => [...prev, {
            id: generateId(),
            type: 'success',
            title: 'Loan Approved',
            message: `Loan #${data.applicationId} approved and added to your portfolio`
          }]);
          break;
        case 'loanDisbursement':
          setNotifications(prev => [...prev, {
            id: generateId(),
            type: 'success',
            title: 'Loan Disbursed',
            message: `Loan #${data.applicationId} disbursed - ${data.disbursedAmount} credited to your account`
          }]);
          break;
        case 'paymentReminder':
          setNotifications(prev => [...prev, {
            id: generateId(),
            type: 'warning',
            title: 'Payment Reminder',
            message: `EMI due for loan #${data.loanId} on ${data.dueDate}`
          }]);
          break;
        case 'paymentProcessed':
          setNotifications(prev => [...prev, {
            id: generateId(),
            type: 'success',
            title: 'Payment Processed',
            message: `Payment of ${data.amount} processed for loan #${data.loanId}`
          }]);
          break;
        default:
          break;
      }
    });

    // Auto-clear notifications after 8 seconds
    const clearNotifications = setTimeout(() => {
      setNotifications([]);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(clearNotifications);
    };
  }, []);

  // Clear individual notifications
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const nextEMI = getNextEMIDue();
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
  const totalMonthlyEMI = activeLoans.reduce((sum, loan) => sum + (loan.monthlyEMI || 0), 0);

  return (
    <div className="space-y-6">
      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Management Dashboard</h2>
        <p className="text-gray-600">Manage your loans, track payments, and explore prepayment options</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{activeLoans.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalOutstanding.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly EMI</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalMonthlyEMI.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next EMI Due</p>
              <p className="text-lg font-bold text-gray-900">
                {nextEMI ? new Date(nextEMI.nextPaymentDate!).toLocaleDateString() : 'No due date'}
              </p>
              {nextEMI && (
                <p className="text-sm text-gray-600">₹{nextEMI.monthlyEMI?.toLocaleString()}</p>
              )}
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'history', label: 'Repayment History', icon: FileText },
              { id: 'prepayment', label: 'Prepayment Options', icon: Calculator },
              { id: 'statements', label: 'Statements', icon: Download }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Current Active Loans</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Loans</option>
                    <option value="active">Active Only</option>
                    <option value="completed">Completed Only</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {getFilteredLoans().map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          loan.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <h4 className="font-semibold text-gray-900">
                          {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} Loan
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Loan ID</p>
                        <p className="font-medium text-gray-900">{loan.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Principal Amount</p>
                        <p className="font-semibold text-gray-900">₹{loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="font-semibold text-gray-900">₹{(loan.remainingAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly EMI</p>
                        <p className="font-semibold text-gray-900">₹{(loan.monthlyEMI || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="font-semibold text-gray-900">{loan.interestRate}% p.a.</p>
                      </div>
                    </div>

                    {loan.status === 'active' && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">Next EMI Due</p>
                            <p className="font-medium text-gray-900">
                              {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          {loan.nextPaymentDate && new Date(loan.nextPaymentDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Due Soon</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLoan(loan.id);
                            setPaymentAmount(loan.monthlyEMI || 0);
                            setShowPaymentModal(true);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Pay EMI
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {getFilteredLoans().length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No loans found for the selected filter.</p>
                </div>
              )}
            </div>
          )}

          {/* Repayment History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Repayment History</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {repaymentHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{record.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'regular' 
                              ? 'bg-blue-100 text-blue-800'
                              : record.type === 'prepayment'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.transactionId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {repaymentHistory.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No repayment history available.</p>
                </div>
              )}
            </div>
          )}

          {/* Prepayment Options Tab */}
          {activeTab === 'prepayment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Prepayment Calculator</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Loan
                    </label>
                    <select
                      value={selectedLoan}
                      onChange={(e) => setSelectedLoan(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Choose a loan</option>
                      {activeLoans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.id} - {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} Loan
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedLoan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prepayment Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={prepaymentAmount}
                        onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter amount"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {prepaymentCalc && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Prepayment Impact</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Outstanding:</span>
                        <span className="font-medium">₹{prepaymentCalc.currentOutstanding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prepayment Amount:</span>
                        <span className="font-medium">₹{prepaymentCalc.prepaymentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Outstanding:</span>
                        <span className="font-medium">₹{prepaymentCalc.newOutstanding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Interest Saved:</span>
                        <span className="font-medium">₹{prepaymentCalc.interestSaved.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Tenure Reduction:</span>
                        <span className="font-medium">{prepaymentCalc.tenureReduction} months</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        onPrepayment(selectedLoan, prepaymentAmount);
                        setPrepaymentAmount(0);
                        setSelectedLoan('');
                      }}
                      className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Make Prepayment
                    </button>
                  </div>
                )}
              </div>

              {!selectedLoan && (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a loan to calculate prepayment benefits.</p>
                </div>
              )}
            </div>
          )}

          {/* Statements Tab */}
          {activeTab === 'statements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Loan Statements</h3>
              
              <div className="grid gap-4">
                {[...activeLoans, ...completedLoans].map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} Loan - {loan.id}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Principal: ₹{loan.amount.toLocaleString()} | 
                          Status: {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['monthly', 'quarterly', 'annual'].map((period) => (
                        <button
                          key={period}
                          onClick={() => onDownloadStatement(loan.id, period)}
                          className="flex items-center justify-center space-x-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span className="capitalize">{period} Statement</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {[...activeLoans, ...completedLoans].length === 0 && (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No loan statements available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Payment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onMakePayment(selectedLoan, paymentAmount);
                  setShowPaymentModal(false);
                  setPaymentAmount(0);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagementDashboard;