import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface QRData {
  type: string;
  merchantId?: string;
  merchantName?: string;
  amount?: string;
  description?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankCode?: string;
  purpose?: string;
  timestamp?: number;
}

interface FormData {
  amount: string;
  purpose: string;
  merchantId: string;
  merchantName: string;
  description: string;
}

interface TransactionData {
  type: string;
  subType: string;
  merchantId?: string;
  merchantName?: string;
  amount: number;
  purpose: string;
  description?: string;
  fee: number;
  totalAmount: number;
  processingTime: string;
}

const QRPayment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    purpose: '',
    merchantId: '',
    merchantName: '',
    description: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      setLoadingBalance(true);
      // Simulate API call
      setTimeout(() => {
        setCurrentBalance(25000);
        setLoadingBalance(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setLoadingBalance(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Purpose is required';
    }

    if (activeTab === 1) { // Generate QR tab
      if (!formData.merchantId) {
        newErrors.merchantId = 'Merchant ID is required';
      }
      if (!formData.merchantName) {
        newErrors.merchantName = 'Merchant name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const transaction: TransactionData = {
      type: 'QR Payment',
      subType: activeTab === 0 ? 'Scan QR' : 'Generate QR',
      merchantId: formData.merchantId,
      merchantName: formData.merchantName,
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      description: formData.description,
      fee: parseFloat(formData.amount) * 0.005, // 0.5% fee
      totalAmount: parseFloat(formData.amount) + (parseFloat(formData.amount) * 0.005),
      processingTime: 'Instant'
    };

    setTransactionData(transaction);
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setError('');
      setFormData({
        amount: '',
        purpose: '',
        merchantId: '',
        merchantName: '',
        description: ''
      });
      
      // Update balance
      if (transactionData) {
        setCurrentBalance(prev => prev - transactionData.totalAmount);
      }
      
    } catch (error) {
      setError('Transaction failed. Please try again.');
      console.error('Transaction error:', error);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const generateQRCode = () => {
    const qrData = {
      type: 'payment',
      merchantId: formData.merchantId,
      merchantName: formData.merchantName,
      amount: formData.amount,
      description: formData.description,
      timestamp: Date.now()
    };
    
    // In a real app, you would use a QR code library here
    console.log('QR Code Data:', qrData);
    alert('QR Code generated! (In a real app, this would display a QR code)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">QR Payment</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-blue-600">
                {loadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `৳${currentBalance.toLocaleString()}`
                )}
              </p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    QR Payment completed successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 0
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📱 Scan QR Code
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 1
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏪 Generate QR Code
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-64 h-64 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {scanning ? (
                      <div>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M12 8h4.01" />
                        </svg>
                        <p className="text-gray-500">Camera preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {!scanning ? (
                    <button
                      onClick={startScanning}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      📷 Start Scanning
                    </button>
                  ) : (
                    <button
                      onClick={stopScanning}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      ⏹️ Stop Scanning
                    </button>
                  )}
                </div>
              </div>

              {qrData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">QR Code Detected</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Merchant:</span> {qrData.merchantName}</p>
                    <p><span className="font-medium">Amount:</span> ৳{qrData.amount}</p>
                    <p><span className="font-medium">Description:</span> {qrData.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Merchant Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant ID *
                  </label>
                  <input
                    type="text"
                    id="merchantId"
                    name="merchantId"
                    value={formData.merchantId}
                    onChange={handleInputChange}
                    placeholder="Enter merchant ID"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.merchantId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.merchantId && (
                    <p className="mt-1 text-sm text-red-600">{errors.merchantId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    id="merchantName"
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    placeholder="Enter merchant name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.merchantName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.merchantName && (
                    <p className="mt-1 text-sm text-red-600">{errors.merchantName}</p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                {formData.amount && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Processing Fee (0.5%): ৳{(parseFloat(formData.amount || '0') * 0.005).toFixed(2)}</p>
                    <p className="font-medium">Total: ৳{(parseFloat(formData.amount || '0') + (parseFloat(formData.amount || '0') * 0.005)).toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purpose ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select purpose</option>
                  <option value="retail">Retail Purchase</option>
                  <option value="service">Service Payment</option>
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transportation</option>
                  <option value="other">Other</option>
                </select>
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generateQRCode}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : '📱 Generate QR Code'}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">🔒 Security Notice</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Always verify QR codes before scanning. Only scan codes from trusted merchants. QR payments are processed instantly and cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && transactionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm QR Payment</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{transactionData.subType}</span>
              </div>
              {transactionData.merchantName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium">{transactionData.merchantName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">৳{transactionData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">৳{transactionData.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total:</span>
                <span>৳{transactionData.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransaction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPayment;