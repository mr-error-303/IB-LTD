import React from 'react';
import FinanceCard from './FinanceCard';
import { Shield, TrendingUp, Bitcoin, Smartphone, BarChart3, DollarSign } from 'lucide-react';

const StatsGrid = ({ selectedCurrency = 'BDT', balance = 125000 }) => {
  const stats = [
    {
      title: 'Total Balance',
      amount: '125,000',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-emerald',
      textColor: 'text-emerald-400',
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: 'Monthly Growth',
      amount: '8,250',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-blue',
      textColor: 'text-blue-400',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Savings Account',
      amount: '95,000',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-orange',
      textColor: 'text-orange-400',
      icon: <Bitcoin className="w-6 h-6" />
    },
    {
      title: 'Current Account',
      amount: '30,000',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-purple',
      textColor: 'text-purple-400',
      icon: <Smartphone className="w-6 h-6" />
    },
    {
      title: 'Fixed Deposits',
      amount: '50,000',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-pink',
      textColor: 'text-pink-400',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: 'Available Credit',
      amount: '25,000',
      currency: '৳',
      trend: 'up',
      bgColor: 'percentage-indigo',
      textColor: 'text-indigo-400',
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  return (
    <div className="dashboard-grid">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="stagger-animation animate-fade-in-up"
          style={{ '--stagger-index': index, '--stagger-delay': '0.1s' }}
        >
          <FinanceCard
            title={stat.title}
            amount={stat.amount}
            currency={stat.currency}
            trend={stat.trend}
            bgColor={stat.bgColor}
            textColor={stat.textColor}
            icon={stat.icon}
          />
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;