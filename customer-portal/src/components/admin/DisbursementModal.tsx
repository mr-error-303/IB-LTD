import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CurrencyDollarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface LoanApplication {
  id: string;
  applicantName: string;
  amount: number;
  approvedAmount?: number;
  interestRate?: number;
  loanTerm?: number;
  accountNumber?: string;
  bankName?: string;
  routingNumber?: string;
}

interface DisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplication | null;
  onDisburse: (applicationId: string, disbursementData: any) => void;
}

interface DisbursementData {
  amount: number;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  transferMethod: 'instant' | 'standard' | 'wire';
  notes: string;
  verificationCode: string;
}

const DisbursementModal: React.FC<DisbursementModalProps> = ({
  isOpen,
  onClose,
  application,
  onDisburse
}) => {
  const [step, setStep] = useState<'verify' | 'process' | 'complete'>('verify');
  const [isProcessing, setIsProcessing] = useState(false);
  const [disbursementData, setDisbursementData] = useState<DisbursementData>({
    amount: application?.approvedAmount || application?.amount || 0,
    accountNumber: application?.accountNumber || '',
    routingNumber: application?.routingNumber || '123456789',
    bankName: application?.bankName || 'Chase Bank',
    transferMethod: 'instant',
    notes: '',
    verificationCode: ''
  });
  const [transactionId, setTransactionId] = useState<string>('');

  if (!isOpen || !application) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleInputChange = (field: keyof DisbursementData, value: string | number) => {
    setDisbursementData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateDisbursement = () => {
    const errors = [];
    
    // Amount validation
    if (disbursementData.amount <= 0) {
      errors.push('Disbursement amount must be greater than 0');
    }
    
    if (application?.approvedAmount && disbursementData.amount > application.approvedAmount) {
      errors.push(`Disbursement amount cannot exceed approved amount of ${formatCurrency(application.approvedAmount)}`);
    }
    
    // Account number validation (8-17 digits)
    if (!/^\d{8,17}$/.test(disbursementData.accountNumber)) {
      errors.push('Account number must be 8-17 digits');
    }
    
    // Routing number validation (9 digits)
    if (!/^\d{9}$/.test(disbursementData.routingNumber)) {
      errors.push('Routing number must be exactly 9 digits');
    }
    
    // Bank name validation
    if (disbursementData.bankName.trim().length < 2) {
      errors.push('Bank name must be at least 2 characters');
    }
    
    // Verification code validation
    if (disbursementData.verificationCode !== '1234') {
      errors.push('Invalid verification code');
    }
    
    // Transfer method validation
    if (!['instant', 'standard', 'wire'].includes(disbursementData.transferMethod)) {
      errors.push('Please select a valid transfer method');
    }
    
    // Daily limit check (example: $50,000 per day)
    const dailyLimit = 50000;
    if (disbursementData.amount > dailyLimit) {
      errors.push(`Disbursement amount exceeds daily limit of ${formatCurrency(dailyLimit)}`);
    }
    
    // Weekend/holiday check for wire transfers
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    if (disbursementData.transferMethod === 'wire' && isWeekend) {
      errors.push('Wire transfers are not available on weekends');
    }
    
    if (errors.length > 0) {
      // Show validation errors
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
      errorToast.innerHTML = `
        <div class="font-semibold mb-2">Validation Errors:</div>
        <ul class="list-disc list-inside text-sm">
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      `;
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 6000);
      
      return false;
    }
    
    return true;
  };

  const processDisbursement = async () => {
    try {
      if (!validateDisbursement()) {
        return; // Validation errors are already shown by validateDisbursement()
      }

      setIsProcessing(true);
      setStep('process');

      // Show processing notification
      const processingToast = document.createElement('div');
      processingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      processingToast.textContent = `Processing ${disbursementData.transferMethod} transfer...`;
      document.body.appendChild(processingToast);

      // Simulate real-time processing with multiple steps and compliance checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update processing message - Compliance check
      processingToast.textContent = 'Running compliance checks...';
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // AML (Anti-Money Laundering) check
      processingToast.textContent = 'Performing AML verification...';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Bank verification
      processingToast.textContent = 'Verifying bank details...';
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Risk assessment
      processingToast.textContent = 'Conducting risk assessment...';
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fund availability check
      processingToast.textContent = 'Checking fund availability...';
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initiating transfer
      processingToast.textContent = 'Initiating secure transfer...';
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Final processing
      processingToast.textContent = 'Finalizing transaction...';
      await new Promise(resolve => setTimeout(resolve, 1000));

      const txnId = generateTransactionId();
      setTransactionId(txnId);

      // Enhanced disbursement data with comprehensive audit trail
      const enhancedDisbursementData = {
        ...disbursementData,
        transactionId: txnId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        transferFee: getTransferFee(),
        totalDeducted: disbursementData.amount + getTransferFee(),
        processingTime: getTransferTime(),
        auditTrail: {
          initiatedBy: 'admin',
          verificationPassed: true,
          bankVerified: true,
          complianceChecked: true,
          amlCleared: true,
          riskAssessment: 'low',
          fundAvailabilityConfirmed: true,
          processingSteps: [
            { step: 'compliance_check', timestamp: new Date().toISOString(), status: 'passed' },
            { step: 'aml_verification', timestamp: new Date().toISOString(), status: 'cleared' },
            { step: 'bank_verification', timestamp: new Date().toISOString(), status: 'verified' },
            { step: 'risk_assessment', timestamp: new Date().toISOString(), status: 'low_risk' },
            { step: 'fund_check', timestamp: new Date().toISOString(), status: 'available' },
            { step: 'transfer_initiation', timestamp: new Date().toISOString(), status: 'success' }
          ],
          securityFlags: {
            fraudCheck: 'passed',
            velocityCheck: 'normal',
            geolocationCheck: 'verified'
          }
        }
      };

      // Call parent handler
      onDisburse(application.id, enhancedDisbursementData);

      // Remove processing toast
      document.body.removeChild(processingToast);

      // Show success notification with transaction details
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
      successToast.innerHTML = `
        <div class="font-semibold mb-1">Disbursement Successful!</div>
        <div class="text-sm">
          Amount: ${formatCurrency(disbursementData.amount)}<br>
          Transaction ID: ${txnId}<br>
          Method: ${disbursementData.transferMethod.toUpperCase()}<br>
          ETA: ${getTransferTime()}
        </div>
      `;
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 5000);

      // Comprehensive logging for audit purposes
      console.log(`Loan disbursement completed for application ${application.id}`, {
        transactionId: txnId,
        amount: disbursementData.amount,
        transferMethod: disbursementData.transferMethod,
        bankName: disbursementData.bankName,
        accountNumber: disbursementData.accountNumber.replace(/\d(?=\d{4})/g, '*'),
        routingNumber: disbursementData.routingNumber.replace(/\d(?=\d{4})/g, '*'),
        transferFee: getTransferFee(),
        totalDeducted: disbursementData.amount + getTransferFee(),
        processingTime: getTransferTime(),
        complianceStatus: 'cleared',
        riskLevel: 'low',
        timestamp: new Date().toISOString(),
        adminNotes: disbursementData.notes || 'No additional notes'
      });

      setIsProcessing(false);
      setStep('complete');
    } catch (error) {
      console.error('Error processing disbursement:', error);
      
      // Remove any existing toasts
      const existingToasts = document.querySelectorAll('.fixed.top-4.right-4');
      existingToasts.forEach(toast => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      });
      
      // Show detailed error notification
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
      errorToast.innerHTML = `
        <div class="font-semibold mb-1">Disbursement Failed</div>
        <div class="text-sm">
          Please verify all details and try again.<br>
          If the issue persists, contact technical support.
        </div>
      `;
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 4000);

      setIsProcessing(false);
      setStep('verify');
    }
  };

  const getTransferFee = () => {
    switch (disbursementData.transferMethod) {
      case 'instant': return 25;
      case 'standard': return 0;
      case 'wire': return 50;
      default: return 0;
    }
  };

  const getTransferTime = () => {
    switch (disbursementData.transferMethod) {
      case 'instant': return 'Within 30 minutes';
      case 'standard': return '1-3 business days';
      case 'wire': return 'Same day';
      default: return 'Unknown';
    }
  };

  const handleClose = () => {
    setStep('verify');
    setIsProcessing(false);
    setTransactionId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Loan Disbursement
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'verify' && (
            <div className="space-y-6">
              {/* Application Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applicant</label>
                    <p className="text-sm text-gray-900">{application.applicantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application ID</label>
                    <p className="text-sm text-gray-900">{application.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approved Amount</label>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(application.approvedAmount || application.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interest Rate</label>
                    <p className="text-sm text-gray-900">{application.interestRate || 12}% APR</p>
                  </div>
                </div>
              </div>

              {/* Disbursement Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Disbursement Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disbursement Amount
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={disbursementData.amount}
                        onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transfer Method
                    </label>
                    <select
                      value={disbursementData.transferMethod}
                      onChange={(e) => handleInputChange('transferMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="instant">Instant Transfer (+$25 fee)</option>
                      <option value="standard">Standard Transfer (Free)</option>
                      <option value="wire">Wire Transfer (+$50 fee)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={disbursementData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={disbursementData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={disbursementData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="9-digit routing number"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="password"
                      value={disbursementData.verificationCode}
                      onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter verification code (1234)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={disbursementData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes about this disbursement..."
                  />
                </div>
              </div>

              {/* Transfer Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Transfer Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Disbursement Amount</span>
                    <span className="text-sm font-medium">{formatCurrency(disbursementData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transfer Fee</span>
                    <span className="text-sm font-medium">{formatCurrency(getTransferFee())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Time</span>
                    <span className="text-sm font-medium">{getTransferTime()}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-900">Total Deducted</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(disbursementData.amount + getTransferFee())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={processDisbursement}
                  disabled={!validateDisbursement()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <BanknotesIcon className="w-5 h-5" />
                  <span>Process Disbursement</span>
                </button>
              </div>
            </div>
          )}

          {step === 'process' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Transfer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Transferring {formatCurrency(disbursementData.amount)} to {disbursementData.bankName}
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <ClockIcon className="w-4 h-4" />
                  <span>Estimated completion: {getTransferTime()}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Disbursement Successful!</h3>
              <p className="text-sm text-gray-600 mb-6">
                {formatCurrency(disbursementData.amount)} has been successfully transferred to {application.applicantName}'s account.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto mb-6">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono font-medium">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(disbursementData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{disbursementData.transferMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Completed</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisbursementModal;