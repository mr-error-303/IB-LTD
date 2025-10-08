import React, { useState, useMemo } from 'react';
import { LoanApplication } from '../types';
import { 
  Calculator, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  PieChart, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  Banknote,
  Clock,
  Target,
  ArrowRight,
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';

interface PrepaymentCalculation {
  prepaymentAmount: number;
  currentOutstanding: number;
  newOutstanding: number;
  interestSaved: number;
  tenureReduction: number;
  newEMI?: number;
  newTenure?: number;
  totalSavings: number;
  processingFee: number;
  netSavings: number;
}

interface PrepaymentOptionsProps {
  loans: LoanApplication[];
  onInitiatePrepayment: (loanId: string, amount: number, type: 'partial' | 'full') => void;
  onDownloadCalculation: (calculation: PrepaymentCalculation) => void;
}

interface PrepaymentScenario {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  icon: React.ElementType;
}

const PrepaymentOptions: React.FC<PrepaymentOptionsProps> = ({
  loans,
  onInitiatePrepayment,
  onDownloadCalculation
}) => {
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(
    loans.find(loan => loan.status === 'approved') || null
  );
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>('');
  const [prepaymentType, setPrepaymentType] = useState<'reduce_tenure' | 'reduce_emi'>('reduce_tenure');
  const [showCalculation, setShowCalculation] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'scenarios' | 'benefits'>('calculator');

  // Predefined scenarios
  const scenarios: PrepaymentScenario[] = [
    {
      id: 'bonus',
      name: 'Annual Bonus',
      description: 'Use 50% of annual bonus for prepayment',
      percentage: 10,
      color: 'bg-green-100 text-green-800',
      icon: Target
    },
    {
      id: 'windfall',
      name: 'Windfall Gains',
      description: 'Invest unexpected income',
      percentage: 15,
      color: 'bg-blue-100 text-blue-800',
      icon: TrendingDown
    },
    {
      id: 'systematic',
      name: 'Systematic Prepayment',
      description: 'Regular monthly prepayments',
      percentage: 5,
      color: 'bg-purple-100 text-purple-800',
      icon: RefreshCw
    },
    {
      id: 'full_closure',
      name: 'Full Closure',
      description: 'Close loan completely',
      percentage: 100,
      color: 'bg-red-100 text-red-800',
      icon: CheckCircle
    }
  ];

  // Calculate prepayment details
  const calculation = useMemo((): PrepaymentCalculation | null => {
    if (!selectedLoan || !prepaymentAmount || isNaN(parseFloat(prepaymentAmount))) {
      return null;
    }

    const amount = parseFloat(prepaymentAmount);
    const currentOutstanding = selectedLoan.amount * 0.8; // Assuming 80% outstanding
    const currentEMI = 5000; // Sample EMI
    const remainingTenure = 60; // Sample remaining months
    const interestRate = 0.12 / 12; // Monthly interest rate

    if (amount > currentOutstanding) {
      return null;
    }

    const newOutstanding = currentOutstanding - amount;
    const processingFee = Math.min(amount * 0.005, 5000); // 0.5% or max ₹5000

    let interestSaved = 0;
    let tenureReduction = 0;
    let newEMI = currentEMI;
    let newTenure = remainingTenure;

    if (prepaymentType === 'reduce_tenure') {
      // Calculate new tenure with same EMI
      if (newOutstanding > 0) {
        newTenure = Math.ceil(
          Math.log(1 + (newOutstanding * interestRate) / currentEMI) / Math.log(1 + interestRate)
        );
        tenureReduction = remainingTenure - newTenure;
        interestSaved = (remainingTenure * currentEMI - currentOutstanding) - 
                       (newTenure * currentEMI - newOutstanding);
      } else {
        newTenure = 0;
        tenureReduction = remainingTenure;
        interestSaved = remainingTenure * currentEMI - currentOutstanding;
      }
    } else {
      // Calculate new EMI with same tenure
      if (newOutstanding > 0) {
        newEMI = (newOutstanding * interestRate * Math.pow(1 + interestRate, remainingTenure)) /
                 (Math.pow(1 + interestRate, remainingTenure) - 1);
        interestSaved = (remainingTenure * currentEMI - currentOutstanding) - 
                       (remainingTenure * newEMI - newOutstanding);
      } else {
        newEMI = 0;
        interestSaved = remainingTenure * currentEMI - currentOutstanding;
      }
    }

    const totalSavings = interestSaved;
    const netSavings = totalSavings - processingFee;

    return {
      prepaymentAmount: amount,
      currentOutstanding,
      newOutstanding,
      interestSaved,
      tenureReduction,
      newEMI: prepaymentType === 'reduce_emi' ? newEMI : undefined,
      newTenure: prepaymentType === 'reduce_tenure' ? newTenure : undefined,
      totalSavings,
      processingFee,
      netSavings
    };
  }, [selectedLoan, prepaymentAmount, prepaymentType]);

  // Get scenario calculation
  const getScenarioCalculation = (scenario: PrepaymentScenario) => {
    if (!selectedLoan) return null;

    const currentOutstanding = selectedLoan.amount * 0.8;
    const amount = scenario.percentage === 100 ? 
      currentOutstanding : 
      (currentOutstanding * scenario.percentage) / 100;

    const currentEMI = 5000;
    const remainingTenure = 60;
    const interestRate = 0.12 / 12;

    const newOutstanding = Math.max(0, currentOutstanding - amount);
    const processingFee = Math.min(amount * 0.005, 5000);

    let interestSaved = 0;
    let tenureReduction = 0;

    if (newOutstanding > 0) {
      const newTenure = Math.ceil(
        Math.log(1 + (newOutstanding * interestRate) / currentEMI) / Math.log(1 + interestRate)
      );
      tenureReduction = remainingTenure - newTenure;
      interestSaved = (remainingTenure * currentEMI - currentOutstanding) - 
                     (newTenure * currentEMI - newOutstanding);
    } else {
      tenureReduction = remainingTenure;
      interestSaved = remainingTenure * currentEMI - currentOutstanding;
    }

    return {
      amount,
      interestSaved,
      tenureReduction,
      netSavings: interestSaved - processingFee
    };
  };

  // Handle prepayment initiation
  const handlePrepayment = () => {
    if (!selectedLoan || !calculation) return;

    const type = calculation.newOutstanding === 0 ? 'full' : 'partial';
    onInitiatePrepayment(selectedLoan.id, calculation.prepaymentAmount, type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prepayment Options</h2>
            <p className="text-gray-600">Calculate savings and reduce your loan burden</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>Processing fee: 0.5% (max ₹5,000)</span>
          </div>
        </div>

        {/* Loan Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Loan</label>
          <select
            value={selectedLoan?.id || ''}
            onChange={(e) => {
              const loan = loans.find(l => l.id === e.target.value);
              setSelectedLoan(loan || null);
            }}
            className="w-full md:w-1/3 border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select a loan</option>
            {loans.filter(loan => loan.status === 'approved').map(loan => (
              <option key={loan.id} value={loan.id}>
                {loan.id} - ₹{loan.amount.toLocaleString()} ({loan.loanType})
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'scenarios', label: 'Scenarios', icon: PieChart },
              { id: 'benefits', label: 'Benefits', icon: TrendingDown }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {selectedLoan ? (
        <>
          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prepayment Calculator</h3>
                
                {/* Current Loan Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Current Loan Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Loan Amount:</span>
                      <p className="font-medium">₹{selectedLoan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Outstanding:</span>
                      <p className="font-medium">₹{(selectedLoan.amount * 0.8).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current EMI:</span>
                      <p className="font-medium">₹5,000</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining Tenure:</span>
                      <p className="font-medium">60 months</p>
                    </div>
                  </div>
                </div>

                {/* Prepayment Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prepayment Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={prepaymentAmount}
                        onChange={(e) => setPrepaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prepayment Option
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="reduce_tenure"
                          checked={prepaymentType === 'reduce_tenure'}
                          onChange={(e) => setPrepaymentType(e.target.value as any)}
                          className="mr-2"
                        />
                        <span className="text-sm">Reduce Tenure (Keep same EMI)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="reduce_emi"
                          checked={prepaymentType === 'reduce_emi'}
                          onChange={(e) => setPrepaymentType(e.target.value as any)}
                          className="mr-2"
                        />
                        <span className="text-sm">Reduce EMI (Keep same tenure)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCalculation(true)}
                    disabled={!calculation}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Calculate Savings
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Results</h3>
                
                {calculation ? (
                  <div className="space-y-4">
                    {/* Savings Summary */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Total Interest Saved</span>
                        <span className="text-lg font-bold text-green-900">
                          ₹{calculation.interestSaved.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Net Savings</span>
                        <span className="text-lg font-bold text-green-900">
                          ₹{calculation.netSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Prepayment Amount:</span>
                        <span className="text-sm font-medium">₹{calculation.prepaymentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processing Fee:</span>
                        <span className="text-sm font-medium text-red-600">₹{calculation.processingFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Outstanding:</span>
                        <span className="text-sm font-medium">₹{calculation.newOutstanding.toLocaleString()}</span>
                      </div>
                      
                      {prepaymentType === 'reduce_tenure' && calculation.newTenure !== undefined && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tenure Reduction:</span>
                            <span className="text-sm font-medium text-blue-600">
                              {calculation.tenureReduction} months
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">New Tenure:</span>
                            <span className="text-sm font-medium">{calculation.newTenure} months</span>
                          </div>
                        </>
                      )}

                      {prepaymentType === 'reduce_emi' && calculation.newEMI !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">New EMI:</span>
                          <span className="text-sm font-medium text-blue-600">
                            ₹{calculation.newEMI.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handlePrepayment}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Proceed with Prepayment
                      </button>
                      <button
                        onClick={() => onDownloadCalculation(calculation)}
                        className="flex items-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Enter prepayment amount to see calculations</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Prepayment Scenarios</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.map(scenario => {
                  const Icon = scenario.icon;
                  const calc = getScenarioCalculation(scenario);
                  
                  return (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${scenario.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                            <p className="text-sm text-gray-600">{scenario.description}</p>
                          </div>
                        </div>
                      </div>

                      {calc && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Prepayment Amount:</span>
                            <span className="text-sm font-medium">₹{calc.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Interest Saved:</span>
                            <span className="text-sm font-medium text-green-600">₹{calc.interestSaved.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tenure Reduction:</span>
                            <span className="text-sm font-medium text-blue-600">{calc.tenureReduction} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Net Savings:</span>
                            <span className="text-sm font-bold text-green-700">₹{calc.netSavings.toLocaleString()}</span>
                          </div>

                          <button
                            onClick={() => {
                              setPrepaymentAmount(calc.amount.toString());
                              setActiveTab('calculator');
                            }}
                            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Use This Scenario
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefits Tab */}
          {activeTab === 'benefits' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Benefits of Prepayment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Reduce Interest Burden</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Save significantly on total interest payments over the loan tenure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Shorter Loan Tenure</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Become debt-free faster and improve your financial freedom.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Improved Credit Score</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Regular prepayments can positively impact your credit rating.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Banknote className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Tax Benefits</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Maintain tax deductions while reducing overall interest liability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Reduced Financial Risk</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Lower outstanding amount reduces financial stress and risk.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Investment Opportunities</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Free up future cash flows for better investment opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">💡 Prepayment Tips</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Use windfalls like bonuses, tax refunds, or gifts for prepayment</li>
                  <li>• Consider prepayment when interest rates are high</li>
                  <li>• Maintain emergency funds before making large prepayments</li>
                  <li>• Compare prepayment savings with other investment returns</li>
                  <li>• Check for any prepayment penalties in your loan agreement</li>
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Loans</h3>
          <p className="text-gray-600">
            You don't have any active loans available for prepayment.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrepaymentOptions;