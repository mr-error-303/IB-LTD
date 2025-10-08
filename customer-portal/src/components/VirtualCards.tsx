import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Shield, 
  Globe, 
  DollarSign, 
  Euro,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VirtualCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  currency: 'USD' | 'EUR' | 'GBP';
  spendingLimit: number;
  currentSpent: number;
  isActive: boolean;
  isOneTime: boolean;
  createdDate: string;
  lastUsed?: string;
  merchantRestrictions?: string[];
  region: string;
}

const VirtualCards: React.FC = () => {
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([
    {
      id: '1',
      cardNumber: '4532 1234 5678 9012',
      expiryDate: '12/26',
      cvv: '123',
      cardholderName: 'John Doe',
      currency: 'USD',
      spendingLimit: 1000,
      currentSpent: 245.50,
      isActive: true,
      isOneTime: false,
      createdDate: '2024-01-15',
      lastUsed: '2024-01-20',
      region: 'North America'
    },
    {
      id: '2',
      cardNumber: '5555 4444 3333 2222',
      expiryDate: '08/25',
      cvv: '456',
      cardholderName: 'John Doe',
      currency: 'EUR',
      spendingLimit: 500,
      currentSpent: 0,
      isActive: true,
      isOneTime: true,
      createdDate: '2024-01-18',
      region: 'Europe'
    }
  ]);

  const [showCardDetails, setShowCardDetails] = useState<{ [key: string]: boolean }>({});
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState({
    currency: 'USD' as 'USD' | 'EUR' | 'GBP',
    spendingLimit: 500,
    isOneTime: false,
    region: 'North America'
  });

  const toggleCardVisibility = (cardId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const generateCardNumber = () => {
    const prefix = newCardForm.currency === 'USD' ? '4532' : 
                   newCardForm.currency === 'EUR' ? '5555' : '4000';
    const randomDigits = Math.random().toString().slice(2, 14);
    return `${prefix} ${randomDigits.slice(0, 4)} ${randomDigits.slice(4, 8)} ${randomDigits.slice(8, 12)}`;
  };

  const createVirtualCard = () => {
    const newCard: VirtualCard = {
      id: Date.now().toString(),
      cardNumber: generateCardNumber(),
      expiryDate: '12/27',
      cvv: Math.floor(Math.random() * 900 + 100).toString(),
      cardholderName: 'John Doe',
      currency: newCardForm.currency,
      spendingLimit: newCardForm.spendingLimit,
      currentSpent: 0,
      isActive: true,
      isOneTime: newCardForm.isOneTime,
      createdDate: new Date().toISOString().split('T')[0],
      region: newCardForm.region
    };

    setVirtualCards(prev => [...prev, newCard]);
    setIsCreatingCard(false);
    setNewCardForm({
      currency: 'USD',
      spendingLimit: 500,
      isOneTime: false,
      region: 'North America'
    });
  };

  const deleteCard = (cardId: string) => {
    setVirtualCards(prev => prev.filter(card => card.id !== cardId));
  };

  const toggleCardStatus = (cardId: string) => {
    setVirtualCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isActive: !card.isActive } : card
    ));
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="w-4 h-4" />;
      case 'EUR': return <Euro className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getSpendingPercentage = (spent: number, limit: number) => {
    return (spent / limit) * 100;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Cards</h1>
              <p className="text-gray-600">Create and manage your virtual cards for secure online shopping</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatingCard(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Virtual Card</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{virtualCards.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cards</p>
                <p className="text-2xl font-bold text-green-600">{virtualCards.filter(card => card.isActive).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">One-Time Cards</p>
                <p className="text-2xl font-bold text-orange-600">{virtualCards.filter(card => card.isOneTime).length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${virtualCards.reduce((sum, card) => sum + card.currentSpent, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Virtual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {virtualCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Card Visual */}
              <div className={`p-6 bg-gradient-to-br ${
                card.currency === 'USD' ? 'from-blue-600 to-blue-800' :
                card.currency === 'EUR' ? 'from-purple-600 to-purple-800' :
                'from-green-600 to-green-800'
              } text-white relative`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {getCurrencyIcon(card.currency)}
                    <span className="text-sm font-medium">{card.currency}</span>
                    {card.isOneTime && (
                      <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs">One-time</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCardVisibility(card.id)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      {showCardDetails[card.id] ? 
                        <EyeOff className="w-4 h-4" /> : 
                        <Eye className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => toggleCardStatus(card.id)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      {card.isActive ? 
                        <Lock className="w-4 h-4" /> : 
                        <Unlock className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="font-mono text-lg tracking-wider">
                    {showCardDetails[card.id] ? card.cardNumber : '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-75">VALID THRU</p>
                      <p className="font-mono">
                        {showCardDetails[card.id] ? card.expiryDate : '••/••'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">CVV</p>
                      <p className="font-mono">
                        {showCardDetails[card.id] ? card.cvv : '•••'}
                      </p>
                    </div>
                  </div>
                </div>

                {!card.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Card Locked</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{card.cardholderName}</h3>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{card.region}</span>
                  </div>
                </div>

                {/* Spending Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spending Limit</span>
                    <span className="font-medium">
                      {card.currency} {card.currentSpent.toFixed(2)} / {card.spendingLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getSpendingPercentage(card.currentSpent, card.spendingLimit) > 80 ? 'bg-red-500' :
                        getSpendingPercentage(card.currentSpent, card.spendingLimit) > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getSpendingPercentage(card.currentSpent, card.spendingLimit), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(card.cardNumber)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </button>
                  <button
                    className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {card.createdDate}</span>
                    {card.lastUsed && (
                      <span>Last used: {card.lastUsed}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Card Modal */}
        {isCreatingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Virtual Card</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={newCardForm.currency}
                    onChange={(e) => setNewCardForm(prev => ({ ...prev, currency: e.target.value as 'USD' | 'EUR' | 'GBP' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    value={newCardForm.region}
                    onChange={(e) => setNewCardForm(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Global">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spending Limit ({newCardForm.currency})
                  </label>
                  <input
                    type="number"
                    value={newCardForm.spendingLimit}
                    onChange={(e) => setNewCardForm(prev => ({ ...prev, spendingLimit: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="50"
                    max="10000"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="oneTime"
                    checked={newCardForm.isOneTime}
                    onChange={(e) => setNewCardForm(prev => ({ ...prev, isOneTime: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="oneTime" className="text-sm text-gray-700">
                    One-time use card (Enhanced security)
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreatingCard(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createVirtualCard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualCards;