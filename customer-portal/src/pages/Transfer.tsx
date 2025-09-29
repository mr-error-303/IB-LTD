import React, { useState } from 'react';
import { 
  ArrowPathIcon, 
  BuildingLibraryIcon, 
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  QrCodeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import OwnAccountTransfer from '../components/transfers/OwnAccountTransfer';
import SameBankTransfer from '../components/transfers/SameBankTransfer';
import LocalBanksTransfer from '../components/transfers/LocalBanksTransfer';
import MobileWalletsTransfer from '../components/transfers/MobileWalletsTransfer';
import InternationalTransfer from '../components/transfers/InternationalTransfer';
import QRPayments from '../components/transfers/QRPayments';

// LocalBanksTransfer component temporarily removed
// import LocalBanksTransfer from '../components/transfers/LocalBanksTransfer';
// MobileWalletsTransfer component temporarily removed
// import MobileWalletsTransfer from '../components/transfers/MobileWalletsTransfer';
// InternationalTransfer component temporarily removed
// import InternationalTransfer from '../components/transfers/InternationalTransfer';
// QRPayments component temporarily removed
// import QRPayments from '../components/transfers/QRPayments';

const Transfer = () => {
  const [activeTab, setActiveTab] = useState('own-account');

  const transferTypes = [
    {
      id: 'own-account',
      name: 'Own Account',
      description: 'Transfer between your accounts',
      icon: ArrowPathIcon,
      component: OwnAccountTransfer,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'same-bank',
      name: 'Same Bank',
      description: 'Instant transfer to same bank users',
      icon: UserGroupIcon,
      component: SameBankTransfer,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'local-banks',
      name: 'Other Local Banks',
      description: 'Transfer to Bangladeshi banks',
      icon: BuildingLibraryIcon,
      component: LocalBanksTransfer,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'mobile-wallets',
      name: 'Mobile Wallets',
      description: 'bKash, Nagad, Rocket',
      icon: DevicePhoneMobileIcon,
      component: MobileWalletsTransfer,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'international',
      name: 'International',
      description: 'SWIFT & Wire transfers',
      icon: GlobeAltIcon,
      component: InternationalTransfer,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'qr-payments',
      name: 'QR Payments',
      description: 'Scan & Pay, Receive via QR',
      icon: QrCodeIcon,
      component: QRPayments,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const activeTransferType = transferTypes.find(type => type.id === activeTab);
  const ActiveComponent = activeTransferType?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 sm:mb-5 md:mb-6 shadow-lg shadow-blue-500/25">
            <ArrowPathIcon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Transfer Money
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Send money securely with our comprehensive transfer solutions
          </p>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 sm:mt-5 md:mt-6 rounded-full"></div>
        </div>

        {/* Transfer Methods Grid */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-2">Choose Transfer Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {transferTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeTab === type.id;
              
              return (
                <div
                  key={type.id}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                    isActive ? 'transform scale-105' : 'hover:transform hover:scale-102'
                  }`}
                  onClick={() => setActiveTab(type.id)}
                >
                  {/* Card */}
                  <div className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/20'
                      : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 group-hover:shadow-blue-500/10'
                  }`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 opacity-60"></div>
                    
                    {/* Content */}
                    <div className="relative p-3 sm:p-4 md:p-6 text-center">
                      {/* Icon Container */}
                      <div className={`relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${type.color} mb-3 sm:mb-4 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Text Content */}
                      <h3 className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 transition-colors duration-300 ${
                        isActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'
                      }`}>
                        {type.name}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 px-1 ${
                        isActive ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-700'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                    
                    {/* Active Glow Effect */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Transfer Component Container */}
        <div className="relative">
          {/* Section Divider */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="px-3 sm:px-6 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Transfer Details</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          {/* Transfer Form Container */}
          <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  {activeTransferType && <activeTransferType.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{activeTransferType?.name}</h2>
                  <p className="text-sm sm:text-base text-blue-100">{activeTransferType?.description}</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 lg:p-12">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 };

 export default Transfer;
