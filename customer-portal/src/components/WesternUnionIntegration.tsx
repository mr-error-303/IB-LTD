import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Banknote, 
  FileText, 
  Calendar, 
  User, 
  Shield,
  Network,
  Lock,
  DollarSign,
  Calculator,
  Smartphone,
  QrCode,
  Link,
  Star,
  TrendingUp,
  Users,
  CreditCard,
  Percent,
  Timer,
  Target,
  Award,
  Briefcase,
  PiggyBank,
  Navigation,
  Globe,
  Wallet,
  Receipt,
  UserCheck,
  IdCard,
  Fingerprint
} from 'lucide-react';

interface WesternUnionAgent {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  hours: string;
  services: string[];
  distance: number;
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface WesternUnionTransfer {
  id: string;
  mtcn: string; // Money Transfer Control Number
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  recipientCountry: string;
  amount: number;
  currency: string;
  fees: number;
  exchangeRate?: number;
  totalCost: number;
  status: 'pending' | 'ready_for_pickup' | 'picked_up' | 'cancelled' | 'expired';
  created: string;
  expiryDate: string;
  pickupLocation?: string;
  pickedUpAt?: string;
  purpose: string;
  testQuestion?: string;
  testAnswer?: string;
}

interface WesternUnionRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fee: number;
  feePercentage: number;
  deliveryMethod: 'cash_pickup' | 'bank_account' | 'mobile_wallet';
  lastUpdated: string;
}

interface WesternUnionRecipient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  idType: string;
  idNumber: string;
  relationship: string;
  verified: boolean;
}

const WesternUnionIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'track' | 'agents' | 'recipients' | 'rates' | 'history' | 'settings'>('send');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [recipientCountry, setRecipientCountry] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'cash_pickup' | 'bank_account' | 'mobile_wallet'>('cash_pickup');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  // Western Union Agents
  const [agents] = useState<WesternUnionAgent[]>([
    {
      id: 'wu_agent_001',
      name: 'Western Union - Main Street Pharmacy',
      address: '123 Main Street',
      city: 'New York',
      country: 'United States',
      phone: '+1-555-0123',
      hours: 'Mon-Fri: 9AM-7PM, Sat: 9AM-5PM',
      services: ['Cash Pickup', 'Money Orders', 'Bill Pay'],
      distance: 0.5,
      rating: 4.8,
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'wu_agent_002',
      name: 'Western Union - Downtown Market',
      address: '456 Broadway Ave',
      city: 'New York',
      country: 'United States',
      phone: '+1-555-0456',
      hours: 'Daily: 8AM-10PM',
      services: ['Cash Pickup', 'Money Orders'],
      distance: 1.2,
      rating: 4.6,
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 'wu_agent_003',
      name: 'Western Union - City Center Mall',
      address: '789 Shopping Center Dr',
      city: 'New York',
      country: 'United States',
      phone: '+1-555-0789',
      hours: 'Mon-Sat: 10AM-9PM, Sun: 12PM-6PM',
      services: ['Cash Pickup', 'Money Orders', 'Bill Pay', 'Prepaid Cards'],
      distance: 2.1,
      rating: 4.7,
      coordinates: { lat: 40.7505, lng: -73.9934 }
    }
  ]);

  // Exchange Rates
  const [exchangeRates] = useState<WesternUnionRate[]>([
    { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.8456, fee: 12.00, feePercentage: 1.5, deliveryMethod: 'cash_pickup', lastUpdated: '2024-01-13T10:30:00Z' },
    { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.7823, fee: 15.00, feePercentage: 1.8, deliveryMethod: 'cash_pickup', lastUpdated: '2024-01-13T10:30:00Z' },
    { fromCurrency: 'USD', toCurrency: 'MXN', rate: 17.25, fee: 8.00, feePercentage: 1.2, deliveryMethod: 'cash_pickup', lastUpdated: '2024-01-13T10:30:00Z' },
    { fromCurrency: 'USD', toCurrency: 'INR', rate: 83.15, fee: 10.00, feePercentage: 1.0, deliveryMethod: 'cash_pickup', lastUpdated: '2024-01-13T10:30:00Z' },
    { fromCurrency: 'USD', toCurrency: 'PHP', rate: 55.80, fee: 9.00, feePercentage: 1.1, deliveryMethod: 'cash_pickup', lastUpdated: '2024-01-13T10:30:00Z' }
  ]);

  // Recipients
  const [recipients] = useState<WesternUnionRecipient[]>([
    {
      id: 'wu_rec_001',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      phone: '+52-555-123-4567',
      country: 'Mexico',
      city: 'Mexico City',
      idType: 'National ID',
      idNumber: 'MEX123456789',
      relationship: 'Family',
      verified: true
    },
    {
      id: 'wu_rec_002',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+44-20-7946-0958',
      country: 'United Kingdom',
      city: 'London',
      idType: 'Passport',
      idNumber: 'UK987654321',
      relationship: 'Business Partner',
      verified: true
    },
    {
      id: 'wu_rec_003',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-98765-43210',
      country: 'India',
      city: 'Mumbai',
      idType: 'Aadhaar',
      idNumber: 'IN123456789012',
      relationship: 'Friend',
      verified: false
    }
  ]);

  // Transfer History
  const [transferHistory] = useState<WesternUnionTransfer[]>([
    {
      id: 'wu_001',
      mtcn: '1234567890',
      senderName: 'Your Business Account',
      recipientName: 'Maria Rodriguez',
      recipientPhone: '+52-555-123-4567',
      recipientCountry: 'Mexico',
      amount: 500,
      currency: 'USD',
      fees: 15.00,
      exchangeRate: 17.25,
      totalCost: 515.00,
      status: 'picked_up',
      created: '2024-01-10T09:00:00Z',
      expiryDate: '2024-02-09T09:00:00Z',
      pickupLocation: 'Western Union - Centro Comercial',
      pickedUpAt: '2024-01-10T14:30:00Z',
      purpose: 'Family support'
    },
    {
      id: 'wu_002',
      mtcn: '2345678901',
      senderName: 'Your Business Account',
      recipientName: 'John Smith',
      recipientPhone: '+44-20-7946-0958',
      recipientCountry: 'United Kingdom',
      amount: 1000,
      currency: 'USD',
      fees: 25.00,
      exchangeRate: 0.7823,
      totalCost: 1025.00,
      status: 'ready_for_pickup',
      created: '2024-01-11T11:30:00Z',
      expiryDate: '2024-02-10T11:30:00Z',
      purpose: 'Business payment'
    },
    {
      id: 'wu_003',
      mtcn: '3456789012',
      senderName: 'Your Business Account',
      recipientName: 'Priya Sharma',
      recipientPhone: '+91-98765-43210',
      recipientCountry: 'India',
      amount: 750,
      currency: 'USD',
      fees: 18.00,
      exchangeRate: 83.15,
      totalCost: 768.00,
      status: 'pending',
      created: '2024-01-12T16:45:00Z',
      expiryDate: '2024-02-11T16:45:00Z',
      purpose: 'Personal gift'
    }
  ]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up': return 'text-green-600 bg-green-100';
      case 'ready_for_pickup': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate Western Union fees
  const calculateWUFees = (amount: number, currency: string): { fee: number; rate: number; received: number; total: number } => {
    const rateInfo = exchangeRates.find(r => r.fromCurrency === 'USD' && r.toCurrency === currency);
    if (!rateInfo) return { fee: 0, rate: 1, received: amount, total: amount };
    
    const fee = (amount * rateInfo.feePercentage / 100) + rateInfo.fee;
    const received = amount * rateInfo.rate;
    const total = amount + fee;
    
    return { fee, rate: rateInfo.rate, received, total };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Western Union Integration</h1>
              <p className="text-gray-600">Send money worldwide for cash pickup at agent locations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Connection Status</div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Quick Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Western Union Network Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-yellow-900">Western Union Global Network</h3>
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
            Worldwide Coverage
          </span>
        </div>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">200+</div>
            <div className="text-sm text-yellow-700">Countries & Territories</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">550K+</div>
            <div className="text-sm text-yellow-700">Agent Locations</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">130+</div>
            <div className="text-sm text-yellow-700">Currencies</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">150+</div>
            <div className="text-sm text-yellow-700">Years of Service</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send Money', icon: MapPin },
              { id: 'track', label: 'Track Transfer', icon: Search },
              { id: 'agents', label: 'Find Agents', icon: Building2 },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'rates', label: 'Exchange Rates', icon: TrendingUp },
              { id: 'history', label: 'Transfer History', icon: FileText },
              { id: 'settings', label: 'Settings', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Send Money */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Send Money with Western Union</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Recipient Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recipient Details</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            placeholder="First name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            placeholder="Last name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1-555-123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select 
                          value={recipientCountry}
                          onChange={(e) => setRecipientCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="">Select country</option>
                          <option value="Mexico">Mexico</option>
                          <option value="India">India</option>
                          <option value="Philippines">Philippines</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Germany">Germany</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Send Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select 
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="MXN">MXN - Mexican Peso</option>
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="PHP">PHP - Philippine Peso</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'cash_pickup', label: 'Cash Pickup', icon: MapPin, desc: 'At agent location' },
                          { id: 'bank_account', label: 'Bank Account', icon: Building2, desc: 'Direct deposit' },
                          { id: 'mobile_wallet', label: 'Mobile Wallet', icon: Smartphone, desc: 'Digital wallet' }
                        ].map(({ id, label, icon: Icon, desc }) => (
                          <button
                            key={id}
                            onClick={() => setDeliveryMethod(id as any)}
                            className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                              deliveryMethod === id
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            <div>{label}</div>
                            <div className="text-xs text-gray-500">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Transfer</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        <option value="family">Family support</option>
                        <option value="education">Education expenses</option>
                        <option value="medical">Medical expenses</option>
                        <option value="business">Business payment</option>
                        <option value="gift">Personal gift</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Question (Optional)</label>
                      <input
                        type="text"
                        placeholder="Security question for recipient"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Exchange Rate Info */}
                  {selectedCurrency !== 'USD' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="font-medium text-yellow-900 mb-4">Exchange Rate & Fees</h4>
                      {(() => {
                        const rate = exchangeRates.find(r => r.fromCurrency === 'USD' && r.toCurrency === selectedCurrency);
                        return rate ? (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Exchange Rate:</span>
                              <span className="font-medium text-yellow-900">1 USD = {rate.rate} {selectedCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Transfer Fee:</span>
                              <span className="font-medium text-yellow-900">{rate.feePercentage}% + ${rate.fee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Last Updated:</span>
                              <span className="font-medium text-yellow-900">
                                {new Date(rate.lastUpdated).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-yellow-700">Exchange rate not available</div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Transfer Summary */}
                  {transferAmount && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Transfer Summary</h4>
                      {(() => {
                        const { fee, rate, received, total } = calculateWUFees(parseFloat(transferAmount), selectedCurrency);
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Send Amount:</span>
                              <span className="font-medium text-gray-900">USD {parseFloat(transferAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Transfer Fee:</span>
                              <span className="font-medium text-gray-900">USD {fee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="font-medium text-gray-900">Total Cost:</span>
                              <span className="font-bold text-gray-900">USD {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Recipient Gets:</span>
                              <span className="font-bold text-yellow-600">{selectedCurrency} {received.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Delivery Time:</span>
                              <span className="font-medium text-gray-900">Minutes</span>
                            </div>
                          </div>
                        );
                      })()}
                      <button className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors mt-4 font-medium">
                        Send Money
                      </button>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Security & Compliance</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      Western Union complies with global anti-money laundering regulations. 
                      Valid ID is required for pickup. Transfers are monitored for security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track Transfer */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Track Your Transfer</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Enter Tracking Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MTCN (Money Transfer Control Number)
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter 10-digit MTCN"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sender's Last Name</label>
                        <input
                          type="text"
                          placeholder="Last name of sender"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <button className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                        Track Transfer
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-yellow-800">
                      <Info className="w-4 h-4" />
                      <span className="font-medium">Tracking Information</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      The MTCN is provided when you send money. It's a 10-digit number that 
                      uniquely identifies your transfer. Keep it safe and share only with the recipient.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Transfers</h4>
                    <div className="space-y-3">
                      {transferHistory.slice(0, 3).map((transfer) => (
                        <div key={transfer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{transfer.recipientName}</div>
                            <div className="text-sm text-gray-500">MTCN: {transfer.mtcn}</div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transfer.status)}`}>
                              {transfer.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Find Agents */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Find Western Union Agents</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search by city or address"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.address}</div>
                          <div className="text-sm text-gray-500">{agent.city}, {agent.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{agent.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">{agent.distance} miles</div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <div className="font-medium">{agent.phone}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <div className="font-medium">{agent.hours}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Services:</span>
                        <div className="font-medium">{agent.services.join(', ')}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700 transition-colors">
                        Get Directions
                      </button>
                      <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-50 transition-colors">
                        Call Agent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipients */}
          {activeTab === 'recipients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Saved Recipients</h3>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Add Recipient
                </button>
              </div>

              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{recipient.firstName} {recipient.lastName}</div>
                          <div className="text-sm text-gray-500">{recipient.city}, {recipient.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {recipient.verified ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <div className="font-medium">{recipient.phone}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">ID Type:</span>
                        <div className="font-medium">{recipient.idType}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Relationship:</span>
                        <div className="font-medium">{recipient.relationship}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700 transition-colors">
                        Send Money
                      </button>
                      <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-50 transition-colors">
                        Edit Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exchange Rates */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Western Union Exchange Rates</h3>
                <div className="text-sm text-gray-500">
                  Updated: {new Date().toLocaleString()}
                </div>
              </div>

              <div className="grid gap-4">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {rate.fromCurrency} to {rate.toCurrency}
                          </div>
                          <div className="text-sm text-gray-500">
                            1 {rate.fromCurrency} = {rate.rate} {rate.toCurrency}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{rate.rate}</div>
                        <div className="text-sm text-gray-500">
                          Fee: {rate.feePercentage}% + ${rate.fee}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-yellow-800">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Rate Information</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  Western Union exchange rates include a margin above the mid-market rate. 
                  Rates and fees may vary by destination, delivery method, and payment type.
                </p>
              </div>
            </div>
          )}

          {/* Transfer History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Transfer History</h3>
                <button className="text-yellow-600 hover:text-yellow-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipientName}</div>
                          <div className="text-sm text-gray-500">{transfer.recipientCountry}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">{transfer.currency} {transfer.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">MTCN:</span>
                        <div className="font-medium font-mono">{transfer.mtcn}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>
                        <div className="font-medium">{transfer.purpose}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="font-medium">{new Date(transfer.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-gray-500">Fee:</span>
                          <span className="font-medium ml-1">${transfer.fees}</span>
                        </div>
                        {transfer.exchangeRate && (
                          <div>
                            <span className="text-gray-500">Rate:</span>
                            <span className="font-medium ml-1">{transfer.exchangeRate}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {transfer.status === 'picked_up' && transfer.pickedUpAt ? 
                          `Picked up: ${new Date(transfer.pickedUpAt).toLocaleString()}` :
                          `Expires: ${new Date(transfer.expiryDate).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Western Union Integration Settings</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Connection</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Western Union Account</div>
                          <div className="text-sm text-gray-500">Business Integration</div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Connected
                        </span>
                      </div>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Disconnect Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Default Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Delivery Method</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                          <option value="cash_pickup">Cash Pickup</option>
                          <option value="bank_account">Bank Account</option>
                          <option value="mobile_wallet">Mobile Wallet</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      {[
                        'Email notifications for transfers',
                        'SMS alerts for pickup confirmations',
                        'Rate change notifications',
                        'Transfer status updates'
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked={index < 3}
                            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                          />
                          <label className="text-sm text-gray-700">{setting}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-yellow-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Western Union Security</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      Western Union uses advanced security measures including identity verification, 
                      fraud monitoring, and compliance with international regulations to protect your transfers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WesternUnionIntegration;