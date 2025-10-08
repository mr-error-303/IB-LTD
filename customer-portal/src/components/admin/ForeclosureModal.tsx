import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, DocumentTextIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';

interface ForeclosureModalProps {
  loan: {
    loanId: string;
    borrowerName: string;
    borrowerEmail: string;
    borrowerPhone: string;
    loanAmount: number;
    outstandingBalance: number;
    daysOverdue: number;
    collateralValue?: number;
    monthlyPayment: number;
    interestRate: number;
    riskLevel: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (foreclosureData: any) => void;
}

interface ForeclosureOption {
  id: string;
  type: 'legal_notice' | 'asset_seizure' | 'settlement_negotiation' | 'write_off';
  name: string;
  description: string;
  timeline: string;
  estimatedRecovery: number;
  legalCosts: number;
  requirements: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const ForeclosureModal: React.FC<ForeclosureModalProps> = ({
  loan,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<ForeclosureOption | null>(null);
  const [foreclosureOptions, setForeclosureOptions] = useState<ForeclosureOption[]>([]);
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  useEffect(() => {
    if (isOpen && loan) {
      generateForeclosureOptions();
    }
  }, [isOpen, loan]);

  const generateForeclosureOptions = () => {
    const recoveryRate = loan.collateralValue 
      ? Math.min(0.85, loan.collateralValue / loan.outstandingBalance)
      : 0.3;

    const options: ForeclosureOption[] = [
      {
        id: 'legal_notice',
        type: 'legal_notice',
        name: 'Legal Notice & Demand',
        description: 'Send formal legal notice demanding payment within specified timeframe',
        timeline: '30-45 days',
        estimatedRecovery: loan.outstandingBalance * 0.7,
        legalCosts: 2500,
        requirements: [
          'Loan overdue for 90+ days',
          'Previous collection attempts documented',
          'Legal documentation prepared'
        ],
        riskLevel: 'low'
      },
      {
        id: 'asset_seizure',
        type: 'asset_seizure',
        name: 'Asset Seizure & Auction',
        description: 'Initiate legal proceedings to seize and auction collateral assets',
        timeline: '90-180 days',
        estimatedRecovery: loan.outstandingBalance * recoveryRate,
        legalCosts: 8500,
        requirements: [
          'Collateral assets identified',
          'Legal notice period completed',
          'Court approval obtained'
        ],
        riskLevel: 'high'
      },
      {
        id: 'settlement_negotiation',
        type: 'settlement_negotiation',
        name: 'Settlement Negotiation',
        description: 'Negotiate reduced settlement amount with borrower',
        timeline: '15-30 days',
        estimatedRecovery: loan.outstandingBalance * 0.6,
        legalCosts: 1000,
        requirements: [
          'Borrower responsive to communication',
          'Financial hardship documented',
          'Settlement authority approved'
        ],
        riskLevel: 'medium'
      },
      {
        id: 'write_off',
        type: 'write_off',
        name: 'Debt Write-off',
        description: 'Write off the debt as uncollectible after exhausting all options',
        timeline: '7-14 days',
        estimatedRecovery: 0,
        legalCosts: 500,
        requirements: [
          'All collection efforts exhausted',
          'Management approval required',
          'Tax implications reviewed'
        ],
        riskLevel: 'low'
      }
    ];

    setForeclosureOptions(options);
  };

  const handleSubmit = () => {
    if (selectedOption && reason && confirmationChecked) {
      const foreclosureData = {
        loanId: loan.loanId,
        option: selectedOption,
        reason,
        additionalNotes,
        timestamp: new Date(),
        estimatedCompletion: new Date(Date.now() + getTimelineInDays(selectedOption.timeline) * 24 * 60 * 60 * 1000)
      };
      onSubmit(foreclosureData);
    }
  };

  const getTimelineInDays = (timeline: string): number => {
    const match = timeline.match(/(\d+)-?(\d+)?/);
    if (match) {
      return parseInt(match[2] || match[1]);
    }
    return 30;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-red-900">
              Foreclosure Management
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
          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Loan Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Borrower</p>
                <p className="font-medium">{loan.borrowerName}</p>
                <p className="text-xs text-gray-400">{loan.borrowerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="font-medium text-red-600">{formatCurrency(loan.outstandingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Overdue</p>
                <p className="font-medium text-red-600">{loan.daysOverdue} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Collateral Value</p>
                <p className="font-medium">
                  {loan.collateralValue ? formatCurrency(loan.collateralValue) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-red-900">Important Notice</h4>
                <p className="text-sm text-red-700 mt-1">
                  Foreclosure proceedings are serious legal actions that should only be initiated after all other collection efforts have been exhausted. 
                  Ensure compliance with all regulatory requirements and internal policies.
                </p>
              </div>
            </div>
          </div>

          {/* Foreclosure Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Foreclosure Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foreclosureOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOption?.id === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(option.riskLevel)}`}>
                      {option.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <span className="ml-1 font-medium">{option.timeline}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Recovery:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {formatCurrency(option.estimatedRecovery)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Legal Costs:</span>
                      <span className="ml-1 font-medium text-red-600">
                        {formatCurrency(option.legalCosts)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Net Recovery:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(option.estimatedRecovery - option.legalCosts)}
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {option.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {req}
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
                  Reason for Foreclosure *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="non_payment">Persistent Non-payment</option>
                  <option value="breach_of_terms">Breach of Loan Terms</option>
                  <option value="fraud_suspected">Suspected Fraud</option>
                  <option value="asset_deterioration">Collateral Asset Deterioration</option>
                  <option value="borrower_unresponsive">Borrower Unresponsive</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Provide any additional context or documentation references..."
                />
              </div>

              {/* Confirmation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="confirmation"
                    checked={confirmationChecked}
                    onChange={(e) => setConfirmationChecked(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="confirmation" className="text-sm text-yellow-800">
                    <span className="font-medium">I confirm that:</span>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• All collection efforts have been exhausted</li>
                      <li>• Required documentation is complete and accurate</li>
                      <li>• This action complies with regulatory requirements</li>
                      <li>• Appropriate approvals have been obtained</li>
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
            disabled={!selectedOption || !reason || !confirmationChecked}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Initiate Foreclosure
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForeclosureModal;