import { log } from './logger';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  component?: string;
}

export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  
  // Transaction errors
  TRANSACTION_INSUFFICIENT_FUNDS = 'TRANSACTION_INSUFFICIENT_FUNDS',
  TRANSACTION_INVALID_ACCOUNT = 'TRANSACTION_INVALID_ACCOUNT',
  TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Card errors
  CARD_BLOCKED = 'CARD_BLOCKED',
  CARD_EXPIRED = 'CARD_EXPIRED',
  CARD_INVALID = 'CARD_INVALID',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_AMOUNT = 'VALIDATION_INVALID_AMOUNT',
  
  // System errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action',
  
  [ErrorCode.NETWORK_ERROR]: 'Network connection error. Please check your internet connection',
  [ErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again',
  
  [ErrorCode.TRANSACTION_INSUFFICIENT_FUNDS]: 'Insufficient funds in your account',
  [ErrorCode.TRANSACTION_INVALID_ACCOUNT]: 'Invalid account number',
  [ErrorCode.TRANSACTION_LIMIT_EXCEEDED]: 'Transaction limit exceeded',
  [ErrorCode.TRANSACTION_FAILED]: 'Transaction failed. Please try again',
  
  [ErrorCode.CARD_BLOCKED]: 'Your card is blocked. Please contact customer service',
  [ErrorCode.CARD_EXPIRED]: 'Your card has expired',
  [ErrorCode.CARD_INVALID]: 'Invalid card information',
  
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'This field is required',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format',
  [ErrorCode.VALIDATION_INVALID_AMOUNT]: 'Invalid amount',
  
  [ErrorCode.SYSTEM_ERROR]: 'A system error occurred. Please try again later',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
};

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 100;

  createError(
    code: ErrorCode,
    message?: string,
    details?: any,
    component?: string
  ): AppError {
    const error: AppError = {
      code,
      message: message || ErrorMessages[code],
      details,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      component
    };

    this.addError(error);
    return error;
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.id;
      }
    } catch (error) {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private addError(error: AppError): void {
    this.errors.push(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log the error
    log.error(error.message, error, error.component);
  }

  handleError(error: any, component?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      // Handle JavaScript errors
      if (error.message.includes('fetch')) {
        appError = this.createError(ErrorCode.NETWORK_ERROR, undefined, error, component);
      } else if (error.message.includes('timeout')) {
        appError = this.createError(ErrorCode.NETWORK_TIMEOUT, undefined, error, component);
      } else {
        appError = this.createError(ErrorCode.SYSTEM_ERROR, error.message, error, component);
      }
    } else if (typeof error === 'object' && error.code) {
      // Handle API errors with error codes
      appError = this.createError(error.code, error.message, error, component);
    } else if (typeof error === 'string') {
      // Handle string errors
      appError = this.createError(ErrorCode.SYSTEM_ERROR, error, undefined, component);
    } else {
      // Handle unknown errors
      appError = this.createError(ErrorCode.UNKNOWN_ERROR, undefined, error, component);
    }

    return appError;
  }

  // Specific error handlers
  handleAuthError(error: any, component?: string): AppError {
    if (error?.status === 401) {
      return this.createError(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, error, component);
    } else if (error?.status === 403) {
      return this.createError(ErrorCode.AUTH_UNAUTHORIZED, undefined, error, component);
    }
    return this.handleError(error, component);
  }

  handleTransactionError(error: any, component?: string): AppError {
    if (error?.code === 'INSUFFICIENT_FUNDS') {
      return this.createError(ErrorCode.TRANSACTION_INSUFFICIENT_FUNDS, undefined, error, component);
    } else if (error?.code === 'INVALID_ACCOUNT') {
      return this.createError(ErrorCode.TRANSACTION_INVALID_ACCOUNT, undefined, error, component);
    } else if (error?.code === 'LIMIT_EXCEEDED') {
      return this.createError(ErrorCode.TRANSACTION_LIMIT_EXCEEDED, undefined, error, component);
    }
    return this.createError(ErrorCode.TRANSACTION_FAILED, undefined, error, component);
  }

  handleValidationError(field: string, type: 'required' | 'format' | 'amount', component?: string): AppError {
    let code: ErrorCode;
    let message: string;

    switch (type) {
      case 'required':
        code = ErrorCode.VALIDATION_REQUIRED_FIELD;
        message = `${field} is required`;
        break;
      case 'format':
        code = ErrorCode.VALIDATION_INVALID_FORMAT;
        message = `Invalid ${field} format`;
        break;
      case 'amount':
        code = ErrorCode.VALIDATION_INVALID_AMOUNT;
        message = `Invalid ${field} amount`;
        break;
      default:
        code = ErrorCode.VALIDATION_INVALID_FORMAT;
        message = `Invalid ${field}`;
    }

    return this.createError(code, message, { field, type }, component);
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  // Utility method to show user-friendly error messages
  getDisplayMessage(error: AppError): string {
    return error.message;
  }

  // Check if error should be shown to user
  shouldShowToUser(error: AppError): boolean {
    const systemErrors = [
      ErrorCode.SYSTEM_ERROR,
      ErrorCode.UNKNOWN_ERROR,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.NETWORK_TIMEOUT
    ];
    
    return !systemErrors.includes(error.code as ErrorCode);
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience methods
export const handleError = (error: any, component?: string) => errorHandler.handleError(error, component);
export const handleAuthError = (error: any, component?: string) => errorHandler.handleAuthError(error, component);
export const handleTransactionError = (error: any, component?: string) => errorHandler.handleTransactionError(error, component);
export const handleValidationError = (field: string, type: 'required' | 'format' | 'amount', component?: string) => 
  errorHandler.handleValidationError(field, type, component);