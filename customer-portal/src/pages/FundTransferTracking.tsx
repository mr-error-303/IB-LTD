import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Calendar,
  DollarSign,
  User,
  Building2,
  FileText,
  Download
} from 'lucide-react';

interface TransferStatus {
  id: string;
  referenceId: string;
  amount: string;
  recipient: string;
  recipientAccount: string;
  bankName: string;
  status: 'pending' | 'in-review' | 'approved' | 'completed' | 'rejected';
  submittedDate: string;
  completedDate?: string;
  purpose: string;
  remarks?: string;
  processingTime: string;
  steps: {
    title: string;
    status: 'completed' | 'current' | 'pending';
    timestamp?: string;
    description: string;
  }[];
}

const FundTransferTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferStatus | null>(null);
  const [transfers, setTransfers] = useState<TransferStatus[]>([
    {
      id: '1',
      referenceId: 'TXN123456789',
      amount: '50000',
      recipient: 'John Doe',
      recipientAccount: '1234567890',
      bankName: 'Sonali Bank Limited',
      status: 'in-review',
      submittedDate: '2024-01-15T10:30:00Z',
      purpose: 'Business Payment',
      remarks: 'Monthly supplier payment',
      processingTime: '1-2 business days',
      steps: [
        {
          title: 'Transfer Submitted',
          status: 'completed',
          timestamp: '2024-01-15T10:30:00Z',
          description: 'Your transfer request has been received and is being processed.'
        },
        {
          title: 'Under Review',
          status: 'current',
          timestamp: '2024-01-15T11:00:00Z',
          description: 'Our team is reviewing your transfer for compliance and security.'
        },
        {
          title: 'Approved',
          status: 'pending',
          description: 'Transfer will be approved after review completion.'
        },
        {
          title: 'Processing',
          status: 'pending',
          description: 'Transfer is being processed through the banking network.'
        },
        {
          title: 'Completed',
          status: 'pending',
          description: 'Transfer has been successfully completed.'
        }
      ]
    },
    {
      id: '2',
      referenceId: 'TXN987654321',
      amount: '25000',
      recipient: 'Jane Smith',
      recipientAccount: '9876543210',
      bankName: 'IB Bank Limited',
      status: 'completed',
      submittedDate: '2024-01-14T14:20:00Z',
      completedDate: '2024-01-14T16:45:00Z',
      purpose: 'Personal Transfer',
      processingTime: 'Instant',
      steps: [
        {
          title: 'Transfer Submitted',
          status: 'completed',
          timestamp: '2024-01-14T14:20:00Z',
          description: 'Your transfer request has been received and is being processed.'
        },
        {
          title: 'Under Review',
          status: 'completed',
          timestamp: '2024-01-14T14:25:00Z',
          description: 'Our team is reviewing your transfer for compliance and security.'
        },
        {
          title: 'Approved',
          status: 'completed',
          timestamp: '2024-01-14T14:30:00Z',
          description: 'Transfer has been approved and is ready for processing.'
        },
        {
          title: 'Processing',
          status: 'completed',
          timestamp: '2024-01-14T16:40:00Z',
          description: 'Transfer is being processed through the banking network.'
        },
        {
          title: 'Completed',
          status: 'completed',
          timestamp: '2024-01-14T16:45:00Z',
          description: 'Transfer has been successfully completed.'
        }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'approved':
        return 'text-blue-600 bg-blue-100';
      case 'in-review':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'in-review':
        return <Clock className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.amount.includes(searchTerm)
  );

  const renderTransferList = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by reference ID, recipient, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredTransfers.map((transfer) => (
        <div
          key={transfer.id}
          onClick={() => setSelectedTransfer(transfer)}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {transfer.referenceId}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(transfer.submittedDate)}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(transfer.status)}`}>
              {getStatusIcon(transfer.status)}
              <span className="capitalize">{transfer.status.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium ml-2">৳{transfer.amount}</span>
            </div>
            <div>
              <span className="text-gray-600">Recipient:</span>
              <span className="font-medium ml-2">{transfer.recipient}</span>
            </div>
            <div>
              <span className="text-gray-600">Bank:</span>
              <span className="font-medium ml-2">{transfer.bankName}</span>
            </div>
            <div>
              <span className="text-gray-600">Purpose:</span>
              <span className="font-medium ml-2">{transfer.purpose}</span>
            </div>
          </div>
        </div>
      ))}

      {filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No transfers found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );

  const renderTransferDetails = () => {
    if (!selectedTransfer) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedTransfer(null)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to List
          </button>
          <button className="flex items-center text-gray-600 hover:text-gray-700">
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Transfer Details
            </h2>
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(selectedTransfer.status)}`}>
              {getStatusIcon(selectedTransfer.status)}
              <span className="capitalize">{selectedTransfer.status.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Reference ID</label>
                <p className="font-medium text-gray-800">{selectedTransfer.referenceId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <p className="font-medium text-gray-800">৳{selectedTransfer.amount}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Recipient</label>
                <p className="font-medium text-gray-800">{selectedTransfer.recipient}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Number</label>
                <p className="font-medium text-gray-800">{selectedTransfer.recipientAccount}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Bank Name</label>
                <p className="font-medium text-gray-800">{selectedTransfer.bankName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Purpose</label>
                <p className="font-medium text-gray-800">{selectedTransfer.purpose}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Submitted Date</label>
                <p className="font-medium text-gray-800">{formatDate(selectedTransfer.submittedDate)}</p>
              </div>
              {selectedTransfer.completedDate && (
                <div>
                  <label className="text-sm text-gray-600">Completed Date</label>
                  <p className="font-medium text-gray-800">{formatDate(selectedTransfer.completedDate)}</p>
                </div>
              )}
            </div>
          </div>

          {selectedTransfer.remarks && (
            <div className="mb-8">
              <label className="text-sm text-gray-600">Remarks</label>
              <p className="font-medium text-gray-800">{selectedTransfer.remarks}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Transfer Progress</h3>
          
          <div className="space-y-6">
            {selectedTransfer.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : step.status === 'current'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.status === 'current' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      step.status === 'completed' || step.status === 'current'
                        ? 'text-gray-800'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    {step.timestamp && (
                      <span className="text-sm text-gray-500">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    step.status === 'completed' || step.status === 'current'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Fund Transfer Status Tracking
          </h1>
          <p className="text-gray-600">
            Track the status of your fund transfer requests
          </p>
        </div>

        {selectedTransfer ? renderTransferDetails() : renderTransferList()}
      </div>
    </div>
  );
};

export default FundTransferTracking;