import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Import card management components
import VirtualCards from '../components/cards/VirtualCards';
import PhysicalCards from '../components/cards/PhysicalCards';
import CardControls from '../components/cards/CardControls';
import CardSecurity from '../components/cards/CardSecurity';
import TransactionDispute from '../components/cards/TransactionDispute';

const Cards: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('virtual');

  const cardTypes = [
    {
      id: 'virtual',
      name: 'Virtual Cards',
      nameKey: 'virtualCards',
      description: 'Create instant digital cards',
      descriptionKey: 'virtualCardsDesc',
      icon: DevicePhoneMobileIcon,
      component: VirtualCards,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'physical',
      name: 'Physical Cards',
      nameKey: 'physicalCards',
      description: 'Order and manage cards',
      descriptionKey: 'physicalCardsDesc',
      icon: CreditCardIcon,
      component: PhysicalCards,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'controls',
      name: 'Card Controls',
      nameKey: 'cardControls',
      description: 'Freeze/unfreeze, limits',
      descriptionKey: 'cardControlsDesc',
      icon: Cog6ToothIcon,
      component: CardControls,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'security',
      name: 'Card Security',
      nameKey: 'cardSecurity',
      description: 'PIN change, CVV reset',
      descriptionKey: 'cardSecurityDesc',
      icon: ShieldCheckIcon,
      component: CardSecurity,
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 'dispute',
      name: 'Transaction Dispute',
      nameKey: 'transactionDispute',
      description: 'Report unauthorized transactions',
      descriptionKey: 'transactionDisputeDesc',
      icon: ExclamationTriangleIcon,
      component: TransactionDispute,
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  const ActiveComponent = cardTypes.find(type => type.id === activeTab)?.component || VirtualCards;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('cardsManagement') || 'Cards Management'}
        </h1>
        <p className="text-gray-600">
          {t('cardsManagementSubtitle') || 'Manage your virtual and physical cards, controls, and security'}
        </p>
      </div>

      {/* Card Type Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cardTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activeTab === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${type.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${type.iconColor}`} />
                </div>
                <h3 className={`font-semibold mb-1 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {t(type.nameKey) || type.name}
                </h3>
                <p className={`text-sm ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                  {t(type.descriptionKey) || type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Component */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Cards;