export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  component?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;
  private isAuthInProgress: boolean = false;

  constructor() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.currentLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'production') {
      this.currentLevel = LogLevel.ERROR;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Prevent recursive calls during authentication by checking if we're in an auth process
      if (this.isAuthInProgress) {
        return undefined;
      }
      
      // Use the correct localStorage key that matches AuthContext
      const user = localStorage.getItem('bankingUser');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.id;
      }
    } catch (error) {
      // Ignore errors when getting user ID to prevent recursive logging
    }
    return undefined;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      const logMethod = this.getConsoleMethod(entry.level);
      if (entry.data) {
        logMethod(`[${entry.component || 'App'}] ${entry.message}`, entry.data);
      } else {
        logMethod(`[${entry.component || 'App'}] ${entry.message}`);
      }
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  debug(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data, component);
      this.addLog(entry);
    }
  }

  info(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, data, component);
      this.addLog(entry);
    }
  }

  warn(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, data, component);
      this.addLog(entry);
    }
  }

  error(message: string, error?: any, component?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, error, component);
      this.addLog(entry);

      // In production, you might want to send errors to a logging service
      if (process.env.NODE_ENV === 'production') {
        this.sendToLoggingService(entry);
      }
    }
  }

  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    try {
      // In a real application, you would send this to your logging service
      // For now, we'll just store it locally
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errorLogs.push(entry);
      
      // Keep only the last 100 error logs
      if (errorLogs.length > 100) {
        errorLogs.splice(0, errorLogs.length - 100);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errorLogs));
    } catch (error) {
      // Ignore errors when logging
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // Security-specific logging methods
  security(message: string, data?: any): void {
    this.warn(`[SECURITY] ${message}`, data, 'Security');
  }

  transaction(message: string, data?: any): void {
    this.info(`[TRANSACTION] ${message}`, data, 'Transaction');
  }

  authentication(message: string, data?: any): void {
    this.isAuthInProgress = true;
    this.info(`[AUTH] ${message}`, data, 'Authentication');
    // Reset after a short delay to allow the auth process to complete
    setTimeout(() => {
      this.isAuthInProgress = false;
    }, 100);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods
export const log = {
  debug: (message: string, data?: any, component?: string) => logger.debug(message, data, component),
  info: (message: string, data?: any, component?: string) => logger.info(message, data, component),
  warn: (message: string, data?: any, component?: string) => logger.warn(message, data, component),
  error: (message: string, error?: any, component?: string) => logger.error(message, error, component),
  security: (message: string, data?: any) => logger.security(message, data),
  transaction: (message: string, data?: any) => logger.transaction(message, data),
  auth: (message: string, data?: any) => logger.authentication(message, data)
};