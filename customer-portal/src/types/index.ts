export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  balance: number;
  role?: string;
  phone?: string;
  address?: string;
  notificationPreferences?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
    billPaymentAlerts: boolean;
    mobileRechargeAlerts: boolean;
  };
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string;
  date: string;
  fromAccount?: string;
  toAccount?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransferRequest {
  toAccount: string;
  amount: number;
  description: string;
  pin: string;
}

export interface LoginCredentials {
  accountNumber: string;
  pin: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}