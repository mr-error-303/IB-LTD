import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CreditCard, Lock, User, Mail, Phone, MapPin, Camera, FileText, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/common/NotificationSystem';
import { handleAuthError, handleValidationError } from '../utils/errorHandler';
import { LoginCredentials } from '../types';

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  address: string;
  pin: string;
  confirmPin: string;
  photo: File | null;
  nidPassportNumber: string;
  nidFrontPhoto: File | null;
  nidBackPhoto: File | null;
}

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    accountNumber: '',
    pin: ''
  });
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    pin: '',
    confirmPin: '',
    photo: null,
    nidPassportNumber: '',
    nidFrontPhoto: null,
    nidBackPhoto: null
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!credentials.accountNumber.trim()) {
      const error = handleValidationError('Account Number', 'required', 'Login');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!credentials.pin.trim()) {
      const error = handleValidationError('PIN', 'required', 'Login');
      showError(error);
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(credentials);
      if (success) {
        showSuccess('Login successful! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        const error = handleAuthError({ status: 401 }, 'Login');
        showError(error);
      }
    } catch (err) {
      const error = handleAuthError(err, 'Login');
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!registrationData.name.trim()) {
      const error = handleValidationError('Name', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.email.trim()) {
      const error = handleValidationError('Email', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.phone.trim()) {
      const error = handleValidationError('Phone', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.pin.trim()) {
      const error = handleValidationError('PIN', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (registrationData.pin !== registrationData.confirmPin) {
      const error = handleValidationError('PIN confirmation', 'format', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (registrationData.pin.length < 4) {
      const error = handleValidationError('PIN', 'format', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    try {
      // Generate a unique user ID (not account number yet)
      const userId = `USER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Create new user with zero balance and no accounts
      const newUser = {
        id: userId,
        name: registrationData.name,
        firstName: registrationData.name.split(' ')[0] || registrationData.name,
        lastName: registrationData.name.split(' ').slice(1).join(' ') || '',
        email: registrationData.email,
        phone: registrationData.phone,
        address: registrationData.address,
        pin: registrationData.pin,
        balance: 0, // Zero initial balance
        accountNumber: null, // No account number until approved
        accounts: [], // No accounts initially
        cards: [], // No cards initially
        status: 'pending_approval', // Requires admin approval
        registrationDate: new Date().toISOString(),
        nationality: 'Bangladeshi',
        notificationPreferences: {
          smsEnabled: true,
          emailEnabled: true,
          transactionAlerts: true,
          securityAlerts: true,
          billPaymentAlerts: true,
          mobileRechargeAlerts: true
        }
      };
      
      // Store in localStorage for demo (in real app, this would be sent to backend)
      const existingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('pendingUsers', JSON.stringify(existingUsers));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(`Registration successful! Your application has been submitted for admin approval. You will be notified once your account is activated.`);
      
      // Reset form
      setRegistrationData({
        name: '',
        email: '',
        phone: '',
        address: '',
        pin: '',
        confirmPin: '',
        photo: null,
        nidPassportNumber: '',
        nidFrontPhoto: null,
        nidBackPhoto: null
      });
      
      // Switch to login after 5 seconds
      setTimeout(() => {
        setIsRegistering(false);
      }, 5000);
      
    } catch (err) {
      const error = handleAuthError(err, 'Registration');
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setRegistrationData(prev => {
      if (files && files.length > 0) {
        return {
          ...prev,
          [name]: files[0]
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            IB LTD Banking
          </h2>
          <p className="text-gray-600">
            {isRegistering ? 'Create a new account' : 'Login to your account'}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isRegistering
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isRegistering
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registration
            </button>
        </div>

        {/* Forms Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Login Form */}
          {!isRegistering && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    required
                    value={credentials.accountNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your account number"
                  />
                </div>
              </div>

              {/* PIN */}
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="pin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    required
                    value={credentials.pin}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your PIN number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Registration Form */}
          {isRegistering && (
            <form className="space-y-6" onSubmit={handleRegistrationSubmit}>
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={registrationData.name}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* User Photo */}
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Camera className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {registrationData.photo && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {registrationData.photo.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={registrationData.email}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={registrationData.phone}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* NID/Passport Number */}
              <div>
                <label htmlFor="nidPassportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  NID/Passport Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nidPassportNumber"
                    name="nidPassportNumber"
                    type="text"
                    required
                    value={registrationData.nidPassportNumber}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your NID or Passport number"
                  />
                </div>
              </div>

              {/* NID Front Photo */}
              <div>
                <label htmlFor="nidFrontPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  NID Front Side Photo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nidFrontPhoto"
                    name="nidFrontPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {registrationData.nidFrontPhoto && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {registrationData.nidFrontPhoto.name}</p>
                )}
              </div>

              {/* NID Back Photo */}
              <div>
                <label htmlFor="nidBackPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  NID Back Side Photo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nidBackPhoto"
                    name="nidBackPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {registrationData.nidBackPhoto && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {registrationData.nidBackPhoto.name}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={registrationData.address}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* PIN */}
              <div>
                <label htmlFor="regPin" className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Number (4-6 digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="regPin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    required
                    minLength={4}
                    maxLength={6}
                    value={registrationData.pin}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter 4-6 digit PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPin"
                    name="confirmPin"
                    type={showConfirmPin ? 'text' : 'password'}
                    required
                    minLength={4}
                    maxLength={6}
                    value={registrationData.confirmPin}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Re-enter your PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}


        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          © 2024 IB LTD. সকল অধিকার সংরক্ষিত।
        </div>
      </div>
    </div>
  );
};

export default Login;




