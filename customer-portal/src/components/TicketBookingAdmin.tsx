import React, { useState } from 'react';
import { 
  Ticket, 
  Users, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  Plane,
  Train,
  Bus,
  Building,
  Percent,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

// Interfaces
interface TicketBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookingType: 'flight' | 'train' | 'bus' | 'hotel';
  serviceProvider: string;
  bookingReference: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  totalAmount: number;
  commission: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded';
  bookingDate: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface RefundRequest {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  bookingReference: string;
  originalAmount: number;
  refundAmount: number;
  refundReason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processingFee: number;
  merchantPolicy: string;
}

interface MerchantPartner {
  id: string;
  name: string;
  type: 'airline' | 'railway' | 'bus' | 'hotel';
  logo: string;
  status: 'active' | 'inactive' | 'suspended';
  commissionRate: number;
  totalBookings: number;
  totalRevenue: number;
  lastTransaction: string;
  contactEmail: string;
  contractExpiry: string;
  apiStatus: 'connected' | 'disconnected' | 'error';
}

interface CommissionSetting {
  id: string;
  serviceType: string;
  merchantId: string;
  merchantName: string;
  baseCommission: number;
  tieredRates: {
    threshold: number;
    rate: number;
  }[];
  bonusIncentives: {
    condition: string;
    bonus: number;
  }[];
  effectiveDate: string;
  status: 'active' | 'inactive';
}

// Mock Data
const mockBookings: TicketBooking[] = [
  {
    id: 'BK001',
    userId: 'USR001',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    bookingType: 'flight',
    serviceProvider: 'Emirates Airlines',
    bookingReference: 'EK123456',
    destination: 'Dubai - London',
    departureDate: '2024-02-15',
    returnDate: '2024-02-22',
    passengers: 2,
    totalAmount: 2500,
    commission: 125,
    status: 'confirmed',
    bookingDate: '2024-01-15T10:30:00Z',
    paymentStatus: 'paid'
  },
  {
    id: 'BK002',
    userId: 'USR002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@email.com',
    bookingType: 'train',
    serviceProvider: 'Eurostar',
    bookingReference: 'ES789012',
    destination: 'London - Paris',
    departureDate: '2024-01-20',
    passengers: 1,
    totalAmount: 350,
    commission: 21,
    status: 'confirmed',
    bookingDate: '2024-01-14T15:45:00Z',
    paymentStatus: 'paid'
  },
  {
    id: 'BK003',
    userId: 'USR003',
    userName: 'Michael Brown',
    userEmail: 'michael.b@email.com',
    bookingType: 'hotel',
    serviceProvider: 'Hilton Hotels',
    bookingReference: 'HT345678',
    destination: 'New York',
    departureDate: '2024-02-01',
    returnDate: '2024-02-05',
    passengers: 2,
    totalAmount: 1200,
    commission: 96,
    status: 'pending',
    bookingDate: '2024-01-15T09:20:00Z',
    paymentStatus: 'pending'
  }
];

const mockRefundRequests: RefundRequest[] = [
  {
    id: 'REF001',
    bookingId: 'BK001',
    userId: 'USR001',
    userName: 'John Smith',
    bookingReference: 'EK123456',
    originalAmount: 2500,
    refundAmount: 2250,
    refundReason: 'Flight cancelled by airline',
    requestDate: '2024-01-16T14:30:00Z',
    status: 'pending',
    processingFee: 50,
    merchantPolicy: 'Full refund minus processing fee'
  },
  {
    id: 'REF002',
    bookingId: 'BK002',
    userId: 'USR004',
    userName: 'Lisa Anderson',
    bookingReference: 'ES456789',
    originalAmount: 450,
    refundAmount: 315,
    refundReason: 'Personal emergency',
    requestDate: '2024-01-15T11:15:00Z',
    status: 'approved',
    processingFee: 25,
    merchantPolicy: '70% refund for cancellation 48h+ before departure'
  }
];

const mockMerchants: MerchantPartner[] = [
  {
    id: 'MER001',
    name: 'Emirates Airlines',
    type: 'airline',
    logo: '/api/placeholder/40/40',
    status: 'active',
    commissionRate: 5.0,
    totalBookings: 1250,
    totalRevenue: 2850000,
    lastTransaction: '2024-01-15T16:30:00Z',
    contactEmail: 'partners@emirates.com',
    contractExpiry: '2024-12-31',
    apiStatus: 'connected'
  },
  {
    id: 'MER002',
    name: 'Eurostar',
    type: 'railway',
    logo: '/api/placeholder/40/40',
    status: 'active',
    commissionRate: 6.0,
    totalBookings: 890,
    totalRevenue: 445000,
    lastTransaction: '2024-01-15T14:20:00Z',
    contactEmail: 'business@eurostar.com',
    contractExpiry: '2025-06-30',
    apiStatus: 'connected'
  },
  {
    id: 'MER003',
    name: 'Hilton Hotels',
    type: 'hotel',
    logo: '/api/placeholder/40/40',
    status: 'active',
    commissionRate: 8.0,
    totalBookings: 2100,
    totalRevenue: 1680000,
    lastTransaction: '2024-01-15T12:45:00Z',
    contactEmail: 'partnerships@hilton.com',
    contractExpiry: '2024-09-15',
    apiStatus: 'error'
  }
];

const mockCommissionSettings: CommissionSetting[] = [
  {
    id: 'COM001',
    serviceType: 'Flight',
    merchantId: 'MER001',
    merchantName: 'Emirates Airlines',
    baseCommission: 5.0,
    tieredRates: [
      { threshold: 10000, rate: 5.5 },
      { threshold: 50000, rate: 6.0 },
      { threshold: 100000, rate: 6.5 }
    ],
    bonusIncentives: [
      { condition: 'Monthly volume > $100k', bonus: 0.5 },
      { condition: 'Customer satisfaction > 95%', bonus: 0.25 }
    ],
    effectiveDate: '2024-01-01',
    status: 'active'
  },
  {
    id: 'COM002',
    serviceType: 'Train',
    merchantId: 'MER002',
    merchantName: 'Eurostar',
    baseCommission: 6.0,
    tieredRates: [
      { threshold: 5000, rate: 6.5 },
      { threshold: 25000, rate: 7.0 }
    ],
    bonusIncentives: [
      { condition: 'Peak season bookings', bonus: 1.0 }
    ],
    effectiveDate: '2024-01-01',
    status: 'active'
  }
];

const TicketBookingAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState<TicketBooking | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantPartner | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefundAction = (refundId: string, action: 'approve' | 'reject') => {
    console.log(`${action} refund:`, refundId);
    setShowRefundModal(false);
    setSelectedRefund(null);
  };

  const handleMerchantStatusChange = (merchantId: string, status: string) => {
    console.log('Change merchant status:', merchantId, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'approved': case 'active': case 'connected': case 'paid': case 'processed': 
        return 'text-green-600 bg-green-100';
      case 'cancelled': case 'rejected': case 'inactive': case 'suspended': case 'disconnected': 
        return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'refunded': case 'error': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'hotel': return <Building className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || booking.bookingType === filterType;
    const matchesSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Booking Service Administration</h1>
        <p className="text-gray-600">Manage bookings, refunds, merchant partners, and commission settings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600">4,235</p>
            </div>
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-green-600">$28,450</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Refunds</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <RefreshCw className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold text-purple-600">$1,425</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'bookings', name: 'All Bookings', icon: Ticket },
              { id: 'refunds', name: 'Refund Management', icon: RefreshCw },
              { id: 'merchants', name: 'Merchant Partners', icon: Users },
              { id: 'commissions', name: 'Commission Settings', icon: Percent }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* All Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by user, reference, or destination..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="flight">Flights</option>
                  <option value="train">Trains</option>
                  <option value="bus">Buses</option>
                  <option value="hotel">Hotels</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getBookingTypeIcon(booking.bookingType)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.bookingReference}</div>
                              <div className="text-sm text-gray-500">{booking.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                            <div className="text-sm text-gray-500">{booking.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.serviceProvider}</div>
                            <div className="text-sm text-gray-500 capitalize">{booking.bookingType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{booking.destination}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(booking.departureDate).toLocaleDateString()}</span>
                              {booking.returnDate && (
                                <>
                                  <span>-</span>
                                  <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{booking.passengers} passenger(s)</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">${booking.totalAmount.toLocaleString()}</div>
                            <div className="text-sm text-green-600">Commission: ${booking.commission}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Refund Management Tab */}
          {activeTab === 'refunds' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Refund Requests</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Process All Approved
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockRefundRequests.map((refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{refund.id}</div>
                            <div className="text-sm text-gray-500">{new Date(refund.requestDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{refund.userName}</div>
                            <div className="text-sm text-gray-500">{refund.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {refund.bookingReference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Original: ${refund.originalAmount.toLocaleString()}</div>
                            <div className="text-sm text-green-600">Refund: ${refund.refundAmount.toLocaleString()}</div>
                            <div className="text-sm text-red-600">Fee: ${refund.processingFee}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{refund.refundReason}</div>
                          <div className="text-xs text-gray-500 mt-1">{refund.merchantPolicy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(refund.status)}`}>
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRefund(refund);
                              setShowRefundModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {refund.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRefundAction(refund.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRefundAction(refund.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Merchant Partners Tab */}
          {activeTab === 'merchants' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Merchant Partners</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add New Partner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMerchants.map((merchant) => (
                  <div key={merchant.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img src={merchant.logo} alt={merchant.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{merchant.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{merchant.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                        {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Commission Rate:</span>
                        <span className="text-sm font-medium text-green-600">{merchant.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Bookings:</span>
                        <span className="text-sm font-medium">{merchant.totalBookings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Revenue:</span>
                        <span className="text-sm font-medium">${merchant.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">API Status:</span>
                        <span className={`text-sm font-medium ${getStatusColor(merchant.apiStatus).split(' ')[0]}`}>
                          {merchant.apiStatus.charAt(0).toUpperCase() + merchant.apiStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Contract Expiry:</span>
                        <span className="text-sm font-medium">{new Date(merchant.contractExpiry).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setShowMerchantModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Manage
                      </button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commission Settings Tab */}
          {activeTab === 'commissions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Commission Structure</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add New Rate
                </button>
              </div>

              <div className="space-y-6">
                {mockCommissionSettings.map((setting) => (
                  <div key={setting.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{setting.serviceType} - {setting.merchantName}</h4>
                        <p className="text-sm text-gray-500">Effective from {new Date(setting.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(setting.status)}`}>
                        {setting.status.charAt(0).toUpperCase() + setting.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Base Commission</h5>
                        <p className="text-2xl font-bold text-green-600">{setting.baseCommission}%</p>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Tiered Rates</h5>
                        <div className="space-y-1">
                          {setting.tieredRates.map((tier, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              ${tier.threshold.toLocaleString()}+ → {tier.rate}%
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Bonus Incentives</h5>
                        <div className="space-y-1">
                          {setting.bonusIncentives.map((bonus, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {bonus.condition}: +{bonus.bonus}%
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals would go here - simplified for brevity */}
      {showRefundModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Refund Request Review</h3>
            <div className="space-y-3 mb-4">
              <p><strong>Customer:</strong> {selectedRefund.userName}</p>
              <p><strong>Booking:</strong> {selectedRefund.bookingReference}</p>
              <p><strong>Original Amount:</strong> ${selectedRefund.originalAmount.toLocaleString()}</p>
              <p><strong>Refund Amount:</strong> ${selectedRefund.refundAmount.toLocaleString()}</p>
              <p><strong>Processing Fee:</strong> ${selectedRefund.processingFee}</p>
              <p><strong>Reason:</strong> {selectedRefund.refundReason}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRefundAction(selectedRefund.id, 'approve')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleRefundAction(selectedRefund.id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketBookingAdmin;