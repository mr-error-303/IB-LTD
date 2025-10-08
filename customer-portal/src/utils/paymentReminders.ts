export interface PaymentReminder {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  reminderType: 'upcoming' | 'due_today' | 'overdue' | 'final_notice';
  daysFromDue: number; // Negative for overdue, positive for upcoming
  amountDue: number;
  dueDate: Date;
  createdAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'acknowledged';
  channel: 'email' | 'sms' | 'push' | 'call';
  escalationLevel: number;
  nextReminderDate?: Date;
  message: string;
  isUrgent: boolean;
}

export interface ReminderTemplate {
  type: PaymentReminder['reminderType'];
  channel: PaymentReminder['channel'];
  subject: string;
  message: string;
  escalationLevel: number;
  daysFromDue: number;
  isUrgent: boolean;
}

export interface NotificationPreferences {
  borrowerId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  callEnabled: boolean;
  preferredChannel: 'email' | 'sms' | 'push';
  reminderFrequency: 'daily' | 'weekly' | 'minimal';
  optOut: boolean;
}

export class PaymentReminderSystem {
  private static readonly REMINDER_SCHEDULE = [
    { daysFromDue: 7, type: 'upcoming' as const, escalationLevel: 1 },
    { daysFromDue: 3, type: 'upcoming' as const, escalationLevel: 1 },
    { daysFromDue: 1, type: 'upcoming' as const, escalationLevel: 2 },
    { daysFromDue: 0, type: 'due_today' as const, escalationLevel: 2 },
    { daysFromDue: -1, type: 'overdue' as const, escalationLevel: 3 },
    { daysFromDue: -3, type: 'overdue' as const, escalationLevel: 3 },
    { daysFromDue: -7, type: 'overdue' as const, escalationLevel: 4 },
    { daysFromDue: -15, type: 'final_notice' as const, escalationLevel: 5 },
    { daysFromDue: -30, type: 'final_notice' as const, escalationLevel: 5 }
  ];

  private static readonly TEMPLATES: ReminderTemplate[] = [
    {
      type: 'upcoming',
      channel: 'email',
      subject: 'Payment Reminder - Due in {days} days',
      message: 'Dear {borrowerName},\n\nThis is a friendly reminder that your loan payment of ${amount} is due on {dueDate}. Please ensure you have sufficient funds in your account for automatic deduction or make the payment manually through our portal.\n\nThank you for your attention to this matter.',
      escalationLevel: 1,
      daysFromDue: 7,
      isUrgent: false
    },
    {
      type: 'due_today',
      channel: 'email',
      subject: 'Payment Due Today - ${amount}',
      message: 'Dear {borrowerName},\n\nYour loan payment of ${amount} is due today ({dueDate}). If you haven\'t already made the payment, please do so immediately to avoid late fees.\n\nYou can make your payment through:\n- Online banking\n- Our mobile app\n- Visiting any branch\n\nThank you.',
      escalationLevel: 2,
      daysFromDue: 0,
      isUrgent: true
    },
    {
      type: 'overdue',
      channel: 'email',
      subject: 'URGENT: Overdue Payment Notice',
      message: 'Dear {borrowerName},\n\nYour loan payment of ${amount} was due on {dueDate} and is now {daysOverdue} days overdue. Please make the payment immediately to avoid additional penalties and protect your credit score.\n\nIf you\'re experiencing financial difficulties, please contact us immediately to discuss payment options.\n\nImmediate action required.',
      escalationLevel: 3,
      daysFromDue: -1,
      isUrgent: true
    },
    {
      type: 'final_notice',
      channel: 'email',
      subject: 'FINAL NOTICE: Immediate Payment Required',
      message: 'Dear {borrowerName},\n\nThis is a FINAL NOTICE regarding your overdue payment of ${amount}, which was due on {dueDate} ({daysOverdue} days ago).\n\nIf payment is not received within 48 hours, we will be forced to:\n- Report to credit bureaus\n- Initiate collection proceedings\n- Apply additional penalties\n\nContact us immediately: {contactNumber}\n\nUrgent action required.',
      escalationLevel: 5,
      daysFromDue: -15,
      isUrgent: true
    }
  ];

  static generateReminders(
    loanId: string,
    borrowerId: string,
    borrowerName: string,
    borrowerEmail: string,
    borrowerPhone: string,
    dueDate: Date,
    amountDue: number,
    preferences: NotificationPreferences
  ): PaymentReminder[] {
    if (preferences.optOut) return [];

    const reminders: PaymentReminder[] = [];
    const currentDate = new Date();
    const daysDifference = Math.floor((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Find applicable reminders based on current date
    const applicableSchedule = this.REMINDER_SCHEDULE.filter(schedule => {
      if (preferences.reminderFrequency === 'minimal') {
        return schedule.escalationLevel >= 3; // Only overdue reminders
      }
      if (preferences.reminderFrequency === 'weekly') {
        return schedule.daysFromDue === 7 || schedule.daysFromDue === 0 || schedule.escalationLevel >= 3;
      }
      return true; // Daily frequency includes all reminders
    });

    applicableSchedule.forEach(schedule => {
      if (daysDifference <= schedule.daysFromDue) {
        const template = this.getTemplate(schedule.type, preferences.preferredChannel);
        if (template) {
          const reminder: PaymentReminder = {
            id: `reminder_${loanId}_${schedule.daysFromDue}_${Date.now()}`,
            loanId,
            borrowerId,
            borrowerName,
            borrowerEmail,
            borrowerPhone,
            reminderType: schedule.type,
            daysFromDue: daysDifference,
            amountDue,
            dueDate,
            createdAt: currentDate,
            status: 'pending',
            channel: this.getPreferredChannel(preferences, schedule.escalationLevel),
            escalationLevel: schedule.escalationLevel,
            message: this.formatMessage(template.message, {
              borrowerName,
              amount: amountDue.toLocaleString(),
              dueDate: dueDate.toLocaleDateString(),
              daysOverdue: Math.abs(daysDifference).toString(),
              contactNumber: '1-800-BANK-HELP'
            }),
            isUrgent: template.isUrgent || schedule.escalationLevel >= 3
          };

          // Set next reminder date
          const nextSchedule = applicableSchedule.find(s => s.daysFromDue < schedule.daysFromDue);
          if (nextSchedule) {
            const nextDate = new Date(dueDate);
            nextDate.setDate(nextDate.getDate() - nextSchedule.daysFromDue);
            reminder.nextReminderDate = nextDate;
          }

          reminders.push(reminder);
        }
      }
    });

    return reminders;
  }

  private static getTemplate(type: PaymentReminder['reminderType'], channel: PaymentReminder['channel']): ReminderTemplate | undefined {
    return this.TEMPLATES.find(t => t.type === type && t.channel === channel) ||
           this.TEMPLATES.find(t => t.type === type && t.channel === 'email');
  }

  private static getPreferredChannel(preferences: NotificationPreferences, escalationLevel: number): PaymentReminder['channel'] {
    // For high escalation levels, use multiple channels
    if (escalationLevel >= 4) {
      if (preferences.callEnabled) return 'call';
      if (preferences.smsEnabled) return 'sms';
    }
    
    if (escalationLevel >= 3) {
      if (preferences.smsEnabled) return 'sms';
    }

    // Use preferred channel if available
    switch (preferences.preferredChannel) {
      case 'email':
        return preferences.emailEnabled ? 'email' : 'sms';
      case 'sms':
        return preferences.smsEnabled ? 'sms' : 'email';
      case 'push':
        return preferences.pushEnabled ? 'push' : 'email';
      default:
        return 'email';
    }
  }

  private static formatMessage(template: string, variables: Record<string, string>): string {
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return message;
  }

  static createEscalationReminder(
    originalReminder: PaymentReminder,
    newEscalationLevel: number
  ): PaymentReminder {
    const escalatedReminder: PaymentReminder = {
      ...originalReminder,
      id: `escalated_${originalReminder.id}_${Date.now()}`,
      escalationLevel: newEscalationLevel,
      createdAt: new Date(),
      status: 'pending',
      isUrgent: true
    };

    // Update channel for higher escalation
    if (newEscalationLevel >= 4) {
      escalatedReminder.channel = 'call';
    } else if (newEscalationLevel >= 3) {
      escalatedReminder.channel = 'sms';
    }

    // Update message for escalation
    if (newEscalationLevel >= 5) {
      escalatedReminder.reminderType = 'final_notice';
      escalatedReminder.message = this.formatMessage(
        this.TEMPLATES.find(t => t.type === 'final_notice')?.message || '',
        {
          borrowerName: originalReminder.borrowerName,
          amount: originalReminder.amountDue.toLocaleString(),
          dueDate: originalReminder.dueDate.toLocaleDateString(),
          daysOverdue: Math.abs(originalReminder.daysFromDue).toString(),
          contactNumber: '1-800-BANK-HELP'
        }
      );
    }

    return escalatedReminder;
  }

  static shouldEscalate(reminder: PaymentReminder, daysSinceSent: number): boolean {
    if (reminder.status !== 'sent') return false;

    switch (reminder.escalationLevel) {
      case 1:
        return daysSinceSent >= 3;
      case 2:
        return daysSinceSent >= 2;
      case 3:
        return daysSinceSent >= 1;
      case 4:
        return daysSinceSent >= 1;
      default:
        return false;
    }
  }

  static getNextReminderDate(currentReminder: PaymentReminder): Date | null {
    const schedule = this.REMINDER_SCHEDULE.find(s => 
      s.escalationLevel > currentReminder.escalationLevel
    );
    
    if (!schedule) return null;

    const nextDate = new Date(currentReminder.dueDate);
    nextDate.setDate(nextDate.getDate() - schedule.daysFromDue);
    return nextDate;
  }

  static getReminderStats(reminders: PaymentReminder[]) {
    const stats = {
      total: reminders.length,
      pending: reminders.filter(r => r.status === 'pending').length,
      sent: reminders.filter(r => r.status === 'sent').length,
      failed: reminders.filter(r => r.status === 'failed').length,
      acknowledged: reminders.filter(r => r.status === 'acknowledged').length,
      urgent: reminders.filter(r => r.isUrgent).length,
      byChannel: {
        email: reminders.filter(r => r.channel === 'email').length,
        sms: reminders.filter(r => r.channel === 'sms').length,
        push: reminders.filter(r => r.channel === 'push').length,
        call: reminders.filter(r => r.channel === 'call').length
      },
      byType: {
        upcoming: reminders.filter(r => r.reminderType === 'upcoming').length,
        due_today: reminders.filter(r => r.reminderType === 'due_today').length,
        overdue: reminders.filter(r => r.reminderType === 'overdue').length,
        final_notice: reminders.filter(r => r.reminderType === 'final_notice').length
      }
    };

    return stats;
  }
}