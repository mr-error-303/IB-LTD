import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, CurrencyRupeeIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { LoanSchedule, InstallmentSchedule, EMICalculator } from '../../utils/emiCalculator';

interface EMIScheduleModalProps {
  loanSchedule: LoanSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePayment: (installmentNumber: number, paidAmount: number) => void;
}

const EMIScheduleModal: React.FC<EMIScheduleModalProps> = ({
  loanSchedule,
  isOpen,
  onClose,
  onUpdatePayment
}) => {
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentSchedule | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && loanSchedule) {
      // Update overdue status when modal opens
      const updatedSchedule = EMICalculator.updateOverdueStatus(loanSchedule);
      if (updatedSchedule !== loanSchedule) {
        // In a real app, this would trigger a state update in the parent component
      }
    }
  }, [isOpen, loanSchedule]);

  if (!isOpen || !loanSchedule) return null;

  const paymentSummary = EMICalculator.getPaymentSummary(loanSchedule);

  const handlePaymentSubmit = async () => {
    if (!selectedInstallment || !paymentAmount) return;

    try {
      const paymentAmountNum = parseFloat(paymentAmount);
      const dueAmount = selectedInstallment.emiAmount + (selectedInstallment.lateFee || 0);
      
      // Validate payment amount
      if (paymentAmountNum <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }

      if (paymentAmountNum > dueAmount * 1.1) { // Allow 10% overpayment
        alert('Payment amount cannot exceed 110% of the due amount');
        return;
      }

      setIsProcessingPayment(true);
      
      // Show processing notification
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = 'Processing payment...';
      document.body.appendChild(processingToast);

      // Simulate real-time payment processing with multiple steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update processing message
      processingToast.textContent = 'Verifying payment details...';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      processingToast.textContent = 'Updating loan records...';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      processingToast.textContent = 'Generating receipt...';
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process the payment
      onUpdatePayment(selectedInstallment.installmentNumber, paymentAmountNum);
      
      // Remove processing toast
      document.body.removeChild(processingToast);
      
      // Show success notification with payment details
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      
      const paymentStatus = paymentAmountNum >= dueAmount ? 'fully paid' : 'partially paid';
      successToast.textContent = `Payment of ${formatCurrency(paymentAmountNum)} recorded successfully! Installment ${paymentStatus}.`;
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 4000);

      // Log payment action
      console.log(`EMI payment recorded for loan ${loanSchedule?.loanId}`, {
        installmentNumber: selectedInstallment.installmentNumber,
        paidAmount: paymentAmountNum,
        dueAmount: dueAmount,
        paymentStatus: paymentStatus,
        remainingBalance: Math.max(0, dueAmount - paymentAmountNum),
        timestamp: new Date().toISOString()
      });

      // Reset form
      setSelectedInstallment(null);
      setPaymentAmount('');
      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Remove any existing toasts
      const existingToasts = document.querySelectorAll('.fixed.top-4.right-4');
      existingToasts.forEach(toast => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      });
      
      // Show error notification
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorToast.textContent = 'Payment processing failed. Please try again.';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);

      setIsProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-4 h-4" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'partial': return <ClockIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">EMI Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              {loanSchedule.borrowerName} - Loan ID: {loanSchedule.loanId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel - Loan Summary */}
          <div className="lg:w-1/3 p-6 bg-gray-50 border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Summary</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="font-medium">{formatCurrency(loanSchedule.loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="font-medium">{loanSchedule.interestRate}% APR</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Loan Term</span>
                  <span className="font-medium">{loanSchedule.loanTerm} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly EMI</span>
                  <span className="font-medium text-blue-600">{formatCurrency(loanSchedule.emiDetails.monthlyEMI)}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3">Payment Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Paid Installments</span>
                    <span className="font-medium text-green-600">{paymentSummary.paidInstallments}/{paymentSummary.totalInstallments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-medium text-red-600">{paymentSummary.overdueInstallments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-medium">{formatCurrency(loanSchedule.totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-medium">{formatCurrency(loanSchedule.remainingAmount)}</span>
                  </div>
                  {paymentSummary.totalLateFees > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Late Fees</span>
                      <span className="font-medium text-red-600">{formatCurrency(paymentSummary.totalLateFees)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(paymentSummary.paymentProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${paymentSummary.paymentProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {loanSchedule.nextDueDate && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Next Due Date</p>
                      <p className="text-sm text-yellow-600">{loanSchedule.nextDueDate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Installment Schedule */}
          <div className="lg:w-2/3 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Installment Schedule</h3>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
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
                    {loanSchedule.installments.map((installment) => (
                      <tr key={installment.installmentNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {installment.installmentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {installment.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(installment.emiAmount)}
                          {installment.lateFee && (
                            <div className="text-xs text-red-600">
                              +{formatCurrency(installment.lateFee)} late fee
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(installment.principalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(installment.interestAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(installment.remainingBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(installment.status)}`}>
                            {getStatusIcon(installment.status)}
                            <span className="ml-1 capitalize">{installment.status}</span>
                          </span>
                          {installment.paidAmount && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid: {formatCurrency(installment.paidAmount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(installment.status === 'pending' || installment.status === 'overdue' || installment.status === 'partial') && (
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setPaymentAmount(installment.emiAmount.toString());
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {selectedInstallment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Record Payment - Installment #{selectedInstallment.installmentNumber}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Amount
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedInstallment.emiAmount + (selectedInstallment.lateFee || 0))}
                    </p>
                    {selectedInstallment.lateFee && (
                      <p className="text-sm text-red-600">
                        (Includes {formatCurrency(selectedInstallment.lateFee)} late fee)
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter payment amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedInstallment(null);
                      setPaymentAmount('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessingPayment}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Record Payment'
                    )}
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

export default EMIScheduleModal;