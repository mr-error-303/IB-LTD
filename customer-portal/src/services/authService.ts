import axios from 'axios';
import { LoginCredentials, User, ApiResponse } from '../types';
import { smsService } from './smsService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ib-ltd-admin.netlify.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for demonstration - in real app this would come from API
const mockUsers: User[] = [
  {
    id: '1',
    name: 'জন ডো',
    firstName: 'জন',
    lastName: 'ডো',
    email: 'john@example.com',
    accountNumber: '1001',
    balance: 50000,
    phone: '01712345678',
    address: 'ঢাকা, বাংলাদেশ',
    notificationPreferences: {
      smsEnabled: true,
      emailEnabled: true,
      transactionAlerts: true,
      securityAlerts: true,
      billPaymentAlerts: true,
      mobileRechargeAlerts: true
    }
  },
  {
    id: '2',
    name: 'জেন স্মিথ',
    firstName: 'জেন',
    lastName: 'স্মিথ',
    email: 'jane@example.com',
    accountNumber: '1002',
    balance: 75000,
    phone: '01798765432',
    address: 'চট্টগ্রাম, বাংলাদেশ',
    notificationPreferences: {
      smsEnabled: true,
      emailEnabled: false,
      transactionAlerts: true,
      securityAlerts: true,
      billPaymentAlerts: false,
      mobileRechargeAlerts: true
    }
  },
  {
    id: '3',
    name: 'আহমেদ আলী',
    firstName: 'আহমেদ',
    lastName: 'আলী',
    email: 'ahmed@example.com',
    accountNumber: '1003',
    balance: 25000,
    phone: '01687654321',
    address: 'সিলেট, বাংলাদেশ',
    notificationPreferences: {
      smsEnabled: false,
      emailEnabled: true,
      transactionAlerts: false,
      securityAlerts: true,
      billPaymentAlerts: true,
      mobileRechargeAlerts: false
    }
  }
];

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      // Mock authentication - in real app this would be an API call
      const user = mockUsers.find(u => 
        u.accountNumber === credentials.accountNumber && 
        credentials.pin === '1234' // Mock PIN
      );

      if (user) {
        // Send security SMS for successful login
        try {
          await smsService.sendSecuritySMS(user.id, user.phone || '01712345678', 'login', {
            date: new Date().toLocaleDateString('bn-BD'),
            time: new Date().toLocaleTimeString('bn-BD')
          });
        } catch (smsError) {
          console.error('Failed to send login security SMS:', smsError);
          // Don't fail login if SMS fails
        }

        return {
          success: true,
          data: user,
          message: 'Login successful'
        };
      } else {
        // Send security SMS for failed login attempt
        const attemptedUser = mockUsers.find(u => u.accountNumber === credentials.accountNumber);
        if (attemptedUser) {
          try {
            await smsService.sendSecuritySMS(attemptedUser.id, attemptedUser.phone || '01712345678', 'failed_login', {
              date: new Date().toLocaleDateString('bn-BD'),
              time: new Date().toLocaleTimeString('bn-BD')
            });
          } catch (smsError) {
            console.error('Failed to send failed login security SMS:', smsError);
          }
        }

        return {
          success: false,
          error: 'Invalid account number or PIN'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },

  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        return {
          success: true,
          data: user
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user profile'
      };
    }
  },

  async updateNotificationPreferences(userId: string, preferences: any): Promise<ApiResponse<User>> {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].notificationPreferences = {
          ...mockUsers[userIndex].notificationPreferences,
          ...preferences
        };
        return {
          success: true,
          data: mockUsers[userIndex],
          message: 'Notification preferences updated successfully'
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update notification preferences'
      };
    }
  }
};