import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Search,
  Filter,
  Navigation,
  Phone,
  Clock,
  Car,
  Wifi,
  CreditCard,
  DollarSign,
  Building,
  Users,
  Shield,
  Zap,
  Coffee,
  Accessibility,
  Baby,
  Star,
  Route,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Map,
  List,
  Grid,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Settings,
  HelpCircle,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Target,
  Compass,
  Locate,
  MapPinIcon
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'branch' | 'atm' | 'agent';
  address: string;
  area: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    holidays: string;
  };
  services: string[];
  facilities: string[];
  distance?: number;
  rating: number;
  reviews: number;
  image?: string;
  isOpen: boolean;
  nextOpenTime?: string;
  specialNotes?: string;
}

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Facility {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const LocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedType, setSelectedType] = useState<'all' | 'branch' | 'atm' | 'agent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock locations data
  const locations: Location[] = [
    {
      id: 'branch-001',
      name: 'IB Bank - Gulshan Branch',
      type: 'branch',
      address: 'Plot 32, Road 11, Block J, Gulshan 2',
      area: 'Gulshan',
      city: 'Dhaka',
      coordinates: { lat: 23.7925, lng: 90.4078 },
      phone: '+880-2-8833221',
      email: 'gulshan@ibbank.com.bd',
      hours: {
        weekdays: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed',
        holidays: 'Closed'
      },
      services: ['account-opening', 'loans', 'foreign-exchange', 'investment', 'safe-deposit'],
      facilities: ['parking', 'wifi', 'wheelchair', 'coffee', 'waiting-area'],
      rating: 4.5,
      reviews: 128,
      isOpen: true,
      distance: 2.3
    },
    {
      id: 'atm-001',
      name: 'IB Bank ATM - Dhanmondi 27',
      type: 'atm',
      address: 'House 45, Road 27, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      coordinates: { lat: 23.7461, lng: 90.3742 },
      hours: {
        weekdays: '24/7',
        saturday: '24/7',
        sunday: '24/7',
        holidays: '24/7'
      },
      services: ['cash-withdrawal', 'balance-inquiry', 'mini-statement', 'pin-change'],
      facilities: ['security-guard', 'cctv', 'lighting'],
      rating: 4.2,
      reviews: 45,
      isOpen: true,
      distance: 1.8
    },
    {
      id: 'branch-002',
      name: 'IB Bank - Motijheel Branch',
      type: 'branch',
      address: '15 Motijheel Commercial Area',
      area: 'Motijheel',
      city: 'Dhaka',
      coordinates: { lat: 23.7330, lng: 90.4172 },
      phone: '+880-2-9551234',
      email: 'motijheel@ibbank.com.bd',
      hours: {
        weekdays: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed',
        holidays: 'Closed'
      },
      services: ['account-opening', 'loans', 'foreign-exchange', 'investment', 'corporate-banking'],
      facilities: ['parking', 'wifi', 'wheelchair', 'waiting-area', 'customer-service'],
      rating: 4.3,
      reviews: 89,
      isOpen: true,
      distance: 3.1
    },
    {
      id: 'agent-001',
      name: 'IB Bank Agent - Mirpur 10',
      type: 'agent',
      address: 'Shop 25, Mirpur 10 Circle',
      area: 'Mirpur',
      city: 'Dhaka',
      coordinates: { lat: 23.8069, lng: 90.3688 },
      phone: '+880-1712345678',
      hours: {
        weekdays: '8:00 AM - 8:00 PM',
        saturday: '8:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM',
        holidays: '10:00 AM - 6:00 PM'
      },
      services: ['cash-in', 'cash-out', 'money-transfer', 'bill-payment', 'mobile-recharge'],
      facilities: ['parking', 'waiting-area'],
      rating: 4.0,
      reviews: 67,
      isOpen: true,
      distance: 4.2
    },
    {
      id: 'atm-002',
      name: 'IB Bank ATM - Uttara Sector 7',
      type: 'atm',
      address: 'House 12, Road 15, Sector 7, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      coordinates: { lat: 23.8759, lng: 90.3795 },
      hours: {
        weekdays: '24/7',
        saturday: '24/7',
        sunday: '24/7',
        holidays: '24/7'
      },
      services: ['cash-withdrawal', 'balance-inquiry', 'mini-statement', 'pin-change', 'fund-transfer'],
      facilities: ['security-guard', 'cctv', 'lighting', 'parking'],
      rating: 4.4,
      reviews: 32,
      isOpen: true,
      distance: 5.7
    },
    {
      id: 'branch-003',
      name: 'IB Bank - Chittagong Branch',
      type: 'branch',
      address: '123 Agrabad Commercial Area',
      area: 'Agrabad',
      city: 'Chittagong',
      coordinates: { lat: 22.3569, lng: 91.7832 },
      phone: '+880-31-2555123',
      email: 'chittagong@ibbank.com.bd',
      hours: {
        weekdays: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed',
        holidays: 'Closed'
      },
      services: ['account-opening', 'loans', 'foreign-exchange', 'investment', 'trade-finance'],
      facilities: ['parking', 'wifi', 'wheelchair', 'coffee', 'waiting-area', 'customer-service'],
      rating: 4.6,
      reviews: 156,
      isOpen: false,
      nextOpenTime: 'Tomorrow at 9:00 AM',
      distance: 245.8
    }
  ];

  // Services data
  const services: Service[] = [
    { id: 'account-opening', name: 'Account Opening', icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'loans', name: 'Loans', icon: <DollarSign className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'foreign-exchange', name: 'Foreign Exchange', icon: <Globe className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'investment', name: 'Investment', icon: <Star className="w-4 h-4" />, color: 'text-yellow-400' },
    { id: 'safe-deposit', name: 'Safe Deposit', icon: <Shield className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'corporate-banking', name: 'Corporate Banking', icon: <Building className="w-4 h-4" />, color: 'text-indigo-400' },
    { id: 'trade-finance', name: 'Trade Finance', icon: <ExternalLink className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'cash-withdrawal', name: 'Cash Withdrawal', icon: <CreditCard className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'balance-inquiry', name: 'Balance Inquiry', icon: <Eye className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'mini-statement', name: 'Mini Statement', icon: <List className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'pin-change', name: 'PIN Change', icon: <Settings className="w-4 h-4" />, color: 'text-yellow-400' },
    { id: 'fund-transfer', name: 'Fund Transfer', icon: <Route className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'cash-in', name: 'Cash In', icon: <Plus className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'cash-out', name: 'Cash Out', icon: <Minus className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'money-transfer', name: 'Money Transfer', icon: <Route className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'bill-payment', name: 'Bill Payment', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
    { id: 'mobile-recharge', name: 'Mobile Recharge', icon: <Smartphone className="w-4 h-4" />, color: 'text-purple-400' }
  ];

  // Facilities data
  const facilities: Facility[] = [
    { id: 'parking', name: 'Parking', icon: <Car className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'wifi', name: 'Free WiFi', icon: <Wifi className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'wheelchair', name: 'Wheelchair Access', icon: <Accessibility className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'coffee', name: 'Coffee/Tea', icon: <Coffee className="w-4 h-4" />, color: 'text-yellow-400' },
    { id: 'waiting-area', name: 'Waiting Area', icon: <Users className="w-4 h-4" />, color: 'text-indigo-400' },
    { id: 'customer-service', name: 'Customer Service', icon: <HelpCircle className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'security-guard', name: 'Security Guard', icon: <Shield className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'cctv', name: 'CCTV', icon: <Eye className="w-4 h-4" />, color: 'text-orange-400' },
    { id: 'lighting', name: 'Good Lighting', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
    { id: 'baby-care', name: 'Baby Care', icon: <Baby className="w-4 h-4" />, color: 'text-pink-400' }
  ];

  const areas = ['all', 'Gulshan', 'Dhanmondi', 'Motijheel', 'Mirpur', 'Uttara', 'Agrabad'];

  // Get user location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter and sort locations
  const filteredLocations = locations.filter(location => {
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'all' || location.area === selectedArea;
    const matchesServices = selectedServices.length === 0 || 
                           selectedServices.every(service => location.services.includes(service));
    const matchesFacilities = selectedFacilities.length === 0 || 
                             selectedFacilities.every(facility => location.facilities.includes(facility));
    
    return matchesType && matchesSearch && matchesArea && matchesServices && matchesFacilities;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const toggleFavorite = (locationId: string) => {
    setFavorites(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const getDirections = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
  };

  const shareLocation = (location: Location) => {
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `Check out ${location.name} at ${location.address}`,
        url: window.location.href
      });
    } else {
      copyAddress(`${location.name} - ${location.address}`);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

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
            <h1 className="text-2xl font-bold">Branch & ATM Locator</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center"
            >
              {isLoadingLocation ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Locate className="w-4 h-4 mr-2" />
              )}
              My Location
            </button>
            
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center ${
                  viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center ${
                  viewMode === 'map' ? 'bg-blue-600' : 'hover:bg-white/10'
                }`}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, address, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all" className="bg-gray-800">All Types</option>
              <option value="branch" className="bg-gray-800">Branches</option>
              <option value="atm" className="bg-gray-800">ATMs</option>
              <option value="agent" className="bg-gray-800">Agents</option>
            </select>
            
            {/* Area Filter */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {areas.map(area => (
                <option key={area} value={area} className="bg-gray-800">
                  {area === 'all' ? 'All Areas' : area}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="distance" className="bg-gray-800">Sort by Distance</option>
              <option value="name" className="bg-gray-800">Sort by Name</option>
              <option value="rating" className="bg-gray-800">Sort by Rating</option>
            </select>
            
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-600 pt-4 space-y-4">
              {/* Services Filter */}
              <div>
                <h3 className="font-medium mb-3">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedServices(prev =>
                          prev.includes(service.id)
                            ? prev.filter(id => id !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                        selectedServices.includes(service.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className={service.color}>{service.icon}</span>
                      <span className="ml-2">{service.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facilities Filter */}
              <div>
                <h3 className="font-medium mb-3">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {facilities.map(facility => (
                    <button
                      key={facility.id}
                      onClick={() => {
                        setSelectedFacilities(prev =>
                          prev.includes(facility.id)
                            ? prev.filter(id => id !== facility.id)
                            : [...prev, facility.id]
                        );
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                        selectedFacilities.includes(facility.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className={facility.color}>{facility.icon}</span>
                      <span className="ml-2">{facility.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Found {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            {selectedType !== 'all' && ` (${selectedType}s)`}
            {selectedArea !== 'all' && ` in ${selectedArea}`}
          </p>
          
          {userLocation && (
            <p className="text-sm text-green-400 flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Location services enabled
            </p>
          )}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <div className="h-96 bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-2">Interactive Map View</p>
                <p className="text-sm text-gray-500">Map integration would be implemented here</p>
                <p className="text-sm text-gray-500">Showing {filteredLocations.length} locations</p>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      location.type === 'branch' ? 'bg-blue-600' :
                      location.type === 'atm' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                      {location.type === 'branch' ? <Building className="w-5 h-5" /> :
                       location.type === 'atm' ? <CreditCard className="w-5 h-5" /> :
                       <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(location.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-400">
                            {location.rating} ({location.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(location.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.includes(location.id) ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(location.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => shareLocation(location)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center mb-3">
                  <div className={`w-2 h-2 rounded-full mr-2 ${location.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-sm font-medium ${location.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                    {location.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                  {!location.isOpen && location.nextOpenTime && (
                    <span className="text-sm text-gray-400 ml-2">• {location.nextOpenTime}</span>
                  )}
                </div>

                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm">{location.address}</p>
                      <p className="text-sm text-gray-400">{location.area}, {location.city}</p>
                    </div>
                  </div>
                  
                  {location.distance && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Navigation className="w-4 h-4 mr-1" />
                      {location.distance.toFixed(1)} km away
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {(location.phone || location.email) && (
                  <div className="mb-4 space-y-1">
                    {location.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-green-400" />
                        <a href={`tel:${location.phone}`} className="hover:text-blue-400 transition-colors">
                          {location.phone}
                        </a>
                      </div>
                    )}
                    {location.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-purple-400" />
                        <a href={`mailto:${location.email}`} className="hover:text-blue-400 transition-colors">
                          {location.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Hours */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                    <span className="text-sm font-medium">Hours</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Mon-Fri:</span>
                      <span>{location.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>{location.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>{location.hours.sunday}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-blue-400" />
                    Services
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {location.services.slice(0, 4).map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <span
                          key={serviceId}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs flex items-center"
                        >
                          {service.icon}
                          <span className="ml-1">{service.name}</span>
                        </span>
                      ) : null;
                    })}
                    {location.services.length > 4 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                        +{location.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Facilities */}
                {location.facilities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-green-400" />
                      Facilities
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {location.facilities.slice(0, 3).map(facilityId => {
                        const facility = facilities.find(f => f.id === facilityId);
                        return facility ? (
                          <span
                            key={facilityId}
                            className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs flex items-center"
                          >
                            {facility.icon}
                            <span className="ml-1">{facility.name}</span>
                          </span>
                        ) : null;
                      })}
                      {location.facilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                          +{location.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Notes */}
                {location.specialNotes && (
                  <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 mr-2 text-yellow-400 mt-0.5" />
                      <p className="text-sm text-yellow-400">{location.specialNotes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => getDirections(location)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </button>
                  <button
                    onClick={() => copyAddress(location.address)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedLocation(location)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredLocations.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No locations found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search criteria or filters to find more locations.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedArea('all');
                setSelectedServices([]);
                setSelectedFacilities([]);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Location Details Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{selectedLocation.name}</h3>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedLocation.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={`font-medium ${selectedLocation.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedLocation.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                    {!selectedLocation.isOpen && selectedLocation.nextOpenTime && (
                      <span className="text-gray-400 ml-2">• {selectedLocation.nextOpenTime}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedLocation.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">
                      {selectedLocation.rating} ({selectedLocation.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Address and Contact */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                      Address
                    </h4>
                    <p className="text-gray-300 mb-2">{selectedLocation.address}</p>
                    <p className="text-gray-400">{selectedLocation.area}, {selectedLocation.city}</p>
                    {selectedLocation.distance && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center">
                        <Navigation className="w-4 h-4 mr-1" />
                        {selectedLocation.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-green-400" />
                      Contact
                    </h4>
                    {selectedLocation.phone && (
                      <p className="text-gray-300 mb-2">
                        <a href={`tel:${selectedLocation.phone}`} className="hover:text-blue-400 transition-colors">
                          {selectedLocation.phone}
                        </a>
                      </p>
                    )}
                    {selectedLocation.email && (
                      <p className="text-gray-300">
                        <a href={`mailto:${selectedLocation.email}`} className="hover:text-blue-400 transition-colors">
                          {selectedLocation.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                    Operating Hours
                  </h4>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monday - Friday:</span>
                        <span>{selectedLocation.hours.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Saturday:</span>
                        <span>{selectedLocation.hours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sunday:</span>
                        <span>{selectedLocation.hours.sunday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Holidays:</span>
                        <span>{selectedLocation.hours.holidays}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-400" />
                    Available Services
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {selectedLocation.services.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <div
                          key={serviceId}
                          className="flex items-center p-3 bg-white/10 rounded-lg"
                        >
                          <span className={service.color}>{service.icon}</span>
                          <span className="ml-3">{service.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Facilities */}
                {selectedLocation.facilities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      Facilities
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedLocation.facilities.map(facilityId => {
                        const facility = facilities.find(f => f.id === facilityId);
                        return facility ? (
                          <div
                            key={facilityId}
                            className="flex items-center p-3 bg-white/10 rounded-lg"
                          >
                            <span className={facility.color}>{facility.icon}</span>
                            <span className="ml-3">{facility.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => getDirections(selectedLocation)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => copyAddress(selectedLocation.address)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Address
                  </button>
                  <button
                    onClick={() => shareLocation(selectedLocation)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPage;