import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCardIcon,
  LockClosedIcon,
  LockOpenIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

interface Card {
  id: string;
  cardNumber: string;
  cardholderName: string;
  cardType: 'debit' | 'credit' | 'virtual';
  cardBrand: 'visa' | 'mastercard';
  status: 'active' | 'frozen' | 'blocked';
  dailyLimit: number;
  monthlyLimit: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  controls: CardControls;
}

interface CardControls {
  frozen: boolean;
  onlineTransactions: boolean;
  internationalTransactions: boolean;
  atmWithdrawals: boolean;
  contactlessPayments: boolean;
  merchantCategories: {
    groceries: boolean;
    restaurants: boolean;
    gas: boolean;
    shopping: boolean;
    entertainment: boolean;
    travel: boolean;
    healthcare: boolean;
    utilities: boolean;
  };
  locationRestrictions: {
    enabled: boolean;
    allowedCountries: string[];
  };
  timeRestrictions: {
    enabled: boolean;
    allowedHours: {
      start: string;
      end: string;
    };
  };
  velocityControls: {
    maxTransactionsPerHour: number;
    maxTransactionsPerDay: number;
  };
}

interface SpendingLimit {
  type: 'daily' | 'monthly';
  amount: number;
  category?: string;
}

const CardControls: React.FC = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'controls' | 'limits' | 'security'>('controls');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [editingLimit, setEditingLimit] = useState<SpendingLimit | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for cards
  useEffect(() => {
    const mockCards: Card[] = [
      {
        id: '1',
        cardNumber: '4532 **** **** 9012',
        cardholderName: 'John Doe',
        cardType: 'debit',
        cardBrand: 'visa',
        status: 'active',
        dailyLimit: 50000,
        monthlyLimit: 500000,
        currentDailySpent: 12500,
        currentMonthlySpent: 125000,
        controls: {
          frozen: false,
          onlineTransactions: true,
          internationalTransactions: true,
          atmWithdrawals: true,
          contactlessPayments: true,
          merchantCategories: {
            groceries: true,
            restaurants: true,
            gas: true,
            shopping: true,
            entertainment: false,
            travel: true,
            healthcare: true,
            utilities: true
          },
          locationRestrictions: {
            enabled: false,
            allowedCountries: ['BD', 'IN', 'US']
          },
          timeRestrictions: {
            enabled: false,
            allowedHours: {
              start: '06:00',
              end: '22:00'
            }
          },
          velocityControls: {
            maxTransactionsPerHour: 10,
            maxTransactionsPerDay: 50
          }
        }
      },
      {
        id: '2',
        cardNumber: '5555 **** **** 2222',
        cardholderName: 'John Doe',
        cardType: 'credit',
        cardBrand: 'mastercard',
        status: 'active',
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        currentDailySpent: 25000,
        currentMonthlySpent: 350000,
        controls: {
          frozen: false,
          onlineTransactions: true,
          internationalTransactions: true,
          atmWithdrawals: true,
          contactlessPayments: true,
          merchantCategories: {
            groceries: true,
            restaurants: true,
            gas: true,
            shopping: true,
            entertainment: true,
            travel: true,
            healthcare: true,
            utilities: true
          },
          locationRestrictions: {
            enabled: true,
            allowedCountries: ['BD', 'IN', 'US', 'UK', 'CA']
          },
          timeRestrictions: {
            enabled: false,
            allowedHours: {
              start: '00:00',
              end: '23:59'
            }
          },
          velocityControls: {
            maxTransactionsPerHour: 15,
            maxTransactionsPerDay: 100
          }
        }
      }
    ];
    setCards(mockCards);
    setSelectedCard(mockCards[0]?.id || '');
  }, []);

  const selectedCardData = cards.find(card => card.id === selectedCard);

  const toggleCardFreeze = async (cardId: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            status: card.status === 'frozen' ? 'active' : 'frozen',
            controls: { ...card.controls, frozen: !card.controls.frozen }
          }
        : card
    ));
    setLoading(false);
  };

  const updateCardControl = async (cardId: string, controlType: string, value: boolean) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            controls: { 
              ...card.controls, 
              [controlType]: value 
            }
          }
        : card
    ));
    setLoading(false);
  };

  const updateMerchantCategory = async (cardId: string, category: string, enabled: boolean) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            controls: { 
              ...card.controls, 
              merchantCategories: {
                ...card.controls.merchantCategories,
                [category]: enabled
              }
            }
          }
        : card
    ));
    setLoading(false);
  };

  const updateSpendingLimit = async (cardId: string, limitType: 'daily' | 'monthly', amount: number) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            [limitType === 'daily' ? 'dailyLimit' : 'monthlyLimit']: amount
          }
        : card
    ));
    setLoading(false);
    setShowLimitModal(false);
    setEditingLimit(null);
  };

  const merchantCategories = [
    { id: 'groceries', name: 'Groceries', icon: ShoppingCartIcon },
    { id: 'restaurants', name: 'Restaurants', icon: BuildingStorefrontIcon },
    { id: 'gas', name: 'Gas Stations', icon: TruckIcon },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCartIcon },
    { id: 'entertainment', name: 'Entertainment', icon: DevicePhoneMobileIcon },
    { id: 'travel', name: 'Travel', icon: GlobeAltIcon },
    { id: 'healthcare', name: 'Healthcare', icon: BuildingStorefrontIcon },
    { id: 'utilities', name: 'Utilities', icon: BanknotesIcon }
  ];

  const getSpendingPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getSpendingColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!selectedCardData) {
    return (
      <div className="p-6 text-center">
        <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('noCardsAvailable') || 'No Cards Available'}
        </h3>
        <p className="text-gray-600">
          {t('noCardsDesc') || 'You need to have cards to manage controls'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('cardControls') || 'Card Controls'}
        </h2>
        <p className="text-gray-600 mt-1">
          {t('cardControlsSubtitle') || 'Manage your card security and spending controls'}
        </p>
      </div>

      {/* Card Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('selectCard') || 'Select Card'}
        </label>
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.cardNumber} - {card.cardType.toUpperCase()} {card.cardBrand.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Card Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CreditCardIcon className="w-12 h-12 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCardData.cardNumber}
              </h3>
              <p className="text-gray-600 capitalize">
                {selectedCardData.cardType} {selectedCardData.cardBrand}
              </p>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                selectedCardData.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : selectedCardData.status === 'frozen'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedCardData.status === 'frozen' && <LockClosedIcon className="w-3 h-3 mr-1" />}
                {selectedCardData.status === 'active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                {selectedCardData.status === 'blocked' && <NoSymbolIcon className="w-3 h-3 mr-1" />}
                {selectedCardData.status.toUpperCase()}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => toggleCardFreeze(selectedCardData.id)}
            disabled={loading || selectedCardData.status === 'blocked'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCardData.status === 'frozen'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {selectedCardData.status === 'frozen' ? (
              <>
                <LockOpenIcon className="w-4 h-4" />
                <span>{t('unfreezeCard') || 'Unfreeze Card'}</span>
              </>
            ) : (
              <>
                <LockClosedIcon className="w-4 h-4" />
                <span>{t('freezeCard') || 'Freeze Card'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'controls', name: 'Transaction Controls', icon: Cog6ToothIcon },
            { id: 'limits', name: 'Spending Limits', icon: CurrencyDollarIcon },
            { id: 'security', name: 'Security Settings', icon: LockClosedIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Transaction Controls Tab */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          {/* Basic Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('basicControls') || 'Basic Controls'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  key: 'onlineTransactions', 
                  label: 'Online Transactions', 
                  description: 'Allow online and e-commerce purchases',
                  icon: ComputerDesktopIcon
                },
                { 
                  key: 'internationalTransactions', 
                  label: 'International Transactions', 
                  description: 'Allow transactions outside Bangladesh',
                  icon: GlobeAltIcon
                },
                { 
                  key: 'atmWithdrawals', 
                  label: 'ATM Withdrawals', 
                  description: 'Allow cash withdrawals from ATMs',
                  icon: BanknotesIcon
                },
                { 
                  key: 'contactlessPayments', 
                  label: 'Contactless Payments', 
                  description: 'Allow tap-to-pay transactions',
                  icon: WifiIcon
                }
              ].map((control) => (
                <div key={control.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <control.icon className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{control.label}</h4>
                      <p className="text-sm text-gray-600">{control.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCardData.controls[control.key as keyof typeof selectedCardData.controls] as boolean}
                      onChange={(e) => updateCardControl(selectedCardData.id, control.key, e.target.checked)}
                      className="sr-only peer"
                      disabled={loading || selectedCardData.status === 'frozen'}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant Categories */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('merchantCategories') || 'Merchant Categories'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('merchantCategoriesDesc') || 'Control which types of merchants can charge your card'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {merchantCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCardData.controls.merchantCategories[category.id as keyof typeof selectedCardData.controls.merchantCategories]}
                      onChange={(e) => updateMerchantCategory(selectedCardData.id, category.id, e.target.checked)}
                      className="sr-only peer"
                      disabled={loading || selectedCardData.status === 'frozen'}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spending Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          {/* Current Spending */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('currentSpending') || 'Current Spending'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Spending */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('dailySpending') || 'Daily Spending'}</span>
                  <span className="text-sm text-gray-900">
                    ৳{selectedCardData.currentDailySpent.toLocaleString()} / ৳{selectedCardData.dailyLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getSpendingColor(getSpendingPercentage(selectedCardData.currentDailySpent, selectedCardData.dailyLimit))}`}
                    style={{ width: `${getSpendingPercentage(selectedCardData.currentDailySpent, selectedCardData.dailyLimit)}%` }}
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingLimit({ type: 'daily', amount: selectedCardData.dailyLimit });
                    setShowLimitModal(true);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('editLimit') || 'Edit Limit'}
                </button>
              </div>

              {/* Monthly Spending */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('monthlySpending') || 'Monthly Spending'}</span>
                  <span className="text-sm text-gray-900">
                    ৳{selectedCardData.currentMonthlySpent.toLocaleString()} / ৳{selectedCardData.monthlyLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getSpendingColor(getSpendingPercentage(selectedCardData.currentMonthlySpent, selectedCardData.monthlyLimit))}`}
                    style={{ width: `${getSpendingPercentage(selectedCardData.currentMonthlySpent, selectedCardData.monthlyLimit)}%` }}
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingLimit({ type: 'monthly', amount: selectedCardData.monthlyLimit });
                    setShowLimitModal(true);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('editLimit') || 'Edit Limit'}
                </button>
              </div>
            </div>
          </div>

          {/* Velocity Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('velocityControls') || 'Velocity Controls'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('velocityControlsDesc') || 'Limit the number of transactions within specific time periods'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{t('hourlyLimit') || 'Hourly Limit'}</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedCardData.controls.velocityControls.maxTransactionsPerHour}
                </p>
                <p className="text-sm text-gray-600">{t('transactionsPerHour') || 'transactions per hour'}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{t('dailyTransactionLimit') || 'Daily Transaction Limit'}</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedCardData.controls.velocityControls.maxTransactionsPerDay}
                </p>
                <p className="text-sm text-gray-600">{t('transactionsPerDay') || 'transactions per day'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Location Restrictions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('locationRestrictions') || 'Location Restrictions'}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{t('enableLocationRestrictions') || 'Enable Location Restrictions'}</h4>
                <p className="text-sm text-gray-600">{t('locationRestrictionsDesc') || 'Only allow transactions from specific countries'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCardData.controls.locationRestrictions.enabled}
                  onChange={(e) => updateCardControl(selectedCardData.id, 'locationRestrictions', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading || selectedCardData.status === 'frozen'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {selectedCardData.controls.locationRestrictions.enabled && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-2">{t('allowedCountries') || 'Allowed Countries'}</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCardData.controls.locationRestrictions.allowedCountries.map((country) => (
                    <span key={country} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time Restrictions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('timeRestrictions') || 'Time Restrictions'}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{t('enableTimeRestrictions') || 'Enable Time Restrictions'}</h4>
                <p className="text-sm text-gray-600">{t('timeRestrictionsDesc') || 'Only allow transactions during specific hours'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCardData.controls.timeRestrictions.enabled}
                  onChange={(e) => updateCardControl(selectedCardData.id, 'timeRestrictions', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading || selectedCardData.status === 'frozen'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {selectedCardData.controls.timeRestrictions.enabled && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('startTime') || 'Start Time'}</label>
                    <input
                      type="time"
                      value={selectedCardData.controls.timeRestrictions.allowedHours.start}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('endTime') || 'End Time'}</label>
                    <input
                      type="time"
                      value={selectedCardData.controls.timeRestrictions.allowedHours.end}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spending Limit Modal */}
      {showLimitModal && editingLimit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('editSpendingLimit') || 'Edit Spending Limit'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingLimit.type === 'daily' ? (t('dailyLimit') || 'Daily Limit') : (t('monthlyLimit') || 'Monthly Limit')} (৳)
              </label>
              <input
                type="number"
                value={editingLimit.amount}
                onChange={(e) => setEditingLimit(prev => prev ? { ...prev, amount: parseInt(e.target.value) || 0 } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setEditingLimit(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => updateSpendingLimit(selectedCardData.id, editingLimit.type, editingLimit.amount)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (t('updating') || 'Updating...') : (t('updateLimit') || 'Update Limit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardControls;