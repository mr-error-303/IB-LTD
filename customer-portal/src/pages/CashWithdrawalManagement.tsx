import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  EyeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  MapPinIcon,
  ClockIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  DevicePhoneMobileIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface CashWithdrawal {
  id: string;
  transactionId: string;
  user: {
    name: string;
    account: string;
    email: string;
    userId: string;
    phone: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestDate: string;
  approvalDate?: string;
  completionDate?: string;
  withdrawalMethod: 'atm' | 'agent' | 'branch' | 'mobile_banking';
  location: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    city: string;
    area: string;
  };
  agentInfo?: {
    agentId: string;
    agentName: string;
    agentPhone: string;
    commission: number;
  };
  atmInfo?: {
    atmId: string;
    bankName: string;
    atmLocation: string;
  };
  deviceInfo: string;
  ipAddress: string;
  fees: number;
  reference: string;
  approvedBy?: string;
  rejectionReason?: string;
  riskScore: number;
  riskFactors: string[];
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    amount: number;
    nextWithdrawal?: string;
  };
  verificationMethod: 'otp' | 'biometric' | 'pin' | 'signature';
  verificationStatus: 'pending' | 'verified' | 'failed';
}

interface WithdrawalLimit {
  id: string;
  userId: string;
  userName: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  atmDailyLimit: number;
  agentDailyLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  isActive: boolean;
  lastUpdated: string;
  specialLimits?: {
    internationalATM: number;
    nightTimeWithdrawal: number;
    weekendWithdrawal: number;
  };
}

interface SuspiciousLocation {
  id: string;
  locationName: string;
  address: string;
  city: string;
  area: string;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedDate: string;
  blockedBy: string;
  isActive: boolean;
  incidentCount: number;
  lastIncident?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface WithdrawalPattern {
  id: string;
  userId: string;
  userName: string;
  patternType: 'frequent_small' | 'large_amounts' | 'unusual_timing' | 'multiple_locations' | 'rapid_succession';
  description: string;
  riskScore: number;
  detectedDate: string;
  frequency: number;
  totalAmount: number;
  locations: string[];
  timePattern: string;
  status: 'monitoring' | 'flagged' | 'investigated' | 'cleared';
  investigatedBy?: string;
  notes?: string;
}

const CashWithdrawalManagement: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'requests' | 'limits' | 'locations' | 'patterns' | 'analytics'>('requests');
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);
  const [withdrawalLimits, setWithdrawalLimits] = useState<WithdrawalLimit[]>([]);
  const [suspiciousLocations, setSuspiciousLocations] = useState<SuspiciousLocation[]>([]);
  const [withdrawalPatterns, setWithdrawalPatterns] = useState<WithdrawalPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CashWithdrawal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  useEffect(() => {
    fetchWithdrawals();
    fetchWithdrawalLimits();
    fetchSuspiciousLocations();
    fetchWithdrawalPatterns();
  }, []);

  const fetchWithdrawals = async () => {
    // Mock data - replace with actual API call
    const mockWithdrawals: CashWithdrawal[] = [
      {
        id: 'CW001',
        transactionId: 'TXN2024012301',
        user: {
          name: 'Ahmed Rahman',
          account: '1001234567',
          email: 'ahmed.rahman@email.com',
          userId: 'U001',
          phone: '01712345678'
        },
        amount: 75000,
        currency: 'BDT',
        status: 'pending',
        requestDate: '2024-01-23T09:30:00Z',
        withdrawalMethod: 'atm',
        location: {
          name: 'Dutch-Bangla Bank ATM',
          address: 'Dhanmondi 27, Dhaka',
          city: 'Dhaka',
          area: 'Dhanmondi',
          coordinates: { lat: 23.7465, lng: 90.3765 }
        },
        atmInfo: {
          atmId: 'ATM-DBBL-001',
          bankName: 'Dutch-Bangla Bank',
          atmLocation: 'Dhanmondi Branch'
        },
        deviceInfo: 'Mobile App - Android 12',
        ipAddress: '103.15.200.45',
        fees: 15,
        reference: 'CW-ATM-001',
        riskScore: 85,
        riskFactors: ['Large amount', 'Unusual time', 'High-risk location'],
        isRecurring: false,
        verificationMethod: 'otp',
        verificationStatus: 'pending'
      },
      {
        id: 'CW002',
        transactionId: 'TXN2024012302',
        user: {
          name: 'Fatima Khan',
          account: '1001234568',
          email: 'fatima.khan@email.com',
          userId: 'U002',
          phone: '01812345678'
        },
        amount: 25000,
        currency: 'BDT',
        status: 'approved',
        requestDate: '2024-01-23T14:15:00Z',
        approvalDate: '2024-01-23T14:20:00Z',
        withdrawalMethod: 'agent',
        location: {
          name: 'bKash Agent - Gulshan',
          address: 'Gulshan Avenue, Dhaka',
          city: 'Dhaka',
          area: 'Gulshan',
          coordinates: { lat: 23.7808, lng: 90.4176 }
        },
        agentInfo: {
          agentId: 'AGT-001',
          agentName: 'Rashid Mobile Banking',
          agentPhone: '01912345678',
          commission: 50
        },
        deviceInfo: 'Web Browser - Chrome 120',
        ipAddress: '103.15.200.46',
        fees: 25,
        reference: 'CW-AGT-002',
        approvedBy: 'Admin User',
        riskScore: 35,
        riskFactors: ['Regular customer', 'Verified agent'],
        isRecurring: true,
        recurringPattern: {
          frequency: 'weekly',
          amount: 25000,
          nextWithdrawal: '2024-01-30T14:15:00Z'
        },
        verificationMethod: 'pin',
        verificationStatus: 'verified'
      },
      {
        id: 'CW003',
        transactionId: 'TXN2024012303',
        user: {
          name: 'Suspicious User',
          account: '1001234569',
          email: 'suspicious@email.com',
          userId: 'U003',
          phone: '01912345678'
        },
        amount: 100000,
        currency: 'BDT',
        status: 'rejected',
        requestDate: '2024-01-23T02:45:00Z',
        approvalDate: '2024-01-23T08:00:00Z',
        withdrawalMethod: 'agent',
        location: {
          name: 'Unknown Agent - Remote Area',
          address: 'Remote Location, Chittagong',
          city: 'Chittagong',
          area: 'Remote'
        },
        agentInfo: {
          agentId: 'AGT-999',
          agentName: 'Unverified Agent',
          agentPhone: '01999999999',
          commission: 200
        },
        deviceInfo: 'Unknown Device',
        ipAddress: '192.168.1.1',
        fees: 100,
        reference: 'CW-AGT-003',
        approvedBy: 'Security Team',
        rejectionReason: 'Suspicious activity detected - unusual location and timing',
        riskScore: 95,
        riskFactors: ['Very large amount', 'Unusual timing (2 AM)', 'Unverified agent', 'Suspicious IP'],
        isRecurring: false,
        verificationMethod: 'otp',
        verificationStatus: 'failed'
      },
      {
        id: 'CW004',
        transactionId: 'TXN2024012304',
        user: {
          name: 'Regular Customer',
          account: '1001234570',
          email: 'regular@email.com',
          userId: 'U004',
          phone: '01512345678'
        },
        amount: 15000,
        currency: 'BDT',
        status: 'completed',
        requestDate: '2024-01-22T16:20:00Z',
        approvalDate: '2024-01-22T16:25:00Z',
        completionDate: '2024-01-22T16:30:00Z',
        withdrawalMethod: 'branch',
        location: {
          name: 'IB LTD Main Branch',
          address: 'Motijheel, Dhaka',
          city: 'Dhaka',
          area: 'Motijheel'
        },
        deviceInfo: 'Web Browser - Firefox 121',
        ipAddress: '103.15.200.47',
        fees: 0,
        reference: 'CW-BRN-004',
        approvedBy: 'Branch Manager',
        riskScore: 15,
        riskFactors: ['Regular customer', 'Branch withdrawal'],
        isRecurring: false,
        verificationMethod: 'signature',
        verificationStatus: 'verified'
      }
    ];
    setWithdrawals(mockWithdrawals);
  };

  const fetchWithdrawalLimits = async () => {
    // Mock data - replace with actual API call
    const mockLimits: WithdrawalLimit[] = [
      {
        id: 'WL001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        dailyLimit: 100000,
        monthlyLimit: 500000,
        perTransactionLimit: 50000,
        atmDailyLimit: 75000,
        agentDailyLimit: 40000,
        currentDailyUsage: 75000,
        currentMonthlyUsage: 250000,
        isActive: true,
        lastUpdated: '2024-01-20T10:00:00Z',
        specialLimits: {
          internationalATM: 25000,
          nightTimeWithdrawal: 20000,
          weekendWithdrawal: 30000
        }
      },
      {
        id: 'WL002',
        userId: 'U002',
        userName: 'Fatima Khan',
        dailyLimit: 75000,
        monthlyLimit: 300000,
        perTransactionLimit: 30000,
        atmDailyLimit: 50000,
        agentDailyLimit: 25000,
        currentDailyUsage: 25000,
        currentMonthlyUsage: 125000,
        isActive: true,
        lastUpdated: '2024-01-20T09:30:00Z'
      },
      {
        id: 'WL003',
        userId: 'U003',
        userName: 'Suspicious User',
        dailyLimit: 20000,
        monthlyLimit: 50000,
        perTransactionLimit: 10000,
        atmDailyLimit: 15000,
        agentDailyLimit: 5000,
        currentDailyUsage: 0,
        currentMonthlyUsage: 0,
        isActive: false,
        lastUpdated: '2024-01-23T08:00:00Z'
      }
    ];
    setWithdrawalLimits(mockLimits);
  };

  const fetchSuspiciousLocations = async () => {
    // Mock data - replace with actual API call
    const mockLocations: SuspiciousLocation[] = [
      {
        id: 'SL001',
        locationName: 'Unknown Agent - Remote Area',
        address: 'Remote Location, Chittagong',
        city: 'Chittagong',
        area: 'Remote',
        reason: 'Multiple fraud reports and unverified agent operations',
        riskLevel: 'critical',
        blockedDate: '2024-01-23T08:00:00Z',
        blockedBy: 'Security Team',
        isActive: true,
        incidentCount: 15,
        lastIncident: '2024-01-23T02:45:00Z',
        coordinates: { lat: 22.3569, lng: 91.7832 }
      },
      {
        id: 'SL002',
        locationName: 'ATM - High Crime Area',
        address: 'Dangerous Street, Dhaka',
        city: 'Dhaka',
        area: 'High Crime Zone',
        reason: 'High crime rate and multiple robbery incidents',
        riskLevel: 'high',
        blockedDate: '2024-01-20T15:30:00Z',
        blockedBy: 'Risk Management',
        isActive: true,
        incidentCount: 8,
        lastIncident: '2024-01-22T20:15:00Z'
      },
      {
        id: 'SL003',
        locationName: 'Temporary Block - Investigation',
        address: 'Under Investigation, Sylhet',
        city: 'Sylhet',
        area: 'Commercial',
        reason: 'Temporary block during fraud investigation',
        riskLevel: 'medium',
        blockedDate: '2024-01-15T12:00:00Z',
        blockedBy: 'Investigation Team',
        isActive: false,
        incidentCount: 3,
        lastIncident: '2024-01-15T10:30:00Z'
      }
    ];
    setSuspiciousLocations(mockLocations);
  };

  const fetchWithdrawalPatterns = async () => {
    // Mock data - replace with actual API call
    const mockPatterns: WithdrawalPattern[] = [
      {
        id: 'WP001',
        userId: 'U001',
        userName: 'Ahmed Rahman',
        patternType: 'large_amounts',
        description: 'Consistently withdrawing large amounts near daily limit',
        riskScore: 75,
        detectedDate: '2024-01-20T00:00:00Z',
        frequency: 5,
        totalAmount: 375000,
        locations: ['Dhanmondi ATM', 'Gulshan ATM', 'Motijheel Branch'],
        timePattern: 'Morning hours (9-11 AM)',
        status: 'monitoring'
      },
      {
        id: 'WP002',
        userId: 'U003',
        userName: 'Suspicious User',
        patternType: 'unusual_timing',
        description: 'Multiple withdrawal attempts during unusual hours (2-4 AM)',
        riskScore: 90,
        detectedDate: '2024-01-22T00:00:00Z',
        frequency: 3,
        totalAmount: 150000,
        locations: ['Remote Agent', 'Unknown ATM'],
        timePattern: 'Late night (2-4 AM)',
        status: 'flagged',
        investigatedBy: 'Security Team',
        notes: 'Account temporarily suspended pending investigation'
      },
      {
        id: 'WP003',
        userId: 'U005',
        userName: 'Pattern User',
        patternType: 'multiple_locations',
        description: 'Withdrawals from multiple distant locations within short time',
        riskScore: 85,
        detectedDate: '2024-01-21T00:00:00Z',
        frequency: 4,
        totalAmount: 80000,
        locations: ['Dhaka ATM', 'Chittagong Agent', 'Sylhet Branch', 'Rajshahi ATM'],
        timePattern: 'Various times within 2 hours',
        status: 'investigated',
        investigatedBy: 'Fraud Team',
        notes: 'Confirmed legitimate - user was traveling for business'
      }
    ];
    setWithdrawalPatterns(mockPatterns);
    setLoading(false);
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      // API call to handle withdrawal action
      console.log(`${action} withdrawal ${withdrawalId}: ${reason}`);
      
      setWithdrawals(prev =>
        prev.map(withdrawal =>
          withdrawal.id === withdrawalId
            ? { 
                ...withdrawal, 
                status: action === 'approve' ? 'approved' : 'rejected',
                approvalDate: new Date().toISOString(),
                approvedBy: 'Current Admin',
                rejectionReason: action === 'reject' ? reason : undefined
              }
            : withdrawal
        )
      );
      
      alert(`Withdrawal ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling withdrawal action:', error);
      alert('Error processing withdrawal action');
    }
  };

  const updateWithdrawalLimit = async (limitId: string, newLimit: Partial<WithdrawalLimit>) => {
    try {
      // API call to update limit
      console.log(`Updating limit ${limitId}:`, newLimit);
      
      setWithdrawalLimits(prev =>
        prev.map(limit =>
          limit.id === limitId ? { ...limit, ...newLimit } : limit
        )
      );
      
      alert('Withdrawal limit updated successfully');
    } catch (error) {
      console.error('Error updating withdrawal limit:', error);
      alert('Error updating withdrawal limit');
    }
  };

  const toggleSuspiciousLocation = async (locationId: string) => {
    try {
      // API call to toggle location status
      console.log(`Toggling location ${locationId}`);
      
      setSuspiciousLocations(prev =>
        prev.map(location =>
          location.id === locationId ? { ...location, isActive: !location.isActive } : location
        )
      );
      
      alert('Location status updated successfully');
    } catch (error) {
      console.error('Error updating location status:', error);
      alert('Error updating location status');
    }
  };

  const blockLocation = async (locationName: string, address: string, reason: string, riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      // API call to block location
      console.log(`Blocking location ${locationName}: ${reason}`);
      
      const newLocation: SuspiciousLocation = {
        id: `SL${Date.now()}`,
        locationName,
        address,
        city: 'Unknown',
        area: 'Unknown',
        reason,
        riskLevel,
        blockedDate: new Date().toISOString(),
        blockedBy: 'Current Admin',
        isActive: true,
        incidentCount: 1
      };
      
      setSuspiciousLocations(prev => [newLocation, ...prev]);
      alert('Location blocked successfully');
    } catch (error) {
      console.error('Error blocking location:', error);
      alert('Error blocking location');
    }
  };

  const updatePatternStatus = async (patternId: string, status: 'monitoring' | 'flagged' | 'investigated' | 'cleared', notes?: string) => {
    try {
      // API call to update pattern status
      console.log(`Updating pattern ${patternId} to ${status}: ${notes}`);
      
      setWithdrawalPatterns(prev =>
        prev.map(pattern =>
          pattern.id === patternId
            ? { 
                ...pattern, 
                status,
                investigatedBy: status === 'investigated' || status === 'cleared' ? 'Current Admin' : pattern.investigatedBy,
                notes: notes || pattern.notes
              }
            : pattern
        )
      );
      
      alert('Pattern status updated successfully');
    } catch (error) {
      console.error('Error updating pattern status:', error);
      alert('Error updating pattern status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'atm': return 'text-blue-600 bg-blue-100';
      case 'agent': return 'text-green-600 bg-green-100';
      case 'branch': return 'text-purple-600 bg-purple-100';
      case 'mobile_banking': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600 bg-red-100';
    if (riskScore >= 60) return 'text-orange-600 bg-orange-100';
    if (riskScore >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || withdrawal.withdrawalMethod === methodFilter;
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'high' && withdrawal.riskScore >= 70) ||
                       (riskFilter === 'medium' && withdrawal.riskScore >= 40 && withdrawal.riskScore < 70) ||
                       (riskFilter === 'low' && withdrawal.riskScore < 40);
    
    return matchesSearch && matchesStatus && matchesMethod && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cash Withdrawal Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive oversight and control of cash withdrawal operations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'requests', label: 'Withdrawal Requests', count: withdrawals.filter(w => w.status === 'pending').length },
            { key: 'limits', label: 'Withdrawal Limits', count: withdrawalLimits.filter(l => l.isActive).length },
            { key: 'locations', label: 'Suspicious Locations', count: suspiciousLocations.filter(l => l.isActive).length },
            { key: 'patterns', label: 'Withdrawal Patterns', count: withdrawalPatterns.filter(p => p.status === 'flagged').length },
            { key: 'analytics', label: 'Analytics', count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Withdrawal Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Methods</option>
                  <option value="atm">ATM</option>
                  <option value="agent">Agent</option>
                  <option value="branch">Branch</option>
                  <option value="mobile_banking">Mobile Banking</option>
                </select>
              </div>
              <div>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk (70+)</option>
                  <option value="medium">Medium Risk (40-69)</option>
                  <option value="low">Low Risk (&lt;40)</option>
                </select>
              </div>
              <div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => fetchWithdrawals()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Withdrawals List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Cash Withdrawal Requests ({filteredWithdrawals.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {withdrawal.currency} {withdrawal.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(withdrawal.withdrawalMethod)}`}>
                          {withdrawal.withdrawalMethod.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(withdrawal.riskScore)}`}>
                          Risk: {withdrawal.riskScore}
                        </span>
                        {withdrawal.isRecurring && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <ArrowPathIcon className="w-3 h-3 mr-1" />
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p><strong>User:</strong> {withdrawal.user.name} ({withdrawal.user.account})</p>
                          <p><strong>Phone:</strong> {withdrawal.user.phone}</p>
                          <p><strong>Transaction ID:</strong> {withdrawal.transactionId}</p>
                        </div>
                        <div>
                          <p><strong>Location:</strong> {withdrawal.location.name}</p>
                          <p><strong>Address:</strong> {withdrawal.location.address}</p>
                          <p><strong>Request Date:</strong> {new Date(withdrawal.requestDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {withdrawal.riskFactors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {withdrawal.riskFactors.map((factor, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                              {factor}
                            </span>
                          ))}
                        </div>
                      )}
                      {withdrawal.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-sm">
                          <strong>Rejection Reason:</strong> {withdrawal.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                handleWithdrawalAction(withdrawal.id, 'reject', reason);
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Withdrawal Limits Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Daily Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ATM Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Agent Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {withdrawalLimits.map((limit) => (
                    <tr key={limit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {limit.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {limit.dailyLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {limit.atmDailyLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        BDT {limit.agentDailyLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm">BDT {limit.currentDailyUsage.toLocaleString()}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  (limit.currentDailyUsage / limit.dailyLimit) > 0.8 ? 'bg-red-600' :
                                  (limit.currentDailyUsage / limit.dailyLimit) > 0.6 ? 'bg-yellow-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min((limit.currentDailyUsage / limit.dailyLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const newDailyLimit = prompt('Enter new daily limit:', limit.dailyLimit.toString());
                            if (newDailyLimit) {
                              updateWithdrawalLimit(limit.id, { dailyLimit: parseInt(newDailyLimit) });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => updateWithdrawalLimit(limit.id, { isActive: !limit.isActive })}
                          className={`${limit.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} dark:text-red-400 dark:hover:text-red-300`}
                        >
                          {limit.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Suspicious Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          {/* Add New Block */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Block Suspicious Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Location name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                id="blockLocationName"
              />
              <input
                type="text"
                placeholder="Address"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                id="blockLocationAddress"
              />
              <input
                type="text"
                placeholder="Reason for blocking"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                id="blockLocationReason"
              />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                id="blockLocationRisk"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical Risk</option>
              </select>
              <button
                onClick={() => {
                  const locationName = (document.getElementById('blockLocationName') as HTMLInputElement)?.value;
                  const address = (document.getElementById('blockLocationAddress') as HTMLInputElement)?.value;
                  const reason = (document.getElementById('blockLocationReason') as HTMLInputElement)?.value;
                  const riskLevel = (document.getElementById('blockLocationRisk') as HTMLSelectElement)?.value as 'low' | 'medium' | 'high' | 'critical';
                  if (locationName && address && reason) {
                    blockLocation(locationName, address, reason, riskLevel);
                    (document.getElementById('blockLocationName') as HTMLInputElement).value = '';
                    (document.getElementById('blockLocationAddress') as HTMLInputElement).value = '';
                    (document.getElementById('blockLocationReason') as HTMLInputElement).value = '';
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                Block Location
              </button>
            </div>
          </div>

          {/* Suspicious Locations List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Suspicious Locations ({suspiciousLocations.filter(l => l.isActive).length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {suspiciousLocations.map((location) => (
                <div key={location.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {location.locationName}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(location.riskLevel)}`}>
                          {location.riskLevel.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {location.isActive ? 'BLOCKED' : 'UNBLOCKED'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <p><strong>Address:</strong> {location.address}</p>
                        <p><strong>Reason:</strong> {location.reason}</p>
                        <p><strong>Blocked by:</strong> {location.blockedBy} on {new Date(location.blockedDate).toLocaleDateString()}</p>
                        <p><strong>Incidents:</strong> {location.incidentCount} {location.lastIncident && `(Last: ${new Date(location.lastIncident).toLocaleDateString()})`}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => toggleSuspiciousLocation(location.id)}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                          location.isActive 
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
                        {location.isActive ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <NoSymbolIcon className="w-4 h-4 mr-1" />
                            Block
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Withdrawal Patterns Analysis
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawalPatterns.map((pattern) => (
                <div key={pattern.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {pattern.userName}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pattern.patternType === 'large_amounts' ? 'bg-orange-100 text-orange-800' :
                          pattern.patternType === 'unusual_timing' ? 'bg-red-100 text-red-800' :
                          pattern.patternType === 'multiple_locations' ? 'bg-purple-100 text-purple-800' :
                          pattern.patternType === 'rapid_succession' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {pattern.patternType.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pattern.riskScore)}`}>
                          Risk: {pattern.riskScore}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pattern.status === 'flagged' ? 'bg-red-100 text-red-800' :
                          pattern.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                          pattern.status === 'investigated' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pattern.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <p><strong>Description:</strong> {pattern.description}</p>
                        <p><strong>Frequency:</strong> {pattern.frequency} transactions</p>
                        <p><strong>Total Amount:</strong> BDT {pattern.totalAmount.toLocaleString()}</p>
                        <p><strong>Locations:</strong> {pattern.locations.join(', ')}</p>
                        <p><strong>Time Pattern:</strong> {pattern.timePattern}</p>
                        <p><strong>Detected:</strong> {new Date(pattern.detectedDate).toLocaleDateString()}</p>
                      </div>
                      {pattern.notes && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          <strong>Notes:</strong> {pattern.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {pattern.status === 'monitoring' && (
                        <button
                          onClick={() => {
                            const notes = prompt('Enter investigation notes:');
                            updatePatternStatus(pattern.id, 'flagged', notes || undefined);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Flag
                        </button>
                      )}
                      {pattern.status === 'flagged' && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter investigation notes:');
                              updatePatternStatus(pattern.id, 'investigated', notes || undefined);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Investigate
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter clearance notes:');
                              updatePatternStatus(pattern.id, 'cleared', notes || undefined);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Clear
                          </button>
                        </>
                      )}
                      {pattern.status === 'investigated' && (
                        <button
                          onClick={() => {
                            const notes = prompt('Enter clearance notes:');
                            updatePatternStatus(pattern.id, 'cleared', notes || undefined);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BanknotesIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Withdrawals Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        BDT 2,450,000
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Pending Approvals
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {withdrawals.filter(w => w.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Withdrawal Details Modal
                      </dt>
                      {selectedWithdrawal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  Withdrawal Details - {selectedWithdrawal.transactionId}
                                </h3>
                                <button
                                  onClick={() => setSelectedWithdrawal(null)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <XCircleIcon className="h-6 w-6" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">User Information</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                      <p><strong>Name:</strong> {selectedWithdrawal.user.name}</p>
                                      <p><strong>Account:</strong> {selectedWithdrawal.user.account}</p>
                                      <p><strong>Email:</strong> {selectedWithdrawal.user.email}</p>
                                      <p><strong>Phone:</strong> {selectedWithdrawal.user.phone}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Transaction Details</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                      <p><strong>Amount:</strong> {selectedWithdrawal.currency} {selectedWithdrawal.amount.toLocaleString()}</p>
                                      <p><strong>Fees:</strong> {selectedWithdrawal.currency} {selectedWithdrawal.fees}</p>
                                      <p><strong>Method:</strong> {selectedWithdrawal.withdrawalMethod}</p>
                                      <p><strong>Reference:</strong> {selectedWithdrawal.reference}</p>
                                      <p><strong>Status:</strong> {selectedWithdrawal.status}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Location Information</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                      <p><strong>Location:</strong> {selectedWithdrawal.location.name}</p>
                                      <p><strong>Address:</strong> {selectedWithdrawal.location.address}</p>
                                      <p><strong>City:</strong> {selectedWithdrawal.location.city}</p>
                                      <p><strong>Area:</strong> {selectedWithdrawal.location.area}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Risk Assessment</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                      <p><strong>Risk Score:</strong> {selectedWithdrawal.riskScore}/100</p>
                                      <p><strong>Risk Factors:</strong></p>
                                      <ul className="list-disc list-inside mt-1">
                                        {selectedWithdrawal.riskFactors.map((factor, index) => (
                                          <li key={index} className="text-sm">{factor}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {selectedWithdrawal.agentInfo && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Agent Information</h4>
                                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <p><strong>Agent ID:</strong> {selectedWithdrawal.agentInfo.agentId}</p>
                                    <p><strong>Agent Name:</strong> {selectedWithdrawal.agentInfo.agentName}</p>
                                    <p><strong>Agent Phone:</strong> {selectedWithdrawal.agentInfo.agentPhone}</p>
                                    <p><strong>Commission:</strong> BDT {selectedWithdrawal.agentInfo.commission}</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedWithdrawal.atmInfo && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">ATM Information</h4>
                                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <p><strong>ATM ID:</strong> {selectedWithdrawal.atmInfo.atmId}</p>
                                    <p><strong>Bank Name:</strong> {selectedWithdrawal.atmInfo.bankName}</p>
                                    <p><strong>ATM Location:</strong> {selectedWithdrawal.atmInfo.atmLocation}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-6 flex justify-end space-x-3">
                                <button
                                  onClick={() => setSelectedWithdrawal(null)}
                                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                  Close
                                </button>
                                {selectedWithdrawal.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleWithdrawalAction(selectedWithdrawal.id, 'approve');
                                        setSelectedWithdrawal(null);
                                      }}
                                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) {
                                          handleWithdrawalAction(selectedWithdrawal.id, 'reject', reason);
                                          setSelectedWithdrawal(null);
                                        }
                                      }}
                                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Blocked Locations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {suspiciousLocations.filter(l => l.isActive).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashWithdrawalManagement;