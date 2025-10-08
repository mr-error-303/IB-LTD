export interface EarlyRepaymentOffer {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  offerType: 'full_payoff' | 'partial_prepayment' | 'accelerated_payment' | 'loyalty_discount';
  currentLoanDetails: {
    outstandingBalance: number;
    monthlyPayment: number;
    remainingTerm: number;
    interestRate: number;
    nextPaymentDate: Date;
    totalInterestRemaining: number;
  };
  incentiveDetails: {
    discountType: 'percentage' | 'fixed_amount' | 'interest_waiver' | 'fee_waiver';
    discountValue: number;
    discountAmount: number;
    minimumPayment: number;
    maximumDiscount: number;
    validUntil: Date;
  };
  paymentOptions: EarlyPaymentOption[];
  benefits: {
    interestSavings: number;
    totalSavings: number;
    creditScoreImpact: number;
    debtFreeDate: Date;
  };
  eligibilityCriteria: {
    minimumPaymentHistory: number; // months
    maximumMissedPayments: number;
    minimumCreditScore: number;
    accountInGoodStanding: boolean;
  };
  terms: string[];
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'accepted' | 'expired' | 'withdrawn';
  acceptedAt?: Date;
  processedAt?: Date;
}

export interface EarlyPaymentOption {
  id: string;
  type: 'full_payoff' | 'partial_prepayment' | 'double_payment' | 'extra_principal';
  name?: string;
  description?: string;
  paymentAmount: number;
  discountApplied?: number;
  finalAmount?: number;
  interestSavings: number;
  timeReduction: number; // months saved
  newPayoffDate?: Date;
  requirements?: string[];
  processingFee: number;
  netSavings?: number;
  newOutstandingBalance?: number;
  newMonthlyPayment?: number;
  newRemainingTerm?: number;
  totalSavings?: number;
  effectiveDate?: Date;
  benefits?: string[];
}

export interface IncentiveProgram {
  id: string;
  name: string;
  description: string;
  type: EarlyRepaymentOffer['offerType'];
  eligibilityRules: {
    minLoanAge: number; // months
    maxLoanAge: number; // months
    minPaymentHistory: number; // consecutive on-time payments
    maxMissedPayments: number;
    minCreditScore: number;
    minOutstandingBalance: number;
    maxOutstandingBalance: number;
    loanTypes: string[];
    excludeRestructured: boolean;
  };
  incentiveStructure: {
    baseDiscountPercentage: number;
    loyaltyBonusPercentage: number; // additional discount for long-term customers
    volumeDiscountTiers: {
      minAmount: number;
      discountPercentage: number;
    }[];
    seasonalMultiplier: number;
    maxDiscountPercentage: number;
    maxDiscountAmount: number;
  };
  validityPeriod: {
    startDate: Date;
    endDate: Date;
    offerDuration: number; // days offer remains valid once generated
  };
  processingFees: {
    fullPayoffFee: number;
    partialPaymentFee: number;
    feeWaiverThreshold: number; // waive fees above this amount
  };
  active: boolean;
  priority: number;
}

export interface RepaymentAnalytics {
  totalOffersGenerated: number;
  totalOffersAccepted: number;
  acceptanceRate: number;
  totalIncentivesPaid: number;
  totalInterestSaved: number;
  averageDiscountPercentage: number;
  popularOfferTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    offersGenerated: number;
    offersAccepted: number;
    totalIncentives: number;
  }[];
}

export class EarlyRepaymentEngine {
  private static readonly DEFAULT_PROGRAMS: IncentiveProgram[] = [
    {
      id: 'loyalty_full_payoff',
      name: 'Loyalty Full Payoff Program',
      description: 'Special discount for loyal customers paying off their entire loan',
      type: 'full_payoff',
      eligibilityRules: {
        minLoanAge: 12,
        maxLoanAge: 120,
        minPaymentHistory: 12,
        maxMissedPayments: 0,
        minCreditScore: 700,
        minOutstandingBalance: 10000,
        maxOutstandingBalance: 1000000,
        loanTypes: ['personal', 'auto', 'home'],
        excludeRestructured: false
      },
      incentiveStructure: {
        baseDiscountPercentage: 2.0,
        loyaltyBonusPercentage: 1.0,
        volumeDiscountTiers: [
          { minAmount: 50000, discountPercentage: 0.5 },
          { minAmount: 100000, discountPercentage: 1.0 },
          { minAmount: 250000, discountPercentage: 1.5 }
        ],
        seasonalMultiplier: 1.0,
        maxDiscountPercentage: 5.0,
        maxDiscountAmount: 10000
      },
      validityPeriod: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        offerDuration: 30
      },
      processingFees: {
        fullPayoffFee: 0,
        partialPaymentFee: 50,
        feeWaiverThreshold: 25000
      },
      active: true,
      priority: 1
    },
    {
      id: 'partial_prepayment_incentive',
      name: 'Partial Prepayment Incentive',
      description: 'Encourage partial prepayments with interest savings',
      type: 'partial_prepayment',
      eligibilityRules: {
        minLoanAge: 6,
        maxLoanAge: 240,
        minPaymentHistory: 6,
        maxMissedPayments: 1,
        minCreditScore: 650,
        minOutstandingBalance: 5000,
        maxOutstandingBalance: 500000,
        loanTypes: ['personal', 'auto', 'home', 'business'],
        excludeRestructured: true
      },
      incentiveStructure: {
        baseDiscountPercentage: 1.0,
        loyaltyBonusPercentage: 0.5,
        volumeDiscountTiers: [
          { minAmount: 10000, discountPercentage: 0.25 },
          { minAmount: 25000, discountPercentage: 0.5 },
          { minAmount: 50000, discountPercentage: 0.75 }
        ],
        seasonalMultiplier: 1.2,
        maxDiscountPercentage: 3.0,
        maxDiscountAmount: 5000
      },
      validityPeriod: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        offerDuration: 21
      },
      processingFees: {
        fullPayoffFee: 0,
        partialPaymentFee: 25,
        feeWaiverThreshold: 15000
      },
      active: true,
      priority: 2
    },
    {
      id: 'accelerated_payment_program',
      name: 'Accelerated Payment Program',
      description: 'Rewards for consistent extra payments',
      type: 'accelerated_payment',
      eligibilityRules: {
        minLoanAge: 3,
        maxLoanAge: 180,
        minPaymentHistory: 3,
        maxMissedPayments: 0,
        minCreditScore: 680,
        minOutstandingBalance: 15000,
        maxOutstandingBalance: 750000,
        loanTypes: ['personal', 'auto', 'home'],
        excludeRestructured: false
      },
      incentiveStructure: {
        baseDiscountPercentage: 0.5,
        loyaltyBonusPercentage: 0.25,
        volumeDiscountTiers: [
          { minAmount: 5000, discountPercentage: 0.1 },
          { minAmount: 15000, discountPercentage: 0.25 },
          { minAmount: 30000, discountPercentage: 0.5 }
        ],
        seasonalMultiplier: 1.1,
        maxDiscountPercentage: 2.0,
        maxDiscountAmount: 3000
      },
      validityPeriod: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        offerDuration: 14
      },
      processingFees: {
        fullPayoffFee: 0,
        partialPaymentFee: 0,
        feeWaiverThreshold: 0
      },
      active: true,
      priority: 3
    }
  ];

  static checkEligibility(
    loanDetails: {
      loanId: string;
      loanType: string;
      outstandingBalance: number;
      loanAge: number; // months
      paymentHistory: number; // consecutive on-time payments
      missedPayments: number;
      creditScore: number;
      isRestructured: boolean;
      accountStatus: string;
    },
    programId?: string
  ): { eligible: boolean; programs: IncentiveProgram[]; reasons: string[] } {
    const eligiblePrograms: IncentiveProgram[] = [];
    const reasons: string[] = [];

    const programsToCheck = programId 
      ? this.DEFAULT_PROGRAMS.filter(p => p.id === programId)
      : this.DEFAULT_PROGRAMS.filter(p => p.active);

    for (const program of programsToCheck) {
      const rules = program.eligibilityRules;
      let programEligible = true;
      const programReasons: string[] = [];

      // Check loan age
      if (loanDetails.loanAge < rules.minLoanAge || loanDetails.loanAge > rules.maxLoanAge) {
        programEligible = false;
        programReasons.push(`Loan age ${loanDetails.loanAge} months not in range ${rules.minLoanAge}-${rules.maxLoanAge}`);
      }

      // Check payment history
      if (loanDetails.paymentHistory < rules.minPaymentHistory) {
        programEligible = false;
        programReasons.push(`Insufficient payment history: ${loanDetails.paymentHistory} months (required: ${rules.minPaymentHistory})`);
      }

      // Check missed payments
      if (loanDetails.missedPayments > rules.maxMissedPayments) {
        programEligible = false;
        programReasons.push(`Too many missed payments: ${loanDetails.missedPayments} (max allowed: ${rules.maxMissedPayments})`);
      }

      // Check credit score
      if (loanDetails.creditScore < rules.minCreditScore) {
        programEligible = false;
        programReasons.push(`Credit score ${loanDetails.creditScore} below minimum ${rules.minCreditScore}`);
      }

      // Check outstanding balance
      if (loanDetails.outstandingBalance < rules.minOutstandingBalance || 
          loanDetails.outstandingBalance > rules.maxOutstandingBalance) {
        programEligible = false;
        programReasons.push(`Outstanding balance $${loanDetails.outstandingBalance.toLocaleString()} not in range $${rules.minOutstandingBalance.toLocaleString()}-$${rules.maxOutstandingBalance.toLocaleString()}`);
      }

      // Check loan type
      if (!rules.loanTypes.includes(loanDetails.loanType)) {
        programEligible = false;
        programReasons.push(`Loan type '${loanDetails.loanType}' not eligible`);
      }

      // Check restructured status
      if (rules.excludeRestructured && loanDetails.isRestructured) {
        programEligible = false;
        programReasons.push('Restructured loans not eligible for this program');
      }

      // Check account status
      if (loanDetails.accountStatus !== 'good_standing') {
        programEligible = false;
        programReasons.push('Account must be in good standing');
      }

      if (programEligible) {
        eligiblePrograms.push(program);
        programReasons.push(`Eligible for ${program.name}`);
      }

      reasons.push(...programReasons);
    }

    return {
      eligible: eligiblePrograms.length > 0,
      programs: eligiblePrograms.sort((a, b) => a.priority - b.priority),
      reasons
    };
  }

  static calculateEarlyPaymentBenefit(
    loanId: string,
    outstandingAmount: number,
    remainingTerm: number,
    monthlyPayment: number,
    interestRate: number,
    paymentAmount: number
  ): EarlyPaymentOption {
    // Calculate interest savings
    const monthlyRate = interestRate / (12 * 100);
    const totalInterestWithoutPrepayment = (monthlyPayment * remainingTerm) - outstandingAmount;
    
    // Calculate new loan details after prepayment
    const newOutstandingAmount = outstandingAmount - paymentAmount;
    const newTerm = Math.ceil(Math.log(1 + (newOutstandingAmount * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
    const interestSavings = totalInterestWithoutPrepayment - ((monthlyPayment * newTerm) - newOutstandingAmount);
    const timeReduction = remainingTerm - newTerm;

    return {
      id: `custom_${loanId}_${Date.now()}`,
      type: 'partial_prepayment',
      paymentAmount,
      newOutstandingBalance: newOutstandingAmount,
      newMonthlyPayment: monthlyPayment,
      newRemainingTerm: newTerm,
      interestSavings,
      timeReduction,
      totalSavings: interestSavings,
      processingFee: paymentAmount > 25000 ? 0 : 50,
      effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      benefits: [
        `Save ৳${interestSavings.toLocaleString()} in interest`,
        `Reduce loan term by ${timeReduction} months`,
        `Pay off loan ${timeReduction} months earlier`
      ]
    };
  }

  static generateEarlyRepaymentOffers(
    loanId: string,
    outstandingAmount: number,
    remainingTerm: number,
    monthlyPayment: number,
    interestRate: number = 8.5,
    borrowerId: string = 'default_borrower',
    borrowerName: string = 'Default Borrower'
  ): EarlyRepaymentOffer[] {
    // Create mock loan details
    const loanDetails = {
      loanId,
      borrowerId,
      borrowerName,
      loanType: 'personal',
      outstandingBalance: outstandingAmount,
      monthlyPayment,
      remainingTerm,
      interestRate,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalInterestRemaining: (monthlyPayment * remainingTerm) - outstandingAmount,
      loanAge: 12,
      paymentHistory: 12,
      missedPayments: 0,
      creditScore: 750,
      isRestructured: false,
      accountStatus: 'active'
    };

    // Check eligibility for all programs
    const eligibilityResult = this.checkEligibility(loanDetails);
    
    // Generate offers for all eligible programs
    const offers: EarlyRepaymentOffer[] = [];
    
    for (const program of eligibilityResult.programs) {
      try {
        const offer = this.generateEarlyRepaymentOffer(loanDetails, program);
        offers.push(offer);
      } catch (error) {
        console.warn(`Failed to generate offer for program ${program.id}:`, error);
      }
    }

    // If no eligible programs, create a basic offer
    if (offers.length === 0) {
      const basicProgram = this.DEFAULT_PROGRAMS[0]; // Use first program as fallback
      const basicOffer = this.generateEarlyRepaymentOffer(loanDetails, basicProgram);
      offers.push(basicOffer);
    }

    return offers;
  }

  static generateEarlyRepaymentOffer(
    loanDetails: EarlyRepaymentOffer['currentLoanDetails'] & {
      loanId: string;
      borrowerId: string;
      borrowerName: string;
      loanType: string;
      loanAge: number;
      paymentHistory: number;
      missedPayments: number;
      creditScore: number;
      isRestructured: boolean;
      accountStatus: string;
    },
    program: IncentiveProgram
  ): EarlyRepaymentOffer {
    const offerId = `offer_${loanDetails.loanId}_${Date.now()}`;
    
    // Calculate discount
    const discount = this.calculateDiscount(loanDetails, program);
    
    // Generate payment options
    const paymentOptions = this.generatePaymentOptions(loanDetails, program, discount);
    
    // Calculate benefits
    const benefits = this.calculateBenefits(loanDetails, paymentOptions);
    
    const offer: EarlyRepaymentOffer = {
      id: offerId,
      loanId: loanDetails.loanId,
      borrowerId: loanDetails.borrowerId,
      borrowerName: loanDetails.borrowerName,
      offerType: program.type,
      currentLoanDetails: {
        outstandingBalance: loanDetails.outstandingBalance,
        monthlyPayment: loanDetails.monthlyPayment,
        remainingTerm: loanDetails.remainingTerm,
        interestRate: loanDetails.interestRate,
        nextPaymentDate: loanDetails.nextPaymentDate,
        totalInterestRemaining: loanDetails.totalInterestRemaining
      },
      incentiveDetails: {
        discountType: 'percentage',
        discountValue: discount.percentage,
        discountAmount: discount.amount,
        minimumPayment: discount.minimumPayment,
        maximumDiscount: program.incentiveStructure.maxDiscountAmount,
        validUntil: new Date(Date.now() + program.validityPeriod.offerDuration * 24 * 60 * 60 * 1000)
      },
      paymentOptions,
      benefits,
      eligibilityCriteria: {
        minimumPaymentHistory: program.eligibilityRules.minPaymentHistory,
        maximumMissedPayments: program.eligibilityRules.maxMissedPayments,
        minimumCreditScore: program.eligibilityRules.minCreditScore,
        accountInGoodStanding: true
      },
      terms: this.generateOfferTerms(program),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + program.validityPeriod.offerDuration * 24 * 60 * 60 * 1000),
      status: 'active'
    };

    return offer;
  }

  private static calculateDiscount(
    loanDetails: any,
    program: IncentiveProgram
  ): { percentage: number; amount: number; minimumPayment: number } {
    let discountPercentage = program.incentiveStructure.baseDiscountPercentage;
    
    // Add loyalty bonus for long-term customers
    if (loanDetails.loanAge >= 24) {
      discountPercentage += program.incentiveStructure.loyaltyBonusPercentage;
    }
    
    // Add volume discount
    const volumeTier = program.incentiveStructure.volumeDiscountTiers
      .reverse()
      .find(tier => loanDetails.outstandingBalance >= tier.minAmount);
    
    if (volumeTier) {
      discountPercentage += volumeTier.discountPercentage;
    }
    
    // Apply seasonal multiplier
    discountPercentage *= program.incentiveStructure.seasonalMultiplier;
    
    // Cap at maximum
    discountPercentage = Math.min(discountPercentage, program.incentiveStructure.maxDiscountPercentage);
    
    const discountAmount = Math.min(
      loanDetails.outstandingBalance * (discountPercentage / 100),
      program.incentiveStructure.maxDiscountAmount
    );
    
    const minimumPayment = program.type === 'full_payoff' 
      ? loanDetails.outstandingBalance * 0.5 
      : loanDetails.monthlyPayment * 2;
    
    return {
      percentage: discountPercentage,
      amount: discountAmount,
      minimumPayment
    };
  }

  private static generatePaymentOptions(
    loanDetails: any,
    program: IncentiveProgram,
    discount: { percentage: number; amount: number; minimumPayment: number }
  ): EarlyPaymentOption[] {
    const options: EarlyPaymentOption[] = [];
    
    // Full payoff option
    if (program.type === 'full_payoff' || program.type === 'loyalty_discount') {
      const processingFee = loanDetails.outstandingBalance >= program.processingFees.feeWaiverThreshold 
        ? 0 
        : program.processingFees.fullPayoffFee;
      
      options.push({
        id: `option_full_${Date.now()}`,
        type: 'full_payoff',
        name: 'Full Loan Payoff',
        description: 'Pay off your entire loan balance with discount',
        paymentAmount: loanDetails.outstandingBalance,
        discountApplied: discount.amount,
        finalAmount: loanDetails.outstandingBalance - discount.amount + processingFee,
        interestSavings: loanDetails.totalInterestRemaining,
        timeReduction: loanDetails.remainingTerm,
        newPayoffDate: new Date(),
        requirements: ['Account in good standing', 'Payment must be made within offer validity period'],
        processingFee,
        netSavings: loanDetails.totalInterestRemaining + discount.amount - processingFee
      });
    }
    
    // Partial prepayment options
    if (program.type === 'partial_prepayment' || program.type === 'loyalty_discount') {
      const partialAmounts = [
        loanDetails.outstandingBalance * 0.25,
        loanDetails.outstandingBalance * 0.5,
        loanDetails.outstandingBalance * 0.75
      ];
      
      partialAmounts.forEach((amount, index) => {
        const partialDiscount = discount.amount * (amount / loanDetails.outstandingBalance);
        const processingFee = amount >= program.processingFees.feeWaiverThreshold 
          ? 0 
          : program.processingFees.partialPaymentFee;
        
        const newBalance = loanDetails.outstandingBalance - amount;
        const newPayment = this.calculateNewPayment(newBalance, loanDetails.interestRate, loanDetails.remainingTerm);
        const timeReduction = this.calculateTimeReduction(amount, loanDetails);
        
        options.push({
          id: `option_partial_${index}_${Date.now()}`,
          type: 'partial_prepayment',
          name: `${(amount / loanDetails.outstandingBalance * 100).toFixed(0)}% Prepayment`,
          description: `Pay ${(amount / loanDetails.outstandingBalance * 100).toFixed(0)}% of your loan balance`,
          paymentAmount: amount,
          discountApplied: partialDiscount,
          finalAmount: amount - partialDiscount + processingFee,
          interestSavings: this.calculateInterestSavings(amount, loanDetails),
          timeReduction,
          newPayoffDate: new Date(Date.now() + (loanDetails.remainingTerm - timeReduction) * 30 * 24 * 60 * 60 * 1000),
          requirements: ['Minimum payment amount', 'Account in good standing'],
          processingFee,
          netSavings: this.calculateInterestSavings(amount, loanDetails) + partialDiscount - processingFee
        });
      });
    }
    
    // Accelerated payment option
    if (program.type === 'accelerated_payment') {
      const doublePayment = loanDetails.monthlyPayment * 2;
      const extraPrincipal = loanDetails.monthlyPayment;
      
      options.push({
        id: `option_double_${Date.now()}`,
        type: 'double_payment',
        name: 'Double Monthly Payment',
        description: 'Double your monthly payment for faster payoff',
        paymentAmount: doublePayment,
        discountApplied: discount.amount * 0.1, // Smaller discount for ongoing program
        finalAmount: doublePayment - (discount.amount * 0.1),
        interestSavings: this.calculateInterestSavings(extraPrincipal, loanDetails),
        timeReduction: this.calculateTimeReduction(extraPrincipal, loanDetails),
        newPayoffDate: new Date(Date.now() + (loanDetails.remainingTerm - this.calculateTimeReduction(extraPrincipal, loanDetails)) * 30 * 24 * 60 * 60 * 1000),
        requirements: ['Commit to double payments for 12 months', 'Automatic payment setup required'],
        processingFee: 0,
        netSavings: this.calculateInterestSavings(extraPrincipal, loanDetails) + (discount.amount * 0.1)
      });
    }
    
    return options;
  }

  private static calculateNewPayment(balance: number, interestRate: number, term: number): number {
    const monthlyRate = interestRate / 100 / 12;
    return (balance * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  }

  private static calculateInterestSavings(prepaymentAmount: number, loanDetails: any): number {
    // Simplified calculation - in practice, would use amortization schedule
    const monthlyRate = loanDetails.interestRate / 100 / 12;
    const remainingInterest = loanDetails.totalInterestRemaining;
    const principalReduction = prepaymentAmount / loanDetails.outstandingBalance;
    return remainingInterest * principalReduction * 0.8; // Conservative estimate
  }

  private static calculateTimeReduction(prepaymentAmount: number, loanDetails: any): number {
    // Simplified calculation
    const monthlyPrincipal = loanDetails.monthlyPayment * 0.7; // Estimate principal portion
    return Math.floor(prepaymentAmount / monthlyPrincipal);
  }

  private static calculateBenefits(
    loanDetails: any,
    paymentOptions: EarlyPaymentOption[]
  ): EarlyRepaymentOffer['benefits'] {
    const bestOption = paymentOptions.reduce((best, option) => 
      (option.netSavings || 0) > (best.netSavings || 0) ? option : best
    );

    return {
      interestSavings: bestOption.interestSavings,
      totalSavings: bestOption.netSavings || 0,
      creditScoreImpact: 15, // Estimated positive impact
      debtFreeDate: bestOption.newPayoffDate || new Date()
    };
  }

  private static generateOfferTerms(program: IncentiveProgram): string[] {
    const baseTerms = [
      'Offer valid for limited time only',
      'Discount applies to principal balance only',
      'Account must remain in good standing',
      'Offer cannot be combined with other promotions'
    ];

    const programSpecificTerms: Record<string, string[]> = {
      full_payoff: [
        'Full payment must be received within offer validity period',
        'Automatic payment cancellation upon payoff',
        'Final statement will be issued within 30 days'
      ],
      partial_prepayment: [
        'Minimum prepayment amount applies',
        'Regular monthly payments continue on remaining balance',
        'Prepayment applied to principal balance first'
      ],
      accelerated_payment: [
        'Commitment to accelerated payments for minimum 12 months',
        'Automatic payment setup required',
        'Option to return to regular payments after commitment period'
      ],
      loyalty_discount: [
        'Available to customers with 12+ months payment history',
        'Discount percentage based on loyalty tier',
        'Special processing for valued customers'
      ]
    };

    return [...baseTerms, ...(programSpecificTerms[program.type] || [])];
  }

  static processEarlyRepayment(
    offerId: string,
    selectedOptionId: string,
    paymentDetails: {
      amount: number;
      paymentMethod: string;
      paymentDate: Date;
      confirmationNumber: string;
    }
  ): { success: boolean; message: string; newLoanBalance?: number; savingsRealized?: number } {
    // This would integrate with payment processing system
    // For now, return success simulation
    
    return {
      success: true,
      message: 'Early repayment processed successfully',
      newLoanBalance: 0, // Would calculate actual remaining balance
      savingsRealized: 5000 // Would calculate actual savings
    };
  }

  static getRepaymentAnalytics(dateRange: { start: Date; end: Date }): RepaymentAnalytics {
    // This would query actual database for analytics
    // Returning mock data for demonstration
    
    return {
      totalOffersGenerated: 150,
      totalOffersAccepted: 45,
      acceptanceRate: 30,
      totalIncentivesPaid: 125000,
      totalInterestSaved: 450000,
      averageDiscountPercentage: 2.5,
      popularOfferTypes: [
        { type: 'full_payoff', count: 25, percentage: 55.6 },
        { type: 'partial_prepayment', count: 15, percentage: 33.3 },
        { type: 'accelerated_payment', count: 5, percentage: 11.1 }
      ],
      monthlyTrends: [
        { month: '2024-01', offersGenerated: 35, offersAccepted: 12, totalIncentives: 28000 },
        { month: '2024-02', offersGenerated: 42, offersAccepted: 15, totalIncentives: 35000 },
        { month: '2024-03', offersGenerated: 38, offersAccepted: 10, totalIncentives: 22000 }
      ]
    };
  }

  static getActivePrograms(): IncentiveProgram[] {
    return this.DEFAULT_PROGRAMS.filter(program => 
      program.active && 
      new Date() >= program.validityPeriod.startDate && 
      new Date() <= program.validityPeriod.endDate
    );
  }

  static calculateROI(
    incentivesPaid: number,
    interestSaved: number,
    operationalSavings: number
  ): { roi: number; netBenefit: number; paybackPeriod: number } {
    const totalBenefit = interestSaved + operationalSavings;
    const netBenefit = totalBenefit - incentivesPaid;
    const roi = (netBenefit / incentivesPaid) * 100;
    const paybackPeriod = incentivesPaid / (totalBenefit / 12); // months

    return {
      roi,
      netBenefit,
      paybackPeriod
    };
  }
}