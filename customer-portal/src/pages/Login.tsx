import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CreditCard, Lock, User, Mail, Phone, MapPin, Camera, FileText, Upload, Calendar, Shield, Key, FileImage } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/common/NotificationSystem';
import { handleAuthError, handleValidationError } from '../utils/errorHandler';
import { LoginCredentials } from '../types';

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationalId: string;
  username: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  profilePhoto: File | null;
  nidFrontPhoto: File | null;
  nidBackPhoto: File | null;
  accountNumber?: string;
}

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    accountNumber: '',
    pin: ''
  });
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationalId: '',
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    profilePhoto: null,
    nidFrontPhoto: null,
    nidBackPhoto: null
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();

  // Generate unique account number in format IB-2301-100X-XXXX
  const generateAccountNumber = (): string => {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
    const randomPart1 = Math.floor(1000 + Math.random() * 9000); // 4-digit number starting from 1000
    const randomPart2 = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `IB-23${currentYear}-${randomPart1}-${randomPart2}`;
  };

  // Password strength validation
  const validatePasswordStrength = (password: string): { isValid: boolean; message: string; strength: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long', strength: 'weak' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter', strength: 'weak' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter', strength: 'weak' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number', strength: 'medium' };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)', strength: 'medium' };
    }
    return { isValid: true, message: 'Password is strong', strength: 'strong' };
  };

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
    if (!registrationData.fullName.trim()) {
      const error = handleValidationError('Full Name', 'required', 'Registration');
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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      showError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.phone.trim()) {
      const error = handleValidationError('Phone', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    // Phone validation (11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(registrationData.phone)) {
      showError('Phone number must be exactly 11 digits.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.address.trim()) {
      const error = handleValidationError('Address', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.dateOfBirth.trim()) {
      const error = handleValidationError('Date of Birth', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    // Age validation (must be at least 18 years old)
    const birthDate = new Date(registrationData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      showError('You must be at least 18 years old to register.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.nationalId.trim()) {
      const error = handleValidationError('National ID', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    // National ID validation (10 or 13 digits)
    const nidRegex = /^\d{10}$|^\d{13}$/;
    if (!nidRegex.test(registrationData.nationalId)) {
      showError('National ID must be 10 or 13 digits.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.username.trim()) {
      const error = handleValidationError('Username', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.password.trim()) {
      const error = handleValidationError('Password', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(registrationData.password);
    if (!passwordValidation.isValid) {
      showError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      const error = handleValidationError('Password confirmation', 'format', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.securityQuestion.trim()) {
      const error = handleValidationError('Security Question', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.securityAnswer.trim()) {
      const error = handleValidationError('Security Answer', 'required', 'Registration');
      showError(error);
      setIsLoading(false);
      return;
    }

    if (!registrationData.profilePhoto) {
      showError('Profile photo is required.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.nidFrontPhoto) {
      showError('NID front side photo is required.');
      setIsLoading(false);
      return;
    }

    if (!registrationData.nidBackPhoto) {
      showError('NID back side photo is required.');
      setIsLoading(false);
      return;
    }

    // Check username uniqueness (basic check against existing users)
    const existingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approvedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allUsers = [...existingUsers, ...approvedUsers];
    
    if (allUsers.some(user => user.username === registrationData.username)) {
      showError('Username already exists. Please choose a different username.');
      setIsLoading(false);
      return;
    }

    // Check email uniqueness
    if (allUsers.some(user => user.email === registrationData.email)) {
      showError('Email already exists. Please use a different email address.');
      setIsLoading(false);
      return;
    }

    // Check National ID uniqueness
    if (allUsers.some(user => user.nationalId === registrationData.nationalId)) {
      showError('National ID already registered. Please contact support if this is an error.');
      setIsLoading(false);
      return;
    }

    try {
      // Generate unique account number
      const accountNumber = generateAccountNumber();
      
      // Generate a unique user ID
      const userId = `USER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Create new user with complete information
      const newUser = {
        id: userId,
        fullName: registrationData.fullName,
        firstName: registrationData.fullName.split(' ')[0] || registrationData.fullName,
        lastName: registrationData.fullName.split(' ').slice(1).join(' ') || '',
        email: registrationData.email,
        phone: registrationData.phone,
        address: registrationData.address,
        dateOfBirth: registrationData.dateOfBirth,
        nationalId: registrationData.nationalId,
        username: registrationData.username,
        password: registrationData.password, // In real app, this would be hashed
        securityQuestion: registrationData.securityQuestion,
        securityAnswer: registrationData.securityAnswer,
        profilePhoto: registrationData.profilePhoto?.name || 'profile.jpg',
        nidFrontPhoto: registrationData.nidFrontPhoto?.name || 'nid_front.jpg',
        nidBackPhoto: registrationData.nidBackPhoto?.name || 'nid_back.jpg',
        balance: 0, // Zero initial balance
        accountNumber: accountNumber, // Generated account number
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
      existingUsers.push(newUser);
      localStorage.setItem('pendingUsers', JSON.stringify(existingUsers));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(`Registration submitted successfully! Your account number is: ${accountNumber}. Your application is now pending approval and you will be notified once your account is activated.`);
      
      // Reset form
      setRegistrationData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        nationalId: '',
        username: '',
        password: '',
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: '',
        profilePhoto: null,
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

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;
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
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={registrationData.fullName}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                  />
                </div>
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
                    placeholder="Enter 11-digit phone number"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Phone number must be exactly 11 digits
                </p>
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
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={registrationData.dateOfBirth}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You must be at least 18 years old
                </p>
              </div>

              {/* National ID */}
              <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    required
                    value={registrationData.nationalId}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your National ID number"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  National ID must be 10 or 13 digits
                </p>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={registrationData.username}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Choose a unique username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registrationData.password}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {registrationData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            validatePasswordStrength(registrationData.password).strength === 'weak' ? 'bg-red-500 w-1/3' :
                            validatePasswordStrength(registrationData.password).strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                            validatePasswordStrength(registrationData.password).strength === 'strong' ? 'bg-green-500 w-full' :
                            'bg-gray-300 w-0'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        validatePasswordStrength(registrationData.password).strength === 'weak' ? 'text-red-600' :
                        validatePasswordStrength(registrationData.password).strength === 'medium' ? 'text-yellow-600' :
                        validatePasswordStrength(registrationData.password).strength === 'strong' ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {validatePasswordStrength(registrationData.password).strength === 'weak' ? 'Weak' :
                         validatePasswordStrength(registrationData.password).strength === 'medium' ? 'Medium' :
                         validatePasswordStrength(registrationData.password).strength === 'strong' ? 'Strong' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registrationData.confirmPassword}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {registrationData.confirmPassword && registrationData.password !== registrationData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Security Question */}
              <div>
                <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                  Security Question
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="securityQuestion"
                    name="securityQuestion"
                    required
                    value={registrationData.securityQuestion}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a security question</option>
                    <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                    <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                    <option value="What city were you born in?">What city were you born in?</option>
                    <option value="What is your favorite book?">What is your favorite book?</option>
                    <option value="What was your first car?">What was your first car?</option>
                  </select>
                </div>
              </div>

              {/* Security Answer */}
              <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                  Security Answer
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    required
                    value={registrationData.securityAnswer}
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your answer"
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Camera className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="profilePhoto"
                    name="profilePhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear photo of yourself (JPG, PNG, max 5MB)
                </p>
              </div>

              {/* NID Front Photo */}
              <div>
                <label htmlFor="nidFrontPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Front Side
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileImage className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nidFrontPhoto"
                    name="nidFrontPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload front side of your National ID (JPG, PNG, max 5MB)
                </p>
              </div>

              {/* NID Back Photo */}
              <div>
                <label htmlFor="nidBackPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Back Side
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileImage className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nidBackPhoto"
                    name="nidBackPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRegistrationInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload back side of your National ID (JPG, PNG, max 5MB)
                </p>
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




