export interface RiskAlert {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  alertType: 'payment_overdue' | 'high_risk_score' | 'payment_pattern' | 'financial_distress' | 'early_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  actionRequired: string;
  daysOverdue?: number;
  riskScore?: number;
  recommendedAction: string;
}

export interface PaymentHistory {
  paymentId: string;
  loanId: string;
  dueDate: Date;
  paidDate?: Date;
  amountDue: number;
  amountPaid: number;
  status: 'paid' | 'overdue' | 'partial' | 'pending';
  daysLate: number;
}

export interface LoanRiskProfile {
  loanId: string;
  borrowerId: string;
  currentRiskScore: number;
  previousRiskScore: number;
  riskTrend: 'improving' | 'stable' | 'deteriorating';
  paymentHistory: PaymentHistory[];
  consecutiveLatePayments: number;
  totalOverdueAmount: number;
  lastPaymentDate?: Date;
  nextDueDate: Date;
  probabilityOfDefault: number;
}

export class RiskMonitoringEngine {
  private static readonly RISK_THRESHOLDS = {
    LOW: 300,
    MEDIUM: 500,
    HIGH: 700,
    CRITICAL: 850
  };

  private static readonly OVERDUE_THRESHOLDS = {
    EARLY_WARNING: 3,
    MEDIUM_RISK: 7,
    HIGH_RISK: 15,
    CRITICAL: 30
  };

  static calculateRiskScore(profile: LoanRiskProfile): number {
    let riskScore = 0;

    // Payment history factor (40% weight)
    const paymentHistoryScore = this.calculatePaymentHistoryScore(profile.paymentHistory);
    riskScore += paymentHistoryScore * 0.4;

    // Overdue amount factor (25% weight)
    const overdueRatio = profile.totalOverdueAmount / this.calculateTotalLoanAmount(profile);
    riskScore += Math.min(overdueRatio * 1000, 300) * 0.25;

    // Consecutive late payments factor (20% weight)
    riskScore += Math.min(profile.consecutiveLatePayments * 50, 200) * 0.2;

    // Time since last payment factor (15% weight)
    const daysSinceLastPayment = profile.lastPaymentDate 
      ? Math.floor((Date.now() - profile.lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24))
      : 90;
    riskScore += Math.min(daysSinceLastPayment * 3, 150) * 0.15;

    return Math.round(Math.min(riskScore, 1000));
  }

  private static calculatePaymentHistoryScore(payments: PaymentHistory[]): number {
    if (payments.length === 0) return 0;

    const recentPayments = payments.slice(-12); // Last 12 payments
    let score = 0;

    recentPayments.forEach((payment, index) => {
      const weight = (index + 1) / recentPayments.length; // More recent payments have higher weight
      
      switch (payment.status) {
        case 'paid':
          score += payment.daysLate === 0 ? 0 : Math.min(payment.daysLate * 10, 100) * weight;
          break;
        case 'partial':
          score += 50 * weight;
          break;
        case 'overdue':
          score += Math.min(payment.daysLate * 15, 200) * weight;
          break;
        default:
          score += 25 * weight;
      }
    });

    return score;
  }

  private static calculateTotalLoanAmount(profile: LoanRiskProfile): number {
    // This would typically come from loan details
    return profile.paymentHistory.reduce((total, payment) => total + payment.amountDue, 0);
  }

  static generateRiskAlerts(profile: LoanRiskProfile): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const currentDate = new Date();

    // Check for overdue payments
    const overduePayments = profile.paymentHistory.filter(p => 
      p.status === 'overdue' && p.dueDate < currentDate
    );

    if (overduePayments.length > 0) {
      const maxDaysOverdue = Math.max(...overduePayments.map(p => p.daysLate));
      let severity: RiskAlert['severity'] = 'low';
      let alertType: RiskAlert['alertType'] = 'payment_overdue';

      if (maxDaysOverdue >= this.OVERDUE_THRESHOLDS.CRITICAL) {
        severity = 'critical';
      } else if (maxDaysOverdue >= this.OVERDUE_THRESHOLDS.HIGH_RISK) {
        severity = 'high';
      } else if (maxDaysOverdue >= this.OVERDUE_THRESHOLDS.MEDIUM_RISK) {
        severity = 'medium';
      }

      alerts.push({
        id: `overdue_${profile.loanId}_${Date.now()}`,
        loanId: profile.loanId,
        borrowerId: profile.borrowerId,
        borrowerName: '', // Would be populated from borrower data
        alertType,
        severity,
        message: `Payment overdue by ${maxDaysOverdue} days. Total overdue amount: $${profile.totalOverdueAmount.toLocaleString()}`,
        createdAt: currentDate,
        isResolved: false,
        actionRequired: this.getActionRequired(severity, 'overdue'),
        daysOverdue: maxDaysOverdue,
        recommendedAction: this.getRecommendedAction(severity, 'overdue')
      });
    }

    // Check risk score alerts
    if (profile.currentRiskScore >= this.RISK_THRESHOLDS.CRITICAL) {
      alerts.push({
        id: `risk_${profile.loanId}_${Date.now()}`,
        loanId: profile.loanId,
        borrowerId: profile.borrowerId,
        borrowerName: '',
        alertType: 'high_risk_score',
        severity: 'critical',
        message: `Critical risk score: ${profile.currentRiskScore}. Immediate attention required.`,
        createdAt: currentDate,
        isResolved: false,
        actionRequired: 'Immediate review and intervention required',
        riskScore: profile.currentRiskScore,
        recommendedAction: 'Contact borrower immediately, consider loan restructuring'
      });
    } else if (profile.currentRiskScore >= this.RISK_THRESHOLDS.HIGH) {
      alerts.push({
        id: `risk_${profile.loanId}_${Date.now()}`,
        loanId: profile.loanId,
        borrowerId: profile.borrowerId,
        borrowerName: '',
        alertType: 'high_risk_score',
        severity: 'high',
        message: `High risk score: ${profile.currentRiskScore}. Enhanced monitoring required.`,
        createdAt: currentDate,
        isResolved: false,
        actionRequired: 'Enhanced monitoring and borrower contact',
        riskScore: profile.currentRiskScore,
        recommendedAction: 'Schedule borrower meeting, review financial status'
      });
    }

    // Check for deteriorating payment patterns
    if (profile.consecutiveLatePayments >= 3) {
      alerts.push({
        id: `pattern_${profile.loanId}_${Date.now()}`,
        loanId: profile.loanId,
        borrowerId: profile.borrowerId,
        borrowerName: '',
        alertType: 'payment_pattern',
        severity: profile.consecutiveLatePayments >= 5 ? 'high' : 'medium',
        message: `${profile.consecutiveLatePayments} consecutive late payments detected.`,
        createdAt: currentDate,
        isResolved: false,
        actionRequired: 'Review payment pattern and borrower circumstances',
        recommendedAction: 'Contact borrower to discuss payment difficulties'
      });
    }

    // Early warning system
    const daysTillNextDue = Math.floor((profile.nextDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysTillNextDue <= 3 && profile.currentRiskScore > this.RISK_THRESHOLDS.MEDIUM) {
      alerts.push({
        id: `early_warning_${profile.loanId}_${Date.now()}`,
        loanId: profile.loanId,
        borrowerId: profile.borrowerId,
        borrowerName: '',
        alertType: 'early_warning',
        severity: 'medium',
        message: `Payment due in ${daysTillNextDue} days for high-risk borrower.`,
        createdAt: currentDate,
        isResolved: false,
        actionRequired: 'Proactive borrower contact recommended',
        recommendedAction: 'Send payment reminder and offer assistance if needed'
      });
    }

    return alerts;
  }

  private static getActionRequired(severity: RiskAlert['severity'], type: string): string {
    switch (severity) {
      case 'critical':
        return 'Immediate intervention required - escalate to senior management';
      case 'high':
        return 'Urgent action required - contact borrower within 24 hours';
      case 'medium':
        return 'Action required within 3 business days';
      case 'low':
        return 'Monitor and follow up within 1 week';
      default:
        return 'Review and assess situation';
    }
  }

  private static getRecommendedAction(severity: RiskAlert['severity'], type: string): string {
    if (type === 'overdue') {
      switch (severity) {
        case 'critical':
          return 'Consider legal action, loan restructuring, or asset recovery';
        case 'high':
          return 'Immediate borrower contact, payment plan negotiation';
        case 'medium':
          return 'Contact borrower, send formal notice, discuss payment options';
        case 'low':
          return 'Send payment reminder, monitor closely';
        default:
          return 'Standard follow-up procedures';
      }
    }
    return 'Review borrower circumstances and take appropriate action';
  }

  static calculateProbabilityOfDefault(profile: LoanRiskProfile): number {
    const riskScore = profile.currentRiskScore;
    
    // Convert risk score to probability (0-100%)
    if (riskScore >= 900) return 85;
    if (riskScore >= 800) return 65;
    if (riskScore >= 700) return 45;
    if (riskScore >= 600) return 30;
    if (riskScore >= 500) return 20;
    if (riskScore >= 400) return 12;
    if (riskScore >= 300) return 7;
    return 3;
  }

  static getRiskCategory(riskScore: number): string {
    if (riskScore >= this.RISK_THRESHOLDS.CRITICAL) return 'Critical';
    if (riskScore >= this.RISK_THRESHOLDS.HIGH) return 'High';
    if (riskScore >= this.RISK_THRESHOLDS.MEDIUM) return 'Medium';
    if (riskScore >= this.RISK_THRESHOLDS.LOW) return 'Low';
    return 'Minimal';
  }

  static getRiskColor(riskScore: number): string {
    if (riskScore >= this.RISK_THRESHOLDS.CRITICAL) return 'text-red-600 bg-red-50';
    if (riskScore >= this.RISK_THRESHOLDS.HIGH) return 'text-orange-600 bg-orange-50';
    if (riskScore >= this.RISK_THRESHOLDS.MEDIUM) return 'text-yellow-600 bg-yellow-50';
    if (riskScore >= this.RISK_THRESHOLDS.LOW) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  }
}