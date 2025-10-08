import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  CreditCard, 
  FileText, 
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  DollarSign,
  Clock
} from 'lucide-react';
import { LoanApplication, LoanStatus } from '../types';

interface LoanActionsProps {
  loan: LoanApplication;
  onAction: (actionType: string, loanId: string, data?: any) => void;
}

const LoanActions: React.FC<LoanActionsProps> = ({ loan, onAction }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      onAction('make_payment', loan.id, { amount: parseFloat(paymentAmount) });
      setPaymentAmount('');
      setShowPaymentModal(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAction('upload_document', loan.id, { files: Array.from(files) });
      setShowDocumentUpload(false);
    }
  };

  const getActionsForStatus = (status: LoanStatus) => {
    switch (status) {
      case 'pending':
        return [
          {
            id: 'view_application',
            label: 'View Application',
            icon: <Eye className="w-4 h-4" />,
            variant: 'primary',
            action: () => onAction('view_application', loan.id)
          },
          {
            id: 'upload_documents',
            label: 'Upload Documents',
            icon: <Upload className="w-4 h-4" />,
            variant: 'secondary',
            action: () => setShowDocumentUpload(true)
          },
          {
            id: 'check_status',
            label: 'Check Status',
            icon: <RefreshCw className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('check_status', loan.id)
          }
        ];

      case 'approved':
        return [
          {
            id: 'view_terms',
            label: 'View Loan Terms',
            icon: <FileText className="w-4 h-4" />,
            variant: 'primary',
            action: () => onAction('view_terms', loan.id)
          },
          {
            id: 'track_disbursement',
            label: 'Track Disbursement',
            icon: <Clock className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('track_disbursement', loan.id)
          },
          {
            id: 'download_agreement',
            label: 'Download Agreement',
            icon: <Download className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('download_agreement', loan.id)
          }
        ];

      case 'rejected':
        return [
          {
            id: 'view_rejection',
            label: 'View Rejection Details',
            icon: <AlertCircle className="w-4 h-4" />,
            variant: 'primary',
            action: () => onAction('view_rejection', loan.id)
          },
          {
            id: 'apply_again',
            label: 'Apply Again',
            icon: <RefreshCw className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('apply_again', loan.id)
          },
          {
            id: 'contact_support',
            label: 'Contact Support',
            icon: <FileText className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('contact_support', loan.id)
          }
        ];

      case 'active':
        return [
          {
            id: 'make_payment',
            label: 'Make Payment',
            icon: <CreditCard className="w-4 h-4" />,
            variant: 'primary',
            action: () => setShowPaymentModal(true)
          },
          {
            id: 'view_schedule',
            label: 'Payment Schedule',
            icon: <Calendar className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('view_schedule', loan.id)
          },
          {
            id: 'download_statement',
            label: 'Download Statement',
            icon: <Download className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('download_statement', loan.id)
          },
          {
            id: 'prepay_loan',
            label: 'Prepay Loan',
            icon: <DollarSign className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('prepay_loan', loan.id)
          }
        ];

      case 'completed':
        return [
          {
            id: 'download_certificate',
            label: 'Completion Certificate',
            icon: <CheckCircle className="w-4 h-4" />,
            variant: 'primary',
            action: () => onAction('download_certificate', loan.id)
          },
          {
            id: 'view_history',
            label: 'Payment History',
            icon: <FileText className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('view_history', loan.id)
          },
          {
            id: 'apply_new_loan',
            label: 'Apply New Loan',
            icon: <RefreshCw className="w-4 h-4" />,
            variant: 'secondary',
            action: () => onAction('apply_new_loan', loan.id)
          }
        ];

      default:
        return [];
    }
  };

  const actions = getActionsForStatus(loan.status);

  const getButtonClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'secondary':
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${getButtonClasses(action.variant)}`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Make Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max={loan.remainingAmount || loan.amount}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Monthly EMI: ₹{loan.monthlyEMI?.toLocaleString() || 'N/A'}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Documents
                </label>
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
              
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanActions;