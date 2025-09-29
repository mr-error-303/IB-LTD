export interface SMSNotification {
  id: string;
  phoneNumber: string;
  message: string;
  type: 'transaction' | 'security' | 'general';
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
  userId: string;
}

export interface SMSTemplate {
  type: string;
  template: string;
}

class SMSService {
  private notifications: SMSNotification[] = [];
  private templates: SMSTemplate[] = [
    {
      type: 'transaction_credit',
      template: 'আপনার অ্যাকাউন্টে {amount} টাকা জমা হয়েছে। বর্তমান ব্যালেন্স: {balance} টাকা। তারিখ: {date}। IB LTD'
    },
    {
      type: 'transaction_debit',
      template: 'আপনার অ্যাকাউন্ট থেকে {amount} টাকা কেটে নেওয়া হয়েছে। বর্তমান ব্যালেন্স: {balance} টাকা। তারিখ: {date}। IB LTD'
    },
    {
      type: 'transaction_transfer_sent',
      template: 'আপনি {toAccount} নম্বরে {amount} টাকা পাঠিয়েছেন। বর্তমান ব্যালেন্স: {balance} টাকা। তারিখ: {date}। IB LTD'
    },
    {
      type: 'transaction_transfer_received',
      template: 'আপনি {fromAccount} নম্বর থেকে {amount} টাকা পেয়েছেন। বর্তমান ব্যালেন্স: {balance} টাকা। তারিখ: {date}। IB LTD'
    },
    {
      type: 'security_login',
      template: 'আপনার অ্যাকাউন্টে নতুন লগইন হয়েছে। তারিখ: {date}, সময়: {time}। যদি এটি আপনি না হন, তাহলে অবিলম্বে যোগাযোগ করুন। IB LTD'
    },
    {
      type: 'security_failed_login',
      template: 'আপনার অ্যাকাউন্টে ব্যর্থ লগইন প্রচেষ্টা। তারিখ: {date}, সময়: {time}। যদি এটি আপনি না হন, তাহলে অবিলম্বে যোগাযোগ করুন। IB LTD'
    },
    {
      type: 'security_password_change',
      template: 'আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করা হয়েছে। তারিখ: {date}, সময়: {time}। যদি এটি আপনি না হন, তাহলে অবিলম্বে যোগাযোগ করুন। IB LTD'
    },
    {
      type: 'bill_payment',
      template: 'আপনার {billType} বিল পেমেন্ট সফল হয়েছে। পরিমাণ: {amount} টাকা। রেফারেন্স: {reference}। তারিখ: {date}। IB LTD'
    },
    {
      type: 'mobile_recharge',
      template: 'আপনার {operator} মোবাইল রিচার্জ সফল হয়েছে। নম্বর: {phoneNumber}, পরিমাণ: {amount} টাকা। তারিখ: {date}। IB LTD'
    }
  ];

  // Simulate SMS sending with delay
  private async simulateSMSSending(): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  // Get template by type
  private getTemplate(type: string): string {
    const template = this.templates.find(t => t.type === type);
    return template ? template.template : '';
  }

  // Replace placeholders in template
  private formatMessage(template: string, data: Record<string, any>): string {
    let message = template;
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    return message;
  }

  // Send transaction SMS
  async sendTransactionSMS(
    userId: string,
    phoneNumber: string,
    transactionType: 'credit' | 'debit' | 'transfer_sent' | 'transfer_received',
    data: {
      amount: number;
      balance: number;
      date: string;
      toAccount?: string;
      fromAccount?: string;
    }
  ): Promise<SMSNotification> {
    const templateType = `transaction_${transactionType}`;
    const template = this.getTemplate(templateType);
    
    const formattedData = {
      ...data,
      amount: data.amount.toLocaleString('bn-BD'),
      balance: data.balance.toLocaleString('bn-BD')
    };
    
    const message = this.formatMessage(template, formattedData);
    
    const notification: SMSNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      phoneNumber,
      message,
      type: 'transaction',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId
    };

    try {
      const success = await this.simulateSMSSending();
      notification.status = success ? 'sent' : 'failed';
      
      this.notifications.push(notification);
      
      // Log to console for demonstration
      console.log(`📱 SMS ${notification.status.toUpperCase()}:`, {
        to: phoneNumber,
        message: message,
        type: transactionType,
        timestamp: notification.timestamp
      });
      
      return notification;
    } catch (error) {
      notification.status = 'failed';
      this.notifications.push(notification);
      console.error('SMS sending failed:', error);
      return notification;
    }
  }

  // Send security SMS
  async sendSecuritySMS(
    userId: string,
    phoneNumber: string,
    securityType: 'login' | 'failed_login' | 'password_change',
    data: {
      date: string;
      time: string;
    }
  ): Promise<SMSNotification> {
    const templateType = `security_${securityType}`;
    const template = this.getTemplate(templateType);
    const message = this.formatMessage(template, data);
    
    const notification: SMSNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      phoneNumber,
      message,
      type: 'security',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId
    };

    try {
      const success = await this.simulateSMSSending();
      notification.status = success ? 'sent' : 'failed';
      
      this.notifications.push(notification);
      
      // Log to console for demonstration
      console.log(`🔒 Security SMS ${notification.status.toUpperCase()}:`, {
        to: phoneNumber,
        message: message,
        type: securityType,
        timestamp: notification.timestamp
      });
      
      return notification;
    } catch (error) {
      notification.status = 'failed';
      this.notifications.push(notification);
      console.error('Security SMS sending failed:', error);
      return notification;
    }
  }

  // Send bill payment SMS
  async sendBillPaymentSMS(
    userId: string,
    phoneNumber: string,
    data: {
      billType: string;
      amount: number;
      reference: string;
      date: string;
    }
  ): Promise<SMSNotification> {
    const template = this.getTemplate('bill_payment');
    const formattedData = {
      ...data,
      amount: data.amount.toLocaleString('bn-BD')
    };
    const message = this.formatMessage(template, formattedData);
    
    const notification: SMSNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      phoneNumber,
      message,
      type: 'general',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId
    };

    try {
      const success = await this.simulateSMSSending();
      notification.status = success ? 'sent' : 'failed';
      
      this.notifications.push(notification);
      
      console.log(`💳 Bill Payment SMS ${notification.status.toUpperCase()}:`, {
        to: phoneNumber,
        message: message,
        timestamp: notification.timestamp
      });
      
      return notification;
    } catch (error) {
      notification.status = 'failed';
      this.notifications.push(notification);
      console.error('Bill payment SMS sending failed:', error);
      return notification;
    }
  }

  // Send mobile recharge SMS
  async sendMobileRechargeSMS(
    userId: string,
    phoneNumber: string,
    data: {
      operator: string;
      phoneNumber: string;
      amount: number;
      date: string;
    }
  ): Promise<SMSNotification> {
    const template = this.getTemplate('mobile_recharge');
    const formattedData = {
      ...data,
      amount: data.amount.toLocaleString('bn-BD')
    };
    const message = this.formatMessage(template, formattedData);
    
    const notification: SMSNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      phoneNumber,
      message,
      type: 'general',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId
    };

    try {
      const success = await this.simulateSMSSending();
      notification.status = success ? 'sent' : 'failed';
      
      this.notifications.push(notification);
      
      console.log(`📱 Mobile Recharge SMS ${notification.status.toUpperCase()}:`, {
        to: phoneNumber,
        message: message,
        timestamp: notification.timestamp
      });
      
      return notification;
    } catch (error) {
      notification.status = 'failed';
      this.notifications.push(notification);
      console.error('Mobile recharge SMS sending failed:', error);
      return notification;
    }
  }

  // Get notification history for a user
  getNotificationHistory(userId: string): SMSNotification[] {
    return this.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get all notifications (for admin)
  getAllNotifications(): SMSNotification[] {
    return this.notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Clear notification history
  clearHistory(userId?: string): void {
    if (userId) {
      this.notifications = this.notifications.filter(n => n.userId !== userId);
    } else {
      this.notifications = [];
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();