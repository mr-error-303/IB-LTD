import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Heart,
  Car,
  Home,
  Briefcase,
  Plane,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Zap,
  Umbrella,
  Baby,
  GraduationCap,
  Building,
  Truck,
  Smartphone,
  Laptop,
  Camera,
  Watch,
  Headphones,
  Globe,
  CreditCard,
  Calculator,
  Info,
  HelpCircle,
  Settings,
  Bell,
  Share2,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertTriangle,
  Target,
  PieChart,
  BarChart3,
  Activity,
  Bookmark,
  Tag,
  Percent,
  Gift,
  Crown,
  Sparkles
} from 'lucide-react';

interface InsurancePolicy {
  id: string;
  type: string;
  name: string;
  provider: string;
  policyNumber: string;
  premium: number;
  coverage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  nextPayment?: string;
  beneficiaries: string[];
  documents: string[];
  claims: number;
  lastClaim?: string;
  renewalDate: string;
  discount: number;
  features: string[];
}

interface Claim {
  id: string;
  policyId: string;
  type: string;
  amount: number;
  claimAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'settled';
  dateSubmitted: string;
  dateProcessed?: string;
  description: string;
  documents: string[];
  estimatedSettlement?: string;
  rejectionReason?: string;
  claimNumber: string;
}

interface InsuranceProduct {
  id: string;
  name: string;
  type: string;
  provider: string;
  description: string;
  features: string[];
  coverage: {
    min: number;
    max: number;
  };
  premium: {
    min: number;
    max: number;
  };
  ageLimit: {
    min: number;
    max: number;
  };
  benefits: string[];
  exclusions: string[];
  rating: number;
  reviews: number;
  popular: boolean;
  discount?: number;
  icon: React.ReactNode;
  color: string;
}

const InsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'products' | 'calculator'>('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'premium' | 'coverage' | 'date'>('date');
  const [loading, setLoading] = useState(false);

  // Calculator states
  const [calculatorType, setCalculatorType] = useState('life');
  const [calculatorData, setCalculatorData] = useState({
    age: '',
    income: '',
    coverage: '',
    term: '',
    gender: 'male',
    smoker: false,
    occupation: '',
    health: 'good'
  });
  const [calculatorResult, setCalculatorResult] = useState<any>(null);

  // Mock policies data
  const policies: InsurancePolicy[] = [
    {
      id: 'pol-001',
      type: 'Life Insurance',
      name: 'Term Life Pro',
      provider: 'MetLife Bangladesh',
      policyNumber: 'ML-2024-001234',
      premium: 15000,
      coverage: 2000000,
      startDate: '2024-01-15',
      endDate: '2044-01-15',
      status: 'active',
      nextPayment: '2024-07-15',
      beneficiaries: ['Spouse', 'Children'],
      documents: ['Policy Document', 'Medical Report', 'ID Copy'],
      claims: 0,
      renewalDate: '2025-01-15',
      discount: 10,
      features: ['Accidental Death Benefit', 'Terminal Illness Benefit', 'Premium Waiver']
    },
    {
      id: 'pol-002',
      type: 'Health Insurance',
      name: 'Family Health Plus',
      provider: 'Pragati Life Insurance',
      policyNumber: 'PL-2024-005678',
      premium: 25000,
      coverage: 1000000,
      startDate: '2024-03-01',
      endDate: '2025-03-01',
      status: 'active',
      nextPayment: '2024-09-01',
      beneficiaries: ['Self', 'Spouse', 'Children'],
      documents: ['Policy Document', 'Health Certificate', 'Family Details'],
      claims: 2,
      lastClaim: '2024-05-20',
      renewalDate: '2025-03-01',
      discount: 15,
      features: ['Cashless Treatment', 'Pre-existing Conditions', 'Maternity Coverage']
    },
    {
      id: 'pol-003',
      type: 'Motor Insurance',
      name: 'Comprehensive Car Insurance',
      provider: 'Sadharan Bima Corporation',
      policyNumber: 'SBC-2024-009876',
      premium: 18000,
      coverage: 1500000,
      startDate: '2024-02-10',
      endDate: '2025-02-10',
      status: 'active',
      nextPayment: '2025-02-10',
      beneficiaries: ['Policy Holder'],
      documents: ['Policy Document', 'Vehicle Registration', 'Driving License'],
      claims: 1,
      lastClaim: '2024-04-15',
      renewalDate: '2025-02-10',
      discount: 5,
      features: ['Third Party Coverage', 'Own Damage', 'Personal Accident']
    },
    {
      id: 'pol-004',
      type: 'Travel Insurance',
      name: 'Global Travel Protection',
      provider: 'Green Delta Insurance',
      policyNumber: 'GD-2024-112233',
      premium: 5000,
      coverage: 500000,
      startDate: '2024-06-01',
      endDate: '2024-12-01',
      status: 'expired',
      beneficiaries: ['Self'],
      documents: ['Policy Document', 'Passport Copy', 'Travel Itinerary'],
      claims: 0,
      renewalDate: '2024-12-01',
      discount: 0,
      features: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss']
    }
  ];

  // Mock claims data
  const claims: Claim[] = [
    {
      id: 'clm-001',
      policyId: 'pol-002',
      type: 'Medical Treatment',
      amount: 45000,
      claimAmount: 40000,
      status: 'approved',
      dateSubmitted: '2024-05-20',
      dateProcessed: '2024-05-25',
      description: 'Hospitalization for appendectomy',
      documents: ['Medical Bills', 'Discharge Summary', 'Doctor Certificate'],
      claimNumber: 'CLM-2024-001'
    },
    {
      id: 'clm-002',
      policyId: 'pol-003',
      type: 'Vehicle Damage',
      amount: 85000,
      claimAmount: 75000,
      status: 'processing',
      dateSubmitted: '2024-04-15',
      description: 'Accident damage to front bumper and headlight',
      documents: ['Police Report', 'Repair Estimate', 'Photos'],
      estimatedSettlement: '2024-07-20',
      claimNumber: 'CLM-2024-002'
    },
    {
      id: 'clm-003',
      policyId: 'pol-002',
      type: 'Diagnostic Tests',
      amount: 12000,
      claimAmount: 12000,
      status: 'settled',
      dateSubmitted: '2024-03-10',
      dateProcessed: '2024-03-15',
      description: 'Annual health checkup and blood tests',
      documents: ['Test Reports', 'Bills', 'Prescription'],
      claimNumber: 'CLM-2024-003'
    }
  ];

  // Mock insurance products
  const insuranceProducts: InsuranceProduct[] = [
    {
      id: 'prod-001',
      name: 'Term Life Insurance',
      type: 'Life Insurance',
      provider: 'MetLife Bangladesh',
      description: 'Affordable term life insurance with high coverage',
      features: ['High Coverage', 'Low Premium', 'Tax Benefits', 'Flexible Terms'],
      coverage: { min: 500000, max: 10000000 },
      premium: { min: 5000, max: 50000 },
      ageLimit: { min: 18, max: 65 },
      benefits: ['Death Benefit', 'Terminal Illness', 'Accidental Death'],
      exclusions: ['Suicide (first 2 years)', 'War', 'Self-inflicted injury'],
      rating: 4.5,
      reviews: 1250,
      popular: true,
      discount: 15,
      icon: <Heart className="w-6 h-6" />,
      color: 'text-red-400'
    },
    {
      id: 'prod-002',
      name: 'Family Health Insurance',
      type: 'Health Insurance',
      provider: 'Pragati Life Insurance',
      description: 'Comprehensive health coverage for entire family',
      features: ['Family Floater', 'Cashless Treatment', 'Pre-existing Conditions', 'Maternity'],
      coverage: { min: 300000, max: 2000000 },
      premium: { min: 15000, max: 80000 },
      ageLimit: { min: 0, max: 80 },
      benefits: ['Hospitalization', 'Day Care', 'Ambulance', 'Health Checkup'],
      exclusions: ['Cosmetic Surgery', 'Dental (unless accidental)', 'Infertility'],
      rating: 4.3,
      reviews: 890,
      popular: true,
      discount: 20,
      icon: <Shield className="w-6 h-6" />,
      color: 'text-green-400'
    },
    {
      id: 'prod-003',
      name: 'Motor Insurance',
      type: 'Motor Insurance',
      provider: 'Sadharan Bima Corporation',
      description: 'Complete protection for your vehicle',
      features: ['Comprehensive Coverage', 'Third Party', 'Own Damage', 'Personal Accident'],
      coverage: { min: 100000, max: 5000000 },
      premium: { min: 8000, max: 40000 },
      ageLimit: { min: 18, max: 75 },
      benefits: ['Accident Coverage', 'Theft Protection', 'Natural Disasters', 'Roadside Assistance'],
      exclusions: ['Racing', 'Drunk Driving', 'Unlicensed Driving', 'War'],
      rating: 4.1,
      reviews: 567,
      popular: false,
      icon: <Car className="w-6 h-6" />,
      color: 'text-blue-400'
    },
    {
      id: 'prod-004',
      name: 'Home Insurance',
      type: 'Property Insurance',
      provider: 'Green Delta Insurance',
      description: 'Protect your home and belongings',
      features: ['Structure Coverage', 'Contents Insurance', 'Liability Protection', 'Additional Living'],
      coverage: { min: 500000, max: 10000000 },
      premium: { min: 10000, max: 60000 },
      ageLimit: { min: 18, max: 80 },
      benefits: ['Fire & Lightning', 'Theft & Burglary', 'Natural Disasters', 'Public Liability'],
      exclusions: ['War', 'Nuclear Risks', 'Wear & Tear', 'Intentional Damage'],
      rating: 4.2,
      reviews: 345,
      popular: false,
      icon: <Home className="w-6 h-6" />,
      color: 'text-purple-400'
    },
    {
      id: 'prod-005',
      name: 'Travel Insurance',
      type: 'Travel Insurance',
      provider: 'Green Delta Insurance',
      description: 'Comprehensive travel protection worldwide',
      features: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Flight Delay'],
      coverage: { min: 100000, max: 1000000 },
      premium: { min: 2000, max: 15000 },
      ageLimit: { min: 0, max: 80 },
      benefits: ['Emergency Medical', 'Evacuation', 'Repatriation', 'Personal Liability'],
      exclusions: ['Pre-existing Conditions', 'High-risk Activities', 'War Zones', 'Alcohol/Drug Related'],
      rating: 4.4,
      reviews: 234,
      popular: false,
      discount: 10,
      icon: <Plane className="w-6 h-6" />,
      color: 'text-cyan-400'
    }
  ];

  const insuranceTypes = ['all', 'Life Insurance', 'Health Insurance', 'Motor Insurance', 'Property Insurance', 'Travel Insurance'];
  const statusTypes = ['all', 'active', 'expired', 'pending', 'cancelled'];
  const claimStatusTypes = ['all', 'pending', 'approved', 'rejected', 'processing', 'settled'];

  // Filter functions
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || policy.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'premium':
        return b.premium - a.premium;
      case 'coverage':
        return b.coverage - a.coverage;
      case 'date':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      default:
        return 0;
    }
  });

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = insuranceProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || product.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Calculate premium estimate
  const calculatePremium = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const baseRate = calculatorType === 'life' ? 0.005 : 
                      calculatorType === 'health' ? 0.03 : 0.02;
      
      const ageMultiplier = parseInt(calculatorData.age) > 40 ? 1.5 : 1;
      const smokerMultiplier = calculatorData.smoker ? 1.3 : 1;
      const genderMultiplier = calculatorData.gender === 'female' ? 0.9 : 1;
      
      const coverage = parseInt(calculatorData.coverage) || 1000000;
      const estimatedPremium = coverage * baseRate * ageMultiplier * smokerMultiplier * genderMultiplier;
      
      setCalculatorResult({
        premium: Math.round(estimatedPremium),
        coverage: coverage,
        term: calculatorData.term,
        recommendations: [
          'Consider increasing coverage for better protection',
          'Add riders for enhanced benefits',
          'Regular health checkups can reduce premium'
        ]
      });
      
      setLoading(false);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'settled':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'expired':
      case 'cancelled':
      case 'rejected':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'settled':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'expired':
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Insurance Services</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewPolicy(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </button>
            <button
              onClick={() => setShowNewClaim(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              File Claim
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 mb-6">
          {[
            { id: 'policies', label: 'My Policies', icon: Shield },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'products', label: 'Products', icon: Star },
            { id: 'calculator', label: 'Calculator', icon: Calculator }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        {activeTab !== 'calculator' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {(activeTab === 'claims' ? claimStatusTypes : insuranceTypes).map(type => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
              
              {/* Status Filter */}
              {activeTab !== 'products' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {(activeTab === 'claims' ? claimStatusTypes : statusTypes).map(status => (
                    <option key={status} value={status} className="bg-gray-800">
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Sort */}
              {activeTab === 'policies' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="date" className="bg-gray-800">Sort by Date</option>
                  <option value="name" className="bg-gray-800">Sort by Name</option>
                  <option value="premium" className="bg-gray-800">Sort by Premium</option>
                  <option value="coverage" className="bg-gray-800">Sort by Coverage</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'policies' && (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-600 rounded-lg mr-3">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{policy.name}</h3>
                      <p className="text-sm text-gray-400">{policy.provider}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(policy.status)}`}>
                    {getStatusIcon(policy.status)}
                    <span className="ml-1">{policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}</span>
                  </div>
                </div>

                {/* Policy Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Policy Number:</span>
                    <span className="font-medium">{policy.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coverage:</span>
                    <span className="font-medium text-green-400">{formatCurrency(policy.coverage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium:</span>
                    <span className="font-medium">{formatCurrency(policy.premium)}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Renewal:</span>
                    <span className="font-medium">{formatDate(policy.renewalDate)}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {policy.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {policy.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                        +{policy.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Payment */}
                {policy.nextPayment && policy.status === 'active' && (
                  <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                      <span className="text-sm text-yellow-400">
                        Next payment due: {formatDate(policy.nextPayment)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPolicy(policy)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-6">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Claim #{claim.claimNumber}</h3>
                    <p className="text-gray-400">{claim.type}</p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(claim.status)}`}>
                    {getStatusIcon(claim.status)}
                    <span className="ml-1">{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Claim Amount</p>
                    <p className="font-semibold text-green-400">{formatCurrency(claim.claimAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Submitted</p>
                    <p className="font-medium">{formatDate(claim.dateSubmitted)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Policy</p>
                    <p className="font-medium">{policies.find(p => p.id === claim.policyId)?.name}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{claim.description}</p>

                {claim.estimatedSettlement && (
                  <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-sm text-blue-400">
                        Estimated settlement: {formatDate(claim.estimatedSettlement)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 relative"
              >
                {/* Popular Badge */}
                {product.popular && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500 text-black rounded-full text-xs font-medium flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                )}

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                    {product.discount}% OFF
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center mb-4 mt-2">
                  <div className={`p-3 rounded-lg mr-4 ${product.color} bg-white/10`}>
                    {product.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-400">{product.provider}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4">{product.description}</p>

                {/* Coverage & Premium */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Coverage Range</p>
                    <p className="font-medium text-green-400">
                      {formatCurrency(product.coverage.min)} - {formatCurrency(product.coverage.max)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Premium Range</p>
                    <p className="font-medium">
                      {formatCurrency(product.premium.min)} - {formatCurrency(product.premium.max)}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                        +{product.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Insurance Premium Calculator</h2>
              
              {/* Calculator Type Selection */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-white/10 rounded-xl p-1">
                  {[
                    { id: 'life', label: 'Life Insurance', icon: Heart },
                    { id: 'health', label: 'Health Insurance', icon: Shield },
                    { id: 'motor', label: 'Motor Insurance', icon: Car }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setCalculatorType(type.id)}
                      className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                        calculatorType === type.id ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                      }`}
                    >
                      <type.icon className="w-5 h-5 mr-2" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        value={calculatorData.age}
                        onChange={(e) => setCalculatorData({...calculatorData, age: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Enter your age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Gender</label>
                      <select
                        value={calculatorData.gender}
                        onChange={(e) => setCalculatorData({...calculatorData, gender: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="male" className="bg-gray-800">Male</option>
                        <option value="female" className="bg-gray-800">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Income (BDT)</label>
                    <input
                      type="number"
                      value={calculatorData.income}
                      onChange={(e) => setCalculatorData({...calculatorData, income: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter annual income"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Desired Coverage (BDT)</label>
                    <input
                      type="number"
                      value={calculatorData.coverage}
                      onChange={(e) => setCalculatorData({...calculatorData, coverage: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter coverage amount"
                    />
                  </div>

                  {calculatorType === 'life' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Policy Term (Years)</label>
                      <select
                        value={calculatorData.term}
                        onChange={(e) => setCalculatorData({...calculatorData, term: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" className="bg-gray-800">Select term</option>
                        <option value="10" className="bg-gray-800">10 Years</option>
                        <option value="15" className="bg-gray-800">15 Years</option>
                        <option value="20" className="bg-gray-800">20 Years</option>
                        <option value="25" className="bg-gray-800">25 Years</option>
                        <option value="30" className="bg-gray-800">30 Years</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smoker"
                      checked={calculatorData.smoker}
                      onChange={(e) => setCalculatorData({...calculatorData, smoker: e.target.checked})}
                      className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="smoker" className="text-sm font-medium">I am a smoker</label>
                  </div>

                  <button
                    onClick={calculatePremium}
                    disabled={loading || !calculatorData.age || !calculatorData.coverage}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Calculator className="w-5 h-5 mr-2" />
                    )}
                    Calculate Premium
                  </button>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Premium Estimate</h3>
                  
                  {calculatorResult ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-xl p-6 text-center">
                        <h4 className="text-lg font-medium mb-2">Estimated Annual Premium</h4>
                        <p className="text-3xl font-bold text-green-400 mb-2">
                          {formatCurrency(calculatorResult.premium)}
                        </p>
                        <p className="text-sm text-gray-400">
                          For {formatCurrency(calculatorResult.coverage)} coverage
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-xl p-6">
                        <h4 className="font-medium mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {calculatorResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5" />
                              <span className="text-sm text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Apply for Policy
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/10 rounded-xl p-12 text-center">
                      <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">
                        Fill in your details to calculate premium estimate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policy Details Modal */}
        {selectedPolicy && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{selectedPolicy.name}</h3>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Policy Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Policy Number:</span>
                        <span>{selectedPolicy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span>{selectedPolicy.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span>{selectedPolicy.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedPolicy.status)}`}>
                          {selectedPolicy.status.charAt(0).toUpperCase() + selectedPolicy.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Coverage Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coverage Amount:</span>
                        <span className="text-green-400 font-medium">{formatCurrency(selectedPolicy.coverage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Premium:</span>
                        <span className="font-medium">{formatCurrency(selectedPolicy.premium)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Discount:</span>
                        <span className="text-green-400">{selectedPolicy.discount}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Policy Period</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Start Date:</span>
                        <span>{formatDate(selectedPolicy.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">End Date:</span>
                        <span>{formatDate(selectedPolicy.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Renewal Date:</span>
                        <span>{formatDate(selectedPolicy.renewalDate)}</span>
                      </div>
                      {selectedPolicy.nextPayment && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Next Payment:</span>
                          <span className="text-yellow-400">{formatDate(selectedPolicy.nextPayment)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Beneficiaries</h4>
                    <div className="space-y-2">
                      {selectedPolicy.beneficiaries.map((beneficiary, index) => (
                        <div key={index} className="flex items-center p-3 bg-white/10 rounded-lg">
                          <Users className="w-4 h-4 mr-3 text-blue-400" />
                          <span>{beneficiary}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Key Features</h4>
                    <div className="space-y-2">
                      {selectedPolicy.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-3 bg-white/10 rounded-lg">
                          <CheckCircle className="w-4 h-4 mr-3 text-green-400" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Documents</h4>
                    <div className="space-y-2">
                      {selectedPolicy.documents.map((document, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-3 text-purple-400" />
                            <span className="text-sm">{document}</span>
                          </div>
                          <button className="p-1 hover:bg-white/20 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Policy
                </button>
                <button className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center justify-center">
                  <FileText className="w-5 h-5 mr-2" />
                  File Claim
                </button>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsurancePage;