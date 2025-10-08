import React, { useState } from 'react';

const TransactionConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transactionData, 
  type = 'transfer' 
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(confirmationCode);
      setConfirmationCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid confirmation code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const getTransactionTitle = () => {
    switch (type) {
      case 'transfer':
        return 'Confirm Transfer';
      case 'withdraw':
        return 'Confirm Withdrawal';
      case 'bill_payment':
        return 'Confirm Bill Payment';
      default:
        return 'Confirm Transaction';
    }
  };

  const getTransactionDetails = () => {
    switch (type) {
      case 'transfer':
        return (
          <>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">To:</span>
              <span className="font-medium">{transactionData?.recipientName || transactionData?.recipientAccountNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium">{transactionData?.recipientAccountNumber}</span>
            </div>
          </>
        );
      case 'withdraw':
        return (
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Withdrawal Method:</span>
            <span className="font-medium">ATM/Branch</span>
          </div>
        );
      case 'bill_payment':
        return (
          <>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Bill Type:</span>
              <span className="font-medium capitalize">{transactionData?.billType?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium">{transactionData?.accountNumber}</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTransactionTitle()}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
              <div className="space-y-1">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${transactionData?.amount?.toLocaleString()}
                  </span>
                </div>
                {getTransactionDetails()}
                {transactionData?.description && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{transactionData.description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Confirmation Code
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                A confirmation code has been sent to your registered email/phone
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !confirmationCode.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </div>
              ) : (
                'Confirm Transaction'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;