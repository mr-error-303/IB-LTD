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
  nationality?: string;
  status?: 'active' | 'pending_approval' | 'rejected';
  accounts?: Account[];
  cards?: Card[];
  notificationPreferences?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
    billPaymentAlerts: boolean;
    mobileRechargeAlerts: boolean;
  };
}

export interface Account {
  id: string;
  type: 'savings' | 'checking' | 'business';
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
  openedDate: string;
}

export interface Card {
  id: string;
  type: 'debit' | 'credit';
  cardNumber: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'blocked';
  issuedDate: string;
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

// Loan Status Types
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed';

export interface LoanApplication {
  id: string;
  userId: string;
  loanType: 'personal' | 'home' | 'car' | 'education' | 'business';
  amount: number;
  status: LoanStatus;
  applicationDate: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  rejectionReason?: string;
  disbursementDate?: Date;
  completionDate?: Date;
  repaymentPeriod: number; // in months
  interestRate: number;
  monthlyEMI?: number;
  paidAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  nextPaymentDate?: Date;
  documents: UploadedDocument[];
}

export interface LoanStatusInfo {
  status: LoanStatus;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  actions?: string[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}