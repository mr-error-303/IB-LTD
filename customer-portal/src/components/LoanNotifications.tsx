import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { LoanApplication, LoanStatus } from '../types';

interface LoanNotification {
  id: string;
  loanId: string;
  type: 'status_change' | 'payment_reminder' | 'document_required' | 'disbursement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  status?: LoanStatus;
  rejectionReason?: string;
  actionRequired?: boolean;
}

interface LoanNotificationsProps {
  loans: LoanApplication[];
  onMarkAsRead: (notificationId: string) => void;
  onAction: (actionType: string, loanId: string) => void;
}

const LoanNotifications: React.FC<LoanNotificationsProps> = ({ 
  loans, 
  onMarkAsRead, 
  onAction 
}) => {
  const [notifications, setNotifications] = useState<LoanNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  // Generate notifications based on loan status
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: LoanNotification[] = [];

      loans.forEach(loan => {
        switch (loan.status) {
          case 'pending':
            newNotifications.push({
              id: `${loan.id}_pending`,
              loanId: loan.id,
              type: 'status_change',
              title: 'Application Under Review',
              message: `Your ${loan.loanType} loan application for ₹${loan.amount.toLocaleString()} is being reviewed by our team.`,
              timestamp: loan.applicationDate,
              read: false,
              status: 'pending',
              actionRequired: false
            });
            break;

          case 'approved':
            newNotifications.push({
              id: `${loan.id}_approved`,
              loanId: loan.id,
              type: 'status_change',
              title: 'Loan Approved! 🎉',
              message: `Congratulations! Your ${loan.loanType} loan for ₹${loan.amount.toLocaleString()} has been approved. Disbursement will be processed within 2-3 business days.`,
              timestamp: loan.approvalDate || new Date(),
              read: false,
              status: 'approved',
              actionRequired: false
            });
            break;

          case 'rejected':
            newNotifications.push({
              id: `${loan.id}_rejected`,
              loanId: loan.id,
              type: 'status_change',
              title: 'Application Rejected',
              message: `Unfortunately, your ${loan.loanType} loan application has been rejected.`,
              timestamp: loan.rejectionDate || new Date(),
              read: false,
              status: 'rejected',
              rejectionReason: loan.rejectionReason,
              actionRequired: true
            });
            break;

          case 'active':
            // Payment reminder notification
            if (loan.nextPaymentDate) {
              const daysUntilPayment = Math.ceil(
                (loan.nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              if (daysUntilPayment <= 5 && daysUntilPayment > 0) {
                newNotifications.push({
                  id: `${loan.id}_payment_reminder`,
                  loanId: loan.id,
                  type: 'payment_reminder',
                  title: 'Payment Due Soon',
                  message: `Your EMI payment of ₹${loan.monthlyEMI?.toLocaleString()} is due in ${daysUntilPayment} day${daysUntilPayment > 1 ? 's' : ''}.`,
                  timestamp: new Date(),
                  read: false,
                  actionRequired: true
                });
              }
            }

            // Disbursement notification
            if (loan.disbursementDate) {
              newNotifications.push({
                id: `${loan.id}_disbursed`,
                loanId: loan.id,
                type: 'disbursement',
                title: 'Loan Disbursed',
                message: `Your loan amount of ₹${loan.amount.toLocaleString()} has been successfully disbursed to your account.`,
                timestamp: loan.disbursementDate,
                read: false,
                status: 'active',
                actionRequired: false
              });
            }
            break;

          case 'completed':
            newNotifications.push({
              id: `${loan.id}_completed`,
              loanId: loan.id,
              type: 'status_change',
              title: 'Loan Completed! 🎊',
              message: `Congratulations! You have successfully completed your ${loan.loanType} loan repayment.`,
              timestamp: loan.completionDate || new Date(),
              read: false,
              status: 'completed',
              actionRequired: false
            });
            break;
        }
      });

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [loans]);

  const getNotificationIcon = (type: string, status?: LoanStatus) => {
    switch (type) {
      case 'status_change':
        switch (status) {
          case 'approved':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
          case 'rejected':
            return <XCircle className="w-5 h-5 text-red-500" />;
          case 'completed':
            return <CheckCircle className="w-5 h-5 text-purple-500" />;
          default:
            return <Clock className="w-5 h-5 text-yellow-500" />;
        }
      case 'payment_reminder':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'disbursement':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, status?: LoanStatus) => {
    switch (type) {
      case 'status_change':
        switch (status) {
          case 'approved':
            return 'border-l-green-500 bg-green-50';
          case 'rejected':
            return 'border-l-red-500 bg-red-50';
          case 'completed':
            return 'border-l-purple-500 bg-purple-50';
          default:
            return 'border-l-yellow-500 bg-yellow-50';
        }
      case 'payment_reminder':
        return 'border-l-blue-500 bg-blue-50';
      case 'disbursement':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: LoanNotification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionRequired) {
      setExpandedNotification(
        expandedNotification === notification.id ? null : notification.id
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Loan Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No loan notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="border-b last:border-b-0">
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type, notification.status)} ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type, notification.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp.toLocaleDateString()} at {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {notification.actionRequired && (
                        <div className="flex-shrink-0">
                          {expandedNotification === notification.id ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expanded Content for Rejections */}
                    {expandedNotification === notification.id && notification.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</h4>
                        <p className="text-sm text-red-700">{notification.rejectionReason}</p>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('view_rejection', notification.loanId);
                            }}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('apply_again', notification.loanId);
                            }}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            Apply Again
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment Reminder Actions */}
                    {expandedNotification === notification.id && notification.type === 'payment_reminder' && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('make_payment', notification.loanId);
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Pay Now
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('view_schedule', notification.loanId);
                            }}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            View Schedule
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanNotifications;