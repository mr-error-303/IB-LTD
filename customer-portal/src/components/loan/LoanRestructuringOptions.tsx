import React, { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { LoanRestructuringEngine, RestructuringRequest, RestructuringSolution } from '../../utils/loanRestructuring';

interface LoanRestructuringOptionsProps {
  loans: Array<{
    id: string;
    loanType: string;
    amount: number;
    monthlyEMI?: number;
    repaymentPeriod: number;
    interestRate: number;
    remainingAmount?: number;
    status: string;
  }>;
}

const LoanRestructuringOptions: React.FC<LoanRestructuringOptionsProps> = ({ loans }) => {
  const { t } = useLanguage();
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [restructuringType, setRestructuringType] = useState<RestructuringRequest['requestType']>('payment_reduction');
  const [solutions, setSolutions] = useState<RestructuringSolution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<RestructuringSolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    employmentStatus: 'employed' as const,
    reasonForHardship: '',
    temporaryHardship: true,
    expectedRecoveryDate: ''
  });

  const restructuringEngine = new LoanRestructuringEngine();

  const restructuringTypes = [
    {
      type: 'payment_reduction' as const,
      name: 'Payment Reduction',
      description: 'Reduce monthly payment amount while extending loan term',
      icon: '💰'
    },
    {
      type: 'term_extension' as const,
      name: 'Term Extension',
      description: 'Extend loan term to reduce monthly payments',
      icon: '📅'
    },
    {
      type: 'interest_reduction' as const,
      name: 'Interest Rate Reduction',
      description: 'Reduce interest rate for qualified borrowers',
      icon: '📉'
    },
    {
      type: 'payment_holiday' as const,
      name: 'Payment Holiday',
      description: 'Temporary suspension of payments for short-term hardship',
      icon: '⏸️'
    },
    {
      type: 'full_restructure' as const,
      name: 'Full Restructure',
      description: 'Comprehensive restructuring with multiple modifications',
      icon: '🔄'
    }
  ];

  const generateSolutions = async () => {
    const loan = loans.find(l => l.id === selectedLoan);
    if (!loan) return;

    setLoading(true);
    try {
      const outstandingAmount = loan.remainingAmount || loan.amount;
      const monthlyEMI = loan.monthlyEMI || 0;
      const remainingTerm = loan.repaymentPeriod;
      
      const request: Omit<RestructuringRequest, 'proposedSolution' | 'id' | 'status' | 'submittedAt' | 'notes'> = {
        loanId: selectedLoan,
        borrowerId: 'current-user',
        borrowerName: 'Current User',
        borrowerEmail: 'user@example.com',
        borrowerPhone: '+1234567890',
        currentLoanDetails: {
          originalAmount: outstandingAmount * 1.2, // Estimate
          outstandingBalance: outstandingAmount,
          monthlyPayment: monthlyEMI,
          interestRate: loan.interestRate,
          remainingTerm: remainingTerm,
          daysOverdue: 0,
          missedPayments: 0
        },
        requestType: restructuringType,
        requestedChanges: {
          reason: formData.reason,
          supportingDocuments: []
        },
        financialSituation: {
          monthlyIncome: formData.monthlyIncome,
          monthlyExpenses: formData.monthlyExpenses,
          employmentStatus: formData.employmentStatus,
          reasonForHardship: formData.reasonForHardship,
          temporaryHardship: formData.temporaryHardship,
          expectedRecoveryDate: formData.expectedRecoveryDate ? new Date(formData.expectedRecoveryDate) : undefined
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

  const handleSubmitRequest = () => {
    if (selectedSolution) {
      console.log('Submitting restructuring request:', selectedSolution);
      alert('Loan restructuring request submitted successfully! You will be contacted within 2-3 business days.');
    }
  };

  const selectedLoanData = loans.find(l => l.id === selectedLoan);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AdjustmentsHorizontalIcon className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Loan Restructuring Options</h2>
            <p className="text-gray-600">Modify your loan terms to better suit your financial situation</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Loan restructuring may affect your credit score and total interest paid. 
                Please review all terms carefully before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Loan for Restructuring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedLoan === loan.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedLoan(loan.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{loan.loanType}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  loan.status === 'current' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {loan.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Outstanding: ₹{(loan.remainingAmount || loan.amount).toLocaleString()}</p>
                <p>Monthly EMI: ₹{(loan.monthlyEMI || 0).toLocaleString()}</p>
                <p>Remaining Term: {loan.repaymentPeriod} months</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restructuring Type Selection */}
      {selectedLoan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Restructuring Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restructuringTypes.map((type) => (
              <div
                key={type.type}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  restructuringType === type.type
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setRestructuringType(type.type)}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Information Form */}
      {selectedLoan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your monthly income"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Expenses (₹)
              </label>
              <input
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => setFormData({...formData, monthlyExpenses: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your monthly expenses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({...formData, employmentStatus: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="employed">Employed</option>
                <option value="self_employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Recovery Date (if temporary hardship)
              </label>
              <input
                type="date"
                value={formData.expectedRecoveryDate}
                onChange={(e) => setFormData({...formData, expectedRecoveryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Restructuring
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Please explain your current financial situation and why you need restructuring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Financial Hardship
              </label>
              <textarea
                value={formData.reasonForHardship}
                onChange={(e) => setFormData({...formData, reasonForHardship: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the circumstances leading to financial hardship"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={generateSolutions}
              disabled={!formData.monthlyIncome || !formData.reason}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Generate Restructuring Options
            </button>
          </div>
        </div>
      )}

      {/* Generated Solutions */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">Analyzing your financial situation...</span>
          </div>
        </div>
      )}

      {solutions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Restructuring Solutions</h3>
          <div className="space-y-4">
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSolution?.id === solution.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSolution(solution)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{solution.type.replace('_', ' ').toUpperCase()}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    solution.riskAssessment.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                    solution.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {solution.riskAssessment.riskLevel} risk
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Current Terms</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Monthly Payment: ₹{solution.originalLoan.monthlyPayment.toLocaleString()}</p>
                      <p>Remaining Term: {solution.originalLoan.remainingTerm} months</p>
                      <p>Interest Rate: {solution.originalLoan.interestRate}%</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">New Terms</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Monthly Payment: ₹{solution.restructuredLoan.monthlyPayment.toLocaleString()}</p>
                      <p>New Term: {solution.restructuredLoan.newTerm} months</p>
                      <p>Interest Rate: {solution.restructuredLoan.newInterestRate}%</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Benefits</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="text-green-600">Monthly Reduction: ₹{solution.benefits.monthlyReduction.toLocaleString()}</p>
                      <p className="text-blue-600">Cash Flow Improvement: ₹{solution.benefits.cashFlowImprovement.toLocaleString()}/year</p>
                      <p className="text-orange-600">Processing Fee: ₹{solution.costs.processingFee.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Solution Details */}
      {selectedSolution && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Restructuring Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Financial Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment Reduction:</span>
                  <span className="font-medium text-green-600">₹{selectedSolution.benefits.monthlyReduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentage Reduction:</span>
                  <span className="font-medium">{selectedSolution.benefits.percentageReduction.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium">₹{selectedSolution.costs.processingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Interest:</span>
                  <span className="font-medium text-orange-600">₹{selectedSolution.costs.additionalInterest.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
              <div className="space-y-2">
                {selectedSolution.approvalRequirements.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmitRequest}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Submit Restructuring Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRestructuringOptions;