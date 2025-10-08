import axios from 'axios';
import { Transaction, TransferRequest, ApiResponse, User } from '../types';
import { smsService } from './smsService';
import { log } from '../utils/logger';
import { handleError } from '../utils/errorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ib-ltd-admin.netlify.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 5000,
    description: 'Salary Credit',
    date: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'debit',
    amount: 1500,
    description: 'ATM Withdrawal',
    date: '2024-01-14T14:20:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'transfer',
    amount: 2000,
    description: 'Transfer to John',
    date: '2024-01-13T09:15:00Z',
    fromAccount: '1001',
    toAccount: '1002',
    status: 'completed'
  },
  {
    id: '4',
    type: 'debit',
    amount: 500,
    description: 'Online Shopping',
    date: '2024-01-12T16:45:00Z',
    status: 'completed'
  },
  {
    id: '5',
    type: 'credit',
    amount: 3000,
    description: 'Freelance Payment',
    date: '2024-01-11T11:30:00Z',
    status: 'completed'
  }
];

export const bankingService = {
  getTransactions: async (accountNumber: string): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: 'TXN001',
        date: '2024-01-15T10:30:00Z',
        description: 'Salary Credit',
        amount: 50000,
        type: 'credit',
        status: 'completed'
      },
      {
        id: 'TXN002',
        date: '2024-01-14T14:20:00Z',
        description: 'Online Shopping',
        amount: 2500,
        type: 'debit',
        status: 'completed'
      },
      {
        id: 'TXN003',
        date: '2024-01-13T09:15:00Z',
        description: 'Money Transfer to 1002',
        amount: 5000,
        type: 'debit',
        status: 'completed'
      },
      {
        id: 'TXN004',
        date: '2024-01-12T16:45:00Z',
        description: 'ATM Withdrawal',
        amount: 3000,
        type: 'debit',
        status: 'completed'
      },
      {
        id: 'TXN005',
        date: '2024-01-11T11:30:00Z',
        description: 'Money Received from 1003',
        amount: 8000,
        type: 'credit',
        status: 'completed'
      }
    ];

    return mockTransactions.filter(t => 
      accountNumber === '1001' || 
      accountNumber === '1002' || 
      accountNumber === '1003'
    );
  },

  getBalance: async (accountNumber: string): Promise<number> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock balance data based on account number
    const mockBalances: { [key: string]: number } = {
      '1001': 125000,
      '1002': 85000,
      '1003': 95000
    };

    return mockBalances[accountNumber] || 0;
  },

  // New method to process deposits with SMS notifications
  processDeposit: async (accountNumber: string, amount: number, description: string): Promise<ApiResponse<any>> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const transactionId = `DEP${Date.now()}`;
      const result = {
        success: true,
        message: 'জমা সফল হয়েছে',
        data: {
          transactionId,
          amount,
          description,
          type: 'deposit'
        }
      };

      // Send SMS notification for deposit
      try {
        await smsService.sendTransactionSMS(
          accountNumber,
          accountNumber, // phoneNumber - in real app would get from user data
          'credit',
          {
            amount,
            balance: 50000, // In real app, get actual balance
            date: new Date().toLocaleDateString('bn-BD')
          }
        );
      } catch (smsError) {
        const appError = handleError(smsError, 'BankingService');
        log.error('Failed to send SMS notification', appError, 'BankingService');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'জমা করতে সমস্যা হয়েছে'
      };
    }
  },

  // New method to process withdrawals with SMS notifications
  processWithdrawal: async (accountNumber: string, amount: number, description: string): Promise<ApiResponse<any>> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const transactionId = `WTH${Date.now()}`;
      const result = {
        success: true,
        message: 'উত্তোলন সফল হয়েছে',
        data: {
          transactionId,
          amount,
          description,
          type: 'withdrawal'
        }
      };

      // Send SMS notification for withdrawal
      try {
        await smsService.sendTransactionSMS(
          accountNumber,
          accountNumber, // phoneNumber - in real app would get from user data
          'debit',
          {
            amount,
            balance: 50000, // In real app, get actual balance
            date: new Date().toLocaleDateString('bn-BD')
          }
        );
      } catch (smsError) {
        const appError = handleError(smsError, 'BankingService');
        log.error('Failed to send SMS notification', appError, 'BankingService');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'উত্তোলন করতে সমস্যা হয়েছে'
      };
    }
  },

  transferMoney: async (fromAccount: string, transferData: TransferRequest): Promise<ApiResponse<any>> => {
    try {
      // Mock transfer - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Validate PIN (mock validation)
      if (transferData.pin !== '1234') {
        return {
          success: false,
          message: 'ভুল পিন নম্বর'
        };
      }

      // Validate account exists
      const validAccounts = ['1001', '1002', '1003'];
      if (!validAccounts.includes(transferData.toAccount)) {
        return {
          success: false,
          message: 'প্রাপকের অ্যাকাউন্ট পাওয়া যায়নি'
        };
      }

      // Mock successful transfer
      const transactionId = `TXN${Date.now()}`;
      const result = {
        success: true,
        message: 'টাকা সফলভাবে পাঠানো হয়েছে',
        data: {
          transactionId,
          amount: transferData.amount,
          toAccount: transferData.toAccount
        }
      };

      // Send SMS notification for successful transfer
      try {
        await smsService.sendTransactionSMS(
          fromAccount,
          fromAccount, // phoneNumber - in real app would get from user data
          'transfer_sent',
          {
            amount: transferData.amount,
            balance: 50000, // In real app, get actual balance
            date: new Date().toLocaleDateString('bn-BD'),
            toAccount: transferData.toAccount
          }
        );
      } catch (smsError) {
        const appError = handleError(smsError, 'BankingService');
        log.error('Failed to send SMS notification', appError, 'BankingService');
        // Don't fail the transaction if SMS fails
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'টাকা পাঠাতে সমস্যা হয়েছে'
      };
    }
  },

  async getAccountBalance(accountNumber: string): Promise<ApiResponse<number>> {
    try {
      // Mock balance fetch - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock balance based on account number
      const balances: { [key: string]: number } = {
        '1001': 50000,
        '1002': 75000,
        '1003': 25000
      };

      const balance = balances[accountNumber] || 0;

      return {
        success: true,
        data: balance,
        message: 'Balance fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch balance'
      };
    }
  },

  async updateProfile(userId: string, profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      // Mock profile update - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        data: profileData as User,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }
};