import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TransactionConfirmation from '../components/TransactionConfirmation';

const QRPayment = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scan'); // scan, generate, merchant
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    merchantId: '',
    merchantName: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [qrData, setQrData] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch('/api/account/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // QR Code Scanner Functions
  const startScanner = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning for QR codes
        scanQRCode();
      }
    } catch (error) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    // Simulated QR scanning - in real implementation, use a QR code library like jsQR
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // In real implementation, use jsQR library here
          // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          // const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          // Simulated QR detection for demo
          if (Math.random() > 0.95) { // Random detection for demo
            const mockQRData = {
              type: 'payment',
              merchantId: 'MERCHANT_001',
              merchantName: 'Demo Store',
              amount: '500',
              description: 'Product Purchase'
            };
            
            setScannedData(mockQRData);
            setFormData(prev => ({
              ...prev,
              merchantId: mockQRData.merchantId,
              merchantName: mockQRData.merchantName,
              amount: mockQRData.amount,
              description: mockQRData.description
            }));
            stopScanner();
            clearInterval(interval);
          }
        }
      }
    }, 100);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      if (isScanning) {
        stopScanner();
      }
    }, 30000);
  };

  // QR Code Generator
  const generateQR = () => {
    const qrPayload = {
      type: 'receive',
      accountNumber: user?.accountNumber,
      accountHolder: user?.name,
      bankCode: 'IBLTD',
      amount: formData.amount || null,
      purpose: formData.purpose || null,
      timestamp: Date.now()
    };
    
    const qrString = JSON.stringify(qrPayload);
    
    // In real implementation, use a QR code generation library
    // For demo, we'll create a simple representation
    setGeneratedQR(`data:image/svg+xml;base64,${btoa(createQRSVG(qrString))}`);
  };

  const createQRSVG = (data) => {
    // Simplified QR code SVG for demo - use a proper QR library in production
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="40" y="10" width="20" height="20" fill="black"/>
        <rect x="70" y="10" width="20" height="20" fill="black"/>
        <rect x="10" y="40" width="20" height="20" fill="black"/>
        <rect x="70" y="40" width="20" height="20" fill="black"/>
        <rect x="10" y="70" width="20" height="20" fill="black"/>
        <rect x="40" y="70" width="20" height="20" fill="black"/>
        <rect x="70" y="70" width="20" height="20" fill="black"/>
        <text x="100" y="100" font-family="Arial" font-size="8" fill="black">QR Code</text>
        <text x="100" y="115" font-family="Arial" font-size="6" fill="gray">${user?.accountNumber}</text>
      </svg>
    `;
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'merchant') {
      if (!formData.merchantId.trim()) {
        newErrors.merchantId = 'Merchant ID is required';
      }
      
      if (!formData.merchantName.trim()) {
        newErrors.merchantName = 'Merchant name is required';
      }
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!formData.purpose && !formData.description) {
      newErrors.purpose = 'Purpose or description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const transactionDetails = {
        type: 'QR Payment',
        subType: activeTab,
        merchantId: formData.merchantId,
        merchantName: formData.merchantName,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose || formData.description,
        description: formData.description,
        fee: 0, // QR payments typically have no fees
        totalAmount: parseFloat(formData.amount),
        processingTime: 'Instant'
      };
      setTransactionData(transactionDetails);
      setShowConfirmation(true);
    }
  };

  const handleConfirmTransaction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transfer/qr-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transactionData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setError('');
        setFormData({
          amount: '',
          purpose: '',
          merchantId: '',
          merchantName: '',
          description: ''
        });
        setScannedData(null);
        fetchCurrentBalance();
      } else {
        setError(data.message || 'Payment failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">QR Payment System</h1>
            <p className="text-indigo-100 mt-1">Scan, generate, or pay with QR codes</p>
          </div>

          <div className="p-6">
            {/* Account Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-secondary-600">Account Holder</p>
                  <p className="font-semibold text-secondary-900">{user?.name}</p>
                  <p className="text-sm text-secondary-600">Account: {user?.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-600">Available Balance</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {loadingBalance ? '...' : `৳${currentBalance.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 font-medium">QR payment completed successfully!</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'scan'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                📱 Scan QR
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                🔲 Generate QR
              </button>
              <button
                onClick={() => setActiveTab('merchant')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'merchant'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                🏪 Merchant Pay
              </button>
            </div>

            {/* Scan QR Tab */}
            {activeTab === 'scan' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Scan QR Code to Pay</h3>
                  
                  {!isScanning ? (
                    <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-8">
                      <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5m0 0v5m0 0h5m0 0v5" />
                      </svg>
                      <p className="text-secondary-600 mb-4">Click to start camera and scan QR code</p>
                      <button
                        onClick={startScanner}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Start Scanner
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg"
                        autoPlay
                        playsInline
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500"></div>
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500"></div>
                      </div>
                      <button
                        onClick={stopScanner}
                        className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Stop Scanner
                      </button>
                    </div>
                  )}
                </div>

                {scannedData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">QR Code Detected!</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Merchant:</strong> {scannedData.merchantName}</p>
                      <p><strong>Amount:</strong> ৳{scannedData.amount}</p>
                      <p><strong>Description:</strong> {scannedData.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate QR Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Generate QR Code for Receiving Payment</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Amount (৳) - Optional
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="Leave empty for flexible amount"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Purpose - Optional
                        </label>
                        <input
                          type="text"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          placeholder="Payment purpose"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <button
                        onClick={generateQR}
                        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    {generatedQR ? (
                      <div className="text-center">
                        <img src={generatedQR} alt="Generated QR Code" className="mx-auto mb-4" />
                        <p className="text-sm text-secondary-600">Share this QR code to receive payments</p>
                        <button
                          onClick={() => {
                            // In real implementation, implement download functionality
                            alert('Download functionality would be implemented here');
                          }}
                          className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Download QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-8 w-48 h-48 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-secondary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5m0 0v5m0 0h5m0 0v5" />
                          </svg>
                          <p className="text-sm text-secondary-600">QR code will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Merchant Payment Tab */}
            {activeTab === 'merchant' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Merchant Payment</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Merchant ID *
                      </label>
                      <input
                        type="text"
                        name="merchantId"
                        value={formData.merchantId}
                        onChange={handleChange}
                        placeholder="Enter merchant ID"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.merchantId ? 'border-red-300' : 'border-secondary-300'
                        }`}
                      />
                      {errors.merchantId && (
                        <p className="mt-1 text-sm text-red-600">{errors.merchantId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Merchant Name *
                      </label>
                      <input
                        type="text"
                        name="merchantName"
                        value={formData.merchantName}
                        onChange={handleChange}
                        placeholder="Enter merchant name"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.merchantName ? 'border-red-300' : 'border-secondary-300'
                        }`}
                      />
                      {errors.merchantName && (
                        <p className="mt-1 text-sm text-red-600">{errors.merchantName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Amount (৳) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.amount ? 'border-red-300' : 'border-secondary-300'
                      }`}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                    
                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 mt-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                          className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 transition-colors"
                        >
                          ৳{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Payment description"
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.description ? 'border-red-300' : 'border-secondary-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Transaction Summary */}
                  {formData.amount && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-900 mb-2">Payment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Payment Amount:</span>
                          <span className="font-medium">৳{parseFloat(formData.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Transaction Fee:</span>
                          <span className="font-medium">৳0.00</span>
                        </div>
                        <div className="flex justify-between border-t border-indigo-200 pt-1 font-semibold">
                          <span className="text-indigo-900">Total Amount:</span>
                          <span>৳{parseFloat(formData.amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Processing...' : 'Pay Merchant'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Only scan QR codes from trusted sources. Verify merchant details before making payments. 
                    QR payments are processed instantly and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Confirmation Modal */}
      {showConfirmation && (
        <TransactionConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmTransaction}
          transactionData={transactionData}
          loading={loading}
        />
      )}
    </div>
  );
};

export default QRPayment;