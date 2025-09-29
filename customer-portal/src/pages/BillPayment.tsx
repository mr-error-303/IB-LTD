import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Phone, 
  CreditCard, 
  Building, 
  Receipt, 
  Flame,
  Tv,
  Music,
  FileText,
  GraduationCap,
  Calendar,
  Star,
  Clock,
  Settings
} from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { smsService } from '../services/smsService';

interface BillProvider {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
}

const BillPayment: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<BillProvider | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // 1: Select Provider, 2: Enter Details, 3: Confirm Payment

  const billProviders: BillProvider[] = [
    // Electricity Providers
    {
      id: 'desco',
      name: 'DESCO',
      category: 'electricity',
      icon: <Zap className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: '12345678' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '1000' }
      ]
    },
    {
      id: 'dpdc',
      name: 'DPDC',
      category: 'electricity',
      icon: <Zap className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: '87654321' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '1500' }
      ]
    },
    {
      id: 'bpdb',
      name: 'BPDB',
      category: 'electricity',
      icon: <Zap className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'BP123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '1200' }
      ]
    },
    // Water Providers
    {
      id: 'wasa',
      name: 'WASA',
      category: 'water',
      icon: <Droplets className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'WS123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '800' }
      ]
    },
    {
      id: 'cwasa',
      name: 'CWASA',
      category: 'water',
      icon: <Droplets className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'CW123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '600' }
      ]
    },
    // Gas Providers
    {
      id: 'titas',
      name: 'Titas Gas',
      category: 'gas',
      icon: <Flame className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'TG123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '500' }
      ]
    },
    {
      id: 'jgtdsl',
      name: 'JGTDSL',
      category: 'gas',
      icon: <Flame className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'JG123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '400' }
      ]
    },
    // Internet Providers
    {
      id: 'btcl',
      name: 'BTCL',
      category: 'internet',
      icon: <Wifi className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'BT123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '2000' }
      ]
    },
    {
      id: 'link3',
      name: 'Link3 Technologies',
      category: 'internet',
      icon: <Wifi className="w-6 h-6" />,
      fields: [
        { name: 'customerNumber', label: 'Customer Number', type: 'text', required: true, placeholder: 'L3123456' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '1500' }
      ]
    },
    // Mobile Operators
    {
      id: 'grameenphone',
      name: 'Grameenphone',
      category: 'mobile',
      icon: <Phone className="w-6 h-6" />,
      fields: [
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '100' }
      ]
    },
    {
      id: 'robi',
      name: 'Robi',
      category: 'mobile',
      icon: <Phone className="w-6 h-6" />,
      fields: [
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '200' }
      ]
    },
    {
      id: 'banglalink',
      name: 'Banglalink',
      category: 'mobile',
      icon: <Phone className="w-6 h-6" />,
      fields: [
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '150' }
      ]
    },
    {
      id: 'airtel',
      name: 'Airtel',
      category: 'mobile',
      icon: <Phone className="w-6 h-6" />,
      fields: [
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '100' }
      ]
    },
    {
      id: 'teletalk',
      name: 'Teletalk',
      category: 'mobile',
      icon: <Phone className="w-6 h-6" />,
      fields: [
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '100' }
      ]
    },
    // Subscription Services
    {
      id: 'netflix',
      name: 'Netflix',
      category: 'subscription',
      icon: <Tv className="w-6 h-6" />,
      fields: [
        { name: 'email', label: 'Account Email', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'plan', label: 'Plan Type', type: 'select', required: true, placeholder: 'Select Plan' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '800' }
      ]
    },
    {
      id: 'spotify',
      name: 'Spotify',
      category: 'subscription',
      icon: <Music className="w-6 h-6" />,
      fields: [
        { name: 'email', label: 'Account Email', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '500' }
      ]
    },
    {
      id: 'youtube-premium',
      name: 'YouTube Premium',
      category: 'subscription',
      icon: <Tv className="w-6 h-6" />,
      fields: [
        { name: 'email', label: 'Account Email', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '600' }
      ]
    },
    // Tax Payments
    {
      id: 'income-tax',
      name: 'Income Tax',
      category: 'tax',
      icon: <FileText className="w-6 h-6" />,
      fields: [
        { name: 'tinNumber', label: 'TIN Number', type: 'text', required: true, placeholder: '123456789012' },
        { name: 'taxYear', label: 'Tax Year', type: 'text', required: true, placeholder: '2023-2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '50000' }
      ]
    },
    {
      id: 'property-tax',
      name: 'Property Tax',
      category: 'tax',
      icon: <Building className="w-6 h-6" />,
      fields: [
        { name: 'holdingNumber', label: 'Holding Number', type: 'text', required: true, placeholder: 'H123456' },
        { name: 'ward', label: 'Ward Number', type: 'text', required: true, placeholder: '15' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '25000' }
      ]
    },
    {
      id: 'vat',
      name: 'VAT Payment',
      category: 'tax',
      icon: <FileText className="w-6 h-6" />,
      fields: [
        { name: 'vatNumber', label: 'VAT Registration Number', type: 'text', required: true, placeholder: 'VAT123456' },
        { name: 'period', label: 'Tax Period', type: 'text', required: true, placeholder: 'Jan 2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '15000' }
      ]
    },
    // Education Fees
    {
      id: 'dhaka-university',
      name: 'University of Dhaka',
      category: 'education',
      icon: <GraduationCap className="w-6 h-6" />,
      fields: [
        { name: 'studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'DU123456' },
        { name: 'semester', label: 'Semester', type: 'text', required: true, placeholder: 'Spring 2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '35000' }
      ]
    },
    {
      id: 'buet',
      name: 'BUET',
      category: 'education',
      icon: <GraduationCap className="w-6 h-6" />,
      fields: [
        { name: 'studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'BUET123456' },
        { name: 'level', label: 'Level/Term', type: 'text', required: true, placeholder: '3-1' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '40000' }
      ]
    },
    // Insurance Providers
    {
      id: 'sadharan-bima',
      name: 'Sadharan Bima Corporation',
      category: 'insurance',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      fields: [
        { name: 'policyNumber', label: 'Policy Number', type: 'text', required: true, placeholder: 'SBC123456' },
        { name: 'amount', label: 'Premium Amount', type: 'number', required: true, placeholder: '5000' }
      ]
    },
    {
      id: 'jiban-bima',
      name: 'Jiban Bima Corporation',
      category: 'insurance',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      fields: [
        { name: 'policyNumber', label: 'Policy Number', type: 'text', required: true, placeholder: 'JBC123456' },
        { name: 'amount', label: 'Premium Amount', type: 'number', required: true, placeholder: '8000' }
      ]
    },
    // Credit Card Bills
    {
      id: 'city-bank-card',
      name: 'City Bank Credit Card',
      category: 'credit-card',
      icon: <CreditCard className="w-6 h-6" />,
      fields: [
        { name: 'cardNumber', label: 'Card Number (Last 4 digits)', type: 'text', required: true, placeholder: '1234' },
        { name: 'amount', label: 'Payment Amount', type: 'number', required: true, placeholder: '15000' }
      ]
    },
    {
      id: 'brac-bank-card',
      name: 'BRAC Bank Credit Card',
      category: 'credit-card',
      icon: <CreditCard className="w-6 h-6" />,
      fields: [
        { name: 'cardNumber', label: 'Card Number (Last 4 digits)', type: 'text', required: true, placeholder: '5678' },
        { name: 'amount', label: 'Payment Amount', type: 'number', required: true, placeholder: '20000' }
      ]
    },
    // International Services
    {
      id: 'amazon-prime',
      name: 'Amazon Prime',
      category: 'subscription',
      icon: <Tv className="w-6 h-6" />,
      fields: [
        { name: 'email', label: 'Account Email', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '1200' }
      ]
    },
    {
      id: 'disney-plus',
      name: 'Disney+',
      category: 'subscription',
      icon: <Tv className="w-6 h-6" />,
      fields: [
        { name: 'email', label: 'Account Email', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '900' }
      ]
    },
    // Education Fees
    {
      id: 'school-fees',
      name: 'School Fees',
      category: 'education',
      icon: <GraduationCap className="w-6 h-6" />,
      fields: [
        { name: 'studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'SCH123456' },
        { name: 'class', label: 'Class', type: 'text', required: true, placeholder: 'Class 10' },
        { name: 'month', label: 'Month', type: 'text', required: true, placeholder: 'January 2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '5000' }
      ]
    }
  ];

  const categories = [
    { id: 'electricity', name: t('electricity') || 'Electricity', icon: <Zap className="w-8 h-8" /> },
    { id: 'water', name: t('water') || 'Water', icon: <Droplets className="w-8 h-8" /> },
    { id: 'gas', name: t('gas') || 'Gas', icon: <Flame className="w-8 h-8" /> },
    { id: 'internet', name: t('internet') || 'Internet', icon: <Wifi className="w-8 h-8" /> },
    { id: 'mobile', name: t('mobile') || 'Mobile Recharge', icon: <Phone className="w-8 h-8" /> },
    { id: 'subscription', name: t('subscription') || 'Subscriptions', icon: <Tv className="w-8 h-8" /> },
    { id: 'tax', name: t('tax') || 'Tax Payments', icon: <FileText className="w-8 h-8" /> },
    { id: 'education', name: t('education') || 'Education Fees', icon: <GraduationCap className="w-8 h-8" /> },
    { id: 'insurance', name: t('insurance') || 'Insurance', icon: <ShieldCheckIcon className="w-8 h-8" /> },
    { id: 'credit-card', name: t('creditCard') || 'Credit Cards', icon: <CreditCard className="w-8 h-8" /> }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProvider(null);
    setFormData({});
  };

  const handleProviderSelect = (provider: BillProvider) => {
    setSelectedProvider(provider);
    setStep(2);
    // Initialize form data
    const initialData: Record<string, string> = {};
    provider.fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleConfirmPayment = async () => {
    try {
      // Process payment here
      const transactionId = `BILL${Date.now()}`;
      
      // Send SMS notification for bill payment
      try {
        await smsService.sendBillPaymentSMS(
          '1', // Mock user ID - in real app, get from user context
          '01712345678', // Mock phone number - in real app, get from user context
          {
            billType: selectedProvider?.name || 'Unknown Provider',
            amount: parseFloat(formData.amount || '0'),
            reference: formData.customerNumber || formData.mobileNumber || 'N/A',
            date: new Date().toLocaleDateString('bn-BD')
          }
        );
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError);
      }

      alert(t('paymentSuccessful') || 'Payment successful!');
      // Reset form
      setStep(1);
      setSelectedCategory('');
      setSelectedProvider(null);
      setFormData({});
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const goBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedProvider(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('billPayment') || 'Bill Payment'}
        </h1>
        <p className="text-gray-600">
          {t('billPaymentSubtitle') || 'Pay your utility bills quickly and securely'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className="text-sm ml-2 mr-4">{t('selectProvider') || 'Select Provider'}</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-4 ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className="text-sm ml-2 mr-4">{t('enterDetails') || 'Enter Details'}</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-4 ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <div className="text-sm ml-2">{t('confirm') || 'Confirm'}</div>
          </div>
        </div>
      </div>

      {/* Step 1: Select Provider */}
      {step === 1 && (
        <div>
          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`mb-2 ${
                    selectedCategory === category.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium text-center">{category.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Providers */}
          {selectedCategory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('selectProvider') || 'Select Provider'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {billProviders
                  .filter(provider => provider.category === selectedCategory)
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center">
                        <div className="text-blue-600 mr-4">
                          {provider.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          <p className="text-sm text-gray-600">
                            {categories.find(c => c.id === provider.category)?.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Enter Details */}
      {step === 2 && selectedProvider && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={goBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                {selectedProvider.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedProvider.name}</h3>
                <p className="text-sm text-gray-600">
                  {categories.find(c => c.id === selectedProvider.category)?.name}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedProvider.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{field.placeholder}</option>
                    {field.name === 'plan' && selectedProvider?.id === 'netflix' && (
                      <>
                        <option value="basic">Basic - ৳800</option>
                        <option value="standard">Standard - ৳1200</option>
                        <option value="premium">Premium - ৳1600</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('back') || 'Back'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('continue') || 'Continue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirm Payment */}
      {step === 3 && selectedProvider && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={goBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <div className="flex items-center">
              <Receipt className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('confirmPayment') || 'Confirm Payment'}
              </h3>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('provider') || 'Provider'}:</span>
              <span className="font-medium">{selectedProvider.name}</span>
            </div>
            {selectedProvider.fields.map((field) => (
              <div key={field.name} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{field.label}:</span>
                <span className="font-medium">{formData[field.name]}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-lg font-semibold">
              <span>{t('totalAmount') || 'Total Amount'}:</span>
              <span className="text-blue-600">৳{formData.amount}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={goBack}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('back') || 'Back'}
            </button>
            <button
              onClick={handleConfirmPayment}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('payNow') || 'Pay Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPayment;




