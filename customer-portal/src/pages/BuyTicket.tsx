import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ticket, 
  Bus, 
  Train, 
  Plane, 
  Film, 
  Music, 
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';

const BuyTicket: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ticketCategories = [
    {
      id: 'bus',
      name: 'Bus Tickets',
      icon: Bus,
      color: 'bg-green-500',
      providers: [
        { id: 'green-line', name: 'Green Line', color: 'bg-green-600' },
        { id: 'shohagh', name: 'Shohagh', color: 'bg-blue-600' },
        { id: 'hanif', name: 'Hanif', color: 'bg-red-600' }
      ]
    },
    {
      id: 'train',
      name: 'Train Tickets',
      icon: Train,
      color: 'bg-blue-500',
      providers: [
        { id: 'bangladesh-railway', name: 'Bangladesh Railway', color: 'bg-blue-700' }
      ]
    },
    {
      id: 'air',
      name: 'Air Tickets',
      icon: Plane,
      color: 'bg-sky-500',
      providers: [
        { id: 'biman', name: 'Biman Bangladesh', color: 'bg-red-700' },
        { id: 'us-bangla', name: 'US Bangla Airlines', color: 'bg-orange-600' },
        { id: 'novo-air', name: 'Novo Air', color: 'bg-purple-600' }
      ]
    },
    {
      id: 'movie',
      name: 'Movie Tickets',
      icon: Film,
      color: 'bg-purple-500',
      providers: [
        { id: 'blockbuster', name: 'Blockbuster Cinemas', color: 'bg-red-600' },
        { id: 'star-cineplex', name: 'Star Cineplex', color: 'bg-yellow-600' }
      ]
    },
    {
      id: 'event',
      name: 'Event Tickets',
      icon: Music,
      color: 'bg-pink-500',
      providers: [
        { id: 'concert', name: 'Concert Tickets', color: 'bg-pink-600' },
        { id: 'sports', name: 'Sports Events', color: 'bg-green-700' }
      ]
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProvider('');
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleBookTicket = () => {
    if (!selectedCategory || !selectedProvider) {
      alert('Please select a category and provider');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowStatusPopup(true);
    }, 2000);
  };

  const renderStatusPopup = () => {
    const handleTrackingClick = () => {
      setShowStatusPopup(false);
      // Navigate to tracking page
      window.location.href = '/ticket-booking-tracking';
    };

    const categoryName = ticketCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory;
    const providerName = ticketCategories
      .find(cat => cat.id === selectedCategory)
      ?.providers.find(provider => provider.id === selectedProvider)?.name || selectedProvider;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Booking Submitted
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">In Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference ID:</span>
                <span className="font-medium">TKT{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-medium">1-2 business days</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your ticket booking request has been submitted and is currently under review. 
              You will be notified once the booking is confirmed.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTrackingClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Track Booking
              </button>
              <button
                onClick={() => setShowStatusPopup(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedCategoryData = ticketCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Ticket size={20} />
            </div>
            <h1 className="text-xl font-semibold">Buy Ticket</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Select Category */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Ticket size={20} className="text-pink-600" />
            Select Ticket Category
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {ticketCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Select Provider */}
        {selectedCategory && selectedCategoryData && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Select Provider</h2>
            <div className="grid grid-cols-1 gap-3">
              {selectedCategoryData.providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedProvider === provider.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${provider.color} rounded-full`}></div>
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Ticket Button */}
        {selectedCategory && selectedProvider && (
          <button
            onClick={handleBookTicket}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Book Ticket'}
          </button>
        )}
      </div>

      {/* Status Popup */}
      {showStatusPopup && renderStatusPopup()}
    </div>
  );
};

export default BuyTicket;