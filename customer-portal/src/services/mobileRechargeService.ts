import { smsService } from './smsService';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';

export interface MobileRechargeData {
  operator: string;
  phoneNumber: string;
  amount: number;
  connectionType: 'prepaid' | 'postpaid';
}

export interface MobileRechargeResult {
  success: boolean;
  transactionId?: string;
  message: string;
  data?: {
    operator: string;
    phoneNumber: string;
    amount: number;
    timestamp: string;
  };
}

class MobileRechargeService {
  private operators = [
    { 
      id: 'grameenphone', 
      name: 'Grameenphone', 
      prefixes: ['017', '013', '019', '014']
    },
    { 
      id: 'robi', 
      name: 'Robi', 
      prefixes: ['018', '019']
    },
    { 
      id: 'banglalink', 
      name: 'Banglalink', 
      prefixes: ['019', '014']
    },
    { 
      id: 'teletalk', 
      name: 'Teletalk', 
      prefixes: ['015']
    },
    { 
      id: 'airtel', 
      name: 'Airtel', 
      prefixes: ['016']
    }
  ];

  async processMobileRecharge(
    userId: string,
    userPhone: string,
    rechargeData: MobileRechargeData
  ): Promise<MobileRechargeResult> {
    try {
      // Validate operator
      const operator = this.operators.find(op => op.id === rechargeData.operator);
      if (!operator) {
        return {
          success: false,
          message: 'Invalid mobile operator selected'
        };
      }

      // Validate phone number prefix
      const prefix = rechargeData.phoneNumber.substring(0, 3);
      if (!operator.prefixes.includes(prefix)) {
        return {
          success: false,
          message: `Phone number doesn't match ${operator.name} prefix`
        };
      }

      // Validate amount
      if (rechargeData.amount < 10 || rechargeData.amount > 5000) {
        return {
          success: false,
          message: 'Recharge amount must be between BDT 10 and BDT 5,000'
        };
      }

      // Simulate recharge processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      const transactionId = `MR${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;
      
      if (!isSuccess) {
        return {
          success: false,
          message: 'Mobile recharge failed. Please try again.'
        };
      }

      const rechargeResult = {
        operator: operator.name,
        phoneNumber: rechargeData.phoneNumber,
        amount: rechargeData.amount,
        timestamp: new Date().toISOString()
      };

      // Send SMS notification
      try {
        await smsService.sendMobileRechargeSMS(userId, userPhone, {
          operator: operator.name,
          phoneNumber: rechargeData.phoneNumber,
          amount: rechargeData.amount,
          date: new Date().toLocaleDateString('bn-BD')
        });
      } catch (smsError) {
        const appError = handleError(smsError, 'MobileRechargeService');
        log.error('Failed to send mobile recharge SMS', appError, 'MobileRechargeService');
        // Don't fail the recharge if SMS fails
      }

      return {
        success: true,
        transactionId,
        message: `Mobile recharge successful! BDT ${rechargeData.amount} recharged to ${rechargeData.phoneNumber}`,
        data: rechargeResult
      };

    } catch (error) {
      const appError = handleError(error, 'MobileRechargeService');
      log.error('Mobile recharge processing error', appError, 'MobileRechargeService');
      return {
        success: false,
        message: 'Mobile recharge failed due to system error. Please try again.'
      };
    }
  }

  getOperators() {
    return this.operators;
  }

  validatePhoneNumber(phoneNumber: string, operatorId: string): boolean {
    const operator = this.operators.find(op => op.id === operatorId);
    if (!operator) return false;

    const prefix = phoneNumber.substring(0, 3);
    return operator.prefixes.includes(prefix);
  }
}

export const mobileRechargeService = new MobileRechargeService();