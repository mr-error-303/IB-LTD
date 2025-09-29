import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCodeIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface QRPaymentData {
  type: 'payment' | 'receive';
  amount?: number;
  merchantName?: string;
  merchantId?: string;
  description?: string;
  expiresAt?: Date;
}

const QRPayments = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRPaymentData | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQRDetails, setShowQRDetails] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock QR scanner
  const startScanning = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      // Simulate camera access and QR scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock scanned QR data
      const mockQRData: QRPaymentData = {
        type: 'payment',
        amount: 1500,
        merchantName: 'Coffee Shop BD',
        merchantId: 'MERCHANT_123',
        description: 'Coffee and snacks',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      };
      
      setScannedData(mockQRData);
      setIsScanning(false);
    } catch (err) {
      setError('Failed to scan QR code. Please try again.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScannedData(null);
  };

  const generateQR = async () => {
    setError('');
    setSuccess('');
    
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate QR generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock QR code data (in real implementation, this would be a base64 image or QR data)
      const qrData = `QR_PAYMENT_${Date.now()}_${amountNum}`;
      setGeneratedQR(qrData);
      setQrExpiry(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes expiry
      setSuccess('QR code generated successfully!');
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async () => {
    if (!scannedData) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Payment of ৳${scannedData.amount?.toLocaleString()} to ${scannedData.merchantName} completed successfully!`);
      setScannedData(null);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRData = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR);
      setSuccess('QR code data copied to clipboard!');
    }
  };

  const shareQR = async () => {
    if (navigator.share && generatedQR) {
      try {
        await navigator.share({
          title: 'Payment QR Code',
          text: `Pay ৳${amount} via QR code`,
          url: window.location.href
        });
      } catch (err) {
        copyQRData();
      }
    } else {
      copyQRData();
    }
  };

  const refreshQR = () => {
    setGeneratedQR(null);
    setQrExpiry(null);
    generateQR();
  };

  // Format time remaining
  const getTimeRemaining = (expiry: Date) => {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-refresh timer for QR expiry
  useEffect(() => {
    if (qrExpiry) {
      const interval = setInterval(() => {
        const now = new Date();
        if (now >= qrExpiry) {
          setGeneratedQR(null);
          setQrExpiry(null);
          setError('QR code has expired. Please generate a new one.');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [qrExpiry]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">QR Payments</h2>
        <p className="text-white/70">Scan QR codes to pay or generate QR codes to receive payments</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/5 rounded-xl p-2 border border-white/10">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setActiveTab('scan');
              setScannedData(null);
              setIsScanning(false);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'scan'
                ? 'bg-primary-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CameraIcon className="w-5 h-5" />
              <span>Scan & Pay</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('generate');
              setGeneratedQR(null);
              setQrExpiry(null);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-primary-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <QrCodeIcon className="w-5 h-5" />
              <span>Receive via QR</span>
            </div>
          </button>
        </div>
      </div>

      {/* Scan & Pay Tab */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {!isScanning && !scannedData && (
            <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
              <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-12 h-12 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scan QR Code to Pay</h3>
              <p className="text-white/60 mb-6">Point your camera at a QR code to make a payment</p>
              <button
                onClick={startScanning}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Start Scanning
              </button>
            </div>
          )}

          {isScanning && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Scanning for QR Code...</h3>
                <p className="text-white/60">Hold your device steady and point at the QR code</p>
              </div>
              
              {/* Mock camera view */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary-500 rounded-lg animate-pulse">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-500"></div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              </div>
              
              <button
                onClick={stopScanning}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          )}

          {scannedData && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white/70">Merchant:</span>
                  <span className="text-white font-medium">{scannedData.merchantName}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white/70">Amount:</span>
                  <span className="text-green-400 font-semibold text-lg">৳{scannedData.amount?.toLocaleString()}</span>
                </div>
                
                {scannedData.description && (
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <span className="text-white/70">Description:</span>
                    <span className="text-white">{scannedData.description}</span>
                  </div>
                )}
                
                {scannedData.expiresAt && (
                  <div className="flex justify-between items-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <span className="text-orange-400">Expires in:</span>
                    <span className="text-orange-400 font-medium">{getTimeRemaining(scannedData.expiresAt)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setScannedData(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={isLoading}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-white/50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="w-5 h-5" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receive via QR Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {!generatedQR ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Generate Payment QR Code</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Amount (BDT) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">৳</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Enter amount to receive"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/90 font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                    placeholder="Add a note for this payment request"
                    rows={3}
                    maxLength={100}
                  />
                </div>
                
                <button
                  onClick={generateQR}
                  disabled={!amount || isLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-white/50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating QR Code...</span>
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="w-5 h-5" />
                      <span>Generate QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Payment QR Code</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowQRDetails(!showQRDetails)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {showQRDetails ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={refreshQR}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* QR Code Display */}
              <div className="bg-white rounded-xl p-8 mb-4 text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-6xl">📱</div>
                </div>
                <p className="text-gray-600 text-sm">QR Code for ৳{parseFloat(amount).toLocaleString()}</p>
              </div>
              
              {/* QR Details */}
              {showQRDetails && (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Amount:</span>
                    <span className="text-green-400 font-semibold">৳{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  
                  {description && (
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Description:</span>
                      <span className="text-white">{description}</span>
                    </div>
                  )}
                  
                  {qrExpiry && (
                    <div className="flex justify-between items-center p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <span className="text-orange-400">Expires in:</span>
                      <span className="text-orange-400 font-medium">{getTimeRemaining(qrExpiry)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={copyQRData}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <DocumentDuplicateIcon className="w-5 h-5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={shareQR}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    setGeneratedQR(null);
                    setQrExpiry(null);
                    setAmount('');
                    setDescription('');
                  }}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  New QR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRPayments;