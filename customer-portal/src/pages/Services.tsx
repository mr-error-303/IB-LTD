import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  Smartphone, 
  Ticket, 
  Banknote, 
  Globe, 
  Calculator, 
  ArrowRightLeft, 
  Shield, 
  TrendingUp, 
  PiggyBank, 
  FileCheck,
  Landmark,
  CreditCard,
  Building,
  Wallet,
  Phone,
  Zap,
  Car,
  Home,
  GraduationCap,
  Heart,
  Plane
} from 'lucide-react';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: Landmark },
    { id: 'banking', name: 'Banking', icon: Building },
    { id: 'payments', name: 'Payments', icon: Wallet },
    { id: 'loans', name: 'Loans & Credit', icon: FileText },
    { id: 'investments', name: 'Investments', icon: TrendingUp },
    { id: 'utilities', name: 'Utilities', icon: Zap },
    { id: 'lifestyle', name: 'Lifestyle', icon: Heart }
  ];

  const allServices = [
    // Banking Services
    {
      id: 'loan-application',
      name: 'Loan Application',
      description: 'Apply for personal, home, or business loans',
      icon: FileText,
      gradient: 'from-emerald-500 to-green-600',
      category: 'loans',
      action: () => navigate('/loan')
    },
    {
      id: 'loan-management',
      name: 'Loan Management',
      description: 'Manage existing loans and payments',
      icon: Calculator,
      gradient: 'from-indigo-500 to-indigo-600',
      category: 'loans',
      action: () => navigate('/loan-management')
    },
    {
      id: 'multi-currency',
      name: 'Multi-Currency Accounts',
      description: 'International banking services',
      icon: Globe,
      gradient: 'from-teal-500 to-teal-600',
      category: 'banking',
      action: () => navigate('/multi-currency')
    },
    {
      id: 'global-transfers',
      name: 'Global Transfers',
      description: 'International money transfers',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-blue-600',
      category: 'banking',
      action: () => navigate('/global-transfers')
    },
    {
      id: 'cash-withdraw',
      name: 'Cash Withdraw',
      description: 'ATM withdrawal and cash services',
      icon: Banknote,
      gradient: 'from-emerald-500 to-teal-600',
      category: 'banking',
      action: () => navigate('/cash-withdraw')
    },
    {
      id: 'fund-transfer',
      name: 'Fund Transfer',
      description: 'Transfer money to any account',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-purple-600',
      category: 'banking',
      action: () => navigate('/fund-transfer')
    },
    
    // Payment Services
    {
      id: 'mobile-topup',
      name: 'Mobile Top Up',
      description: 'Recharge mobile phones instantly',
      icon: Smartphone,
      gradient: 'from-pink-500 to-rose-600',
      category: 'payments',
      action: () => navigate('/mobile-topup')
    },
    {
      id: 'bill-payment',
      name: 'Bill Payment',
      description: 'Pay utility bills and services',
      icon: FileCheck,
      gradient: 'from-orange-500 to-red-600',
      category: 'payments',
      action: () => navigate('/bill-payment')
    },
    {
      id: 'tax-payment',
      name: 'Tax Payment',
      description: 'Pay income and VAT taxes',
      icon: FileCheck,
      gradient: 'from-red-500 to-red-600',
      category: 'payments',
      action: () => navigate('/tax-payment')
    },
    {
      id: 'receive-remittance',
      name: 'Receive Remittance',
      description: 'Receive money from abroad',
      icon: Globe,
      gradient: 'from-violet-500 to-purple-600',
      category: 'banking',
      action: () => navigate('/receive-remittance')
    },

    // Investment Services
    {
      id: 'investment',
      name: 'Investment',
      description: 'Mutual funds and stock trading',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      category: 'investments',
      action: () => navigate('/investment')
    },
    {
      id: 'fixed-deposit',
      name: 'Fixed Deposit',
      description: 'High interest savings accounts',
      icon: PiggyBank,
      gradient: 'from-orange-500 to-orange-600',
      category: 'investments',
      action: () => navigate('/fixed-deposit')
    },
    {
      id: 'insurance',
      name: 'Insurance',
      description: 'Life and health insurance plans',
      icon: Shield,
      gradient: 'from-green-500 to-green-600',
      category: 'investments',
      action: () => navigate('/insurance')
    },

    // Lifestyle Services
    {
      id: 'buy-ticket',
      name: 'Buy Ticket',
      description: 'Book travel and event tickets',
      icon: Ticket,
      gradient: 'from-indigo-500 to-purple-600',
      category: 'lifestyle',
      action: () => navigate('/buy-ticket')
    },
    {
      id: 'travel-booking',
      name: 'Travel Booking',
      description: 'Book flights, hotels, and packages',
      icon: Plane,
      gradient: 'from-sky-500 to-blue-600',
      category: 'lifestyle',
      action: () => navigate('/travel')
    },
    {
      id: 'car-loan',
      name: 'Car Loan',
      description: 'Finance your dream car',
      icon: Car,
      gradient: 'from-gray-500 to-gray-600',
      category: 'loans',
      action: () => navigate('/car-loan')
    },
    {
      id: 'home-loan',
      name: 'Home Loan',
      description: 'Mortgage and home financing',
      icon: Home,
      gradient: 'from-amber-500 to-orange-600',
      category: 'loans',
      action: () => navigate('/home-loan')
    },
    {
      id: 'education-loan',
      name: 'Education Loan',
      description: 'Finance your education goals',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-indigo-600',
      category: 'loans',
      action: () => navigate('/education-loan')
    }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? allServices 
    : allServices.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Banking Services</h1>
                <p className="text-white/70 text-sm">Complete range of banking and financial services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient}/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
                <button
                  onClick={service.action}
                  className="relative block w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl text-left"
                >
                  <div className="mb-4">
                    <div className={`bg-gradient-to-br ${service.gradient} p-3 rounded-2xl inline-flex group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{service.description}</p>
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">24/7 Banking</h3>
                <p className="text-white/70 text-sm">Round-the-clock service availability</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Secure Transactions</h3>
                <p className="text-white/70 text-sm">Bank-grade security for all services</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Customer Support</h3>
                <p className="text-white/70 text-sm">Dedicated support team ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;