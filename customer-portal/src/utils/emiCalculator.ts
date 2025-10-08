export interface EMIDetails {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
  loanTerm: number;
  principalAmount: number;
  interestRate: number;
}

export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paidDate?: string;
  lateFee?: number;
}

export interface LoanSchedule {
  loanId: string;
  borrowerName: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  emiDetails: EMIDetails;
  installments: InstallmentSchedule[];
  nextDueDate: string;
  totalPaid: number;
  remainingAmount: number;
}

export class EMICalculator {
  /**
   * Calculate EMI using the standard formula
   * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
   */
  static calculateEMI(principal: number, annualRate: number, tenureMonths: number): EMIDetails {
    const monthlyRate = annualRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - principal;

    return {
      monthlyEMI: Math.round(emi * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      loanTerm: tenureMonths,
      principalAmount: principal,
      interestRate: annualRate
    };
  }

  /**
   * Generate complete installment schedule
   */
  static generateInstallmentSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDate: Date
  ): InstallmentSchedule[] {
    const emiDetails = this.calculateEMI(principal, annualRate, tenureMonths);
    const monthlyRate = annualRate / (12 * 100);
    const installments: InstallmentSchedule[] = [];
    
    let remainingBalance = principal;
    
    for (let i = 1; i <= tenureMonths; i++) {
      const interestAmount = remainingBalance * monthlyRate;
      const principalAmount = emiDetails.monthlyEMI - interestAmount;
      remainingBalance = Math.max(0, remainingBalance - principalAmount);
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        emiAmount: Math.round(emiDetails.monthlyEMI * 100) / 100,
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
        status: 'pending'
      });
    }
    
    return installments;
  }

  /**
   * Create complete loan schedule
   */
  static createLoanSchedule(
    loanId: string,
    borrowerName: string,
    loanAmount: number,
    interestRate: number,
    loanTerm: number,
    startDate: Date = new Date()
  ): LoanSchedule {
    const emiDetails = this.calculateEMI(loanAmount, interestRate, loanTerm);
    const installments = this.generateInstallmentSchedule(loanAmount, interestRate, loanTerm, startDate);
    
    const nextDueDate = installments.find(inst => inst.status === 'pending')?.dueDate || '';
    
    return {
      loanId,
      borrowerName,
      loanAmount,
      interestRate,
      loanTerm,
      startDate: startDate.toISOString().split('T')[0],
      emiDetails,
      installments,
      nextDueDate,
      totalPaid: 0,
      remainingAmount: loanAmount
    };
  }

  /**
   * Update payment status and recalculate remaining amounts
   */
  static updatePaymentStatus(
    schedule: LoanSchedule,
    installmentNumber: number,
    paidAmount: number,
    paidDate: string = new Date().toISOString().split('T')[0]
  ): LoanSchedule {
    const updatedSchedule = { ...schedule };
    const installment = updatedSchedule.installments.find(inst => inst.installmentNumber === installmentNumber);
    
    if (!installment) return updatedSchedule;
    
    installment.paidAmount = paidAmount;
    installment.paidDate = paidDate;
    
    if (paidAmount >= installment.emiAmount) {
      installment.status = 'paid';
    } else if (paidAmount > 0) {
      installment.status = 'partial';
    }
    
    // Calculate late fee if payment is overdue
    const dueDate = new Date(installment.dueDate);
    const paymentDate = new Date(paidDate);
    const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysLate > 0 && installment.status !== 'paid') {
      installment.lateFee = Math.min(500, daysLate * 10); // ₹10 per day, max ₹500
    }
    
    // Update totals
    updatedSchedule.totalPaid = updatedSchedule.installments
      .reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
    updatedSchedule.remainingAmount = updatedSchedule.loanAmount - updatedSchedule.totalPaid;
    
    // Update next due date
    const nextPending = updatedSchedule.installments.find(inst => inst.status === 'pending');
    updatedSchedule.nextDueDate = nextPending?.dueDate || '';
    
    return updatedSchedule;
  }

  /**
   * Check for overdue installments and update status
   */
  static updateOverdueStatus(schedule: LoanSchedule): LoanSchedule {
    const today = new Date();
    const updatedSchedule = { ...schedule };
    
    updatedSchedule.installments.forEach(installment => {
      if (installment.status === 'pending') {
        const dueDate = new Date(installment.dueDate);
        if (today > dueDate) {
          installment.status = 'overdue';
          const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          installment.lateFee = Math.min(500, daysLate * 10);
        }
      }
    });
    
    return updatedSchedule;
  }

  /**
   * Get payment summary for a loan
   */
  static getPaymentSummary(schedule: LoanSchedule) {
    const totalInstallments = schedule.installments.length;
    const paidInstallments = schedule.installments.filter(inst => inst.status === 'paid').length;
    const overdueInstallments = schedule.installments.filter(inst => inst.status === 'overdue').length;
    const partialInstallments = schedule.installments.filter(inst => inst.status === 'partial').length;
    const totalLateFees = schedule.installments.reduce((sum, inst) => sum + (inst.lateFee || 0), 0);
    
    return {
      totalInstallments,
      paidInstallments,
      overdueInstallments,
      partialInstallments,
      pendingInstallments: totalInstallments - paidInstallments - overdueInstallments - partialInstallments,
      totalLateFees,
      paymentProgress: (paidInstallments / totalInstallments) * 100
    };
  }
}