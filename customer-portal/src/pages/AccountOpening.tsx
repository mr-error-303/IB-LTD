import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Building2, GraduationCap, Briefcase, PiggyBank, CheckCircle, AlertCircle, FileText, CreditCard, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  minBalance: string;
  monthlyFee: string;
  benefits: string[];
  requirements: string[];
  gradient: string;
}

const AccountOpening: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    employment: {
      status: '',
      employer: '',
      income: '',
      occupation: '',
    },
    documents: {
      idType: '',
      idNumber: '',
      proofOfAddress: false,
      proofOfIncome: false,
    }
  });

  const accountTypes: AccountType[] = [
    {
      id: 'savings',
      name: 'Savings Account',
      icon: <PiggyBank className="w-8 h-8" />,
      description: 'Perfect for building your savings with competitive interest rates',
      features: ['High interest rates', 'No minimum balance', 'Free online banking', 'Mobile app access'],
      minBalance: '$0',
      monthlyFee: '$0',
      benefits: ['2.5% APY', 'No monthly fees', 'Free ATM withdrawals', '24/7 customer support'],
      requirements: ['Valid ID', 'Proof of address', 'Initial deposit of $25'],
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'current',
      name: 'Current Account',
      icon: <CreditCard className="w-8 h-8" />,
      description: 'Ideal for daily transactions and business operations',
      features: ['Unlimited transactions', 'Overdraft facility', 'Checkbook facility', 'Debit card included'],
      minBalance: '$500',
      monthlyFee: '$10',
      benefits: ['No transaction limits', 'Overdraft up to $1,000', 'Free checkbook', 'Priority customer service'],
      requirements: ['Valid ID', 'Proof of address', 'Income verification', 'Initial deposit of $500'],
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'student',
      name: 'Student Account',
      icon: <GraduationCap className="w-8 h-8" />,
      description: 'Specially designed for students with exclusive benefits',
      features: ['No monthly fees', 'Student discounts', 'Low minimum balance', 'Educational resources'],
      minBalance: '$10',
      monthlyFee: '$0',
      benefits: ['No fees until graduation', 'Student loan options', 'Financial literacy resources', 'Campus ATM access'],
      requirements: ['Valid student ID', 'Enrollment verification', 'Guardian consent (if under 18)', 'Initial deposit of $10'],
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'business',
      name: 'Business Account',
      icon: <Building2 className="w-8 h-8" />,
      description: 'Comprehensive banking solutions for your business needs',
      features: ['Business banking tools', 'Multiple user access', 'Merchant services', 'Business loans'],
      minBalance: '$1,000',
      monthlyFee: '$25',
      benefits: ['Business credit line', 'Merchant payment processing', 'Cash management tools', 'Dedicated relationship manager'],
      requirements: ['Business registration', 'Tax ID number', 'Business license', 'Initial deposit of $1,000'],
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    setCurrentStep(2);
  };

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically submit the form data to your backend
    alert('Account application submitted successfully! You will receive a confirmation email shortly.');
    navigate('/dashboard');
  };

  const renderAccountSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Account Type</h2>
        <p className="text-white/70">Select the account that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accountTypes.map((account) => (
          <div key={account.id} className="group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${account.gradient}/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl cursor-pointer"
                 onClick={() => handleAccountSelect(account.id)}>
              <div className="flex items-start space-x-4 mb-4">
                <div className={`bg-gradient-to-br ${account.gradient} p-3 rounded-xl shadow-lg`}>
                  {account.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{account.name}</h3>
                  <p className="text-white/70 text-sm">{account.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Min Balance</p>
                    <p className="text-white font-semibold">{account.minBalance}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Monthly Fee</p>
                    <p className="text-white font-semibold">{account.monthlyFee}</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/80 font-medium mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {account.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center text-white/70 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full bg-gradient-to-r ${account.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}>
                  Select This Account
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Personal Information</h2>
        <p className="text-white/70">Please provide your personal details</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 font-medium mb-2">First Name *</label>
            <input
              type="text"
              value={formData.personalInfo.firstName}
              onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.personalInfo.lastName}
              onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.personalInfo.email}
              onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-2">Date of Birth *</label>
            <input
              type="date"
              value={formData.personalInfo.dateOfBirth}
              onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-2">Nationality *</label>
            <select
              value={formData.personalInfo.nationality}
              onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select nationality</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Address Information</h2>
        <p className="text-white/70">Please provide your current address</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-white/80 font-medium mb-2">Street Address *</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address', 'street', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your street address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">City *</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your city"
              />
            </div>
            <div>
              <label className="block text-white/80 font-medium mb-2">State/Province *</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your state/province"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">ZIP/Postal Code *</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your ZIP/postal code"
              />
            </div>
            <div>
              <label className="block text-white/80 font-medium mb-2">Country *</label>
              <select
                value={formData.address.country}
                onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Document Verification</h2>
        <p className="text-white/70">Upload required documents to complete your application</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-white/80 font-medium mb-2">ID Type *</label>
            <select
              value={formData.documents.idType}
              onChange={(e) => handleInputChange('documents', 'idType', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select ID type</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="national_id">National ID Card</option>
              <option value="state_id">State ID</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2">ID Number *</label>
            <input
              type="text"
              value={formData.documents.idNumber}
              onChange={(e) => handleInputChange('documents', 'idNumber', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your ID number"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Proof of Address</p>
                  <p className="text-white/60 text-sm">Utility bill, bank statement, or lease agreement</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.documents.proofOfAddress}
                  onChange={(e) => handleInputChange('documents', 'proofOfAddress', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-white/80">Uploaded</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">Proof of Income</p>
                  <p className="text-white/60 text-sm">Pay stub, tax return, or employment letter</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.documents.proofOfIncome}
                  onChange={(e) => handleInputChange('documents', 'proofOfIncome', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-white/80">Uploaded</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Important Notice</p>
                <p className="text-yellow-300/80 text-sm mt-1">
                  All documents must be clear, legible, and valid. Processing may take 2-3 business days after submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedAccountType = accountTypes.find(acc => acc.id === selectedAccount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          {currentStep > 1 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{selectedAccountType?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Step {currentStep} of 4</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full ${
                        step <= currentStep ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 1 && renderAccountSelection()}
          {currentStep === 2 && renderPersonalInfo()}
          {currentStep === 3 && renderAddressInfo()}
          {currentStep === 4 && renderDocumentUpload()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex justify-between mt-8 max-w-6xl mx-auto">
            <button
              onClick={handlePrevStep}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
              >
                <span>Next</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Application</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOpening;