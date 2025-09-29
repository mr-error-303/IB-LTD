import React from 'react';

const FinanceCard = ({ 
  title, 
  amount, 
  currency, 
  trend, 
  bgColor, 
  textColor, 
  icon 
}) => {
  return (
    <div className={`glass-card glass-card-hover ${bgColor} group transition-all duration-300 hover:scale-105`}>
      {/* Header with Icon and Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-white/80 group-hover:text-white transition-colors">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            <span className="text-emerald-400 text-sm">
              {trend === 'up' ? '↗' : '↘'}
            </span>
          </div>
        )}
      </div>

      {/* Main Amount Display */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-2">
          <span className={`text-4xl font-black ${textColor} group-hover:scale-110 transition-transform duration-300`}>
            {amount}
          </span>
          <span className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">
            {currency}
          </span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-end">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default FinanceCard;