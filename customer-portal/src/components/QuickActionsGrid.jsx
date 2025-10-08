import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  QrCodeIcon,
  BuildingLibraryIcon,
  WalletIcon,
  ReceiptPercentIcon,
  Cog6ToothIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const QUICK_ACTIONS = [
  {
    id: 'transfer',
    title: 'Quick Transfer',
    titleEn: 'Quick Transfer',
    subtitle: 'Send Money',
    icon: ArrowUpRightIcon,
    color: 'from-success-400 to-success-600',
    shadowColor: 'shadow-success-500/30',
    link: '/transfer',
    category: 'primary'
  },
  {
    id: 'receive',
    title: 'Receive Money',
    titleEn: 'Receive Money',
    subtitle: 'Via QR Code',
    icon: ArrowDownLeftIcon,
    color: 'from-info-400 to-info-600',
    shadowColor: 'shadow-info-500/30',
    link: '/receive',
    category: 'primary'
  },
  {
    id: 'cards',
    title: 'Card Management',
    titleEn: 'Card Management',
    subtitle: 'Debit/Credit Cards',
    icon: CreditCardIcon,
    color: 'from-primary-400 to-primary-600',
    shadowColor: 'shadow-primary-500/30',
    link: '/cards',
    category: 'primary'
  },
  {
    id: 'mobile-recharge',
    title: 'Mobile Recharge',
    titleEn: 'Mobile Recharge',
    subtitle: 'All Operators',
    icon: DevicePhoneMobileIcon,
    color: 'from-accent-400 to-accent-600',
    shadowColor: 'shadow-accent-500/30',
    link: '/mobile-recharge',
    category: 'secondary'
  },
  {
    id: 'bill-pay',
    title: 'Bill Payment',
    titleEn: 'Bill Payment',
    subtitle: 'Electricity, Gas, Water',
    icon: BoltIcon,
    color: 'from-warning-400 to-warning-600',
    shadowColor: 'shadow-warning-500/30',
    link: '/bill-payment',
    category: 'secondary'
  },
  {
    id: 'qr-pay',
    title: 'QR Payment',
    titleEn: 'QR Payment',
    subtitle: 'Scan & Pay',
    icon: QrCodeIcon,
    color: 'from-purple-400 to-purple-600',
    shadowColor: 'shadow-purple-500/30',
    link: '/qr-payment',
    category: 'secondary'
  },
  {
    id: 'loan',
    title: 'Loan Services',
    titleEn: 'Loan Services',
    subtitle: 'Apply & Info',
    icon: BuildingLibraryIcon,
    color: 'from-emerald-400 to-emerald-600',
    shadowColor: 'shadow-emerald-500/30',
    link: '/loans',
    category: 'tertiary'
  },
  {
    id: 'investment',
    title: 'Investment',
    titleEn: 'Investment',
    subtitle: 'FDR, DPS, Schemes',
    icon: WalletIcon,
    color: 'from-indigo-400 to-indigo-600',
    shadowColor: 'shadow-indigo-500/30',
    link: '/investment',
    category: 'tertiary'
  },
  {
    id: 'offers',
    title: 'Offers & Discounts',
    titleEn: 'Offers & Discounts',
    subtitle: 'Special Benefits',
    icon: ReceiptPercentIcon,
    color: 'from-rose-400 to-rose-600',
    shadowColor: 'shadow-rose-500/30',
    link: '/offers',
    category: 'tertiary'
  }
];

const QuickActionsGrid = ({ showAll = false }) => {
  const actionsToShow = showAll ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white/90">Quick Services</h3>
        {!showAll && QUICK_ACTIONS.length > 6 && (
          <button className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors">
            View All
          </button>
        )}
      </div>

      {/* Primary Actions - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {actionsToShow
          .filter(action => action.category === 'primary')
          .map((action, index) => (
            <ActionCard key={action.id} action={action} index={index} size="large" />
          ))}
      </div>

      {/* Secondary Actions - 2x2 Grid */}
      {actionsToShow.some(action => action.category === 'secondary') && (
        <div className="grid grid-cols-2 gap-3">
          {actionsToShow
            .filter(action => action.category === 'secondary')
            .map((action, index) => (
              <ActionCard key={action.id} action={action} index={index + 4} size="medium" />
            ))}
        </div>
      )}

      {/* Tertiary Actions - 3x1 Grid */}
      {showAll && actionsToShow.some(action => action.category === 'tertiary') && (
        <div className="grid grid-cols-3 gap-3">
          {actionsToShow
            .filter(action => action.category === 'tertiary')
            .map((action, index) => (
              <ActionCard key={action.id} action={action} index={index + 8} size="small" />
            ))}
        </div>
      )}
    </div>
  );
};

const ActionCard = ({ action, index, size = 'large' }) => {
  const sizeClasses = {
    large: 'p-6',
    medium: 'p-4',
    small: 'p-3'
  };

  const iconSizes = {
    large: 'w-8 h-8',
    medium: 'w-6 h-6',
    small: 'w-5 h-5'
  };

  const textSizes = {
    large: 'text-base',
    medium: 'text-sm',
    small: 'text-xs'
  };

  return (
    <Link
      to={action.link}
      className={`glass-card glass-card-hover group animate-fade-in-up overflow-hidden ${sizeClasses[size]}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="text-center space-y-3">
        <div className={`bg-gradient-to-br ${action.color} p-4 rounded-2xl mx-auto group-hover:scale-110 transition-all duration-300 shadow-glow ${action.shadowColor} w-fit icon-container`}>
          <action.icon className={`${iconSizes[size]} text-white flex-shrink-0`} />
        </div>
        <div className="min-w-0">
          <h4 className={`font-semibold text-white/90 mb-1 ${textSizes[size]} truncate`}>
            {action.title}
          </h4>
          <p className={`text-white/70 ${size === 'small' ? 'text-xs' : 'text-xs'} truncate`}>
            {action.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default QuickActionsGrid;