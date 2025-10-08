import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Trophy,
  AlertCircle,
  Calendar,
  CreditCard
} from 'lucide-react';
import { LoanApplication, LoanStatus, LoanStatusInfo } from '../types';
import LoanActions from './LoanActions';

interface LoanStatusTrackerProps {
  loan: LoanApplication;
  showDetails?: boolean;
  onAction?: (actionType: string, loanId: string, data?: any) => void;
}

const LoanStatusTracker: React.FC<LoanStatusTrackerProps> = ({ 
  loan, 
  showDetails = true,
  onAction 
}) => {
  const getStatusInfo = (status: LoanStatus): LoanStatusInfo => {
    switch (status) {
      case 'pending':
        return {
          status: 'pending',
          title: 'Application Pending',
          description: 'Your loan application is under review by our team',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: 'clock',
          actions: ['View Application', 'Upload Additional Documents']
        };
      case 'approved':
        return {
          status: 'approved',
          title: 'Loan Approved',
          description: 'Congratulations! Your loan has been approved and will be disbursed soon',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: 'check-circle',
          actions: ['View Loan Terms', 'Track Disbursement']
        };
      case 'rejected':
        return {
          status: 'rejected',
          title: 'Application Rejected',
          description: loan.rejectionReason || 'Your loan application could not be approved at this time',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          icon: 'x-circle',
          actions: ['View Rejection Details', 'Apply Again']
        };
      case 'active':
        return {
          status: 'active',
          title: 'Loan Active',
          description: 'Your loan is active. Make timely payments to maintain good credit',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          icon: 'dollar-sign',
          actions: ['Make Payment', 'View Payment Schedule', 'Download Statement']
        };
      case 'completed':
        return {
          status: 'completed',
          title: 'Loan Completed',
          description: 'Congratulations! You have successfully repaid your loan',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
          icon: 'trophy',
          actions: ['Download Completion Certificate', 'View Payment History']
        };
      default:
        return {
          status: 'pending',
          title: 'Unknown Status',
          description: 'Status information unavailable',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: 'alert-circle',
          actions: []
        };
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    const iconProps = { className };
    switch (iconName) {
      case 'clock':
        return <Clock {...iconProps} />;
      case 'check-circle':
        return <CheckCircle {...iconProps} />;
      case 'x-circle':
        return <XCircle {...iconProps} />;
      case 'dollar-sign':
        return <DollarSign {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusInfo = getStatusInfo(loan.status);

  return (
    <div className={`border rounded-lg p-6 ${statusInfo.bgColor}`}>
      {/* Status Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {renderIcon(statusInfo.icon, `w-6 h-6 ${statusInfo.color}`)}
          <div>
            <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {statusInfo.description}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor} border`}>
          {loan.status.toUpperCase()}
        </span>
      </div>

      {/* Loan Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Loan Amount</p>
          <p className="font-semibold">{formatCurrency(loan.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Loan Type</p>
          <p className="font-semibold capitalize">{loan.loanType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Application Date</p>
          <p className="font-semibold">{formatDate(loan.applicationDate.toISOString())}</p>
        </div>
      </div>

      {/* Status-Specific Details */}
      {showDetails && (
        <div className="space-y-4">
          {/* Active Loan Details */}
          {loan.status === 'active' && (
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Repayment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly EMI</p>
                  <p className="font-semibold text-blue-600">
                    {loan.monthlyEMI ? formatCurrency(loan.monthlyEMI) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-semibold text-green-600">
                    {loan.paidAmount ? formatCurrency(loan.paidAmount) : '₹0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="font-semibold text-orange-600">
                    {loan.remainingAmount ? formatCurrency(loan.remainingAmount) : formatCurrency(loan.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Payment</p>
                  <p className="font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate.toISOString()) : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              {loan.paidAmount && loan.totalAmount && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Repayment Progress</span>
                    <span>{Math.round((loan.paidAmount / loan.totalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(loan.paidAmount / loan.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approved Loan Details */}
          {loan.status === 'approved' && (
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">Approval Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Approved Amount</p>
                  <p className="font-semibold text-green-600">{formatCurrency(loan.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approval Date</p>
                  <p className="font-semibold">
                    {loan.approvalDate ? formatDate(loan.approvalDate.toISOString()) : 'Recently Approved'}
                  </p>
                </div>
                {loan.monthlyEMI && (
                  <div>
                    <p className="text-sm text-gray-500">Monthly EMI</p>
                    <p className="font-semibold">{formatCurrency(loan.monthlyEMI)}</p>
                  </div>
                )}
                {loan.disbursementDate && (
                  <div>
                    <p className="text-sm text-gray-500">Disbursement Date</p>
                    <p className="font-semibold">{formatDate(loan.disbursementDate.toISOString())}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Loan Details */}
          {loan.status === 'completed' && (
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">Completion Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-semibold text-green-600">
                    {loan.totalAmount ? formatCurrency(loan.totalAmount) : formatCurrency(loan.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Date</p>
                  <p className="font-semibold">
                    {loan.completionDate ? formatDate(loan.completionDate.toISOString()) : 'Recently Completed'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loan Duration</p>
                  <p className="font-semibold">{loan.repaymentPeriod} months</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {onAction && (
            <LoanActions 
              loan={loan} 
              onAction={onAction}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LoanStatusTracker;