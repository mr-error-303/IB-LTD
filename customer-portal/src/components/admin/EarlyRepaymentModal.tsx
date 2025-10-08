import React, { useState, useEffect } from 'react';
import { XMarkIcon, GiftIcon, CalculatorIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { EarlyRepaymentEngine, EarlyRepaymentOffer, EarlyPaymentOption } from '../../utils/earlyRepayment';

interface EarlyRepaymentModalProps {
  loanId: string;
  borrowerName: string;
  outstandingAmount: number;
  remainingTerm: number;
  monthlyEMI: number;
  interestRate: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (option: EarlyPaymentOption) => void;
}

const EarlyRepaymentModal: React.FC<EarlyRepaymentModalProps> = ({
  loanId,
  borrowerName,
  outstandingAmount,
  remainingTerm,
  monthlyEMI,
  interestRate,
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<EarlyPaymentOption | null>(null);
  const [offers, setOffers] = useState<EarlyRepaymentOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(outstandingAmount);

  const repaymentEngine = new EarlyRepaymentEngine();

  useEffect(() => {
    if (isOpen && loanId) {
      generateOffers();
    }
  }, [isOpen, loanId]);

  const generateOffers = async () => {
    setLoading(true);
    try {
      const generatedOffers = EarlyRepaymentEngine.generateEarlyRepaymentOffers(
        loanId,
        outstandingAmount,
        remainingTerm,
        monthlyEMI,
        interestRate
      );
      setOffers(generatedOffers);
    } catch (error) {
      console.error('Error generating offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCustomRepayment = (amount: number): EarlyPaymentOption => {
    return EarlyRepaymentEngine.calculateEarlyPaymentBenefit(
      loanId,
      outstandingAmount,
      remainingTerm,
      monthlyEMI,
      interestRate,
      amount
    );
  };

  const handleCustomAmountChange = (amount: number) => {
    setPaymentAmount(amount);
    if (amount > 0 && amount <= outstandingAmount) {
      const customOption = calculateCustomRepayment(amount);
      setSelectedOption(customOption);
    }
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(selectedOption);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <GiftIcon className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Early Repayment Options & Incentives
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
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Loan Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Borrower</p>
                <p className="font-medium">{borrowerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Amount</p>
                <p className="font-medium text-red-600">{formatCurrency(outstandingAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly EMI</p>
                <p className="font-medium">{formatCurrency(monthlyEMI)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Term</p>
                <p className="font-medium">{remainingTerm} months</p>
              </div>
            </div>
          </div>

          {/* Special Offers */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Calculating your personalized offers...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <GiftIcon className="w-5 h-5 text-green-600 mr-2" />
                Special Early Repayment Offers
              </h3>
              
              {offers.map((offer, index) => (
                <div
                  key={index}
                  className="border-2 border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-green-800">{offer.offerType.replace('_', ' ').toUpperCase()}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {formatPercentage(offer.incentiveDetails.discountValue)} OFF
                      </span>
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        Limited Time
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-green-700 mb-4">Early repayment offer with {formatPercentage(offer.incentiveDetails.discountValue)} discount</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded p-3">
                      <p className="text-sm text-gray-500">Discounted Amount</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(offer.incentiveDetails.discountAmount)}</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-sm text-gray-500">You Save</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(offer.benefits.totalSavings)}</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-sm text-gray-500">Interest Saved</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(offer.benefits.interestSavings)}</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p className="text-sm font-medium">{new Date(offer.incentiveDetails.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {offer.terms.map((term, idx) => (
                        <div key={idx} className="flex items-center text-sm text-green-700">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          {term}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const option: EarlyPaymentOption = {
                          id: `offer-${Date.now()}`,
                          type: offer.offerType === 'full_payoff' ? 'full_payoff' : 'partial_prepayment',
                          name: offer.offerType.replace('_', ' ').toUpperCase(),
                          description: `Early repayment offer with ${formatPercentage(offer.incentiveDetails.discountValue)} discount`,
                          paymentAmount: offer.incentiveDetails.discountAmount,
                          discountApplied: offer.incentiveDetails.discountAmount,
                          finalAmount: offer.incentiveDetails.discountAmount,
                          interestSavings: offer.benefits.interestSavings,
                          timeReduction: 0,
                          newPayoffDate: offer.benefits.debtFreeDate,
                          requirements: offer.terms,
                          processingFee: 0,
                          netSavings: offer.benefits.totalSavings
                        };
                        setSelectedOption(option);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Select This Offer
                    </button>
                  </div>
                </div>
              ))}

              {/* Custom Amount Calculator */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalculatorIcon className="w-5 h-5 text-blue-600 mr-2" />
                  Custom Repayment Calculator
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repayment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => handleCustomAmountChange(Number(e.target.value))}
                        min={monthlyEMI}
                        max={outstandingAmount}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2">
                      <input
                        type="range"
                        min={monthlyEMI}
                        max={outstandingAmount}
                        value={paymentAmount}
                        onChange={(e) => handleCustomAmountChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Min: {formatCurrency(monthlyEMI)}</span>
                        <span>Max: {formatCurrency(outstandingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOption && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3">Repayment Impact</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Interest Saved:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedOption.interestSavings)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Total Savings:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedOption.netSavings || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Final Amount:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedOption.finalAmount || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-green-700">Processing Fee:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedOption.processingFee)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Why Choose Early Repayment?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Save on Interest</p>
                      <p className="text-sm text-gray-600">Reduce total interest payments significantly</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Improve Credit Score</p>
                      <p className="text-sm text-gray-600">Early repayment positively impacts credit</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Financial Freedom</p>
                      <p className="text-sm text-gray-600">Become debt-free sooner</p>
                    </div>
                  </div>
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
            onClick={handleConfirm}
            disabled={!selectedOption}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed with Repayment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarlyRepaymentModal;