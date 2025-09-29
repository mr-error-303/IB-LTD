import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCardIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
  ClockIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Card {
  id: string;
  cardNumber: string;
  cardholderName: string;
  cardType: 'debit' | 'credit' | 'virtual';
  cardBrand: 'visa' | 'mastercard';
  status: 'active' | 'frozen' | 'blocked' | 'pending_activation';
  lastPinChange?: string;
  lastCvvReset?: string;
  securityFeatures: {
    pinSet: boolean;
    biometricEnabled: boolean;
    smsAlerts: boolean;
    emailAlerts: boolean;
    transactionNotifications: boolean;
    twoFactorAuth: boolean;
  };
}

interface SecurityAction {
  type: 'pin_change' | 'cvv_reset' | 'activate_card' | 'enable_biometric' | 'update_alerts';
  cardId: string;
  data?: any;
}

const CardSecurity: React.FC = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Form states
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  const [activationForm, setActivationForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    otp: ''
  });

  const [alertSettings, setAlertSettings] = useState({
    smsAlerts: false,
    emailAlerts: false,
    transactionNotifications: false,
    phoneNumber: '',
    email: ''
  });

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
        lastPinChange: '2024-01-15',
        lastCvvReset: '2023-12-10',
        securityFeatures: {
          pinSet: true,
          biometricEnabled: true,
          smsAlerts: true,
          emailAlerts: true,
          transactionNotifications: true,
          twoFactorAuth: false
        }
      },
      {
        id: '2',
        cardNumber: '5555 **** **** 2222',
        cardholderName: 'John Doe',
        cardType: 'credit',
        cardBrand: 'mastercard',
        status: 'active',
        lastPinChange: '2023-11-20',
        securityFeatures: {
          pinSet: true,
          biometricEnabled: false,
          smsAlerts: true,
          emailAlerts: false,
          transactionNotifications: true,
          twoFactorAuth: true
        }
      },
      {
        id: '3',
        cardNumber: '4111 **** **** 1111',
        cardholderName: 'John Doe',
        cardType: 'virtual',
        cardBrand: 'visa',
        status: 'pending_activation',
        securityFeatures: {
          pinSet: false,
          biometricEnabled: false,
          smsAlerts: false,
          emailAlerts: false,
          transactionNotifications: false,
          twoFactorAuth: false
        }
      }
    ];
    setCards(mockCards);
    setSelectedCard(mockCards[0]?.id || '');
  }, []);

  const selectedCardData = cards.find(card => card.id === selectedCard);

  const handlePinChange = async () => {
    if (pinForm.newPin !== pinForm.confirmPin) {
      alert('New PIN and confirmation do not match');
      return;
    }

    if (pinForm.newPin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCards(prev => prev.map(card => 
      card.id === selectedCard 
        ? { 
            ...card, 
            lastPinChange: new Date().toISOString().split('T')[0],
            securityFeatures: { ...card.securityFeatures, pinSet: true }
          }
        : card
    ));
    
    setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
    setActiveModal(null);
    setLoading(false);
  };

  const handleCvvReset = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCards(prev => prev.map(card => 
      card.id === selectedCard 
        ? { 
            ...card, 
            lastCvvReset: new Date().toISOString().split('T')[0]
          }
        : card
    ));
    
    setActiveModal(null);
    setLoading(false);
  };

  const handleCardActivation = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCards(prev => prev.map(card => 
      card.id === selectedCard 
        ? { 
            ...card, 
            status: 'active',
            securityFeatures: { ...card.securityFeatures, pinSet: true }
          }
        : card
    ));
    
    setActivationForm({ cardNumber: '', expiryDate: '', cvv: '', otp: '' });
    setActiveModal(null);
    setLoading(false);
  };

  const toggleSecurityFeature = async (feature: keyof Card['securityFeatures']) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCards(prev => prev.map(card => 
      card.id === selectedCard 
        ? { 
            ...card, 
            securityFeatures: {
              ...card.securityFeatures,
              [feature]: !card.securityFeatures[feature]
            }
          }
        : card
    ));
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'frozen': return 'text-blue-600 bg-blue-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'pending_activation': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysSince = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!selectedCardData) {
    return (
      <div className="p-6 text-center">
        <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('noCardsAvailable') || 'No Cards Available'}
        </h3>
        <p className="text-gray-600">
          {t('noCardsDesc') || 'You need to have cards to manage security settings'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('cardSecurity') || 'Card Security'}
        </h2>
        <p className="text-gray-600 mt-1">
          {t('cardSecuritySubtitle') || 'Manage your card security settings and authentication'}
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
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedCardData.status)}`}>
                {selectedCardData.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
          
          {selectedCardData.status === 'pending_activation' && (
            <button
              onClick={() => setActiveModal('activate')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('activateCard') || 'Activate Card'}
            </button>
          )}
        </div>
      </div>

      {/* Security Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* PIN Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <KeyIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('pinManagement') || 'PIN Management'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedCardData.securityFeatures.pinSet 
                  ? `Last changed: ${formatDate(selectedCardData.lastPinChange)}`
                  : 'PIN not set'
                }
              </p>
            </div>
          </div>
          
          {selectedCardData.lastPinChange && getDaysSince(selectedCardData.lastPinChange)! > 90 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  {t('pinChangeRecommended') || 'Consider changing your PIN for better security'}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setActiveModal('pin')}
            disabled={selectedCardData.status !== 'active'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCardData.securityFeatures.pinSet 
              ? (t('changePin') || 'Change PIN')
              : (t('setPin') || 'Set PIN')
            }
          </button>
        </div>

        {/* CVV Reset */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('cvvReset') || 'CVV Reset'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedCardData.lastCvvReset 
                  ? `Last reset: ${formatDate(selectedCardData.lastCvvReset)}`
                  : 'Never reset'
                }
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {t('cvvResetDesc') || 'Generate a new CVV for enhanced security'}
          </p>
          
          <button
            onClick={() => setActiveModal('cvv')}
            disabled={selectedCardData.status !== 'active'}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('resetCvv') || 'Reset CVV'}
          </button>
        </div>

        {/* Biometric Authentication */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FingerPrintIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('biometricAuth') || 'Biometric Authentication'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedCardData.securityFeatures.biometricEnabled 
                  ? 'Enabled' 
                  : 'Disabled'
                }
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {t('biometricDesc') || 'Use fingerprint or face recognition for transactions'}
          </p>
          
          <button
            onClick={() => toggleSecurityFeature('biometricEnabled')}
            disabled={loading || selectedCardData.status !== 'active'}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedCardData.securityFeatures.biometricEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {selectedCardData.securityFeatures.biometricEnabled 
              ? (t('disableBiometric') || 'Disable Biometric')
              : (t('enableBiometric') || 'Enable Biometric')
            }
          </button>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('securityFeatures') || 'Security Features'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'smsAlerts',
              label: 'SMS Alerts',
              description: 'Receive SMS notifications for transactions',
              icon: PhoneIcon
            },
            {
              key: 'emailAlerts',
              label: 'Email Alerts',
              description: 'Receive email notifications for transactions',
              icon: EnvelopeIcon
            },
            {
              key: 'transactionNotifications',
              label: 'Transaction Notifications',
              description: 'Real-time push notifications for all transactions',
              icon: BellIcon
            },
            {
              key: 'twoFactorAuth',
              label: 'Two-Factor Authentication',
              description: 'Additional security layer for online transactions',
              icon: LockClosedIcon
            }
          ].map((feature) => (
            <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{feature.label}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCardData.securityFeatures[feature.key as keyof typeof selectedCardData.securityFeatures] as boolean}
                  onChange={() => toggleSecurityFeature(feature.key as keyof Card['securityFeatures'])}
                  className="sr-only peer"
                  disabled={loading || selectedCardData.status !== 'active'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Change Modal */}
      {activeModal === 'pin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCardData.securityFeatures.pinSet 
                ? (t('changePin') || 'Change PIN')
                : (t('setPin') || 'Set PIN')
              }
            </h3>
            
            <div className="space-y-4">
              {selectedCardData.securityFeatures.pinSet && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('currentPin') || 'Current PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pinForm.currentPin}
                      onChange={(e) => setPinForm(prev => ({ ...prev, currentPin: e.target.value }))}
                      maxLength={4}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPin ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPin') || 'New PIN'}
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm(prev => ({ ...prev, newPin: e.target.value }))}
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new 4-digit PIN"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('confirmPin') || 'Confirm PIN'}
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new PIN"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handlePinChange}
                disabled={loading || !pinForm.newPin || !pinForm.confirmPin || (selectedCardData.securityFeatures.pinSet && !pinForm.currentPin)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                <span>{loading ? (t('updating') || 'Updating...') : (t('updatePin') || 'Update PIN')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CVV Reset Modal */}
      {activeModal === 'cvv' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('resetCvv') || 'Reset CVV'}
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    {t('cvvResetWarning') || 'Important Security Notice'}
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('cvvResetWarningDesc') || 'Resetting your CVV will generate a new 3-digit security code. You will need to update any saved payment methods.'}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              {t('cvvResetConfirm') || 'Are you sure you want to reset your CVV? This action cannot be undone.'}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleCvvReset}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                <span>{loading ? (t('resetting') || 'Resetting...') : (t('resetCvv') || 'Reset CVV')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Activation Modal */}
      {activeModal === 'activate' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('activateCard') || 'Activate Card'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cardNumber') || 'Card Number'}
                </label>
                <input
                  type="text"
                  value={activationForm.cardNumber}
                  onChange={(e) => setActivationForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="Enter full card number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('expiryDate') || 'Expiry Date'}
                  </label>
                  <input
                    type="text"
                    value={activationForm.expiryDate}
                    onChange={(e) => setActivationForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cvv') || 'CVV'}
                  </label>
                  <input
                    type="text"
                    value={activationForm.cvv}
                    onChange={(e) => setActivationForm(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('otp') || 'OTP'}
                </label>
                <input
                  type="text"
                  value={activationForm.otp}
                  onChange={(e) => setActivationForm(prev => ({ ...prev, otp: e.target.value }))}
                  placeholder="Enter OTP sent to your phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                  {t('resendOtp') || 'Resend OTP'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setActivationForm({ cardNumber: '', expiryDate: '', cvv: '', otp: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleCardActivation}
                disabled={loading || !activationForm.cardNumber || !activationForm.expiryDate || !activationForm.cvv || !activationForm.otp}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                <span>{loading ? (t('activating') || 'Activating...') : (t('activateCard') || 'Activate Card')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSecurity;