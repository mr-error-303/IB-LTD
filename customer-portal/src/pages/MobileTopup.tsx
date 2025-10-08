import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Zap, Clock, CheckCircle } from 'lucide-react';

const MobileTopUp: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOperator, setSelectedOperator] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [connectionType, setConnectionType] = useState('prepaid');
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const operators = [
    { id: 'grameenphone', name: 'Grameenphone', color: 'bg-green-500' },
    { id: 'robi', name: 'Robi', color: 'bg-orange-500' },
    { id: 'banglalink', name: 'Banglalink', color: 'bg-green-600' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
    { id: 'teletalk', name: 'Teletalk', color: 'bg-blue-500' }
  ];

  const amounts = [
    '20', '50', '100', '200', '300', '500', '1000'
  ];

  const handleRecharge = () => {
    if (!selectedOperator || !mobileNumber || !selectedAmount) {
      alert('Please fill all required fields');
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
      window.location.href = '/mobile-topup-tracking';
    };

    const operatorName = operators.find(op => op.id === selectedOperator)?.name || selectedOperator;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Recharge Submitted
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">In Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference ID:</span>
                <span className="font-medium">RCH{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{selectedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile Number:</span>
                <span className="font-medium">{mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operator:</span>
                <span className="font-medium">{operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-medium">1-2 business days</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your recharge request has been submitted and is currently under review. 
              You will be notified once the recharge is processed.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTrackingClick}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Mobile Recharge Status Tracking
              </button>
              
              <button
                onClick={() => setShowStatusPopup(false)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Smartphone size={20} />
            </div>
            <h1 className="text-xl font-semibold">Mobile Top Up</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Select Operator */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-blue-600" />
            Select Operator
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {operators.map((operator) => (
              <button
                key={operator.id}
                onClick={() => setSelectedOperator(operator.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOperator === operator.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 ${operator.color} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">{operator.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Connection Type */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Connection Type</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setConnectionType('prepaid')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                connectionType === 'prepaid'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Prepaid
            </button>
            <button
              onClick={() => setConnectionType('postpaid')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                connectionType === 'postpaid'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Postpaid
            </button>
          </div>
        </div>

        {/* Mobile Number */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Mobile Number</h2>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Select Amount */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Select Amount</h2>
          <div className="grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAmount === amount
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ৳{amount}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="number"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              placeholder="Custom amount"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Recharge Button */}
        <button
          onClick={handleRecharge}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Recharge Now'}
        </button>
      </div>

      {/* Status Popup */}
      {showStatusPopup && renderStatusPopup()}
    </div>
  );
};

export default MobileTopUp;