import React, { useState, useEffect } from 'react';
import { LoanApplication } from '../types';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  CreditCard,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface EMITrackerProps {
  loans: LoanApplication[];
  onMakePayment: (loanId: string, amount: number) => void;
  onSetReminder: (loanId: string, reminderDate: Date) => void;
}

interface EMISchedule {
  loanId: string;
  dueDate: Date;
  amount: number;
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
  daysUntilDue: number;
  loanType: string;
  principalAmount: number;
  interestAmount: number;
}

interface PaymentReminder {
  id: string;
  loanId: string;
  reminderDate: Date;
  isActive: boolean;
}

const EMITracker: React.FC<EMITrackerProps> = ({
  loans,
  onMakePayment,
  onSetReminder
}) => {
  const [emiSchedules, setEmiSchedules] = useState<EMISchedule[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedLoanForReminder, setSelectedLoanForReminder] = useState<string>('');
  const [reminderDays, setReminderDays] = useState<number>(3);
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'status'>('dueDate');

  // Calculate EMI schedules
  useEffect(() => {
    const activeLoans = loans.filter(loan => loan.status === 'active' && loan.nextPaymentDate);
    
    const schedules: EMISchedule[] = activeLoans.map(loan => {
      const dueDate = new Date(loan.nextPaymentDate!);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: EMISchedule['status'] = 'upcoming';
      if (daysUntilDue < 0) {
        status = 'overdue';
      } else if (daysUntilDue <= 0) {
        status = 'due';
      }

      // Calculate principal and interest breakdown (simplified)
      const monthlyRate = loan.interestRate / 100 / 12;
      const remainingBalance = loan.remainingAmount || loan.amount;
      const interestAmount = remainingBalance * monthlyRate;
      const principalAmount = (loan.monthlyEMI || 0) - interestAmount;

      return {
        loanId: loan.id,
        dueDate,
        amount: loan.monthlyEMI || 0,
        status,
        daysUntilDue,
        loanType: loan.loanType,
        principalAmount: Math.max(0, principalAmount),
        interestAmount: Math.max(0, interestAmount)
      };
    });

    // Sort schedules
    const sortedSchedules = schedules.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          const statusOrder = { overdue: 0, due: 1, upcoming: 2, paid: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    setEmiSchedules(sortedSchedules);
  }, [loans, sortBy]);

  // Get status color and icon
  const getStatusDisplay = (status: EMISchedule['status'], daysUntilDue: number) => {
    switch (status) {
      case 'overdue':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: AlertTriangle,
          text: `${Math.abs(daysUntilDue)} days overdue`
        };
      case 'due':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: Clock,
          text: 'Due today'
        };
      case 'upcoming':
        return {
          color: daysUntilDue <= 7 ? 'text-yellow-600' : 'text-green-600',
          bgColor: daysUntilDue <= 7 ? 'bg-yellow-100' : 'bg-green-100',
          icon: Calendar,
          text: `Due in ${daysUntilDue} days`
        };
      case 'paid':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          text: 'Paid'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: Calendar,
          text: 'Unknown'
        };
    }
  };

  // Calculate summary statistics
  const totalUpcomingEMI = emiSchedules
    .filter(emi => emi.status === 'upcoming' || emi.status === 'due')
    .reduce((sum, emi) => sum + emi.amount, 0);

  const overdueCount = emiSchedules.filter(emi => emi.status === 'overdue').length;
  const dueThisWeek = emiSchedules.filter(emi => 
    emi.status === 'upcoming' && emi.daysUntilDue <= 7
  ).length;

  const nextEMI = emiSchedules.find(emi => emi.status !== 'overdue') || emiSchedules[0];

  // Handle reminder setup
  const handleSetReminder = () => {
    if (selectedLoanForReminder) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + reminderDays);
      
      const newReminder: PaymentReminder = {
        id: `reminder_${Date.now()}`,
        loanId: selectedLoanForReminder,
        reminderDate,
        isActive: true
      };

      setReminders(prev => [...prev, newReminder]);
      onSetReminder(selectedLoanForReminder, reminderDate);
      setShowReminderModal(false);
      setSelectedLoanForReminder('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">EMI Tracker</h2>
            <p className="text-gray-600">Track your upcoming EMI payments and due dates</p>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span>Set Reminder</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Next EMI</p>
                <p className="text-lg font-bold text-blue-900">
                  {nextEMI ? `₹${nextEMI.amount.toLocaleString()}` : 'No EMI due'}
                </p>
                {nextEMI && (
                  <p className="text-sm text-blue-600">
                    {nextEMI.dueDate.toLocaleDateString()}
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Monthly EMI</p>
                <p className="text-lg font-bold text-green-900">₹{totalUpcomingEMI.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Due This Week</p>
                <p className="text-lg font-bold text-yellow-900">{dueThisWeek}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-lg font-bold text-red-900">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* EMI Schedule */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">EMI Schedule</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {emiSchedules.length > 0 ? (
            <div className="space-y-4">
              {emiSchedules.map((emi) => {
                const statusDisplay = getStatusDisplay(emi.status, emi.daysUntilDue);
                const StatusIcon = statusDisplay.icon;

                return (
                  <div
                    key={emi.loanId}
                    className={`border rounded-lg p-4 ${
                      emi.status === 'overdue' 
                        ? 'border-red-200 bg-red-50' 
                        : emi.status === 'due'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${statusDisplay.bgColor}`}>
                          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {emi.loanType.charAt(0).toUpperCase() + emi.loanType.slice(1)} Loan
                          </h4>
                          <p className="text-sm text-gray-600">Loan ID: {emi.loanId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{emi.amount.toLocaleString()}</p>
                        <p className={`text-sm font-medium ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">
                          {emi.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Principal</p>
                        <p className="font-medium text-gray-900">₹{emi.principalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest</p>
                        <p className="font-medium text-gray-900">₹{emi.interestAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total EMI</p>
                        <p className="font-medium text-gray-900">₹{emi.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    {(emi.status === 'due' || emi.status === 'overdue' || emi.daysUntilDue <= 7) && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {emi.status === 'overdue' && (
                            <span className="text-red-600 text-sm font-medium">
                              Action Required: Payment Overdue
                            </span>
                          )}
                          {emi.status === 'due' && (
                            <span className="text-orange-600 text-sm font-medium">
                              Payment Due Today
                            </span>
                          )}
                          {emi.status === 'upcoming' && emi.daysUntilDue <= 7 && (
                            <span className="text-yellow-600 text-sm font-medium">
                              Due Soon
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLoanForReminder(emi.loanId);
                              setShowReminderModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Set Reminder
                          </button>
                          <button
                            onClick={() => onMakePayment(emi.loanId, emi.amount)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No EMI payments scheduled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Reminders */}
      {reminders.filter(r => r.isActive).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reminders</h3>
          <div className="space-y-2">
            {reminders.filter(r => r.isActive).map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-900">
                    Reminder set for loan {reminder.loanId} on {reminder.reminderDate.toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => setReminders(prev => 
                    prev.map(r => r.id === reminder.id ? { ...r, isActive: false } : r)
                  )}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Payment Reminder</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loan
                </label>
                <select
                  value={selectedLoanForReminder}
                  onChange={(e) => setSelectedLoanForReminder(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a loan</option>
                  {emiSchedules.map((emi) => (
                    <option key={emi.loanId} value={emi.loanId}>
                      {emi.loanId} - Due {emi.dueDate.toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me (days before due date)
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                  <option value={14}>2 weeks before</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setSelectedLoanForReminder('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetReminder}
                disabled={!selectedLoanForReminder}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMITracker;