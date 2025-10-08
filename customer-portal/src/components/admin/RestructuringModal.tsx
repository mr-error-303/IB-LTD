import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { LoanRestructuringEngine, RestructuringRequest, RestructuringSolution } from '../../utils/loanRestructuring';

interface RestructuringModalProps {
  loanId: string;
  borrowerName: string;
  currentAmount: number;
  currentEMI: number;
  remainingTerm: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (solution: RestructuringSolution) => void;
}

const RestructuringModal: React.FC<RestructuringModalProps> = ({
  loanId,
  borrowerName,
  currentAmount,
  currentEMI,
  remainingTerm,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { t } = useLanguage();
  const [selectedSolution, setSelectedSolution] = useState<RestructuringSolution | null>(null);
  const [solutions, setSolutions] = useState<RestructuringSolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [financialHardship, setFinancialHardship] = useState('');

  const restructuringEngine = new LoanRestructuringEngine();

  useEffect(() => {
    if (isOpen && loanId) {
      generateSolutions();
    }
  }, [isOpen, loanId]);

  const generateSolutions = async () => {
    setLoading(true);
    try {
      const request: Omit<RestructuringRequest, 'proposedSolution' | 'id' | 'status' | 'submittedAt' | 'notes'> = {
        loanId,
        borrowerId: 'admin-user',
        borrowerName,
        borrowerEmail: 'admin@example.com',
        borrowerPhone: '+1234567890',
        currentLoanDetails: {
          originalAmount: currentAmount * 1.2, // Estimate
          outstandingBalance: currentAmount,
          monthlyPayment: currentEMI,
          interestRate: 12, // Default rate
          remainingTerm,
          daysOverdue: 0,
          missedPayments: 0
        },
        requestType: 'term_extension',
        requestedChanges: {
          reason: 'financial_hardship',
          supportingDocuments: []
        },
        financialSituation: {
          monthlyIncome: 50000, // Default values
          monthlyExpenses: 30000,
          employmentStatus: 'employed',
          reasonForHardship: 'financial_hardship',
          temporaryHardship: true
        }
      };

      const generatedSolutions = LoanRestructuringEngine.generateRestructuringSolution(request);
      setSolutions([generatedSolutions]);
    } catch (error) {
      console.error('Error generating solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedSolution) {
      onSubmit(selectedSolution);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Loan Restructuring Options
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Loan Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Loan Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Borrower</p>
                <p className="font-medium">{borrowerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Amount</p>
                <p className="font-medium">{formatCurrency(currentAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current EMI</p>
                <p className="font-medium">{formatCurrency(currentEMI)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Term</p>
                <p className="font-medium">{remainingTerm} months</p>
              </div>
            </div>
          </div>

          {/* Restructuring Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Restructuring
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Please provide details about the financial hardship..."
            />
          </div>

          {/* Available Solutions */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Generating restructuring solutions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Available Restructuring Options</h3>
              
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSolution?.type === solution.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSolution(solution)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={selectedSolution?.type === solution.type}
                          onChange={() => setSelectedSolution(solution)}
                          className="mr-3"
                        />
                        <h4 className="text-lg font-medium text-gray-900">
                          {solution.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          solution.riskAssessment.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          solution.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {solution.riskAssessment.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {solution.type === 'payment_reduction' && 'Reduce monthly payment amount while extending loan term'}
                        {solution.type === 'term_extension' && 'Extend loan term to reduce monthly payments'}
                        {solution.type === 'interest_reduction' && 'Reduce interest rate for qualified borrowers'}
                        {solution.type === 'payment_holiday' && 'Temporary suspension of payments'}
                        {solution.type === 'full_restructure' && 'Complete restructuring of loan terms'}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">New EMI</p>
                          <p className="font-medium text-green-600">{formatCurrency(solution.restructuredLoan.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">New Term</p>
                          <p className="font-medium">{solution.restructuredLoan.newTerm} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="font-medium">{solution.restructuredLoan.newInterestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Reduction</p>
                          <p className="font-medium text-blue-600">{formatCurrency(solution.benefits.monthlyReduction)}</p>
                        </div>
                      </div>

                      {/* Impact Analysis */}
                      <div className="bg-gray-50 rounded p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Impact Analysis</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">EMI Reduction: </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(currentEMI - solution.restructuredLoan.monthlyPayment)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Term Extension: </span>
                            <span className="font-medium">
                              +{solution.restructuredLoan.newTerm - remainingTerm} months
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Additional Cost: </span>
                            <span className="font-medium">
                              {formatCurrency(solution.costs.totalAdditionalCost)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Conditions */}
                      {solution.conditions.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-900 mb-2">Conditions</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {solution.conditions.map((condition, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Loan restructuring will be reflected in your credit report and may impact your credit score. 
                  Please ensure you can meet the new payment terms before proceeding.
                </p>
              </div>
            </div>
          </div>
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
            disabled={!selectedSolution || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Restructuring Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestructuringModal;