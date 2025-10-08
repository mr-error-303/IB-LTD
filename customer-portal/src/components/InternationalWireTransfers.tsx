import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Globe, 
  MapPin, 
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
  CreditCard,
  Network,
  Lock,
  DollarSign,
  Calculator,
  Shield,
  Route,
  Landmark,
  TrendingUp
} from 'lucide-react';

interface WireRoute {
  id: string;
  routeName: string;
  correspondent: string;
  intermediary?: string;
  processingTime: string;
  fee: number;
  currency: string;
  reliability: number;
  countries: string[];
  restrictions?: string[];
}

interface WireTransfer {
  id: string;
  recipientName: string;
  recipientBank: string;
  routingNumber: string;
  amount: number;
  currency: string;
  purpose: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' | 'returned';
  reference: string;
  date: string;
  estimatedArrival: string;
  fees: number;
  route: string;
  trackingSteps: WireTrackingStep[];
}

interface WireTrackingStep {
  id: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  location?: string;
}

interface FeeStructure {
  domestic: number;
  international: number;
  expedited: number;
  correspondent: number;
  intermediary: number;
  currency: string;
}

const InternationalWireTransfers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'routes' | 'calculator' | 'history' | 'tracking'>('send');
  const [selectedRoute, setSelectedRoute] = useState<WireRoute | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isExpedited, setIsExpedited] = useState(false);

  // Wire Routes Database
  const [wireRoutes, setWireRoutes] = useState<WireRoute[]>([
    {
      id: 'fedwire-us',
      routeName: 'Fedwire (US Domestic)',
      correspondent: 'Federal Reserve Bank',
      processingTime: 'Same day',
      fee: 25,
      currency: 'USD',
      reliability: 99.9,
      countries: ['United States'],
      restrictions: ['US domestic only']
    },
    {
      id: 'chips-us',
      routeName: 'CHIPS (Clearing House)',
      correspondent: 'The Clearing House',
      processingTime: 'Same day',
      fee: 30,
      currency: 'USD',
      reliability: 99.8,
      countries: ['United States', 'International'],
      restrictions: ['High value transfers']
    },
    {
      id: 'correspondent-eu',
      routeName: 'European Correspondent Network',
      correspondent: 'Deutsche Bank AG',
      intermediary: 'BNP Paribas',
      processingTime: '1-2 business days',
      fee: 45,
      currency: 'EUR',
      reliability: 98.5,
      countries: ['Germany', 'France', 'Netherlands', 'Belgium', 'Austria'],
      restrictions: ['EU compliance required']
    },
    {
      id: 'correspondent-uk',
      routeName: 'UK Sterling Network',
      correspondent: 'HSBC Bank PLC',
      processingTime: '1-3 business days',
      fee: 35,
      currency: 'GBP',
      reliability: 98.8,
      countries: ['United Kingdom', 'Ireland'],
      restrictions: ['FCA regulated entities only']
    },
    {
      id: 'correspondent-asia',
      routeName: 'Asia-Pacific Corridor',
      correspondent: 'Mizuho Bank Ltd.',
      intermediary: 'DBS Bank Ltd.',
      processingTime: '2-4 business days',
      fee: 50,
      currency: 'USD',
      reliability: 97.2,
      countries: ['Japan', 'Singapore', 'Hong Kong', 'Australia'],
      restrictions: ['AML enhanced due diligence']
    },
    {
      id: 'correspondent-latam',
      routeName: 'Latin America Network',
      correspondent: 'Banco Santander',
      intermediary: 'JPMorgan Chase',
      processingTime: '3-5 business days',
      fee: 60,
      currency: 'USD',
      reliability: 95.8,
      countries: ['Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia'],
      restrictions: ['Central bank reporting required']
    }
  ]);

  // Fee Structure
  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    domestic: 25,
    international: 45,
    expedited: 75,
    correspondent: 15,
    intermediary: 20,
    currency: 'USD'
  });

  // Transfer History
  const [transferHistory, setTransferHistory] = useState<WireTransfer[]>([
    {
      id: 'WT001',
      recipientName: 'Global Tech Solutions Ltd.',
      recipientBank: 'HSBC Bank PLC',
      routingNumber: 'HBUKGB4B',
      amount: 125000,
      currency: 'GBP',
      purpose: 'Software licensing payment',
      status: 'completed',
      reference: 'WT2024001001',
      date: '2024-01-08',
      estimatedArrival: '2024-01-10',
      fees: 35,
      route: 'UK Sterling Network',
      trackingSteps: [
        { id: '1', description: 'Transfer initiated', timestamp: '2024-01-08T09:00:00Z', status: 'completed' },
        { id: '2', description: 'Compliance verification', timestamp: '2024-01-08T09:30:00Z', status: 'completed' },
        { id: '3', description: 'Routed via correspondent bank', timestamp: '2024-01-08T14:00:00Z', status: 'completed', location: 'London, UK' },
        { id: '4', description: 'Credited to recipient account', timestamp: '2024-01-10T10:15:00Z', status: 'completed' }
      ]
    },
    {
      id: 'WT002',
      recipientName: 'Asia Manufacturing Co.',
      recipientBank: 'Mizuho Bank Ltd.',
      routingNumber: 'MHCBJPJT',
      amount: 250000,
      currency: 'USD',
      purpose: 'Equipment purchase',
      status: 'processing',
      reference: 'WT2024001002',
      date: '2024-01-12',
      estimatedArrival: '2024-01-16',
      fees: 50,
      route: 'Asia-Pacific Corridor',
      trackingSteps: [
        { id: '1', description: 'Transfer initiated', timestamp: '2024-01-12T08:00:00Z', status: 'completed' },
        { id: '2', description: 'Compliance verification', timestamp: '2024-01-12T08:45:00Z', status: 'completed' },
        { id: '3', description: 'Processing via intermediary bank', timestamp: '2024-01-12T16:00:00Z', status: 'current', location: 'Singapore' },
        { id: '4', description: 'Final routing to recipient bank', timestamp: '', status: 'pending' }
      ]
    }
  ]);

  // Calculate total fees
  const calculateTotalFees = (amount: number, route: WireRoute | null, expedited: boolean = false): number => {
    if (!route) return 0;
    
    let totalFees = route.fee;
    if (route.intermediary) totalFees += feeStructure.intermediary;
    if (expedited) totalFees += feeStructure.expedited - route.fee;
    
    return totalFees;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'returned': return 'text-orange-600 bg-orange-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get reliability color
  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 99) return 'text-green-600';
    if (reliability >= 97) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">International Wire Transfers</h1>
              <p className="text-gray-600">Fast, secure wire transfers through correspondent banking networks</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Processing Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>New Wire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wire Network Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Network className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-2">Correspondent Banking Network</h3>
            <p className="text-purple-700 text-sm mb-3">
              Our wire transfer service utilizes established correspondent banking relationships with major financial 
              institutions worldwide, ensuring reliable and compliant international money transfers.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800">Optimized routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800">Regulatory compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800">Real-time tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send Wire', icon: Zap },
              { id: 'routes', label: 'Wire Routes', icon: Route },
              { id: 'calculator', label: 'Fee Calculator', icon: Calculator },
              { id: 'history', label: 'Transfer History', icon: FileText },
              { id: 'tracking', label: 'Track Wire', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
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
          {/* Send Wire */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Initiate Wire Transfer</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Route Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Wire Route</label>
                    {selectedRoute ? (
                      <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Route className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-purple-900">{selectedRoute.routeName}</div>
                              <div className="text-sm text-purple-700">{selectedRoute.correspondent}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedRoute(null)}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            Change
                          </button>
                        </div>
                        <div className="text-sm text-purple-700">
                          <div className="flex items-center space-x-4">
                            <span>Fee: {selectedRoute.currency} {selectedRoute.fee}</span>
                            <span>Time: {selectedRoute.processingTime}</span>
                            <span className={`${getReliabilityColor(selectedRoute.reliability)}`}>
                              {selectedRoute.reliability}% reliability
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="text-center text-gray-500">
                          <Route className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No route selected</p>
                          <button
                            onClick={() => setActiveTab('routes')}
                            className="text-purple-600 hover:text-purple-700 text-sm mt-2"
                          >
                            Browse Routes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select 
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Purpose</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="">Select purpose</option>
                        <option value="business-payment">Business Payment</option>
                        <option value="supplier-payment">Supplier Payment</option>
                        <option value="salary-payment">Salary Payment</option>
                        <option value="investment">Investment</option>
                        <option value="loan-repayment">Loan Repayment</option>
                        <option value="property-purchase">Property Purchase</option>
                        <option value="education">Education Expenses</option>
                        <option value="family-support">Family Support</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="expedited"
                        checked={isExpedited}
                        onChange={(e) => setIsExpedited(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="expedited" className="text-sm font-medium text-gray-700">
                        Expedited Processing (+$50)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Wire Instructions</label>
                      <textarea
                        rows={3}
                        placeholder="Additional instructions for the receiving bank"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Recipient Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recipient Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name</label>
                        <input
                          type="text"
                          placeholder="Full legal name of recipient"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Recipient bank name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                          <input
                            type="text"
                            placeholder="ABA/SWIFT/Sort Code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                          <input
                            type="text"
                            placeholder="Recipient account number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Address</label>
                        <textarea
                          rows={2}
                          placeholder="Complete bank address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  {transferAmount && selectedRoute && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h4 className="font-medium text-purple-900 mb-4">Wire Transfer Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Transfer Amount:</span>
                          <span className="font-medium text-purple-900">{selectedCurrency} {parseFloat(transferAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Wire Fee:</span>
                          <span className="font-medium text-purple-900">{selectedRoute.currency} {selectedRoute.fee}</span>
                        </div>
                        {selectedRoute.intermediary && (
                          <div className="flex justify-between">
                            <span className="text-purple-700">Intermediary Fee:</span>
                            <span className="font-medium text-purple-900">{selectedRoute.currency} {feeStructure.intermediary}</span>
                          </div>
                        )}
                        {isExpedited && (
                          <div className="flex justify-between">
                            <span className="text-purple-700">Expedited Fee:</span>
                            <span className="font-medium text-purple-900">{selectedRoute.currency} 50</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-purple-200">
                          <span className="font-medium text-purple-900">Total Cost:</span>
                          <span className="font-bold text-purple-900">
                            {selectedCurrency} {(parseFloat(transferAmount) + calculateTotalFees(parseFloat(transferAmount), selectedRoute, isExpedited)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Processing Time:</span>
                          <span className="font-medium text-purple-900">
                            {isExpedited ? 'Same day' : selectedRoute.processingTime}
                          </span>
                        </div>
                      </div>
                      <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors mt-4 font-medium">
                        Send Wire Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wire Routes */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Available Wire Routes</h3>
                <div className="text-sm text-gray-500">
                  {wireRoutes.length} routes available
                </div>
              </div>

              <div className="grid gap-4">
                {wireRoutes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <Route className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{route.routeName}</h4>
                            <span className={`text-sm font-medium ${getReliabilityColor(route.reliability)}`}>
                              {route.reliability}% reliability
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Correspondent:</span> {route.correspondent}
                              </div>
                              {route.intermediary && (
                                <div className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Intermediary:</span> {route.intermediary}
                                </div>
                              )}
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Countries:</span> {route.countries.join(', ')}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Fee: </span>
                                <span className="font-medium">{route.currency} {route.fee}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Processing: </span>
                                <span className="font-medium">{route.processingTime}</span>
                              </div>
                            </div>
                          </div>

                          {route.restrictions && route.restrictions.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-yellow-800">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-medium">Restrictions:</span>
                              </div>
                              <ul className="text-sm text-yellow-700 mt-1 ml-6 list-disc">
                                {route.restrictions.map((restriction, index) => (
                                  <li key={index}>{restriction}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => {
                            setSelectedRoute(route);
                            setActiveTab('send');
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Select Route
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Calculator */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Wire Transfer Fee Calculator</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Calculate Transfer Costs</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                          <option value="">Select destination</option>
                          <option value="domestic">United States (Domestic)</option>
                          <option value="europe">Europe</option>
                          <option value="uk">United Kingdom</option>
                          <option value="asia">Asia-Pacific</option>
                          <option value="latam">Latin America</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="calc-expedited"
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="calc-expedited" className="text-sm font-medium text-gray-700">
                          Expedited Processing
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-medium text-purple-900 mb-4">Fee Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Base Wire Fee:</span>
                        <span className="font-medium text-purple-900">USD 45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Correspondent Fee:</span>
                        <span className="font-medium text-purple-900">USD 15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Intermediary Fee:</span>
                        <span className="font-medium text-purple-900">USD 20</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-purple-200">
                        <span className="font-medium text-purple-900">Total Fees:</span>
                        <span className="font-bold text-purple-900">USD 80</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Processing Time:</span>
                        <span className="font-medium text-purple-900">1-2 business days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Info className="w-4 h-4" />
                      <span>Fees may vary based on specific routing and compliance requirements.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Wire Transfer History</h3>
                <button className="text-purple-600 hover:text-purple-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.recipientName}</div>
                          <div className="text-sm text-gray-500">{transfer.recipientBank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">{transfer.currency} {transfer.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>
                        <div className="font-medium">{transfer.purpose}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <div className="font-medium font-mono">{transfer.reference}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{new Date(transfer.date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900 mb-3">Transfer Progress</div>
                      <div className="space-y-3">
                        {transfer.trackingSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}>
                              {step.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : step.status === 'current' ? (
                                <Clock className="w-4 h-4 text-white" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm ${step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                                {step.description}
                              </div>
                              {step.timestamp && (
                                <div className="text-xs text-gray-500">
                                  {new Date(step.timestamp).toLocaleString()}
                                  {step.location && ` • ${step.location}`}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track Wire */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Track Wire Transfer</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter wire reference number (e.g., WT2024001002)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Track
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Enter your wire transfer reference number to track the real-time status and routing information.
                </p>
              </div>

              {/* Sample tracking result */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900">Wire Reference: WT2024001002</h4>
                    <p className="text-sm text-gray-500">To Asia Manufacturing Co. via Asia-Pacific Corridor</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Processing
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Wire Transfer Initiated</div>
                      <div className="text-sm text-gray-500">Jan 12, 2024 at 8:00 AM • New York, USA</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Compliance Verification Completed</div>
                      <div className="text-sm text-gray-500">Jan 12, 2024 at 8:45 AM • New York, USA</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Processing via Intermediary Bank</div>
                      <div className="text-sm text-gray-500">Jan 12, 2024 at 4:00 PM • Singapore</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">Final Routing to Recipient Bank</div>
                      <div className="text-sm text-gray-400">Estimated: Jan 16, 2024 • Tokyo, Japan</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-800">
                    <Info className="w-4 h-4" />
                    <span>Your wire is currently being processed through our correspondent bank in Singapore. Expected completion within 2-4 business days.</span>
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

export default InternationalWireTransfers;