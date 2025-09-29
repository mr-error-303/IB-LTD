import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  Send, 
  CreditCard,
  Receipt, 
  QrCode 
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  label: string;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      name: 'dashboard',
      path: '/dashboard',
      icon: Home,
      label: 'Home'
    },
    {
      name: 'transactions',
      path: '/transactions',
      icon: History,
      label: 'Transactions'
    },
    {
      name: 'transfer',
      path: '/transfer',
      icon: Send,
      label: 'Transfer'
    },
    {
      name: 'cards',
      path: '/cards',
      icon: CreditCard,
      label: 'Cards'
    },
    {
      name: 'qr-payment',
      path: '/qr-payment',
      icon: QrCode,
      label: 'QR পে'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                    active ? 'scale-110' : 'scale-100'
                  }`} 
                />
                <span className={`text-xs font-medium truncate ${
                  active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-800"></div>
    </div>
  );
};

export default BottomNavigation;