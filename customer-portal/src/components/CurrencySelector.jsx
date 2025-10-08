import React, { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { getAllCurrencies, getCurrencyColor, getCurrencyGradient } from '../utils/currency';

const CurrencySelector = ({ selectedCurrency, onCurrencyChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAllCurrencies();
  const selected = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const handleSelect = (currency) => {
    onCurrencyChange(currency.code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card hover:glass-card-hover flex items-center space-x-3 px-4 py-3 w-full text-left focus-ring transition-all duration-300"
      >
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-2xl">{selected.flag}</span>
          <div>
            <div className={`font-semibold ${getCurrencyColor(selected.code)}`}>
              {selected.symbol} {selected.code}
            </div>
            <div className="text-sm text-white/60">{selected.name}</div>
          </div>
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 z-20 glass-card border border-white/20 rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="p-2">
              <div className="flex items-center space-x-2 px-3 py-2 mb-2">
                <GlobeAltIcon className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/80">Select Currency</span>
              </div>
              
              {currencies.map((currency, index) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white/10 group ${
                    currency.code === selectedCurrency ? 'bg-white/10' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {currency.flag}
                  </span>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${getCurrencyColor(currency.code)} group-hover:text-white transition-colors duration-200`}>
                      {currency.symbol} {currency.code}
                    </div>
                    <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                      {currency.name}
                    </div>
                  </div>
                  {currency.primary && (
                    <div className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
                      <span className="text-xs font-medium text-green-400">Primary</span>
                    </div>
                  )}
                  {currency.code === selectedCurrency && (
                    <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;