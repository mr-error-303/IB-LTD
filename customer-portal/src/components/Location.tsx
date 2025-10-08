import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Search, Filter, Map, List } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  distance: number;
  coordinates: { lat: number; lng: number };
  type: 'branch' | 'atm';
}

const Location: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'branch' | 'atm'>('all');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for branches and ATMs
  const locations: Branch[] = [
    {
      id: '1',
      name: 'IB LTD Main Branch',
      address: '123 Main Street, Dhaka-1000, Bangladesh',
      phone: '+880-2-9876543',
      hours: '9:00 AM - 5:00 PM (Mon-Fri)',
      services: ['Account Opening', 'Loans', 'Foreign Exchange', 'Safe Deposit'],
      distance: 0.5,
      coordinates: { lat: 23.8103, lng: 90.4125 },
      type: 'branch'
    },
    {
      id: '2',
      name: 'Gulshan Branch',
      address: '456 Gulshan Avenue, Dhaka-1212, Bangladesh',
      phone: '+880-2-8765432',
      hours: '9:00 AM - 5:00 PM (Mon-Fri)',
      services: ['Account Opening', 'Loans', 'Investment Advisory', 'Premium Banking'],
      distance: 2.3,
      coordinates: { lat: 23.7808, lng: 90.4176 },
      type: 'branch'
    },
    {
      id: '3',
      name: 'Dhanmondi ATM',
      address: '789 Dhanmondi Road, Dhaka-1205, Bangladesh',
      phone: 'N/A',
      hours: '24/7',
      services: ['Cash Withdrawal', 'Balance Inquiry', 'Mini Statement'],
      distance: 1.2,
      coordinates: { lat: 23.7461, lng: 90.3742 },
      type: 'atm'
    },
    {
      id: '4',
      name: 'Uttara Branch',
      address: '321 Uttara Sector 7, Dhaka-1230, Bangladesh',
      phone: '+880-2-7654321',
      hours: '9:00 AM - 5:00 PM (Mon-Fri)',
      services: ['Account Opening', 'Loans', 'SME Banking', 'Digital Banking'],
      distance: 8.7,
      coordinates: { lat: 23.8759, lng: 90.3795 },
      type: 'branch'
    },
    {
      id: '5',
      name: 'Banani ATM',
      address: '654 Banani Commercial Area, Dhaka-1213, Bangladesh',
      phone: 'N/A',
      hours: '24/7',
      services: ['Cash Withdrawal', 'Balance Inquiry', 'Fund Transfer'],
      distance: 3.1,
      coordinates: { lat: 23.7936, lng: 90.4066 },
      type: 'atm'
    },
    {
      id: '6',
      name: 'Motijheel Branch',
      address: '987 Motijheel Commercial Area, Dhaka-1000, Bangladesh',
      phone: '+880-2-6543210',
      hours: '9:00 AM - 5:00 PM (Mon-Fri)',
      services: ['Corporate Banking', 'Trade Finance', 'Treasury Services'],
      distance: 4.5,
      coordinates: { lat: 23.7330, lng: 90.4172 },
      type: 'branch'
    }
  ];

  const [filteredLocations, setFilteredLocations] = useState<Branch[]>(locations);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to Dhaka center
          setUserLocation({ lat: 23.8103, lng: 90.4125 });
        }
      );
    }
  }, []);

  useEffect(() => {
    let filtered = locations;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(location => location.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredLocations(filtered);
  }, [selectedFilter, searchQuery]);

  const handleGetDirections = (location: Branch) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    if (phone !== 'N/A') {
      window.open(`tel:${phone}`);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        
        // Reverse geocoding to get address (placeholder implementation)
        console.log('Location obtained:', latitude, longitude);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl mr-4 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Branch & ATM Locator</h1>
              <p className="text-gray-600">Find the nearest IB LTD branches and ATMs</p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by branch name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'branch' | 'atm')}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  <option value="branch">Branches Only</option>
                  <option value="atm">ATMs Only</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Location List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''} Found
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedBranch?.id === location.id
                        ? 'bg-red-50 border-red-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBranch(location)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className={`p-2 rounded-lg mr-3 ${
                            location.type === 'branch'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{location.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              location.type === 'branch'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {location.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Navigation className="w-4 h-4 mr-1" />
                          {location.distance} km away
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map/Details View */}
          <div className="lg:col-span-2">
            {viewMode === 'map' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Map</h3>
                    <p className="text-gray-500">Map integration would be implemented here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      This would show all {filteredLocations.length} locations on an interactive map
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl mr-4 ${
                          location.type === 'branch'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                        }`}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{location.name}</h3>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            location.type === 'branch'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {location.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Navigation className="w-4 h-4 mr-1" />
                          {location.distance} km away
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                        <p className="text-gray-600 mb-2">{location.address}</p>
                        {location.phone !== 'N/A' && (
                          <div className="flex items-center text-gray-600 mb-2">
                            <Phone className="w-4 h-4 mr-2" />
                            {location.phone}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {location.hours}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Services Available</h4>
                        <div className="flex flex-wrap gap-2">
                          {location.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => handleGetDirections(location)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center"
                      >
                        <Navigation className="w-5 h-5 mr-2" />
                        Get Directions
                      </button>
                      {location.phone !== 'N/A' && (
                        <button
                          onClick={() => handleCall(location.phone)}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl w-fit mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {locations.filter(l => l.type === 'branch').length}
            </h3>
            <p className="text-gray-600">Total Branches</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl w-fit mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {locations.filter(l => l.type === 'atm').length}
            </h3>
            <p className="text-gray-600">ATM Locations</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl w-fit mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
            <p className="text-gray-600">ATM Availability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;