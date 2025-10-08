export interface RestructuringRequest {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  currentLoanDetails: {
    originalAmount: number;
    outstandingBalance: number;
    monthlyPayment: number;
    interestRate: number;
    remainingTerm: number;
    daysOverdue: number;
    missedPayments: number;
  };
  requestType: 'payment_reduction' | 'term_extension' | 'interest_reduction' | 'payment_holiday' | 'full_restructure';
  requestedChanges: {
    newMonthlyPayment?: number;
    newTerm?: number;
    newInterestRate?: number;
    holidayPeriod?: number; // months
    reason: string;
    supportingDocuments: string[];
  };
  financialSituation: {
    monthlyIncome: number;
    monthlyExpenses: number;
    employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'other';
    reasonForHardship: string;
    temporaryHardship: boolean;
    expectedRecoveryDate?: Date;
  };
  proposedSolution: RestructuringSolution;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  implementedAt?: Date;
  notes: string[];
}

export interface RestructuringSolution {
  id: string;
  type: RestructuringRequest['requestType'];
  originalLoan: {
    monthlyPayment: number;
    remainingTerm: number;
    interestRate: number;
    outstandingBalance: number;
  };
  restructuredLoan: {
    monthlyPayment: number;
    newTerm: number;
    newInterestRate: number;
    totalAmount: number;
    additionalCost: number;
  };
  benefits: {
    monthlyReduction: number;
    percentageReduction: number;
    cashFlowImprovement: number;
  };
  costs: {
    additionalInterest: number;
    processingFee: number;
    totalAdditionalCost: number;
  };
  conditions: string[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    probabilityOfSuccess: number;
    mitigationFactors: string[];
  };
  approvalRequirements: {
    minimumCreditScore?: number;
    maximumDebtToIncome?: number;
    requiredDocuments: string[];
    managerApprovalRequired: boolean;
    boardApprovalRequired: boolean;
  };
}

export interface RestructuringTemplate {
  type: RestructuringRequest['requestType'];
  name: string;
  description: string;
  eligibilityCriteria: {
    maxDaysOverdue: number;
    maxMissedPayments: number;
    minCreditScore: number;
    maxDebtToIncomeRatio: number;
    employmentRequired: boolean;
  };
  defaultParameters: {
    maxPaymentReduction?: number; // percentage
    maxTermExtension?: number; // months
    maxInterestReduction?: number; // percentage points
    maxHolidayPeriod?: number; // months
    processingFeePercentage: number;
  };
  approvalLevels: {
    autoApproval: boolean;
    managerApproval: boolean;
    seniorManagerApproval: boolean;
    boardApproval: boolean;
  };
}

export class LoanRestructuringEngine {
  private static readonly RESTRUCTURING_TEMPLATES: RestructuringTemplate[] = [
    {
      type: 'payment_reduction',
      name: 'Payment Reduction Plan',
      description: 'Reduce monthly payment amount while extending loan term',
      eligibilityCriteria: {
        maxDaysOverdue: 90,
        maxMissedPayments: 3,
        minCreditScore: 600,
        maxDebtToIncomeRatio: 0.5,
        employmentRequired: true
      },
      defaultParameters: {
        maxPaymentReduction: 30,
        maxTermExtension: 60,
        processingFeePercentage: 1.0
      },
      approvalLevels: {
        autoApproval: false,
        managerApproval: true,
        seniorManagerApproval: false,
        boardApproval: false
      }
    },
    {
      type: 'term_extension',
      name: 'Term Extension',
      description: 'Extend loan term to reduce monthly payments',
      eligibilityCriteria: {
        maxDaysOverdue: 60,
        maxMissedPayments: 2,
        minCreditScore: 650,
        maxDebtToIncomeRatio: 0.45,
        employmentRequired: true
      },
      defaultParameters: {
        maxTermExtension: 120,
        processingFeePercentage: 0.5
      },
      approvalLevels: {
        autoApproval: true,
        managerApproval: false,
        seniorManagerApproval: false,
        boardApproval: false
      }
    },
    {
      type: 'interest_reduction',
      name: 'Interest Rate Reduction',
      description: 'Reduce interest rate for qualified borrowers',
      eligibilityCriteria: {
        maxDaysOverdue: 30,
        maxMissedPayments: 1,
        minCreditScore: 700,
        maxDebtToIncomeRatio: 0.4,
        employmentRequired: true
      },
      defaultParameters: {
        maxInterestReduction: 2.0,
        processingFeePercentage: 0.25
      },
      approvalLevels: {
        autoApproval: false,
        managerApproval: false,
        seniorManagerApproval: true,
        boardApproval: false
      }
    },
    {
      type: 'payment_holiday',
      name: 'Payment Holiday',
      description: 'Temporary suspension of payments for short-term hardship',
      eligibilityCriteria: {
        maxDaysOverdue: 0,
        maxMissedPayments: 0,
        minCreditScore: 650,
        maxDebtToIncomeRatio: 0.6,
        employmentRequired: false
      },
      defaultParameters: {
        maxHolidayPeriod: 6,
        processingFeePercentage: 0.5
      },
      approvalLevels: {
        autoApproval: false,
        managerApproval: true,
        seniorManagerApproval: false,
        boardApproval: false
      }
    },
    {
      type: 'full_restructure',
      name: 'Full Loan Restructure',
      description: 'Comprehensive restructuring with multiple modifications',
      eligibilityCriteria: {
        maxDaysOverdue: 180,
        maxMissedPayments: 6,
        minCreditScore: 550,
        maxDebtToIncomeRatio: 0.7,
        employmentRequired: false
      },
      defaultParameters: {
        maxPaymentReduction: 50,
        maxTermExtension: 180,
        maxInterestReduction: 1.0,
        processingFeePercentage: 2.0
      },
      approvalLevels: {
        autoApproval: false,
        managerApproval: false,
        seniorManagerApproval: false,
        boardApproval: true
      }
    }
  ];

  static checkEligibility(
    loanDetails: RestructuringRequest['currentLoanDetails'],
    borrowerProfile: {
      creditScore: number;
      debtToIncomeRatio: number;
      employmentStatus: string;
    },
    requestType: RestructuringRequest['requestType']
  ): { eligible: boolean; reasons: string[] } {
    const template = this.RESTRUCTURING_TEMPLATES.find(t => t.type === requestType);
    if (!template) {
      return { eligible: false, reasons: ['Invalid restructuring type'] };
    }

    const reasons: string[] = [];
    let eligible = true;

    const criteria = template.eligibilityCriteria;

    if (loanDetails.daysOverdue > criteria.maxDaysOverdue) {
      eligible = false;
      reasons.push(`Loan is ${loanDetails.daysOverdue} days overdue (max allowed: ${criteria.maxDaysOverdue})`);
    }

    if (loanDetails.missedPayments > criteria.maxMissedPayments) {
      eligible = false;
      reasons.push(`Too many missed payments: ${loanDetails.missedPayments} (max allowed: ${criteria.maxMissedPayments})`);
    }

    if (borrowerProfile.creditScore < criteria.minCreditScore) {
      eligible = false;
      reasons.push(`Credit score too low: ${borrowerProfile.creditScore} (minimum required: ${criteria.minCreditScore})`);
    }

    if (borrowerProfile.debtToIncomeRatio > criteria.maxDebtToIncomeRatio) {
      eligible = false;
      reasons.push(`Debt-to-income ratio too high: ${(borrowerProfile.debtToIncomeRatio * 100).toFixed(1)}% (max allowed: ${(criteria.maxDebtToIncomeRatio * 100).toFixed(1)}%)`);
    }

    if (criteria.employmentRequired && borrowerProfile.employmentStatus === 'unemployed') {
      eligible = false;
      reasons.push('Employment required for this restructuring type');
    }

    if (eligible) {
      reasons.push('All eligibility criteria met');
    }

    return { eligible, reasons };
  }

  static generateRestructuringSolution(
    request: Omit<RestructuringRequest, 'proposedSolution' | 'id' | 'status' | 'submittedAt' | 'notes'>
  ): RestructuringSolution {
    const template = this.RESTRUCTURING_TEMPLATES.find(t => t.type === request.requestType);
    if (!template) {
      throw new Error('Invalid restructuring type');
    }

    const { currentLoanDetails, requestedChanges } = request;
    const solutionId = `solution_${request.loanId}_${Date.now()}`;

    let restructuredLoan = {
      monthlyPayment: currentLoanDetails.monthlyPayment,
      newTerm: currentLoanDetails.remainingTerm,
      newInterestRate: currentLoanDetails.interestRate,
      totalAmount: 0,
      additionalCost: 0
    };

    // Calculate restructured terms based on request type
    switch (request.requestType) {
      case 'payment_reduction':
        const targetPayment = requestedChanges.newMonthlyPayment || 
          currentLoanDetails.monthlyPayment * (1 - (template.defaultParameters.maxPaymentReduction! / 100));
        restructuredLoan = this.calculatePaymentReduction(currentLoanDetails, targetPayment);
        break;

      case 'term_extension':
        const newTerm = Math.min(
          requestedChanges.newTerm || currentLoanDetails.remainingTerm + 60,
          currentLoanDetails.remainingTerm + template.defaultParameters.maxTermExtension!
        );
        restructuredLoan = this.calculateTermExtension(currentLoanDetails, newTerm);
        break;

      case 'interest_reduction':
        const newRate = Math.max(
          requestedChanges.newInterestRate || currentLoanDetails.interestRate - 1,
          currentLoanDetails.interestRate - template.defaultParameters.maxInterestReduction!
        );
        restructuredLoan = this.calculateInterestReduction(currentLoanDetails, newRate);
        break;

      case 'payment_holiday':
        const holidayMonths = Math.min(
          requestedChanges.holidayPeriod || 3,
          template.defaultParameters.maxHolidayPeriod!
        );
        restructuredLoan = this.calculatePaymentHoliday(currentLoanDetails, holidayMonths);
        break;

      case 'full_restructure':
        restructuredLoan = this.calculateFullRestructure(currentLoanDetails, requestedChanges, template);
        break;
    }

    const processingFee = currentLoanDetails.outstandingBalance * (template.defaultParameters.processingFeePercentage / 100);
    const additionalInterest = restructuredLoan.totalAmount - currentLoanDetails.outstandingBalance;

    const solution: RestructuringSolution = {
      id: solutionId,
      type: request.requestType,
      originalLoan: {
        monthlyPayment: currentLoanDetails.monthlyPayment,
        remainingTerm: currentLoanDetails.remainingTerm,
        interestRate: currentLoanDetails.interestRate,
        outstandingBalance: currentLoanDetails.outstandingBalance
      },
      restructuredLoan,
      benefits: {
        monthlyReduction: currentLoanDetails.monthlyPayment - restructuredLoan.monthlyPayment,
        percentageReduction: ((currentLoanDetails.monthlyPayment - restructuredLoan.monthlyPayment) / currentLoanDetails.monthlyPayment) * 100,
        cashFlowImprovement: (currentLoanDetails.monthlyPayment - restructuredLoan.monthlyPayment) * 12
      },
      costs: {
        additionalInterest: Math.max(0, additionalInterest),
        processingFee,
        totalAdditionalCost: Math.max(0, additionalInterest) + processingFee
      },
      conditions: this.generateConditions(request.requestType, template),
      riskAssessment: this.assessRisk(request, restructuredLoan),
      approvalRequirements: {
        requiredDocuments: this.getRequiredDocuments(request.requestType),
        managerApprovalRequired: template.approvalLevels.managerApproval,
        boardApprovalRequired: template.approvalLevels.boardApproval
      }
    };

    return solution;
  }

  private static calculatePaymentReduction(
    currentLoan: RestructuringRequest['currentLoanDetails'],
    targetPayment: number
  ) {
    const monthlyRate = currentLoan.interestRate / 100 / 12;
    const balance = currentLoan.outstandingBalance;
    
    // Calculate new term needed for target payment
    const newTerm = Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / targetPayment) / Math.log(1 + monthlyRate)
    );
    
    const totalAmount = targetPayment * newTerm;
    
    return {
      monthlyPayment: targetPayment,
      newTerm,
      newInterestRate: currentLoan.interestRate,
      totalAmount,
      additionalCost: totalAmount - balance
    };
  }

  private static calculateTermExtension(
    currentLoan: RestructuringRequest['currentLoanDetails'],
    newTerm: number
  ) {
    const monthlyRate = currentLoan.interestRate / 100 / 12;
    const balance = currentLoan.outstandingBalance;
    
    // Calculate new monthly payment for extended term
    const newPayment = (balance * monthlyRate * Math.pow(1 + monthlyRate, newTerm)) / 
                      (Math.pow(1 + monthlyRate, newTerm) - 1);
    
    const totalAmount = newPayment * newTerm;
    
    return {
      monthlyPayment: newPayment,
      newTerm,
      newInterestRate: currentLoan.interestRate,
      totalAmount,
      additionalCost: totalAmount - balance
    };
  }

  private static calculateInterestReduction(
    currentLoan: RestructuringRequest['currentLoanDetails'],
    newRate: number
  ) {
    const newMonthlyRate = newRate / 100 / 12;
    const balance = currentLoan.outstandingBalance;
    const term = currentLoan.remainingTerm;
    
    // Calculate new monthly payment with reduced rate
    const newPayment = (balance * newMonthlyRate * Math.pow(1 + newMonthlyRate, term)) / 
                      (Math.pow(1 + newMonthlyRate, term) - 1);
    
    const totalAmount = newPayment * term;
    
    return {
      monthlyPayment: newPayment,
      newTerm: term,
      newInterestRate: newRate,
      totalAmount,
      additionalCost: totalAmount - balance
    };
  }

  private static calculatePaymentHoliday(
    currentLoan: RestructuringRequest['currentLoanDetails'],
    holidayMonths: number
  ) {
    const monthlyRate = currentLoan.interestRate / 100 / 12;
    const balance = currentLoan.outstandingBalance;
    
    // Interest accrues during holiday period
    const balanceAfterHoliday = balance * Math.pow(1 + monthlyRate, holidayMonths);
    const newTerm = currentLoan.remainingTerm + holidayMonths;
    
    // Calculate payment after holiday period
    const newPayment = (balanceAfterHoliday * monthlyRate * Math.pow(1 + monthlyRate, currentLoan.remainingTerm)) / 
                      (Math.pow(1 + monthlyRate, currentLoan.remainingTerm) - 1);
    
    const totalAmount = newPayment * currentLoan.remainingTerm;
    
    return {
      monthlyPayment: newPayment,
      newTerm,
      newInterestRate: currentLoan.interestRate,
      totalAmount,
      additionalCost: totalAmount - balance
    };
  }

  private static calculateFullRestructure(
    currentLoan: RestructuringRequest['currentLoanDetails'],
    requestedChanges: RestructuringRequest['requestedChanges'],
    template: RestructuringTemplate
  ) {
    // Combine multiple restructuring approaches
    let workingLoan = { ...currentLoan };
    
    // Apply interest reduction if requested
    if (requestedChanges.newInterestRate) {
      workingLoan.interestRate = Math.max(
        requestedChanges.newInterestRate,
        currentLoan.interestRate - template.defaultParameters.maxInterestReduction!
      );
    }
    
    // Apply term extension if requested
    if (requestedChanges.newTerm) {
      workingLoan.remainingTerm = Math.min(
        requestedChanges.newTerm,
        currentLoan.remainingTerm + template.defaultParameters.maxTermExtension!
      );
    }
    
    // Calculate final payment with all modifications
    const monthlyRate = workingLoan.interestRate / 100 / 12;
    const balance = workingLoan.outstandingBalance;
    
    let newPayment = (balance * monthlyRate * Math.pow(1 + monthlyRate, workingLoan.remainingTerm)) / 
                    (Math.pow(1 + monthlyRate, workingLoan.remainingTerm) - 1);
    
    // Apply payment reduction if still needed
    if (requestedChanges.newMonthlyPayment && newPayment > requestedChanges.newMonthlyPayment) {
      const maxReduction = currentLoan.monthlyPayment * (template.defaultParameters.maxPaymentReduction! / 100);
      newPayment = Math.max(requestedChanges.newMonthlyPayment, currentLoan.monthlyPayment - maxReduction);
      
      // Recalculate term for target payment
      workingLoan.remainingTerm = Math.ceil(
        -Math.log(1 - (balance * monthlyRate) / newPayment) / Math.log(1 + monthlyRate)
      );
    }
    
    const totalAmount = newPayment * workingLoan.remainingTerm;
    
    return {
      monthlyPayment: newPayment,
      newTerm: workingLoan.remainingTerm,
      newInterestRate: workingLoan.interestRate,
      totalAmount,
      additionalCost: totalAmount - balance
    };
  }

  private static generateConditions(type: RestructuringRequest['requestType'], template: RestructuringTemplate): string[] {
    const baseConditions = [
      'Borrower must maintain current employment status',
      'No additional missed payments allowed during restructure period',
      'Automatic payment setup required',
      `Processing fee of ${template.defaultParameters.processingFeePercentage}% applies`
    ];

    const typeSpecificConditions: Record<string, string[]> = {
      payment_reduction: [
        'New payment amount is fixed for the entire loan term',
        'Early payment penalties may apply'
      ],
      term_extension: [
        'Extended term results in higher total interest paid',
        'Option to make additional principal payments without penalty'
      ],
      interest_reduction: [
        'Rate reduction is permanent for remaining loan term',
        'Borrower must maintain good payment history'
      ],
      payment_holiday: [
        'Interest continues to accrue during holiday period',
        'Regular payments resume automatically after holiday period',
        'Maximum one holiday period per loan'
      ],
      full_restructure: [
        'All terms are subject to final approval',
        'Restructure agreement is binding for minimum 12 months',
        'Credit reporting may be affected'
      ]
    };

    return [...baseConditions, ...(typeSpecificConditions[type] || [])];
  }

  private static assessRisk(
    request: Omit<RestructuringRequest, 'proposedSolution' | 'id' | 'status' | 'submittedAt' | 'notes'>,
    restructuredLoan: RestructuringSolution['restructuredLoan']
  ): RestructuringSolution['riskAssessment'] {
    let riskScore = 0;
    const mitigationFactors: string[] = [];

    // Assess payment reduction risk
    const paymentReduction = request.currentLoanDetails.monthlyPayment - restructuredLoan.monthlyPayment;
    const reductionPercentage = (paymentReduction / request.currentLoanDetails.monthlyPayment) * 100;
    
    if (reductionPercentage > 30) {
      riskScore += 30;
    } else if (reductionPercentage > 15) {
      riskScore += 15;
    } else {
      mitigationFactors.push('Moderate payment reduction');
    }

    // Assess borrower's financial situation
    const debtToIncome = request.financialSituation.monthlyExpenses / request.financialSituation.monthlyIncome;
    if (debtToIncome > 0.5) {
      riskScore += 25;
    } else if (debtToIncome > 0.4) {
      riskScore += 15;
    } else {
      mitigationFactors.push('Healthy debt-to-income ratio');
    }

    // Assess employment stability
    if (request.financialSituation.employmentStatus === 'employed') {
      mitigationFactors.push('Stable employment');
    } else if (request.financialSituation.employmentStatus === 'self_employed') {
      riskScore += 10;
    } else {
      riskScore += 20;
    }

    // Assess hardship type
    if (request.financialSituation.temporaryHardship) {
      mitigationFactors.push('Temporary hardship with expected recovery');
    } else {
      riskScore += 15;
    }

    // Assess loan performance history
    if (request.currentLoanDetails.missedPayments > 3) {
      riskScore += 20;
    } else if (request.currentLoanDetails.missedPayments > 0) {
      riskScore += 10;
    } else {
      mitigationFactors.push('Good payment history');
    }

    let riskLevel: 'low' | 'medium' | 'high';
    let probabilityOfSuccess: number;

    if (riskScore <= 20) {
      riskLevel = 'low';
      probabilityOfSuccess = 85;
    } else if (riskScore <= 50) {
      riskLevel = 'medium';
      probabilityOfSuccess = 70;
    } else {
      riskLevel = 'high';
      probabilityOfSuccess = 50;
    }

    return {
      riskLevel,
      probabilityOfSuccess,
      mitigationFactors
    };
  }

  private static getRequiredDocuments(type: RestructuringRequest['requestType']): string[] {
    const baseDocuments = [
      'Recent pay stubs (last 3 months)',
      'Bank statements (last 3 months)',
      'Hardship letter explaining situation'
    ];

    const typeSpecificDocuments: Record<string, string[]> = {
      payment_reduction: ['Detailed budget worksheet', 'Proof of expenses'],
      term_extension: ['Employment verification letter'],
      interest_reduction: ['Credit report', 'Proof of improved financial situation'],
      payment_holiday: ['Medical bills or unemployment documentation', 'Expected return to work date'],
      full_restructure: ['Complete financial statement', 'Tax returns (last 2 years)', 'Debt consolidation plan']
    };

    return [...baseDocuments, ...(typeSpecificDocuments[type] || [])];
  }

  static getAvailableRestructuringOptions(
    loanDetails: RestructuringRequest['currentLoanDetails'],
    borrowerProfile: {
      creditScore: number;
      debtToIncomeRatio: number;
      employmentStatus: string;
    }
  ): { type: RestructuringRequest['requestType']; template: RestructuringTemplate; eligible: boolean; reasons: string[] }[] {
    return this.RESTRUCTURING_TEMPLATES.map(template => {
      const eligibility = this.checkEligibility(loanDetails, borrowerProfile, template.type);
      return {
        type: template.type,
        template,
        eligible: eligibility.eligible,
        reasons: eligibility.reasons
      };
    });
  }

  static calculateRestructuringImpact(
    originalLoan: RestructuringRequest['currentLoanDetails'],
    solution: RestructuringSolution
  ) {
    const monthlyReduction = originalLoan.monthlyPayment - solution.restructuredLoan.monthlyPayment;
    const annualReduction = monthlyReduction * 12;
    const totalAdditionalCost = solution.costs.totalAdditionalCost;
    const breakEvenMonths = totalAdditionalCost / monthlyReduction;

    return {
      monthlyReduction,
      annualReduction,
      totalAdditionalCost,
      breakEvenMonths,
      netBenefit: annualReduction * 5 - totalAdditionalCost, // 5-year projection
      recommendedAction: breakEvenMonths <= 24 ? 'Recommended' : 'Consider alternatives'
    };
  }
}