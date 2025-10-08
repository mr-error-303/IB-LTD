export interface CreditFactors {
  monthlyIncome: number;
  existingDebt: number;
  creditHistory: number; // months
  employmentType: 'permanent' | 'contract' | 'self-employed' | 'unemployed';
  age: number;
  loanAmount: number;
  collateral: boolean;
  bankRelationship: number; // months
  previousDefaults: number;
  educationLevel: 'high-school' | 'bachelor' | 'master' | 'phd';
}

export interface CreditScoreResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  recommendation: 'Approve' | 'Review' | 'Reject';
  factors: {
    incomeScore: number;
    debtToIncomeRatio: number;
    creditHistoryScore: number;
    employmentScore: number;
    ageScore: number;
    loanToIncomeRatio: number;
    collateralScore: number;
    relationshipScore: number;
    defaultScore: number;
    educationScore: number;
  };
  maxLoanAmount: number;
  recommendedInterestRate: number;
}

export class CreditScoringEngine {
  private static calculateIncomeScore(income: number): number {
    if (income >= 100000) return 100;
    if (income >= 75000) return 90;
    if (income >= 50000) return 80;
    if (income >= 35000) return 70;
    if (income >= 25000) return 60;
    if (income >= 15000) return 50;
    return 30;
  }

  private static calculateDebtToIncomeRatio(income: number, debt: number): number {
    const ratio = debt / income;
    if (ratio <= 0.1) return 100;
    if (ratio <= 0.2) return 90;
    if (ratio <= 0.3) return 80;
    if (ratio <= 0.4) return 70;
    if (ratio <= 0.5) return 60;
    if (ratio <= 0.6) return 50;
    return 30;
  }

  private static calculateCreditHistoryScore(months: number): number {
    if (months >= 60) return 100;
    if (months >= 36) return 90;
    if (months >= 24) return 80;
    if (months >= 12) return 70;
    if (months >= 6) return 60;
    if (months >= 3) return 50;
    return 30;
  }

  private static calculateEmploymentScore(type: string): number {
    switch (type) {
      case 'permanent': return 100;
      case 'contract': return 80;
      case 'self-employed': return 70;
      case 'unemployed': return 20;
      default: return 50;
    }
  }

  private static calculateAgeScore(age: number): number {
    if (age >= 30 && age <= 50) return 100;
    if (age >= 25 && age <= 60) return 90;
    if (age >= 21 && age <= 65) return 80;
    return 60;
  }

  private static calculateLoanToIncomeRatio(income: number, loanAmount: number): number {
    const ratio = loanAmount / income;
    if (ratio <= 2) return 100;
    if (ratio <= 3) return 90;
    if (ratio <= 4) return 80;
    if (ratio <= 5) return 70;
    if (ratio <= 6) return 60;
    if (ratio <= 8) return 50;
    return 30;
  }

  private static calculateCollateralScore(hasCollateral: boolean): number {
    return hasCollateral ? 100 : 60;
  }

  private static calculateRelationshipScore(months: number): number {
    if (months >= 60) return 100;
    if (months >= 36) return 90;
    if (months >= 24) return 80;
    if (months >= 12) return 70;
    if (months >= 6) return 60;
    return 50;
  }

  private static calculateDefaultScore(defaults: number): number {
    if (defaults === 0) return 100;
    if (defaults === 1) return 70;
    if (defaults === 2) return 50;
    if (defaults === 3) return 30;
    return 10;
  }

  private static calculateEducationScore(level: string): number {
    switch (level) {
      case 'phd': return 100;
      case 'master': return 95;
      case 'bachelor': return 85;
      case 'high-school': return 70;
      default: return 60;
    }
  }

  private static getGradeFromScore(score: number): CreditScoreResult['grade'] {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private static getRiskLevel(score: number): CreditScoreResult['riskLevel'] {
    if (score >= 85) return 'Very Low';
    if (score >= 75) return 'Low';
    if (score >= 65) return 'Medium';
    if (score >= 55) return 'High';
    return 'Very High';
  }

  private static getRecommendation(score: number): CreditScoreResult['recommendation'] {
    if (score >= 75) return 'Approve';
    if (score >= 60) return 'Review';
    return 'Reject';
  }

  private static calculateMaxLoanAmount(income: number, score: number): number {
    const baseMultiplier = score >= 80 ? 5 : score >= 70 ? 4 : score >= 60 ? 3 : 2;
    return income * baseMultiplier;
  }

  private static calculateInterestRate(score: number, hasCollateral: boolean): number {
    let baseRate = 12; // Base rate 12%
    
    if (score >= 90) baseRate = 8;
    else if (score >= 85) baseRate = 9;
    else if (score >= 80) baseRate = 10;
    else if (score >= 75) baseRate = 11;
    else if (score >= 70) baseRate = 12;
    else if (score >= 65) baseRate = 14;
    else if (score >= 60) baseRate = 16;
    else baseRate = 18;

    // Collateral discount
    if (hasCollateral) {
      baseRate -= 2;
    }

    return Math.max(baseRate, 6); // Minimum 6%
  }

  public static calculateCreditScore(factors: CreditFactors): CreditScoreResult {
    const incomeScore = this.calculateIncomeScore(factors.monthlyIncome);
    const debtToIncomeRatio = this.calculateDebtToIncomeRatio(factors.monthlyIncome, factors.existingDebt);
    const creditHistoryScore = this.calculateCreditHistoryScore(factors.creditHistory);
    const employmentScore = this.calculateEmploymentScore(factors.employmentType);
    const ageScore = this.calculateAgeScore(factors.age);
    const loanToIncomeRatio = this.calculateLoanToIncomeRatio(factors.monthlyIncome, factors.loanAmount);
    const collateralScore = this.calculateCollateralScore(factors.collateral);
    const relationshipScore = this.calculateRelationshipScore(factors.bankRelationship);
    const defaultScore = this.calculateDefaultScore(factors.previousDefaults);
    const educationScore = this.calculateEducationScore(factors.educationLevel);

    // Weighted average calculation
    const weights = {
      income: 0.20,
      debtToIncome: 0.15,
      creditHistory: 0.15,
      employment: 0.12,
      age: 0.08,
      loanToIncome: 0.10,
      collateral: 0.08,
      relationship: 0.05,
      defaults: 0.05,
      education: 0.02
    };

    const weightedScore = 
      incomeScore * weights.income +
      debtToIncomeRatio * weights.debtToIncome +
      creditHistoryScore * weights.creditHistory +
      employmentScore * weights.employment +
      ageScore * weights.age +
      loanToIncomeRatio * weights.loanToIncome +
      collateralScore * weights.collateral +
      relationshipScore * weights.relationship +
      defaultScore * weights.defaults +
      educationScore * weights.education;

    const finalScore = Math.round(weightedScore);
    const grade = this.getGradeFromScore(finalScore);
    const riskLevel = this.getRiskLevel(finalScore);
    const recommendation = this.getRecommendation(finalScore);
    const maxLoanAmount = this.calculateMaxLoanAmount(factors.monthlyIncome, finalScore);
    const recommendedInterestRate = this.calculateInterestRate(finalScore, factors.collateral);

    return {
      score: finalScore,
      grade,
      riskLevel,
      recommendation,
      factors: {
        incomeScore,
        debtToIncomeRatio,
        creditHistoryScore,
        employmentScore,
        ageScore,
        loanToIncomeRatio,
        collateralScore,
        relationshipScore,
        defaultScore,
        educationScore
      },
      maxLoanAmount,
      recommendedInterestRate
    };
  }

  public static generateCreditReport(factors: CreditFactors): string {
    const result = this.calculateCreditScore(factors);
    
    return `
AUTOMATED CREDIT ASSESSMENT REPORT
==================================

APPLICANT PROFILE:
- Monthly Income: $${factors.monthlyIncome.toLocaleString()}
- Existing Debt: $${factors.existingDebt.toLocaleString()}
- Employment: ${factors.employmentType}
- Age: ${factors.age} years
- Credit History: ${factors.creditHistory} months
- Requested Loan: $${factors.loanAmount.toLocaleString()}

CREDIT SCORE BREAKDOWN:
- Overall Score: ${result.score}/100 (Grade: ${result.grade})
- Risk Level: ${result.riskLevel}
- Recommendation: ${result.recommendation}

FACTOR ANALYSIS:
- Income Assessment: ${result.factors.incomeScore}/100
- Debt-to-Income Ratio: ${result.factors.debtToIncomeRatio}/100
- Credit History: ${result.factors.creditHistoryScore}/100
- Employment Stability: ${result.factors.employmentScore}/100
- Age Factor: ${result.factors.ageScore}/100
- Loan-to-Income Ratio: ${result.factors.loanToIncomeRatio}/100
- Collateral Security: ${result.factors.collateralScore}/100
- Bank Relationship: ${result.factors.relationshipScore}/100
- Default History: ${result.factors.defaultScore}/100
- Education Level: ${result.factors.educationScore}/100

LOAN RECOMMENDATIONS:
- Maximum Loan Amount: $${result.maxLoanAmount.toLocaleString()}
- Recommended Interest Rate: ${result.recommendedInterestRate}%

Generated on: ${new Date().toLocaleString()}
    `.trim();
  }
}