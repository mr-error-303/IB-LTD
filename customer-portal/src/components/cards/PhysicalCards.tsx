import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  PlusIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface PhysicalCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  cardType: 'debit' | 'credit';
  cardBrand: 'visa' | 'mastercard';
  status: 'active' | 'blocked' | 'expired' | 'pending_delivery' | 'ordered';
  expiryDate: string;
  issueDate: string;
  deliveryStatus?: 'ordered' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  cardDesign: string;
  annualFee: number;
  creditLimit?: number;
  availableCredit?: number;
}

interface CardOrder {
  cardType: 'debit' | 'credit';
  cardBrand: 'visa' | 'mastercard';
  cardDesign: string;
  deliveryAddress: string;
  phoneNumber: string;
  reason: 'new' | 'replacement' | 'upgrade';
  urgentDelivery: boolean;
}

const PhysicalCards: React.FC = () => {
  const { t } = useLanguage();
  const [physicalCards, setPhysicalCards] = useState<PhysicalCard[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderStep, setOrderStep] = useState(1);

  // Form state for ordering new card
  const [cardOrder, setCardOrder] = useState<CardOrder>({
    cardType: 'debit',
    cardBrand: 'visa',
    cardDesign: 'classic',
    deliveryAddress: '',
    phoneNumber: '',
    reason: 'new',
    urgentDelivery: false
  });

  // Mock data for existing physical cards
  useEffect(() => {
    const mockCards: PhysicalCard[] = [
      {
        id: '1',
        cardNumber: '4532 **** **** 9012',
        cardholderName: 'John Doe',
        cardType: 'debit',
        cardBrand: 'visa',
        status: 'active',
        expiryDate: '12/26',
        issueDate: '2023-01-15',
        cardDesign: 'classic',
        annualFee: 0
      },
      {
        id: '2',
        cardNumber: '5555 **** **** 2222',
        cardholderName: 'John Doe',
        cardType: 'credit',
        cardBrand: 'mastercard',
        status: 'active',
        expiryDate: '08/27',
        issueDate: '2023-08-10',
        cardDesign: 'premium',
        annualFee: 2500,
        creditLimit: 100000,
        availableCredit: 85000
      },
      {
        id: '3',
        cardNumber: '4111 **** **** 1111',
        cardholderName: 'John Doe',
        cardType: 'debit',
        cardBrand: 'visa',
        status: 'pending_delivery',
        expiryDate: '06/28',
        issueDate: '2024-01-20',
        deliveryStatus: 'shipped',
        trackingNumber: 'BD123456789',
        deliveryAddress: '123 Main St, Dhaka 1000',
        estimatedDelivery: '2024-01-25',
        cardDesign: 'gold',
        annualFee: 1000
      }
    ];
    setPhysicalCards(mockCards);
  }, []);

  const handleOrderCard = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCard: PhysicalCard = {
      id: Date.now().toString(),
      cardNumber: '#### #### #### ####',
      cardholderName: 'John Doe',
      cardType: cardOrder.cardType,
      cardBrand: cardOrder.cardBrand,
      status: 'ordered',
      expiryDate: generateExpiryDate(),
      issueDate: new Date().toISOString().split('T')[0],
      deliveryStatus: 'ordered',
      deliveryAddress: cardOrder.deliveryAddress,
      estimatedDelivery: generateEstimatedDelivery(cardOrder.urgentDelivery),
      cardDesign: cardOrder.cardDesign,
      annualFee: getAnnualFee(cardOrder.cardType, cardOrder.cardDesign),
      ...(cardOrder.cardType === 'credit' && {
        creditLimit: getCreditLimit(cardOrder.cardDesign),
        availableCredit: getCreditLimit(cardOrder.cardDesign)
      })
    };

    setPhysicalCards(prev => [newCard, ...prev]);
    setShowOrderForm(false);
    setOrderStep(1);
    setCardOrder({
      cardType: 'debit',
      cardBrand: 'visa',
      cardDesign: 'classic',
      deliveryAddress: '',
      phoneNumber: '',
      reason: 'new',
      urgentDelivery: false
    });
    setLoading(false);
  };

  const generateExpiryDate = () => {
    const currentDate = new Date();
    const expiryYear = currentDate.getFullYear() + 4;
    const expiryMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${expiryMonth}/${expiryYear.toString().slice(-2)}`;
  };

  const generateEstimatedDelivery = (urgent: boolean) => {
    const currentDate = new Date();
    const deliveryDays = urgent ? 2 : 7;
    currentDate.setDate(currentDate.getDate() + deliveryDays);
    return currentDate.toISOString().split('T')[0];
  };

  const getAnnualFee = (cardType: string, design: string) => {
    if (cardType === 'debit') {
      return design === 'classic' ? 0 : design === 'gold' ? 1000 : 2500;
    }
    return design === 'classic' ? 1500 : design === 'gold' ? 3000 : 5000;
  };

  const getCreditLimit = (design: string) => {
    return design === 'classic' ? 50000 : design === 'gold' ? 100000 : 200000;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'pending_delivery': return 'text-blue-600 bg-blue-100';
      case 'ordered': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case 'ordered': return 'text-orange-600 bg-orange-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const cardDesigns = [
    { id: 'classic', name: 'Classic', description: 'Standard design', fee: 0 },
    { id: 'gold', name: 'Gold', description: 'Premium design with benefits', fee: 1000 },
    { id: 'platinum', name: 'Platinum', description: 'Luxury design with exclusive benefits', fee: 2500 }
  ];

  const blockCard = (cardId: string) => {
    setPhysicalCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, status: card.status === 'active' ? 'blocked' : 'active' }
        : card
    ));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('physicalCards') || 'Physical Cards'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('physicalCardsSubtitle') || 'Order and manage your physical debit and credit cards'}
          </p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>{t('orderNewCard') || 'Order New Card'}</span>
        </button>
      </div>

      {/* Order Card Form */}
      {showOrderForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('orderNewCard') || 'Order New Card'}
          </h3>

          {/* Step Indicator */}
          <div className="flex items-center mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  orderStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    orderStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Card Type & Brand */}
          {orderStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('cardType') || 'Card Type'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'debit', name: 'Debit Card', description: 'Use your own money' },
                    { id: 'credit', name: 'Credit Card', description: 'Borrow money with credit limit' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCardOrder(prev => ({ ...prev, cardType: type.id as 'debit' | 'credit' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        cardOrder.cardType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('cardBrand') || 'Card Brand'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'visa', name: 'Visa', description: 'Accepted worldwide' },
                    { id: 'mastercard', name: 'Mastercard', description: 'Global acceptance' }
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setCardOrder(prev => ({ ...prev, cardBrand: brand.id as 'visa' | 'mastercard' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        cardOrder.cardBrand === brand.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{brand.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('orderReason') || 'Order Reason'}
                </label>
                <select
                  value={cardOrder.reason}
                  onChange={(e) => setCardOrder(prev => ({ ...prev, reason: e.target.value as 'new' | 'replacement' | 'upgrade' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New Card</option>
                  <option value="replacement">Replacement (Lost/Stolen)</option>
                  <option value="upgrade">Upgrade Existing Card</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Card Design */}
          {orderStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('cardDesign') || 'Card Design'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cardDesigns.map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setCardOrder(prev => ({ ...prev, cardDesign: design.id }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        cardOrder.cardDesign === design.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{design.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{design.description}</p>
                      <p className="text-sm font-medium text-blue-600 mt-2">
                        {design.fee === 0 ? 'Free' : `৳${design.fee}/year`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgentDelivery"
                  checked={cardOrder.urgentDelivery}
                  onChange={(e) => setCardOrder(prev => ({ ...prev, urgentDelivery: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="urgentDelivery" className="ml-2 block text-sm text-gray-900">
                  {t('urgentDelivery') || 'Urgent Delivery (2-3 days) - Additional ৳500'}
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Delivery Information */}
          {orderStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryAddress') || 'Delivery Address'}
                </label>
                <textarea
                  value={cardOrder.deliveryAddress}
                  onChange={(e) => setCardOrder(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  rows={3}
                  placeholder="Enter your complete delivery address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phoneNumber') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={cardOrder.phoneNumber}
                  onChange={(e) => setCardOrder(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">{t('orderSummary') || 'Order Summary'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('cardType') || 'Card Type'}:</span>
                    <span className="capitalize">{cardOrder.cardType} {cardOrder.cardBrand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('design') || 'Design'}:</span>
                    <span className="capitalize">{cardOrder.cardDesign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('annualFee') || 'Annual Fee'}:</span>
                    <span>৳{getAnnualFee(cardOrder.cardType, cardOrder.cardDesign)}</span>
                  </div>
                  {cardOrder.urgentDelivery && (
                    <div className="flex justify-between">
                      <span>{t('urgentDeliveryFee') || 'Urgent Delivery Fee'}:</span>
                      <span>৳500</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('total') || 'Total'}:</span>
                    <span>৳{getAnnualFee(cardOrder.cardType, cardOrder.cardDesign) + (cardOrder.urgentDelivery ? 500 : 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          <div className="flex justify-between mt-6">
            <div>
              {orderStep > 1 && (
                <button
                  onClick={() => setOrderStep(prev => prev - 1)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  {t('previous') || 'Previous'}
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              
              {orderStep < 3 ? (
                <button
                  onClick={() => setOrderStep(prev => prev + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {t('next') || 'Next'}
                </button>
              ) : (
                <button
                  onClick={handleOrderCard}
                  disabled={loading || !cardOrder.deliveryAddress || !cardOrder.phoneNumber}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  <span>{loading ? (t('ordering') || 'Ordering...') : (t('placeOrder') || 'Place Order')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Physical Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {physicalCards.map((card) => (
          <div key={card.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {card.cardType} {card.cardBrand}
                  </h3>
                  <p className="text-sm text-gray-600">{card.cardNumber}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                {card.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('cardholderName') || 'Cardholder'}</span>
                  <p className="font-medium">{card.cardholderName}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('expiryDate') || 'Expires'}</span>
                  <p className="font-medium">{card.expiryDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('design') || 'Design'}</span>
                  <p className="font-medium capitalize">{card.cardDesign}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('annualFee') || 'Annual Fee'}</span>
                  <p className="font-medium">৳{card.annualFee}</p>
                </div>
              </div>

              {/* Credit Card Specific Info */}
              {card.cardType === 'credit' && card.creditLimit && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('creditLimit') || 'Credit Limit'}</span>
                    <span className="text-sm text-gray-900">
                      ৳{card.availableCredit?.toLocaleString()} / ৳{card.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((card.availableCredit || 0) / card.creditLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Delivery Status */}
              {card.deliveryStatus && card.status === 'pending_delivery' && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">{t('deliveryStatus') || 'Delivery Status'}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(card.deliveryStatus)}`}>
                      {card.deliveryStatus.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  {card.trackingNumber && (
                    <div className="text-sm text-blue-800 mb-1">
                      <span className="font-medium">{t('trackingNumber') || 'Tracking'}:</span> {card.trackingNumber}
                    </div>
                  )}
                  
                  {card.estimatedDelivery && (
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">{t('estimatedDelivery') || 'Estimated Delivery'}:</span> {card.estimatedDelivery}
                    </div>
                  )}
                </div>
              )}

              {/* Card Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {card.status === 'active' && (
                  <button
                    onClick={() => blockCard(card.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{t('blockCard') || 'Block Card'}</span>
                  </button>
                )}

                {card.status === 'blocked' && (
                  <button
                    onClick={() => blockCard(card.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{t('unblockCard') || 'Unblock Card'}</span>
                  </button>
                )}

                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>{t('replaceCard') || 'Replace Card'}</span>
                </button>

                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>{t('cardDetails') || 'View Details'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {physicalCards.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noPhysicalCards') || 'No Physical Cards'}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('noPhysicalCardsDesc') || 'Order your first physical card to start making transactions'}
          </p>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('orderFirstCard') || 'Order Your First Card'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhysicalCards;