import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { realtimeService } from '../services/realtimeService';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User,
  CreditCard,
  DollarSign,
  Send,
  Smartphone,
  Ticket,
  Banknote,
  Receipt,
  Globe,
  MoreHorizontal,
  Building2,
  FileText,
  Zap,
  MapPin,
  Shield,
  X,
  ChevronRight,
  HandCoins,
  Eye,
  EyeOff
} from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { formatAmount } = useCurrency();
  const [balance, setBalance] = useState(user?.balance || 0); // Use user's actual balance or 0
  const [selectedCurrency] = useState('USD'); // Keep for backward compatibility
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Check if user has any accounts or cards
  const hasAccounts = user?.accounts && user.accounts.length > 0;
  const hasCards = user?.cards && user.cards.length > 0;
  const isAccountPending = user?.status === 'pending_approval';

  // Auto-hide balance after 45 seconds
  useEffect(() => {
    if (showBalance) {
      const timer = setTimeout(() => {
        setShowBalance(false);
      }, 45000); // 45 seconds

      return () => clearTimeout(timer);
    }
  }, [showBalance]);

  // Real-time event listeners
  useEffect(() => {
    if (!user?.email) return;

    // Subscribe to real-time events for this user using the correct method
    const unsubscribeUser = realtimeService.subscribeToUserUpdates(user.email, (data: any) => {
      switch (data.action) {
        case 'loan_approved':
          setNotifications(prev => [...prev, `🎉 Your loan application has been approved! Amount: ${data.data?.approvedAmount || 'N/A'}`]);
          break;
        case 'loan_rejected':
          setNotifications(prev => [...prev, `❌ Your loan application has been rejected. Reason: ${data.data?.reason || 'Not specified'}`]);
          break;
        case 'loan_disbursed':
          setNotifications(prev => [...prev, `💰 Loan disbursed! Amount: ${data.data?.disbursedAmount || 'N/A'} has been credited to your account.`]);
          if (data.data?.disbursedAmount) {
            setBalance(prev => prev + data.data.disbursedAmount);
          }
          break;
        case 'credit_score_updated':
          setNotifications(prev => [...prev, `📈 Your credit score has been updated to ${data.data?.creditScore || 'N/A'}`]);
          break;
        case 'account_status_changed':
          setNotifications(prev => [...prev, `🔄 Your account status has been updated to: ${data.data?.status || 'N/A'}`]);
          break;
        default:
          console.log('Unknown event type:', data.action, data);
      }
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [user?.email]);

  // Auto-clear notifications after 10 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const services = [
    {
      id: 'loan',
      title: 'Loan Services',
      icon: HandCoins,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subOptions: [
        'Personal Loan',
        'Business Loan',
        'Education Loan',
        'Home Loan',
        'Car Loan',
        'Emergency Loan',
        'Agricultural Loan',
        'Loan Calculator',
        'Apply for Loan',
        'Loan Status'
      ]
    },
    {
      id: 'add-money',
      title: 'Add Money',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      subOptions: [
        'Bank Transfer',
        'Debit Card',
        'Credit Card',
        'Mobile Banking',
        'ATM Deposit',
        'Cash Deposit'
      ]
    },
    {
      id: 'fund-transfer',
      title: 'Fund Transfer',
      icon: Send,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subOptions: [
        'Same Bank Transfer',
        'Other Bank Transfer',
        'International Transfer',
        'Mobile Wallet',
        'BEFTN Transfer',
        'NPSB Transfer'
      ]
    },
    {
      id: 'mobile-topup',
      title: 'Mobile Top Up',
      icon: Smartphone,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      subOptions: [
        'Prepaid Recharge',
        'Postpaid Bill',
        'Data Package',
        'International Roaming',
        'Bundle Offers'
      ]
    },
    {
      id: 'buy-ticket',
      title: 'Buy Ticket',
      icon: Ticket,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      subOptions: [
        'Bus Ticket',
        'Train Ticket',
        'Air Ticket',
        'Movie Ticket',
        'Event Ticket',
        'Ferry Ticket'
      ]
    },
    {
      id: 'cash-withdraw',
      title: 'Cash Withdraw',
      icon: Banknote,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      subOptions: [
        'ATM Withdrawal',
        'Agent Banking',
        'Branch Withdrawal',
        'Cardless Withdrawal',
        'QR Withdrawal'
      ]
    },
    {
      id: 'bill-payment',
      title: 'Bill Payment',
      icon: Receipt,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      subOptions: [
        'Electricity Bill',
        'Gas Bill',
        'Water Bill',
        'Internet Bill',
        'TV Subscription'
      ]
    },
    {
      id: 'receive-remittance',
      title: 'Receive Remittance',
      icon: Globe,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      subOptions: [
        'Bank Account',
        'Mobile Wallet',
        'Cash Pickup',
        'Card Deposit'
      ]
    },
    {
      id: 'more-services',
      title: 'More Services',
      icon: MoreHorizontal,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      subOptions: [
        'Tax Payment',
        'Government Services',
        'Donation',
        'Investment',
        'Savings Plan',
        'Fixed Deposit'
      ]
    },
    {
      id: 'bank-ac',
      title: 'Bank A/C',
      icon: Building2,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      subOptions: [
        'Account Details',
        'Statement Download',
        'Account Settings',
        'Beneficiary Management'
      ]
    },
    {
      id: 'cards',
      title: 'Cards',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subOptions: [
        'Debit Card',
        'Credit Card',
        'Prepaid Card',
        'Virtual Card',
        'Card Management',
        'Card Security'
      ]
    },
    {
      id: 'open-ac',
      title: 'Open A/C',
      icon: User,
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      subOptions: [
        'Savings Account',
        'Current Account',
        'Fixed Deposit',
        'Student Account',
        'Senior Citizen Account',
        'Joint Account'
      ]
    },
    {
      id: 'statement',
      title: 'Statement',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subOptions: [
        'Monthly Statement',
        'Transaction History',
        'Tax Certificate',
        'Balance Certificate',
        'Download PDF',
        'Email Statement'
      ]
    },
    {
      id: 'quick-pay',
      title: 'Quick Pay',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      subOptions: [
        'QR Payment',
        'NFC Payment',
        'Contactless Pay',
        'Merchant Payment',
        'P2P Payment',
        'Scan & Pay'
      ]
    },
    {
      id: 'location',
      title: 'Location',
      icon: MapPin,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      subOptions: [
        'ATM Locator',
        'Branch Locator',
        'Agent Banking',
        'Service Centers',
        'Nearest Branch',
        'Working Hours'
      ]
    },
    {
      id: 'insurance',
      title: 'Insurance',
      icon: Shield,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
      subOptions: [
        'Life Insurance',
        'Health Insurance',
        'Car Insurance',
        'Home Insurance',
        'Travel Insurance',
        'Business Insurance'
      ]
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'loan') {
      navigate('/loan-services');
    } else if (serviceId === 'add-money') {
      navigate('/add-money');
    } else if (serviceId === 'fund-transfer') {
      navigate('/fund-transfer');
    } else if (serviceId === 'mobile-topup') {
      navigate('/mobile-topup');
    } else if (serviceId === 'buy-ticket') {
      navigate('/buy-ticket');
    } else if (serviceId === 'cash-withdraw') {
      navigate('/cash-withdraw');
    } else if (serviceId === 'bill-payment') {
      navigate('/bill-payment');
    } else if (serviceId === 'receive-remittance') {
      navigate('/receive-remittance');
    } else if (serviceId === 'bank-ac') {
      navigate('/bank-account');
    } else if (serviceId === 'cards') {
      navigate('/cards');
    } else if (serviceId === 'open-ac') {
      navigate('/open-account');
    } else {
      setActiveModal(serviceId);
    }
  };

  const handleSubOptionClick = (serviceId: string, subOption: string) => {
    setActiveModal(null);
    // Navigate to specific service pages
    const route = `/${serviceId}/${subOption.toLowerCase().replace(/\s+/g, '-')}`;
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white/15 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">IB LTD</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <Settings className="h-6 w-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white mb-1">
              Hi, {user?.name || 'User'}!
            </h2>
            <p className="text-white/60 text-sm">
              Ready to bank smarter?
            </p>
          </div>
        </div>

        {/* Pending Approval Message */}
        {isAccountPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-yellow-800 font-semibold text-sm">Account Pending Approval</h3>
                <p className="text-yellow-700 text-xs mt-1">
                  Your registration has been submitted successfully. Our admin team will review and approve your account within 24-48 hours. 
                  You will receive a notification once your account is activated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Accounts/Cards Message */}
        {!isAccountPending && !hasAccounts && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-blue-800 font-semibold text-sm">Welcome to IB LTD!</h3>
                <p className="text-blue-700 text-xs mt-1">
                  You don't have any active accounts yet. Apply for a new account using our "Open A/C" service below to get started with banking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-20 right-4 z-50 space-y-2">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notification}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Improved Balance Card - Smaller and More Elegant */}
         <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                 <User className="h-5 w-5 text-white" />
               </div>
               <div>
                 <h3 className="text-gray-900 font-semibold text-sm">
                   {user?.firstName && user?.lastName 
                     ? `${user.firstName} ${user.lastName}` 
                     : user?.name || 'Account Holder'}
                 </h3>
                 <p className="text-gray-500 text-xs">
                   {user?.role === 'admin' ? 'Premium Account' : 'Savings Account'}
                 </p>
               </div>
             </div>
             <button
               onClick={() => setShowBalance(!showBalance)}
               className="p-2 hover:bg-gray-100 rounded-full transition-colors"
               title={showBalance ? "Hide Balance" : "Show Balance"}
             >
               {showBalance ? (
                 <EyeOff className="h-4 w-4 text-gray-600" />
               ) : (
                 <Eye className="h-4 w-4 text-gray-600" />
               )}
             </button>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-gray-500 text-xs mb-1">Available Balance</p>
               <p className="text-xl font-semibold text-gray-900">
                 {showBalance ? formatAmount(balance) : '••••••'}
               </p>
               <p className="text-green-600 text-xs mt-1">+2.5% this month</p>
             </div>
             <div className="text-right">
               <p className="text-gray-500 text-xs mb-1">Account Number</p>
               <p className="text-sm font-mono text-gray-700">
                 {showBalance ? (user?.accountNumber || 'Not Assigned') : '••••••••••'}
               </p>
               <p className="text-gray-400 text-xs mt-1">
                 {user?.accountNumber ? 'Active' : 'Pending'}
               </p>
             </div>
           </div>
           
           {!showBalance && (
             <div className="mt-3 text-center">
               <p className="text-gray-400 text-xs">Balance hidden for privacy</p>
             </div>
           )}
         </div>

        {/* Services Grid - Redesigned to match beautiful mobile banking app */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Banking Services</h3>
          
          {/* First Row - Primary Services with Loan First */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-6">
              <div
                onClick={() => handleServiceClick('loan')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <HandCoins className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Loan</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Services</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Apply & Track</p>
              </div>

              <div
                onClick={() => handleServiceClick('add-money')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Add</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Money</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Deposit Funds</p>
              </div>

              <div
                onClick={() => handleServiceClick('fund-transfer')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Send className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Fund</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Transfer</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Send Money</p>
              </div>

              <div
                onClick={() => handleServiceClick('mobile-topup')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Smartphone className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Mobile</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Top Up</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Recharge</p>
              </div>
            </div>
          </div>

          {/* Second Row - Secondary Services */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-6">
              <div
                onClick={() => handleServiceClick('buy-ticket')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
                data-service-id="buy-ticket"
              >
                <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Ticket className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Buy</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Ticket</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Travel & Events</p>
              </div>

              <div
                onClick={() => handleServiceClick('cash-withdraw')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Banknote className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Cash</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Withdraw</h4>
                <p className="text-gray-500 text-xs text-center mt-1">ATM & Agent</p>
              </div>

              <div
                onClick={() => handleServiceClick('bill-payment')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Receipt className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Bill</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Payment</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Utilities</p>
              </div>

              <div
                onClick={() => handleServiceClick('receive-remittance')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Globe className="h-8 w-8 text-teal-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Receive</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Remittance</h4>
                <p className="text-gray-500 text-xs text-center mt-1">International</p>
              </div>
            </div>
          </div>

          {/* Third Row - Additional Services */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-6">
              <div
                onClick={() => setActiveModal('more-services')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <MoreHorizontal className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">More</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Services</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Explore All</p>
              </div>

              <div
                onClick={() => handleServiceClick('bank-ac')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Building2 className="h-8 w-8 text-cyan-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Bank</h4>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">A/C</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Account Info</p>
              </div>

              <div
                onClick={() => handleServiceClick('cards')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Cards</h4>        
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Management</h4>
                <p className="text-gray-500 text-xs text-center mt-1">Debit & Credit</p>
              </div>

              <div
                onClick={() => handleServiceClick('open-ac')}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-full p-4 mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <User className="h-8 w-8 text-violet-600" />
                </div>
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">Open</h4>        
                <h4 className="text-gray-800 font-semibold text-sm text-center leading-tight">A/C</h4>
                <p className="text-gray-500 text-xs text-center mt-1">New Account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            <p className="text-white/60 text-center py-8">No recent activity to display</p>
          </div>
        </div>
      </main>

      {/* Service Modals */}
      {services.map((service) => (
        <ServiceModal
          key={service.id}
          isOpen={activeModal === service.id}
          onClose={() => setActiveModal(null)}
          title={service.title}
        >
          <div className="space-y-3">
            {service.subOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSubOptionClick(service.id, option)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span className="font-medium text-gray-900">{option}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        </ServiceModal>
      ))}
    </div>
  );
};

export default Dashboard;





