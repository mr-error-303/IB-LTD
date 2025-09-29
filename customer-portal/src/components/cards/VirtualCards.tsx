import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  CreditCardIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface VirtualCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  cardType: 'visa' | 'mastercard';
  status: 'active' | 'frozen' | 'expired';
  spendingLimit: number;
  currentSpent: number;
  createdDate: string;
  purpose: string;
  color: string;
}

const VirtualCards: React.FC = () => {
  const { t } = useLanguage();
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleCardDetails, setVisibleCardDetails] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string>('');

  // Form state for creating new virtual card
  const [newCard, setNewCard] = useState({
    purpose: '',
    spendingLimit: 1000,
    cardType: 'visa' as 'visa' | 'mastercard',
    color: '#3B82F6'
  });

  // Mock data for existing virtual cards
  useEffect(() => {
    const mockCards: VirtualCard[] = [
      {
        id: '1',
        cardNumber: '4532 1234 5678 9012',
        expiryDate: '12/26',
        cvv: '123',
        cardholderName: 'John Smith',
        cardType: 'visa',
        status: 'active',
        spendingLimit: 5000,
        currentSpent: 2350,
        createdDate: '2024-01-15',
        purpose: 'Online Shopping',
        color: '#3B82F6'
      },
      {
        id: '2',
        cardNumber: '5555 4444 3333 2222',
        expiryDate: '08/27',
        cvv: '456',
        cardholderName: 'John Smith',
        cardType: 'mastercard',
        status: 'active',
        spendingLimit: 10000,
        currentSpent: 7800,
        createdDate: '2024-02-10',
        purpose: 'Business Services',
        color: '#10B981'
      },
      {
        id: '3',
        cardNumber: '4532 9012 3456 7890',
        expiryDate: '03/25',
        cvv: '789',
        cardholderName: 'John Smith',
        cardType: 'visa',
        status: 'frozen',
        spendingLimit: 3000,
        currentSpent: 450,
        createdDate: '2024-01-20',
        purpose: 'Travel & Entertainment',
        color: '#F59E0B'
      }
    ];
    setVirtualCards(mockCards);
  }, []);

  const handleCreateCard = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newVirtualCard: VirtualCard = {
      id: Date.now().toString(),
      cardNumber: generateCardNumber(),
      expiryDate: generateExpiryDate(),
      cvv: generateCVV(),
      cardholderName: 'John Doe', // This would come from user context
      cardType: newCard.cardType,
      status: 'active',
      spendingLimit: newCard.spendingLimit,
      currentSpent: 0,
      createdDate: new Date().toISOString().split('T')[0],
      purpose: newCard.purpose,
      color: newCard.color
    };

    setVirtualCards(prev => [newVirtualCard, ...prev]);
    setShowCreateForm(false);
    setNewCard({
      purpose: '',
      spendingLimit: 1000,
      cardType: 'visa',
      color: '#3B82F6'
    });
    setLoading(false);
  };

  const generateCardNumber = () => {
    const prefix = newCard.cardType === 'visa' ? '4' : '5';
    let cardNumber = prefix;
    for (let i = 1; i < 16; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  const generateExpiryDate = () => {
    const currentDate = new Date();
    const expiryYear = currentDate.getFullYear() + 3;
    const expiryMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${expiryMonth}/${expiryYear.toString().slice(-2)}`;
  };

  const generateCVV = () => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  const toggleCardVisibility = (cardId: string) => {
    const newVisible = new Set(visibleCardDetails);
    if (newVisible.has(cardId)) {
      newVisible.delete(cardId);
    } else {
      newVisible.add(cardId);
    }
    setVisibleCardDetails(newVisible);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleCardStatus = (cardId: string) => {
    setVirtualCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, status: card.status === 'active' ? 'frozen' : 'active' }
        : card
    ));
  };

  const deleteCard = (cardId: string) => {
    setVirtualCards(prev => prev.filter(card => card.id !== cardId));
  };

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const getCardBrandLogo = (cardType: 'visa' | 'mastercard') => {
    return cardType === 'visa' ? '💳' : '💳';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSpendingPercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressBarClass = (percentage: number) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'frozen':
        return 'status-badge frozen';
      case 'expired':
        return 'status-badge expired';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('virtualCards') || 'Virtual Cards'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('virtualCardsSubtitle') || 'Create and manage instant digital cards for secure online transactions'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>{t('createVirtualCard') || 'Create Virtual Card'}</span>
        </button>
      </div>

      {/* Create Card Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('createNewVirtualCard') || 'Create New Virtual Card'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cardPurpose') || 'Card Purpose'}
              </label>
              <input
                type="text"
                value={newCard.purpose}
                onChange={(e) => setNewCard(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="e.g., Online Shopping, Subscriptions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('spendingLimit') || 'Spending Limit (BDT)'}
              </label>
              <input
                type="number"
                value={newCard.spendingLimit}
                onChange={(e) => setNewCard(prev => ({ ...prev, spendingLimit: Number(e.target.value) }))}
                min="100"
                max="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cardType') || 'Card Type'}
              </label>
              <select
                value={newCard.cardType}
                onChange={(e) => setNewCard(prev => ({ ...prev, cardType: e.target.value as 'visa' | 'mastercard' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cardColor') || 'Card Color'}
              </label>
              <div className="flex space-x-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCard(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCard.color === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleCreateCard}
              disabled={loading || !newCard.purpose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              <span>{loading ? (t('creating') || 'Creating...') : (t('createCard') || 'Create Card')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Virtual Cards Grid */}
      <div className="virtual-cards-grid">
        {virtualCards.map((card) => {
          const isVisible = visibleCardDetails.has(card.id);
          const spentPercentage = getSpendingPercentage(card.currentSpent, card.spendingLimit);

          return (
            <div key={card.id} className="glass-card virtual-card-container">
              {/* Card Visual */}
              <div className="virtual-card-visual" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className={getStatusColor(card.status)}>
                      {card.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="card-brand-icon">
                    <CreditCardIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="card-number text-white">
                    {isVisible ? card.cardNumber : maskCardNumber(card.cardNumber)}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="card-expiry-cvv text-white/80">
                      <div className="text-xs text-white/60 mb-1">VALID THRU</div>
                      <div>{card.expiryDate}</div>
                    </div>
                    <div className="card-expiry-cvv text-white/80">
                      <div className="text-xs text-white/60 mb-1">CVV</div>
                      <div>{isVisible ? card.cvv : '***'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Information Section */}
              <div className="card-info-section">
                <div className="card-detail-row">
                  <span className="card-detail-label">Cardholder</span>
                  <span className="card-detail-value">{card.cardholderName}</span>
                </div>
                
                <div className="card-detail-row">
                  <span className="card-detail-label">Purpose</span>
                  <span className="card-detail-value">{card.purpose}</span>
                </div>
                
                <div className="card-detail-row">
                  <span className="card-detail-label">Spending Limit</span>
                  <span className="card-detail-value font-semibold">
                    {formatCurrency(card.spendingLimit)}
                  </span>
                </div>
                
                <div className="card-detail-row">
                  <span className="card-detail-label">Current Spending</span>
                  <span className="card-detail-value font-semibold">
                    {formatCurrency(card.currentSpent)}
                  </span>
                </div>

                {/* Spending Progress */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/60">Spending Progress</span>
                    <span className="text-xs text-white/80 font-medium">
                      {spentPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="spending-progress">
                    <div 
                      className={`spending-progress-bar ${getProgressBarClass(spentPercentage)}`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="virtual-card-actions">
                <button
                  onClick={() => toggleCardVisibility(card.id)}
                  className="virtual-card-action-btn bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  {isVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  <span>{isVisible ? 'Hide' : 'Show'}</span>
                </button>
                
                <button
                  onClick={() => copyToClipboard(card.cardNumber.replace(/\s/g, ''), `card-${card.id}`)}
                  className="virtual-card-action-btn bg-green-500/20 text-green-300 hover:bg-green-500/30"
                >
                  {copiedField === `card-${card.id}` ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                  <span>{copiedField === `card-${card.id}` ? 'Copied' : 'Copy'}</span>
                </button>
                
                <button
                  onClick={() => toggleCardStatus(card.id)}
                  className={`virtual-card-action-btn ${
                    card.status === 'active' 
                      ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {card.status === 'active' ? (
                    <>
                      <LockClosedIcon className="w-4 h-4" />
                      <span>Freeze</span>
                    </>
                  ) : (
                    <>
                      <LockOpenIcon className="w-4 h-4" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {virtualCards.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noVirtualCards') || 'No Virtual Cards'}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('noVirtualCardsDesc') || 'Create your first virtual card to start making secure online transactions'}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('createFirstCard') || 'Create Your First Card'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VirtualCards;