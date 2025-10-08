import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Bell,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bankingService } from '../services/bankingService';
import NotificationHistory from '../components/NotificationHistory';
import { useCurrency } from '../context/CurrencyContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { selectedCurrency, setSelectedCurrency, supportedCurrencies } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    smsTransactions: true,
    smsLogin: true,
    smsBillPayment: true,
    smsMobileRecharge: true
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPinData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveNotificationSettings = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('নোটিফিকেশন সেটিংস সফলভাবে সেভ হয়েছে!');
    } catch (err) {
      setError('নোটিফিকেশন সেটিংস সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await bankingService.updateProfile(user!.accountNumber, editData);
      
      if (result.success) {
        updateUser({ ...user!, ...editData });
        setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
        setIsEditing(false);
      } else {
        setError('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (pinData.newPin !== pinData.confirmPin) {
      setError('নতুন পিন এবং নিশ্চিতকরণ পিন মিলছে না।');
      return;
    }

    if (pinData.newPin.length !== 4) {
      setError('পিন অবশ্যই ৪ সংখ্যার হতে হবে।');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, this would call an API to change the PIN
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('পিন সফলভাবে পরিবর্তন হয়েছে!');
      setIsChangingPin(false);
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      setError('পিন পরিবর্তন করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setError('');
  };

  const cancelPinChange = () => {
    setPinData({ currentPin: '', newPin: '', confirmPin: '' });
    setIsChangingPin(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">আমার প্রোফাইল</h1>
            <p className="text-gray-500">আপনার অ্যাকাউন্টের তথ্য দেখুন এবং আপডেট করুন</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">ব্যক্তিগত তথ্য</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>সম্পাদনা</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নাম
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ইমেইল
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ফোন নম্বর
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ঠিকানা
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      value={editData.address}
                      onChange={handleEditChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                      <span>বাতিল</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">নাম</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">ইমেইল</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">ফোন নম্বর</p>
                      <p className="font-medium">{user?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">ঠিকানা</p>
                      <p className="font-medium">{user?.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details & Security */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">অ্যাকাউন্টের তথ্য</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">অ্যাকাউন্ট নম্বর</p>
                  <p className="font-medium">{user?.accountNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">অ্যাকাউন্টের ধরন</p>
                  <p className="font-medium">সঞ্চয় অ্যাকাউন্ট</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">নিরাপত্তা</h3>
            
            {!isChangingPin ? (
              <button
                onClick={() => setIsChangingPin(true)}
                className="w-full bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-md hover:bg-red-100 transition-colors"
              >
                পিন পরিবর্তন করুন
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বর্তমান পিন
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      name="currentPin"
                      value={pinData.currentPin}
                      onChange={handlePinChange}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPin ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নতুন পিন
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      name="newPin"
                      value={pinData.newPin}
                      onChange={handlePinChange}
                      maxLength={4}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPin ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নতুন পিন নিশ্চিত করুন
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      name="confirmPin"
                      value={pinData.confirmPin}
                      onChange={handlePinChange}
                      maxLength={4}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPin ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleChangePin}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'পরিবর্তন হচ্ছে...' : 'পিন পরিবর্তন'}
                  </button>
                  <button
                    onClick={cancelPinChange}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">এসএমএস নোটিফিকেশন</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">লেনদেনের এসএমএস</p>
                    <p className="text-xs text-gray-500">টাকা জমা, উত্তোলন এবং স্থানান্তরের জন্য</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsTransactions}
                    onChange={() => handleNotificationChange('smsTransactions')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">লগইন এসএমএস</p>
                    <p className="text-xs text-gray-500">সফল এবং ব্যর্থ লগইন প্রচেষ্টার জন্য</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsLogin}
                    onChange={() => handleNotificationChange('smsLogin')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">বিল পেমেন্ট এসএমএস</p>
                    <p className="text-xs text-gray-500">বিল পরিশোধের নিশ্চিতকরণের জন্য</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsBillPayment}
                    onChange={() => handleNotificationChange('smsBillPayment')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">মোবাইল রিচার্জ এসএমএস</p>
                    <p className="text-xs text-gray-500">মোবাইল রিচার্জের নিশ্চিতকরণের জন্য</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsMobileRecharge}
                    onChange={() => handleNotificationChange('smsMobileRecharge')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={saveNotificationSettings}
                  disabled={isLoading}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'সেভ হচ্ছে...' : 'নোটিফিকেশন সেটিংস সেভ করুন'}
                </button>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">মুদ্রা সেটিংস</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">পছন্দের মুদ্রা</p>
                    <p className="text-xs text-gray-500">ব্যালেন্স এবং লেনদেনের জন্য প্রদর্শিত মুদ্রা</p>
                  </div>
                </div>
                <select
                  value={selectedCurrency.code}
                  onChange={(e) => {
                    const currency = supportedCurrencies.find(c => c.code === e.target.value);
                    if (currency) setSelectedCurrency(currency);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <p>নির্বাচিত মুদ্রা: <span className="font-medium">{selectedCurrency.symbol} {selectedCurrency.code} - {selectedCurrency.name}</span></p>
                  <p className="mt-1">এই সেটিং স্বয়ংক্রিয়ভাবে সেভ হয়ে যায়।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <NotificationHistory userId={user?.id || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;




