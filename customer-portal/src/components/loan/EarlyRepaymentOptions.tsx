import React, { useState, useEffect } from 'react';
import { GiftIcon, CalculatorIcon, CheckCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { EarlyRepaymentEngine, EarlyRepaymentOffer, EarlyPaymentOption } from '../../utils/earlyRepayment';

interface EarlyRepaymentOptionsProps {
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

const EarlyRepaymentOptions: React.FC<EarlyRepaymentOptionsProps> = ({ loans }) => {
  const { t } = useLanguage();
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [offers, setOffers] = useState<EarlyRepaymentOffer[]>([]);
  const [selectedOption, setSelectedOption] = useState<EarlyPaymentOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(0);

  const repaymentEngine = new EarlyRepaymentEngine();

  const generateOffers = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoading(true);
    try {
      const outstandingAmount = loan.remainingAmount || loan.amount;
      const monthlyEMI = loan.monthlyEMI || 0;
      const remainingTerm = loan.repaymentPeriod;
      
      const generatedOffers = EarlyRepaymentEngine.generateEarlyRepaymentOffers(
        loanId,
        outstandingAmount,
        remainingTerm,
        monthlyEMI,
        loan.interestRate
      );
      setOffers(generatedOffers);
    } catch (error) {
      console.error('Error generating offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSelection = (loanId: string) => {
    setSelectedLoan(loanId);
    setOffers([]);
    setSelectedOption(null);
    if (loanId) {
      generateOffers(loanId);
    }
  };

  const calculateCustomRepayment = (amount: number) => {
    const loan = loans.find(l => l.id === selectedLoan);
    if (!loan || amount <= 0) return;

    const outstandingAmount = loan.remainingAmount || loan.amount;
    const monthlyEMI = loan.monthlyEMI || 0;
    const remainingTerm = loan.repaymentPeriod;

    const customOption = EarlyRepaymentEngine.calculateEarlyPaymentBenefit(
      selectedLoan,
      outstandingAmount,
      remainingTerm,
      monthlyEMI,
      loan.interestRate,
      amount
    );
    setSelectedOption(customOption);
  };

  const handleCustomAmountChange = (amount: number) => {
    setCustomAmount(amount);
    calculateCustomRepayment(amount);
  };

  const handleProceedWithPayment = () => {
    if (selectedOption) {
      // Handle payment processing
      console.log('Processing early repayment:', selectedOption);
      alert('Early repayment request submitted successfully!');
    }
  };

  const selectedLoanData = loans.find(l => l.id === selectedLoan);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <GiftIcon className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Early Repayment Options</h2>
            <p className="text-gray-600">Save on interest and become debt-free sooner</p>
          </div>
        </div>
      </div>

      {/* Loan Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Loan for Early Repayment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedLoan === loan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleLoanSelection(loan.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{loan.loanType}</h4>
                <span className="text-sm text-gray-500">#{loan.id}</span>
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

      {/* Early Repayment Options */}
      {selectedLoan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Repayment Options</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Generating personalized offers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Predefined Options */}
              {offers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{offer.offerType}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {offer.paymentOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedOption?.id === option.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedOption(option)}
                      >
                        <h5 className="font-medium text-gray-900 mb-2">{option.name}</h5>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">Payment: ₹{option.paymentAmount.toLocaleString()}</p>
                          <p className="text-green-600">Savings: ₹{option.interestSavings.toLocaleString()}</p>
                          <p className="text-blue-600">Time Saved: {option.timeReduction} months</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom Amount Option */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Custom Repayment Amount</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(Number(e.target.value))}
                      max={selectedLoanData?.remainingAmount || selectedLoanData?.amount}
                      min={1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom amount"
                    />
                  </div>
                  <button
                    onClick={() => calculateCustomRepayment(customAmount)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <CalculatorIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Option Details */}
      {selectedOption && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Repayment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Amount:</span>
                <span className="font-medium">₹{selectedOption.paymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount Applied:</span>
                <span className="font-medium text-green-600">₹{(selectedOption.discountApplied || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Amount:</span>
                <span className="font-medium">₹{(selectedOption.finalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Savings:</span>
                <span className="font-medium text-green-600">₹{selectedOption.interestSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Reduction:</span>
                <span className="font-medium text-blue-600">{selectedOption.timeReduction} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Payoff Date:</span>
                <span className="font-medium">{selectedOption.newPayoffDate?.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleProceedWithPayment}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Proceed with Early Repayment
            </button>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits of Early Repayment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Interest Savings</h4>
              <p className="text-sm text-gray-600">Reduce total interest payments significantly</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Credit Score Improvement</h4>
              <p className="text-sm text-gray-600">Early repayment positively impacts your credit score</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Financial Freedom</h4>
              <p className="text-sm text-gray-600">Become debt-free sooner and improve cash flow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarlyRepaymentOptions;