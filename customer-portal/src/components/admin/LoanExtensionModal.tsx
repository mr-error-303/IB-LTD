import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';

interface LoanExtensionModalProps {
  loan: {
    loanId: string;
    borrowerName: string;
    borrowerEmail: string;
    borrowerPhone: string;
    loanAmount: number;
    outstandingBalance: number;
    monthlyPayment: number;
    remainingTerm: number;
    interestRate: number;
    nextPaymentDate: Date;
    daysOverdue: number;
    riskLevel: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (extensionData: any) => void;
}

interface ExtensionOption {
  id: string;
  type: 'payment_holiday' | 'term_extension' | 'reduced_payment' | 'interest_only';
  name: string;
  description: string;
  duration: number; // in months
  newMonthlyPayment: number;
  totalAdditionalCost: number;
  newPayoffDate: Date;
  benefits: string[];
  conditions: string[];
  approvalRequired: boolean;
}

const LoanExtensionModal: React.FC<LoanExtensionModalProps> = ({
  loan,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<ExtensionOption | null>(null);
  const [extensionOptions, setExtensionOptions] = useState<ExtensionOption[]>([]);
  const [reason, setReason] = useState('');
  const [customDuration, setCustomDuration] = useState(6);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);

  useEffect(() => {
    if (isOpen && loan) {
      generateExtensionOptions();
    }
  }, [isOpen, loan, customDuration]);

  const generateExtensionOptions = () => {
    const currentDate = new Date();
    const monthlyInterest = loan.interestRate / 100 / 12;
    
    const options: ExtensionOption[] = [
      {
        id: 'payment_holiday',
        type: 'payment_holiday',
        name: 'Payment Holiday',
        description: 'Temporary suspension of payments for financial relief',
        duration: 3,
        newMonthlyPayment: 0,
        totalAdditionalCost: loan.outstandingBalance * monthlyInterest * 3,
        newPayoffDate: new Date(currentDate.getTime() + (loan.remainingTerm + 3) * 30 * 24 * 60 * 60 * 1000),
        benefits: [
          'Immediate payment relief',
          'No late fees during holiday period',
          'Maintains loan in good standing'
        ],
        conditions: [
          'Maximum 3-month duration',
          'Interest continues to accrue',
          'Resume payments after holiday period'
        ],
        approvalRequired: true
      },
      {
        id: 'term_extension',
        type: 'term_extension',
        name: 'Term Extension',
        description: 'Extend loan term to reduce monthly payment burden',
        duration: customDuration,
        newMonthlyPayment: calculateNewPayment(loan.outstandingBalance, loan.interestRate, loan.remainingTerm + customDuration),
        totalAdditionalCost: calculateAdditionalCost(loan.outstandingBalance, loan.interestRate, loan.remainingTerm, customDuration),
        newPayoffDate: new Date(currentDate.getTime() + (loan.remainingTerm + customDuration) * 30 * 24 * 60 * 60 * 1000),
        benefits: [
          'Lower monthly payments',
          'Improved cash flow',
          'Flexible extension period'
        ],
        conditions: [
          'Minimum 3-month extension',
          'Maximum 24-month extension',
          'Additional interest charges apply'
        ],
        approvalRequired: false
      },
      {
        id: 'reduced_payment',
        type: 'reduced_payment',
        name: 'Reduced Payment Plan',
        description: 'Temporarily reduce monthly payments with extended term',
        duration: 12,
        newMonthlyPayment: loan.monthlyPayment * 0.7,
        totalAdditionalCost: calculateReducedPaymentCost(loan.outstandingBalance, loan.monthlyPayment * 0.7, loan.interestRate),
        newPayoffDate: new Date(currentDate.getTime() + (loan.remainingTerm + 8) * 30 * 24 * 60 * 60 * 1000),
        benefits: [
          '30% reduction in monthly payment',
          'Gradual return to normal payments',
          'Maintains payment discipline'
        ],
        conditions: [
          '12-month reduced payment period',
          'Automatic return to original payment',
          'Additional term extension required'
        ],
        approvalRequired: true
      },
      {
        id: 'interest_only',
        type: 'interest_only',
        name: 'Interest-Only Payments',
        description: 'Pay only interest for a specified period',
        duration: 6,
        newMonthlyPayment: loan.outstandingBalance * monthlyInterest,
        totalAdditionalCost: loan.outstandingBalance * monthlyInterest * 6,
        newPayoffDate: new Date(currentDate.getTime() + (loan.remainingTerm + 6) * 30 * 24 * 60 * 60 * 1000),
        benefits: [
          'Significantly reduced payments',
          'Preserves principal balance',
          'Short-term relief option'
        ],
        conditions: [
          'Maximum 6-month period',
          'Principal balance unchanged',
          'Resume full payments afterward'
        ],
        approvalRequired: true
      }
    ];

    setExtensionOptions(options);
  };

  const calculateNewPayment = (principal: number, annualRate: number, termMonths: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
           (Math.pow(1 + monthlyRate, termMonths) - 1);
  };

  const calculateAdditionalCost = (principal: number, annualRate: number, originalTerm: number, extension: number): number => {
    const originalTotalPayment = loan.monthlyPayment * originalTerm;
    const newPayment = calculateNewPayment(principal, annualRate, originalTerm + extension);
    const newTotalPayment = newPayment * (originalTerm + extension);
    return newTotalPayment - originalTotalPayment;
  };

  const calculateReducedPaymentCost = (principal: number, reducedPayment: number, annualRate: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    // Simplified calculation for demonstration
    return principal * monthlyRate * 8; // Approximate additional cost
  };

  const handleSubmit = () => {
    if (selectedOption && reason && agreementChecked) {
      const extensionData = {
        loanId: loan.loanId,
        option: selectedOption,
        reason,
        customDuration: selectedOption.type === 'term_extension' ? customDuration : selectedOption.duration,
        additionalNotes,
        timestamp: new Date(),
        effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        approvalStatus: selectedOption.approvalRequired ? 'pending' : 'auto_approved'
      };
      onSubmit(extensionData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-blue-900">
              Loan Extension Options
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Loan Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Borrower</p>
                <p className="font-medium">{loan.borrowerName}</p>
                <p className="text-xs text-gray-400">{loan.loanId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="font-medium text-blue-600">{formatCurrency(loan.outstandingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Monthly Payment</p>
                <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Term</p>
                <p className="font-medium">{loan.remainingTerm} months</p>
              </div>
            </div>
          </div>

          {/* Extension Options */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Extension Options</h3>
              {selectedOption?.type === 'term_extension' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Extension Period:</label>
                  <select
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[3, 6, 9, 12, 18, 24].map(months => (
                      <option key={months} value={months}>{months} months</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extensionOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOption?.id === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    {option.approvalRequired && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Approval Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">{option.duration} months</span>
                    </div>
                    <div>
                      <span className="text-gray-500">New Payment:</span>
                      <span className="ml-1 font-medium text-blue-600">
                        {formatCurrency(option.newMonthlyPayment)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Additional Cost:</span>
                      <span className="ml-1 font-medium text-red-600">
                        {formatCurrency(option.totalAdditionalCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">New Payoff Date:</span>
                      <span className="ml-1 font-medium text-xs">
                        {formatDate(option.newPayoffDate)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Comparison */}
                  <div className="bg-white rounded p-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span>Current: {formatCurrency(loan.monthlyPayment)}</span>
                      <span className={`font-medium ${
                        option.newMonthlyPayment < loan.monthlyPayment ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {option.newMonthlyPayment < loan.monthlyPayment ? '↓' : '↑'} 
                        {formatCurrency(Math.abs(option.newMonthlyPayment - loan.monthlyPayment))}
                      </span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-2">
                    <p className="text-xs font-medium text-green-700 mb-1">Benefits:</p>
                    <ul className="text-xs text-green-600 space-y-1">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Conditions */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Conditions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {option.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason and Notes */}
          {selectedOption && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Extension *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="financial_hardship">Temporary Financial Hardship</option>
                  <option value="job_loss">Job Loss or Income Reduction</option>
                  <option value="medical_emergency">Medical Emergency</option>
                  <option value="business_downturn">Business Downturn</option>
                  <option value="family_circumstances">Family Circumstances</option>
                  <option value="seasonal_income">Seasonal Income Variation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide any additional context or supporting information..."
                />
              </div>

              {/* Impact Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Extension Impact Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Monthly Payment Change</p>
                    <p className={`font-medium ${
                      selectedOption.newMonthlyPayment < loan.monthlyPayment ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedOption.newMonthlyPayment < loan.monthlyPayment ? '-' : '+'}
                      {formatCurrency(Math.abs(selectedOption.newMonthlyPayment - loan.monthlyPayment))}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Additional Interest Cost</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(selectedOption.totalAdditionalCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">New Payoff Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOption.newPayoffDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-700">
                    <span className="font-medium">I acknowledge and agree that:</span>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• The extension will result in additional interest charges</li>
                      <li>• All terms and conditions of the original loan remain in effect</li>
                      <li>• This extension is subject to approval if required</li>
                      <li>• Future payment obligations will be adjusted accordingly</li>
                    </ul>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || !reason || !agreementChecked}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedOption?.approvalRequired ? 'Submit for Approval' : 'Apply Extension'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanExtensionModal;